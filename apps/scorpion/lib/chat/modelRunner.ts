import { runModel } from '@scorpion/core';
import { getRecommendedModelForRAM } from '../utils/modelSelector';
import { ensureOllamaRunning } from '../utils/ollama-auto-start';
import { checkOllamaHealth } from '../utils/ollama-health';
import { checkVLLMHealth } from '../utils/vllm-health';
import { checkLlamaCppHealth } from '../utils/llamacpp-health';

/**
 * Unified model runner supporting Ollama (local), llama.cpp (local), VLLM (GPU), and OpenAI (cloud fallback)
 */

export interface ModelConfig {
  provider: 'ollama' | 'llamacpp' | 'vllm' | 'openai';
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * Power of 10 Rule 3: Split long function into focused helpers
 */

/**
 * Determine provider priority from environment or use defaults
 */
function getProviderPriority(config: { provider?: string }): string[] {
  const providerPriority = process.env['LLM_PROVIDER_PRIORITY']
    ? process.env['LLM_PROVIDER_PRIORITY'].split(',').map(p => p.trim().toLowerCase())
    : ['ollama', 'llamacpp', 'vllm', 'openai'];

  const explicitProvider = config.provider?.toLowerCase();
  if (explicitProvider && ['ollama', 'llamacpp', 'vllm', 'openai'].includes(explicitProvider)) {
    providerPriority.unshift(explicitProvider);
  }

  return providerPriority;
}

/**
 * Check if model is local-only (should not fallback to OpenAI)
 */
function isLocalOnlyModel(modelName: string): boolean {
  const lower = modelName.toLowerCase();
  return lower.includes('scorpion') ||
    lower.startsWith('llama') ||
    lower.startsWith('mistral') ||
    lower.startsWith('phi') ||
    lower.startsWith('qwen') ||
    lower.startsWith('gemma') ||
    lower.startsWith('neural-chat') ||
    lower.startsWith('starling') ||
    lower.startsWith('codellama') ||
    lower.startsWith('deepseek') ||
    lower.includes(':latest') ||
    lower.includes(':instruct') ||
    lower.includes(':chat');
}

/**
 * Filter provider priority to exclude OpenAI for local-only models
 */
function filterProviderPriority(providerPriority: string[], modelName: string): string[] {
  return isLocalOnlyModel(modelName)
    ? providerPriority.filter(p => p !== 'openai')
    : providerPriority;
}

/**
 * Create typed model config for a provider
 */
function createTypedConfig(
  provider: string,
  config: { model: string; maxTokens?: number; temperature?: number },
  onChunk?: (chunk: string) => void
): ModelConfig {
  return {
    provider: provider as 'ollama' | 'llamacpp' | 'vllm' | 'openai',
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    stream: onChunk ? true : undefined
  };
}

/**
 * Try running a specific provider
 */
async function tryProvider(
  provider: string,
  systemPrompt: string,
  userPrompt: string,
  config: { model: string; maxTokens?: number; temperature?: number },
  onChunk?: (chunk: string) => void,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const typedConfig = createTypedConfig(provider, config, onChunk);

  if (provider === 'ollama') {
    return await runOllama(systemPrompt, userPrompt, typedConfig, onChunk, conversationHistory);
  } else if (provider === 'llamacpp') {
    if (process.env.LLAMACPP_ENABLED === 'true' || process.env.LLAMACPP_BASE_URL) {
      return await runLlamaCpp(systemPrompt, userPrompt, typedConfig, onChunk, conversationHistory);
    }
    throw new Error('llamacpp not enabled');
  } else if (provider === 'vllm') {
    if (process.env.VLLM_ENABLED === 'true' || process.env.VLLM_API_URL) {
      return await runVLLM(systemPrompt, userPrompt, typedConfig, onChunk, conversationHistory);
    }
    throw new Error('vllm not enabled');
  } else if (provider === 'openai') {
    return await runOpenAI(systemPrompt, userPrompt, typedConfig, onChunk, conversationHistory);
  }

  throw new Error(`Unknown provider: ${provider}`);
}

/**
 * Run model with unified interface and automatic fallback
 * Supports cascading fallback: ollama → llamacpp → vllm → openai
 * Supports LLM_PRIMARY, LLM_FALLBACK, and LLM_PROVIDER_PRIORITY environment variables
 */
export async function runModelUnified(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; maxTokens?: number; temperature?: number },
  onChunk?: (chunk: string) => void,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const providerPriority = getProviderPriority(config);
  const filteredPriority = filterProviderPriority(providerPriority, config.model || '');

  let lastError: Error | null = null;

  for (const provider of filteredPriority) {
    try {
      return await tryProvider(provider, systemPrompt, userPrompt, config, onChunk, conversationHistory);
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMsg = lastError.message || String(error);
      console.warn(`[Model Runner] ${provider} failed: ${errorMsg.substring(0, 100)}`);
      continue;
    }
  }

  if (lastError) {
    throw new Error(`All providers failed. Last error from ${filteredPriority[filteredPriority.length - 1]}: ${lastError.message}`);
  }

  throw new Error('No providers available. Configure at least one: ollama, llamacpp, vllm, or openai');
}

/**
 * Run Ollama model with streaming support
 */
async function runOllama(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
  onChunk?: (chunk: string) => void,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  // Prefer scorpion:latest (personal training AI) as default
  const model = config.model || process.env.OLLAMA_MODEL || 'scorpion:latest';

  // Ensure Ollama is running before making requests
  try {
    const ollamaStatus = await ensureOllamaRunning(ollamaUrl);
    if (!ollamaStatus.running) {
      // If we tried to start it but it's still not running, wait a bit more
      if (ollamaStatus.started) {
        // Give it a moment to fully start
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retryStatus = await ensureOllamaRunning(ollamaUrl);
        if (!retryStatus.running) {
          throw new Error('Ollama server is not running. Please start it manually: `ollama serve`');
        }
      } else {
        throw new Error('Ollama server is not running. Please start it manually: `ollama serve`');
      }
    }
  } catch (autoStartError: any) {
    // If auto-start fails, we'll try the request anyway - it might work
    console.warn('Ollama auto-start check failed:', autoStartError.message);
  }

  try {
    // Build messages array with conversation history (like chatbot-ui)
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      // Include conversation history if provided
      ...(conversationHistory || []),
      // Add current user message
      { role: 'user' as const, content: userPrompt }
    ];

    // If streaming callback provided, use streaming API directly
    // Note: For non-streaming, we use runModel from @scorpion/core which has retry logic
    if (onChunk) {
      const controller = new AbortController();
      // Use longer timeout for remote servers (CPU-only inference is slower)
      const isRemote = ollamaUrl.startsWith('https://') || ollamaUrl.includes('n8ncloud.tech') || ollamaUrl.includes('lightningflow.online');
      const timeoutMs = isRemote ? 120000 : 30000; // 2 minutes for remote, 30s for local
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response | undefined;
      let retryCount = 0;
      const maxRetries = 1;

      while (retryCount <= maxRetries) {
        try {
          response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              messages,
              stream: true,
              options: {
                temperature: config.temperature || 0.7,
                num_predict: config.maxTokens || 2048
              }
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          break; // Success, exit retry loop
        } catch (fetchError: any) {
          clearTimeout(timeoutId);

          // If it's a retry after start, wait and try again
          if (fetchError.message === 'RETRY_AFTER_START' && retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }

          if (fetchError.name === 'AbortError') {
            const timeoutSeconds = timeoutMs / 1000;
            throw new Error(`Request timeout after ${timeoutSeconds}s. Ollama may be slow or unresponsive.\n\nCheck:\n- Ollama is running: \`ollama serve\`\n- Model is available: \`ollama list\`\n- URL is correct: ${ollamaUrl}\n- For remote servers, CPU-only inference can be slow (consider using local Ollama for faster responses)`);
          }

          // Check for connection errors - catch various error message formats
          const errorMsg = fetchError.message || fetchError.toString() || '';
          const isConnectionError =
            errorMsg.includes('ECONNREFUSED') ||
            errorMsg.includes('fetch failed') ||
            errorMsg.includes('Failed to fetch') ||
            errorMsg.includes('NetworkError') ||
            errorMsg.includes('ERR_CONNECTION_REFUSED') ||
            fetchError.code === 'ECONNREFUSED' ||
            fetchError.cause?.code === 'ECONNREFUSED';

          if (isConnectionError && retryCount < maxRetries) {
            // Try to auto-start Ollama before giving up
            try {
              const ollamaStatus = await ensureOllamaRunning(ollamaUrl);
              if (ollamaStatus.running || ollamaStatus.started) {
                // Wait a moment for it to be ready, then retry
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
                continue; // Retry the fetch
              }
            } catch (retryError: any) {
              // Auto-start failed, continue to error handling
            }
          }

          // If we've exhausted retries or it's not a connection error, throw
          if (isConnectionError) {
            throw new Error(`Cannot connect to Ollama at ${ollamaUrl}\n\nTroubleshooting:\n1. Start Ollama: \`ollama serve\`\n2. Check if Ollama is running: \`curl ${ollamaUrl}/api/tags\`\n3. Verify the URL in your .env file\n4. Make sure Ollama is accessible from this server`);
          }

          throw new Error(`Ollama request failed: ${errorMsg}`);
        }
      }

      // Ensure response was successfully obtained
      if (!response) {
        throw new Error('Failed to get response from Ollama after retries');
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorMessage = `Ollama API error (${response.status})`;

        if (response.status === 404) {
          errorMessage = `Model "${model}" not found.\n\nTry:\n- Pull the model: \`ollama pull ${model}\`\n- List available models: \`ollama list\`\n- Check model name spelling`;
        } else if (response.status === 500) {
          errorMessage = `Ollama server error. Check Ollama logs for details.`;
        }

        throw new Error(`${errorMessage}\n\nResponse: ${errorText.substring(0, 200)}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        try {
          // Power of 10 Rule 2: Explicit max iteration counter
          const MAX_ITERATIONS = 10000;
          let iteration = 0;

          while (iteration < MAX_ITERATIONS) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const data = JSON.parse(line);
                if (data.error) {
                  throw new Error(`Ollama error: ${data.error}`);
                }
                if (data.message?.content) {
                  const content = data.message.content;
                  fullContent += content;
                  onChunk(content);
                }
              } catch (e: any) {
                // If it's a JSON parse error, skip (might be incomplete line)
                if (e.message && !e.message.includes('JSON')) {
                  throw e; // Re-throw if it's not a parse error
                }
              }
            }

            iteration++;
          }

          if (iteration >= MAX_ITERATIONS) {
            throw new Error(`Stream processing exceeded max iterations (${MAX_ITERATIONS})`);
          }
        } catch (readError: any) {
          throw new Error(`Error reading Ollama stream: ${readError.message}`);
        }
      }

      return fullContent;
    } else {
      // Non-streaming fallback
      const response = await runModel({
        prompt: userPrompt,
        system: systemPrompt,
        model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });

      return response.content;
    }
  } catch (error: any) {
    // Don't wrap if it's already a helpful error message
    const errorMsg = error.message || error.toString() || 'Unknown error';
    if (errorMsg.includes('Troubleshooting:') || errorMsg.includes('Cannot connect')) {
      throw error;
    }

    // Check if it's a connection error that wasn't caught earlier
    const isConnectionError =
      errorMsg.includes('fetch failed') ||
      errorMsg.includes('ECONNREFUSED') ||
      errorMsg.includes('Failed to fetch') ||
      errorMsg.includes('NetworkError');

    if (isConnectionError) {
      throw new Error(`Cannot connect to Ollama at ${ollamaUrl}\n\nTroubleshooting:\n1. Start Ollama: \`ollama serve\`\n2. Check if Ollama is running: \`curl ${ollamaUrl}/api/tags\`\n3. Verify the URL in your .env file\n4. Make sure Ollama is accessible from this server`);
    }

    // Provide helpful error context for other errors
    throw new Error(`Ollama error: ${errorMsg}\n\nOllama URL: ${ollamaUrl}\nModel: ${model}\n\nTroubleshooting:\n1. Check Ollama is running: \`ollama serve\`\n2. Verify model exists: \`ollama list\`\n3. Test connection: \`curl ${ollamaUrl}/api/tags\``);
  }
}

/**
 * Run llama.cpp model with streaming support
 */
async function runLlamaCpp(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
  onChunk?: (chunk: string) => void,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const llamacppUrl = process.env.LLAMACPP_BASE_URL || 'http://localhost:8033';
  const model = config.model || process.env.LLAMACPP_MODEL || '';

  try {
    // Check llama.cpp health before making request
    const health = await checkLlamaCppHealth(llamacppUrl);
    if (!health.healthy) {
      throw new Error(`llama.cpp is not healthy: ${health.error || 'Unknown error'}`);
    }

    // Build messages array with conversation history
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...(conversationHistory || []),
      { role: 'user' as const, content: userPrompt }
    ];

    if (onChunk) {
      // Streaming API - llama.cpp Web UI uses OpenAI-compatible format
      const controller = new AbortController();
      const isRemote = llamacppUrl.startsWith('https://') || llamacppUrl.includes('n8ncloud.tech') || llamacppUrl.includes('lightningflow.online');
      const timeoutMs = isRemote ? 120000 : 60000; // 2 minutes for remote, 1 minute for local
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response;
      try {
        // llama.cpp Web UI typically uses /api/chat or /v1/chat/completions
        // Try OpenAI-compatible endpoint first
        response = await fetch(`${llamacppUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model || 'default',
            messages,
            stream: true,
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 2048,
          }),
          signal: controller.signal,
        });

        // If OpenAI endpoint fails, try custom /api/chat endpoint
        if (!response.ok && response.status === 404) {
          response = await fetch(`${llamacppUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages,
              stream: true,
              temperature: config.temperature || 0.7,
              max_tokens: config.maxTokens || 2048,
              ...(model ? { model } : {}),
            }),
            signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          const timeoutSeconds = timeoutMs / 1000;
          throw new Error(`Request timeout after ${timeoutSeconds}s. llama.cpp may be slow or unresponsive.\n\nCheck:\n- llama.cpp server is running\n- Model is loaded\n- URL is correct: ${llamacppUrl}`);
        }

        const errorMsg = fetchError.message || fetchError.toString() || '';
        const isConnectionError =
          errorMsg.includes('ECONNREFUSED') ||
          errorMsg.includes('fetch failed') ||
          errorMsg.includes('Failed to fetch') ||
          errorMsg.includes('NetworkError') ||
          fetchError.code === 'ECONNREFUSED' ||
          fetchError.cause?.code === 'ECONNREFUSED';

        if (isConnectionError) {
          throw new Error(`Cannot connect to llama.cpp at ${llamacppUrl}\n\nTroubleshooting:\n1. Start llama.cpp server: \`./llama-server --model <model.gguf> --port 8033\`\n2. Check if server is running: \`curl ${llamacppUrl}/health\`\n3. Verify the URL in your .env file`);
        }

        throw new Error(`llama.cpp request failed: ${errorMsg}`);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorMessage = `llama.cpp API error (${response.status})`;

        if (response.status === 404) {
          errorMessage = `Model or endpoint not found.\n\nCheck:\n- Model is loaded in llama.cpp server\n- Endpoint URL is correct: ${llamacppUrl}`;
        } else if (response.status === 500) {
          errorMessage = `llama.cpp server error. Check server logs for details.`;
        }

        throw new Error(`${errorMessage}\n\nResponse: ${errorText.substring(0, 200)}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        try {
          // Power of 10 Rule 2: Explicit max iteration counter
          const MAX_ITERATIONS = 10000;
          let iteration = 0;

          while (iteration < MAX_ITERATIONS) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.trim()) continue;

              // Handle OpenAI SSE format: "data: {...}" or "data: [DONE]"
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta;

                  if (delta?.content) {
                    const content = delta.content;
                    fullContent += content;
                    onChunk(content);
                  }

                  if (parsed.error) {
                    throw new Error(`llama.cpp stream error: ${parsed.error.message || 'Unknown error'}`);
                  }
                } catch (e: any) {
                  if (e.message && !e.message.includes('JSON')) {
                    throw e;
                  }
                }
              } else {
                // Handle custom format (Ollama-like)
                try {
                  const data = JSON.parse(line);
                  if (data.error) {
                    throw new Error(`llama.cpp error: ${data.error}`);
                  }
                  const content = data.message?.content || data.content || data.delta?.content;
                  if (content) {
                    fullContent += content;
                    onChunk(content);
                  }
                } catch (e: any) {
                  if (e.message && !e.message.includes('JSON')) {
                    throw e;
                  }
                }
              }
            }

            iteration++;
          }

          if (iteration >= MAX_ITERATIONS) {
            throw new Error(`Stream processing exceeded max iterations (${MAX_ITERATIONS})`);
          }
        } catch (readError: any) {
          throw new Error(`Error reading llama.cpp stream: ${readError.message}`);
        }
      }

      return fullContent;
    } else {
      // Non-streaming fallback
      let response: Response;
      try {
        // Try OpenAI-compatible endpoint first
        response = await fetch(`${llamacppUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model || 'default',
            messages,
            stream: false,
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 2048,
          }),
          signal: (() => {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 120000);
            return controller.signal;
          })(),
        });

        // If OpenAI endpoint fails, try custom endpoint
        if (!response.ok && response.status === 404) {
          const fallbackController = new AbortController();
          const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 120000);
          try {
            response = await fetch(`${llamacppUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages,
                stream: false,
                temperature: config.temperature || 0.7,
                max_tokens: config.maxTokens || 2048,
                ...(model ? { model } : {}),
              }),
              signal: fallbackController.signal,
            });
          } finally {
            clearTimeout(fallbackTimeoutId);
          }
        }
      } catch (fetchError: any) {
        const errorMsg = fetchError.message || fetchError.toString() || '';
        const isConnectionError =
          errorMsg.includes('ECONNREFUSED') ||
          errorMsg.includes('fetch failed') ||
          errorMsg.includes('Failed to fetch');

        if (isConnectionError) {
          throw new Error(`Cannot connect to llama.cpp at ${llamacppUrl}\n\nTroubleshooting:\n1. Start llama.cpp server: \`./llama-server --model <model.gguf> --port 8033\`\n2. Check if server is running: \`curl ${llamacppUrl}/health\``);
        }

        throw new Error(`llama.cpp request failed: ${errorMsg}`);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        let errorMessage = `llama.cpp API error (${response.status})`;

        if (response.status === 404) {
          errorMessage = `Model or endpoint not found.`;
        } else if (error.error?.message) {
          errorMessage = `llama.cpp API error: ${error.error.message}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || data.message?.content || data.content || '';
    }
  } catch (error: any) {
    const errorMsg = error.message || error.toString() || 'Unknown error';

    if (errorMsg.includes('llama.cpp') || errorMsg.includes('timeout') || errorMsg.includes('connection')) {
      throw error;
    }

    throw new Error(`llama.cpp error: ${errorMsg}\n\nURL: ${llamacppUrl}\n\nTroubleshooting:\n1. Start llama.cpp server: \`./llama-server --model <model.gguf> --port 8033\`\n2. Check health: \`curl ${llamacppUrl}/health\`\n3. Verify LLAMACPP_BASE_URL environment variable`);
  }
}

/**
 * Run VLLM model with streaming support (OpenAI-compatible API)
 */
async function runVLLM(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
  onChunk?: (chunk: string) => void,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const vllmUrl = process.env.VLLM_API_URL || 'http://localhost:8000';
  const model = config.model || process.env.VLLM_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

  try {
    // Check VLLM health before making request
    const health = await checkVLLMHealth(vllmUrl);
    if (!health.healthy) {
      throw new Error(`VLLM is not healthy: ${health.error || 'Unknown error'}`);
    }

    // Build messages array with conversation history
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...(conversationHistory || []),
      { role: 'user' as const, content: userPrompt }
    ];

    // VLLM uses OpenAI-compatible API
    if (onChunk) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      let response: Response;
      try {
        response = await fetch(`${vllmUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 2048
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw new Error('VLLM request timeout after 2 minutes.');
        }

        throw new Error(`VLLM request failed: ${fetchError.message || 'Unknown error'}`);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        let errorMessage = `VLLM API error (${response.status})`;

        if (response.status === 404) {
          errorMessage = `Model "${model}" not found in VLLM. Check VLLM_MODEL environment variable.`;
        } else if (response.status === 503) {
          errorMessage = 'VLLM service unavailable. The model may still be loading.';
        } else if (error.error?.message) {
          errorMessage = `VLLM API error: ${error.error.message}`;
        }

        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        try {
          // Power of 10 Rule 2: Explicit max iteration counter
          const MAX_ITERATIONS = 10000;
          let iteration = 0;

          while (iteration < MAX_ITERATIONS) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.trim()) continue;

              // OpenAI SSE format: "data: {...}" or "data: [DONE]"
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta;

                  if (delta?.content) {
                    const content = delta.content;
                    fullContent += content;
                    onChunk(content);
                  }

                  if (parsed.error) {
                    throw new Error(`VLLM stream error: ${parsed.error.message || 'Unknown error'}`);
                  }
                } catch (e: any) {
                  if (e.message && !e.message.includes('JSON')) {
                    throw e;
                  }
                }
              }
            }

            iteration++;
          }

          if (iteration >= MAX_ITERATIONS) {
            throw new Error(`Stream processing exceeded max iterations (${MAX_ITERATIONS})`);
          }
        } catch (readError: any) {
          throw new Error(`Error reading VLLM stream: ${readError.message}`);
        }
      }

      return fullContent;
    } else {
      // Non-streaming fallback
      const response = await fetch(`${vllmUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2048
        }),
        signal: (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 120000);
          return controller.signal;
        })()
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        let errorMessage = `VLLM API error (${response.status})`;

        if (response.status === 404) {
          errorMessage = `Model "${model}" not found in VLLM.`;
        } else if (error.error?.message) {
          errorMessage = `VLLM API error: ${error.error.message}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
  } catch (error: any) {
    const errorMsg = error.message || error.toString() || 'Unknown error';

    if (errorMsg.includes('VLLM') || errorMsg.includes('timeout') || errorMsg.includes('connection')) {
      throw error;
    }

    throw new Error(`VLLM error: ${errorMsg}\n\nVLLM URL: ${vllmUrl}\nModel: ${model}\n\nTroubleshooting:\n1. Check VLLM is running: \`curl ${vllmUrl}/health\`\n2. Verify model is loaded: \`curl ${vllmUrl}/v1/models\`\n3. Check VLLM_API_URL environment variable`);
  }
}

/**
 * Run OpenAI model with streaming support
 */
async function runOpenAI(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
  onChunk?: (chunk: string) => void,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set. Please set it in your environment variables.');
  }

  const model = config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    // Build messages array with conversation history
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      // Include conversation history if provided
      ...(conversationHistory || []),
      // Add current user message
      { role: 'user' as const, content: userPrompt }
    ];

    // If streaming callback provided, use streaming API
    if (onChunk) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for OpenAI

      let response: Response;
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 2048
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw new Error('OpenAI request timeout after 2 minutes. The request may be too large or the API is slow.');
        }

        throw new Error(`OpenAI request failed: ${fetchError.message || 'Unknown error'}`);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        let errorMessage = `OpenAI API error (${response.status})`;

        if (response.status === 401) {
          errorMessage = 'OpenAI API authentication failed. Please check your OPENAI_API_KEY.';
        } else if (response.status === 429) {
          errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
        } else if (response.status === 500) {
          errorMessage = 'OpenAI API server error. Please try again later.';
        } else if (error.error?.message) {
          errorMessage = `OpenAI API error: ${error.error.message}`;
        }

        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        try {
          // Power of 10 Rule 2: Explicit max iteration counter
          const MAX_ITERATIONS = 10000;
          let iteration = 0;

          while (iteration < MAX_ITERATIONS) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.trim()) continue;

              // OpenAI SSE format: "data: {...}" or "data: [DONE]"
              if (line.startsWith('data: ')) {
                const data = line.slice(6); // Remove "data: " prefix

                if (data === '[DONE]') {
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta;

                  if (delta?.content) {
                    const content = delta.content;
                    fullContent += content;
                    onChunk(content);
                  }

                  // Handle errors in stream
                  if (parsed.error) {
                    throw new Error(`OpenAI stream error: ${parsed.error.message || 'Unknown error'}`);
                  }
                } catch (e: any) {
                  // If it's a JSON parse error, skip (might be incomplete line)
                  if (e.message && !e.message.includes('JSON')) {
                    throw e; // Re-throw if it's not a parse error
                  }
                }
              }
            }

            iteration++;
          }

          if (iteration >= MAX_ITERATIONS) {
            throw new Error(`Stream processing exceeded max iterations (${MAX_ITERATIONS})`);
          }
        } catch (readError: any) {
          throw new Error(`Error reading OpenAI stream: ${readError.message}`);
        }
      }

      return fullContent;
    } else {
      // Non-streaming fallback - call OpenAI API directly
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2048
        }),
        signal: (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 120000);
          return controller.signal;
        })()
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        let errorMessage = `OpenAI API error (${response.status})`;

        if (response.status === 401) {
          errorMessage = 'OpenAI API authentication failed. Please check your OPENAI_API_KEY.';
        } else if (response.status === 429) {
          errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
        } else if (error.error?.message) {
          errorMessage = `OpenAI API error: ${error.error.message}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
  } catch (error: any) {
    // Retry on network errors
    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      throw new Error(`OpenAI connection error: ${error.message}`);
    }

    // Don't wrap if it's already a helpful error message
    const errorMsg = error.message || error.toString() || 'Unknown error';
    if (errorMsg.includes('OPENAI_API_KEY') || errorMsg.includes('authentication') || errorMsg.includes('rate limit')) {
      throw error;
    }

    throw new Error(`OpenAI error: ${errorMsg}`);
  }
}

/**
 * Power of 10 Rule 3: Split long function into focused helpers
 */

/**
 * Try parsing JSON from markdown code blocks
 */
function tryParseFromCodeBlocks(response: string): unknown | null {
  const codeBlockPatterns = [
    /```(?:json)?\s*\n([\s\S]*?)\n```/,
    /```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/,
    /```(?:json)?\s*([\s\S]*?)\s*```/,
  ];

  for (const pattern of codeBlockPatterns) {
    const match = response.match(pattern);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // Continue to next pattern
      }
    }
  }

  return null;
}

/**
 * Try finding all JSON objects in response
 */
function tryParseAllJsonObjects(response: string): unknown | null {
  const jsonObjects: unknown[] = [];
  const jsonRegex = /\{[\s\S]{10,}\}/g;
  let match;

  while ((match = jsonRegex.exec(response)) !== null) {
    try {
      const parsed = JSON.parse(match[0]);
      jsonObjects.push(parsed);
    } catch {
      // Skip invalid JSON
    }
  }

  // Use the last one (model often "thinks out loud" then ends with the real answer)
  return jsonObjects.length > 0 ? jsonObjects[jsonObjects.length - 1] : null;
}

/**
 * Try finding JSON array in response
 */
function tryParseJsonArray(response: string): unknown | null {
  const arrayMatch = response.match(/\[[\s\S]{10,}\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      // Continue to next method
    }
  }
  return null;
}

/**
 * Try extracting JSON by tracking braces
 */
function tryExtractJsonByBraces(response: string): unknown | null {
  const lines = response.split('\n');
  let jsonStart = -1;
  let jsonEnd = -1;
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('{') && jsonStart === -1) {
      jsonStart = i;
      braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    } else if (jsonStart !== -1) {
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (braceCount === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
  }

  if (jsonStart !== -1 && jsonEnd !== -1) {
    try {
      const jsonText = lines.slice(jsonStart, jsonEnd).join('\n');
      return JSON.parse(jsonText);
    } catch {
      // Continue to error
    }
  }

  return null;
}

/**
 * Parse JSON from model response (handles markdown code blocks and multiple JSON objects)
 * If multiple valid JSON objects are found, returns the last one (model often "thinks out loud" then ends with the real answer)
 * Uses safeExtractJson from scorpion-core for robust parsing
 */
export function parseModelJSON<T = unknown>(response: string): T {
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid response: not a string');
  }

  // Try direct parse first
  try {
    return JSON.parse(response.trim()) as T;
  } catch {
    // Continue to other methods
  }

  // Try extracting from markdown code blocks
  const codeBlockResult = tryParseFromCodeBlocks(response);
  if (codeBlockResult !== null) {
    return codeBlockResult as T;
  }

  // Try finding all JSON objects
  const jsonObjectsResult = tryParseAllJsonObjects(response);
  if (jsonObjectsResult !== null) {
    return jsonObjectsResult as T;
  }

  // Try finding JSON array
  const arrayResult = tryParseJsonArray(response);
  if (arrayResult !== null) {
    return arrayResult as T;
  }

  // Last resort: try to extract JSON by tracking braces
  const braceResult = tryExtractJsonByBraces(response);
  if (braceResult !== null) {
    return braceResult as T;
  }

  throw new Error(`Could not parse JSON from model response. Response preview: ${response.substring(0, 200)}...`);
}


