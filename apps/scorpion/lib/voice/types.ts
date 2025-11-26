/**
 * Voice Mode - Frame and Context Types
 * 
 * Power of 10 Rule 5: Typed interfaces for all voice operations
 */

/**
 * Frame types for voice pipeline
 */
export type FrameType = 
  | 'user.audio'
  | 'user.text'
  | 'assistant.text'
  | 'assistant.audio'
  | 'system.interrupt'
  | 'system.end';

/**
 * Base frame structure
 */
export interface Frame {
  type: FrameType;
  timestamp: number;
  sessionId: string;
  data: unknown;
}

/**
 * User audio frame
 */
export interface UserAudioFrame extends Frame {
  type: 'user.audio';
  data: {
    audio: ArrayBuffer | Uint8Array;
    sampleRate: number;
    format: 'pcm' | 'wav' | 'opus' | 'webm';
    language?: string; // Optional language hint (fr, en, or auto-detect)
  };
}

/**
 * User text frame
 */
export interface UserTextFrame extends Frame {
  type: 'user.text';
  data: {
    text: string;
  };
}

/**
 * Assistant text frame
 */
export interface AssistantTextFrame extends Frame {
  type: 'assistant.text';
  data: {
    text: string;
  };
}

/**
 * Assistant audio frame
 */
export interface AssistantAudioFrame extends Frame {
  type: 'assistant.audio';
  data: {
    audio: ArrayBuffer | Uint8Array | string; // string for base64 encoding
    sampleRate: number;
    format: 'pcm' | 'wav' | 'opus' | 'webm';
  };
}

/**
 * System interrupt frame
 */
export interface SystemInterruptFrame extends Frame {
  type: 'system.interrupt';
  data: {
    reason: 'user_speech' | 'timeout' | 'error';
  };
}

/**
 * System end frame
 */
export interface SystemEndFrame extends Frame {
  type: 'system.end';
  data: {
    reason: 'user_quit' | 'error' | 'timeout';
  };
}

/**
 * Union type for all frames
 */
export type VoiceFrame = 
  | UserAudioFrame
  | UserTextFrame
  | AssistantTextFrame
  | AssistantAudioFrame
  | SystemInterruptFrame
  | SystemEndFrame;

/**
 * Voice context passed to processors
 */
export interface VoiceContext {
  sessionId: string;
  conversationId?: string;
  profile: RuntimeProfile;
  config: RuntimeConfig;
  abortController?: AbortController;
  metadata?: Record<string, unknown>;
}

/**
 * Runtime profile determines which services to use
 */
export type RuntimeProfile = 'cloud' | 'hybrid' | 'local';

/**
 * Runtime configuration
 */
export interface RuntimeConfig {
  profile: RuntimeProfile;
  stt?: {
    provider: 'whisper' | 'openai' | 'google';
    endpoint?: string;
    apiKey?: string;
  };
  llm?: {
    provider: 'ollama' | 'openai' | 'anthropic';
    model?: string;
    endpoint?: string;
    apiKey?: string;
  };
  tts?: {
    provider: 'kokoro' | 'openai' | 'elevenlabs' | 'piper';
    endpoint?: string;
    apiKey?: string;
    voice?: string;
  };
}

/**
 * Processor function type
 * Power of 10 Rule 3: Each processor must be ≤ 60 lines
 */
export type Processor = (frame: VoiceFrame, ctx: VoiceContext) => Promise<VoiceFrame | null>;

/**
 * Transport interface for audio I/O
 */
export interface VoiceTransport {
  onAudioInput?: (audio: ArrayBuffer) => Promise<void>;
  onAudioOutput?: (audio: ArrayBuffer) => Promise<void>;
  onTextInput?: (text: string) => Promise<void>;
  onTextOutput?: (text: string) => Promise<void>;
  onError?: (error: Error) => void;
  onEnd?: () => void;
}

