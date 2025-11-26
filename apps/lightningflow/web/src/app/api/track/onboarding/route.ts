import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

interface TrackingRequest {
  user_id?: string;
  step: string;
  action: 'started' | 'completed' | 'error' | 'dropped_off' | 'clicked' | 'viewed';
  metadata?: Record<string, any>;
}

interface TrackingResponse {
  success: boolean;
  event_id?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TrackingResponse>> {
  try {
    const body: TrackingRequest = await request.json();

    if (!body.step || !body.action) {
      return NextResponse.json({
        success: false,
        error: 'Step and action are required'
      }, { status: 400 });
    }

    const supabase = createClient();
    
    // If no user_id provided, try to get from auth
    let userId = body.user_id;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    // Insert tracking event
    const { data, error } = await supabase
      .from('onboarding_events')
      .insert({
        user_id: userId,
        step: body.step,
        action: body.action,
        metadata: body.metadata || {}
      })
      .select('id')
      .single();

    if (error) {
      logger.logSystem('error', 'Failed to track onboarding event', {
        actionType: 'track_onboarding',
        error: error.message,
        step: body.step,
        action: body.action
      });

      return NextResponse.json({
        success: false,
        error: 'Failed to track event'
      }, { status: 500 });
    }

    logger.logSystem('info', 'Onboarding event tracked', {
      actionType: 'track_onboarding',
      step: body.step,
      action: body.action,
      user_authenticated: !!userId
    });

    return NextResponse.json({
      success: true,
      event_id: data.id
    });

  } catch (error) {
    logger.logSystem('error', 'Onboarding tracking failed', {
      actionType: 'track_onboarding',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      error: 'Tracking failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const step = searchParams.get('step');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createClient();
    
    let query = supabase
      .from('onboarding_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100)); // Max 100 events

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (step) {
      query = query.eq('step', step);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch events'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      events: data,
      total: data.length
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch events'
    }, { status: 500 });
  }
} 