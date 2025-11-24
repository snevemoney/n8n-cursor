/**
 * Rate Limiter
 * Implements token bucket and sliding window rate limiting
 */

import { query } from '../db/client';
import type { ApiKey, RateLimitCheck } from './types';

export class RateLimiter {
  /**
   * Check if request is within rate limits (sliding window)
   */
  async checkRateLimit(
    apiKey: ApiKey,
    windowType: 'minute' | 'hour' | 'day'
  ): Promise<RateLimitCheck> {
    try {
      if (!process.env.DATABASE_URL) {
        // No DB = no rate limiting
        return {
          allowed: true,
          remaining: 999999,
          resetAt: new Date(Date.now() + 60000).toISOString(),
          limit: 999999,
        };
      }

      const limit = windowType === 'minute' 
        ? apiKey.rateLimitPerMinute 
        : windowType === 'hour'
        ? apiKey.rateLimitPerHour
        : apiKey.rateLimitPerDay;

      // Calculate window start
      const now = new Date();
      let windowStart: Date;
      
      if (windowType === 'minute') {
        windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
      } else if (windowType === 'hour') {
        windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      } else {
        windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      // Get or create rate limit record
      const upsertQuery = `
        INSERT INTO api_rate_limits (api_key_id, window_type, window_start, request_count)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT (api_key_id, window_type, window_start)
        DO UPDATE SET request_count = api_rate_limits.request_count + 1
        RETURNING request_count
      `;

      const result = await query<{ request_count: number }>(upsertQuery, [
        apiKey.id,
        windowType,
        windowStart.toISOString(),
      ]);

      const currentCount = result.rows[0]?.request_count || 0;
      const allowed = currentCount <= limit;

      // Calculate reset time
      let resetAt: Date;
      if (windowType === 'minute') {
        resetAt = new Date(windowStart.getTime() + 60000);
      } else if (windowType === 'hour') {
        resetAt = new Date(windowStart.getTime() + 3600000);
      } else {
        resetAt = new Date(windowStart.getTime() + 86400000);
      }

      return {
        allowed,
        remaining: Math.max(0, limit - currentCount),
        resetAt: resetAt.toISOString(),
        limit,
      };
    } catch (error) {
      console.error('[RateLimiter] Error checking rate limit:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: 999999,
        resetAt: new Date(Date.now() + 60000).toISOString(),
        limit: 999999,
      };
    }
  }

  /**
   * Check all rate limits (minute, hour, day)
   */
  async checkAllLimits(apiKey: ApiKey): Promise<{
    allowed: boolean;
    checks: {
      minute: RateLimitCheck;
      hour: RateLimitCheck;
      day: RateLimitCheck;
    };
  }> {
    const [minuteCheck, hourCheck, dayCheck] = await Promise.all([
      this.checkRateLimit(apiKey, 'minute'),
      this.checkRateLimit(apiKey, 'hour'),
      this.checkRateLimit(apiKey, 'day'),
    ]);

    const allowed = minuteCheck.allowed && hourCheck.allowed && dayCheck.allowed;

    return {
      allowed,
      checks: {
        minute: minuteCheck,
        hour: hourCheck,
        day: dayCheck,
      },
    };
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

