/**
 * Tool I/O Contract Validator v2
 * Ensures all tools return uniform {ok, data, error, meta} format
 */

export interface ToolResult {
  ok: boolean;
  data?: any;
  error?: string;
  meta?: {
    tool: string;
    callId?: string;
    latency?: number;
    timestamp?: string;
    [key: string]: any;
  };
}

/**
 * Validate tool result conforms to contract v2
 */
export function validateToolResult(result: any, toolName: string): ToolResult {
  // If already in correct format, validate structure
  if (result && typeof result === 'object' && 'ok' in result) {
    const validated: ToolResult = {
      ok: result.ok === true,
      data: result.data,
      error: result.error,
      meta: {
        tool: toolName,
        ...result.meta,
      },
    };
    
    // Post-tool validation per tool type
    if (toolName === 'research.run') {
      if (validated.ok && (!validated.data?.sources || !Array.isArray(validated.data.sources) || validated.data.sources.length === 0)) {
        console.warn(`[Tool Validator] research.run returned ok=true but no sources`);
        validated.ok = false;
        validated.error = validated.error || 'Research completed but no sources found';
      }
    }
    
    return validated;
  }
  
  // Convert legacy format to v2
  if (result && typeof result === 'object') {
    // Check for error indicators
    if (result.error || result.status === 'error' || result.status === 'failed') {
      return {
        ok: false,
        error: result.error || result.message || 'Tool execution failed',
        meta: {
          tool: toolName,
          ...result.meta,
        },
      };
    }
    
    // Assume success if no error
    return {
      ok: true,
      data: result,
      meta: {
        tool: toolName,
        ...result.meta,
      },
    };
  }
  
  // Invalid result
  return {
    ok: false,
    error: 'Tool returned invalid result format',
    meta: {
      tool: toolName,
    },
  };
}

/**
 * Wrap tool execution with contract validation
 */
export async function executeToolWithValidation<T>(
  toolName: string,
  executor: () => Promise<T>
): Promise<ToolResult> {
  const startTime = Date.now();
  try {
    const result = await executor();
    const latency = Date.now() - startTime;
    
    const validated = validateToolResult(result, toolName);
    validated.meta = {
      ...validated.meta,
      latency,
      timestamp: new Date().toISOString(),
    };
    
    return validated;
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      ok: false,
      error: error.message || 'Tool execution failed',
      meta: {
        tool: toolName,
        latency,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

