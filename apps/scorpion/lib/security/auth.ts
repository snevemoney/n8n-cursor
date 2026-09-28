/**
 * Authentication middleware for privileged Scorpion API routes.
 * Fail closed: missing JWT_SECRET and SCORPION_API_KEY rejects with 503.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type JWTPayload } from './jwt';
import { isApiKeyAuthConfigured, verifyAPIKey } from '@/lib/api-auth';
import { hasEnv } from '@/lib/env';

export const AUTH_COOKIE_NAME = 'scorpion_token';

export interface AuthContext {
  userId?: string;
  serviceId?: string;
  apiKeyId?: string;
  role?: string;
  permissions?: string[];
  authenticated: boolean;
  configured: boolean;
}

export type AuthHandler<TContext = unknown> = (
  req: NextRequest,
  context: TContext
) => Promise<NextResponse>;

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieToken =
    request.cookies.get(AUTH_COOKIE_NAME)?.value || request.cookies.get('token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

function isAuthConfigured(): boolean {
  return hasEnv('JWT_SECRET') || isApiKeyAuthConfigured();
}

function unconfiguredResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Authentication is not configured', reason: 'not_configured' },
    { status: 503 }
  );
}

function unauthorizedResponse(reason: 'missing' | 'invalid'): NextResponse {
  return NextResponse.json(
    { error: 'Authentication required', reason },
    { status: 401 }
  );
}

/**
 * Authenticate request using JWT cookie/bearer or configured API key.
 */
export async function authenticate(request: NextRequest): Promise<AuthContext> {
  if (!isAuthConfigured()) {
    return { authenticated: false, configured: false };
  }

  const token = extractToken(request);

  if (token && hasEnv('JWT_SECRET')) {
    try {
      const payload: JWTPayload = verifyToken(token);
      return {
        userId: payload.userId,
        serviceId: payload.serviceId,
        apiKeyId: payload.apiKeyId,
        role: payload.role,
        permissions: payload.permissions,
        authenticated: true,
        configured: true,
      };
    } catch (error) {
      console.warn('[auth] JWT verification failed', error instanceof Error ? error.message : 'unknown');
    }
  }

  const api = await verifyAPIKey(request);
  if (api.valid) {
    return {
      apiKeyId: api.keyId,
      role: 'api_key',
      permissions: ['api:read', 'api:write'],
      authenticated: true,
      configured: true,
    };
  }

  return { authenticated: false, configured: true };
}

function rejectIfUnauthenticated(context: AuthContext): NextResponse | null {
  if (!context.configured) {
    return unconfiguredResponse();
  }
  if (!context.authenticated) {
    return unauthorizedResponse('missing');
  }
  return null;
}

/**
 * Require authentication. Passes Next.js route context through so [param] handlers keep working.
 */
export function requireAuth<TContext = unknown>(handler: AuthHandler<TContext>) {
  return async (request: NextRequest, routeContext?: TContext): Promise<NextResponse> => {
    const context = await authenticate(request);
    const blocked = rejectIfUnauthenticated(context);
    if (blocked) {
      return blocked;
    }
    return handler(request, routeContext as TContext);
  };
}

export function requireRole<TContext = unknown>(
  roles: string[],
  handler: AuthHandler<TContext>
) {
  return async (request: NextRequest, routeContext?: TContext): Promise<NextResponse> => {
    const context = await authenticate(request);
    const blocked = rejectIfUnauthenticated(context);
    if (blocked) {
      return blocked;
    }
    if (!context.role || !roles.includes(context.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    return handler(request, routeContext as TContext);
  };
}

export function requirePermission<TContext = unknown>(
  permission: string,
  handler: AuthHandler<TContext>
) {
  return async (request: NextRequest, routeContext?: TContext): Promise<NextResponse> => {
    const context = await authenticate(request);
    const blocked = rejectIfUnauthenticated(context);
    if (blocked) {
      return blocked;
    }
    if (!context.permissions || !context.permissions.includes(permission)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    return handler(request, routeContext as TContext);
  };
}

export { verifyToken } from './jwt';
