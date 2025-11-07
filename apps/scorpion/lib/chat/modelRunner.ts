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
  config: ModelConfig,
  onChunk?: (chunk: StreamChunk) => void
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
 * Run Ollama model
 */
async function runOllama(
  systemPrompt: string,
  userPrompt: string,
  config: ModelConfig,
  onChunk?: (chunk: StreamChunk) => void
): Promise<string> {
  try {
    // Use existing Scorpion core
    const response = await runModel(
      userPrompt,
      config.model || 'qwen2.5-coder:7b-instruct-q4_K_M',
      systemPrompt
    );
    
    // If streaming callback provided, send full response as single chunk
    if (onChunk) {
      onChunk({ content: response, done: false });
      onChunk({ content: '', done: true });
    }
    
    return response;
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
    return JSON.parse(response);
  } catch {}
  
  // Try extracting from markdown code block
  const codeBlockMatch = response.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {}
  }
  
  // Try finding JSON object
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }
  
  throw new Error('Could not parse JSON from model response');
}

