/**
 * Tool Resource Index - Wires ResourceIndex to Existing Tool Registry
 * 
 * Creates a ResourceIndex backed by the existing tool registry,
 * allowing semantic search over tools via the transformer attention mechanism.
 */

import type { ResourceIndex, TypedResourceEntry } from '@/server/transformer/resource-index';
import type { ResourceIndexEntry } from '@/server/transformer/scorpion-context';
import { toolRegistry, type ToolMeta } from '@/lib/orchestrator/tool-registry';
import { generateEmbedding, cosineSimilarity } from './embeddings';

/**
 * ResourceIndex implementation backed by the tool registry
 */
class ToolBackedResourceIndex implements ResourceIndex {
  private entries: TypedResourceEntry[] = [];

  private embeddingCache: Map<string, number[]> = new Map();

  constructor() {
    // Populate from tool registry
    const tools = toolRegistry.list(false); // Get all tools, including disabled
    this.entries = tools.map((tool, idx) => ({
      id: `tool:${tool.name}`,
      type: 'tool' as const,
      title: tool.name,
      description: tool.description,
      tags: tool.tags || [],
      vector: undefined, // Will be generated on demand
      metadata: {
        name: tool.name,
        description: tool.description,
        tags: tool.tags || [],
        source: 'tool-registry',
        index: idx,
        timeoutMs: tool.metadata?.timeoutMs,
        maxRetries: tool.metadata?.maxRetries,
        enabledInLiteMode: tool.metadata?.enabledInLiteMode,
      },
    }));
  }

  /**
   * Generate and cache embedding for an entry
   */
  private async ensureEmbedding(entry: TypedResourceEntry): Promise<number[]> {
    const cacheKey = entry.id;
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    try {
      const text = `${entry.title} ${entry.description} ${entry.tags.join(' ')}`;
      const embedding = await generateEmbedding(text);
      this.embeddingCache.set(cacheKey, embedding);
      entry.vector = embedding;
      return embedding;
    } catch (error: any) {
      console.warn(`[ToolResourceIndex] Failed to generate embedding for ${entry.id}:`, error.message);
      // Return zero vector as fallback
      const zeroVector = new Array(1536).fill(0); // OpenAI embedding dimension
      this.embeddingCache.set(cacheKey, zeroVector);
      entry.vector = zeroVector;
      return zeroVector;
    }
  }

  async upsert(entry: TypedResourceEntry): Promise<void> {
    const existingIndex = this.entries.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
      this.entries[existingIndex] = entry;
    } else {
      this.entries.push(entry);
    }
  }

  async search(
    query: string | number[],
    options?: {
      type?: string | string[];
      tags?: string[];
      limit?: number;
    }
  ): Promise<Array<{ entry: TypedResourceEntry; score: number }>> {
    const limit = options?.limit ?? 10;
    const typeFilter = options?.type
      ? Array.isArray(options.type)
        ? new Set(options.type)
        : new Set([options.type])
      : null;

    // Generate query embedding if string
    let queryVector: number[] | null = null;
    if (typeof query === 'string') {
      try {
        queryVector = await generateEmbedding(query);
      } catch (error: any) {
        console.warn(`[ToolResourceIndex] Failed to generate query embedding:`, error.message);
        // Fall back to text matching if embedding fails - will be handled in scoring below
        queryVector = null;
      }
    } else {
      queryVector = query;
    }

    // Filter entries
    const filteredEntries = this.entries.filter((entry) => {
      if (typeFilter && !typeFilter.has(entry.type)) return false;
      if (options?.tags && !options.tags.some(tag => entry.tags.includes(tag))) return false;
      return true;
    });

    // Score entries using vector similarity or text matching
    const scored = await Promise.all(
      filteredEntries.map(async (entry) => {
        let score = 0;

        if (queryVector && queryVector.length > 0) {
          // Use vector similarity if both query and entry have vectors
          const entryVector = entry.vector || await this.ensureEmbedding(entry);
          if (entryVector.length > 0) {
            score = cosineSimilarity(queryVector, entryVector);
          } else {
            // Fallback to text matching if embedding failed
            score = this.textMatchScore(query, entry);
          }
        } else {
          // Fallback to text matching
          score = this.textMatchScore(query, entry);
        }

        return { entry, score: Math.max(0, Math.min(score, 1.0)) };
      })
    );

    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Fallback text matching score
   */
  private textMatchScore(query: string | number[], entry: TypedResourceEntry): number {
    if (typeof query !== 'string') return 0.5;

    const queryStr = query.toLowerCase();
    const haystack = `${entry.title} ${entry.description} ${entry.tags.join(' ')}`.toLowerCase();

    const matches = (haystack.match(new RegExp(queryStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    let score = matches > 0 ? Math.min(matches * 0.3 + 0.5, 1.0) : 0;

    // Boost if title matches
    if (entry.title.toLowerCase().includes(queryStr)) {
      score += 0.2;
    }

    // Boost if tags match
    if (entry.tags.some(tag => tag.toLowerCase().includes(queryStr))) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  async get(id: string): Promise<TypedResourceEntry | null> {
    return this.entries.find(e => e.id === id) || null;
  }

  async list(type?: string, tags?: string[]): Promise<TypedResourceEntry[]> {
    return this.entries.filter(entry => {
      if (type && entry.type !== type) return false;
      if (tags && !tags.some(tag => entry.tags.includes(tag))) return false;
      return true;
    });
  }
}

/**
 * Factory: create a ResourceIndex backed by the tool registry.
 */
export function createToolResourceIndex(): ResourceIndex {
  return new ToolBackedResourceIndex();
}

