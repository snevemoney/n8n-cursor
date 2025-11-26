// apps/scorpion/app/api/chat/stream/helpers/deltaStreaming.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 2: All loops have fixed upper bounds
// Power of 10 Rule 6: Check return values

import { MAX_CHUNKS } from './loopHelpers';

// Re-export for convenience
export { MAX_CHUNKS };

/**
 * Stream final answer as delta events
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loop
 * Power of 10 Rule 7: Guard abort - check but continue sending delta events
 */
export function streamFinalAnswer(
  sanitizedSummary: string,
  lightweightMode: boolean,
  send: (event: { type: string; data: Record<string, unknown> }) => void,
  isAborted: () => boolean
): void {
  // Power of 10 Rule 7: Guard empty summary - ensure we always send something
  if (!sanitizedSummary || sanitizedSummary.trim().length === 0) {
    console.warn('[Chat Stream] Empty sanitizedSummary, using fallback');
    sanitizedSummary = 'I apologize, but I was unable to generate a response. Please try again.';
  }

  console.log('[Chat Stream] Starting to stream final answer. Summary length:', sanitizedSummary.length, 'words:', sanitizedSummary.split(' ').length);

  const summaryWords = sanitizedSummary.split(' ');
  // Optimized streaming: MAXIMUM chunk size for snappy responses
  const summaryChunkSize = lightweightMode ? 150 : 100; // Huge chunks = instant streaming
  let deltaChunksSent = 0;

  // Power of 10 Rule 2: Bounded loop - ensure we don't iterate forever
  for (let i = 0; i < summaryWords.length && deltaChunksSent < MAX_CHUNKS; i += summaryChunkSize) {
    // Power of 10 Rule 7: Check abort but don't throw - log and continue if aborted
    // Note: We check manually here to avoid stopping delta streaming
    if (isAborted()) {
      console.warn('[Chat Stream] Stream aborted during delta streaming, but continuing to send remaining chunks');
      // Continue sending - client may still receive them even if connection appears closed
    }

    const chunk = summaryWords.slice(i, i + summaryChunkSize).join(' ');
    if (chunk.trim().length === 0) {
      continue; // Skip empty chunks
    }

    console.log(`[Chat Stream] Sending delta chunk ${deltaChunksSent + 1}, length: ${chunk.length}, content preview: ${chunk.substring(0, 50)}...`);

    // Power of 10 Rule 7: Guard send - ensure send doesn't fail silently
    try {
      send({ type: 'delta', data: { content: (i > 0 ? ' ' : '') + chunk } });
      deltaChunksSent++;
    } catch (sendError) {
      console.error('[Chat Stream] Error sending delta chunk:', sendError);
      // Continue with next chunk - don't fail entire stream
    }
    // No delays - stream as fast as possible
  }

  if (deltaChunksSent >= MAX_CHUNKS) {
    console.warn('[Chat Stream] Reached MAX_CHUNKS limit, truncating response');
  }

  console.log(`[Chat Stream] Finished streaming final answer. Total delta chunks sent: ${deltaChunksSent}`);
}

