import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { APIValidator } from '@/api/validate';
import { AbuseDetectionEngine } from '@lf/shared-helpers';

const validator = new APIValidator();
const abuseDetector = new AbuseDetectionEngine();

// Fee update security configuration
const FEE_CONFIG = {
  MIN_FEE_PPM: 0,
  MAX_FEE_PPM: 5000, // Lightning Network maximum
  COOLDOWN_MINUTES: 30, // 30 minutes between updates
  MAX_UPDATES_PER_HOUR: 5,
  MAX_UPDATES_PER_DAY: 20,
  ABUSE_THRESHOLD: 0.8, // 80% confidence threshold for abuse detection
  RAPID_CHANGE_THRESHOLD: 1000, // PPM change that triggers scrutiny
};

interface FeeUpdateRequest {
  user_id: string;
  channel_id: string;
  new_fee_rate: number; // in parts per million (ppm)
  reason?: string;
}

interface FeeUpdateResponse {
  success: boolean;
  message: string;
  fee_rate?: number;
  next_allowed_update?: string;
  warnings?: string[];
  error_code?: string;
}

/**
 * POST /api/channel/fee-update
 * Update Lightning channel fee rates with abuse detection
 */
export async function POST(request: NextRequest): Promise<NextResponse<FeeUpdateResponse>> {
  try {
    // Security validation
    const securityCheck = await validator.performSecurityCheck(request, 'authenticated', {
      rateLimit: {
        maxRequests: FEE_CONFIG.MAX_UPDATES_PER_HOUR,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyGenerator: (req) => {
          const userId = req.headers.get('x-user-id') || validator.getClientIP(req);
          return `fee_update:${userId}`;
        }
      },
      requireAuth: true,
      checkSuspiciousActivity: true
    });

    if (!securityCheck.passed) {
      logger.logSecurity('warn', 'fee_update_blocked', {
        ipAddress: validator.getClientIP(request),
        userAgent: request.headers.get('user-agent') || '',
        threatType: 'rate_limit_or_suspicious'
      }, {
        reason: securityCheck.reason
      });

      return NextResponse.json({
        success: false,
        message: securityCheck.humanReason || 'Request blocked for security reasons',
        error_code: 'security_block'
      }, { status: 429 });
    }

    // Parse request body
    const body: FeeUpdateRequest = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.channel_id || body.new_fee_rate === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: user_id, channel_id, and new_fee_rate',
        error_code: 'missing_fields'
      }, { status: 400 });
    }

    // Validate fee rate bounds
    if (body.new_fee_rate < FEE_CONFIG.MIN_FEE_PPM || body.new_fee_rate > FEE_CONFIG.MAX_FEE_PPM) {
      return NextResponse.json({
        success: false,
        message: `Fee rate must be between ${FEE_CONFIG.MIN_FEE_PPM} and ${FEE_CONFIG.MAX_FEE_PPM} ppm`,
        error_code: 'invalid_fee_rate'
      }, { status: 400 });
    }

    const supabase = createClient();
    const clientIP = validator.getClientIP(request);

    // Verify user owns the channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', body.channel_id)
      .eq('user_id', body.user_id)
      .single();

    if (channelError || !channel) {
      logger.logSecurity('warn', 'fee_update_unauthorized_channel', {
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || '',
        threatType: 'unauthorized_access'
      }, {
        userId: body.user_id,
        channelId: body.channel_id
      });

      return NextResponse.json({
        success: false,
        message: 'Channel not found or access denied',
        error_code: 'unauthorized_channel'
      }, { status: 403 });
    }

    // Check cooldown period
    const { data: lastUpdate } = await supabase
      .from('channel_fee_updates')
      .select('created_at, new_fee_rate')
      .eq('user_id', body.user_id)
      .eq('channel_id', body.channel_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastUpdate) {
      const timeSinceLastUpdate = Date.now() - new Date(lastUpdate.created_at).getTime();
      const cooldownMs = FEE_CONFIG.COOLDOWN_MINUTES * 60 * 1000;

      if (timeSinceLastUpdate < cooldownMs) {
        const remainingCooldown = Math.ceil((cooldownMs - timeSinceLastUpdate) / 60000);
        
        return NextResponse.json({
          success: false,
          message: `Fee update cooldown active. Please wait ${remainingCooldown} minutes before updating again.`,
          error_code: 'cooldown_active',
          next_allowed_update: new Date(Date.now() + (cooldownMs - timeSinceLastUpdate)).toISOString()
        }, { status: 429 });
      }
    }

    // Check daily update limits
    const { data: dailyUpdates } = await supabase
      .from('channel_fee_updates')
      .select('id')
      .eq('user_id', body.user_id)
      .eq('channel_id', body.channel_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (dailyUpdates && dailyUpdates.length >= FEE_CONFIG.MAX_UPDATES_PER_DAY) {
      logger.logSecurity('warn', 'fee_update_daily_limit', {
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || '',
        threatType: 'rate_limit'
      }, {
        userId: body.user_id,
        channelId: body.channel_id,
        dailyUpdates: dailyUpdates.length
      });

      return NextResponse.json({
        success: false,
        message: `Daily fee update limit exceeded (${FEE_CONFIG.MAX_UPDATES_PER_DAY} updates per day)`,
        error_code: 'daily_limit_exceeded'
      }, { status: 429 });
    }

    // Abuse detection - analyze fee update patterns
    const { data: recentUpdates } = await supabase
      .from('channel_fee_updates')
      .select('*')
      .eq('user_id', body.user_id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false });

    if (recentUpdates && recentUpdates.length > 0) {
      // Simple abuse detection - check for rapid frequent changes
      const recentCount = recentUpdates.length;
      const isAbusive = recentCount > FEE_CONFIG.MAX_UPDATES_PER_DAY * 2; // 2x the daily limit in a week suggests abuse
      
      if (isAbusive) {
        // Log abuse detection
        await supabase
          .from('fee_abuse_alerts')
          .insert({
            user_id: body.user_id,
            channel_id: body.channel_id,
            alert_type: 'suspicious_pattern',
            confidence_score: 0.9,
            details: {
              reasons: ['excessive_frequency'],
              recent_updates: recentUpdates.length,
              proposed_fee: body.new_fee_rate,
              current_fee: channel.fee_rate_ppm
            }
          });

        logger.logSecurity('error', 'fee_update_abuse_detected', {
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || '',
          threatType: 'fee_abuse'
        }, {
          userId: body.user_id,
          channelId: body.channel_id,
          confidence: 0.9,
          reasons: ['excessive_frequency']
        });

        return NextResponse.json({
          success: false,
          message: 'Fee update blocked due to suspicious activity. Please contact support if this is an error.',
          error_code: 'abuse_detected'
        }, { status: 403 });
      }
    }

    // Check for rapid fee changes that might indicate manipulation
    if (lastUpdate) {
      const feeChange = Math.abs(body.new_fee_rate - lastUpdate.new_fee_rate);
      if (feeChange > FEE_CONFIG.RAPID_CHANGE_THRESHOLD) {
        logger.logSecurity('warn', 'fee_update_rapid_change', {
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || '',
          threatType: 'rapid_fee_change'
        }, {
          userId: body.user_id,
          channelId: body.channel_id,
          oldFee: lastUpdate.new_fee_rate,
          newFee: body.new_fee_rate,
          change: feeChange
        });
      }
    }

    // Record the fee update
    const { error: updateError } = await supabase
      .from('channel_fee_updates')
      .insert({
        user_id: body.user_id,
        channel_id: body.channel_id,
        old_fee_rate: channel.fee_rate_ppm,
        new_fee_rate: body.new_fee_rate,
        reason: body.reason || 'Manual update',
        client_ip: clientIP,
        user_agent: request.headers.get('user-agent') || ''
      });

    if (updateError) {
      logger.logSystem('error', 'Failed to record fee update', {
        error: updateError.message,
        userId: body.user_id,
        channelId: body.channel_id
      });

      return NextResponse.json({
        success: false,
        message: 'Failed to record fee update',
        error_code: 'database_error'
      }, { status: 500 });
    }

    // Update the channel fee rate
    const { error: channelUpdateError } = await supabase
      .from('channels')
      .update({
        fee_rate_ppm: body.new_fee_rate,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.channel_id)
      .eq('user_id', body.user_id);

    if (channelUpdateError) {
      logger.logSystem('error', 'Failed to update channel fee rate', {
        error: channelUpdateError.message,
        userId: body.user_id,
        channelId: body.channel_id
      });

      return NextResponse.json({
        success: false,
        message: 'Failed to update channel fee rate',
        error_code: 'channel_update_error'
      }, { status: 500 });
    }

    // Generate warnings for potentially problematic fee rates
    const warnings: string[] = [];
    
    if (body.new_fee_rate > 2000) {
      warnings.push('High fee rates may discourage routing through your channel');
    }
    
    if (body.new_fee_rate === 0) {
      warnings.push('Zero fee rates may attract spam transactions');
    }

    // Calculate next allowed update time
    const nextAllowedUpdate = new Date(Date.now() + FEE_CONFIG.COOLDOWN_MINUTES * 60 * 1000);

    logger.logSystem('info', 'Channel fee rate updated', {
      userId: body.user_id,
      channelId: body.channel_id,
      oldFee: channel.fee_rate_ppm,
      newFee: body.new_fee_rate,
      reason: body.reason
    });

    return NextResponse.json({
      success: true,
      message: 'Fee rate updated successfully',
      fee_rate: body.new_fee_rate,
      next_allowed_update: nextAllowedUpdate.toISOString(),
      warnings: warnings.length > 0 ? warnings : undefined
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.logSystem('error', 'Fee update error', {
      error: errorMessage
    });

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error_code: 'internal_error'
    }, { status: 500 });
  }
}

/**
 * GET /api/channel/fee-update/history
 * Get fee update history for a channel
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const channelId = url.searchParams.get('channel_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!userId || !channelId) {
      return NextResponse.json({
        error: 'Missing required parameters: user_id and channel_id'
      }, { status: 400 });
    }

    const supabase = createClient();

    // Get fee update history with RLS enforcement
    const { data: updates, error } = await supabase
      .from('channel_fee_updates')
      .select('*')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100)); // Cap at 100 records

    if (error) {
      logger.logSystem('error', 'Failed to fetch fee update history', {
        error: error.message,
        userId,
        channelId
      });

      return NextResponse.json({
        error: 'Failed to fetch fee update history'
      }, { status: 500 });
    }

    // Get abuse alerts for this channel
    const { data: alerts } = await supabase
      .from('fee_abuse_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      updates: updates || [],
      alerts: alerts || [],
      total_updates: updates?.length || 0,
      active_alerts: alerts?.length || 0
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.logSystem('error', 'Fee history error', {
      error: errorMessage
    });

    return NextResponse.json({
      error: 'Failed to fetch fee update history'
    }, { status: 500 });
  }
} 