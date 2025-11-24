import { z } from 'zod';

export const name = 'llm.models.compare';
export const label = 'Compare LLM Models';
export const description = 'Compare performance metrics of different LLM models';

export const schema = z.object({
  modelIds: z.array(z.string()).optional().describe('Specific model IDs to compare (if not provided, compares all)'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const url = args.modelIds && args.modelIds.length > 0
      ? `http://localhost:3003/api/llm/models/compare?ids=${args.modelIds.join(',')}`
      : 'http://localhost:3003/api/llm/models/compare';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to compare models: ${response.statusText}`);
    }
    
    const data = await response.json();
    const comparison = data.comparison || data.data || data;
    
    return {
      ok: true,
      comparison: {
        models: comparison.models || [],
        metrics: comparison.metrics || {},
        summary: comparison.summary,
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to compare LLM models',
    };
  }
}

