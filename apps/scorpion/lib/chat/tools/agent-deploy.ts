import { z } from 'zod';

export const name = 'agent.deploy';
export const label = 'Deploy Agent';
export const description = 'Deploy a new agent or update existing agent configuration';

export const schema = z.object({
  agentId: z.string().optional(),
  codename: z.string().min(1),
  role: z.enum(['analyst', 'executor', 'monitor', 'researcher', 'coordinator']),
  capabilities: z.array(z.string()),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codename: args.codename,
        role: args.role,
        status: 'active',
        capabilities: args.capabilities,
        priority: args.priority,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Agent API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      ok: true,
      agentId: data.id || `agent-${Date.now()}`,
      codename: args.codename,
      status: 'deployed',
      message: `Agent "${args.codename}" deployed successfully`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

