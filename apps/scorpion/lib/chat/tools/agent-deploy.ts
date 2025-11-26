import { z } from 'zod';

export const name = 'agent.deploy';
export const label = 'Deploy Agent';
export const description = 'Deploy a new agent or update existing agent configuration';

export const schema = z.object({
  agentId: z.string().optional(),
  codename: z.string().min(1),
  role: z.string().min(1), // Accept any role string
  specialty: z.string().optional(),
  weight: z.number().min(0).max(2).optional(),
  goal: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codename: args.codename,
        role: args.role,
        specialty: args.specialty,
        weight: args.weight,
        goal: args.goal,
        status: 'active',
        capabilities: args.capabilities,
        priority: args.priority,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Agent API returned ${response.status}`);
    }
    
    const data = await response.json();
    const agentData = data.success ? data.data : data;
    
    return {
      ok: true,
      agentId: agentData.id || `agent-${Date.now()}`,
      codename: args.codename,
      status: 'deployed',
      operationsCreated: agentData.operationsCreated || 0,
      message: agentData.message || `Agent "${args.codename}" deployed successfully and integrated into council, radar, and mission control.`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

