import { z } from 'zod';

export const name = 'user.research';
export const label = 'Research Engine';
export const description = 'Deep research Q&A with multi-source aggregation';

export const schema = z.object({
  question: z.string().min(1),
  sources: z.number().min(1).max(20).default(10),
  includeProsCons: z.boolean().default(true),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { executeTool } = await import('../index');
    
    const researchResult = await executeTool('research.run', {
      query: args.question,
      depth: 'deep',
      maxSites: args.sources,
    });
    
    return {
      ok: true,
      question: args.question,
      answer: researchResult.summary || 'Research completed',
      insights: [],
      prosCons: args.includeProsCons ? { pros: [], cons: [] } : undefined,
      sources: researchResult.sources || [],
      message: `Research completed with ${researchResult.sources?.length || 0} sources`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

