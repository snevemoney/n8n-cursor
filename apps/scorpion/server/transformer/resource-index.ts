/**
 * Resource Index - The "Embedding Table" for Scorpion
 * 
 * Maps to: LLM Embeddings (Tool Registry + Knowledge Index + Schema Registry)
 * 
 * Unified index that stores:
 * - Tools (MCP/n8n tools with descriptions, schemas, tags)
 * - Knowledge docs (design docs, architecture READMEs, agent specs)
 * - Workflows (n8n workflow schemas)
 * - Logs (past run logs, postmortems)
 * 
 * Each entry has embeddings for semantic search (RAG queries).
 */

import type { ResourceIndexEntry, ResourceType } from './scorpion-context';

export interface ToolEntry extends ResourceIndexEntry {
  type: 'tool';
  metadata: {
    name: string;
    description: string;
    inputSchema?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    tags: string[];
    mcpServer?: string;
    n8nNode?: string;
  };
}

export interface DocEntry extends ResourceIndexEntry {
  type: 'doc';
  metadata: {
    title: string;
    content: string;
    chunkIndex?: number;
    source: string; // file path, URL, etc.
    tags: string[];
  };
}

export interface WorkflowEntry extends ResourceIndexEntry {
  type: 'workflow';
  metadata: {
    name: string;
    schema: Record<string, unknown>;
    version: string;
    owner?: string;
    status: 'tested' | 'failed' | 'deprecated' | 'active';
    tags: string[];
  };
}

export interface SchemaEntry extends ResourceIndexEntry {
  type: 'schema';
  metadata: {
    name: string;
    schema: Record<string, unknown>;
    version: string;
    owner?: string;
    tags: string[];
  };
}

export interface LogEntry extends ResourceIndexEntry {
  type: 'log';
  metadata: {
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    source: string;
    tags: string[];
  };
}

export type TypedResourceEntry = ToolEntry | DocEntry | WorkflowEntry | SchemaEntry | LogEntry;

/**
 * Resource Index Interface
 * 
 * Provides semantic search (RAG) over all resources
 */
export interface ResourceIndex {
  /**
   * Add or update a resource entry
   */
  upsert(entry: TypedResourceEntry): Promise<void>;
  
  /**
   * Semantic search - find resources similar to query
   * 
   * Maps to: Attention query (Q · K^T)
   * 
   * @param query - Natural language query or embedding vector
   * @param type - Filter by resource type
   * @param limit - Max number of results
   * @returns Sorted by relevance score
   */
  search(
    query: string | number[],
    options?: {
      type?: ResourceType;
      tags?: string[];
      limit?: number;
    }
  ): Promise<Array<{ entry: TypedResourceEntry; score: number }>>;
  
  /**
   * Get resource by ID
   */
  get(id: string): Promise<TypedResourceEntry | null>;
  
  /**
   * List all resources of a type
   */
  list(type?: ResourceType, tags?: string[]): Promise<TypedResourceEntry[]>;
}

/**
 * In-memory implementation (for development/testing)
 * 
 * Production should use Supabase/Pinecone/Weaviate
 */
export class InMemoryResourceIndex implements ResourceIndex {
  private entries: Map<string, TypedResourceEntry> = new Map();
  
  async upsert(entry: TypedResourceEntry): Promise<void> {
    this.entries.set(entry.id, entry);
  }
  
  async search(
    query: string | number[],
    options?: {
      type?: ResourceType;
      tags?: string[];
      limit?: number;
    }
  ): Promise<Array<{ entry: TypedResourceEntry; score: number }>> {
    // Simple text matching for now (production should use vector similarity)
    const queryStr = typeof query === 'string' ? query.toLowerCase() : '';
    const results: Array<{ entry: TypedResourceEntry; score: number }> = [];
    
    for (const entry of this.entries.values()) {
      // Filter by type
      if (options?.type && entry.type !== options.type) continue;
      
      // Filter by tags
      if (options?.tags && !options.tags.some(tag => entry.tags.includes(tag))) continue;
      
      // Simple text matching score
      let score = 0;
      if (queryStr) {
        const text = `${entry.title} ${entry.description}`.toLowerCase();
        if (text.includes(queryStr)) {
          score = 0.8;
        } else if (entry.tags.some(tag => tag.toLowerCase().includes(queryStr))) {
          score = 0.5;
        }
      } else {
        score = 0.5; // No query = return all with default score
      }
      
      if (score > 0) {
        results.push({ entry, score });
      }
    }
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    // Apply limit
    const limit = options?.limit ?? 10;
    return results.slice(0, limit);
  }
  
  async get(id: string): Promise<TypedResourceEntry | null> {
    return this.entries.get(id) || null;
  }
  
  async list(type?: ResourceType, tags?: string[]): Promise<TypedResourceEntry[]> {
    const results: TypedResourceEntry[] = [];
    
    for (const entry of this.entries.values()) {
      if (type && entry.type !== type) continue;
      if (tags && !tags.some(tag => entry.tags.includes(tag))) continue;
      results.push(entry);
    }
    
    return results;
  }
}

