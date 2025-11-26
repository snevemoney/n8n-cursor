import { NextRequest, NextResponse } from 'next/server';
import { ProjectKnowledgeOrchestrator, RAGStore } from '@scorpion/core';
import { getOrchestrator, getRAGStore } from '@/lib/shared-stores';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

// Increase timeout for ingestion endpoint (5 minutes)
export const maxDuration = 300;

async function getOrchestratorInstance(): Promise<ProjectKnowledgeOrchestrator> {
  return await getOrchestrator();
}

/**
 * POST /api/project/knowledge/ingest - Ingest all project knowledge
 * Note: maxDuration is set to 300 seconds (5 minutes) to allow for long-running ingestion
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const startTime = Date.now();
  console.log('[POST /api/project/knowledge] Starting ingestion...');
  
  try {
  const orchestrator = await getOrchestratorInstance();
    console.log('[POST /api/project/knowledge] Orchestrator ready, starting ingestAll...');
    
  const result = await orchestrator.ingestAll();
    const duration = Date.now() - startTime;
    
    console.log(`[POST /api/project/knowledge] Ingestion completed in ${duration}ms, ingested ${result.knowledge.length} items`);

  return createSuccessResponse({
    ingested: result.knowledge.length,
    summary: {
      workspace: result.workspace ? Object.keys(result.workspace.apps || {}).length : 0,
      databases: result.databases.length,
      workflows: result.workflows.length,
      services: result.services.length,
      status: result.status
    },
    ingestedAt: result.ingestedAt
  });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[POST /api/project/knowledge] Ingestion failed after ${duration}ms:`, error);
    throw error; // Let withErrorHandling handle it
  }
});

/**
 * GET /api/project/knowledge - Get project knowledge summary
 */
export const GET = withErrorHandling(async () => {
  // Don't wait - return empty if not ready
  let ragStore: RAGStore | null = null;
  try {
    ragStore = await Promise.race([
      getRAGStore(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)) // 1s timeout
    ]);
  } catch {
    // Return empty response instead of blocking
    return createSuccessResponse({ knowledge: [], summary: {} });
  }
  
  // Continue only if store is ready
  if (!ragStore) {
    return createSuccessResponse({ knowledge: [], summary: {} });
  }
  
  const startTime = Date.now();
  console.log('[GET /api/project/knowledge] Starting request...');
  
  try {
    // Try to get RAG store with timeout to prevent hanging
    let allKnowledge: any[] = [];
    
    try {
      console.log('[GET /api/project/knowledge] Getting all knowledge...');
      allKnowledge = ragStore.getAllKnowledge();
      console.log(`[GET /api/project/knowledge] Found ${allKnowledge.length} knowledge items`);
    } catch (ragStoreError) {
      console.warn('[GET /api/project/knowledge] RAG store failed, returning empty knowledge:', ragStoreError);
      // Continue with empty knowledge array
      allKnowledge = [];
    }
    
    // Try to get summary with timeout
    let summary = {};
    try {
      const summaryPromise = (async () => {
        console.log('[GET /api/project/knowledge] Getting orchestrator for summary...');
        const orchestrator = await getOrchestratorInstance();
        console.log('[GET /api/project/knowledge] Getting summary...');
        return await orchestrator.getSummary();
      })();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Summary timeout')), 10000); // Increased from 3s to 10s
      });
      
      summary = await Promise.race([summaryPromise, timeoutPromise]) as any;
    } catch (summaryError) {
      console.warn('[GET /api/project/knowledge] Summary failed, continuing without it:', summaryError);
      // Continue without summary
    }
    
    const duration = Date.now() - startTime;
    console.log(`[GET /api/project/knowledge] Completed in ${duration}ms`);

  return createSuccessResponse({
    summary,
      knowledge: allKnowledge.map(k => ({
      id: k.id,
        source: k.source || 'unknown',
        type: k.type || 'unknown',
        category: k.category || 'uncategorized',
        title: k.title || k.id,
        description: k.description || '',
        tags: k.tags || [],
        extracted: k.description ? k.description.substring(0, 200) + (k.description.length > 200 ? '...' : '') : '',
        // Include file path information
        filePath: k.filePath,
        contentUrl: k.contentUrl || k.filePath,
        codeSnippets: k.codeSnippets || []
      }))
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[GET /api/project/knowledge] Error after ${duration}ms:`, error);
    
    // Return empty knowledge array instead of failing
    return createSuccessResponse({
      summary: {},
      knowledge: []
    });
  }
});

