import { NextRequest, NextResponse } from 'next/server';
import { searchSimilar } from '@/lib/embeddings';
import { logger } from '@/lib/logger';

interface SearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
}

interface SearchResponse {
  success: boolean;
  results?: Array<{
    id: string;
    content: string;
    title: string | null;
    summary: string | null;
    similarity: number;
    metadata: any;
  }>;
  error?: string;
  query_used?: string;
  total_results?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    const body: SearchRequest = await request.json();
    
    if (!body.query?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }

    const query = body.query.trim();
    const limit = Math.min(body.limit || 5, 20); // Max 20 results
    const threshold = body.threshold || 0.7; // Default similarity threshold

    logger.logAPI('info', 'Vector search requested', {
      method: 'POST',
      path: '/api/ai/search-loop',
      statusCode: 200
    }, {
      actionType: 'search',
      provider: 'openai',
      query: body.query.substring(0, 50),
      threshold
    });

    // Search for similar content
    const results = await searchSimilar(query, limit, threshold);

    logger.logAPI('info', 'Vector search completed', {
      method: 'POST',
      path: '/api/ai/search-loop',
      statusCode: 200
    }, {
      actionType: 'search',
      provider: 'openai',
      query_length: query.length,
      results_found: results.length
    });

    return NextResponse.json({
      success: true,
      results: results.map(result => ({
        id: result.id,
        content: result.content,
        title: result.title,
        summary: result.summary,
        similarity: Math.round(result.similarity * 100) / 100, // Round to 2 decimals
        metadata: result.metadata
      })),
      query_used: query,
      total_results: results.length
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.logAPI('error', 'Vector search failed', {
      method: 'POST',
      path: '/api/ai/search-loop',
      statusCode: 500
    }, {
      actionType: 'search',
      provider: 'openai',
      error: errorMessage
    });

    return NextResponse.json({
      success: false,
      error: 'Search failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Simple health check for the search endpoint
  return NextResponse.json({
    success: true,
    message: 'Lightning tutorial search endpoint is active',
    usage: 'POST with { "query": "your search terms", "limit": 5, "threshold": 0.7 }'
  });
} 