import { NextRequest, NextResponse } from 'next/server';
import { WorkflowIngester } from '@scorpion/core';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { responseCache } from '@/lib/cache';
import path from 'path';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

let workflowIngester: WorkflowIngester | null = null;
const CACHE_TTL = 30000; // 30 seconds (reduced for faster updates)
const FILESYSTEM_CACHE_TTL = 60000; // 60 seconds for filesystem (more stable)

function getWorkflowIngester(): WorkflowIngester {
  if (!workflowIngester) {
    // Resolve to monorepo root (go up from apps/scorpion)
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    // Create a compatibility wrapper for WorkflowIngester
    // Pass null to prevent WorkflowIngester from calling n8n (we handle it separately)
    const compatClient = {
      listWorkflows: () => Promise.resolve([]), // Return empty to skip n8n call in ingester
      getWorkflow: (id: string) => getMCPn8nClient().getWorkflow(id),
      exportWorkflow: (id: string) => getMCPn8nClient().exportWorkflow(id)
    } as any;
    workflowIngester = new WorkflowIngester(workspaceRoot, compatClient);
  }
  return workflowIngester;
}

/**
 * GET /api/workflows - Get all workflows (filesystem + n8n merged)
 * Progressive loading: Returns filesystem workflows immediately, then updates with n8n data
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
    // Check for query param to force refresh or get n8n-only data
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    const n8nOnly = url.searchParams.get('n8n-only') === 'true';
    
    // Check cache first (unless forcing refresh)
    if (!forceRefresh && !n8nOnly) {
      const cached = responseCache.get('workflows-list');
      if (cached) {
        return createSuccessResponse(cached);
      }
    }

    const ingester = getWorkflowIngester();
    const n8nClient = getMCPn8nClient();
    
    // PROGRESSIVE LOADING: Use cached filesystem workflows immediately
    // Start background refresh if needed, but don't wait
    let filesystemWorkflows: any[] = responseCache.get('filesystem-workflows-list') || [];
    
    // Start background refresh of filesystem workflows if cache is empty or forcing refresh
    // This runs in parallel and doesn't block the response
    if (filesystemWorkflows.length === 0 || forceRefresh) {
      // Fire and forget - don't await this
      Promise.race([
        ingester.getWorkflows(),
        new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error('Filesystem workflow loading timeout')), 3000)
        )
      ]).then((workflows) => {
        if (Array.isArray(workflows) && workflows.length > 0) {
          responseCache.set('filesystem-workflows-list', workflows, FILESYSTEM_CACHE_TTL);
        }
      }).catch((error) => {
        // Silently handle - we'll use cached data or empty array
        console.warn('Background filesystem fetch failed:', error?.message || error);
      });
    }
    
    // If n8n-only requested and no filesystem data, we need to wait
    if (n8nOnly && filesystemWorkflows.length === 0) {
      try {
        filesystemWorkflows = await Promise.race([
          ingester.getWorkflows(),
          new Promise<any[]>((_, reject) => 
            setTimeout(() => reject(new Error('Filesystem workflow loading timeout')), 2000)
          )
        ]).catch(() => []);
      } catch (error) {
        return createErrorResponse(
          ApiErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to load filesystem workflows',
          error,
          500
        );
      }
    }
    
    // CRITICAL: Return immediately if no cached data - don't wait for anything
    // This ensures sub-second response times even on first load
    const cachedN8n = responseCache.get('n8n-workflows-list');
    if (filesystemWorkflows.length === 0 && !cachedN8n) {
      // Return minimal response immediately (sub-100ms response time)
      const minimalResult = {
        workflows: [],
        summary: {
          total: 0,
          inN8n: 0,
          localFilesLinkedToN8n: 0,
          uniqueLinkedWorkflows: 0,
          localOnly: 0,
          n8nOnly: 0,
          active: 0,
          synced: 0,
          localSyncedToN8n: 0,
          filesystemOnly: 0
        },
        n8nDataStale: true,
        loading: true // Signal to frontend that data is loading
      };
      
      // Background fetch - fire and forget, doesn't block response
      Promise.all([
        Promise.race([
          ingester.getWorkflows(),
          new Promise<any[]>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 5000)
          )
        ]).catch(() => []),
        Promise.race([
          n8nClient.listWorkflows(),
          new Promise<any[]>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 2000)
          )
        ]).catch(() => [])
      ]).then(([fsWorkflows, n8nWorkflows]) => {
        // Cache both results for next request
        if (Array.isArray(fsWorkflows) && fsWorkflows.length > 0) {
          responseCache.set('filesystem-workflows-list', fsWorkflows, FILESYSTEM_CACHE_TTL);
        }
        if (Array.isArray(n8nWorkflows)) {
          responseCache.set('n8n-workflows-list', n8nWorkflows, 30000);
        }
      }).catch(() => {
        // Silently handle errors - background operation
      });
      
      // Return immediately - don't await anything
      return createSuccessResponse(minimalResult);
    }
    
    // If n8n-only requested, fetch n8n workflows with timeout
    if (n8nOnly) {
      try {
        const n8nWorkflows = await Promise.race([
          n8nClient.listWorkflows(),
          new Promise<any[]>((_, reject) => 
            setTimeout(() => reject(new Error('n8n API timeout')), 2000)
          )
        ]).catch(() => []);
        
        return createSuccessResponse({
          workflows: n8nWorkflows.map((w: any) => ({
            id: w.id,
            name: w.name,
            path: 'n8n-only',
            trigger: w.nodes?.find((n: any) => n.type?.includes('Trigger'))?.type?.replace('n8n-nodes-base.', '').replace('Trigger', '') || 'Manual',
            nodes: w.nodes?.length || 0,
            active: w.active || false,
            syncedToN8n: true,
            n8nId: w.id,
            updatedAt: w.updatedAt || w.updated_at,
            source: 'n8n' as const
          })),
          summary: {
            total: n8nWorkflows.length,
            inN8n: n8nWorkflows.length,
            active: n8nWorkflows.filter((w: any) => w.active).length
          },
          n8nOnly: true
        });
      } catch (error) {
        return createErrorResponse(
          ApiErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to load n8n workflows',
          error,
          500
        );
      }
    }
    
    // Start n8n call in background (don't wait for it)
    // Use cached n8n data if available, otherwise start fresh fetch
    // Reuse cachedN8n from above - it's still in scope
    let n8nWorkflows: any[] = cachedN8n || [];
    
    // Start background fetch for n8n workflows (non-blocking)
    Promise.race([
      n8nClient.listWorkflows(),
      new Promise<any[]>((_, reject) => 
        setTimeout(() => reject(new Error('n8n API timeout')), 2000)
      )
    ]).then((workflows) => {
      // Cache successful n8n fetch for 30 seconds
      if (Array.isArray(workflows)) {
        responseCache.set('n8n-workflows-list', workflows, 30000);
      }
    }).catch((error) => {
      // Silently handle errors - we already have filesystem data
      const errorMessage = error?.message || String(error);
      if (!errorMessage.includes('timeout') && !errorMessage.includes('Circuit breaker')) {
        console.error('❌ Background n8n fetch failed:', errorMessage);
      }
    });

    // Merge filesystem workflows with cached n8n data (if available)
    const n8nWorkflowMap = new Map(n8nWorkflows.map((w: any) => [w.id, w]));
    
    // Merge: Start with filesystem workflows
    const mergedWorkflows = filesystemWorkflows.map(w => {
      // If workflow has n8nId, get updatedAt from matching n8n workflow
      const n8nWf = w.n8nId ? n8nWorkflowMap.get(w.n8nId) : null;
      const updatedAt = n8nWf 
        ? ((n8nWf as any).updatedAt || (n8nWf as any).updated_at || undefined)
        : (w.lastSync || undefined);
      
      return {
        id: w.id,
        name: w.name,
        path: w.path,
        trigger: w.trigger,
        nodes: w.nodes,
        active: w.active,
        syncedToN8n: w.syncedToN8n,
        n8nId: w.n8nId,
        lastSync: w.lastSync,
        updatedAt,
        source: 'filesystem' as const
      };
    });

    // Add n8n-only workflows (workflows in n8n but not in filesystem)
    const filesystemN8nIds = new Set(filesystemWorkflows.map(fsWf => fsWf.n8nId).filter(Boolean));
    const n8nOnlyWorkflows = n8nWorkflows
      .filter((n8nWf: any) => !filesystemN8nIds.has(n8nWf.id))
      .map((n8nWf: any) => {
        let trigger = 'Manual';
        if (n8nWf.nodes?.length > 0) {
          const triggerNode = n8nWf.nodes.find((n: any) => 
            n.type?.includes('Trigger') || n.type?.includes('trigger')
          );
          if (triggerNode) {
            trigger = triggerNode.type.replace('n8n-nodes-base.', '').replace('Trigger', '');
          }
        }
        
        return {
          id: n8nWf.id,
          name: n8nWf.name,
          path: 'n8n-only',
          trigger,
          nodes: n8nWf.nodes?.length || 0,
          active: n8nWf.active || false,
          syncedToN8n: true,
          n8nId: n8nWf.id,
          lastSync: undefined,
          updatedAt: n8nWf.updatedAt || n8nWf.updated_at || undefined,
          source: 'n8n' as const
        };
      });

    const allWorkflows = [...mergedWorkflows, ...n8nOnlyWorkflows];

    // Calculate metrics
    const n8nWorkflowIds = new Set(n8nWorkflows.map((w: any) => w.id));
    const localFilesWithN8nId = mergedWorkflows.filter(w => 
      w.n8nId && n8nWorkflowIds.has(w.n8nId)
    ).length;
    const uniqueN8nIdsInLocal = new Set(
      mergedWorkflows.filter(w => w.n8nId && n8nWorkflowIds.has(w.n8nId)).map(w => w.n8nId)
    ).size;
    const localOnly = mergedWorkflows.filter(w => !w.n8nId).length;
    
    const result = {
      workflows: allWorkflows,
      summary: {
        total: allWorkflows.length,
        inN8n: n8nWorkflows.length,
        localFilesLinkedToN8n: localFilesWithN8nId,
        uniqueLinkedWorkflows: uniqueN8nIdsInLocal,
        localOnly,
        n8nOnly: n8nOnlyWorkflows.length,
        active: allWorkflows.filter(w => w.active).length,
        synced: localFilesWithN8nId,
        localSyncedToN8n: localFilesWithN8nId,
        filesystemOnly: localOnly
      },
      // Indicate if n8n data is from cache (may be stale)
      n8nDataStale: !cachedN8n
    };

    // Cache for 30 seconds (shorter TTL since we're doing progressive loading)
    responseCache.set('workflows-list', result, CACHE_TTL);

    return createSuccessResponse(result);
});

const syncSchema = z.object({
  action: z.literal('sync'),
});

/**
 * POST /api/workflows/sync - Sync workflows to n8n
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, syncSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { action } = validation.data;
  
  if (action === 'sync') {
    // Invalidate caches since workflows are being synced
    responseCache.invalidate('workflows-list');
    responseCache.invalidate('project-status');
    
    // This would trigger the sync script
    // For now, just return success
    return createSuccessResponse({
      message: 'Workflow sync initiated. Use the sync script for actual syncing.',
      note: 'Run: pnpm run workflows:sync'
    });
  }

  return createErrorResponse(
    ApiErrorCode.INVALID_REQUEST,
    'Invalid action. Use { "action": "sync" }',
    undefined,
    400
  );
});

