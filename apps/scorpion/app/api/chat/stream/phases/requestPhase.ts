// apps/scorpion/app/api/chat/stream/phases/requestPhase.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 6: Parameter validation

import { NextRequest } from 'next/server';
import { validateRequestData } from '../helpers/requestValidation';
import { assertString, assertDefined } from '../helpers/assertions';

export interface RequestPhaseResult {
  conversationId?: string;
  messages: unknown[];
  mode?: string;
  tools?: unknown;
  provider?: string;
  model?: string;
  clientMode?: string;
  userMessage: string;
}

/**
 * Handle request validation and parsing
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 6: Check validity of parameters
 */
export async function handleRequestPhase(
  req: NextRequest
): Promise<{ success: true; data: RequestPhaseResult } | { success: false; error: Response }> {
  // Power of 10 Rule 4: Assertions
  assertDefined(req, 'Request must be defined');

  let requestData: unknown;
  try {
    requestData = await req.json();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API] Failed to parse request JSON', error);
    return {
      success: false,
      error: new Response(
        JSON.stringify({ error: `Invalid request: ${errorMessage}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Validate request structure
  const validation = validateRequestData(requestData);
  if (!validation.valid) {
    return {
      success: false,
      error: new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Power of 10 Rule 4: Assertions
  assertDefined(validation.data, 'Validation data must be defined');

  const { conversationId, messages, mode, tools, provider, model, clientMode } = validation.data;

  // Extract user message
  // Power of 10 Rule 4: Assertions
  assertDefined(messages, 'Messages must be defined');
  assertArray(messages, 'Messages must be an array');

  // Power of 10 Rule 2: Bounded loop
  const MAX_MESSAGES = 1000;
  const messagesToCheck = Array.isArray(messages) ? messages.slice(0, MAX_MESSAGES) : [];
  let userMessage = '';

  for (let i = messagesToCheck.length - 1; i >= 0; i--) {
    const msg = messagesToCheck[i];
    if (msg && typeof msg === 'object') {
      const msgObj = msg as Record<string, unknown>;
      if (msgObj.role === 'user' && typeof msgObj.content === 'string') {
        userMessage = msgObj.content;
        break;
      }
    }
  }

  // Power of 10 Rule 4: Assertions
  assertString(userMessage, 'User message must be a non-empty string');
  if (userMessage.trim().length === 0) {
    return {
      success: false,
      error: new Response(
        JSON.stringify({ error: 'User message cannot be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return {
    success: true,
    data: {
      conversationId,
      messages: messagesToCheck,
      mode,
      tools,
      provider,
      model,
      clientMode,
      userMessage,
    },
  };
}

// Helper to assert array type
function assertArray(value: unknown, message: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Assertion failed: ${message} - expected array, got ${typeof value}`);
  }
}

