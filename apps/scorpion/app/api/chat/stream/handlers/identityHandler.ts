// Phase 1.1: Extract identity handler from helpers/intentHandlers.ts
// Power of 10 Rule 4: Small, focused module for identity intent handling

import type { ReadableStreamDefaultController } from 'stream/web';
import type { StreamState } from '../phases';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { runModelUnified } from '@/lib/chat/modelRunner';

/**
 * Resolve prompt file path correctly regardless of cwd
 */
function getPromptPath(filename: string): string {
  const cwd = process.cwd();

  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }

  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }

  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);

  return fallbackPath;
}

/**
 * Handle identity intent - direct answer without tools/planner/council
 * Power of 10 Rule 4: Small function (<60 lines)
 *
 * @returns true if handled (stream closed), false if should fall through
 */
export async function tryHandleIdentityIntent(params: {
  userMessage: string;
  conversationId: string | undefined;
  model: string | undefined;
  provider: string | undefined;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  streamState: StreamState;
  controller: ReadableStreamDefaultController<Uint8Array>;
  messageId: string;
}): Promise<boolean> {
  const {
    userMessage,
    model,
    provider,
    send,
    streamState,
    controller,
    messageId,
  } = params;

  try {
    // Load identity prompt
    const identityPromptPath = getPromptPath('identity.system.txt');
    if (!existsSync(identityPromptPath)) {
      throw new Error(`Identity prompt file not found: ${identityPromptPath}`);
    }
    const identityPrompt = readFileSync(identityPromptPath, 'utf-8');
    if (!identityPrompt || identityPrompt.trim().length === 0) {
      throw new Error('Identity prompt file is empty');
    }
    console.log('[Prompt] using identity.system.txt for intent: identity');

    // Stream direct LLM response without planner/council/tools
    const defaultModel = model || process.env['OLLAMA_MODEL'] || 'scorpion:latest';

    // Add timeout for identity response (10 seconds)
    const identityTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Identity response timeout after 10s')), 10000);
    });

    const identityResponse = runModelUnified(
      identityPrompt,
      userMessage,
      {
        provider: provider || 'ollama',
        model: defaultModel,
        maxTokens: 500,
        temperature: 0.4
      },
      (chunk: string) => {
        send({ type: 'delta', data: { content: chunk } });
      }
    );

    await Promise.race([identityResponse, identityTimeout]);

    // Send final message
    send({ type: 'done', data: { messageId } });
    streamState.closed = true;
    controller.close();
    return true; // Handled
  } catch (error: unknown) {
    console.error('[Chat Stream] Error handling identity intent:', error);
    send({
      type: 'error',
      data: {
        message: 'Failed to load identity configuration. Please check server logs.',
        phase: 'identity',
      },
    });
    controller.close();
    return true; // Handled (even if error)
  }
}
