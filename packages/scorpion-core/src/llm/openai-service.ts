/**
 * Comprehensive OpenAI API Service
 * Full integration with all OpenAI API features
 * 
 * Features:
 * - Chat Completions (with function calling, vision, streaming)
 * - Assistants API (persistent conversations with tools)
 * - Embeddings API (for RAG enhancement)
 * - Audio API (transcription, translation, TTS)
 * - Images API (generation, editing, variation)
 * - Files API (upload, list, delete)
 * - Batch API (bulk processing with 50% discount)
 * - Fine-tuning API (custom model training)
 * - Models API (list, retrieve)
 * 
 * HYBRID DESIGN: Works alongside Ollama - use OpenAI for advanced features, Ollama for fast/local
 */

import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  FunctionDefinition,
  Assistant,
  Thread,
  ThreadMessage,
  Run,
  EmbeddingRequest,
  EmbeddingResponse,
  TranscriptionRequest,
  TranscriptionResponse,
  TranslationRequest,
  SpeechRequest,
  ImageGenerationRequest,
  ImageEditRequest,
  ImageVariationRequest,
  ImageResponse,
  FileObject,
  BatchRequest,
  Batch,
  FineTuningJob,
  Model,
  ModelListResponse,
} from './openai-types';

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface StreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: { role?: string; content?: string; tool_calls?: any[] };
    finish_reason: string | null;
  }>;
}

export class OpenAIService {
  private config: Required<OpenAIConfig>;
  private baseURL: string;

  constructor(config: OpenAIConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.config = {
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.openai.com/v1',
      defaultModel: config.defaultModel || 'gpt-4o-mini',
      timeout: config.timeout || 120000, // 2 minutes
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
    };

    this.baseURL = this.config.baseURL;
  }

  // ============================================================================
  // Core HTTP Methods
  // ============================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit & { retries?: number } = {}
  ): Promise<T> {
    const { retries = this.config.maxRetries, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          const errorMessage = (error as any).error?.message || `HTTP ${response.status}`;

          // Retry on rate limits or server errors
          if ((response.status === 429 || response.status >= 500) && attempt < retries) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter
              ? parseInt(retryAfter) * 1000
              : this.config.retryDelay * Math.pow(2, attempt);

            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          throw new Error(`OpenAI API error: ${errorMessage}`);
        }

        return await response.json();
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.config.timeout}ms`);
        }

        if (attempt < retries && (error.message?.includes('network') || error.message?.includes('ECONNREFUSED'))) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async requestStream(
    endpoint: string,
    options: RequestInit,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${(error as any).error?.message || response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const chunk = JSON.parse(data) as StreamChunk;
            onChunk(chunk);
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // ============================================================================
  // Chat Completions
  // ============================================================================

  async chatCompletion(
    request: Omit<ChatCompletionRequest, 'model'> & { model?: string }
  ): Promise<ChatCompletionResponse> {
    return this.request<ChatCompletionResponse>('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        model: request.model || this.config.defaultModel,
      }),
    });
  }

  async chatCompletionStream(
    request: Omit<ChatCompletionRequest, 'model' | 'stream'> & { model?: string },
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    return this.requestStream(
      '/chat/completions',
      {
        method: 'POST',
        body: JSON.stringify({
          ...request,
          model: request.model || this.config.defaultModel,
          stream: true,
        }),
      },
      onChunk
    );
  }

  // Convenience method with function calling
  async chatWithFunctions(
    messages: ChatMessage[],
    functions: FunctionDefinition[],
    options: {
      model?: string;
      function_call?: 'auto' | 'none' | { name: string };
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<ChatCompletionResponse> {
    return this.chatCompletion({
      messages,
      functions,
      function_call: options.function_call || 'auto',
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    });
  }

  // Convenience method with JSON mode
  async chatJSON(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<any> {
    const response = await this.chatCompletion({
      messages,
      response_format: { type: 'json_object' },
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    try {
      return JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const match = content.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      if (match) {
        return JSON.parse(match[1]);
      }
      throw new Error('Failed to parse JSON from response');
    }
  }

  // ============================================================================
  // Assistants API
  // ============================================================================

  async createAssistant(config: {
    name?: string;
    description?: string;
    model?: string;
    instructions?: string;
    tools?: Array<{
      type: 'code_interpreter' | 'file_search' | 'function';
      function?: FunctionDefinition;
    }>;
    tool_resources?: {
      code_interpreter?: { file_ids: string[] };
      file_search?: { vector_store_ids: string[] };
    };
    temperature?: number;
    top_p?: number;
    response_format?: { type: 'text' } | { type: 'json_object' };
    metadata?: Record<string, string>;
  }): Promise<Assistant> {
    return this.request<Assistant>('/assistants', {
      method: 'POST',
      body: JSON.stringify({
        model: config.model || this.config.defaultModel,
        ...config,
      }),
    });
  }

  async getAssistant(assistantId: string): Promise<Assistant> {
    return this.request<Assistant>(`/assistants/${assistantId}`);
  }

  async listAssistants(options: {
    limit?: number;
    order?: 'asc' | 'desc';
    after?: string;
    before?: string;
  } = {}): Promise<{ object: 'list'; data: Assistant[] }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.order) params.append('order', options.order);
    if (options.after) params.append('after', options.after);
    if (options.before) params.append('before', options.before);

    return this.request<{ object: 'list'; data: Assistant[] }>(
      `/assistants?${params.toString()}`
    );
  }

  async updateAssistant(
    assistantId: string,
    updates: Partial<Omit<Assistant, 'id' | 'object' | 'created_at'>>
  ): Promise<Assistant> {
    return this.request<Assistant>(`/assistants/${assistantId}`, {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  }

  async deleteAssistant(assistantId: string): Promise<{ id: string; object: 'assistant.deleted'; deleted: boolean }> {
    return this.request(`/assistants/${assistantId}`, {
      method: 'DELETE',
    });
  }

  // Threads
  async createThread(metadata?: Record<string, string>): Promise<Thread> {
    return this.request<Thread>('/threads', {
      method: 'POST',
      body: JSON.stringify({ metadata }),
    });
  }

  async getThread(threadId: string): Promise<Thread> {
    return this.request<Thread>(`/threads/${threadId}`);
  }

  async updateThread(
    threadId: string,
    metadata?: Record<string, string>
  ): Promise<Thread> {
    return this.request<Thread>(`/threads/${threadId}`, {
      method: 'POST',
      body: JSON.stringify({ metadata }),
    });
  }

  async deleteThread(threadId: string): Promise<{ id: string; object: 'thread.deleted'; deleted: boolean }> {
    return this.request(`/threads/${threadId}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async createMessage(
    threadId: string,
    content: string,
    options: {
      role?: 'user' | 'assistant';
      file_ids?: string[];
      metadata?: Record<string, string>;
    } = {}
  ): Promise<ThreadMessage> {
    return this.request<ThreadMessage>(`/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: options.role || 'user',
        content,
        file_ids: options.file_ids || [],
        metadata: options.metadata,
      }),
    });
  }

  async getMessage(threadId: string, messageId: string): Promise<ThreadMessage> {
    return this.request<ThreadMessage>(`/threads/${threadId}/messages/${messageId}`);
  }

  async listMessages(
    threadId: string,
    options: {
      limit?: number;
      order?: 'asc' | 'desc';
      after?: string;
      before?: string;
    } = {}
  ): Promise<{ object: 'list'; data: ThreadMessage[] }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.order) params.append('order', options.order);
    if (options.after) params.append('after', options.after);
    if (options.before) params.append('before', options.before);

    return this.request<{ object: 'list'; data: ThreadMessage[] }>(
      `/threads/${threadId}/messages?${params.toString()}`
    );
  }

  // Runs
  async createRun(
    threadId: string,
    assistantId: string,
    options: {
      model?: string;
      instructions?: string;
      tools?: Array<{ type: string; function?: FunctionDefinition }>;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<Run> {
    return this.request<Run>(`/threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: assistantId,
        ...options,
      }),
    });
  }

  async getRun(threadId: string, runId: string): Promise<Run> {
    return this.request<Run>(`/threads/${threadId}/runs/${runId}`);
  }

  async listRuns(
    threadId: string,
    options: {
      limit?: number;
      order?: 'asc' | 'desc';
      after?: string;
      before?: string;
    } = {}
  ): Promise<{ object: 'list'; data: Run[] }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.order) params.append('order', options.order);
    if (options.after) params.append('after', options.after);
    if (options.before) params.append('before', options.before);

    return this.request<{ object: 'list'; data: Run[] }>(
      `/threads/${threadId}/runs?${params.toString()}`
    );
  }

  async submitToolOutputs(
    threadId: string,
    runId: string,
    toolOutputs: Array<{ tool_call_id: string; output: string }>
  ): Promise<Run> {
    return this.request<Run>(`/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
      method: 'POST',
      body: JSON.stringify({ tool_outputs: toolOutputs }),
    });
  }

  async cancelRun(threadId: string, runId: string): Promise<Run> {
    return this.request<Run>(`/threads/${threadId}/runs/${runId}/cancel`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // Embeddings
  // ============================================================================

  async createEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    return this.request<EmbeddingResponse>('/embeddings', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async embedText(text: string, model: EmbeddingRequest['model'] = 'text-embedding-3-small'): Promise<number[]> {
    const response = await this.createEmbedding({ model, input: text });
    return response.data[0]?.embedding || [];
  }

  async embedTexts(
    texts: string[],
    model: EmbeddingRequest['model'] = 'text-embedding-3-small'
  ): Promise<number[][]> {
    const response = await this.createEmbedding({ model, input: texts });
    return response.data.map(item => item.embedding);
  }

  // ============================================================================
  // Audio API
  // ============================================================================

  async createTranscription(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    const formData = new FormData();
    
    if (request.file instanceof Buffer) {
      formData.append('file', new Blob([request.file]), 'audio.mp3');
    } else {
      formData.append('file', request.file);
    }
    
    formData.append('model', request.model);
    if (request.language) formData.append('language', request.language);
    if (request.prompt) formData.append('prompt', request.prompt);
    if (request.response_format) formData.append('response_format', request.response_format);
    if (request.temperature !== undefined) formData.append('temperature', request.temperature.toString());
    if (request.timestamp_granularities) {
      request.timestamp_granularities.forEach(g => formData.append('timestamp_granularities[]', g));
    }

    const url = `${this.baseURL}/audio/transcriptions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${(error as any).error?.message || response.status}`);
    }

    return await response.json();
  }

  async createTranslation(request: TranslationRequest): Promise<TranscriptionResponse> {
    const formData = new FormData();
    
    if (request.file instanceof Buffer) {
      formData.append('file', new Blob([request.file]), 'audio.mp3');
    } else {
      formData.append('file', request.file);
    }
    
    formData.append('model', request.model);
    if (request.prompt) formData.append('prompt', request.prompt);
    if (request.response_format) formData.append('response_format', request.response_format);
    if (request.temperature !== undefined) formData.append('temperature', request.temperature.toString());

    const url = `${this.baseURL}/audio/translations`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${(error as any).error?.message || response.status}`);
    }

    return await response.json();
  }

  async createSpeech(request: SpeechRequest): Promise<Blob> {
    const url = `${this.baseURL}/audio/speech`;
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!fetchResponse.ok) {
      const error = await fetchResponse.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${(error as any).error?.message || fetchResponse.status}`);
    }

    return await fetchResponse.blob();
  }

  // ============================================================================
  // Images API
  // ============================================================================

  async createImage(request: ImageGenerationRequest): Promise<ImageResponse> {
    return this.request<ImageResponse>('/images/generations', {
      method: 'POST',
      body: JSON.stringify({
        model: request.model || 'dall-e-3',
        ...request,
      }),
    });
  }

  async createImageEdit(request: ImageEditRequest): Promise<ImageResponse> {
    const formData = new FormData();
    
    if (request.image instanceof Buffer) {
      formData.append('image', new Blob([request.image]), 'image.png');
    } else {
      formData.append('image', request.image);
    }
    
    formData.append('prompt', request.prompt);
    
    if (request.mask) {
      if (request.mask instanceof Buffer) {
        formData.append('mask', new Blob([request.mask]), 'mask.png');
      } else {
        formData.append('mask', request.mask);
      }
    }
    
    if (request.model) formData.append('model', request.model);
    if (request.n) formData.append('n', request.n.toString());
    if (request.size) formData.append('size', request.size);
    if (request.response_format) formData.append('response_format', request.response_format);
    if (request.user) formData.append('user', request.user);

    const url = `${this.baseURL}/images/edits`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${(error as any).error?.message || response.status}`);
    }

    return await response.json();
  }

  async createImageVariation(request: ImageVariationRequest): Promise<ImageResponse> {
    const formData = new FormData();
    
    if (request.image instanceof Buffer) {
      formData.append('image', new Blob([request.image]), 'image.png');
    } else {
      formData.append('image', request.image);
    }
    
    if (request.model) formData.append('model', request.model);
    if (request.n) formData.append('n', request.n.toString());
    if (request.size) formData.append('size', request.size);
    if (request.response_format) formData.append('response_format', request.response_format);
    if (request.user) formData.append('user', request.user);

    const url = `${this.baseURL}/images/variations`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${(error as any).error?.message || response.status}`);
    }

    return await response.json();
  }

  // ============================================================================
  // Files API
  // ============================================================================

  async uploadFile(
    file: File | Blob | Buffer,
    purpose: 'fine-tune' | 'assistants' | 'batch' | 'vision',
    filename?: string
  ): Promise<FileObject> {
    const formData = new FormData();
    
    if (file instanceof Buffer) {
      formData.append('file', new Blob([file]), filename || 'file.jsonl');
    } else {
      formData.append('file', file, filename);
    }
    
    formData.append('purpose', purpose);

    const url = `${this.baseURL}/files`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${(error as any).error?.message || response.status}`);
    }

    return await response.json();
  }

  async listFiles(purpose?: string): Promise<{ object: 'list'; data: FileObject[] }> {
    const params = purpose ? `?purpose=${purpose}` : '';
    return this.request<{ object: 'list'; data: FileObject[] }>(`/files${params}`);
  }

  async getFile(fileId: string): Promise<FileObject> {
    return this.request<FileObject>(`/files/${fileId}`);
  }

  async deleteFile(fileId: string): Promise<{ id: string; object: 'file'; deleted: boolean }> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async getFileContent(fileId: string): Promise<string> {
    const url = `${this.baseURL}/files/${fileId}/content`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${(error as any).error?.message || response.status}`);
    }

    return await response.text();
  }

  // ============================================================================
  // Batch API
  // ============================================================================

  async createBatch(request: BatchRequest): Promise<Batch> {
    return this.request<Batch>('/batches', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getBatch(batchId: string): Promise<Batch> {
    return this.request<Batch>(`/batches/${batchId}`);
  }

  async listBatches(options: {
    limit?: number;
    after?: string;
  } = {}): Promise<{ object: 'list'; data: Batch[] }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.after) params.append('after', options.after);

    return this.request<{ object: 'list'; data: Batch[] }>(`/batches?${params.toString()}`);
  }

  async cancelBatch(batchId: string): Promise<Batch> {
    return this.request<Batch>(`/batches/${batchId}/cancel`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // Fine-tuning
  // ============================================================================

  async createFineTuningJob(config: {
    training_file: string;
    model?: string;
    hyperparameters?: {
      n_epochs?: number;
      batch_size?: number;
      learning_rate_multiplier?: number;
    };
    suffix?: string;
    validation_file?: string;
  }): Promise<FineTuningJob> {
    return this.request<FineTuningJob>('/fine_tuning/jobs', {
      method: 'POST',
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        ...config,
      }),
    });
  }

  async getFineTuningJob(jobId: string): Promise<FineTuningJob> {
    return this.request<FineTuningJob>(`/fine_tuning/jobs/${jobId}`);
  }

  async listFineTuningJobs(options: {
    limit?: number;
    after?: string;
  } = {}): Promise<{ object: 'list'; data: FineTuningJob[] }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.after) params.append('after', options.after);

    return this.request<{ object: 'list'; data: FineTuningJob[] }>(
      `/fine_tuning/jobs?${params.toString()}`
    );
  }

  async cancelFineTuningJob(jobId: string): Promise<FineTuningJob> {
    return this.request<FineTuningJob>(`/fine_tuning/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // Models
  // ============================================================================

  async listModels(): Promise<ModelListResponse> {
    return this.request<ModelListResponse>('/models');
  }

  async getModel(modelId: string): Promise<Model> {
    return this.request<Model>(`/models/${modelId}`);
  }

  async deleteModel(modelId: string): Promise<{ id: string; object: 'model'; deleted: boolean }> {
    return this.request(`/models/${modelId}`, {
      method: 'DELETE',
    });
  }
}

// Singleton instance helper
let openAIServiceInstance: OpenAIService | null = null;

export function getOpenAIService(config?: OpenAIConfig): OpenAIService {
  if (!openAIServiceInstance) {
    if (!config) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      config = { apiKey };
    }
    openAIServiceInstance = new OpenAIService(config);
  }
  return openAIServiceInstance;
}

// Helper to check if OpenAI is available
export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

