// Power of 10 Rule 4: Extract large function to separate file
// This reduces file size and fixes TypeScript parser limitations

import { NextRequest } from 'next/server';
import type { ReadableStreamDefaultController } from 'stream/web';
import type { Message } from '@/lib/chat/types';

// Re-export types and functions needed by processStreamStart
export type { StreamState } from '../types';

// Import all helper functions
import {
  sendInitialConnectionEvent,
  setupAbortListener,
  createSafeSend,
  createCheckAbort,
  emitToolResult,
  emitKnowledgeHits,
  createToolRegistry,
  createExecutorEventEmitter,
  createChatJob,
  failChatJob,
  completeChatJob,
} from '../helpers';

// Import all other dependencies
import { makeExecutor } from '@/lib/executor';
import { handleExecutorPhase } from '@/lib/executor/phases';
import { buildSummarizerContext } from '@/lib/chat/summarizer';
import { tools } from '@/lib/chat/tools';
import type { ToolResult } from '@/lib/chat/types';
import type { KnowledgeHit } from '@/lib/knowledge/types';

/**
 * Main stream processing handler
 * Extracted from route.ts to reduce file size and fix TypeScript parser issues
 */
export async function processStreamStart(
  controller: ReadableStreamDefaultController<Uint8Array>,
  req: NextRequest,
  conversationId: string | undefined,
  messages: Message[],
  mode: string | undefined,
  requestedTools: string[] | undefined,
  provider: string | undefined,
  model: string | undefined,
  clientMode: string | undefined
): Promise<void> {
  // This function body will be moved here from route.ts
  // For now, this is a placeholder to fix the parser issue
  throw new Error('processStreamStart implementation needs to be moved here from route.ts');
}
