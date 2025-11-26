import { NextRequest, NextResponse } from 'next/server';
import { N8nClient } from '@/lib/n8n-client';
import { WorkflowIngester } from '@scorpion/core';
import path from 'path';
import fs from 'fs/promises';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const workflowId = params.id;
  const n8nClient = new N8nClient();
  
  // Try to get from n8n first (most recent update)
  try {
    const n8nWorkflow = await n8nClient.getWorkflow(workflowId);
    if (n8nWorkflow) {
      return createSuccessResponse({
        workflow: {
          id: n8nWorkflow.id,
          name: n8nWorkflow.name,
          nodes: n8nWorkflow.nodes || [],
          connections: n8nWorkflow.connections || {},
          active: n8nWorkflow.active || false,
          n8nId: n8nWorkflow.id,
          updatedAt: (n8nWorkflow as any).updatedAt || (n8nWorkflow as any).updated_at
        }
      });
    }
  } catch (error) {
    console.error('Error fetching workflow from n8n:', error);
  }
  
  // Fallback to filesystem if n8n fetch fails
  try {
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    const ingester = new WorkflowIngester(workspaceRoot);
    const workflows = await ingester.getWorkflows();
    const workflow = workflows.find(w => w.id === workflowId || w.n8nId === workflowId);
    
    if (workflow && workflow.path && workflow.path !== 'n8n-only') {
      const filePath = path.join(workspaceRoot, workflow.path);
      const content = await fs.readFile(filePath, 'utf-8');
      const workflowData = JSON.parse(content);
      
      return createSuccessResponse({
        workflow: {
          id: workflow.id,
          name: workflow.name,
          nodes: workflowData.nodes || [],
          connections: workflowData.connections || {},
          active: workflow.active,
          n8nId: workflow.n8nId
        }
      });
    }
  } catch (error) {
    console.error('Error fetching workflow from filesystem:', error);
  }
  
  return createErrorResponse(
    ApiErrorCode.NOT_FOUND,
    'Workflow not found',
    { workflowId },
    404
  );
});

