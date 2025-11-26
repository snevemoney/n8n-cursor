import { z } from 'zod';

export const name = 'llm.experiments.list';
export const label = 'List LLM Experiments';
export const description = 'List LLM training experiments with optional filtering';

export const schema = z.object({
  limit: z.number().optional().default(50).describe('Maximum number of experiments to return'),
  status: z.enum(['running', 'completed', 'failed', 'pending']).optional().describe('Filter by status'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/llm/experiments');
    if (!response.ok) {
      throw new Error(`Failed to fetch experiments: ${response.statusText}`);
    }
    
    const data = await response.json();
    const experiments = data.experiments || data.data?.experiments || [];
    
    let filtered = experiments;
    if (args.status) {
      filtered = experiments.filter((exp: any) => exp.status === args.status);
    }
    
    // Sort by createdAt (most recent first)
    filtered.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply limit
    filtered = filtered.slice(0, args.limit);
    
    return {
      ok: true,
      experiments: filtered.map((exp: any) => ({
        id: exp.id,
        name: exp.name,
        status: exp.status,
        model: exp.model,
        createdAt: exp.createdAt,
        completedAt: exp.completedAt,
        metrics: exp.metrics,
      })),
      total: experiments.length,
      returned: filtered.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to list LLM experiments',
    };
  }
}

