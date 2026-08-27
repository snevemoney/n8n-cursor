/**
 * API Authentication for External Access
 * Fail closed: no default key. Missing SCORPION_API_KEY rejects all key auth.
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { optionalEnv } from './env';
import { timingSafeEqualString } from './security/timing-safe';

export interface AuthResult {
  valid: boolean;
  error?: string;
  keyId?: string;
  reason?: 'not_configured' | 'missing' | 'invalid';
}

function configuredApiKeys(): string[] {
  return [optionalEnv('SCORPION_API_KEY'), optionalEnv('N8N_SCORPION_API_KEY')].filter(
    (value): value is string => Boolean(value)
  );
}

export function isApiKeyAuthConfigured(): boolean {
  return configuredApiKeys().length > 0;
}

export async function verifyAPIKey(req: NextRequest): Promise<AuthResult> {
  const keys = configuredApiKeys();
  if (keys.length === 0) {
    return {
      valid: false,
      reason: 'not_configured',
      error: 'API key auth is not configured (SCORPION_API_KEY missing)',
    };
  }

  const authHeader = req.headers.get('authorization');
  const apiKeyHeader = req.headers.get('x-api-key');

  let apiKey: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  } else if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  }

  if (!apiKey) {
    return {
      valid: false,
      reason: 'missing',
      error: 'Missing API key. Provide via Authorization: Bearer <key> or X-API-Key: <key>',
    };
  }

  const matched = keys.some((candidate) => timingSafeEqualString(apiKey!, candidate));
  if (!matched) {
    return {
      valid: false,
      reason: 'invalid',
      error: 'Invalid API key',
    };
  }

  return {
    valid: true,
    keyId: hashKey(apiKey),
  };
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex').substring(0, 8);
}

export function generateAPIKey(): string {
  return 'scorpion_' + crypto.randomBytes(32).toString('hex');
}
