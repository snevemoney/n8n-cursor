import { z } from 'zod';

export const name = 'kb.search';
export const label = 'Knowledge Search';
export const description = 'Search the knowledge base / RAG store';

export const schema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(20).default(5),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Use dynamic import to avoid build issues
    const { getRAGStore } = await import('@/lib/shared-stores');
    const store = await getRAGStore();
    const results = await store.search(args.query, args.limit);
    
    return {
      ok: true,
      hits: results.map(r => ({
        id: r.id,
        title: r.title,
        url: `/knowledge?id=${r.id}`,
        description: r.description || r.content?.substring(0, 500) || '', // Include full description or content preview
        content: r.content?.substring(0, 1000) || r.description?.substring(0, 1000) || '', // Include more content for better context
        spans: [{ 
          text: (r.content || r.description || '').slice(0, 500) // Increased from 200 to 500 for more detail
        }],
        relevance: (r as any).similarity || 0.5, // Use actual similarity score from RAG store
        source: r.source || 'knowledge-base', // Include source information
        category: r.category || r.metadata?.category, // Include category
        tags: r.tags || r.metadata?.tags || [], // Include tags
        metadata: r.metadata || {}, // Include any additional metadata
      })),
      query: args.query, // Include query for context
      totalResults: results.length, // Include count for precision
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
      hits: [],
    };
  }
}

