/**
 * Comprehensive OpenAI API Types
 * Based on OpenAI API Reference: https://platform.openai.com/docs/api-reference
 */

// ============================================================================
// Chat Completions
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<TextContent | ImageContent>;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface FunctionDefinition {
  name: string;
  description?: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  functions?: FunctionDefinition[];
  function_call?: 'auto' | 'none' | { name: string };
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
  response_format?: { type: 'text' } | { type: 'json_object' };
  seed?: number;
  tools?: Array<{ type: 'function'; function: FunctionDefinition }>;
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'content_filter';
    logprobs?: any;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// Assistants API
// ============================================================================

export interface Assistant {
  id: string;
  object: 'assistant';
  created_at: number;
  name: string | null;
  description: string | null;
  model: string;
  instructions: string | null;
  tools: Array<{
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
}

export interface Thread {
  id: string;
  object: 'thread';
  created_at: number;
  metadata?: Record<string, string>;
}

export interface ThreadMessage {
  id: string;
  object: 'thread.message';
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image_file';
    text?: { value: string; annotations: any[] };
    image_file?: { file_id: string; detail: 'auto' | 'low' | 'high' };
  }>;
  assistant_id?: string;
  run_id?: string;
  file_ids: string[];
  metadata?: Record<string, string>;
}

export interface Run {
  id: string;
  object: 'thread.run';
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: 'queued' | 'in_progress' | 'requires_action' | 'cancelling' | 'cancelled' | 'failed' | 'completed' | 'expired';
  required_action?: {
    type: 'submit_tool_outputs';
    submit_tool_outputs: {
      tool_calls: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    };
  };
  last_error?: { code: string; message: string };
  expires_at: number | null;
  started_at: number | null;
  cancelled_at: number | null;
  failed_at: number | null;
  completed_at: number | null;
  model: string;
  instructions: string | null;
  tools: Array<{ type: string; function?: FunctionDefinition }>;
  file_ids: string[];
  metadata?: Record<string, string>;
}

// ============================================================================
// Embeddings
// ============================================================================

export interface EmbeddingRequest {
  model: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
  input: string | string[];
  encoding_format?: 'float' | 'base64';
  dimensions?: number;
  user?: string;
}

export interface EmbeddingResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// Audio API
// ============================================================================

export interface TranscriptionRequest {
  file: File | Blob | Buffer;
  model: 'whisper-1';
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
  timestamp_granularities?: ('word' | 'segment')[];
}

export interface TranscriptionResponse {
  text: string;
  task?: string;
  language?: string;
  duration?: number;
  words?: Array<{ word: string; start: number; end: number }>;
  segments?: Array<{ id: number; seek: number; start: number; end: number; text: string; tokens: number[]; temperature: number; avg_logprob: number; compression_ratio: number; no_speech_prob: number }>;
}

export interface TranslationRequest {
  file: File | Blob | Buffer;
  model: 'whisper-1';
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

export interface SpeechRequest {
  model: 'tts-1' | 'tts-1-hd';
  input: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
  speed?: number; // 0.25 to 4.0
}

// ============================================================================
// Images API
// ============================================================================

export interface ImageGenerationRequest {
  prompt: string;
  model?: 'dall-e-2' | 'dall-e-3';
  n?: number;
  quality?: 'standard' | 'hd';
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  user?: string;
}

export interface ImageEditRequest {
  image: File | Blob | Buffer;
  prompt: string;
  mask?: File | Blob | Buffer;
  model?: 'dall-e-2';
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export interface ImageVariationRequest {
  image: File | Blob | Buffer;
  model?: 'dall-e-2';
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export interface ImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

// ============================================================================
// Files API
// ============================================================================

export interface FileObject {
  id: string;
  object: 'file';
  bytes: number;
  created_at: number;
  filename: string;
  purpose: 'fine-tune' | 'assistants' | 'batch' | 'vision';
  status?: 'uploaded' | 'processed' | 'error';
  status_details?: string | null;
}

// ============================================================================
// Batch API
// ============================================================================

export interface BatchRequest {
  input_file_id: string;
  endpoint: '/v1/chat/completions' | '/v1/embeddings';
  completion_window: '24h';
  metadata?: Record<string, string>;
}

export interface Batch {
  id: string;
  object: 'batch';
  endpoint: string;
  errors?: any;
  input_file_id: string;
  completion_window: string;
  status: 'validating' | 'failed' | 'in_progress' | 'finalizing' | 'completed' | 'expired' | 'cancelling' | 'cancelled';
  output_file_id?: string;
  error_file_id?: string;
  created_at: number;
  in_progress_at?: number;
  expires_at?: number;
  finalizing_at?: number;
  completed_at?: number;
  failed_at?: number;
  expired_at?: number;
  cancelling_at?: number;
  cancelled_at?: number;
  request_counts?: {
    total: number;
    completed: number;
    failed: number;
  };
  metadata?: Record<string, string>;
}

// ============================================================================
// Fine-tuning
// ============================================================================

export interface FineTuningJob {
  id: string;
  object: 'fine_tuning.job';
  model: string;
  created_at: number;
  finished_at: number | null;
  trained_tokens: number | null;
  hyperparameters: {
    n_epochs: number | string;
    batch_size: number | string;
    learning_rate_multiplier: number | string;
  };
  organization_id: string;
  result_files: string[];
  status: 'validating_files' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  validation_file?: string;
  training_file: string;
  error?: { code: string; message: string; param: string | null };
  fine_tuned_model: string | null;
}

// ============================================================================
// Models
// ============================================================================

export interface Model {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface ModelListResponse {
  object: 'list';
  data: Model[];
}

