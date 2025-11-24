/**
 * API Gateway
 * Main gateway service for routing, authentication, and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, logApiUsage, createGatewayContext, extractApiKey } from './middleware';
import type { ApiGatewayConfig, GatewayContext } from './types';

export class ApiGateway {
  private config: ApiGatewayConfig;

  constructor(config: Partial<ApiGatewayConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      requireApiKey: config.requireApiKey ?? false,
      defaultRateLimit: config.defaultRateLimit ?? {
        perMinute: 60,
        perHour: 1000,
        perDay: 10000,
      },
      versionPrefix: config.versionPrefix ?? '/api/v1',
    };
  }

  /**
   * Process a request through the gateway
   */
  async processRequest(
    request: NextRequest,
    handler: (req: NextRequest, context: GatewayContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const context = createGatewayContext(request);
    const startTime = Date.now();

    // Skip gateway if disabled
    if (!this.config.enabled) {
      return handler(request, context);
    }

    // Check if API key is required
    if (this.config.requireApiKey) {
      const authResult = await authenticateRequest(request);

      if (!authResult.authenticated) {
        return NextResponse.json(
          { error: authResult.error || 'Authentication failed' },
          { status: authResult.statusCode || 401 }
        );
      }

      context.apiKey = authResult.apiKey;
    } else {
      // Optional API key - try to extract but don't require
      const apiKeyString = extractApiKey(request);
      if (apiKeyString) {
        const keyManager = await import('./key-manager').then(m => m.getApiKeyManager());
        const apiKey = await keyManager.validateKey(apiKeyString);
        if (apiKey) {
          context.apiKey = apiKey;
        }
      }
    }

    // Execute handler
    let response: NextResponse;
    try {
      response = await handler(request, context);
    } catch (error) {
      console.error('[API Gateway] Handler error:', error);
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Log usage if API key was used
    if (context.apiKey) {
      const durationMs = Date.now() - startTime;
      await logApiUsage(context.apiKey, request, response, durationMs);
    }

    // Add rate limit headers
    if (context.apiKey) {
      const rateLimiter = await import('./rate-limiter').then(m => m.getRateLimiter());
      const rateLimitCheck = await rateLimiter.checkAllLimits(context.apiKey);
      
      response.headers.set('X-RateLimit-Limit-Minute', rateLimitCheck.checks.minute.limit.toString());
      response.headers.set('X-RateLimit-Remaining-Minute', rateLimitCheck.checks.minute.remaining.toString());
      response.headers.set('X-RateLimit-Reset-Minute', rateLimitCheck.checks.minute.resetAt);
      
      response.headers.set('X-RateLimit-Limit-Hour', rateLimitCheck.checks.hour.limit.toString());
      response.headers.set('X-RateLimit-Remaining-Hour', rateLimitCheck.checks.hour.remaining.toString());
      response.headers.set('X-RateLimit-Reset-Hour', rateLimitCheck.checks.hour.resetAt);
    }

    return response;
  }
}

// Singleton instance
let gatewayInstance: ApiGateway | null = null;

export function getApiGateway(): ApiGateway {
  if (!gatewayInstance) {
    gatewayInstance = new ApiGateway({
      enabled: process.env.API_GATEWAY_ENABLED !== 'false',
      requireApiKey: process.env.API_GATEWAY_REQUIRE_KEY === 'true',
    });
  }
  return gatewayInstance;
}

