import { z } from 'zod';

export const name = 'workflows.get';
export const label = 'Get Workflow Details';
export const description = 'Get detailed information about a specific workflow by ID';

export const schema = z.object({
  workflowId: z.string().min(1).describe('Workflow ID'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch(`http://localhost:3003/api/workflows/${args.workflowId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.statusText}`);
    }
    
    const data = await response.json();
    const workflow = data.workflow || data.data || data;
    
    return {
      ok: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        nodes: workflow.nodes || [],
        connections: workflow.connections || {},
        settings: workflow.settings || {},
        tags: workflow.tags || [],
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to get workflow details',
    };
  }
}

