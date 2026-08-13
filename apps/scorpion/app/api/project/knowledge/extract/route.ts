import { NextRequest, NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';

export const dynamic = 'force-dynamic';

/**
 * POST /api/project/knowledge/extract - Extract specific knowledge item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, source } = body;
    
    if (!id || !source) {
      return NextResponse.json(
        { error: 'Missing id or source' },
        { status: 400 }
      );
    }
    
    const orchestrator = await getOrchestrator();
    
    // Re-ingest specific source
    // For now, trigger full re-ingestion since we don't have granular extraction yet
    // TODO: Implement source-specific extraction
    await orchestrator.ingestAll();
    
    return NextResponse.json({
      success: true,
      message: 'Extraction completed. Knowledge base updated.',
      extracted: { id, source }
    });
    
  } catch (error: any) {
    console.error('Error extracting knowledge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract knowledge' },
      { status: 500 }
    );
  }
}

