/**
 * Smart Provider Selection Utility
 * Automatically selects the best available LLM provider based on:
 * - Environment configuration
 * - Provider availability
 * - Health status
 */

import { checkOllamaHealth } from './ollama-health';
import { checkVLLMHealth } from './vllm-health';
import { checkLlamaCppHealth } from './llamacpp-health';

export type Provider = 'ollama' | 'llamacpp' | 'vllm' | 'openai';

export interface ProviderStatus {
  provider: Provider;
  available: boolean;
  healthy: boolean;
  priority: number;
  error?: string;
}

/**
 * Check if OpenAI is configured
 */
function checkOpenAIConfigured(): boolean {
  return !!process.env['OPENAI_API_KEY'] && process.env['OPENAI_API_KEY'].trim().length > 0;
}

/**
 * Get provider priority from environment or use default
 */
function getProviderPriority(): Provider[] {
  const priorityEnv = process.env['LLM_PROVIDER_PRIORITY'];
  
  if (priorityEnv) {
    const providers = priorityEnv.split(',').map(p => p.trim().toLowerCase()) as Provider[];
    // Validate providers
    const validProviders = providers.filter(p => ['ollama', 'llamacpp', 'vllm', 'openai'].includes(p));
    if (validProviders.length > 0) {
      return validProviders as Provider[];
    }
  }
  
  // Default priority: ollama → llamacpp → vllm → openai
  return ['ollama', 'llamacpp', 'vllm', 'openai'];
}

/**
 * Check status of all providers
 */
export async function checkAllProviders(): Promise<ProviderStatus[]> {
  const priority = getProviderPriority();
  const statuses: ProviderStatus[] = [];
  
  for (let i = 0; i < priority.length; i++) {
    const provider = priority[i];
    let available = false;
    let healthy = false;
    let error: string | undefined;
    
    try {
      switch (provider) {
        case 'ollama':
          const ollamaHealth = await checkOllamaHealth();
          available = ollamaHealth.available;
          healthy = ollamaHealth.healthy;
          error = ollamaHealth.error;
          break;
          
        case 'llamacpp':
          // Only check if llama.cpp is enabled
          if (process.env['LLAMACPP_ENABLED'] === 'true' || process.env['LLAMACPP_BASE_URL']) {
            const llamacppHealth = await checkLlamaCppHealth();
            available = llamacppHealth.available;
            healthy = llamacppHealth.healthy;
            error = llamacppHealth.error;
          } else {
            available = false;
            healthy = false;
            error = 'llama.cpp not enabled (set LLAMACPP_ENABLED=true)';
          }
          break;
          
        case 'vllm':
          // Only check if VLLM is enabled
          if (process.env['VLLM_ENABLED'] === 'true' || process.env['VLLM_API_URL']) {
            const vllmHealth = await checkVLLMHealth();
            available = vllmHealth.available;
            healthy = vllmHealth.healthy;
            error = vllmHealth.error;
          } else {
            available = false;
            healthy = false;
            error = 'VLLM not enabled (set VLLM_ENABLED=true)';
          }
          break;
          
        case 'openai':
          available = checkOpenAIConfigured();
          healthy = available; // Assume healthy if configured
          if (!available) {
            error = 'OPENAI_API_KEY not set';
          }
          break;
      }
    } catch (err: any) {
      available = false;
      healthy = false;
      error = err.message || 'Unknown error';
    }
    
    statuses.push({
      provider,
      available,
      healthy,
      priority: i,
      error
    });
  }
  
  return statuses;
}

/**
 * Select the best available provider
 * Returns the first healthy provider in priority order
 */
export async function selectProvider(): Promise<Provider> {
  const statuses = await checkAllProviders();
  
  // Find first healthy provider
  const healthyProvider = statuses.find(s => s.healthy);
  if (healthyProvider) {
    return healthyProvider.provider;
  }
  
  // Fallback to first available (even if not healthy)
  const availableProvider = statuses.find(s => s.available);
  if (availableProvider) {
    return availableProvider.provider;
  }
  
  // Final fallback to OpenAI if configured (even if we can't verify)
  if (checkOpenAIConfigured()) {
    return 'openai';
  }
  
  // Default to ollama (will fail gracefully if not available)
  return 'ollama';
}

/**
 * Get provider status for debugging/monitoring
 */
export async function getProviderStatus(): Promise<{
  selected: Provider;
  all: ProviderStatus[];
  recommendation: string;
}> {
  const statuses = await checkAllProviders();
  const selected = await selectProvider();
  
  const healthyProviders = statuses.filter(s => s.healthy);
  const recommendation = healthyProviders.length > 0
    ? `Using ${selected} (${healthyProviders.length} provider(s) available)`
    : `Warning: No healthy providers found. Using ${selected} as fallback.`;
  
  return {
    selected,
    all: statuses,
    recommendation
  };
}

