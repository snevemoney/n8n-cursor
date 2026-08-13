/**
 * GET /api/cost/summary
 * Get cost summary for current month
 */

import { NextResponse } from 'next/server';
import { getCostTracker } from '@/lib/cost/tracker';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const tracker = getCostTracker();
  const summary = await tracker.getCostSummary();
  
  return createSuccessResponse({
    summary,
    period: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
    },
  });
});

