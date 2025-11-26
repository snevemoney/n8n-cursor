/**
 * Service Health Check Endpoint
 * GET /api/services/health - Check health of all services
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHealthChecker } from '@/lib/services/health-checker';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

/**
 * GET /api/services/health - Check health of all services
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const healthChecker = getHealthChecker();
  const healthChecks = await healthChecker.checkAllServices();

  const summary = {
    total: healthChecks.length,
    healthy: healthChecks.filter(h => h.status === 'healthy').length,
    unhealthy: healthChecks.filter(h => h.status === 'unhealthy').length,
    degraded: healthChecks.filter(h => h.status === 'degraded').length,
  };

  return createSuccessResponse({
    summary,
    checks: healthChecks,
  });
});

