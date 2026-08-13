/**
 * Service Mesh Reset Endpoint
 * POST /api/services/mesh/reset - Reset circuit breaker for a service
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMeshClient } from '@/lib/services/mesh-client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const resetSchema = z.object({
  serviceName: z.string().min(1),
});

/**
 * POST /api/services/mesh/reset - Reset circuit breaker
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const validation = resetSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid request body',
      validation.error.errors,
      400
    );
  }

  const { serviceName } = validation.data;
  const meshClient = getMeshClient();

  meshClient.resetCircuitBreaker(serviceName);

  return createSuccessResponse({
    message: `Circuit breaker reset for service: ${serviceName}`,
    serviceName,
  });
});

