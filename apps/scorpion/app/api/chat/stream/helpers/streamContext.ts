// Power of 10 Rule 4: Extract stream context building to focused function
import type { ReadableStreamDefaultController } from 'stream/web';
import type { NextRequest } from 'next/server';
import type { StreamState } from '../phases';
import { sendInitialConnectionEvent, setupAbortListener } from '../phases';
import { createSafeSend, createCheckAbort } from './streamHelpers';

export interface StreamContext {
  streamState: StreamState;
  encoder: TextEncoder;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  checkAbort: () => void;
  controller: ReadableStreamDefaultController<Uint8Array>;
}

/**
 * Build stream context: initialize stream state, encoder, send function, and abort handler
 * Power of 10 Rule 4: Small function (<60 lines)
 */
export function buildStreamContext(
  controller: ReadableStreamDefaultController<Uint8Array>,
  req: NextRequest,
  conversationId: string | undefined
): StreamContext | null {
  const streamState: StreamState = { closed: false, aborted: false };
  const encoder = new TextEncoder();
  
  // Send initial connection event
  const initialSent = sendInitialConnectionEvent(controller, conversationId, encoder);
  if (!initialSent) {
    try {
      controller.close();
    } catch (e) {
      // Ignore close errors
    }
    return null;
  }
  
  // Setup abort listener
  setupAbortListener(req.signal, streamState, controller);
  
  // Create safe send function
  const safeSend = createSafeSend(controller, conversationId, encoder, streamState);
  const send = safeSend;
  
  // Create abort checker
  const checkAbort = createCheckAbort(req.signal, streamState);
  
  return {
    streamState,
    encoder,
    send,
    checkAbort,
    controller,
  };
}


