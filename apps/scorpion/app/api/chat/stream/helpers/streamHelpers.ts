// apps/scorpion/app/api/chat/stream/helpers/streamHelpers.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 2: All loops have fixed upper bounds

import { TextEncoder } from 'util';
import { createSSEMessage } from '@/lib/chat/events';
import type { StreamState } from '../phases/streamPhase';

/**
 * Create safe SSE event sender using StreamState
 * Power of 10 Rule 6: Check return values
 * Power of 10 Rule 5: Minimize variable scope - use shared StreamState
 */
export function createSafeSend(
  controller: ReadableStreamDefaultController<Uint8Array>,
  conversationId: string | undefined,
  encoder: TextEncoder,
  streamState: StreamState
): (event: {
  type: string;
  data: Record<string, unknown>;
}) => void {
  return (event: { type: string; data: Record<string, unknown> }) => {
    // Power of 10 Rule 4: Assertions
    if (!event || typeof event !== 'object') {
      console.warn('[Chat Stream] Invalid event object');
      return;
    }

    // Power of 10 Rule 7: Special handling for delta events - send even if aborted
    const isDeltaEvent = event.type === 'delta';
    const isDoneEvent = event.type === 'done';

    if (streamState.closed && !isDeltaEvent && !isDoneEvent) {
      console.warn('[Chat Stream] Attempted to send event but stream is closed:', event.type);
      return;
    }

    if (streamState.aborted && !isDeltaEvent && !isDoneEvent) {
      console.warn('[Chat Stream] Attempted to send event but stream is aborted:', event.type);
      return;
    }

    try {
      const enrichedEvent = {
        ...event,
        data: {
          ...event.data,
          conversationId: conversationId || 'unknown',
        },
      };

      // Log delta events for debugging
      if (event.type === 'delta') {
        const contentLength = (event.data?.content as string)?.length || 0;
        console.log(
          `[Chat Stream] Sending delta event. Content length: ${contentLength}, preview: ${(event.data?.content as string)?.substring(0, 50)}..., aborted: ${streamState.aborted}, closed: ${streamState.closed}`
        );
      } else if (event.type === 'done') {
        console.log('[Chat Stream] Sending done event via safeSend, aborted:', streamState.aborted, 'closed:', streamState.closed);
      }

      controller.enqueue(encoder.encode(createSSEMessage(enrichedEvent)));

      if (event.type === 'delta') {
        console.log('[Chat Stream] Delta event enqueued successfully');
      }
    } catch (error) {
      console.error('[Chat Stream] Error sending SSE event:', error, 'event type:', event.type);
      // Only mark as closed/aborted for non-delta events to allow delta events to continue
      if (!isDeltaEvent) {
        streamState.closed = true;
        streamState.aborted = true;
      }
    }
  };
}

/**
 * Create abort checker using StreamState
 * Power of 10 Rule 3: Small focused function
 * Power of 10 Rule 5: Minimize variable scope - use shared StreamState
 */
export function createCheckAbort(
  signal: AbortSignal,
  streamState: StreamState
): () => void {
  return () => {
    if (signal.aborted || streamState.aborted) {
      throw new Error('Client disconnected');
    }
  };
}

