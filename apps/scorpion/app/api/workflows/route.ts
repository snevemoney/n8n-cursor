import { NextRequest, NextResponse } from 'next/server';
import { WorkflowIngester } from '@scorpion/core';
import { N8nClient } from '@/lib/n8n-client';
import path from 'path';

let workflowIngester: WorkflowIngester | null = null;
let n8nClient: N8nClient | null = null;

function getWorkflowIngester(): WorkflowIngester {
  if (!workflowIngester) {
    const workspaceRoot = process.cwd();
    if (!n8nClient) {
      n8nClient = new N8nClient(process.env.N8N_API_KEY);
    }
    workflowIngester = new WorkflowIngester(workspaceRoot, n8nClient);
  }
  return workflowIngester;
}

function getN8nClient(): N8nClient {
  if (!n8nClient) {
    n8nClient = new N8nClient(process.env.N8N_API_KEY);
  }
  return n8nClient;
}

/**
 * GET /api/workflows - Get all workflows (filesystem + n8n)
 */
export async function GET(request: NextRequest) {
  try {
    const ingester = getWorkflowIngester();
    const workflows = await ingester.getWorkflows();

    // Get n8n workflows for comparison
    const n8nClient = getN8nClient();
    const n8nWorkflows = await n8nClient.listWorkflows();

    return NextResponse.json({
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        path: w.path,
        trigger: w.trigger,
        nodes: w.nodes,
        active: w.active,
        syncedToN8n: w.syncedToN8n,
        n8nId: w.n8nId,
        lastSync: w.lastSync
      })),
      n8nWorkflows: n8nWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        active: w.active
      })),
      summary: {
        total: workflows.length,
        synced: workflows.filter(w => w.syncedToN8n).length,
        active: workflows.filter(w => w.active).length,
        inN8n: n8nWorkflows.length
      }
    });
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

