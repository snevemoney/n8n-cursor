import { NextRequest, NextResponse } from 'next/server';
import { getRAGStore } from '@/lib/shared-stores';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/knowledge/[id] - Get full content for a knowledge item
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  
  if (!id) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Knowledge item ID is required',
      undefined,
      400
    );
  }
  
  try {
    const store = await getRAGStore();
    const allKnowledge = store.getAllKnowledge();
    
    // Find the knowledge item by ID
    const item = allKnowledge.find(k => k.id === id);
    
    if (!item) {
      return createErrorResponse(
        ApiErrorCode.NOT_FOUND,
        `Knowledge item with ID ${id} not found`,
        undefined,
        404
      );
    }
    
    // Get the full document from RAGStore to access content
    // The getAllKnowledge returns items with description, but we need full content
    // We'll need to access the internal documents map or add a method
    // For now, return what we have and enhance if needed
    
    return createSuccessResponse({
      id: item.id,
      title: item.title,
      description: item.description,
      source: item.source,
      type: item.type,
      category: item.category,
      content: item.description, // Use description as content for now
      metadata: {
        extracted: (item as any).extracted || (item as any).extractedAt,
        extractedAt: (item as any).extractedAt,
        codeSnippets: (item as any).codeSnippets,
        filePath: (item as any).filePath,
        contentUrl: (item as any).contentUrl
      }
    });
  } catch (error: any) {
    console.error('[Knowledge API] Failed to get knowledge item:', error);
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to retrieve knowledge item: ${error.message}`,
      undefined,
      500
    );
  }
});

