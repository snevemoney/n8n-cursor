/**
 * Edge Routing Endpoint
 * POST /api/edge/route - Route request through edge network
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEdgeClient } from '@/lib/edge/client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';
import type { RoutingStrategy, Region } from '@/lib/edge/router';

const routeRequestSchema = z.object({
  path: z.string().min(1),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  body: z.any().optional(),
  headers: z.record(z.string()).optional(),
  clientRegion: z.enum(['us-east', 'us-west', 'eu-west', 'eu-central', 'ap-south', 'ap-northeast', 'local']).optional(),
  clientIP: z.string().optional(),
  strategy: z.enum(['nearest', 'lowest-latency', 'highest-capacity', 'round-robin']).optional(),
  cacheEnabled: z.boolean().optional(),
  cacheTTL: z.number().optional(),
});

/**
 * POST /api/edge/route - Route request through edge
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const validation = routeRequestSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid request body',
      validation.error.errors,
      400
    );
  }

  const edgeClient = getEdgeClient();

  try {
    // Extract client IP from request
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     validation.data.clientIP;

    const response = await edgeClient.request(validation.data.path, {
      method: validation.data.method,
      body: validation.data.body,
      headers: validation.data.headers,
      clientRegion: validation.data.clientRegion,
      clientIP,
      strategy: validation.data.strategy as RoutingStrategy,
      cacheEnabled: validation.data.cacheEnabled,
      cacheTTL: validation.data.cacheTTL,
    });

    return createSuccessResponse(response);
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Edge routing failed: ${error.message}`,
      { error: error.message },
      500
    );
  }
});

