/**
 * Ollama API Client
 * For interacting with local Ollama instance
 */

export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      // Use API route to avoid CORS issues
      const response = await fetch(`/api/ollama/models?url=${encodeURIComponent(this.baseUrl)}`);
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  /**
   * Chat with a model
   */
  async chat(request: OllamaChatRequest): Promise<string> {
    try {
      // Use API route to avoid CORS issues
      const response = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          ollamaUrl: this.baseUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Chat request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.message?.content || '';
    } catch (error) {
      console.error('Failed to chat with Ollama:', error);
      throw error;
    }
  }

  /**
   * Check if Ollama is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`/api/ollama/check?url=${encodeURIComponent(this.baseUrl)}`);
      const data = await response.json();
      return data.available || false;
    } catch {
      return false;
    }
  }
}

