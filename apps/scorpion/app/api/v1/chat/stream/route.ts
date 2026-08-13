/**
 * API Gateway Wrapped Chat Stream
 * Example of API Gateway integration
 * 
 * This is a versioned API route that uses the gateway
 * Original route: /api/chat/stream
 * Gateway route: /api/v1/chat/stream
 */

import { NextRequest } from 'next/server';
import { withOptionalGateway } from '@/lib/api-gateway/with-gateway';
import { POST as originalPost } from '../../chat/stream/route';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/chat/stream - Chat stream with API Gateway
 * 
 * Requires API key if API_GATEWAY_REQUIRE_KEY=true
 * Optional API key if API_GATEWAY_REQUIRE_KEY=false
 */
export const POST = withOptionalGateway(async (request, context) => {
  // Log API key usage if present
  if (context.apiKey) {
    console.log(`[API Gateway] Chat stream request from API key: ${context.apiKey.keyName}`);
  }
  
  // Call original handler
  return originalPost(request);
});

