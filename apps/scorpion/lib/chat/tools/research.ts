import { z } from 'zod';

export const name = 'research.run';
export const label = 'Web Research';
export const description = 'Run automated web research with depth control';

export const schema = z.object({
  query: z.string().min(1),
  depth: z.enum(['shallow', 'medium', 'deep']).default('medium'),
  category: z.enum(['general', 'company-research', 'market-analysis', 'competitor-analysis', 'technical-research', 'financial-research']).default('general'),
  maxSites: z.number().min(1).max(20).default(10),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Call existing research API
    const response = await fetch('http://localhost:3003/api/research/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    
    if (!response.ok) {
      throw new Error(`Research API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      ok: true,
      sessionId: data.sessionId,
      status: 'started',
      message: `Research started with session ${data.sessionId}`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

