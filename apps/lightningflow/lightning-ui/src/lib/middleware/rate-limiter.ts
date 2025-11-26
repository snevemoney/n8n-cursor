import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private readonly cleanupInterval = 60 * 1000; // 1 minute
  
  constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    Array.from(this.requests.entries()).forEach(([key, entry]) => {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    });
  }

  private getKey(req: NextRequest, identifier?: string): string {
    if (identifier) return identifier;
    
    // Try to get user ID from headers/auth
    const userId = req.headers.get('x-user-id');
    if (userId) return `user:${userId}`;
    
    // Fallback to IP address
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `ip:${ip}`;
  }

  async isAllowed(
    req: NextRequest, 
    limit: number = 100, 
    windowMs: number = 60 * 1000,
    identifier?: string
  ): Promise<{ allowed: boolean; resetTime: number; remaining: number }> {
    const key = this.getKey(req, identifier);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let entry = this.requests.get(key);
    
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        lastRequest: now
      };
    }
    
    // Count requests in current window
    if (entry.lastRequest >= windowStart) {
      entry.count++;
    } else {
      entry.count = 1;
      entry.resetTime = now + windowMs;
    }
    
    entry.lastRequest = now;
    this.requests.set(key, entry);
    
    return {
      allowed: entry.count <= limit,
      resetTime: entry.resetTime,
      remaining: Math.max(0, limit - entry.count)
    };
  }
}

const rateLimiter = new RateLimiter();

// Default rate limit configuration
export const defaultRateLimit = {
  limit: 100,
  windowMs: 60 * 1000, // 1 minute
};

// Higher rate limit for authenticated users
export const authenticatedRateLimit = {
  limit: 1000,
  windowMs: 60 * 1000,
};

// Strict rate limit for AI endpoints
export const aiRateLimit = {
  limit: 50,
  windowMs: 60 * 1000,
};

// Legacy RATE_LIMITS export for compatibility
export const RATE_LIMITS = {
  API_STANDARD: defaultRateLimit,
  MONITORING: {
    limit: 60,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  REALTIME: {
    limit: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  EXPENSIVE: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  AUTH: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
  }
};

/**
 * Rate limiting middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { limit?: number; windowMs?: number; identifier?: string } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { limit, windowMs, identifier } = { ...defaultRateLimit, ...options };
    
    try {
      const result = await rateLimiter.isAllowed(req, limit, windowMs, identifier);
      
      if (!result.allowed) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            resetTime: result.resetTime,
            remaining: result.remaining
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }
      
      const response = await handler(req);
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      return response;
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On rate limiter failure, allow the request through
      return handler(req);
    }
  };
}

/**
 * Simple rate limit check without middleware wrapper
 */
export async function checkRateLimit(
  req: NextRequest,
  options: { limit?: number; windowMs?: number; identifier?: string } = {}
): Promise<{ allowed: boolean; resetTime: number; remaining: number }> {
  const { limit, windowMs, identifier } = { ...defaultRateLimit, ...options };
  return rateLimiter.isAllowed(req, limit, windowMs, identifier);
}

export default rateLimiter; 