import { NextRequest, NextResponse } from 'next/server';
import { OntologyStore } from '@scorpion/core/ontology';
import { RAGStore } from '@scorpion/core/rag';
import { OntologyEntity, EntityQuery, EntitySearch } from '@scorpion/core/ontology';

let ontologyStore: OntologyStore | null = null;

function getOntologyStore(): OntologyStore {
  if (!ontologyStore) {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ragStore = new RAGStore(ollamaUrl);
    ontologyStore = new OntologyStore(ragStore);
  }
  return ontologyStore;
}

/**
 * POST /api/ontology - Store an entity
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entity: OntologyEntity = body;

    // Validate required fields
    if (!entity.id || !entity.type || !entity.data) {
      return NextResponse.json(
        { error: 'Missing required fields: id, type, data' },
        { status: 400 }
      );
    }

    const store = getOntologyStore();
    await store.store(entity);

    return NextResponse.json({ success: true, id: entity.id });
  } catch (error: any) {
    console.error('Ontology store error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to store entity' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ontology - Query or search entities
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const store = getOntologyStore();

    // Check if it's a search query
    const query = searchParams.get('q');
    if (query) {
      const search: EntitySearch = {
        query,
        types: searchParams.get('types')?.split(',') as any,
        limit: parseInt(searchParams.get('limit') || '10')
      };
      const results = await store.search(search);
      return NextResponse.json({ results, count: results.length });
    }

    // Otherwise, regular query
    const entityQuery: EntityQuery = {
      type: searchParams.get('type') as any,
      filters: searchParams.get('filters') ? JSON.parse(searchParams.get('filters')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const results = store.query(entityQuery);
    return NextResponse.json({ results, count: results.length });
  } catch (error: any) {
    console.error('Ontology query error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to query entities' },
      { status: 500 }
    );
  }
}

