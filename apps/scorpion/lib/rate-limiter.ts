/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API routes
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  limit?: number; // Max requests per window
  windowMs?: number; // Time window in milliseconds
  identifier?: string; // Custom identifier (defaults to IP)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const {
    limit = 100,
    windowMs = 60 * 1000 // 1 minute default
  } = options;

  const now = Date.now();
  const key = identifier;
  const stored = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!stored || stored.resetTime < now) {
    // New window
    const resetTime = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime
    };
  }

  // Existing window
  if (stored.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: stored.resetTime
    };
  }

  stored.count++;
  return {
    allowed: true,
    remaining: limit - stored.count,
    resetTime: stored.resetTime
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  return ip.trim();
}

/**
 * Rate limit middleware for Next.js API routes
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options: RateLimitOptions = {}
) {
  return async (request: Request): Promise<Response> => {
    const identifier = options.identifier || getClientIdentifier(request);
    const result = checkRateLimit(identifier, options);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetTime: result.resetTime,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': options.limit?.toString() || '100',
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(request);
    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Limit', (options.limit || 100).toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
}

