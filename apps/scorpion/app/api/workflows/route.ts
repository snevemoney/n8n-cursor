import { NextRequest, NextResponse } from 'next/server';
import { WorkflowIngester } from '@scorpion/core';
import { N8nClient } from '@/lib/n8n-client';
import { responseCache } from '@/lib/cache';
import { forceSyncN8nWorkflows } from '@/lib/auto-sync';
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
    const n8nClient = new N8nClient();
    const compatClient = {
      listWorkflows: () => Promise.resolve([]), // Return empty to skip n8n call in ingester
      getWorkflow: (id: string) => n8nClient.getWorkflow(id),
      exportWorkflow: async (id: string) => {
        const workflow = await n8nClient.getWorkflow(id);
        return workflow ? true : false;
      }
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
    const n8nClient = new N8nClient();
    
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
            setTimeout(() => reject(new Error('timeout')), 30000)
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
            setTimeout(() => reject(new Error('n8n API timeout')), 30000)
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
    
    // Try to get n8n workflows - wait up to 10 seconds for fresh data if cache is empty
    // Use cached n8n data if available, otherwise wait for fresh fetch
    let n8nWorkflows: any[] = cachedN8n || [];
    
    // If no cached data, wait for n8n fetch (up to 30 seconds for pagination)
    if (!cachedN8n || cachedN8n.length === 0) {
      try {
        console.log('🔄 Fetching workflows from n8n API...');
        console.log('🔑 API Key configured:', !!process.env.N8N_API_KEY);
        console.log('🌐 API URL:', process.env.N8N_API_URL || 'using default');
        n8nWorkflows = await Promise.race([
          n8nClient.listWorkflows(),
          new Promise<any[]>((_, reject) => 
            setTimeout(() => reject(new Error('n8n API timeout')), 30000)
          )
        ]);
        // Cache successful n8n fetch for 30 seconds
        if (Array.isArray(n8nWorkflows)) {
          responseCache.set('n8n-workflows-list', n8nWorkflows, 30000);
          console.log(`✅ Fetched ${n8nWorkflows.length} workflows from n8n API`);
        } else {
          console.warn('⚠️ n8n API returned non-array:', typeof n8nWorkflows);
          n8nWorkflows = [];
        }
      } catch (error) {
        const errorMessage = error?.message || String(error);
        console.error('❌ n8n fetch failed:', errorMessage);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('❌ Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        // Continue with empty array if fetch fails
        n8nWorkflows = [];
      }
    } else {
      // Start background refresh for next time (non-blocking)
    Promise.race([
      n8nClient.listWorkflows(),
      new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error('n8n API timeout')), 30000)
      )
    ]).then((workflows) => {
      // Cache successful n8n fetch for 30 seconds
      if (Array.isArray(workflows)) {
        responseCache.set('n8n-workflows-list', workflows, 30000);
      }
    }).catch((error) => {
        // Silently handle errors - we already have cached data
      const errorMessage = error?.message || String(error);
      if (!errorMessage.includes('timeout') && !errorMessage.includes('Circuit breaker')) {
        console.error('❌ Background n8n fetch failed:', errorMessage);
      }
    });
    }

    // PRIORITIZE CLOUD WORKFLOWS: Start with cloud workflows, then add local-only (deduplicated)
    // Create maps for quick lookup by ID and name
    const n8nWorkflowMapById = new Map(n8nWorkflows.map((w: any) => [w.id, w]));
    const n8nWorkflowMapByName = new Map(n8nWorkflows.map((w: any) => [w.name.toLowerCase().trim(), w]));
    
    // Create sets for deduplication
    const filesystemN8nIds = new Set(filesystemWorkflows.map(fsWf => fsWf.n8nId).filter(Boolean));
    const cloudWorkflowNames = new Set(n8nWorkflows.map((w: any) => w.name.toLowerCase().trim()));
    
    // Start with ALL cloud workflows (prioritize cloud)
    const cloudWorkflows = n8nWorkflows.map((n8nWf: any) => {
        let trigger = 'Manual';
        if (n8nWf.nodes?.length > 0) {
          const triggerNode = n8nWf.nodes.find((n: any) => 
            n.type?.includes('Trigger') || n.type?.includes('trigger')
          );
          if (triggerNode) {
            trigger = triggerNode.type.replace('n8n-nodes-base.', '').replace('Trigger', '');
          }
        }
      
      // Check if this cloud workflow has a local file (by ID or name)
      const hasLocalFileById = filesystemN8nIds.has(n8nWf.id);
      const hasLocalFileByName = filesystemWorkflows.some(fsWf => 
        fsWf.name.toLowerCase().trim() === n8nWf.name.toLowerCase().trim()
      );
      const hasLocalFile = hasLocalFileById || hasLocalFileByName;
        
        return {
          id: n8nWf.id,
          name: n8nWf.name,
        path: hasLocalFile ? 'cloud-and-local' : 'n8n-only',
          trigger,
          nodes: n8nWf.nodes?.length || 0,
        active: n8nWf.active || false, // Only cloud active status matters
          syncedToN8n: true,
          n8nId: n8nWf.id,
          lastSync: undefined,
          updatedAt: n8nWf.updatedAt || n8nWf.updated_at || undefined,
        source: hasLocalFile ? 'both' as const : 'n8n' as const
        };
      });

    // Add ONLY local workflows that don't exist in cloud (deduplicate by ID or name)
    const localOnlyWorkflows = filesystemWorkflows
      .filter(w => {
        // Exclude if it has an n8nId that matches a cloud workflow
        if (w.n8nId && n8nWorkflowMapById.has(w.n8nId)) {
          return false;
        }
        // Exclude if the name matches a cloud workflow (case-insensitive)
        const normalizedName = w.name.toLowerCase().trim();
        if (cloudWorkflowNames.has(normalizedName)) {
          return false;
        }
        return true; // This is a unique local workflow
      })
      .map(w => ({
        id: w.id,
        name: w.name,
        path: w.path,
        trigger: w.trigger,
        nodes: w.nodes,
        active: false, // Local workflows don't count as active (only cloud matters)
        syncedToN8n: false,
        n8nId: w.n8nId,
        lastSync: w.lastSync,
        updatedAt: w.lastSync || undefined,
        source: 'filesystem' as const
      }));

    // Combine: cloud workflows first (prioritized), then local-only (unique only)
    const allWorkflows = [...cloudWorkflows, ...localOnlyWorkflows];

    // Calculate metrics - prioritize cloud workflows
    const n8nWorkflowIds = new Set(n8nWorkflows.map((w: any) => w.id));
    const localFilesWithN8nId = filesystemWorkflows.filter(w => 
      w.n8nId && n8nWorkflowIds.has(w.n8nId)
    ).length;
    const uniqueN8nIdsInLocal = new Set(
      filesystemWorkflows.filter(w => w.n8nId && n8nWorkflowIds.has(w.n8nId)).map(w => w.n8nId)
    ).size;
    const localOnly = localOnlyWorkflows.length;
    
    // Only count active workflows from cloud (local workflows don't count as active)
    const activeCloudWorkflows = cloudWorkflows.filter(w => w.active).length;
    
    const result = {
      workflows: allWorkflows,
      summary: {
        total: allWorkflows.length,
        inN8n: n8nWorkflows.length,
        localFilesLinkedToN8n: localFilesWithN8nId,
        uniqueLinkedWorkflows: uniqueN8nIdsInLocal,
        localOnly,
        n8nOnly: cloudWorkflows.filter(w => w.source === 'n8n').length,
        active: activeCloudWorkflows, // Only cloud active workflows
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
    responseCache.invalidate('n8n-workflows-list');
    responseCache.invalidate('filesystem-workflows-list');
    
    // Trigger the sync in the background (don't wait for it)
    forceSyncN8nWorkflows().catch((error) => {
      console.error('❌ Error during force sync:', error);
    });
    
    return createSuccessResponse({
      message: 'Workflow sync initiated',
      note: 'Syncing workflows from n8ncloud.tech. This may take a few moments.'
    });
  }

  return createErrorResponse(
    ApiErrorCode.INVALID_REQUEST,
    'Invalid action. Use { "action": "sync" }',
    undefined,
    400
  );
});

