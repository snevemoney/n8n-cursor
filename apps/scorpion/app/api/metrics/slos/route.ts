/**
 * SLO Endpoint
 * GET /api/metrics/slos - Returns Service Level Objectives
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSLISLOTracker } from '@/lib/monitoring/sli-slo';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

/**
 * GET /api/metrics/slos - Get all SLOs
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const tracker = getSLISLOTracker();
  const slos = await tracker.getSLOs();
  
  return createSuccessResponse({
    slos,
    count: slos.length,
  });
});

