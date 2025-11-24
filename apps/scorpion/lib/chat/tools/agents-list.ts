import { z } from 'zod';

export const name = 'agents.list';
export const label = 'List Agents';
export const description = 'List all available agents with their status and metadata';

export const schema = z.object({
  activeOnly: z.boolean().optional().default(false).describe('Only return active agents'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/agents');
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }
    
    const data = await response.json();
    const agents = data.agents || [];
    
    let filtered = agents;
    if (args.activeOnly) {
      filtered = agents.filter((agent: any) => agent.isActive !== false);
    }
    
    return {
      ok: true,
      agents: filtered.map((agent: any) => ({
        id: agent.id,
        codename: agent.codename,
        role: agent.role,
        isActive: agent.isActive,
        successRate: agent.successRate,
        totalRuns: agent.totalRuns,
        lastRun: agent.lastRun,
      })),
      total: filtered.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to list agents',
    };
  }
}

