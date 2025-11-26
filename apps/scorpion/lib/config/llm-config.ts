/**
 * Centralized LLM configuration
 * Single source of truth for all LLM-related environment variables
 * Reduces scattered process.env reads and provides type safety
 */

export const llmConfig = {
  ollama: {
    url: process.env['OLLAMA_URL'] || 'http://localhost:11434',
    model: process.env['OLLAMA_MODEL'] || 'scorpion:latest',
    enabled: true, // Ollama is always enabled by default
  },
  llamacpp: {
    url: process.env['LLAMACPP_BASE_URL'] || 'http://localhost:8033',
    model: process.env['LLAMACPP_MODEL'] || '',
    enabled: process.env['LLAMACPP_ENABLED'] === 'true' || !!process.env['LLAMACPP_BASE_URL'],
  },
  vllm: {
    url: process.env['VLLM_API_URL'] || 'http://localhost:8000',
    model: process.env['VLLM_MODEL'] || 'mistralai/Mistral-7B-Instruct-v0.2',
    enabled: process.env['VLLM_ENABLED'] === 'true' || !!process.env['VLLM_API_URL'],
  },
  openai: {
    apiKey: process.env['OPENAI_API_KEY'] || '',
    model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
    enabled: !!process.env['OPENAI_API_KEY'],
  },
  providerPriority: process.env['LLM_PROVIDER_PRIORITY']
    ? process.env['LLM_PROVIDER_PRIORITY'].split(',').map(p => p.trim().toLowerCase())
    : ['ollama', 'llamacpp', 'vllm', 'openai'],
} as const;

/**
 * Get enabled providers in priority order
 */
export function getEnabledProviders(): Array<'ollama' | 'llamacpp' | 'vllm' | 'openai'> {
  return llmConfig.providerPriority.filter(provider => {
    switch (provider) {
      case 'ollama':
        return llmConfig.ollama.enabled;
      case 'llamacpp':
        return llmConfig.llamacpp.enabled;
      case 'vllm':
        return llmConfig.vllm.enabled;
      case 'openai':
        return llmConfig.openai.enabled;
      default:
        return false;
    }
  }) as Array<'ollama' | 'llamacpp' | 'vllm' | 'openai'>;
}

/**
 * Check if a provider is enabled
 */
export function isProviderEnabled(provider: 'ollama' | 'llamacpp' | 'vllm' | 'openai'): boolean {
  switch (provider) {
    case 'ollama':
      return llmConfig.ollama.enabled;
    case 'llamacpp':
      return llmConfig.llamacpp.enabled;
    case 'vllm':
      return llmConfig.vllm.enabled;
    case 'openai':
      return llmConfig.openai.enabled;
    default:
      return false;
  }
}

