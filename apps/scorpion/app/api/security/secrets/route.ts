/**
 * Secrets Management Endpoint
 * GET /api/security/secrets - List secrets
 * POST /api/security/secrets - Store a secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSecretsManager } from '@/lib/security/secrets-manager';
import { requireAuth } from '@/lib/security/auth';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const setSecretSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/security/secrets - List all secrets (keys only)
 */
export const GET = withErrorHandling(
  requireAuth(async (request: NextRequest) => {
    const secretsManager = getSecretsManager();
    const secrets = await secretsManager.listSecrets();

    return createSuccessResponse({
      secrets,
      count: secrets.length,
    });
  })
);

/**
 * POST /api/security/secrets - Store a secret
 */
export const POST = withErrorHandling(
  requireAuth(async (request: NextRequest) => {
    const body = await request.json();
    const validation = setSecretSchema.safeParse(body);

    if (!validation.success) {
      return createErrorResponse(
        ApiErrorCode.INVALID_REQUEST,
        'Invalid request body',
        validation.error.errors,
        400
      );
    }

    const { key, value, description, tags } = validation.data;
    const secretsManager = getSecretsManager();

    const secretId = await secretsManager.setSecret(key, value, {
      description,
      tags,
    });

    return createSuccessResponse({
      id: secretId,
      key,
      message: 'Secret stored successfully',
    }, 201);
  })
);

