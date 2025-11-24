import { z } from 'zod';

export const name = 'ontology.search';
export const label = 'Search Ontology';
export const description = 'Search the ontology/knowledge graph for entities and relationships';

export const schema = z.object({
  query: z.string().min(1).describe('Search query'),
  limit: z.number().optional().default(20).describe('Maximum number of results to return'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const response = await fetch(`http://localhost:3003/api/ontology?query=${encodeURIComponent(args.query)}&limit=${args.limit}`);
    if (!response.ok) {
      throw new Error(`Failed to search ontology: ${response.statusText}`);
    }
    
    const data = await response.json();
    const results = data.results || data.data || [];
    
    return {
      ok: true,
      results: results.map((item: any) => ({
        id: item.id,
        label: item.label,
        type: item.type,
        description: item.description,
        relationships: item.relationships || [],
      })),
      total: results.length,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || 'Failed to search ontology',
    };
  }
}

