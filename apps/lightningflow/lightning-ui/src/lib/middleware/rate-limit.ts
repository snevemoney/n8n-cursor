/**
 * Rate Limiting Middleware for Lightning Platform API Routes
 * 
 * Protects against abuse of:
 * - OpenAI API calls (/api/ai/*)
 * - Admin analytics (/api/admin/*)
 * - Vector search endpoints
 * - LNURL callbacks
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  skipSuccessfulRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

// In-memory store for development (use Redis in production)
const store = new Map<string, { count: number; resetTime: number }>()

// Default configurations by endpoint type
export const rateLimitConfigs = {
  ai: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 AI requests per minute
  admin: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 admin requests per minute
  vector: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 vector searches per minute
  lnurl: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 LNURL callbacks per minute
  default: { windowMs: 60 * 1000, maxRequests: 60 } // 60 general requests per minute
}

export function createRateLimit(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<{ success: boolean; remaining: number; resetTime: number }> => {
    const key = config.keyGenerator ? config.keyGenerator(req) : getDefaultKey(req)
    const now = Date.now()
    
    // Clean up expired entries
    if (store.size > 1000) {
      for (const [k, v] of Array.from(store.entries())) {
        if (v.resetTime < now) {
          store.delete(k)
        }
      }
    }
    
    const current = store.get(key)
    
    if (!current || current.resetTime < now) {
      // New window
      store.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      }
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }
    
    // Increment counter
    current.count++
    store.set(key, current)
    
    return {
      success: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime
    }
  }
}

function getDefaultKey(req: NextRequest): string {
  // Try to get user ID from auth header first
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    // Extract user ID from JWT or session
    try {
      const token = authHeader.replace('Bearer ', '')
      // In production, decode JWT to get user ID
      // For now, use a hash of the token
      return `user:${token.slice(-8)}`
    } catch {
      // Fall back to IP
    }
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

// Pre-configured rate limiters
export const aiRateLimit = createRateLimit(rateLimitConfigs.ai)
export const adminRateLimit = createRateLimit(rateLimitConfigs.admin)
export const vectorRateLimit = createRateLimit(rateLimitConfigs.vector)
export const lnurlRateLimit = createRateLimit(rateLimitConfigs.lnurl)
export const defaultRateLimit = createRateLimit(rateLimitConfigs.default)

// Middleware wrapper for API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiter: (req: NextRequest) => Promise<{ success: boolean; remaining: number; resetTime: number }>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const result = await limiter(req)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfigs.default.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    const response = await handler(req)
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimitConfigs.default.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    
    return response
  }
}

// Usage example:
// export const POST = withRateLimit(async (req) => {
//   // Your API logic here
//   return NextResponse.json({ success: true })
// }, aiRateLimit) 