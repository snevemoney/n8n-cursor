/**
 * Secrets Manager
 * Manages encrypted secrets storage and retrieval
 */

import { query } from '../db/client';
import { encrypt, decrypt, type EncryptedData } from './encryption';
import { randomUUID } from 'crypto';

export interface Secret {
  id: string;
  key: string;
  encryptedValue: EncryptedData;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export class SecretsManager {
  /**
   * Store a secret
   */
  async setSecret(
    key: string,
    value: string,
    options: {
      description?: string;
      tags?: string[];
      encryptionKey?: string;
    } = {}
  ): Promise<string> {
    const id = randomUUID();
    const encryptedValue = await encrypt(value, options.encryptionKey);
    const now = new Date().toISOString();

    try {
      if (!process.env.DATABASE_URL) {
        // Fallback: just return ID (secrets not persisted)
        return id;
      }

      const insertQuery = `
        INSERT INTO secrets (
          id, secret_key, encrypted_value, description, tags, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (secret_key) 
        DO UPDATE SET
          encrypted_value = EXCLUDED.encrypted_value,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          updated_at = EXCLUDED.updated_at
        RETURNING id::text
      `;

      const result = await query<{ id: string }>(insertQuery, [
        id,
        key,
        JSON.stringify(encryptedValue),
        options.description || null,
        JSON.stringify(options.tags || []),
        now,
        now,
      ]);

      return result.rows[0]?.id || id;
    } catch (error) {
      console.error('[SecretsManager] Failed to store secret:', error);
      return id;
    }
  }

  /**
   * Retrieve a secret
   */
  async getSecret(
    key: string,
    encryptionKey?: string
  ): Promise<string | null> {
    try {
      if (!process.env.DATABASE_URL) {
        return null;
      }

      const selectQuery = `
        SELECT encrypted_value
        FROM secrets
        WHERE secret_key = $1
      `;

      const result = await query<{ encrypted_value: string }>(selectQuery, [key]);

      if (result.rows.length === 0) {
        return null;
      }

      const encryptedData: EncryptedData = JSON.parse(result.rows[0].encrypted_value);
      return await decrypt(encryptedData, encryptionKey);
    } catch (error) {
      console.error('[SecretsManager] Failed to retrieve secret:', error);
      return null;
    }
  }

  /**
   * Delete a secret
   */
  async deleteSecret(key: string): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return;
      }

      await query('DELETE FROM secrets WHERE secret_key = $1', [key]);
    } catch (error) {
      console.error('[SecretsManager] Failed to delete secret:', error);
    }
  }

  /**
   * List all secrets (keys only, no values)
   */
  async listSecrets(): Promise<Array<{ key: string; description?: string; tags?: string[] }>> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      const selectQuery = `
        SELECT secret_key, description, tags
        FROM secrets
        ORDER BY created_at DESC
      `;

      const result = await query<{ secret_key: string; description: string; tags: string }>(selectQuery);

      return result.rows.map(row => ({
        key: row.secret_key,
        description: row.description || undefined,
        tags: row.tags ? JSON.parse(row.tags) : undefined,
      }));
    } catch (error) {
      console.error('[SecretsManager] Failed to list secrets:', error);
      return [];
    }
  }
}

// Singleton instance
let secretsManagerInstance: SecretsManager | null = null;

export function getSecretsManager(): SecretsManager {
  if (!secretsManagerInstance) {
    secretsManagerInstance = new SecretsManager();
  }
  return secretsManagerInstance;
}

