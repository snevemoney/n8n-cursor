import { z } from 'zod';

export const name = 'stats.get';
export const label = 'Get System Stats';
export const description = 'Get current system statistics including projects, agents, workflows, knowledge, and operations';

export const schema = z.object({});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/stats');
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    const stats = data.success && data.data ? data.data : data;
    
    return {
      ok: true,
      stats: {
        projects: stats.projects || { total: 0, active: 0 },
        agents: stats.agents || { total: 0, active: 0 },
        workflows: stats.workflows || { total: 0, active: 0 },
        knowledge: stats.knowledge || { total: 0 },
        operations: stats.operations || { total: 0, running: 0, completed: 0, failed: 0 },
        system: stats.system || { health: 'unknown' },
        llmExperiments: stats.llmExperiments,
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to get system stats',
    };
  }
}

