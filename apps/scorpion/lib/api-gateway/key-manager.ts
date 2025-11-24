/**
 * API Key Manager
 * Manages API key creation, validation, and lookup
 */

import { randomBytes, createHash } from 'crypto';
import { query } from '../db/client';
import type { ApiKey, RateLimitConfig } from './types';

export class ApiKeyManager {
  /**
   * Generate a new API key
   */
  generateKey(): string {
    // Generate a secure random key (32 bytes = 256 bits)
    const keyBytes = randomBytes(32);
    // Base64 encode for readability
    return `sk_${keyBytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}`;
  }

  /**
   * Hash an API key for storage
   */
  hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Create a new API key
   */
  async createKey(
    keyName: string,
    rateLimits?: Partial<RateLimitConfig>,
    allowedEndpoints?: string[],
    expiresAt?: Date
  ): Promise<{ key: string; apiKey: ApiKey }> {
    // Generate the actual key (only shown once)
    const key = this.generateKey();
    const keyHash = this.hashKey(key);

    const insertQuery = `
      INSERT INTO api_keys (
        key_name, key_hash, rate_limit_per_minute, rate_limit_per_hour, rate_limit_per_day,
        allowed_endpoints, expires_at, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, key_name, key_hash, is_active, expires_at,
        rate_limit_per_minute, rate_limit_per_hour, rate_limit_per_day,
        allowed_endpoints, blocked_endpoints, created_by, created_at, last_used_at, usage_count
    `;

    const result = await query<ApiKey>(insertQuery, [
      keyName,
      keyHash,
      rateLimits?.perMinute || 60,
      rateLimits?.perHour || 1000,
      rateLimits?.perDay || 10000,
      allowedEndpoints || null,
      expiresAt?.toISOString() || null,
      'system',
    ]);

    const apiKey = result.rows[0];
    
    return { key, apiKey };
  }

  /**
   * Validate an API key
   */
  async validateKey(key: string): Promise<ApiKey | null> {
    const keyHash = this.hashKey(key);

    const selectQuery = `
      SELECT 
        id, key_name, key_hash, is_active, expires_at,
        rate_limit_per_minute, rate_limit_per_hour, rate_limit_per_day,
        allowed_endpoints, blocked_endpoints, created_by, created_at, last_used_at, usage_count
      FROM api_keys
      WHERE key_hash = $1 AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;

    const result = await query<ApiKey>(selectQuery, [keyHash]);

    if (result.rows.length === 0) {
      return null;
    }

    const apiKey = result.rows[0];

    // Update last used
    await query(
      `UPDATE api_keys SET last_used_at = NOW(), usage_count = usage_count + 1 WHERE id = $1`,
      [apiKey.id]
    );

    return apiKey;
  }

  /**
   * Revoke an API key
   */
  async revokeKey(keyId: string): Promise<void> {
    await query(`UPDATE api_keys SET is_active = FALSE WHERE id = $1`, [keyId]);
  }

  /**
   * List all API keys
   */
  async listKeys(): Promise<ApiKey[]> {
    const result = await query<ApiKey>(
      `SELECT 
        id, key_name, key_hash, is_active, expires_at,
        rate_limit_per_minute, rate_limit_per_hour, rate_limit_per_day,
        allowed_endpoints, blocked_endpoints, created_by, created_at, last_used_at, usage_count
      FROM api_keys
      ORDER BY created_at DESC`
    );

    return result.rows;
  }
}

// Singleton instance
let keyManagerInstance: ApiKeyManager | null = null;

export function getApiKeyManager(): ApiKeyManager {
  if (!keyManagerInstance) {
    keyManagerInstance = new ApiKeyManager();
  }
  return keyManagerInstance;
}

