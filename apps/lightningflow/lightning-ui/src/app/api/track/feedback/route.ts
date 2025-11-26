import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

interface FeedbackRequest {
  embedding_id: string;
  value: 'yes' | 'no';
  timestamp?: string;
  context?: {
    tutorial_id?: string;
    user_agent?: string;
    page_url?: string;
    tooltip_id?: string;
  };
}

interface FeedbackResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<FeedbackResponse>> {
  try {
    const body: FeedbackRequest = await request.json();
    
    // Validate required fields
    if (!body.embedding_id || !body.value) {
      return NextResponse.json({
        success: false,
        error: 'embedding_id and value are required'
      }, { status: 400 });
    }

    // Validate value enum
    if (!['yes', 'no'].includes(body.value)) {
      return NextResponse.json({
        success: false,
        error: 'value must be either "yes" or "no"'
      }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get the current user (if authenticated)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Prepare feedback data
    const feedbackData = {
      embedding_id: body.embedding_id,
      value: body.value,
      created_at: body.timestamp || new Date().toISOString(),
      user_id: user?.id || null,
      context: body.context || null,
      // Add some basic request metadata
      user_agent: request.headers.get('user-agent') || null,
      ip_address: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  null
    };

    // Insert feedback into database
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select('id')
      .single();

    if (error) {
      logger.logAPI('error', 'Failed to store feedback', {
        method: 'POST',
        path: '/api/track/feedback',
        statusCode: 500
      }, {
        actionType: 'feedback',
        provider: 'supabase',
        error: error.message
      });

      return NextResponse.json({
        success: false,
        error: 'Failed to store feedback'
      }, { status: 500 });
    }

    // Log successful feedback submission
    logger.logAPI('info', 'Feedback stored successfully', {
      method: 'POST',
      path: '/api/track/feedback',
      statusCode: 200
    }, {
      actionType: 'feedback',
      provider: 'supabase',
      feedback_id: data.id
    });

    // Optional: Update embedding quality score based on feedback
    // This could be used to improve vector search results over time
    if (user?.id) {
      await updateEmbeddingScore(supabase, body.embedding_id, body.value);
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.logAPI('error', 'Feedback API error', {
      method: 'POST',
      path: '/api/track/feedback',
      statusCode: 500
    }, {
      actionType: 'feedback',
      provider: 'api',
      error: errorMessage
    });

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Update embedding quality score based on user feedback
 * This helps improve vector search results over time
 */
async function updateEmbeddingScore(
  supabase: any, 
  embeddingId: string, 
  value: 'yes' | 'no'
): Promise<void> {
  try {
    // Get current feedback stats for this embedding
    const { data: stats } = await supabase
      .from('feedback')
      .select('value')
      .eq('embedding_id', embeddingId);

    if (stats && stats.length > 0) {
      const positiveCount = stats.filter((s: any) => s.value === 'yes').length;
      const totalCount = stats.length;
      const score = positiveCount / totalCount;

      // Update or insert embedding score
      await supabase
        .from('embedding_scores')
        .upsert({
          embedding_id: embeddingId,
          positive_feedback: positiveCount,
          total_feedback: totalCount,
          score: score,
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    // Log error but don't fail the request
    logger.logAPI('error', 'Failed to update embedding score', {
      method: 'POST',
      path: '/api/track/feedback',
      statusCode: 500
    }, {
      actionType: 'feedback_scoring',
      provider: 'supabase',
      error: error instanceof Error ? error.message : 'Unknown error',
      embedding_id: embeddingId
    });
  }
}

// GET endpoint to retrieve feedback analytics (optional)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const embeddingId = searchParams.get('embedding_id');
    
    if (!embeddingId) {
      return NextResponse.json({
        success: false,
        error: 'embedding_id parameter is required'
      }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get feedback stats for the embedding
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('value, created_at')
      .eq('embedding_id', embeddingId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve feedback'
      }, { status: 500 });
    }

    const positiveCount = feedback?.filter(f => f.value === 'yes').length || 0;
    const negativeCount = feedback?.filter(f => f.value === 'no').length || 0;
    const totalCount = feedback?.length || 0;

    return NextResponse.json({
      success: true,
      data: {
        embedding_id: embeddingId,
        total_feedback: totalCount,
        positive_feedback: positiveCount,
        negative_feedback: negativeCount,
        score: totalCount > 0 ? positiveCount / totalCount : 0,
        recent_feedback: feedback?.slice(0, 10) || []
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 