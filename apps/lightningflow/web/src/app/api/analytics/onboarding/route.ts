import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Safe Supabase client creation with fallbacks
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - using mock mode');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

const supabase = createSupabaseClient();

interface OnboardingEvent {
  sessionId: string;
  stepName: string;
  stepIndex: number;
  status: 'started' | 'completed' | 'skipped' | 'dropped' | 'error';
  timeSpentSeconds?: number;
  errorDetails?: any;
  metadata?: any;
}

/**
 * Onboarding Analytics API
 * 
 * Tracks user progress through onboarding funnel:
 * - Step progression and completion
 * - Time spent on each step
 * - Drop-off points and error details
 * - Conversion funnel analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        event: { id: 'mock-event-id' },
        sessionProgress: { progress: 50, currentStep: 'mock-step', isComplete: false },
        mode: 'mock'
      });
    }

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const event: OnboardingEvent = await request.json();

    // Validate required fields
    if (!event.sessionId || !event.stepName || event.stepIndex === undefined || !event.status) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, stepName, stepIndex, status' },
        { status: 400 }
      );
    }

    // Insert onboarding event
    const { data, error } = await supabase
      .from('onboarding_events')
      .insert({
        user_id: userId,
        session_id: event.sessionId,
        step_name: event.stepName,
        step_index: event.stepIndex,
        status: event.status,
        time_spent_seconds: event.timeSpentSeconds,
        error_details: event.errorDetails,
        metadata: event.metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Onboarding event insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record onboarding event' },
        { status: 500 }
      );
    }

    // Calculate session progress
    const sessionProgress = await calculateSessionProgress(event.sessionId);

    return NextResponse.json({
      success: true,
      event: data,
      sessionProgress,
    });

  } catch (error) {
    console.error('Onboarding analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for onboarding analytics dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        timeframe: '7d',
        analytics: {
          funnel: [],
          dropOffs: [],
          completionTimes: [],
          errors: [],
          userProgress: { progress: 50, currentStep: 'mock-step', isComplete: false }
        },
        mode: 'mock'
      });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Date range calculation
    const now = new Date();
    const daysBack = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 7;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Fetch onboarding analytics
    const analytics = await Promise.all([
      getFunnelAnalysis(startDate),
      getDropOffAnalysis(startDate),
      getCompletionTimes(startDate),
      getErrorAnalysis(startDate),
      getUserProgress(userId),
    ]);

    const [funnelData, dropOffData, completionTimes, errorData, userProgress] = analytics;

    return NextResponse.json({
      success: true,
      timeframe,
      analytics: {
        funnel: funnelData,
        dropOffs: dropOffData,
        completionTimes,
        errors: errorData,
        userProgress,
      },
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

/**
 * Calculate session progress and completion rate
 */
async function calculateSessionProgress(sessionId: string) {
  if (!supabase) {
    return { progress: 50, currentStep: 'mock-step', isComplete: false };
  }

  const { data: events } = await supabase
    .from('onboarding_events')
    .select('step_name, step_index, status, created_at')
    .eq('session_id', sessionId)
    .order('step_index', { ascending: true });

  if (!events || events.length === 0) {
    return { progress: 0, currentStep: null, isComplete: false };
  }

  const totalSteps = 5; // Adjust based on your onboarding flow
  const completedSteps = events.filter(e => e.status === 'completed').length;
  const currentStep = events[events.length - 1];
  const isComplete = completedSteps === totalSteps;

  return {
    progress: (completedSteps / totalSteps) * 100,
    currentStep: currentStep.step_name,
    isComplete,
    completedSteps,
    totalSteps,
  };
}

/**
 * Funnel analysis - conversion rates between steps
 */
async function getFunnelAnalysis(startDate: Date) {
  if (!supabase) return [];

  const { data: events } = await supabase
    .from('onboarding_events')
    .select('step_name, step_index, status, session_id')
    .gte('created_at', startDate.toISOString())
    .order('step_index');

  if (!events) return [];

  // Group by step and calculate metrics
  const stepMetrics = new Map();
  const sessionSteps = new Map();

  events.forEach(event => {
    const key = event.step_name;
    if (!stepMetrics.has(key)) {
      stepMetrics.set(key, {
        stepName: key,
        stepIndex: event.step_index,
        started: new Set(),
        completed: new Set(),
        dropped: new Set(),
      });
    }

    const metric = stepMetrics.get(key);
    metric.started.add(event.session_id);

    if (event.status === 'completed') {
      metric.completed.add(event.session_id);
    } else if (event.status === 'dropped') {
      metric.dropped.add(event.session_id);
    }

    // Track session progression
    if (!sessionSteps.has(event.session_id)) {
      sessionSteps.set(event.session_id, []);
    }
    sessionSteps.get(event.session_id).push(event);
  });

  // Convert to array and calculate rates
  return Array.from(stepMetrics.values())
    .sort((a, b) => a.stepIndex - b.stepIndex)
    .map(metric => ({
      stepName: metric.stepName,
      stepIndex: metric.stepIndex,
      started: metric.started.size,
      completed: metric.completed.size,
      dropped: metric.dropped.size,
      completionRate: metric.started.size > 0 ? (metric.completed.size / metric.started.size) * 100 : 0,
      dropOffRate: metric.started.size > 0 ? (metric.dropped.size / metric.started.size) * 100 : 0,
    }));
}

/**
 * Drop-off analysis - where users are abandoning the flow
 */
async function getDropOffAnalysis(startDate: Date) {
  if (!supabase) return [];

  const { data: dropOffs } = await supabase
    .from('onboarding_events')
    .select('step_name, step_index, error_details, metadata')
    .eq('status', 'dropped')
    .gte('created_at', startDate.toISOString());

  if (!dropOffs) return [];

  // Group by step and analyze reasons
  const dropOffMap = new Map();

  dropOffs.forEach(dropOff => {
    const key = dropOff.step_name;
    if (!dropOffMap.has(key)) {
      dropOffMap.set(key, {
        stepName: key,
        stepIndex: dropOff.step_index,
        count: 0,
        reasons: new Map(),
      });
    }

    const analysis = dropOffMap.get(key);
    analysis.count++;

    // Analyze error details for common patterns
    if (dropOff.error_details) {
      const reason = dropOff.error_details.type || 'unknown_error';
      analysis.reasons.set(reason, (analysis.reasons.get(reason) || 0) + 1);
    } else {
      analysis.reasons.set('user_abandonment', (analysis.reasons.get('user_abandonment') || 0) + 1);
    }
  });

  return Array.from(dropOffMap.values())
    .sort((a, b) => b.count - a.count)
    .map(analysis => ({
      ...analysis,
      reasons: Array.from(analysis.reasons.entries() as IterableIterator<[string, number]>).map(([reason, count]) => ({ reason, count })),
    }));
}

/**
 * Completion time analysis
 */
async function getCompletionTimes(startDate: Date) {
  if (!supabase) return [];

  const { data: sessions } = await supabase
    .rpc('get_onboarding_completion_times', { start_date: startDate.toISOString() });

  return sessions || [];
}

/**
 * Error analysis
 */
async function getErrorAnalysis(startDate: Date) {
  if (!supabase) return [];

  const { data: errors } = await supabase
    .from('onboarding_events')
    .select('step_name, error_details, created_at')
    .eq('status', 'error')
    .gte('created_at', startDate.toISOString());

  if (!errors) return [];

  // Group errors by type
  const errorMap = new Map();

  errors.forEach(error => {
    const errorType = error.error_details?.type || 'unknown';
    const key = `${error.step_name}:${errorType}`;

    if (!errorMap.has(key)) {
      errorMap.set(key, {
        stepName: error.step_name,
        errorType,
        count: 0,
        latestOccurrence: error.created_at,
        examples: [],
      });
    }

    const analysis = errorMap.get(key);
    analysis.count++;
    analysis.latestOccurrence = error.created_at;
    
    if (analysis.examples.length < 3) {
      analysis.examples.push(error.error_details);
    }
  });

  return Array.from(errorMap.values())
    .sort((a, b) => b.count - a.count);
}

/**
 * User-specific progress
 */
async function getUserProgress(userId: string) {
  if (!supabase) {
    return { hasStarted: false, progress: 0 };
  }

  const { data: userEvents } = await supabase
    .from('onboarding_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (!userEvents || userEvents.length === 0) {
    return { hasStarted: false, progress: 0 };
  }

  const latestSession = userEvents[userEvents.length - 1].session_id;
  const sessionProgress = await calculateSessionProgress(latestSession);

  return {
    hasStarted: true,
    currentSession: latestSession,
    ...sessionProgress,
    totalSessions: new Set(userEvents.map(e => e.session_id)).size,
    lastActivity: userEvents[userEvents.length - 1].created_at,
  };
} 