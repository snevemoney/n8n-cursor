import { z } from 'zod';

export const name = 'workflows.list';
export const label = 'List Workflows';
export const description = 'List all n8n workflows with their status and metadata';

export const schema = z.object({
  activeOnly: z.boolean().optional().default(false).describe('Only return active workflows'),
  limit: z.number().optional().default(100).describe('Maximum number of workflows to return'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/workflows');
    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }
    
    const data = await response.json();
    const workflows = data.workflows || [];
    
    let filtered = workflows;
    if (args.activeOnly) {
      filtered = workflows.filter((wf: any) => wf.active === true);
    }
    
    // Apply limit
    filtered = filtered.slice(0, args.limit);
    
    return {
      ok: true,
      workflows: filtered.map((wf: any) => ({
        id: wf.id,
        name: wf.name,
        active: wf.active,
        nodes: wf.nodes?.length || 0,
        connections: wf.connections || {},
        createdAt: wf.createdAt,
        updatedAt: wf.updatedAt,
        tags: wf.tags || [],
      })),
      total: workflows.length,
      returned: filtered.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to list workflows',
    };
  }
}

