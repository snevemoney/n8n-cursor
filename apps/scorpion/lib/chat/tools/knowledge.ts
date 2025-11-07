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
        spans: [{ text: r.description.slice(0, 200) }],
        relevance: r.similarity,
      })),
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
      hits: [],
    };
  }
}

