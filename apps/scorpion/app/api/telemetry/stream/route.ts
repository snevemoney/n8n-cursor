import { NextRequest } from 'next/server';
import { getTelemetryBus } from '@/lib/telemetry/bus';
import { DomainEventSchema, MetricsPointSchema, type DomainEvent, type MetricsPoint } from '@/lib/telemetry/schema';

export const dynamic = 'force-dynamic';

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
      
      // Event handler with validation
      const eventHandler = (event: DomainEvent) => {
        // Validate event before sending to prevent client-side errors
        const validation = DomainEventSchema.safeParse(event);
        if (validation.success) {
          sendMessage('event', validation.data);
        } else {
          console.warn('[Telemetry Stream] Invalid event format, skipping:', {
            error: validation.error.errors,
            event: event
          });
        }
      };
      
      // Metrics handler with validation
      const metricsHandler = (metrics: MetricsPoint) => {
        // Validate metrics before sending
        const validation = MetricsPointSchema.safeParse(metrics);
        if (validation.success) {
          sendMessage('metrics', validation.data);
        } else {
          console.warn('[Telemetry Stream] Invalid metrics format, skipping:', {
            error: validation.error.errors,
            metrics: metrics
          });
        }
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

