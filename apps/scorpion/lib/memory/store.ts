/**
 * Long-term Memory Store
 * Manages personality, preferences, and learned behaviors
 */

import { query } from '../db/client';
import { randomUUID } from 'crypto';
import type { LongTermMemory, MemoryQuery } from './types';

export class MemoryStore {
  /**
   * Create a memory
   */
  async createMemory(memory: Omit<LongTermMemory, 'id' | 'createdAt'>): Promise<string> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    try {
      if (!process.env.DATABASE_URL) {
        // Fallback: store in memory (will be lost on restart)
        console.warn('[MemoryStore] DATABASE_URL not set, memory will not persist');
        return id;
      }

      const insertQuery = `
        INSERT INTO long_term_memory (id, scope, content, weight, created_at, tags)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id::text
      `;

      const result = await query<{ id: string }>(insertQuery, [
        id,
        memory.scope,
        memory.content,
        memory.weight || 1,
        createdAt,
        JSON.stringify(memory.tags || []),
      ]);

      return result.rows[0]?.id || id;
    } catch (error) {
      console.error('[MemoryStore] Failed to create memory:', error);
      return id;
    }
  }

  /**
   * Get memories by query
   */
  async getMemories(queryParams: MemoryQuery = {}): Promise<LongTermMemory[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (queryParams.scope) {
        conditions.push(`(scope = $${paramIndex++} OR scope = 'global')`);
        params.push(queryParams.scope);
      }

      if (queryParams.minWeight) {
        conditions.push(`weight >= $${paramIndex++}`);
        params.push(queryParams.minWeight);
      }

      if (queryParams.tags && queryParams.tags.length > 0) {
        conditions.push(`tags @> $${paramIndex++}::jsonb`);
        params.push(JSON.stringify(queryParams.tags));
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

      const limit = queryParams.limit || 10;
      params.push(limit);

      const selectQuery = `
        SELECT id, scope, content, weight, created_at, updated_at, tags
        FROM long_term_memory
        ${whereClause}
        ORDER BY weight DESC, created_at DESC
        LIMIT $${paramIndex}
      `;

      const result = await query<{
        id: string;
        scope: string;
        content: string;
        weight: number;
        created_at: string;
        updated_at?: string;
        tags?: string;
      }>(selectQuery, params);

      return result.rows.map(row => ({
        id: row.id,
        scope: row.scope,
        content: row.content,
        weight: row.weight,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        tags: row.tags ? JSON.parse(row.tags as any) : undefined,
      }));
    } catch (error) {
      console.error('[MemoryStore] Failed to get memories:', error);
      return [];
    }
  }

  /**
   * Update a memory
   */
  async updateMemory(id: string, updates: Partial<LongTermMemory>): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return;
      }

      const updatesList: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.content !== undefined) {
        updatesList.push(`content = $${paramIndex++}`);
        params.push(updates.content);
      }

      if (updates.weight !== undefined) {
        updatesList.push(`weight = $${paramIndex++}`);
        params.push(updates.weight);
      }

      if (updates.scope !== undefined) {
        updatesList.push(`scope = $${paramIndex++}`);
        params.push(updates.scope);
      }

      if (updates.tags !== undefined) {
        updatesList.push(`tags = $${paramIndex++}::jsonb`);
        params.push(JSON.stringify(updates.tags));
      }

      updatesList.push(`updated_at = NOW()`);
      params.push(id);

      const updateQuery = `
        UPDATE long_term_memory
        SET ${updatesList.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await query(updateQuery, params);
    } catch (error) {
      console.error('[MemoryStore] Failed to update memory:', error);
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return;
      }

      await query('DELETE FROM long_term_memory WHERE id = $1', [id]);
    } catch (error) {
      console.error('[MemoryStore] Failed to delete memory:', error);
    }
  }
}

// Singleton instance
let memoryStoreInstance: MemoryStore | null = null;

export function getMemoryStore(): MemoryStore {
  if (!memoryStoreInstance) {
    memoryStoreInstance = new MemoryStore();
  }
  return memoryStoreInstance;
}

