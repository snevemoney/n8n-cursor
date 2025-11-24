/**
 * STT Processor - Audio to Text
 * 
 * Power of 10 Rule 3: Processor ≤ 60 lines
 */

import type { VoiceFrame, VoiceContext, UserTextFrame } from '../types';
import { invariant, createFrame, isFrameType } from '../utils';

/**
 * Convert audio to text using STT service
 * Power of 10 Rule 2: No unbounded loops, explicit max iterations
 * Supports French and English auto-detection
 */
async function transcribeAudio(
  audio: ArrayBuffer | Uint8Array,
  config: VoiceContext['config'],
  language?: string
): Promise<string> {
  const { profile, stt } = config;
  console.log('[STT] Transcribing audio, profile:', profile, 'stt provider:', stt?.provider);
  
  if (profile === 'local' || profile === 'hybrid') {
    // Use local Whisper service
    return await transcribeWithWhisper(audio, stt?.endpoint, language);
  }
  
  // Use cloud service - get API key from environment if not in config
  const apiKey = stt?.apiKey || process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Set OPENAI_API_KEY environment variable or configure stt.apiKey');
  }
  
  if (stt?.provider === 'openai' || profile === 'cloud') {
    return await transcribeWithOpenAI(audio, apiKey, language);
  }
  
  throw new Error(`STT not configured for profile: ${profile}`);
}

/**
 * Transcribe with local Whisper service
 * Supports French and English auto-detection
 */
async function transcribeWithWhisper(
  audio: ArrayBuffer | Uint8Array,
  endpoint?: string,
  language?: string
): Promise<string> {
  const whisperUrl = endpoint || process.env['WHISPER_URL'] || 'http://localhost:8000';
  
  const formData = new FormData();
  // Convert to ArrayBuffer for Blob
  const audioBuffer = audio instanceof ArrayBuffer ? audio : audio.buffer;
  const blob = new Blob([audioBuffer as BlobPart], { type: 'audio/wav' });
  formData.append('audio', blob, 'audio.wav');
  
  // Add language hint if provided (fr or en)
  if (language) {
    formData.append('language', language);
  }
  
  const response = await fetch(`${whisperUrl}/transcribe`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.text || '';
}

/**
 * Transcribe with OpenAI Whisper API
 * Supports French and English auto-detection
 */
async function transcribeWithOpenAI(
  audio: ArrayBuffer | Uint8Array,
  apiKey: string,
  language?: string
): Promise<string> {
  console.log('[STT] Transcribing with OpenAI, audio size:', audio instanceof ArrayBuffer ? audio.byteLength : audio.byteLength);
  
  const formData = new FormData();
  // Convert to ArrayBuffer for Blob
  const audioBuffer = audio instanceof ArrayBuffer ? audio : audio.buffer;
  // OpenAI Whisper supports webm, mp3, mp4, mpeg, mpga, m4a, wav, and webm
  // Use webm since that's what the browser records
  const blob = new Blob([audioBuffer as BlobPart], { type: 'audio/webm' });
  formData.append('file', blob, 'audio.webm');
  formData.append('model', 'whisper-1');
  
  // Auto-detect French or English (Whisper will detect automatically if not specified)
  // But we can hint it to prioritize these languages
  if (language) {
    formData.append('language', language);
  }
  
  // Add response format
  formData.append('response_format', 'json');
  
  console.log('[STT] Sending request to OpenAI Whisper API');
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[STT] OpenAI API error:', response.status, response.statusText, errorText);
    throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
  }
  
  const result = await response.json();
  console.log('[STT] Transcription result:', result);
  return result.text || '';
}

/**
 * STT Processor: Converts user.audio → user.text
 * Auto-detects French and English
 */
export async function sttProcessor(
  frame: VoiceFrame,
  ctx: VoiceContext
): Promise<VoiceFrame | null> {
  // Only process user.audio frames
  if (!isFrameType(frame, 'user.audio')) {
    return null;
  }
  
  invariant(frame.data && typeof frame.data === 'object', 'Invalid audio frame data');
  const audioData = frame.data as { audio: ArrayBuffer | Uint8Array; sampleRate: number; format: string; language?: string };
  
  try {
    // Use language hint if provided, otherwise let Whisper auto-detect (good at fr/en)
    const language = audioData.language || undefined;
    const text = await transcribeAudio(audioData.audio, ctx.config, language);
    
    if (!text || text.trim().length === 0) {
      return null;
    }
    
    const textFrame = createFrame('user.text', ctx.sessionId, { text }) as UserTextFrame;
    return textFrame;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[STT Processor] Error:', errorMessage);
    throw new Error(`STT failed: ${errorMessage}`);
  }
}

