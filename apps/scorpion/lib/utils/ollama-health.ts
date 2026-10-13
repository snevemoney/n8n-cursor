/**
 * Check Ollama health status
 */

import { fetchWithRetry, isTimeoutError } from './fetch-with-timeout';

export interface OllamaHealthResult {
  available: boolean;
  healthy: boolean;
  error?: string;
  model?: string;
}

/**
 * Check if Ollama is reachable and healthy
 */
export async function checkOllamaHealth(ollamaUrl?: string): Promise<OllamaHealthResult> {
  const url = ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
  
  try {
    const response = await fetchWithRetry(`${url}/api/tags`, {
      method: 'GET',
      timeout: 5000,
      retries: 2,
      backoffMs: 200,
    });
    
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return { 
        available: true,
        healthy: true,
        model: process.env.OLLAMA_MODEL || 'default',
      };
    } else {
      return { 
        available: true,
        healthy: false,
        error: `Ollama returned status ${response.status}` 
      };
    }
  } catch (error: any) {
    if (isTimeoutError(error)) {
      return { 
        available: false,
        healthy: false,
        error: 'Connection timeout - Ollama may not be running' 
      };
    }
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      return { 
        available: false,
        healthy: false,
        error: `Cannot connect to Ollama at ${url}. Make sure Ollama is running.` 
      };
    }
    return { 
      available: false,
      healthy: false,
      error: error.message || 'Unknown connection error' 
    };
  }
}

