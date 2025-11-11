import { runModel } from '@scorpion/core';
import { getRecommendedModelForRAM } from '../utils/modelSelector';
import { ensureOllamaRunning } from '../utils/ollama-auto-start';

/**
 * Unified model runner supporting Ollama (local) and OpenAI (cloud fallback)
 */

export interface ModelConfig {
  provider: 'ollama' | 'openai';
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
 * Check if Ollama is reachable
 */
async function checkOllamaHealth(ollamaUrl: string): Promise<{ reachable: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return { reachable: true };
    } else {
      return { reachable: false, error: `Ollama returned status ${response.status}` };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { reachable: false, error: 'Connection timeout - Ollama may not be running' };
    }
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      return { 
        reachable: false, 
        error: `Cannot connect to Ollama at ${ollamaUrl}. Make sure Ollama is running.` 
      };
    }
    return { reachable: false, error: error.message || 'Unknown connection error' };
  }
}

/**
 * Run model with unified interface
 */
export async function runModelUnified(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; maxTokens?: number; temperature?: number },
  onChunk?: (chunk: string) => void,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const provider = config.provider || 'ollama';
  
  if (provider === 'ollama') {
    return runOllama(systemPrompt, userPrompt, config, onChunk, conversationHistory);
  } else if (provider === 'openai') {
    return runOpenAI(systemPrompt, userPrompt, config, onChunk, conversationHistory);
  } else {
    throw new Error(`Provider ${provider} not supported. Supported: ollama, openai`);
  }
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
  // Use RAM-based model recommendation as fallback instead of scorpion:latest
  const model = config.model || process.env.OLLAMA_MODEL || getRecommendedModelForRAM();
  
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
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
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
            throw new Error(`Request timeout after 30s. Ollama may be slow or unresponsive.\n\nCheck:\n- Ollama is running: \`ollama serve\`\n- Model is available: \`ollama list\`\n- URL is correct: ${ollamaUrl}`);
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
          while (true) {
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
          while (true) {
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
        signal: AbortSignal.timeout(120000) // 2 minute timeout
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
 * Parse JSON from model response (handles markdown code blocks)
 */
export function parseModelJSON(response: string): any {
  // Try direct parse first
  try {
    return JSON.parse(response.trim());
  } catch {}
  
  // Try extracting from markdown code block
  const codeBlockMatch = response.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }
  
  // Try finding JSON object (more flexible regex)
  const jsonMatch = response.match(/\{[\s\S]{10,}\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }
  
  // Try finding JSON array
  const arrayMatch = response.match(/\[[\s\S]{10,}\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {}
  }
  
  // Last resort: try to extract JSON from text with better error handling
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
    } catch {}
  }
  
  throw new Error(`Could not parse JSON from model response. Response preview: ${response.substring(0, 200)}...`);
}


