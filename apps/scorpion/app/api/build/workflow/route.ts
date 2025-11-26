import { NextRequest, NextResponse } from 'next/server';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

const workflowCreateSchema = z.object({
  name: z.string().min(1),
  plan: z.any(), // Build plan object
  description: z.string().optional(),
});

/**
 * POST /api/build/workflow - Create n8n workflow from build plan
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, workflowCreateSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { name, plan, description } = validation.data;
  
  try {
    const n8nClient = getMCPn8nClient();
    
    if (!n8nClient.isConfigured()) {
      return createErrorResponse(
        ApiErrorCode.INVALID_REQUEST,
        'n8n API is not configured. Please set N8N_API_KEY in environment variables.',
        undefined,
        400
      );
    }
    
    // Convert build plan to n8n workflow structure
    // Create a simple workflow with a code node that contains the plan
    const workflow = {
      name: name,
      active: false, // Don't activate automatically
      nodes: [
        {
          name: 'Start',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [250, 300],
          parameters: {}
        },
        {
          name: 'Build Plan',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [450, 300],
          parameters: {
            mode: 'runOnceForAllItems',
            jsCode: `// Generated Build Plan from Scorpion\n// Created: ${new Date().toISOString()}\n\nconst plan = ${JSON.stringify(plan, null, 2)};\n\n// Plan structure:\n// - target: ${plan.target || 'N/A'}\n// - features: ${plan.features?.length || 0} features\n// - steps: ${plan.steps?.length || 0} steps\n\nreturn [{\n  json: {\n    plan,\n    target: plan.target,\n    features: plan.features || [],\n    steps: plan.steps || [],\n    requirements: plan.requirements || '',\n    createdAt: new Date().toISOString()\n  }\n}];`
          }
        }
      ],
      connections: {
        'Start': {
          main: [[{ node: 'Build Plan', type: 'main', index: 0 }]]
        }
      },
      settings: {
        executionOrder: 'v1'
      },
      tags: ['scorpion', 'build-plan', 'generated']
    };
    
    // Add description if provided
    if (description) {
      (workflow as any).notes = description;
    }
    
    // Create workflow in n8n
    const created = await n8nClient.createWorkflow(workflow);
    
    if (!created) {
      return createErrorResponse(
        ApiErrorCode.INTERNAL_ERROR,
        'Failed to create workflow in n8n',
        undefined,
        500
      );
    }
    
    return createSuccessResponse({
      workflowId: created.id,
      workflowName: created.name,
      message: `Workflow "${created.name}" created successfully in n8n`,
      workflow: created
    });
  } catch (error: any) {
    console.error('[Build Workflow API] Failed to create workflow:', error);
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to create workflow: ${error.message}`,
      undefined,
      500
    );
  }
});

