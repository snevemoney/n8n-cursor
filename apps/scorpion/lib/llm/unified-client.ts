/**
 * Unified LLM client interface
 * Single entry point for all LLM providers
 * This wraps the existing runModelUnified for a cleaner API
 */

import { runModelUnified } from '../chat/modelRunner';

export interface UnifiedLlmRequest {
  backend: 'ollama' | 'llamacpp' | 'vllm' | 'openai';
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface UnifiedLlmResponse {
  text: string;
  raw?: unknown;
  tokensPerSecond?: number;
}

/**
 * Unified LLM request function
 * Provides a clean interface for calling any LLM provider
 */
export async function llmRequest(
  req: UnifiedLlmRequest,
  onChunk?: (chunk: string) => void
): Promise<UnifiedLlmResponse> {
  const result = await runModelUnified(
    req.system || '',
    req.prompt,
    {
      provider: req.backend,
      model: '', // Will use env defaults from config
      maxTokens: req.maxTokens,
      temperature: req.temperature,
    },
    onChunk,
    req.conversationHistory
  );
  
  return {
    text: result,
  };
}

