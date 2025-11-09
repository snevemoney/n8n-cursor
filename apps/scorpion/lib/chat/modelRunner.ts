import { runModel } from '@scorpion/core';

/**
 * Unified model runner supporting Ollama, OpenAI, Azure
 */

export interface ModelConfig {
  provider: 'ollama' | 'openai' | 'azure' | 'local';
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
 * Run model with unified interface
 */
export async function runModelUnified(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; maxTokens?: number; temperature?: number },
  onChunk?: (chunk: string) => void  // Streaming callback receives string chunks
): Promise<string> {
  const provider = config.provider || 'ollama';
  
  if (provider === 'ollama') {
    return runOllama(systemPrompt, userPrompt, config, onChunk);
  } else if (provider === 'openai') {
    return runOpenAI(systemPrompt, userPrompt, config, onChunk);
  } else {
    throw new Error(`Provider ${provider} not implemented yet`);
  }
}

/**
 * Run Ollama model with streaming support
 */
async function runOllama(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = config.model || 'llama3.2:1b';
    
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: userPrompt }
    ];

    // If streaming callback provided, use streaming API
    if (onChunk) {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
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
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                const content = data.message.content;
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
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
    throw new Error(`Ollama error: ${error.message}`);
  }
}

/**
 * Run OpenAI model (placeholder)
 */
async function runOpenAI(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
  onChunk?: (chunk: StreamChunk) => void
): Promise<string> {
  // TODO: Implement OpenAI streaming
  throw new Error('OpenAI provider not implemented yet');
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

