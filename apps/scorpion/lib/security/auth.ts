/**
 * Authentication Middleware
 * Handles authentication and authorization for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type JWTPayload } from './jwt';
import { getApiKeyManager } from '../api-gateway/key-manager';

export interface AuthContext {
  userId?: string;
  serviceId?: string;
  apiKeyId?: string;
  role?: string;
  permissions?: string[];
  authenticated: boolean;
}

/**
 * Extract token from request
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const tokenCookie = request.cookies.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  // Try query parameter (for webhooks)
  const tokenParam = request.nextUrl.searchParams.get('token');
  if (tokenParam) {
    return tokenParam;
  }

  return null;
}

/**
 * Authenticate request using JWT or API key
 */
export async function authenticate(request: NextRequest): Promise<AuthContext> {
  const token = extractToken(request);

  // Try JWT authentication
  if (token) {
    try {
      const payload = verifyToken(token);
      return {
        userId: payload.userId,
        serviceId: payload.serviceId,
        apiKeyId: payload.apiKeyId,
        role: payload.role,
        permissions: payload.permissions,
        authenticated: true,
      };
    } catch (error) {
      // Token invalid, continue to API key check
    }
  }

  // Try API key authentication
  const apiKey = request.headers.get('x-api-key') || token;
  if (apiKey) {
    try {
      const keyManager = getApiKeyManager();
      const apiKeyData = await keyManager.validateKey(apiKey);
      
      if (apiKeyData) {
        return {
          apiKeyId: apiKeyData.id,
          role: 'api_key',
          permissions: ['api:read', 'api:write'],
          authenticated: true,
        };
      }
    } catch (error) {
      // API key invalid
    }
  }

  return {
    authenticated: false,
  };
}

/**
 * Require authentication middleware
 */
export function requireAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = await authenticate(request);

    if (!context.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, context);
  };
}

/**
 * Require specific role
 */
export function requireRole(
  roles: string[],
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = await authenticate(request);

    if (!context.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!context.role || !roles.includes(context.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request, context);
  };
}

/**
 * Require specific permission
 */
export function requirePermission(
  permission: string,
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = await authenticate(request);

    if (!context.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!context.permissions || !context.permissions.includes(permission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request, context);
  };
}

