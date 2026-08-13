/**
 * Golden Signals Endpoint
 * GET /api/metrics/golden-signals - Returns Four Golden Signals
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoldenSignalsTracker } from '@/lib/monitoring/golden-signals';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/metrics/golden-signals - Get Four Golden Signals
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const windowMs = parseInt(searchParams.get('window') || '60000', 10); // Default 1 minute
  
  const tracker = getGoldenSignalsTracker();
  const signals = await tracker.getGoldenSignals(windowMs);
  
  return createSuccessResponse(signals);
});

