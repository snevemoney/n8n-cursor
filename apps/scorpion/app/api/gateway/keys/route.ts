/**
 * API Keys Management
 * Create, list, and manage API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyManager } from '@/lib/api-gateway/key-manager';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { requireAuth } from '@/lib/security/auth';
import { z } from 'zod';

const createKeySchema = z.object({
  keyName: z.string().min(1).max(255),
  rateLimitPerMinute: z.number().min(1).max(10000).optional(),
  rateLimitPerHour: z.number().min(1).max(100000).optional(),
  rateLimitPerDay: z.number().min(1).max(1000000).optional(),
  allowedEndpoints: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
});

/**
 * GET /api/gateway/keys - List all API keys
 */
export const GET = withErrorHandling(requireAuth(async (_request: NextRequest) => {
  try {
    const keyManager = getApiKeyManager();
    const keys = await keyManager.listKeys();

    // Don't expose key hashes or sensitive info
    const sanitizedKeys = keys.map(key => ({
      id: key.id,
      keyName: key.keyName,
      isActive: key.isActive,
      expiresAt: key.expiresAt,
      rateLimitPerMinute: key.rateLimitPerMinute,
      rateLimitPerHour: key.rateLimitPerHour,
      rateLimitPerDay: key.rateLimitPerDay,
      allowedEndpoints: key.allowedEndpoints,
      createdBy: key.createdBy,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
    }));

    return createSuccessResponse(sanitizedKeys);
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to list API keys: ${error.message}`,
      { error: error.message },
      500
    );
  }
}));

/**
 * POST /api/gateway/keys - Create a new API key
 */
export const POST = withErrorHandling(requireAuth(async (request: NextRequest) => {
  const validation = await validateRequest(request, createKeySchema);
  if (!validation.success) {
    return validation.error;
  }

  try {
    const keyManager = getApiKeyManager();
    
    const rateLimits = {
      perMinute: validation.data.rateLimitPerMinute,
      perHour: validation.data.rateLimitPerHour,
      perDay: validation.data.rateLimitPerDay,
    };

    const expiresAt = validation.data.expiresAt 
      ? new Date(validation.data.expiresAt)
      : undefined;

    const { key, apiKey } = await keyManager.createKey(
      validation.data.keyName,
      rateLimits,
      validation.data.allowedEndpoints,
      expiresAt
    );

    // Return the key only once (security: key is never stored, only hash)
    return createSuccessResponse({
      id: apiKey.id,
      keyName: apiKey.keyName,
      key, // Only returned on creation
      rateLimitPerMinute: apiKey.rateLimitPerMinute,
      rateLimitPerHour: apiKey.rateLimitPerHour,
      rateLimitPerDay: apiKey.rateLimitPerDay,
      allowedEndpoints: apiKey.allowedEndpoints,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      warning: 'Store this key securely. It will not be shown again.',
    }, 201);
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to create API key: ${error.message}`,
      { error: error.message },
      500
    );
  }
}));

