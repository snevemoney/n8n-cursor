// Carbon Emissions API

import { NextRequest, NextResponse } from 'next/server';
import { getCarbonSummary, calculateCarbonEmissions, storeCarbonEmissions } from '@/lib/sustainability/carbon-tracker';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

const carbonRequestSchema = z.object({
  resourceId: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
});

/**
 * GET /api/sustainability/carbon - Get carbon emissions summary
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get('resourceId') || undefined;
  const start = searchParams.get('start') ? new Date(searchParams.get('start')!) : undefined;
  const end = searchParams.get('end') ? new Date(searchParams.get('end')!) : undefined;

  if (resourceId) {
    // Get emissions for specific resource
    const period = {
      start: start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: end || new Date(),
    };
    const emission = await calculateCarbonEmissions(resourceId, period);
    await storeCarbonEmissions(emission);
    return createSuccessResponse(emission);
  } else {
    // Get summary
    const period = start && end ? { start, end } : undefined;
    const summary = await getCarbonSummary(period);
    return createSuccessResponse(summary);
  }
});

/**
 * POST /api/sustainability/carbon - Calculate and store emissions
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const validation = z.object({
    resourceId: z.string(),
    start: z.string().transform(s => new Date(s)),
    end: z.string().transform(s => new Date(s)),
  }).safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid carbon calculation request',
      validation.error.errors,
      400
    );
  }

  const { resourceId, start, end } = validation.data;
  const emission = await calculateCarbonEmissions(resourceId, { start, end });
  await storeCarbonEmissions(emission);

  return createSuccessResponse(emission, 201);
});

