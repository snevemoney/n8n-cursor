import { NextRequest, NextResponse } from 'next/server';
import { getRAGStore } from '@/lib/shared-stores';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

/**
 * GET /api/knowledge - Get all knowledge items
 * This is a convenience endpoint that redirects to /api/project/knowledge
 * or returns knowledge items directly from RAG store
 */
export const GET = withErrorHandling(async () => {
  try {
    const store = await getRAGStore();
    const allKnowledge = store.getAllKnowledge();
    
    return createSuccessResponse({
      knowledge: allKnowledge.map(k => ({
        id: k.id,
        source: k.source || 'unknown',
        type: k.type || 'unknown',
        category: k.category || 'uncategorized',
        title: k.title || k.id,
        description: k.description || '',
        tags: k.tags || [],
        extracted: k.description ? k.description.substring(0, 200) + (k.description.length > 200 ? '...' : '') : '',
        filePath: k.filePath,
        contentUrl: k.contentUrl || k.filePath,
        codeSnippets: k.codeSnippets || []
      })),
      total: allKnowledge.length
    });
  } catch (error: any) {
    console.error('[Knowledge API] Failed to get knowledge:', error);
    // Return empty knowledge array instead of failing
    return createSuccessResponse({
      knowledge: [],
      total: 0,
      message: 'Knowledge store not ready yet'
    });
  }
});

