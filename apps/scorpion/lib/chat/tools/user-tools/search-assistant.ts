import { z } from 'zod';

export const name = 'user.search';
export const label = 'Search Assistant';
export const description = 'Live web search with citations and summaries';

export const schema = z.object({
  query: z.string().min(1),
  maxResults: z.number().min(1).max(10).default(5),
  includeCitations: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Use existing research tool or implement web search
    const { executeTool } = await import('../index');
    
    const researchResult = await executeTool('research.run', {
      query: args.query,
      depth: 'shallow',
      maxSites: args.maxResults,
    });
    
    // Format results with citations
    const citations = researchResult.sources?.map((source: any, idx: number) => ({
      id: idx + 1,
      title: source.title || source.url,
      url: source.url,
      snippet: source.snippet || source.content?.slice(0, 200),
    })) || [];
    
    return {
      ok: true,
      query: args.query,
      answer: researchResult.summary || 'Search completed. See sources below.',
      citations: args.includeCitations ? citations : [],
      summary: args.includeSummary ? researchResult.summary : undefined,
      sources: researchResult.sources || [],
      message: `Found ${citations.length} sources`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

