/**
 * Tool Contract Validator
 * Enforces consistent {ok, data, sources?, ms, error?} schema across all tools
 */

export interface ToolResult {
  ok: boolean;
  data?: any;
  sources?: Array<{
    title: string;
    url: string;
    snippet?: string;
    score?: number;
    [key: string]: any;
  }>;
  ms?: number; // Execution time in milliseconds
  error?: string;
  [key: string]: any; // Allow additional fields for backward compatibility
}

/**
 * Validate and normalize tool result to ensure consistent schema
 */
export function validateToolResult(result: any, toolName: string, startTime?: number): ToolResult {
  // If result is already in correct format, validate and add ms if missing
  if (result && typeof result === 'object' && 'ok' in result) {
    const normalized: ToolResult = {
      ok: result.ok,
    };

    // Add data if present
    if (result.data !== undefined) {
      normalized.data = result.data;
    }

    // Add sources if present (normalize to array format)
    if (result.sources) {
      normalized.sources = Array.isArray(result.sources)
        ? result.sources.map((s: any) => ({
            title: s.title || s.name || 'Untitled',
            url: s.url || '',
            snippet: s.snippet || s.excerpt || s.content || '',
            score: s.score || s.relevance || s.relevanceScore || 0,
            ...s, // Preserve additional fields
          }))
        : [];
    }

    // Add execution time if startTime provided
    if (startTime !== undefined) {
      normalized.ms = Date.now() - startTime;
    } else if (result.ms !== undefined) {
      normalized.ms = result.ms;
    }

    // Add error if present
    if (result.error) {
      normalized.error = typeof result.error === 'string' ? result.error : result.error.message || String(result.error);
    }

    // Preserve other fields for backward compatibility
    Object.keys(result).forEach((key) => {
      if (!['ok', 'data', 'sources', 'ms', 'error'].includes(key)) {
        normalized[key] = result[key];
      }
    });

    return normalized;
  }

  // If result is not in correct format, wrap it
  const normalized: ToolResult = {
    ok: true,
    data: result,
  };

  if (startTime !== undefined) {
    normalized.ms = Date.now() - startTime;
  }

  // Warn about non-standard format
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Tool Contract] Tool ${toolName} returned non-standard format. Wrapped result.`, {
      tool: toolName,
      resultType: typeof result,
      hasOk: result && typeof result === 'object' && 'ok' in result,
    });
  }

  return normalized;
}

/**
 * Normalize error result
 */
export function normalizeErrorResult(error: any, toolName: string, startTime?: number): ToolResult {
  const normalized: ToolResult = {
    ok: false,
    error: error?.message || error?.error || String(error || 'Unknown error'),
  };

  if (startTime !== undefined) {
    normalized.ms = Date.now() - startTime;
  }

  // Preserve error details in data field for debugging
  if (process.env.NODE_ENV === 'development' && error) {
    normalized.data = {
      stack: error.stack,
      name: error.name,
      ...error,
    };
  }

  return normalized;
}

