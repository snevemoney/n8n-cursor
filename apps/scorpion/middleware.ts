import { NextRequest, NextResponse } from 'next/server';
import { getRequestId } from '@/lib/api-error-handler';
import { getMetricsCollector } from '@/lib/metrics';
import { isPrivilegedApiPath } from '@/lib/security/privileged-paths';
import { apiKeyMatches, extractEdgeCredential, verifyHs256Jwt } from '@/lib/security/edge-auth';

function jsonError(status: number, error: string, code: string) {
  return NextResponse.json({ error, code }, { status });
}

async function enforcePrivilegedApi(request: NextRequest): Promise<NextResponse | null> {
  const path = request.nextUrl.pathname;
  if (!isPrivilegedApiPath(path, request.method)) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  const configuredKeys = [process.env.SCORPION_API_KEY, process.env.N8N_SCORPION_API_KEY]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim());

  if (!jwtSecret && configuredKeys.length === 0) {
    return jsonError(503, 'Authentication is not configured', 'AUTH_NOT_CONFIGURED');
  }

  const { bearer, apiKey, cookieToken } = extractEdgeCredential(
    request.headers,
    request.headers.get('cookie')
  );

  if (apiKey && apiKeyMatches(apiKey, configuredKeys)) {
    return null;
  }
  if (bearer && apiKeyMatches(bearer, configuredKeys)) {
    return null;
  }

  const token = cookieToken || bearer;
  if (token && jwtSecret && (await verifyHs256Jwt(token, jwtSecret))) {
    return null;
  }

  return jsonError(401, 'Authentication required', 'UNAUTHORIZED');
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = getRequestId(request);
  const route = request.nextUrl.pathname;

  const authBlock = await enforcePrivilegedApi(request);
  if (authBlock) {
    authBlock.headers.set('x-request-id', requestId);
    authBlock.headers.set('x-correlation-id', requestId);
    return authBlock;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-correlation-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-request-id', requestId);
  response.headers.set('x-correlation-id', requestId);

  if (route.startsWith('/') && !route.startsWith('/api') && !route.startsWith('/_next')) {
    const metrics = getMetricsCollector();
    metrics.incrementCounter('scorpion_navigation_requests_total', { route, status: '200' });
    const duration = (Date.now() - startTime) / 1000;
    metrics.observeHistogram('scorpion_navigation_duration_seconds', duration, { route });
    metrics.setGauge('scorpion_route_load_time_seconds', duration, { route });
    metrics.setGauge('scorpion_route_availability', 1, { route });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
