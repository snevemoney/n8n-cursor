/**
 * Secret Management Endpoint
 * GET /api/security/secrets/[key] - Retrieve a secret
 * DELETE /api/security/secrets/[key] - Delete a secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSecretsManager } from '@/lib/security/secrets-manager';
import { requireAuth } from '@/lib/security/auth';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/security/secrets/[key] - Retrieve a secret value
 */
export const GET = withErrorHandling(
  requireAuth(async (request: NextRequest, { params }: { params: { key: string } }) => {
    const { key } = params;
    const secretsManager = getSecretsManager();

    const value = await secretsManager.getSecret(key);

    if (!value) {
      return createErrorResponse(
        ApiErrorCode.NOT_FOUND,
        `Secret not found: ${key}`,
        {},
        404
      );
    }

    return createSuccessResponse({
      key,
      value,
    });
  })
);

/**
 * DELETE /api/security/secrets/[key] - Delete a secret
 */
export const DELETE = withErrorHandling(
  requireAuth(async (request: NextRequest, { params }: { params: { key: string } }) => {
    const { key } = params;
    const secretsManager = getSecretsManager();

    await secretsManager.deleteSecret(key);

    return createSuccessResponse({
      message: `Secret deleted: ${key}`,
    });
  })
);

