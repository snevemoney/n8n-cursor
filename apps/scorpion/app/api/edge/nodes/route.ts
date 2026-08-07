/**
 * Edge Nodes Endpoint
 * GET /api/edge/nodes - List edge nodes
 * POST /api/edge/nodes - Register edge node
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEdgeRegistry } from '@/lib/edge/registry';
import { requireAuth } from '@/lib/security/auth';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';
import type { Region } from '@/lib/edge/types';

export const dynamic = 'force-dynamic';

const registerNodeSchema = z.object({
  region: z.enum(['us-east', 'us-west', 'eu-west', 'eu-central', 'ap-south', 'ap-northeast', 'local']),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(['http', 'https']),
  status: z.enum(['active', 'standby', 'maintenance']).optional(),
  latency: z.number().optional(),
  capacity: z.number().optional(),
  metadata: z.record(z.string()).optional(),
});

/**
 * GET /api/edge/nodes - List edge nodes
 */
export const GET = withErrorHandling(
  requireAuth(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') as Region | null;

    const registry = getEdgeRegistry();

    if (region) {
      const nodes = await registry.getNodesByRegion(region, true);
      return createSuccessResponse({
        region,
        nodes,
        count: nodes.length,
      });
    } else {
      const nodes = await registry.getAllNodes();
      return createSuccessResponse({
        nodes,
        count: nodes.length,
      });
    }
  })
);

/**
 * POST /api/edge/nodes - Register edge node
 */
export const POST = withErrorHandling(
  requireAuth(async (request: NextRequest) => {
    const body = await request.json();
    const validation = registerNodeSchema.safeParse(body);

    if (!validation.success) {
      return createErrorResponse(
        ApiErrorCode.INVALID_REQUEST,
        'Invalid request body',
        validation.error.errors,
        400
      );
    }

    const registry = getEdgeRegistry();
    const nodeId = await registry.registerNode(validation.data);

    return createSuccessResponse({
      id: nodeId,
      message: 'Edge node registered successfully',
    }, 201);
  })
);

