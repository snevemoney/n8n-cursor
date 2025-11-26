/**
 * Authentication Endpoint
 * POST /api/security/auth/login - Authenticate and get JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/security/jwt';
import { hash } from '@/lib/security/encryption';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

const loginSchema = z.object({
  userId: z.string().min(1),
  password: z.string().optional(), // For future password-based auth
});

/**
 * POST /api/security/auth/login - Authenticate and get token
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const validation = loginSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid request body',
      validation.error.errors,
      400
    );
  }

  const { userId } = validation.data;

  // TODO: Implement actual user authentication
  // For now, generate token for any valid userId
  const token = signToken({
    userId,
    role: 'user',
    permissions: ['read', 'write'],
  });

  return createSuccessResponse({
    token,
    expiresIn: '24h',
    userId,
  });
});

