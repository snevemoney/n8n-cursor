import { z } from 'zod';
import { getRAGStore } from '@/lib/shared-stores';

export const name = 'knowledge.list';
export const label = 'List Knowledge Items';
export const description = 'List knowledge base items with optional filtering by category, type, or source';

export const schema = z.object({
  limit: z.number().optional().default(50).describe('Maximum number of items to return'),
  category: z.string().optional().describe('Filter by category'),
  type: z.string().optional().describe('Filter by type'),
  source: z.string().optional().describe('Filter by source'),
  search: z.string().optional().describe('Search query to filter items'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const ragStore = await getRAGStore();
    const allKnowledge = await ragStore.getAllKnowledge();
    
    let filtered = allKnowledge;
    
    // Apply filters
    if (args.category) {
      filtered = filtered.filter(k => k.category === args.category);
      }
    if (args.type) {
      filtered = filtered.filter(k => k.type === args.type);
    }
    if (args.source) {
      filtered = filtered.filter(k => k.source === args.source);
    }
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filtered = filtered.filter(k => 
        k.title?.toLowerCase().includes(searchLower) ||
        k.description?.toLowerCase().includes(searchLower) ||
        k.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by extractedAt (most recent first)
    filtered.sort((a, b) => 
      new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime()
    );
    
    // Apply limit
    const items = filtered.slice(0, args.limit);
    
    return {
      ok: true,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description?.substring(0, 200),
        category: item.category,
        type: item.type,
        source: item.source,
        extractedAt: item.extractedAt,
        tags: item.tags,
        url: item.url,
      })),
      total: filtered.length,
      returned: items.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to list knowledge items',
    };
  }
}
