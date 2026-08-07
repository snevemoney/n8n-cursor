// Governance Check API (for n8n/external workflows)

import { NextRequest, NextResponse } from 'next/server';
import { getGovernanceService } from '@/lib/governance/governanceService';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const checkSchema = z.object({
  action: z.enum(['read', 'write', 'delete', 'export', 'share', 'admin']),
  assetId: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  context: z.object({
    userId: z.string().nullable().optional(),
    tenantId: z.string().nullable().optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    workflowId: z.string().optional(),
    agentId: z.string().optional(),
  }),
});

/**
 * POST /api/governance/check - Check if an action is allowed
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const validation = checkSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid check request',
      validation.error.errors,
      400
    );
  }

  const { action, assetId, resourceType, resourceId, context } = validation.data;

  const service = getGovernanceService();
  const result = await service.checkAccess({
    action,
    assetId,
    resourceType,
    resourceId,
    context: {
      userId: context.userId || null,
      tenantId: context.tenantId || null,
      ip: context.ip,
      userAgent: context.userAgent,
      workflowId: context.workflowId,
      agentId: context.agentId,
    },
  });

  return createSuccessResponse({
    allowed: result === 'allowed',
    result,
  });
});

