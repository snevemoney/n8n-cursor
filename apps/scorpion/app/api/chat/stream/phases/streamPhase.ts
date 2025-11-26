// apps/scorpion/app/api/chat/stream/phases/streamPhase.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 6: Check return values

import { TextEncoder } from 'util';
import { ReadableStreamDefaultController } from 'stream/web';
import { createSSEMessage } from '@/lib/chat/events';
import { assertDefined } from '../helpers/assertions';

export interface StreamState {
  closed: boolean;
  aborted: boolean;
}

/**
 * Create initial stream connection event
 * Power of 10 Rule 3: < 60 lines
 */
export function sendInitialConnectionEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  conversationId: string | undefined,
  encoder: TextEncoder
): boolean {
  // Power of 10 Rule 4: Assertions
  assertDefined(controller, 'Controller must be defined');
  assertDefined(encoder, 'Encoder must be defined');

  try {
    const initialEvent = {
      type: 'status' as const,
      data: {
        message: 'Connected',
        phase: 'initializing' as const,
        conversationId: conversationId || 'unknown',
      },
    };
    const sseMsg = `data: ${JSON.stringify(initialEvent)}\n\n`;
    controller.enqueue(encoder.encode(sseMsg));
    console.log('[Chat Stream] Initial connection event sent');
    return true;
  } catch (error) {
    console.error('[Chat Stream] CRITICAL: Failed to send initial event:', error);
    return false;
  }
}

/**
 * Setup abort listener
 * Power of 10 Rule 3: < 60 lines
 */
export function setupAbortListener(
  signal: AbortSignal,
  state: StreamState,
  controller: ReadableStreamDefaultController<Uint8Array>
): void {
  // Power of 10 Rule 4: Assertions
  assertDefined(signal, 'Signal must be defined');
  assertDefined(state, 'State must be defined');
  assertDefined(controller, 'Controller must be defined');

  signal.addEventListener('abort', () => {
    console.log('[Chat Stream] Client disconnected, aborting stream');
    state.aborted = true;
    state.closed = true;
    try {
      controller.close();
    } catch (error) {
      // Already closed - ignore
    }
  });
}

