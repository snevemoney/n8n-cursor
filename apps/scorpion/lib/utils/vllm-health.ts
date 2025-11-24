/**
 * VLLM Health Check Utilities
 * Checks if VLLM service is available and healthy
 */

import { fetchWithTimeout, isTimeoutError } from './fetch-with-timeout';

export interface VLLMHealthStatus {
  available: boolean;
  healthy: boolean;
  url: string;
  error?: string;
}

/**
 * Check if VLLM service is reachable
 */
export async function checkVLLMReachable(url?: string): Promise<boolean> {
  const vllmUrl = url || process.env.VLLM_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetchWithTimeout(`${vllmUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    // Timeout or connection error - service not reachable
    return false;
  }
}

/**
 * Check VLLM health status with detailed information
 */
export async function checkVLLMHealth(url?: string): Promise<VLLMHealthStatus> {
  const vllmUrl = url || process.env.VLLM_API_URL || 'http://localhost:8000';
  
  try {
    // Check health endpoint
    const healthResponse = await fetchWithTimeout(`${vllmUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (!healthResponse.ok) {
      return {
        available: true,
        healthy: false,
        url: vllmUrl,
        error: `Health check failed: ${healthResponse.status}`
      };
    }
    
    // Try to get models list to verify full functionality
    try {
      const modelsResponse = await fetchWithTimeout(`${vllmUrl}/v1/models`, {
        method: 'GET',
        timeout: 5000,
      });
      
      if (modelsResponse.ok) {
        return {
          available: true,
          healthy: true,
          url: vllmUrl
        };
      }
    } catch (e) {
      // Health endpoint works, but models endpoint might not be available
      // Still consider it healthy if health check passes
    }
    
    return {
      available: true,
      healthy: true,
      url: vllmUrl
    };
  } catch (error: any) {
    if (isTimeoutError(error)) {
      return {
        available: false,
        healthy: false,
        url: vllmUrl,
        error: 'Connection timeout - VLLM may not be running'
      };
    }
    return {
      available: false,
      healthy: false,
      url: vllmUrl,
      error: error.message || 'Connection failed'
    };
  }
}

/**
 * Get list of available models from VLLM
 */
export async function listVLLMModels(url?: string): Promise<string[]> {
  const vllmUrl = url || process.env.VLLM_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetchWithTimeout(`${vllmUrl}/v1/models`, {
      method: 'GET',
      timeout: 10000,
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return (data.data || []).map((model: any) => model.id || model);
  } catch (error) {
    if (isTimeoutError(error)) {
      console.warn('VLLM models list request timed out');
    } else {
      console.error('Failed to list VLLM models:', error);
    }
    return [];
  }
}

