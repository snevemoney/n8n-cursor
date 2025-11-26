/**
 * API Authentication for External Access
 * Secure Scorpion APIs for n8n and other services
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Generate API keys: openssl rand -hex 32
const VALID_API_KEYS = new Set([
  process.env.SCORPION_API_KEY || 'scorpion_dev_key_change_in_production',
  process.env.N8N_SCORPION_API_KEY,
].filter(Boolean));

export interface AuthResult {
  valid: boolean;
  error?: string;
  keyId?: string;
}

/**
 * Verify API key from request
 */
export async function verifyAPIKey(req: NextRequest): Promise<AuthResult> {
  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  const apiKeyHeader = req.headers.get('x-api-key');
  
  let apiKey: string | null = null;
  
  // Support both "Bearer token" and "X-API-Key: token"
  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  } else if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  }
  
  if (!apiKey) {
    return {
      valid: false,
      error: 'Missing API key. Provide via Authorization: Bearer <key> or X-API-Key: <key>'
    };
  }
  
  // Verify key
  if (!VALID_API_KEYS.has(apiKey)) {
    return {
      valid: false,
      error: 'Invalid API key'
    };
  }
  
  return {
    valid: true,
    keyId: hashKey(apiKey)
  };
}

/**
 * Generate API key hash for logging (don't log full keys)
 */
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex').substring(0, 8);
}

/**
 * Generate new API key
 */
export function generateAPIKey(): string {
  return 'scorpion_' + crypto.randomBytes(32).toString('hex');
}

