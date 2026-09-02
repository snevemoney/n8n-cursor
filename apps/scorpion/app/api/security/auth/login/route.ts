/**
 * Authentication Endpoint
 * POST /api/security/auth/login — fail closed if operator password or JWT_SECRET is missing.
 */

import { NextRequest } from 'next/server';
import { signToken } from '@/lib/security/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/security/auth';
import { timingSafeEqualString } from '@/lib/security/timing-safe';
import { MissingEnvError, optionalEnv } from '@/lib/env';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

const loginSchema = z.object({
  userId: z.string().min(1).max(128),
  password: z.string().min(1).max(512),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const expectedPassword = optionalEnv('SCORPION_OPERATOR_PASSWORD');
  if (!expectedPassword) {
    return createErrorResponse(
      ApiErrorCode.SERVICE_UNAVAILABLE,
      'Login is not configured (SCORPION_OPERATOR_PASSWORD missing)',
      undefined,
      503
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return createErrorResponse(ApiErrorCode.INVALID_REQUEST, 'Invalid JSON body', undefined, 400);
  }

  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid request body',
      validation.error.errors,
      400
    );
  }

  const { userId, password } = validation.data;
  if (!timingSafeEqualString(password, expectedPassword)) {
    return createErrorResponse(
      ApiErrorCode.INVALID_CREDENTIALS,
      'Invalid credentials',
      undefined,
      401
    );
  }

  let token: string;
  try {
    token = signToken({
      userId,
      role: 'operator',
      permissions: ['read', 'write', 'api:read', 'api:write'],
    });
  } catch (error) {
    if (error instanceof MissingEnvError) {
      return createErrorResponse(
        ApiErrorCode.SERVICE_UNAVAILABLE,
        'Login is not configured (JWT_SECRET missing)',
        undefined,
        503
      );
    }
    throw error;
  }

  const response = createSuccessResponse({
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    userId,
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return response;
});
