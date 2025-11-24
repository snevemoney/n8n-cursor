/**
 * Unified Tool Executor
 *
 * Single source of truth for all tool execution in Scorpion.
 * Consolidates 4 different implementations (processStreamStart, userToolHandler,
 * legacyExecutor, planExecutor) into one secure, tested interface.
 *
 * Security features:
 * - Tool allowlist validation
 * - Parameter schema validation (Zod)
 * - Path traversal prevention
 * - Execution timeouts
 * - Output sanitization
 * - Comprehensive audit logging
 *
 * Following CONTRIBUTING.md principles:
 * - Max 2-level nesting (guard clauses)
 * - Functions <40 lines
 * - Clear naming (validate*, execute*, sanitize*)
 * - Single responsibility
 */

import { z, ZodSchema } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { SendFunction, emitToolStart, emitToolComplete, emitToolError, emitProgress } from './streamEmitter';
import {
  handleToolExecutionError,
  logError,
  normalizeError,
  extractMissingFields,
  formatMissingFieldsError,
  handleMissingFieldsError
} from './errorHandler';
import { executeTool } from '@/server/tools/tool-executor';
import { emitEvent } from '@/lib/telemetry';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ToolExecutionInput {
  toolName: string;
  toolArgs: Record<string, any>;
  toolSchema?: ZodSchema;
  executionContext: {
    send: SendFunction;
    callId: string;
    messageId: string;
    conversationId: string;
    userId?: string;
    projectId?: string;
    workflowId?: string;
  };
  securityContext?: {
    maxExecutionTime?: number;
    allowedTools?: string[];
    sanitizeOutput?: boolean;
    allowedPaths?: string[];
  };
  userMessage: string;
  toolLabel?: string;
}

export interface ToolExecutionResult {
  ok: boolean;
  result?: any;
  error?: string;
  duration: number;
  metadata: {
    toolName: string;
    callId: string;
    cached?: boolean;
    securityFlags?: string[];
  };
}

interface ValidationResult {
  ok: boolean;
  error?: string;
}

interface ParsedArgs {
  ok: boolean;
  args?: any;
  error?: string;
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Execute unified tool
 *
 * Main entry point for all tool execution.
 * Orchestrates validation, parsing, execution, and result handling.
 *
 * Security: Multiple validation layers, timeout enforcement, output sanitization
 */
export async function executeUnifiedTool(
  input: ToolExecutionInput
): Promise<ToolExecutionResult> {
  const { executionContext, toolName, toolArgs, securityContext, toolLabel } = input;
  const { send, callId, messageId } = executionContext;
  const startTime = Date.now();

  // Guard clause: Invalid input
  if (!toolName || !executionContext) {
    const error = 'Invalid tool execution input: missing toolName or executionContext';
    logError('Tool Executor', error);
    return {
      ok: false,
      error,
      duration: 0,
      metadata: { toolName: toolName || 'unknown', callId: callId || 'unknown', securityFlags: ['invalid_input'] },
    };
  }

  // Emit tool start event
  emitToolStart(send, toolName, callId, toolArgs);
  emitProgress(send, 'executing', 30, `Running ${toolLabel || toolName}...`);

  // Step 1: Validate execution is safe
  const validation = await validateToolExecution(input);
  if (!validation.ok) {
    handleToolExecutionError(send, new Error(validation.error), {
      toolName,
      callId,
      args: toolArgs,
      messageId,
      toolLabel: toolLabel || toolName,
    });

    return {
      ok: false,
      error: validation.error,
      duration: Date.now() - startTime,
      metadata: {
        toolName,
        callId,
        securityFlags: ['validation_failed'],
      },
    };
  }

  // Step 2: Execute with sandbox
  const execResult = await executeToolWithSandbox(
    toolName,
    toolArgs,
    securityContext || {},
    callId,
    executionContext.conversationId
  );

  const duration = Date.now() - startTime;

  // Step 3: Handle execution failure
  if (!execResult.ok) {
    handleToolExecutionError(send, new Error(execResult.error), {
      toolName,
      callId,
      args: toolArgs,
      messageId,
      toolLabel: toolLabel || toolName,
    });

    return {
      ok: false,
      error: execResult.error,
      duration,
      metadata: {
        toolName,
        callId,
        securityFlags: execResult.securityFlags || ['execution_failed'],
      },
    };
  }

  // Step 4: Emit success events
  emitProgress(send, 'executing', 90, `${toolLabel || toolName} completed`);
  emitToolComplete(send, toolName, callId, toolArgs, execResult.result);

  // Step 5: Emit telemetry
  await emitToolTelemetry(input, execResult.result, duration);

  return {
    ok: true,
    result: execResult.result,
    duration,
    metadata: {
      toolName,
      callId,
      securityFlags: execResult.securityFlags,
    },
  };
}

// ============================================================================
// Validation Layer
// ============================================================================

/**
 * Validate tool execution is safe
 *
 * Security checks:
 * 1. Tool name is valid
 * 2. Tool is in allowlist (if provided)
 * 3. Parameters match schema
 * 4. File paths are safe
 */
async function validateToolExecution(
  input: ToolExecutionInput
): Promise<ValidationResult> {
  const { toolName, toolArgs, toolSchema, securityContext } = input;

  // Guard clause: Empty tool name
  if (!toolName || typeof toolName !== 'string' || toolName.trim().length === 0) {
    return { ok: false, error: 'Invalid tool name' };
  }

  // Security: Tool allowlist check
  if (securityContext?.allowedTools && securityContext.allowedTools.length > 0) {
    if (!securityContext.allowedTools.includes(toolName)) {
      logError('Tool Executor', `Blocked disallowed tool: ${toolName}`, {
        allowedTools: securityContext.allowedTools,
      });
      return { ok: false, error: `Tool not allowed: ${toolName}` };
    }
  }

  // Security: Validate parameters against schema
  if (toolSchema) {
    try {
      toolSchema.parse(toolArgs);
    } catch (validationError: any) {
      const missingFields = extractMissingFields(validationError);
      if (missingFields.length > 0) {
        const errorMessage = formatMissingFieldsError(
          toolName,
          toolName,
          missingFields,
          input.userMessage
        );
        return { ok: false, error: errorMessage };
      }
      return { ok: false, error: `Invalid parameters: ${validationError.message}` };
    }
  }

  // Security: Validate file paths if present
  if (toolArgs.file || toolArgs.path) {
    const path = toolArgs.file || toolArgs.path;
    const safePath = validateAndSanitizePath(path, securityContext?.allowedPaths);

    if (!safePath) {
      return { ok: false, error: `Invalid file path: ${path}` };
    }
  }

  return { ok: true };
}

/**
 * Validate and sanitize file paths
 *
 * Security: Prevent path traversal attacks
 * - Block ../ patterns
 * - Block absolute paths outside workspace
 * - Check against allowlist if provided
 */
function validateAndSanitizePath(
  path: string,
  allowedPaths?: string[]
): string | null {
  // Guard clause: Invalid input
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Normalize path
  const normalizedPath = path.replace(/\\/g, '/').replace(/\/+/g, '/');

  // Security: Block path traversal
  if (normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
    logError('Security', 'Path traversal attempt blocked', { path });
    return null;
  }

  // Security: Block absolute paths outside workspace
  if (normalizedPath.startsWith('/') && !normalizedPath.startsWith('/workspace')) {
    logError('Security', 'Absolute path outside workspace blocked', { path });
    return null;
  }

  // Security: Check allowlist if provided
  if (allowedPaths && allowedPaths.length > 0) {
    const isAllowed = allowedPaths.some(allowed =>
      normalizedPath.startsWith(allowed)
    );
    if (!isAllowed) {
      logError('Security', 'Path not in allowlist', { path, allowedPaths });
      return null;
    }
  }

  return normalizedPath;
}

// ============================================================================
// Execution Layer
// ============================================================================

/**
 * Execute tool with security sandbox
 *
 * Security features:
 * - Execution timeout (default 2 min)
 * - Error capture and sanitization
 * - Audit logging
 */
async function executeToolWithSandbox(
  toolName: string,
  args: any,
  securityContext: NonNullable<ToolExecutionInput['securityContext']>,
  callId: string,
  conversationId: string
): Promise<{ ok: boolean; result?: any; error?: string; securityFlags?: string[] }> {
  const timeout = securityContext.maxExecutionTime || 120000; // 2 min default
  const securityFlags: string[] = [];

  try {
    // Emit telemetry: tool.requested
    await emitEvent({
      id: uuidv4(),
      type: 'tool.requested',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'chat-stream',
      environment: 'dev',
      data: {
        tool: toolName,
        callId,
        args,
        conversationId,
      },
    });

    // Security: Wrap in timeout
    const result = await Promise.race([
      executeTool(toolName, args),
      new Promise((_, reject) =>
        setTimeout(() => {
          securityFlags.push('timeout');
          reject(new Error(`Tool execution timeout (${timeout}ms)`));
        }, timeout)
      ),
    ]);

    // Security: Sanitize output if requested
    const sanitizedResult = securityContext.sanitizeOutput
      ? sanitizeToolOutput(result)
      : result;

    // Emit telemetry: tool.result
    await emitEvent({
      id: uuidv4(),
      type: 'tool.result',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'chat-stream',
      environment: 'dev',
      data: {
        tool: toolName,
        callId,
        success: true,
        conversationId,
      },
    });

    return { ok: true, result: sanitizedResult, securityFlags };
  } catch (error) {
    const normalized = normalizeError(error);

    logError('Tool Executor', normalized, {
      toolName,
      callId,
      conversationId,
    });

    // Emit telemetry: tool.result (error)
    await emitEvent({
      id: uuidv4(),
      type: 'tool.result',
      severity: 'error',
      timestamp: new Date().toISOString(),
      source: 'chat-stream',
      environment: 'dev',
      data: {
        tool: toolName,
        callId,
        success: false,
        error: normalized.message,
        conversationId,
      },
    });

    securityFlags.push('execution_error');
    return { ok: false, error: normalized.message, securityFlags };
  }
}

/**
 * Sanitize tool output
 *
 * Security: Remove sensitive data from results
 * - Internal paths
 * - Stack traces
 * - Credentials
 */
function sanitizeToolOutput(result: any): any {
  // Guard clause: Null or primitive types
  if (!result || typeof result !== 'object') {
    return result;
  }

  const sanitized = Array.isArray(result) ? [...result] : { ...result };

  // Remove internal paths
  if (typeof sanitized === 'object' && sanitized !== null) {
    if (sanitized.path && typeof sanitized.path === 'string') {
      sanitized.path = sanitized.path.replace(/\/Users\/[^\/]+/, '/workspace');
    }

    // Remove stack traces
    delete sanitized.stack;
    delete sanitized.stackTrace;

    // Remove credentials
    delete sanitized.apiKey;
    delete sanitized.token;
    delete sanitized.password;
    delete sanitized.secret;
    delete sanitized.accessToken;
    delete sanitized.refreshToken;

    // Recursively sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeToolOutput(sanitized[key]);
      }
    });
  }

  return sanitized;
}

// ============================================================================
// Telemetry Layer
// ============================================================================

/**
 * Emit tool telemetry
 *
 * Tracks tool usage for analytics and debugging
 */
async function emitToolTelemetry(
  input: ToolExecutionInput,
  result: any,
  duration: number
): Promise<void> {
  try {
    await emitEvent({
      id: uuidv4(),
      type: 'tool.completed',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'chat-stream',
      environment: 'dev',
      data: {
        tool: input.toolName,
        callId: input.executionContext.callId,
        duration,
        success: true,
        conversationId: input.executionContext.conversationId,
      },
    });
  } catch (error) {
    // Don't fail execution if telemetry fails
    logError('Tool Executor', 'Failed to emit telemetry', { error });
  }
}

// ============================================================================
// Argument Parsing (For User Tool Detection)
// ============================================================================

/**
 * Parse tool arguments from text or JSON
 *
 * Handles:
 * 1. JSON parsing
 * 2. Schema-based inference for text input
 * 3. Common field mapping (message, text, query, content)
 * 4. Array field handling
 *
 * Extracted from: processStreamStart.ts lines ~414-507
 */
export async function parseToolArguments(
  argsText: string,
  schema?: ZodSchema
): Promise<ParsedArgs> {
  // Guard clause: Empty input
  if (!argsText || argsText.trim().length === 0) {
    return { ok: true, args: {} };
  }

  // Try JSON parse first
  try {
    const parsedArgs = JSON.parse(argsText);
    return { ok: true, args: parsedArgs };
  } catch {
    // Not JSON, continue to schema inference
  }

  // If no schema, treat as text input
  if (!schema) {
    return { ok: true, args: { text: argsText } };
  }

  // Use schema introspection to map text to appropriate field
  const inferredArgs = inferArgsFromSchema(argsText, schema);
  return { ok: true, args: inferredArgs };
}

/**
 * Infer arguments from schema
 *
 * Extracted from: processStreamStart.ts lines ~423-483
 */
function inferArgsFromSchema(argsText: string, schema: ZodSchema): any {
  const toolArgs: any = {};

  try {
    const schemaShape = (schema as any)._def?.shape || {};

    if (!schemaShape || Object.keys(schemaShape).length === 0) {
      return { text: argsText };
    }

    const fields = Object.keys(schemaShape);
    const fieldDefs = schemaShape;

    // Check for common text input fields (in priority order)
    const commonTextFields = [
      'message', 'text', 'query', 'content', 'prompt', 'input',
      'question', 'description', 'topic', 'offer', 'productBrief'
    ];

    const foundField = commonTextFields.find(f => fields.includes(f));

    if (foundField) {
      toolArgs[foundField] = argsText;
    } else {
      // Try to infer from field names
      const textLikeFields = fields.filter(f => {
        const fLower = f.toLowerCase();
        return ['text', 'query', 'content', 'input', 'prompt', 'message',
                'question', 'description', 'topic', 'offer', 'brief',
                'subject', 'title'].some(pattern => fLower.includes(pattern));
      });

      if (textLikeFields.length > 0) {
        // Prefer required fields over optional ones
        const requiredField = textLikeFields.find(f => {
          const fieldDef = fieldDefs[f];
          return fieldDef && fieldDef._def?.typeName === 'ZodString';
        });

        const fieldName = requiredField || textLikeFields[0];
        if (fieldName) {
          toolArgs[fieldName] = argsText;
        }
      } else {
        // Default: use first string field or just 'text'
        const firstStringField = fields.find(f => {
          const fieldDef = fieldDefs[f];
          return fieldDef && fieldDef._def?.typeName === 'ZodString';
        });

        if (firstStringField) {
          toolArgs[firstStringField] = argsText;
        } else {
          toolArgs.text = argsText;
        }
      }
    }

    // Handle array fields (e.g., commands[])
    Object.keys(fieldDefs).forEach(key => {
      const fieldDef = fieldDefs[key];
      const innerDef = fieldDef._def?.innerType?._def || fieldDef._def;

      if (innerDef?.typeName === 'ZodArray' && toolArgs[key] === undefined) {
        // If we have text input but field expects array, wrap it
        const textKeys = ['text', 'query', 'content', 'message'];
        const textKey = textKeys.find(k => toolArgs[k]);

        if (textKey) {
          toolArgs[key] = [toolArgs[textKey]];
          delete toolArgs[textKey];
        }
      }
    });

    return toolArgs;
  } catch (error) {
    logError('Tool Executor', 'Failed to infer args from schema', { error });
    return { text: argsText };
  }
}
