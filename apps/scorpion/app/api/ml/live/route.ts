/**
 * GET /api/ml/live
 * Server-Sent Events stream of live neural network state
 * Streams activations, weights, and training progress in real-time
 */

import { NextResponse } from 'next/server';
import { getSharedAnomalyDetector } from '@/lib/ml/shared-detector';
import { getTelemetryStore } from '@/lib/telemetry/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const detector = getSharedAnomalyDetector();
      const store = getTelemetryStore();

      // Send initial network state
      const sendNetworkState = () => {
        try {
          const status = detector.getStatus();

          if (!status.isTrained) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'status',
                  isTrained: false,
                  message: 'Network not trained yet',
                })}\n\n`
              )
            );
            return;
          }

          // Get recent telemetry for live inference
          const events = store.getRecentEvents(100);

          if (events.length > 0) {
            // Make prediction to get activations
            const prediction = detector.predict(events, 60000);

            // Get network internals (we'll need to expose this in the detector)
            const networkState = detector.getNetworkState?.();

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'inference',
                  prediction,
                  activations: networkState?.activations || [],
                  weights: networkState?.weights || null,
                  timestamp: Date.now(),
                })}\n\n`
              )
            );
          }
        } catch (error) {
          console.error('[ML Live] Error sending network state:', error);
        }
      };

      // Send heartbeat every 2 seconds
      const interval = setInterval(sendNetworkState, 2000);

      // Initial send
      sendNetworkState();

      // Cleanup on close
      return () => {
        clearInterval(interval);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
