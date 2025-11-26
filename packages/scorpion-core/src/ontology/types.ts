/**
 * Core ontology types
 */

import { EntityType, EntityRelation } from './schema';

export interface OntologyEntity {
  id: string;
  type: EntityType;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  relations?: EntityRelation[];
  embedding?: number[]; // For RAG integration
}

export interface EntityQuery {
  type?: EntityType | EntityType[];
  filters?: Record<string, any>;
  relations?: string[]; // Include related entities
  limit?: number;
  offset?: number;
}

export interface EntitySearch {
  query: string;
  types?: EntityType[];
  filters?: Record<string, any>;
  limit?: number;
}

