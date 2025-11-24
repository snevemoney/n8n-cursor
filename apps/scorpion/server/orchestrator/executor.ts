// Tool Layer v2: Enhanced executor with timeouts, retries, error normalization, and resource awareness

import { ToolResult, ToolInvokeArgs, createScratchpad, ToolERR } from '../types/tooling';
import { EV_ToolCall, EV_ToolResult } from '../types/events';
import { LIGHTWEIGHT_MODE, DISABLE_BROWSER_TOOLS } from '../../lib/config/tool-config';
import { toolRegistry } from '../../lib/orchestrator/tool-registry';

type ToolImpl = <T = unknown>(args: ToolInvokeArgs) => Promise<ToolResult<T>>;

/**
 * Power of 10 Rule 5: Typed error union for normalization
 */
type NormalizableError = 
  | ToolERR
  | { ok: false; error: string; meta?: unknown }
  | { ok: false; error: { code: string; message: string } }
  | Error
  | string
  | unknown;

/**
 * Normalize error to Tool Layer v2 format
 * Handles both old format (error: string) and new format (error: { code, message })
 * Power of 10 Rule 5: Replaced any with typed union
 */
function normalizeError(error: NormalizableError, defaultCode: string = 'RUNTIME_ERROR'): ToolERR {
  // If already in ToolERR format (new format), return as-is
  if (
    error &&
    typeof error === 'object' &&
    'ok' in error &&
    error.ok === false &&
    'error' in error &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'code' in error.error
  ) {
    return error as ToolERR;
  }
  
  // If it's a ToolResult with old format error (error: string)
  if (
    error &&
    typeof error === 'object' &&
    'ok' in error &&
    error.ok === false &&
    typeof (error as { error: unknown }).error === 'string'
  ) {
    const oldFormat = error as { error: string; meta?: { code?: string; details?: unknown } };
    return {
      ok: false,
      error: {
        code: oldFormat.meta?.code || defaultCode,
        message: oldFormat.error,
        details: oldFormat.meta?.details,
      },
      meta: oldFormat.meta,
    };
  }
  
  // If it's a string, convert to ToolERR
  if (typeof error === 'string') {
    return {
      ok: false,
      error: {
        code: defaultCode,
        message: error,
      },
    };
  }
  
  // If it's an Error object, extract message
  if (error instanceof Error) {
    return {
      ok: false,
      error: {
        code: error.name || defaultCode,
        message: error.message || String(error),
        details: error.stack,
      },
    };
  }
  
  // Fallback
  return {
    ok: false,
    error: {
      code: defaultCode,
      message: String(error || 'Unknown error'),
    },
  };
}

/**
 * Execute tool with timeout
 * If timeoutMs is Infinity, skip timeout wrapper and just execute
 */
async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  toolName: string
): Promise<T> {
  // If timeout is Infinity, skip the timeout wrapper entirely
  if (timeoutMs === Infinity || !isFinite(timeoutMs)) {
    return fn();
  }

  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Tool ${toolName} exceeded timeout of ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

export function makeExecutor(
  tools: Record<string, ToolImpl>,
  emit: (e: EV_ToolCall | EV_ToolResult) => void,
) {
  const scratchpads = new Map<string, ReturnType<typeof createScratchpad>>();

  function getPad(conversationId: string) {
    if (!scratchpads.has(conversationId)) {
      scratchpads.set(conversationId, createScratchpad(conversationId));
    }
    return scratchpads.get(conversationId)!;
  }

  /**
   * Power of 10 Rule 3: Helper to check if tool is available and return error if not
   */
  function checkToolAvailability(tool: string, started: number): ToolERR | null {
    if (!toolRegistry.isAvailable(tool)) {
      const toolMeta = toolRegistry.get(tool);
      let reason = 'unknown';
      
      if (LIGHTWEIGHT_MODE && toolMeta?.metadata?.enabledInLiteMode === false) {
        reason = 'disabled in lightweight mode';
      } else if (DISABLE_BROWSER_TOOLS && toolMeta?.tags.includes('browser')) {
        reason = 'browser tools are disabled';
      }
      
      return {
        ok: false,
        error: {
          code: 'DISABLED_IN_LITE_MODE',
          message: `Tool ${tool} is ${reason} on this machine.`,
        },
        meta: {
          took_ms: Date.now() - started,
          retries: 0,
        },
      };
    }
    return null;
    }

  /**
   * Power of 10 Rule 3: Helper to create unknown tool error
   */
  function createUnknownToolError(tool: string, started: number): ToolERR {
    return {
        ok: false,
        error: {
          code: 'UNKNOWN_TOOL',
          message: `Unknown tool: ${tool}`,
        },
        meta: {
          took_ms: Date.now() - started,
          retries: 0,
        },
      };
  }
  
  /**
   * Power of 10 Rule 3: Helper to handle tool execution with retries
   */
  async function executeWithRetries<T>(
    impl: ToolImpl,
    tool: string,
    callId: string,
    conversationId: string,
    args: Record<string, unknown>,
    timeoutMs: number,
    maxRetries: number,
    started: number
  ): Promise<ToolResult<T>> {
    let lastError: NormalizableError | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
        const result = await executeWithTimeout(
          () => impl({ callId, conversationId, args, timeout_ms: timeoutMs, attempt }),
          timeoutMs,
          tool
        );

        const tookMs = Date.now() - started;
      if (result.ok) {
          result.meta = { ...result.meta, took_ms: tookMs, retries: attempt };
          return result;
        }
        
        // Normalize error format
          const normalized = normalizeError(result, 'TOOL_ERROR');
        normalized.meta = { ...normalized.meta, took_ms: tookMs, retries: attempt };
          
          // If we have retries left and it's a retryable error, continue
          if (attempt < maxRetries && shouldRetry(normalized.error.code)) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
            console.log(`[Executor] Tool ${tool} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            lastError = normalized;
            continue;
          }
          
          return normalized;
      } catch (e: unknown) {
        lastError = e;
        
        // Check if it's a timeout
        const errorMessage = e instanceof Error ? e.message : String(e);
        if (errorMessage.includes('exceeded timeout')) {
          const timeoutErr: ToolERR = {
            ok: false,
            error: {
              code: 'TIMEOUT',
              message: `Tool ${tool} exceeded timeout of ${timeoutMs}ms`,
            },
            meta: {
              took_ms: Date.now() - started,
              retries: attempt,
            },
          };
          
          // If we have retries left, continue
          if (attempt < maxRetries) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
            console.log(`[Executor] Tool ${tool} timed out (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }
          
          return timeoutErr;
        }
        
        // Other error - normalize it
        const normalized = normalizeError(e, 'RUNTIME_ERROR');
        normalized.meta = { ...normalized.meta, took_ms: Date.now() - started, retries: attempt };
        
        // If we have retries left and it's a retryable error, continue
        if (attempt < maxRetries && shouldRetry(normalized.error.code)) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`[Executor] Tool ${tool} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
        
        return normalized;
      }
    }
    
    // Should never reach here, but just in case
    const finalErr = normalizeError(lastError, 'RUNTIME_ERROR');
    finalErr.meta = { ...finalErr.meta, took_ms: Date.now() - started, retries: maxRetries };
    return finalErr;
  }
  
  /**
   * Power of 10 Rule 3: Main tool execution function (refactored from 165 lines to ~40 lines)
   */
  async function runTool(
    conversationId: string,
    tool: string,
    args: Record<string, unknown>,
  ): Promise<ToolResult<unknown>> {
    const callId = crypto.randomUUID();
    const started = Date.now();

    emit({ type: 'tool_call', conversationId, callId, tool, args });

    // Check if tool is available
    const availabilityError = checkToolAvailability(tool, started);
    if (availabilityError) {
      emit({ type: 'tool_result', conversationId, callId, tool, result: availabilityError });
      return availabilityError;
    }

    // Check if tool implementation exists
    const impl = tools[tool];
    if (!impl) {
      const err = createUnknownToolError(tool, started);
      emit({ type: 'tool_result', conversationId, callId, tool, result: err });
      return err;
    }

    // Get metadata for timeout and retries
    const toolMeta = toolRegistry.get(tool);
    // If timeoutMs is explicitly 0, use Infinity (no timeout), otherwise default to 60s
    const timeoutMs = toolMeta?.metadata?.timeoutMs === 0
      ? Infinity
      : (toolMeta?.metadata?.timeoutMs || 60_000); // Default 60s
    const maxRetries = toolMeta?.metadata?.maxRetries || 0;

    // Execute with retries
    const result = await executeWithRetries(
      impl,
      tool,
      callId,
      conversationId,
      args,
      timeoutMs,
      maxRetries,
      started
    );

    // Store result and emit event
    const pad = getPad(conversationId);
    pad.put({ callId, tool, timestamp: Date.now(), result });
    emit({ type: 'tool_result', conversationId, callId, tool, result });
    
    return result;
  }

  // Return object with both runTool and getPad
  return Object.assign(runTool, { getPad });
}

/**
 * Determine if an error code is retryable
 */
function shouldRetry(errorCode: string): boolean {
  const retryableCodes = ['TIMEOUT', 'NETWORK_ERROR', 'TEMPORARY_ERROR', 'RATE_LIMIT'];
  return retryableCodes.includes(errorCode);
}

