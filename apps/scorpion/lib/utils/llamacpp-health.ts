/**
 * Check llama.cpp server health status
 * Similar pattern to ollama-health.ts and vllm-health.ts
 */

import { fetchWithTimeout, isTimeoutError } from './fetch-with-timeout';

export interface LlamaCppHealthResult {
  available: boolean;
  healthy: boolean;
  error?: string;
  model?: string;
  context?: number;
}

/**
 * Check if llama.cpp server is reachable and healthy
 */
export async function checkLlamaCppHealth(
  baseUrl?: string
): Promise<LlamaCppHealthResult> {
  const url = baseUrl || process.env.LLAMACPP_BASE_URL || 'http://localhost:8033';
  
  try {
    // llama.cpp Web UI may expose health at root or /health
    // Try /health first, fallback to root
    let response: Response;
    try {
      response = await fetchWithTimeout(`${url}/health`, {
        method: 'GET',
        timeout: 5000,
      });
    } catch {
      // Fallback to root endpoint
      response = await fetchWithTimeout(`${url}/`, {
        method: 'GET',
        timeout: 5000,
      });
    }
    
    if (response.ok) {
      // Try to parse response for model info
      try {
        const data = await response.json().catch(() => ({}));
        return {
          available: true,
          healthy: true,
          model: data.model || process.env.LLAMACPP_MODEL || 'default',
          context: data.context_size || data.context,
        };
      } catch {
        // If JSON parse fails, still consider healthy if endpoint responds
        return {
          available: true,
          healthy: true,
          model: process.env.LLAMACPP_MODEL || 'default',
        };
      }
    } else {
      return {
        available: true,
        healthy: false,
        error: `llama.cpp returned status ${response.status}`,
      };
    }
  } catch (error: any) {
    if (isTimeoutError(error)) {
      return {
        available: false,
        healthy: false,
        error: 'Connection timeout - llama.cpp server may not be running',
      };
    }
    
    const errorMsg = error.message || error.toString() || 'Unknown error';
    const isConnectionError = 
      errorMsg.includes('ECONNREFUSED') ||
      errorMsg.includes('fetch failed') ||
      errorMsg.includes('Failed to fetch') ||
      errorMsg.includes('NetworkError') ||
      error.code === 'ECONNREFUSED';
    
    return {
      available: !isConnectionError,
      healthy: false,
      error: isConnectionError
        ? `Cannot connect to llama.cpp at ${url}. Make sure llama.cpp server is running.`
        : errorMsg,
    };
  }
}

