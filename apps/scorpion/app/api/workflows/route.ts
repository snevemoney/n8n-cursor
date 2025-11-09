import { NextRequest, NextResponse } from 'next/server';
import { WorkflowIngester } from '@scorpion/core';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { responseCache } from '@/lib/cache';
import path from 'path';

let workflowIngester: WorkflowIngester | null = null;
const CACHE_TTL = 60000; // 60 seconds

function getWorkflowIngester(): WorkflowIngester {
  if (!workflowIngester) {
    // Resolve to monorepo root (go up from apps/scorpion)
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    // Create a compatibility wrapper for WorkflowIngester
    const mcpClient = getMCPn8nClient();
    const compatClient = {
      listWorkflows: () => mcpClient.listWorkflows(),
      getWorkflow: (id: string) => mcpClient.getWorkflow(id),
      exportWorkflow: (id: string) => mcpClient.exportWorkflow(id)
    } as any;
    workflowIngester = new WorkflowIngester(workspaceRoot, compatClient);
  }
  return workflowIngester;
}

/**
 * GET /api/workflows - Get all workflows (filesystem + n8n merged)
 * Now with 60-second caching for improved performance
 */
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cached = responseCache.get('workflows-list');
    if (cached) {
      return NextResponse.json(cached);
    }

    const ingester = getWorkflowIngester();
    
    // Use Promise.allSettled so filesystem workflows still load if n8n fails
    const [filesystemResult, n8nResult] = await Promise.allSettled([
      ingester.getWorkflows(),
      getMCPn8nClient().listWorkflows()
    ]);

    const filesystemWorkflows = filesystemResult.status === 'fulfilled' 
      ? filesystemResult.value 
      : [];
    
    let n8nWorkflows = n8nResult.status === 'fulfilled' 
      ? n8nResult.value 
      : [];
    
    // Handle n8n fetch errors gracefully
    if (n8nResult.status === 'rejected') {
      console.error('❌ n8n workflows fetch failed:', n8nResult.reason);
      n8nWorkflows = [];
    }

    // If filesystem failed, return error
    if (filesystemResult.status === 'rejected') {
      console.error('Error fetching filesystem workflows:', filesystemResult.reason);
      return NextResponse.json(
        { 
          error: 'Failed to load filesystem workflows',
          workflows: [],
          summary: {
            total: 0,
            synced: 0,
            active: 0,
            inN8n: 0,
            filesystemOnly: 0,
            n8nOnly: 0
          }
        },
        { status: 500 }
      );
    }

    // Create a map of n8n workflows by ID for quick lookup
    const n8nWorkflowMap = new Map(n8nWorkflows.map(w => [w.id, w]));
    
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
        updatedAt, // Use n8n updatedAt if available, otherwise lastSync
        source: 'filesystem' as const
      };
    });

    // Add n8n-only workflows (workflows in n8n but not in filesystem)
    const n8nOnlyWorkflows = n8nWorkflows
      .filter(n8nWf => !filesystemWorkflows.some(fsWf => fsWf.n8nId === n8nWf.id))
      .map(n8nWf => {
        // Parse trigger from n8n workflow nodes
        const triggerNode = (n8nWf as any).nodes?.find((n: any) => 
          n.type?.includes('Trigger') || n.type?.includes('trigger')
        );
        const trigger = triggerNode 
          ? triggerNode.type.replace('n8n-nodes-base.', '').replace('Trigger', '') 
          : 'Manual';
        
        return {
          id: n8nWf.id,
          name: n8nWf.name,
          path: 'n8n-only',
          trigger,
          nodes: (n8nWf as any).nodes?.length || 0,
          active: n8nWf.active || false,
          syncedToN8n: true, // It exists in n8n
          n8nId: n8nWf.id,
          lastSync: undefined,
          updatedAt: (n8nWf as any).updatedAt || (n8nWf as any).updated_at || undefined, // Last opened/updated in n8n
          source: 'n8n' as const
        };
      });

    const allWorkflows = [...mergedWorkflows, ...n8nOnlyWorkflows];

    // Calculate clear metrics
    const n8nWorkflowIds = new Set(n8nWorkflows.map(w => w.id));
    
    // Local FILES that reference n8n workflows (may have duplicates)
    const localFilesWithN8nId = mergedWorkflows.filter(w => 
      w.n8nId && n8nWorkflowIds.has(w.n8nId)
    ).length;
    
    // UNIQUE n8n workflows that have local files
    const uniqueN8nIdsInLocal = new Set(
      mergedWorkflows.filter(w => w.n8nId && n8nWorkflowIds.has(w.n8nId)).map(w => w.n8nId)
    ).size;
    
    const localOnly = mergedWorkflows.filter(w => !w.n8nId).length;
    
    const result = {
      workflows: allWorkflows,
      summary: {
        total: allWorkflows.length,                    // All unique workflows
        inN8n: n8nWorkflows.length,                   // Total in n8ncloud.tech (162)
        localFilesLinkedToN8n: localFilesWithN8nId,    // Local FILES linked to n8n (may have duplicates)
        uniqueLinkedWorkflows: uniqueN8nIdsInLocal,    // UNIQUE n8n workflows with local files
        localOnly,                                     // Local files NOT in n8n (3)
        n8nOnly: n8nOnlyWorkflows.length,             // In n8n but NOT local (11)
        active: allWorkflows.filter(w => w.active).length,
        // Legacy fields for backward compatibility
        synced: localFilesWithN8nId,
        localSyncedToN8n: localFilesWithN8nId,
        filesystemOnly: localOnly
      }
    };

    // Cache for 60 seconds
    responseCache.set('workflows-list', result, CACHE_TTL);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error getting workflows:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get workflows',
        workflows: [],
        summary: {
          total: 0,
          synced: 0,
          active: 0,
          inN8n: 0,
          filesystemOnly: 0,
          n8nOnly: 0
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/sync - Sync workflows to n8n
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json().catch(() => ({}));
    
    if (action === 'sync') {
      // Invalidate caches since workflows are being synced
      responseCache.invalidate('workflows-list');
      responseCache.invalidate('project-status');
      
      // This would trigger the sync script
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: 'Workflow sync initiated. Use the sync script for actual syncing.',
        note: 'Run: pnpm run workflows:sync'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use { "action": "sync" }' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error syncing workflows:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync workflows' },
      { status: 500 }
    );
  }
}

