import { z } from 'zod';

export const name = 'user.purposeful-search';
export const label = 'Purposeful Search';
export const description = 'Search for responsible or sustainable options with impact ratings';

export const schema = z.object({
  query: z.string().min(1),
  focus: z.enum(['sustainable', 'responsible', 'ethical']).default('sustainable'),
  includeRatings: z.boolean().default(true),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { executeTool } = await import('../index');
    
    const researchResult = await executeTool('research.run', {
      query: `${args.query} ${args.focus} options`,
      depth: 'medium',
      maxSites: 10,
    });
    
    return {
      ok: true,
      query: args.query,
      results: researchResult.sources || [],
      impactNotes: [],
      ratings: args.includeRatings ? [] : undefined,
      message: `Found ${args.focus} options for "${args.query}"`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

