import { z } from 'zod';

export const name = 'project.status';
export const label = 'Get Project Status';
export const description = 'Get current project status including workflows sync, knowledge base, and issues';

export const schema = z.object({});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/project/status');
    if (!response.ok) {
      throw new Error(`Failed to fetch project status: ${response.statusText}`);
    }
    
    const data = await response.json();
    const status = data.success && data.data ? data.data : data;
    
    return {
      ok: true,
      status: {
        workflows: status.workflows || { total: 0, synced: 0, active: 0 },
        knowledge: status.knowledge || { total: 0 },
        issues: status.issues || { total: 0, critical: 0 },
        lastSync: status.lastSync,
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to get project status',
    };
  }
}

