/**
 * Service Mesh Stats Endpoint
 * GET /api/services/mesh/stats - Get circuit breaker and mesh statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMeshClient } from '@/lib/services/mesh-client';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

/**
 * GET /api/services/mesh/stats - Get mesh statistics
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const serviceName = searchParams.get('serviceName');

  const meshClient = getMeshClient();

  if (serviceName) {
    // Get stats for specific service
    const stats = meshClient.getCircuitBreakerStats(serviceName);
    return createSuccessResponse({
      serviceName,
      ...stats,
    });
  } else {
    // Get stats for all services
    const allStats = meshClient.getAllCircuitBreakerStats();
    return createSuccessResponse({
      services: allStats,
      count: Object.keys(allStats).length,
    });
  }
});

