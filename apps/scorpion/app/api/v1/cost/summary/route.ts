/**
 * API Gateway Wrapped Cost Summary
 * Example of API Gateway integration
 * 
 * This is a versioned API route that uses the gateway
 * Original route: /api/cost/summary
 * Gateway route: /api/v1/cost/summary
 */

import { NextRequest } from 'next/server';
import { withGateway } from '@/lib/api-gateway/with-gateway';
import { GET as originalGet } from '../../cost/summary/route';

/**
 * GET /api/v1/cost/summary - Cost summary with API Gateway
 * 
 * Requires API key if API_GATEWAY_REQUIRE_KEY=true
 */
export const GET = withGateway(async (request, context) => {
  // Log API key usage if present
  if (context.apiKey) {
    console.log(`[API Gateway] Cost summary request from API key: ${context.apiKey.keyName}`);
  }
  
  // Call original handler
  return originalGet(request);
});

