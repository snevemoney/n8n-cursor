import { NextRequest, NextResponse } from 'next/server';
import { getRequestId } from '@/lib/api-error-handler';
import { getMetricsCollector } from '@/lib/metrics';

/**
 * Middleware for structured logging and correlation IDs
 * Adds correlation IDs to all requests and logs navigation metrics
 */

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = getRequestId(request);
  const route = request.nextUrl.pathname;

  // Add correlation ID to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-correlation-id', requestId);

  // Create response with correlation ID
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add correlation ID to response headers
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-correlation-id', requestId);

  // Track navigation metrics
  if (route.startsWith('/') && !route.startsWith('/api') && !route.startsWith('/_next')) {
    const metrics = getMetricsCollector();
    
    // Track navigation request
    metrics.incrementCounter('scorpion_navigation_requests_total', { route, status: '200' });

    // Track navigation duration (will be updated in response handler)
    const duration = (Date.now() - startTime) / 1000;
    metrics.observeHistogram('scorpion_navigation_duration_seconds', duration, { route });
    metrics.setGauge('scorpion_route_load_time_seconds', duration, { route });
    metrics.setGauge('scorpion_route_availability', 1, { route });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

