import { z } from 'zod';
import { getRAGStore } from '@/lib/shared-stores';

export const name = 'knowledge.get';
export const label = 'Get Knowledge Item';
export const description = 'Get detailed information about a specific knowledge base item by ID';

export const schema = z.object({
  id: z.string().min(1).describe('Knowledge item ID'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const ragStore = await getRAGStore();
    const allKnowledge = await ragStore.getAllKnowledge();
    const item = allKnowledge.find(k => k.id === args.id);
    
    if (!item) {
      return {
        ok: false,
        error: `Knowledge item not found: ${args.id}`,
      };
    }
    
    return {
      ok: true,
      item: {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        source: item.source,
        extractedAt: item.extractedAt,
        tags: item.tags,
        url: item.url,
        codeSnippets: item.codeSnippets,
        patterns: item.patterns,
        dependencies: item.dependencies,
        useCases: item.useCases,
        contentUrl: item.contentUrl,
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to get knowledge item',
    };
  }
}

