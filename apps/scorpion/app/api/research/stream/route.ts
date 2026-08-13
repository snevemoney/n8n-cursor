/**
 * GET /api/research/stream
 * 
 * Server-Sent Events (SSE) endpoint for real-time browser activity
 * Streams browser actions for a specific research session
 */

import { NextRequest } from 'next/server';
import { getBrowserPool } from '@/lib/research/browser-pool';
import type { BrowserAction } from '@/lib/research/browser-pool';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response(
      JSON.stringify({ error: 'sessionId query parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      // Send initial connection message
      const sendMessage = (type: string, data: any) => {
        if (closed) return;
        try {
          const message = JSON.stringify({ type, data, ts: Date.now() });
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        } catch (error) {
          console.error('[Research Stream] Error sending message:', error);
        }
      };

      sendMessage('connected', { 
        message: 'Browser activity stream connected',
        sessionId 
      });

      try {
        // Get browser pool instance
        const browserPool = await getBrowserPool();

        // Handler for browser actions
        const browserActionHandler = (actionSessionId: string, action: BrowserAction) => {
          // Only send actions for this specific session
          if (actionSessionId === sessionId) {
            sendMessage('browser-action', action);
          }
        };

        // Handler for research completion
        const researchCompleteHandler = (actionSessionId: string, result: any) => {
          if (actionSessionId === sessionId) {
            sendMessage('research-complete', result);
            // Don't close immediately, let client handle it
          }
        };

        // Handler for research failure
        const researchFailedHandler = (actionSessionId: string, errorData: any) => {
          if (actionSessionId === sessionId) {
            sendMessage('research-failed', errorData);
            // Don't close immediately, let client handle it
          }
        };

        // Subscribe to browser pool events
        browserPool.on('browser-action', browserActionHandler);
        browserPool.on('research-complete', researchCompleteHandler);
        browserPool.on('research-failed', researchFailedHandler);

        // Heartbeat to keep connection alive
        const heartbeat = setInterval(() => {
          sendMessage('heartbeat', { ts: Date.now() });
        }, 15000);

        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          closed = true;
          clearInterval(heartbeat);
          browserPool.removeListener('browser-action', browserActionHandler);
          browserPool.removeListener('research-complete', researchCompleteHandler);
          browserPool.removeListener('research-failed', researchFailedHandler);
          try {
            controller.close();
          } catch (error) {
            // Already closed
          }
        });
      } catch (error: any) {
        console.error('[Research Stream] Error:', error);
        sendMessage('error', { 
          message: error.message || 'Failed to initialize stream' 
        });
        closed = true;
        try {
          controller.close();
        } catch (e) {
          // Already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

