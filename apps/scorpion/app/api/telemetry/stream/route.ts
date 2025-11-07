import { NextRequest } from 'next/server';
import { getTelemetryBus } from '@/lib/telemetry/bus';
import type { DomainEvent, MetricsPoint } from '@/lib/telemetry/schema';

/**
 * GET /api/telemetry/stream
 * 
 * Server-Sent Events (SSE) endpoint for real-time telemetry
 * Streams events as NDJSON with 15s heartbeat
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const bus = getTelemetryBus();
  
  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      
      // Send initial connection message
      const sendMessage = (type: string, data: any) => {
        if (closed) return;
        try {
          const message = JSON.stringify({ type, data, ts: Date.now() }) + '\n';
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        } catch (error) {
          console.error('[Telemetry Stream] Error sending message:', error);
        }
      };
      
      sendMessage('connected', { message: 'Telemetry stream connected' });
      
      // Event handler
      const eventHandler = (event: DomainEvent) => {
        sendMessage('event', event);
      };
      
      // Metrics handler
      const metricsHandler = (metrics: MetricsPoint) => {
        sendMessage('metrics', metrics);
      };
      
      // Subscribe to telemetry bus
      const unsubEvent = bus.onEvent(eventHandler);
      const unsubMetrics = bus.onMetrics(metricsHandler);
      
      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        sendMessage('heartbeat', { ts: Date.now() });
      }, 15000);
      
      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(heartbeat);
        unsubEvent();
        unsubMetrics();
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
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

