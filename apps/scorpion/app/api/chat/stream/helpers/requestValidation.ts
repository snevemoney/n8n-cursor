// Power of 10 Rule 4: Extract request validation to focused function
import type { Message } from '@/lib/chat/types';
import type { ReadableStreamDefaultController } from 'stream/web';
import { assertArray, assertDefined, assertString } from './assertions';

export interface ValidatedRequest {
  userMessage: string;
  messageId: string;
  filteredHistory: Array<{ role: string; content: string }>;
  conversationHistory: Array<{ role: string; content: string }>;
}

/**
 * Validate request and extract user message
 * Power of 10 Rule 4: Small function (<60 lines)
 */
export async function validateRequest(
  messages: Message[],
  send: (event: { type: string; data: Record<string, unknown> }) => void,
  controller: ReadableStreamDefaultController<Uint8Array>
): Promise<ValidatedRequest | null> {
  // Validate messages array
  assertArray(messages, 'Messages must be an array');
  if (messages.length === 0) {
    send({
      type: 'error',
      data: {
        message: 'Invalid request: messages array must not be empty',
        phase: 'validation',
      },
    });
    controller.close();
    return null;
  }
  
  // Extract user message (last message is the new one)
  const lastMessage = messages[messages.length - 1];
  assertDefined(lastMessage, 'Last message must be defined');
  const userMessage = lastMessage?.content || '';
  assertString(userMessage, 'User message must be a non-empty string');
  
  if (!userMessage) {
    send({
      type: 'error',
      data: {
        message: 'Invalid request: last message must have content',
        phase: 'validation',
      },
    });
    controller.close();
    return null;
  }
  
  // Filter history to only user/assistant messages for strategy system
  const filteredHistory = (Array.isArray(messages) && messages.length > 0)
    ? messages.filter((msg: any) => 
        msg.role === 'user' || msg.role === 'assistant'
      ).map((msg: any) => ({ 
        role: msg.role as 'user' | 'assistant', 
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) 
      })) as Array<{ role: 'user' | 'assistant'; content: string }>
    : [];
  
  // Build conversation history from previous messages (exclude the last one which is the current message)
  const conversationHistory = (Array.isArray(messages) && messages.length > 0)
    ? messages.slice(0, -1)
        .filter((msg: any) => msg && (msg.role === 'user' || msg.role === 'assistant'))
        .map((msg: any) => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content || ''
        }))
    : [];
  
  // Generate message ID
  const { v4: uuidv4 } = await import('uuid');
  const messageId = uuidv4() as string;
  
  return {
    userMessage,
    messageId,
    filteredHistory,
    conversationHistory,
  };
}

/**
 * Validate request data structure
 * Power of 10 Rule 4: Small function (<60 lines)
 */
export function validateRequestData(requestData: unknown): {
  valid: boolean;
  error?: string;
  data?: {
    conversationId?: string;
    messages: unknown[];
    mode?: string;
    tools?: unknown;
    provider?: string;
    model?: string;
    clientMode?: string;
  };
} {
  if (!requestData || typeof requestData !== 'object') {
    return {
      valid: false,
      error: 'Request data must be an object',
    };
  }

  const data = requestData as Record<string, unknown>;

  // Messages is required
  if (!data.messages || !Array.isArray(data.messages)) {
    return {
      valid: false,
      error: 'Request must include a messages array',
    };
  }

  return {
    valid: true,
    data: {
      conversationId: typeof data.conversationId === 'string' ? data.conversationId : undefined,
      messages: data.messages,
      mode: typeof data.mode === 'string' ? data.mode : undefined,
      tools: data.tools,
      provider: typeof data.provider === 'string' ? data.provider : undefined,
      model: typeof data.model === 'string' ? data.model : undefined,
      clientMode: typeof data.clientMode === 'string' ? data.clientMode : undefined,
    },
  };
}
