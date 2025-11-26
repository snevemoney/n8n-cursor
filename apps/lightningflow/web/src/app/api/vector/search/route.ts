import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
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

// Safe OpenAI client creation with fallbacks
const createOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes('placeholder')) {
    console.warn('OpenAI not configured - using mock mode');
    return null;
  }
  
  return new OpenAI({ apiKey });
};

const openai = createOpenAIClient();

interface SearchRequest {
  query: string;
  type: 'tutorial' | 'error' | 'general';
  category?: string;
  difficulty?: string;
  matchThreshold?: number;
  matchCount?: number;
  context?: {
    currentPage?: string;
    errorDetails?: any;
    userLevel?: string;
  };
}

interface SearchResult {
  id: string;
  type: 'tutorial' | 'loop_solution';
  title: string;
  content: string;
  similarity: number;
  metadata: any;
  actions?: Array<{
    type: 'view_tutorial' | 'run_agent' | 'open_simulator';
    label: string;
    href?: string;
    data?: any;
  }>;
}

/**
 * Vector Search API
 * 
 * Supports:
 * - Tutorial search with relevance
 * - Error solution lookup
 * - General knowledge queries
 * - Context-aware results
 */
export async function POST(request: NextRequest) {
  try {
    // Return mock response if services not configured
    if (!supabase || !openai) {
      const {
        query,
        type,
        matchCount = 10
      }: SearchRequest = await request.json();

      const mockResults: SearchResult[] = [
        {
          id: 'mock-tutorial-1',
          type: 'tutorial' as const,
          title: 'Getting Started with Lightning Network',
          content: 'Learn the basics of Lightning Network payments and routing...',
          similarity: 0.95,
          metadata: { category: 'basics', difficulty: 'beginner' },
          actions: [
            {
              type: 'view_tutorial' as const,
              label: 'Read Tutorial',
              href: '/learn/lightning/mock-tutorial-1',
            },
          ],
        },
        {
          id: 'mock-solution-1',
          type: 'loop_solution' as const,
          title: 'Channel Balance Solution',
          content: 'Use Loop Out to rebalance your channels effectively...',
          similarity: 0.87,
          metadata: { errorType: 'low_inbound', successRate: 0.85 },
          actions: [
            {
              type: 'run_agent' as const,
              label: 'Auto-Fix',
              data: ['rebalance_agent'],
            },
          ],
        },
      ].slice(0, matchCount);

      return NextResponse.json({
        success: true,
        query,
        type,
        resultCount: mockResults.length,
        results: mockResults,
        suggestions: ['Try "open channel"', 'Search "routing fees"', 'Look up "payment failed"'],
        mode: 'mock'
      });
    }

    const {
      query,
      type,
      category,
      difficulty,
      matchThreshold = 0.78,
      matchCount = 10,
      context = {}
    }: SearchRequest = await request.json();

    if (!query || !type) {
      return NextResponse.json(
        { error: 'Query and type are required' },
        { status: 400 }
      );
    }

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    let results: SearchResult[] = [];

    if (type === 'tutorial' || type === 'general') {
      // Search tutorials
      const { data: tutorialResults, error: tutorialError } = await supabase
        .rpc('search_tutorials', {
          query_embedding: queryEmbedding,
          match_threshold: matchThreshold,
          match_count: Math.floor(matchCount / 2),
          filter_category: category,
          filter_difficulty: difficulty,
        });

      if (tutorialError) {
        console.error('Tutorial search error:', tutorialError);
      } else if (tutorialResults) {
        results.push(...tutorialResults.map((result: any) => ({
          id: result.tutorial_id,
          type: 'tutorial' as const,
          title: result.title,
          content: result.summary || result.chunk_content,
          similarity: result.similarity,
          metadata: {
            category: result.category,
            difficulty: result.difficulty,
            chunkIndex: result.chunk_index,
          },
          actions: [
            {
              type: 'view_tutorial' as const,
              label: 'Read Tutorial',
              href: `/learn/lightning/${result.tutorial_id}`,
            },
          ],
        })));
      }
    }

    if (type === 'error' || type === 'general') {
      // Search loop solutions
      const { data: loopResults, error: loopError } = await supabase
        .rpc('search_loop_solutions', {
          query_embedding: queryEmbedding,
          match_threshold: matchThreshold * 0.9, // Slightly more permissive for errors
          match_count: Math.floor(matchCount / 2),
          min_success_rate: 0.3,
        });

      if (loopError) {
        console.error('Loop search error:', loopError);
      } else if (loopResults) {
        results.push(...loopResults.map((result: any) => ({
          id: result.id,
          type: 'loop_solution' as const,
          title: `${result.error_type} Solution`,
          content: result.solution_text,
          similarity: result.similarity,
          metadata: {
            errorType: result.error_type,
            successRate: result.success_rate,
            confidenceScore: result.confidence_score,
            tutorialIds: result.tutorial_ids,
            agentSuggestions: result.agent_suggestions,
          },
          actions: [
            ...(result.agent_suggestions?.length > 0 ? [{
              type: 'run_agent' as const,
              label: 'Auto-Fix',
              data: result.agent_suggestions,
            }] : []),
            {
              type: 'open_simulator' as const,
              label: 'Test Solution',
              href: '/dashboard/simulator',
            },
          ],
        })));
      }
    }

    // Sort by similarity and add context-aware scoring
    results.sort((a, b) => {
      let scoreA = a.similarity;
      let scoreB = b.similarity;

      // Boost tutorial results if user is on learning pages
      if (context.currentPage?.includes('/learn') && a.type === 'tutorial') {
        scoreA += 0.1;
      }
      if (context.currentPage?.includes('/learn') && b.type === 'tutorial') {
        scoreB += 0.1;
      }

      // Boost error solutions if we have error context
      if (context.errorDetails && a.type === 'loop_solution') {
        scoreA += 0.15;
      }
      if (context.errorDetails && b.type === 'loop_solution') {
        scoreB += 0.15;
      }

      return scoreB - scoreA;
    });

    // Limit final results
    results = results.slice(0, matchCount);

    // Log search for analytics
    const { error: logError } = await supabase
      .from('user_interactions')
      .insert({
        user_id: request.headers.get('x-user-id'), // Set by auth middleware
        interaction_type: 'search',
        target_type: type,
        action: 'query',
        result: results.length > 0 ? 'success' : 'no_results',
        metadata: {
          query,
          resultCount: results.length,
          context,
        },
      });

    if (logError) {
      console.error('Failed to log search interaction:', logError);
    }

    return NextResponse.json({
      success: true,
      query,
      type,
      resultCount: results.length,
      results,
      suggestions: generateSearchSuggestions(query, type, results.length),
    });

  } catch (error) {
    console.error('Vector search error:', error);
    return NextResponse.json(
      { error: 'Internal server error during search' },
      { status: 500 }
    );
  }
}

/**
 * Generate helpful search suggestions
 */
function generateSearchSuggestions(
  query: string,
  type: string,
  resultCount: number
): string[] {
  const suggestions: string[] = [];

  if (resultCount === 0) {
    if (type === 'tutorial') {
      suggestions.push(
        'Try searching for "lightning basics"',
        'Look for "channel management"',
        'Search "fee optimization"'
      );
    } else if (type === 'error') {
      suggestions.push(
        'Try describing the error differently',
        'Include channel or payment details',
        'Search for "troubleshooting guide"'
      );
    }
  } else if (resultCount < 3) {
    suggestions.push(
      'Try broader search terms',
      'Remove specific technical terms',
      'Search in different categories'
    );
  }

  return suggestions;
}

/**
 * GET endpoint for search autocomplete/suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'general';

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Return mock suggestions if Supabase not configured
    if (!supabase) {
      const lightningTerms = [
        'channel balance',
        'routing fees',
        'liquidity management',
        'payment failures',
        'fee optimization',
        'channel capacity',
        'rebalancing',
        'HTLC',
        'onchain fees',
      ];

      const matchingTerms = lightningTerms.filter(term =>
        term.toLowerCase().includes(q.toLowerCase())
      );

      return NextResponse.json({
        suggestions: matchingTerms.slice(0, 8),
        mode: 'mock'
      });
    }

    // Get popular search terms and tutorial titles for autocomplete
    const { data: tutorials } = await supabase
      .from('tutorials')
      .select('title, category')
      .ilike('title', `%${q}%`)
      .eq('is_published', true)
      .limit(5);

    const suggestions = tutorials?.map(t => t.title) || [];

    // Add common Lightning terms if relevant
    const lightningTerms = [
      'channel balance',
      'routing fees',
      'liquidity management',
      'payment failures',
      'fee optimization',
      'channel capacity',
      'rebalancing',
      'HTLC',
      'onchain fees',
    ];

    const matchingTerms = lightningTerms.filter(term =>
      term.toLowerCase().includes(q.toLowerCase())
    );

    return NextResponse.json({
      suggestions: [...suggestions, ...matchingTerms].slice(0, 8),
    });

  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({ suggestions: [] });
  }
} 