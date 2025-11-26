/**
 * Server-Sent Events (SSE) endpoint for real-time browser activity
 * Streams browser actions (navigation, screenshots, etc.) to the frontend
 */

import { NextRequest } from 'next/server';
import { getBrowserPool } from '@/lib/research/browser-pool';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  const encoder = new TextEncoder();
  const browserPool = await getBrowserPool();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = JSON.stringify({ type: 'connected', sessionId });
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      // Listen for browser actions
      const handler = (sid: string, action: any) => {
        if (sid === sessionId) {
          try {
            const data = JSON.stringify({
              type: 'browser_action',
              sessionId,
              action
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (err) {
            console.error('[Browser Events] Failed to send action:', err);
          }
        }
      };

      browserPool.on('browser-action', handler);

      // Listen for research completion
      const completeHandler = (sid: string, result: any) => {
        if (sid === sessionId) {
          try {
            const data = JSON.stringify({
              type: 'research_complete',
              sessionId,
              result
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            controller.close();
          } catch (err) {
            console.error('[Browser Events] Failed to send completion:', err);
          }
        }
      };

      browserPool.on('research-complete', completeHandler);

      // Listen for research failure
      const failHandler = (sid: string, error: any) => {
        if (sid === sessionId) {
          try {
            const data = JSON.stringify({
              type: 'research_failed',
              sessionId,
              error
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            controller.close();
          } catch (err) {
            console.error('[Browser Events] Failed to send error:', err);
          }
        }
      };

      browserPool.on('research-failed', failHandler);

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        browserPool.off('browser-action', handler);
        browserPool.off('research-complete', completeHandler);
        browserPool.off('research-failed', failHandler);
        controller.close();
      });

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch (err) {
          clearInterval(keepAlive);
        }
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
      });
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
