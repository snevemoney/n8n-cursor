/**
 * Error Handler Utility
 *
 * Centralized error handling for the chat stream.
 * Eliminates duplication of try/catch blocks (95+ instances across 32 files).
 *
 * Following CONTRIBUTING.md principles:
 * - Single source of truth for error handling
 * - Consistent error logging format
 * - Clear error normalization
 */

import { SendFunction, emitError, emitAssistantMessage } from './streamEmitter';

/**
 * Normalized error structure
 */
export interface NormalizedError {
  message: string;
  code?: string;
  stack?: string;
  originalError?: unknown;
}

/**
 * Error context for logging
 */
export interface ErrorContext {
  component: string;
  operation?: string;
  metadata?: Record<string, any>;
}

/**
 * Normalize an unknown error to a consistent structure
 */
export function normalizeError(error: unknown): NormalizedError {
  if (!error) {
    return {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as any).code,
      stack: error.stack,
      originalError: error,
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR',
    };
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    return {
      message: errorObj.message || errorObj.error || JSON.stringify(error),
      code: errorObj.code,
      stack: errorObj.stack,
      originalError: error,
    };
  }

  return {
    message: String(error),
    code: 'UNEXPECTED_ERROR',
    originalError: error,
  };
}

/**
 * Log an error with consistent formatting
 */
export function logError(
  component: string,
  error: NormalizedError | Error | unknown,
  metadata?: Record<string, any>
): void {
  const normalized = error instanceof Error || isNormalizedError(error)
    ? error
    : normalizeError(error);

  const errorMessage = normalized instanceof Error
    ? normalized.message
    : normalized.message;

  if (metadata && Object.keys(metadata).length > 0) {
    console.error(`[${component}] Error:`, errorMessage, metadata);
  } else {
    console.error(`[${component}] Error:`, errorMessage);
  }

  // Log stack trace if available
  if (normalized instanceof Error && normalized.stack) {
    console.error(`[${component}] Stack:`, normalized.stack);
  } else if (!isError(normalized) && normalized.stack) {
    console.error(`[${component}] Stack:`, normalized.stack);
  }
}

/**
 * Handle a stream error by logging and emitting error event
 */
export function handleStreamError(
  send: SendFunction,
  error: unknown,
  context: ErrorContext
): void {
  const normalized = normalizeError(error);
  logError(context.component, normalized, context.metadata);

  emitError(
    send,
    normalized.message,
    context.operation || 'execution',
    {
      component: context.component,
      code: normalized.code,
    }
  );
}

/**
 * Handle a tool execution error with full context
 */
export function handleToolExecutionError(
  send: SendFunction,
  error: unknown,
  context: {
    toolName: string;
    callId: string;
    args: any;
    messageId: string;
    toolLabel: string;
  }
): void {
  const normalized = normalizeError(error);

  logError('Tool Executor', normalized, {
    tool: context.toolName,
    callId: context.callId,
    args: context.args,
  });

  // Emit tool error event
  send({
    type: 'tool',
    data: {
      tool: context.toolName,
      callId: context.callId,
      args: context.args,
      status: 'error',
      error: normalized.message,
    },
  });

  // Emit error event
  emitError(send, normalized.message, 'execution', {
    tool: context.toolName,
    callId: context.callId,
  });

  // Send final error message
  emitAssistantMessage(
    send,
    context.messageId,
    `**Error executing ${context.toolLabel}**\n\n${normalized.message}`
  );
}

/**
 * Handle validation errors with user-friendly messaging
 */
export function handleValidationError(
  send: SendFunction,
  error: unknown,
  context: {
    phase: string;
    messageId?: string;
    userMessage?: string;
  }
): void {
  const normalized = normalizeError(error);

  logError('Validation', normalized, { phase: context.phase });

  emitError(send, normalized.message, context.phase);

  if (context.messageId) {
    emitAssistantMessage(
      send,
      context.messageId,
      `**Validation Error**\n\n${normalized.message}`
    );
  }
}

/**
 * Extract missing required fields from a Zod validation error
 */
export function extractMissingFields(validationError: any): string[] {
  const missingFields: string[] = [];

  if (!validationError?.errors || !Array.isArray(validationError.errors)) {
    return missingFields;
  }

  // Power of 10 Rule 2: Bounded loop
  const MAX_ERRORS = 1000;
  const errorsToCheck = validationError.errors.slice(0, MAX_ERRORS);

  for (let i = 0; i < errorsToCheck.length; i++) {
    const err = errorsToCheck[i];
    if (!err || typeof err !== 'object') continue;

    const errorObj = err as Record<string, unknown>;
    if (errorObj.code === 'invalid_type' && errorObj.received === 'undefined') {
      const path = errorObj.path;
      if (Array.isArray(path)) {
        missingFields.push(path.join('.'));
      }
    }
  }

  return missingFields;
}

/**
 * Format a user-friendly error message for missing tool parameters
 */
export function formatMissingFieldsError(
  toolName: string,
  toolLabel: string,
  missingFields: string[],
  userMessage: string
): string {
  const slashCmd = userMessage.startsWith('/')
    ? userMessage.split(' ')[0]
    : `/${toolName.replace('user.', '')}`;

  const fieldCount = missingFields.length;
  const fieldLabel = fieldCount === 1 ? 'field' : 'fields';

  return (
    `Missing required ${fieldLabel}: ${missingFields.join(', ')}.\n\n` +
    `Usage: ${slashCmd} <${missingFields[0]}>\n` +
    `Example: ${slashCmd} your description here`
  );
}

/**
 * Handle missing required fields error for tool execution
 */
export function handleMissingFieldsError(
  send: SendFunction,
  context: {
    toolName: string;
    toolLabel: string;
    missingFields: string[];
    userMessage: string;
    callId: string;
    args: any;
    messageId: string;
  }
): void {
  const errorMessage = formatMissingFieldsError(
    context.toolName,
    context.toolLabel,
    context.missingFields,
    context.userMessage
  );

  logError('Tool Validation', errorMessage, {
    tool: context.toolName,
    missingFields: context.missingFields,
  });

  emitError(send, errorMessage, 'validation');

  // Emit tool error
  send({
    type: 'tool',
    data: {
      tool: context.toolName,
      callId: context.callId,
      args: context.args,
      status: 'error',
      error: errorMessage,
    },
  });

  // Send final message
  emitAssistantMessage(
    send,
    context.messageId,
    `**Error executing ${context.toolLabel}**\n\n${errorMessage}`
  );
}

/**
 * Create a safe error response for API boundaries
 */
export function createErrorResponse(error: unknown): {
  ok: false;
  error: string;
  code?: string;
} {
  const normalized = normalizeError(error);
  return {
    ok: false,
    error: normalized.message,
    code: normalized.code,
  };
}

/**
 * Type guard to check if value is an Error
 */
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if value is a NormalizedError
 */
function isNormalizedError(value: unknown): value is NormalizedError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as any).message === 'string'
  );
}
