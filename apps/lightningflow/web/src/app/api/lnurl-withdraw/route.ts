import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encodeLnurl } from '@/lib/lnurl';
import { logger } from '@/lib/logger';
import { APIValidator } from '@/api/validate';
import { AbuseDetectionEngine } from '@lf/shared-helpers';
import crypto from 'crypto';

const validator = new APIValidator();
const abuseDetector = new AbuseDetectionEngine();

// LNURL-withdraw security configuration
const WITHDRAW_CONFIG = {
  K1_TTL: 10 * 60 * 1000, // 10 minutes
  MAX_ATTEMPTS_PER_IP: 5,
  MAX_ATTEMPTS_PER_USER: 3,
  ATTEMPT_WINDOW: 60 * 60 * 1000, // 1 hour
  MIN_AMOUNT: 1000, // 1000 sats minimum
  MAX_AMOUNT: 1000000, // 1M sats maximum
  FRAUD_THRESHOLD: 0.8, // 80% confidence threshold for fraud detection
};

interface WithdrawRequest {
  user_id: string;
  amount_sats: number;
  description?: string;
  k1?: string;
  pr?: string; // Payment request for actual withdrawal
}

interface WithdrawSession {
  id: string;
  user_id: string;
  k1: string;
  amount_sats: number;
  description: string;
  created_at: string;
  expires_at: string;
  attempts: number;
  status: 'pending' | 'used' | 'expired' | 'blocked';
  client_ip: string;
  user_agent: string;
}

/**
 * GET /api/lnurl-withdraw
 * Initial LNURL-withdraw request - creates secure k1 session
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const amountSats = parseInt(url.searchParams.get('amount') || '0');
    const description = url.searchParams.get('description') || 'Lightning withdrawal';

    // Validate required parameters
    if (!userId || !amountSats) {
      return NextResponse.json({
        status: 'ERROR',
        reason: 'Missing required parameters: user_id and amount'
      }, { status: 400 });
    }

    // Validate amount limits
    if (amountSats < WITHDRAW_CONFIG.MIN_AMOUNT || amountSats > WITHDRAW_CONFIG.MAX_AMOUNT) {
      return NextResponse.json({
        status: 'ERROR',
        reason: `Amount must be between ${WITHDRAW_CONFIG.MIN_AMOUNT} and ${WITHDRAW_CONFIG.MAX_AMOUNT} sats`
      }, { status: 400 });
    }

    // Security checks
    const securityCheck = await validator.performSecurityCheck(request, 'authenticated', {
      rateLimit: {
        maxRequests: WITHDRAW_CONFIG.MAX_ATTEMPTS_PER_IP,
        windowMs: WITHDRAW_CONFIG.ATTEMPT_WINDOW,
        keyGenerator: (req) => `lnurl_withdraw:${validator.getClientIP(req)}`
      },
      requireAuth: false,
      checkSuspiciousActivity: true
    });

    if (!securityCheck.passed) {
      logger.logSecurity('warn', 'lnurl_withdraw_blocked', {
        ipAddress: validator.getClientIP(request),
        userAgent: request.headers.get('user-agent') || '',
        threatType: 'rate_limit_or_suspicious'
      }, {
        userId,
        amount: amountSats,
        reason: securityCheck.reason
      });

      return NextResponse.json({
        status: 'ERROR',
        reason: securityCheck.humanReason || 'Request blocked for security reasons'
      }, { status: 429 });
    }

    const supabase = createClient();
    const clientIP = validator.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check user-specific rate limits
    const { data: recentAttempts } = await supabase
      .from('lnurl_withdraw_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - WITHDRAW_CONFIG.ATTEMPT_WINDOW).toISOString());

    if (recentAttempts && recentAttempts.length >= WITHDRAW_CONFIG.MAX_ATTEMPTS_PER_USER) {
      logger.logSecurity('warn', 'lnurl_withdraw_user_limit', {
        ipAddress: clientIP,
        userAgent,
        threatType: 'user_rate_limit'
      }, {
        userId,
        attempts: recentAttempts.length
      });

      return NextResponse.json({
        status: 'ERROR',
        reason: 'Too many withdrawal attempts. Please try again later.'
      }, { status: 429 });
    }

    // Generate secure k1 secret
    const k1 = crypto.randomBytes(32).toString('hex');
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + WITHDRAW_CONFIG.K1_TTL);

    // Store withdrawal session
    const { error: sessionError } = await supabase
      .from('lnurl_withdraw_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        k1,
        amount_sats: amountSats,
        description,
        expires_at: expiresAt.toISOString(),
        client_ip: clientIP,
        user_agent: userAgent,
        status: 'pending',
        attempts: 0
      });

    if (sessionError) {
      logger.logSystem('error', 'Failed to create withdrawal session', {
        error: sessionError.message,
        userId,
        amount: amountSats
      });

      return NextResponse.json({
        status: 'ERROR',
        reason: 'Failed to create withdrawal session'
      }, { status: 500 });
    }

    // Create callback URL with k1
    const callbackUrl = `${url.origin}/api/lnurl-withdraw/callback?k1=${k1}`;

    logger.logSystem('info', 'LNURL withdrawal session created', {
      sessionId,
      userId,
      amount: amountSats,
      expiresAt: expiresAt.toISOString()
    });

    // Return LNURL-withdraw parameters
    return NextResponse.json({
      tag: 'withdrawRequest',
      callback: callbackUrl,
      k1,
      defaultDescription: description,
      minWithdrawable: amountSats * 1000, // Convert to millisats
      maxWithdrawable: amountSats * 1000, // Convert to millisats
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.logSystem('error', 'LNURL withdraw request failed', {
      error: errorMessage
    });

    return NextResponse.json({
      status: 'ERROR',
      reason: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/lnurl-withdraw/callback
 * LNURL-withdraw callback - validates k1 and processes withdrawal
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const k1 = url.searchParams.get('k1');
    const pr = url.searchParams.get('pr'); // Payment request from wallet

    if (!k1 || !pr) {
      return NextResponse.json({
        status: 'ERROR',
        reason: 'Missing required parameters: k1 and pr'
      }, { status: 400 });
    }

    const supabase = createClient();
    const clientIP = validator.getClientIP(request);

    // Find and validate withdrawal session
    const { data: session, error: sessionError } = await supabase
      .from('lnurl_withdraw_sessions')
      .select('*')
      .eq('k1', k1)
      .single();

    if (sessionError || !session) {
      logger.logSecurity('warn', 'lnurl_withdraw_invalid_k1', {
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || '',
        threatType: 'invalid_session'
      }, {
        k1: k1.substring(0, 8) + '...'
      });

      return NextResponse.json({
        status: 'ERROR',
        reason: 'Invalid or expired withdrawal session'
      }, { status: 400 });
    }

    // Check session status and expiry
    if (session.status !== 'pending') {
      return NextResponse.json({
        status: 'ERROR',
        reason: 'Withdrawal session already used or blocked'
      }, { status: 400 });
    }

    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('lnurl_withdraw_sessions')
        .update({ status: 'expired' })
        .eq('id', session.id);

      return NextResponse.json({
        status: 'ERROR',
        reason: 'Withdrawal session expired'
      }, { status: 400 });
    }

    // Increment attempt counter
    const newAttempts = session.attempts + 1;
    await supabase
      .from('lnurl_withdraw_sessions')
      .update({ attempts: newAttempts })
      .eq('id', session.id);

    // Check for too many attempts on this session
    if (newAttempts > 3) {
      await supabase
        .from('lnurl_withdraw_sessions')
        .update({ status: 'blocked' })
        .eq('id', session.id);

      logger.logSecurity('warn', 'lnurl_withdraw_too_many_attempts', {
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || '',
        threatType: 'brute_force'
      }, {
        sessionId: session.id,
        userId: session.user_id,
        attempts: newAttempts
      });

      return NextResponse.json({
        status: 'ERROR',
        reason: 'Too many attempts on this withdrawal session'
      }, { status: 429 });
    }

    // Simple fraud detection - check withdrawal patterns
    const { data: recentWithdrawals } = await supabase
      .from('lnurl_withdraw_sessions')
      .select('*')
      .eq('user_id', session.user_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false });

    if (recentWithdrawals && recentWithdrawals.length > 0) {
      // Check for excessive withdrawals
      const withdrawalCount = recentWithdrawals.length;
      const isAbusive = withdrawalCount > 10; // More than 10 withdrawals in 24 hours
      
      if (isAbusive) {
        await supabase
          .from('lnurl_withdraw_sessions')
          .update({ status: 'blocked' })
          .eq('id', session.id);

        logger.logSecurity('error', 'lnurl_withdraw_fraud_detected', {
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || '',
          threatType: 'fraud'
        }, {
          sessionId: session.id,
          userId: session.user_id,
          confidence: 0.9,
          reasons: ['excessive_withdrawals']
        });

        return NextResponse.json({
          status: 'ERROR',
          reason: 'Withdrawal blocked due to suspicious activity'
        }, { status: 403 });
      }
    }

    // TODO: Decode and validate payment request
    let paymentRequest: any;
    try {
      // Basic Lightning invoice validation
      if (!pr.toLowerCase().startsWith('lnbc') && !pr.toLowerCase().startsWith('lntb')) {
        return NextResponse.json({
          status: 'ERROR',
          reason: 'Invalid Lightning payment request format'
        }, { status: 400 });
      }

      // Decode payment request using LNbits API
      const decodeResponse = await fetch(`${process.env.LNBITS_BASE_URL}/api/v1/payments/decode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.LNBITS_ADMIN_KEY || ''
        },
        body: JSON.stringify({ data: pr })
      });

      if (!decodeResponse.ok) {
        const errorText = await decodeResponse.text();
        logger.logSystem('error', 'Failed to decode payment request', {
          error: errorText,
          paymentRequest: pr.substring(0, 20) + '...'
        });
        
        return NextResponse.json({
          status: 'ERROR',
          reason: 'Invalid payment request'
        }, { status: 400 });
      }

      paymentRequest = await decodeResponse.json();
      
      // Validate amount matches session
      const invoiceAmountMsat = paymentRequest.amount_msat || 0;
      const sessionAmountMsat = session.amount_sats * 1000;
      
      if (Math.abs(invoiceAmountMsat - sessionAmountMsat) > 1000) { // Allow 1 sat tolerance
        return NextResponse.json({
          status: 'ERROR',
          reason: 'Payment request amount does not match withdrawal amount'
        }, { status: 400 });
      }

      // Check if payment request is expired
      if (paymentRequest.expiry && paymentRequest.timestamp) {
        const expiryTime = (paymentRequest.timestamp + paymentRequest.expiry) * 1000;
        if (Date.now() > expiryTime) {
          return NextResponse.json({
            status: 'ERROR',
            reason: 'Payment request has expired'
          }, { status: 400 });
        }
      }

    } catch (error) {
      logger.logSystem('error', 'Error decoding payment request', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentRequest: pr.substring(0, 20) + '...'
      });
      
      return NextResponse.json({
        status: 'ERROR',
        reason: 'Failed to validate payment request'
      }, { status: 400 });
    }

    // TODO: Check user balance and withdrawal limits
    try {
      // Get user's workspace and check balance limits
      const { data: workspace } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          workspaces!inner (
            plan,
            settings
          )
        `)
        .eq('user_id', session.user_id)
        .single();

      if (!workspace) {
        return NextResponse.json({
          status: 'ERROR',
          reason: 'User workspace not found'
        }, { status: 403 });
      }

      // Check LNbits wallet balance
      const walletResponse = await fetch(`${process.env.LNBITS_BASE_URL}/api/v1/wallet`, {
        headers: {
          'X-Api-Key': process.env.LNBITS_ADMIN_KEY || ''
        }
      });

      if (!walletResponse.ok) {
        throw new Error('Failed to check wallet balance');
      }

      const walletData = await walletResponse.json();
      const availableBalance = Math.floor(walletData.balance / 1000); // Convert msat to sats

      if (availableBalance < session.amount_sats) {
        logger.logSystem('warn', 'Insufficient balance for withdrawal', {
          sessionId: session.id,
          userId: session.user_id,
          requestedAmount: session.amount_sats,
          availableBalance
        });

        return NextResponse.json({
          status: 'ERROR',
          reason: 'Insufficient wallet balance for withdrawal'
        }, { status: 402 });
      }

      // Check daily withdrawal limits based on plan
      const workspaceData = workspace.workspaces as any;
      const plan = (Array.isArray(workspaceData) ? workspaceData[0]?.plan : workspaceData?.plan) || 'free';
      const dailyLimits: Record<string, number> = {
        free: 50000,      // 50k sats
        starter: 200000,  // 200k sats  
        business: 1000000, // 1M sats
        enterprise: 5000000 // 5M sats
      };

      const dailyLimit = dailyLimits[plan] || dailyLimits.free;

      // Calculate today's withdrawals
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayWithdrawals } = await supabase
        .from('lnurl_withdraw_sessions')
        .select('amount_sats')
        .eq('user_id', session.user_id)
        .eq('status', 'used')
        .gte('created_at', today.toISOString());

      const todayTotal = todayWithdrawals?.reduce((sum, w) => sum + w.amount_sats, 0) || 0;
      
      if (todayTotal + session.amount_sats > dailyLimit) {
        return NextResponse.json({
          status: 'ERROR',
          reason: `Daily withdrawal limit exceeded. Limit: ${dailyLimit} sats, Used: ${todayTotal} sats`
        }, { status: 429 });
      }

    } catch (error) {
      logger.logSystem('error', 'Error checking user balance/limits', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: session.user_id
      });
      
      return NextResponse.json({
        status: 'ERROR',
        reason: 'Failed to verify withdrawal eligibility'
      }, { status: 500 });
    }

    // TODO: Execute Lightning payment
    let paymentResult: any;
    try {
      // Execute payment via LNbits
      const paymentResponse = await fetch(`${process.env.LNBITS_BASE_URL}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.LNBITS_ADMIN_KEY || ''
        },
        body: JSON.stringify({
          out: true,
          bolt11: pr,
          memo: `LNURL withdrawal: ${session.description}`
        })
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        logger.logSystem('error', 'Lightning payment failed', {
          error: errorText,
          sessionId: session.id,
          userId: session.user_id,
          amount: session.amount_sats
        });

        return NextResponse.json({
          status: 'ERROR',
          reason: 'Lightning payment failed'
        }, { status: 500 });
      }

      paymentResult = await paymentResponse.json();

      // Verify payment was successful
      if (!paymentResult.payment_hash) {
        throw new Error('Payment response missing payment hash');
      }

      logger.logSystem('info', 'Lightning payment executed successfully', {
        sessionId: session.id,
        userId: session.user_id,
        amount: session.amount_sats,
        paymentHash: paymentResult.payment_hash,
        fee: paymentResult.fee || 0
      });

    } catch (error) {
      logger.logSystem('error', 'Error executing Lightning payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: session.id,
        userId: session.user_id
      });
      
      return NextResponse.json({
        status: 'ERROR',
        reason: 'Failed to execute Lightning payment'
      }, { status: 500 });
    }

    // TODO: Update session status to 'used'
    try {
      // Update session with payment details
      const { error: updateError } = await supabase
        .from('lnurl_withdraw_sessions')
        .update({
          status: 'used',
          payment_hash: paymentResult.payment_hash,
          payment_preimage: paymentResult.preimage,
          fee_paid_msat: paymentResult.fee || 0,
          completed_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (updateError) {
        logger.logSystem('error', 'Failed to update session status', {
          error: updateError.message,
          sessionId: session.id,
          paymentHash: paymentResult.payment_hash
        });
        
        // Payment succeeded but session update failed - log for manual reconciliation
        logger.logSystem('critical', 'Payment succeeded but session update failed', {
          sessionId: session.id,
          userId: session.user_id,
          paymentHash: paymentResult.payment_hash,
          amount: session.amount_sats
        });
      }

      // Record successful withdrawal for analytics
      await supabase
        .from('user_analytics')
        .insert({
          user_id: session.user_id,
          event_type: 'lnurl_withdrawal',
          event_data: {
            amount_sats: session.amount_sats,
            payment_hash: paymentResult.payment_hash,
            session_id: session.id,
            fee_paid_msat: paymentResult.fee || 0
          },
          created_at: new Date().toISOString()
        });

    } catch (error) {
      logger.logSystem('error', 'Error updating session status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: session.id
      });
      
      // Don't fail the request since payment already succeeded
    }

    // For now, return success (implementation would continue with actual payment)
    logger.logSystem('info', 'LNURL withdrawal processed', {
      sessionId: session.id,
      userId: session.user_id,
      amount: session.amount_sats
    });

    return NextResponse.json({
      status: 'OK'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.logSystem('error', 'LNURL withdraw callback failed', {
      error: errorMessage
    });

    return NextResponse.json({
      status: 'ERROR',
      reason: 'Internal server error'
    }, { status: 500 });
  }
} 