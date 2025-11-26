import { z } from 'zod';

export const name = 'agents.get';
export const label = 'Get Agent Details';
export const description = 'Get detailed information about a specific agent by ID';

export const schema = z.object({
  agentId: z.string().min(1).describe('Agent ID'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch(`http://localhost:3003/api/agents/${args.agentId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.statusText}`);
    }
    
    const data = await response.json();
    const agent = data.agent || data.data || data;
    
    return {
      ok: true,
      agent: {
        id: agent.id,
        codename: agent.codename,
        role: agent.role,
        isActive: agent.isActive,
        successRate: agent.successRate,
        totalRuns: agent.totalRuns,
        lastRun: agent.lastRun,
        config: agent.config || {},
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to get agent details',
    };
  }
}

