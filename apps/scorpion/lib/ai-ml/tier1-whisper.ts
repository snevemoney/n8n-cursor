// Tier 1: Whisper (Speech-to-Text)
// Integration with OpenAI Whisper API or local Whisper model

import { query } from '@/lib/db/client';

export interface WhisperRequest {
  audio: Buffer | string; // Base64 encoded audio or file path
  language?: string; // Optional language hint
  prompt?: string; // Optional context prompt
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

export interface WhisperResponse {
  text: string;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avgLogprob: number;
    compressionRatio: number;
    noSpeechProb: number;
  }>;
  language?: string;
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeWithWhisper(
  request: WhisperRequest
): Promise<WhisperResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for Whisper transcription');
  }

  // Handle base64 audio or file path
  let audioData: FormData | File;
  if (typeof request.audio === 'string') {
    // If it's a base64 string, convert to blob
    const audioBlob = Buffer.from(request.audio, 'base64');
    audioData = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });
  } else {
    audioData = new File([request.audio], 'audio.mp3', { type: 'audio/mpeg' });
  }

  const formData = new FormData();
  formData.append('file', audioData);
  formData.append('model', 'whisper-1');
  if (request.language) formData.append('language', request.language);
  if (request.prompt) formData.append('prompt', request.prompt);
  if (request.responseFormat) formData.append('response_format', request.responseFormat);
  if (request.temperature !== undefined) formData.append('temperature', request.temperature.toString());

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Whisper API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  
  return {
    text: result.text || '',
    segments: result.segments,
    language: result.language,
  };
}

/**
 * Transcribe audio using local Whisper (via Ollama or local model)
 */
export async function transcribeWithLocalWhisper(
  request: WhisperRequest
): Promise<WhisperResponse> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  // Check if Whisper model is available
  try {
    const modelsResponse = await fetch(`${ollamaUrl}/api/tags`);
    const modelsData = await modelsResponse.json();
    const hasWhisper = modelsData.models?.some((m: any) => 
      m.name.toLowerCase().includes('whisper')
    );

    if (!hasWhisper) {
      throw new Error('Whisper model not found in Ollama. Install with: ollama pull whisper');
    }
  } catch (error) {
    throw new Error(`Local Whisper not available: ${error}`);
  }

  // Convert audio to base64 if needed
  const audioBase64 = typeof request.audio === 'string' 
    ? request.audio 
    : request.audio.toString('base64');

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'whisper',
      prompt: `Transcribe this audio: ${audioBase64}`,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Local Whisper error: ${response.status}`);
  }

  const result = await response.json();
  
  return {
    text: result.response || '',
  };
}

/**
 * Store transcription in database for analysis
 */
export async function storeTranscription(
  audioHash: string,
  transcription: WhisperResponse,
  metadata?: Record<string, unknown>
): Promise<void> {
  await query(
    `INSERT INTO ml_transcriptions (id, audio_hash, text, language, segments, metadata, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
     ON CONFLICT (audio_hash) DO UPDATE
     SET text = $2, language = $3, segments = $4, metadata = $5, updated_at = NOW()`,
    [
      audioHash,
      transcription.text,
      transcription.language || null,
      transcription.segments ? JSON.stringify(transcription.segments) : null,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );
}

