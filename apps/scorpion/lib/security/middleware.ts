/**
 * Security Middleware for Scorpion API Routes
 *
 * Provides reusable middleware for:
 * - Input validation
 * - Rate limiting
 * - Security headers
 * - Auth checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RateLimiter } from './index';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ApiHandler<T = any> = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse<T>>;

export interface SecurityMiddlewareOptions {
  /** Enable rate limiting */
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  /** Require authentication */
  requireAuth?: boolean;
  /** Validate request body with Zod schema */
  bodySchema?: z.ZodType;
  /** Validate query params with Zod schema */
  querySchema?: z.ZodType;
  /** Custom error handler */
  onError?: (error: Error) => NextResponse;
}

// ============================================================================
// GLOBAL RATE LIMITERS
// ============================================================================

const globalLimiters = new Map<string, RateLimiter>();

function getRateLimiter(key: string, options: { windowMs: number; maxRequests: number }): RateLimiter {
  if (!globalLimiters.has(key)) {
    globalLimiters.set(key, new RateLimiter(options));
  }
  return globalLimiters.get(key)!;
}

// ============================================================================
// MAIN MIDDLEWARE COMPOSER
// ============================================================================

/**
 * Composes multiple security middlewares into a single handler
 *
 * @example
 * ```ts
 * export const POST = withSecurity(
 *   {
 *     rateLimit: { windowMs: 60000, maxRequests: 100 },
 *     bodySchema: z.object({
 *       message: z.string().min(1).max(1000),
 *     }),
 *   },
 *   async (request) => {
 *     const body = await request.json(); // Already validated
 *     // ... your handler logic
 *     return NextResponse.json({ success: true });
 *   }
 * );
 * ```
 */
export function withSecurity<T = any>(
  options: SecurityMiddlewareOptions,
  handler: ApiHandler<T>
): ApiHandler<T> {
  return async (request: NextRequest, context?: any): Promise<NextResponse<T>> => {
    try {
      // 1. Rate Limiting
      if (options.rateLimit) {
        const rateLimitResult = await applyRateLimit(request, options.rateLimit);
        if (rateLimitResult) return rateLimitResult as NextResponse<T>;
      }

      // 2. Authentication (if required)
      if (options.requireAuth) {
        const authResult = await checkAuth(request);
        if (authResult) return authResult as NextResponse<T>;
      }

      // 3. Query Parameter Validation
      if (options.querySchema) {
        const queryResult = await validateQuery(request, options.querySchema);
        if (queryResult) return queryResult as NextResponse<T>;
      }

      // 4. Body Validation (for POST/PUT/PATCH)
      if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const bodyResult = await validateBody(request, options.bodySchema);
        if (bodyResult) return bodyResult as NextResponse<T>;
      }

      // 5. Execute the actual handler
      return await handler(request, context);

    } catch (error) {
      console.error('[Security Middleware] Error:', error);

      if (options.onError) {
        return options.onError(error as Error) as NextResponse<T>;
      }

      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      ) as NextResponse<T>;
    }
  };
}

// ============================================================================
// INDIVIDUAL MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Rate limiting middleware
 */
async function applyRateLimit(
  request: NextRequest,
  options: { windowMs: number; maxRequests: number }
): Promise<NextResponse | null> {
  // Get client identifier (IP or forwarded IP)
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const limiter = getRateLimiter(`rate-limit-${options.windowMs}-${options.maxRequests}`, options);

  if (!limiter.check(clientIp)) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(options.windowMs / 1000)),
        },
      }
    );
  }

  return null;
}

/**
 * Authentication middleware
 * TODO: Implement your actual auth logic here
 */
async function checkAuth(request: NextRequest): Promise<NextResponse | null> {
  // Example: Check for Authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Missing authorization header',
      },
      { status: 401 }
    );
  }

  // TODO: Validate token/session
  // For now, just check it exists
  // In production, verify JWT, session token, API key, etc.

  return null;
}

/**
 * Query parameter validation middleware
 */
async function validateQuery(
  request: NextRequest,
  schema: z.ZodType
): Promise<NextResponse | null> {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    schema.parse(query);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    throw error;
  }
}

/**
 * Body validation middleware
 */
async function validateBody(
  request: NextRequest,
  schema: z.ZodType
): Promise<NextResponse | null> {
  try {
    // Clone the request to read body without consuming it
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();

    schema.parse(body);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    throw error;
  }
}

// ============================================================================
// CONVENIENCE WRAPPERS
// ============================================================================

/**
 * Shorthand for rate-limited endpoints
 *
 * @example
 * ```ts
 * export const POST = withRateLimit(
 *   { windowMs: 60000, maxRequests: 10 },
 *   async (request) => {
 *     // Your handler
 *   }
 * );
 * ```
 */
export function withRateLimit<T = any>(
  options: { windowMs: number; maxRequests: number },
  handler: ApiHandler<T>
): ApiHandler<T> {
  return withSecurity({ rateLimit: options }, handler);
}

/**
 * Shorthand for authenticated endpoints
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (request) => {
 *   // Only runs if authenticated
 *   return NextResponse.json({ data: 'secret' });
 * });
 * ```
 */
export function withAuth<T = any>(handler: ApiHandler<T>): ApiHandler<T> {
  return withSecurity({ requireAuth: true }, handler);
}

/**
 * Shorthand for validated endpoints
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   message: z.string().min(1).max(1000),
 * });
 *
 * export const POST = withValidation(schema, async (request) => {
 *   const body = await request.json(); // Type-safe!
 *   return NextResponse.json({ echo: body.message });
 * });
 * ```
 */
export function withValidation<T = any>(
  schema: z.ZodType,
  handler: ApiHandler<T>
): ApiHandler<T> {
  return withSecurity({ bodySchema: schema }, handler);
}

/**
 * Combines all common security checks
 *
 * @example
 * ```ts
 * export const POST = withFullSecurity(
 *   z.object({ message: z.string() }),
 *   async (request) => {
 *     // Rate limited + authenticated + validated
 *   }
 * );
 * ```
 */
export function withFullSecurity<T = any>(
  bodySchema: z.ZodType,
  handler: ApiHandler<T>
): ApiHandler<T> {
  return withSecurity(
    {
      rateLimit: { windowMs: 60000, maxRequests: 100 },
      requireAuth: true,
      bodySchema,
    },
    handler
  );
}
