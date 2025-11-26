/**
 * API Gateway Wrapper
 * Easy-to-use wrapper for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiGateway } from './gateway';
import type { GatewayContext } from './middleware';

/**
 * Wrap an API route handler with API Gateway
 * 
 * @example
 * export const GET = withGateway(async (request, context) => {
 *   // context.apiKey contains the API key if authenticated
 *   return NextResponse.json({ data: '...' });
 * });
 */
export function withGateway(
  handler: (request: NextRequest, context: GatewayContext) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const gateway = getApiGateway();
    return gateway.processRequest(request, handler);
  };
}

/**
 * Optional gateway wrapper - only applies gateway if API key is provided
 * Useful for routes that work with or without authentication
 */
export function withOptionalGateway(
  handler: (request: NextRequest, context: GatewayContext) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const gateway = getApiGateway();
    
    // Temporarily disable requireApiKey to make it optional
    const originalRequireKey = process.env.API_GATEWAY_REQUIRE_KEY;
    process.env.API_GATEWAY_REQUIRE_KEY = 'false';
    
    try {
      return await gateway.processRequest(request, handler);
    } finally {
      // Restore original setting
      if (originalRequireKey !== undefined) {
        process.env.API_GATEWAY_REQUIRE_KEY = originalRequireKey;
      }
    }
  };
}

