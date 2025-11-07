import { NextRequest, NextResponse } from 'next/server';
import { WorkflowIngester } from '@scorpion/core';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { responseCache } from '@/lib/cache';
import path from 'path';

let workflowIngester: WorkflowIngester | null = null;
const CACHE_TTL = 60000; // 60 seconds

function getWorkflowIngester(): WorkflowIngester {
  if (!workflowIngester) {
    const workspaceRoot = process.cwd();
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
    
    // Fetch filesystem and n8n workflows in parallel for better performance
    const [filesystemWorkflows, n8nWorkflows] = await Promise.all([
      ingester.getWorkflows(),
      getMCPn8nClient().listWorkflows()
    ]);

    // Merge: Start with filesystem workflows
    const mergedWorkflows = filesystemWorkflows.map(w => ({
      id: w.id,
      name: w.name,
      path: w.path,
      trigger: w.trigger,
      nodes: w.nodes,
      active: w.active,
      syncedToN8n: w.syncedToN8n,
      n8nId: w.n8nId,
      lastSync: w.lastSync,
      source: 'filesystem' as const
    }));

    // Add n8n-only workflows (workflows in n8n but not in filesystem)
    const n8nOnlyWorkflows = n8nWorkflows
      .filter(n8nWf => !filesystemWorkflows.some(fsWf => fsWf.n8nId === n8nWf.id))
      .map(n8nWf => ({
        id: n8nWf.id,
        name: n8nWf.name,
        path: 'n8n-only',
        trigger: 'Unknown',
        nodes: (n8nWf as any).nodes?.length || 0,
        active: n8nWf.active || false,
        syncedToN8n: true, // It exists in n8n
        n8nId: n8nWf.id,
        lastSync: undefined,
        source: 'n8n' as const
      }));

    const allWorkflows = [...mergedWorkflows, ...n8nOnlyWorkflows];

    const result = {
      workflows: allWorkflows,
      summary: {
        total: allWorkflows.length,
        synced: mergedWorkflows.filter(w => w.syncedToN8n).length,
        active: allWorkflows.filter(w => w.active).length,
        inN8n: n8nWorkflows.length,
        filesystemOnly: mergedWorkflows.filter(w => !w.syncedToN8n).length,
        n8nOnly: n8nOnlyWorkflows.length
      }
    };

    // Cache for 60 seconds
    responseCache.set('workflows-list', result, CACHE_TTL);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error getting workflows:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get workflows' },
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

