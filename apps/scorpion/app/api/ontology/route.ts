import { NextRequest, NextResponse } from 'next/server';
import { OntologyEntity, EntityQuery, EntitySearch } from '@scorpion/core/ontology';
import { getOntologyStore } from '@/lib/shared-stores';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

const ontologyEntitySchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.any(),
  relationships: z.array(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
}).passthrough();

/**
 * POST /api/ontology - Store an entity
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const validation = await validateRequest(req, ontologyEntitySchema);
  if (!validation.success) {
    return validation.error;
  }
  
  // Convert Zod output to OntologyEntity with proper type assertion
  const entity = validation.data as unknown as OntologyEntity;

  const store = await getOntologyStore();
  await store.store(entity);

  return createSuccessResponse({ id: entity.id });
});

/**
 * GET /api/ontology - Query or search entities
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const store = await getOntologyStore();

  // Check if it's a search query
  const query = searchParams.get('q');
  if (query) {
    const search: EntitySearch = {
      query,
      types: searchParams.get('types')?.split(',') as any,
      limit: parseInt(searchParams.get('limit') || '10')
    };
    const results = await store.search(search);
    return createSuccessResponse({ results, count: results.length });
  }

  // Otherwise, regular query
  const entityQuery: EntityQuery = {
    type: searchParams.get('type') as any,
    filters: searchParams.get('filters') ? JSON.parse(searchParams.get('filters')!) : undefined,
    limit: parseInt(searchParams.get('limit') || '100'),
    offset: parseInt(searchParams.get('offset') || '0')
  };

  const results = store.query(entityQuery);
  return createSuccessResponse({ results, count: results.length });
});

