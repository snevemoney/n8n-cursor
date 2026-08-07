/**
 * Service Registration Endpoint
 * POST /api/services/register - Register a service instance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceRegistry } from '@/lib/services/registry';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  serviceName: z.string().min(1),
  version: z.string().min(1),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(['http', 'https', 'grpc']),
  status: z.enum(['healthy', 'unhealthy', 'unknown']).optional(),
  metadata: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * POST /api/services/register - Register a service instance
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, registerSchema);
  if (!validation.success) {
    return validation.error;
  }

  try {
    const registry = getServiceRegistry();
    const serviceId = await registry.register(validation.data);

    return createSuccessResponse({
      id: serviceId,
      message: 'Service registered successfully',
    }, 201);
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to register service: ${error.message}`,
      { error: error.message },
      500
    );
  }
});

