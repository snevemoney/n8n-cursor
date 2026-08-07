/**
 * API Key Management (Individual)
 * Revoke and manage individual API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyManager } from '@/lib/api-gateway/key-manager';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/gateway/keys/[id] - Revoke an API key
 */
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const keyManager = getApiKeyManager();
    await keyManager.revokeKey(params.id);

    return createSuccessResponse({
      message: 'API key revoked successfully',
      id: params.id,
    });
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to revoke API key: ${error.message}`,
      { error: error.message },
      500
    );
  }
});

