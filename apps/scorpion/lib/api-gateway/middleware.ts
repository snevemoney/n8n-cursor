/**
 * API Gateway Middleware
 * Request authentication, rate limiting, and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyManager } from './key-manager';
import { getRateLimiter } from './rate-limiter';
import { query } from '../db/client';
import type { ApiKey } from './types';

export interface GatewayContext {
  apiKey?: ApiKey;
  requestId: string;
  startTime: number;
}

/**
 * Extract API key from request
 */
export function extractApiKey(request: NextRequest): string | null {
  // Check Authorization header: Bearer <key>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Check query parameter (less secure, but convenient)
  const url = new URL(request.url);
  const apiKeyParam = url.searchParams.get('api_key');
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return null;
}

/**
 * Check if endpoint is allowed for API key
 */
function isEndpointAllowed(endpoint: string, apiKey: ApiKey): boolean {
  // If no restrictions, allow all
  if (!apiKey.allowedEndpoints || apiKey.allowedEndpoints.length === 0) {
    // Check blocked endpoints
    if (apiKey.blockedEndpoints && apiKey.blockedEndpoints.length > 0) {
      return !apiKey.blockedEndpoints.some(pattern => matchesPattern(endpoint, pattern));
    }
    return true;
  }

  // Check if endpoint matches any allowed pattern
  const allowed = apiKey.allowedEndpoints.some(pattern => matchesPattern(endpoint, pattern));
  
  if (!allowed) {
    return false;
  }

  // Check blocked endpoints (blocked takes precedence)
  if (apiKey.blockedEndpoints && apiKey.blockedEndpoints.length > 0) {
    return !apiKey.blockedEndpoints.some(pattern => matchesPattern(endpoint, pattern));
  }

  return true;
}

/**
 * Simple pattern matching (supports * wildcard)
 */
function matchesPattern(path: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Authenticate request and check rate limits
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ authenticated: boolean; apiKey?: ApiKey; error?: string; statusCode?: number }> {
  const apiKeyString = extractApiKey(request);

  if (!apiKeyString) {
    return {
      authenticated: false,
      error: 'API key required. Provide via Authorization: Bearer <key> header or X-API-Key header.',
      statusCode: 401,
    };
  }

  const keyManager = getApiKeyManager();
  const apiKey = await keyManager.validateKey(apiKeyString);

  if (!apiKey) {
    return {
      authenticated: false,
      error: 'Invalid or expired API key',
      statusCode: 401,
    };
  }

  // Check endpoint permissions
  const url = new URL(request.url);
  const endpoint = url.pathname;
  
  if (!isEndpointAllowed(endpoint, apiKey)) {
    return {
      authenticated: false,
      error: 'API key does not have permission to access this endpoint',
      statusCode: 403,
    };
  }

  // Check rate limits
  const rateLimiter = getRateLimiter();
  const rateLimitCheck = await rateLimiter.checkAllLimits(apiKey);

  if (!rateLimitCheck.allowed) {
    const exceeded = !rateLimitCheck.checks.minute.allowed ? 'minute' :
                     !rateLimitCheck.checks.hour.allowed ? 'hour' : 'day';
    
    return {
      authenticated: false,
      error: `Rate limit exceeded (${exceeded})`,
      statusCode: 429,
    };
  }

  return {
    authenticated: true,
    apiKey,
  };
}

/**
 * Log API usage
 */
export async function logApiUsage(
  apiKey: ApiKey,
  request: NextRequest,
  response: NextResponse,
  durationMs: number
): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) {
      return;
    }

    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || null;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || null;

    const insertQuery = `
      INSERT INTO api_usage (
        api_key_id, endpoint, method, status_code, duration_ms,
        user_agent, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await query(insertQuery, [
      apiKey.id,
      url.pathname,
      request.method,
      response.status,
      durationMs,
      userAgent,
      ipAddress,
    ]);
  } catch (error) {
    console.warn('[API Gateway] Failed to log usage:', error);
    // Don't throw - logging failures shouldn't break requests
  }
}

/**
 * Create gateway context from request
 */
export function createGatewayContext(request: NextRequest): GatewayContext {
  return {
    requestId: crypto.randomUUID(),
    startTime: Date.now(),
  };
}

