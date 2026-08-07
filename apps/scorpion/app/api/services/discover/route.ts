/**
 * Service Discovery Endpoint
 * GET /api/services/discover - Discover service instances
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceRegistry } from '@/lib/services/registry';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/services/discover - Discover service instances
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const serviceName = searchParams.get('serviceName');
  const healthyOnly = searchParams.get('healthyOnly') !== 'false';

  const registry = getServiceRegistry();

  if (serviceName) {
    // Discover specific service
    const instances = await registry.discover(serviceName, healthyOnly);
    return createSuccessResponse({
      serviceName,
      instances,
      count: instances.length,
    });
  } else {
    // List all services
    const services = await registry.listServices();
    return createSuccessResponse({
      services,
      count: services.length,
    });
  }
});

