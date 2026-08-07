// Resource Efficiency API

import { NextRequest, NextResponse } from 'next/server';
import { analyzeResourceEfficiency, getLowEfficiencyResources, storeEfficiencyAnalysis } from '@/lib/sustainability/efficiency-analyzer';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sustainability/efficiency - Get resource efficiency analysis
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get('resourceId');
  const threshold = searchParams.get('threshold') ? parseFloat(searchParams.get('threshold')!) : 30;

  if (resourceId) {
    const efficiency = await analyzeResourceEfficiency(resourceId);
    await storeEfficiencyAnalysis(efficiency);
    return createSuccessResponse(efficiency);
  } else {
    const lowEfficiency = await getLowEfficiencyResources(threshold);
    return createSuccessResponse({
      resources: lowEfficiency,
      count: lowEfficiency.length,
    });
  }
});

/**
 * POST /api/sustainability/efficiency - Analyze and store efficiency
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const validation = z.object({
    resourceId: z.string(),
  }).safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid efficiency analysis request',
      validation.error.errors,
      400
    );
  }

  const { resourceId } = validation.data;
  const efficiency = await analyzeResourceEfficiency(resourceId);
  await storeEfficiencyAnalysis(efficiency);

  return createSuccessResponse(efficiency, 201);
});

