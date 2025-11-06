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

interface FeedbackRequest {
  queryText: string;
  searchType: 'tutorial' | 'error' | 'general';
  matchId: string;
  matchRank: number;
  helpful: boolean;
  additionalFeedback?: string;
  context?: {
    currentPage?: string;
    errorDetails?: any;
    userLevel?: string;
    sessionId?: string;
  };
}

/**
 * Vector Search Feedback API
 * 
 * Collects user feedback on search results to:
 * - Improve embedding quality over time
 * - Identify low-quality content
 * - Optimize search relevance
 * - Track user satisfaction metrics
 */
export async function POST(request: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        feedback: { id: 'mock-feedback-id' },
        message: 'Thank you for your feedback! (Mock mode)',
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

    const feedback: FeedbackRequest = await request.json();

    // Validate required fields
    if (!feedback.queryText || !feedback.searchType || !feedback.matchId || 
        feedback.matchRank === undefined || feedback.helpful === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert feedback
    const { data, error } = await supabase
      .from('vector_feedback')
      .insert({
        user_id: userId,
        query_text: feedback.queryText,
        search_type: feedback.searchType,
        match_id: feedback.matchId,
        match_rank: feedback.matchRank,
        helpful: feedback.helpful,
        additional_feedback: feedback.additionalFeedback,
        context_metadata: feedback.context,
      })
      .select()
      .single();

    if (error) {
      console.error('Feedback insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record feedback' },
        { status: 500 }
      );
    }

    // Update content quality scores based on feedback
    await updateContentQuality(feedback.matchId, feedback.searchType, feedback.helpful);

    // Log interaction
    await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        interaction_type: 'feedback',
        target_id: feedback.matchId,
        target_type: feedback.searchType,
        action: feedback.helpful ? 'helpful' : 'not_helpful',
        result: 'success',
        metadata: {
          queryText: feedback.queryText,
          matchRank: feedback.matchRank,
          additionalFeedback: feedback.additionalFeedback,
          context: feedback.context,
        },
      });

    return NextResponse.json({
      success: true,
      feedback: data,
      message: 'Thank you for your feedback!',
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for feedback analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        timeframe: '7d',
        type: 'all',
        analytics: {
          totalFeedback: 0,
          helpfulPercentage: 75,
          topQueries: [],
          contentQuality: [],
          searchTypeBreakdown: []
        },
        mode: 'mock'
      });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const timeframe = searchParams.get('timeframe') || '7d';

    // Date range calculation
    const now = new Date();
    const daysBack = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 7;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Build query
    let query = supabase
      .from('vector_feedback')
      .select(`
        *,
        tutorials:match_id (title, category),
        loop_embeddings:match_id (error_type, success_rate)
      `)
      .gte('created_at', startDate.toISOString());

    if (type !== 'all') {
      query = query.eq('search_type', type);
    }

    const { data: feedbackData, error } = await query;

    if (error) {
      console.error('Feedback fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback data' },
        { status: 500 }
      );
    }

    // Analyze feedback patterns
    const analytics = analyzeFeedback(feedbackData || []);

    return NextResponse.json({
      success: true,
      timeframe,
      type,
      analytics,
    });

  } catch (error) {
    console.error('Feedback analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback analytics' },
      { status: 500 }
    );
  }
}

/**
 * Update content quality scores based on feedback
 */
async function updateContentQuality(matchId: string, searchType: string, helpful: boolean) {
  try {
    // Skip if Supabase not configured
    if (!supabase) {
      console.log('Skipping content quality update - Supabase not configured');
      return;
    }

    if (searchType === 'tutorial') {
      // Update tutorial helpful votes
      const { data: tutorial } = await supabase
        .from('tutorials')
        .select('helpful_votes, unhelpful_votes')
        .eq('id', matchId)
        .single();

      if (tutorial) {
        const updates = helpful 
          ? { helpful_votes: tutorial.helpful_votes + 1 }
          : { unhelpful_votes: tutorial.unhelpful_votes + 1 };

        await supabase
          .from('tutorials')
          .update(updates)
          .eq('id', matchId);
      }
    } else if (searchType === 'error') {
      // Update loop embedding success rate
      const { data: loopEmbedding } = await supabase
        .from('loop_embeddings')
        .select('success_rate, confidence_score')
        .eq('id', matchId)
        .single();

      if (loopEmbedding) {
        // Simple feedback-based adjustment (you might want more sophisticated logic)
        const adjustment = helpful ? 0.05 : -0.05;
        const newSuccessRate = Math.max(0, Math.min(1, loopEmbedding.success_rate + adjustment));
        
        await supabase
          .from('loop_embeddings')
          .update({ success_rate: newSuccessRate })
          .eq('id', matchId);
      }
    }
  } catch (error) {
    console.error('Error updating content quality:', error);
  }
}

/**
 * Analyze feedback patterns and generate insights
 */
function analyzeFeedback(feedbackData: any[]) {
  const analytics = {
    overall: {
      totalFeedback: feedbackData.length,
      helpfulCount: 0,
      unhelpfulCount: 0,
      helpfulPercentage: 0,
    },
    bySearchType: new Map(),
    byQuery: new Map(),
    byRank: new Map(),
    commonUnhelpfulReasons: [] as Array<{ reason: string; count: number }>,
    topPerformingContent: [] as Array<any>,
    underperformingContent: [] as Array<any>,
  };

  // Process feedback data
  feedbackData.forEach(feedback => {
    // Overall metrics
    if (feedback.helpful) {
      analytics.overall.helpfulCount++;
    } else {
      analytics.overall.unhelpfulCount++;
    }

    // By search type
    const searchType = feedback.search_type;
    if (!analytics.bySearchType.has(searchType)) {
      analytics.bySearchType.set(searchType, { helpful: 0, unhelpful: 0, total: 0 });
    }
    const typeStats = analytics.bySearchType.get(searchType);
    typeStats.total++;
    if (feedback.helpful) {
      typeStats.helpful++;
    } else {
      typeStats.unhelpful++;
    }

    // By query patterns
    const queryKey = feedback.query_text.toLowerCase();
    if (!analytics.byQuery.has(queryKey)) {
      analytics.byQuery.set(queryKey, { helpful: 0, unhelpful: 0, total: 0 });
    }
    const queryStats = analytics.byQuery.get(queryKey);
    queryStats.total++;
    if (feedback.helpful) {
      queryStats.helpful++;
    } else {
      queryStats.unhelpful++;
    }

    // By result rank
    const rank = feedback.match_rank;
    if (!analytics.byRank.has(rank)) {
      analytics.byRank.set(rank, { helpful: 0, unhelpful: 0, total: 0 });
    }
    const rankStats = analytics.byRank.get(rank);
    rankStats.total++;
    if (feedback.helpful) {
      rankStats.helpful++;
    } else {
      rankStats.unhelpful++;
    }
  });

  // Calculate percentages
  analytics.overall.helpfulPercentage = analytics.overall.totalFeedback > 0
    ? (analytics.overall.helpfulCount / analytics.overall.totalFeedback) * 100
    : 0;

  // Convert maps to arrays with percentages
  const convertMapToArray = (map: Map<any, any>) => {
    return Array.from(map.entries()).map(([key, stats]) => ({
      key,
      ...stats,
      helpfulPercentage: stats.total > 0 ? (stats.helpful / stats.total) * 100 : 0,
    }));
  };

  // Extract common unhelpful feedback reasons
  analytics.commonUnhelpfulReasons = feedbackData
    .filter(f => !f.helpful && f.additional_feedback)
    .map(f => f.additional_feedback)
    .reduce((acc, reason) => {
      const existing = acc.find((r: any) => r.reason === reason);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ reason, count: 1 });
      }
      return acc;
    }, [] as Array<{ reason: string; count: number }>)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);

  // Identify top performing and underperforming content
  const contentPerformance = new Map();
  
  feedbackData.forEach(feedback => {
    const contentId = feedback.match_id;
    if (!contentPerformance.has(contentId)) {
      contentPerformance.set(contentId, {
        id: contentId,
        type: feedback.search_type,
        helpful: 0,
        unhelpful: 0,
        total: 0,
        title: feedback.tutorials?.title || feedback.loop_embeddings?.error_type || 'Unknown',
      });
    }
    
    const perf = contentPerformance.get(contentId);
    perf.total++;
    if (feedback.helpful) {
      perf.helpful++;
    } else {
      perf.unhelpful++;
    }
  });

  const contentArray = Array.from(contentPerformance.values())
    .map(perf => ({
      ...perf,
      helpfulPercentage: perf.total > 0 ? (perf.helpful / perf.total) * 100 : 0,
    }))
    .filter(perf => perf.total >= 3); // Only include content with significant feedback

  analytics.topPerformingContent = contentArray
    .sort((a, b) => b.helpfulPercentage - a.helpfulPercentage)
    .slice(0, 10);

  analytics.underperformingContent = contentArray
    .sort((a, b) => a.helpfulPercentage - b.helpfulPercentage)
    .slice(0, 10);

  return {
    ...analytics,
    bySearchType: convertMapToArray(analytics.bySearchType),
    byQuery: convertMapToArray(analytics.byQuery),
    byRank: convertMapToArray(analytics.byRank),
  };
} 