import { z } from 'zod';

export const name = 'research.start';
export const label = 'Start Research Job';
export const description = 'Start a research job with specified query and parameters';

export const schema = z.object({
  query: z.string().min(1).describe('Research query'),
  depth: z.number().optional().default(2).describe('Research depth (1-5)'),
  maxSites: z.number().optional().default(10).describe('Maximum number of sites to research'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch('http://localhost:3003/api/research/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start research: ${response.statusText}`);
    }
    
    const data = await response.json();
    const job = data.job || data.data || data;
    
    return {
      ok: true,
      job: {
        id: job.id,
        query: job.query,
        status: job.status,
        createdAt: job.createdAt,
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to start research job',
    };
  }
}

