// apps/scorpion/app/api/chat/stream/helpers/eventEmitters.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 5: Minimize variable scope
// Power of 10 Rule 6: Check return values

import type { ToolResult } from '@/server/types/tooling';
import type { KnowledgeHit } from '@/server/types/events';
import { MAX_HITS } from './loopHelpers';

/**
 * Emit tool result event
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 6: Check parameters
 */
export function emitToolResult(
  stepId: string,
  tool: string,
  res: ToolResult<any>,
  conversationId: string | undefined,
  send: (event: { type: string; data: Record<string, unknown> }) => void
): void {
  // Power of 10 Rule 4: Assertions
  if (!stepId || typeof stepId !== 'string') {
    console.warn('[Event Emitter] Invalid stepId:', stepId);
    return;
  }
  if (!tool || typeof tool !== 'string') {
    console.warn('[Event Emitter] Invalid tool:', tool);
    return;
  }
  if (!res || typeof res !== 'object') {
    console.warn('[Event Emitter] Invalid result:', res);
    return;
  }

  send({
    type: 'tool_result',
    data: {
      conversationId,
      callId: stepId,
      tool,
      result: res,
    },
  });
}

/**
 * Emit knowledge hits events
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loop
 * Power of 10 Rule 6: Check parameters
 */
export function emitKnowledgeHits(
  hits: KnowledgeHit[],
  conversationId: string | undefined,
  send: (event: { type: string; data: Record<string, unknown> }) => void
): void {
  // Power of 10 Rule 4: Assertions
  if (!Array.isArray(hits)) {
    console.warn('[Event Emitter] Invalid hits array:', hits);
    return;
  }
  // Use default value for conversationId if undefined
  const effectiveConversationId = conversationId || 'default';

  // Power of 10 Rule 2: Bounded loop
  const hitsToEmit = hits.slice(0, MAX_HITS);
  for (let i = 0; i < hitsToEmit.length; i++) {
    const h = hitsToEmit[i];
    if (!h) continue;
    send({
      type: 'knowledge_hit',
      data: {
        conversationId: effectiveConversationId,
        hit: h,
      },
    });
  }
}

/**
 * Create executor event emitter
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 5: Minimize variable scope
 */
export function createExecutorEventEmitter(
  conversationId: string | undefined,
  send: (event: { type: string; data: Record<string, unknown> }) => void,
  emitToolResultFn: (stepId: string, tool: string, res: ToolResult<any>) => void
): (e: any) => void {
  // Use default value for conversationId if undefined
  const effectiveConversationId = conversationId || 'default';

  return (e: any) => {
    if (!e || typeof e !== 'object') {
      return;
    }

    if (e.type === 'tool_call') {
      send({
        type: 'tool',
        data: {
          conversationId: effectiveConversationId,
          tool: e.tool || 'unknown',
          callId: e.callId || 'unknown',
          args: e.args || {},
          status: 'running',
        },
      });
    } else if (e.type === 'tool_result') {
      emitToolResultFn(e.callId || 'unknown', e.tool || 'unknown', e.result);
    }
  };
}

