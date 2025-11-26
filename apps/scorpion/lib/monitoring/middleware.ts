/**
 * Monitoring Middleware
 * Automatically tracks requests for metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoldenSignalsTracker } from './golden-signals';
import { randomUUID } from 'crypto';

/**
 * Middleware to track HTTP requests
 */
export async function monitoringMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId = randomUUID();
  const tracker = getGoldenSignalsTracker();
  
  const url = new URL(request.url);
  const endpoint = url.pathname;
  const method = request.method;
  
  const startTime = Date.now();
  
  // Track request start
  tracker.startRequest(requestId, endpoint, method);
  
  let response: NextResponse | null = null;
  let statusCode = 200;
  
  try {
    response = await handler(request);
    statusCode = response.status;
    
    const durationMs = Date.now() - startTime;
    
    // Track request completion
    tracker.recordRequest(requestId, endpoint, method, statusCode, durationMs);
    
    // Add custom headers
    if (response) {
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${durationMs}ms`);
    }
    
    return response;
  } catch (error) {
    statusCode = 500;
    const durationMs = Date.now() - startTime;
    
    // Track error
    tracker.recordRequest(requestId, endpoint, method, statusCode, durationMs);
    
    throw error;
  }
}

