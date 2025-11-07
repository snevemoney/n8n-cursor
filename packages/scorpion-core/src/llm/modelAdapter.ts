/**
 * Model Adapter - Model-agnostic LLM interface
 * Swap between OpenAI, Ollama, or your own trained model via env vars
 */

export interface LLMRequest {
  prompt: string;
  system?: string;
  model?: string; // Optional model override
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export type ModelSource = 'openai' | 'ollama' | 'local' | 'custom';

/**
 * LLMAdapter class - Object-oriented wrapper for runModel
 */
export class LLMAdapter {
  private provider: ModelSource;
  private model?: string;
  private temperature?: number;
  private maxTokens?: number;

  constructor(config: {
    provider?: ModelSource;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}) {
    this.provider = config.provider || (process.env.SCORPION_MODEL_SOURCE as ModelSource) || 'ollama';
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async chat(prompt: string, system?: string): Promise<string> {
    const response = await runModel({
      prompt,
      system,
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens
    });
    return response.content;
  }

  async generate(request: {
    system?: string;
    user: string;
    jsonOutput?: boolean;
  }): Promise<string> {
    return this.chat(request.user, request.system);
  }

  async request(req: LLMRequest): Promise<LLMResponse> {
    return runModel({
      ...req,
      model: req.model || this.model,
      temperature: req.temperature || this.temperature,
      maxTokens: req.maxTokens || this.maxTokens
    });
  }
}

/**
 * Run a model request - works with any model source
 */
export async function runModel(req: LLMRequest): Promise<LLMResponse> {
  const source = (process.env.SCORPION_MODEL_SOURCE || 'ollama') as ModelSource;
  
  switch (source) {
    case 'ollama':
      return runOllama(req);
    case 'openai':
      return runOpenAI(req);
    case 'local':
      return runLocalModel(req);
    case 'custom':
      return runCustomModel(req);
    default:
      throw new Error(`Unknown model source: ${source}`);
  }
}

/**
 * Ollama (local) model with retry logic
 */
async function runOllama(req: LLMRequest, retries: number = 0): Promise<LLMResponse> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = req.model || process.env.OLLAMA_MODEL || 'llama3.2:3b-instruct-q4_K_M';
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  try {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      { role: 'user', content: req.prompt }
    ];

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: req.temperature || 0.7,
          num_predict: req.maxTokens || 2048
        }
      }),
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    if (!response.ok) {
      // Retry on server errors
      if ((response.status >= 500 || response.status === 429) && retries < maxRetries) {
        const delay = baseDelay * Math.pow(2, retries);
        console.warn(`Ollama API error ${response.status}, retrying in ${delay}ms... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return runOllama(req, retries + 1);
      }
      
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || data.response || '',
      model: data.model || model
    };
  } catch (error: any) {
    // Retry on network errors
    if (retries < maxRetries && (error.name === 'TypeError' || error.name === 'AbortError')) {
      const delay = baseDelay * Math.pow(2, retries);
      console.warn(`Ollama network error, retrying in ${delay}ms... (${retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return runOllama(req, retries + 1);
    }
    throw new Error(`Ollama request failed: ${error.message}`);
  }
}

/**
 * OpenAI model with retry logic
 */
async function runOpenAI(req: LLMRequest, retries: number = 0): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const model = req.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const maxRetries = 3;
  const baseDelay = 1000;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(req.system ? [{ role: 'system', content: req.system }] : []),
          { role: 'user', content: req.prompt }
        ],
        temperature: req.temperature || 0.7,
        max_tokens: req.maxTokens || 2048
      })
    });

    if (!response.ok) {
      // Retry on server errors or rate limits
      if ((response.status >= 500 || response.status === 429) && retries < maxRetries) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : baseDelay * Math.pow(2, retries);
        console.warn(`OpenAI API error ${response.status}, retrying in ${delay}ms... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return runOpenAI(req, retries + 1);
      }
      
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model || model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens
      }
    };
  } catch (error: any) {
    // Retry on network errors
    if (retries < maxRetries && (error.name === 'TypeError' || error.name === 'AbortError')) {
      const delay = baseDelay * Math.pow(2, retries);
      console.warn(`OpenAI network error, retrying in ${delay}ms... (${retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return runOpenAI(req, retries + 1);
    }
    throw new Error(`OpenAI request failed: ${error.message}`);
  }
}

/**
 * Local custom model (your trained model)
 */
async function runLocalModel(req: LLMRequest): Promise<LLMResponse> {
  const localUrl = process.env.LOCAL_MODEL_URL || 'http://localhost:8000/generate';
  const model = req.model || process.env.LOCAL_MODEL_NAME || 'scorpion-v1';

  try {
    const response = await fetch(localUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: req.prompt,
        system: req.system,
        model,
        temperature: req.temperature || 0.7,
        max_tokens: req.maxTokens || 2048
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Local model API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      content: data.response || data.output || data.text || '',
      model: data.model || model
    };
  } catch (error: any) {
    throw new Error(`Local model request failed: ${error.message}`);
  }
}

/**
 * Custom model endpoint (for future extensibility)
 */
async function runCustomModel(req: LLMRequest): Promise<LLMResponse> {
  const customUrl = process.env.CUSTOM_MODEL_URL;
  if (!customUrl) {
    throw new Error('CUSTOM_MODEL_URL not set');
  }

  // Similar to local model but with custom endpoint
  return runLocalModel(req);
}

/**
 * List available models for current source
 */
export async function listModels(): Promise<string[]> {
  const source = (process.env.SCORPION_MODEL_SOURCE || 'ollama') as ModelSource;
  
  if (source === 'ollama') {
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return (data.models || []).map((m: any) => m.name);
      }
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
    }
  }
  
  // For OpenAI, return common models
  if (source === 'openai') {
    return ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }
  
  return [];
}

/**
 * Check if model source is available
 */
export async function checkModelAvailability(): Promise<boolean> {
  const source = (process.env.SCORPION_MODEL_SOURCE || 'ollama') as ModelSource;
  
  try {
    if (source === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/tags`, { method: 'HEAD' });
      return response.ok;
    }
    
    if (source === 'openai') {
      // Can't really check without making a request, so assume available if key is set
      return !!process.env.OPENAI_API_KEY;
    }
    
    if (source === 'local' || source === 'custom') {
      const url = source === 'local' 
        ? (process.env.LOCAL_MODEL_URL || 'http://localhost:8000/generate')
        : process.env.CUSTOM_MODEL_URL;
      if (!url) return false;
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

