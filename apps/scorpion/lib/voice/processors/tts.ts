/**
 * TTS Processor - Assistant Text to Audio
 * 
 * Power of 10 Rule 3: Processor ≤ 60 lines
 */

import type { VoiceFrame, VoiceContext, AssistantAudioFrame } from '../types';
import { invariant, createFrame, isFrameType } from '../utils';

/**
 * Convert text to audio using TTS service
 */
async function synthesizeSpeech(
  text: string,
  config: VoiceContext['config']
): Promise<ArrayBuffer> {
  const { profile, tts } = config;
  
  if (profile === 'local' || profile === 'hybrid') {
    // Use local Kokoro or Piper
    return await synthesizeWithLocalTTS(text, tts);
  }
  
  // Use cloud service - OpenAI TTS (default for cloud profile)
  const apiKey = tts?.apiKey || process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Set OPENAI_API_KEY environment variable or configure tts.apiKey');
  }
  
  if (tts?.provider === 'openai' || profile === 'cloud') {
    return await synthesizeWithOpenAI(text, apiKey, tts?.voice);
  }
  
  if (tts?.provider === 'elevenlabs' && tts.apiKey) {
    return await synthesizeWithElevenLabs(text, tts.apiKey, tts.voice);
  }
  
  throw new Error(`TTS not configured for profile: ${profile}`);
}

/**
 * Synthesize with local TTS (Kokoro or Piper)
 */
async function synthesizeWithLocalTTS(
  text: string,
  ttsConfig?: VoiceContext['config']['tts']
): Promise<ArrayBuffer> {
  const endpoint = ttsConfig?.endpoint || process.env['TTS_URL'] || 'http://localhost:5000';
  const provider = ttsConfig?.provider || 'kokoro';
  
  const response = await fetch(`${endpoint}/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      provider,
      voice: ttsConfig?.voice || 'default',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Local TTS API error: ${response.statusText}`);
  }
  
  return await response.arrayBuffer();
}

/**
 * Synthesize with OpenAI TTS
 */
async function synthesizeWithOpenAI(
  text: string,
  apiKey: string,
  voice?: string
): Promise<ArrayBuffer> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: voice || 'alloy',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI TTS API error: ${response.statusText}`);
  }
  
  return await response.arrayBuffer();
}

/**
 * Synthesize with ElevenLabs TTS
 */
async function synthesizeWithElevenLabs(
  text: string,
  apiKey: string,
  voiceId?: string
): Promise<ArrayBuffer> {
  const voice = voiceId || process.env['ELEVENLABS_VOICE_ID'] || 'default';
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }
  
  return await response.arrayBuffer();
}

/**
 * TTS Processor: Converts assistant.text → assistant.audio
 */
export async function ttsProcessor(
  frame: VoiceFrame,
  ctx: VoiceContext
): Promise<VoiceFrame | null> {
  // Only process assistant.text frames
  if (!isFrameType(frame, 'assistant.text')) {
    return null;
  }
  
  invariant(frame.data && typeof frame.data === 'object', 'Invalid text frame data');
  const textData = frame.data as { text: string };
  
  try {
    const audio = await synthesizeSpeech(textData.text, ctx.config);
    
    const audioFrame = createFrame('assistant.audio', ctx.sessionId, {
      audio,
      sampleRate: 24000, // Default sample rate
      format: 'wav',
    }) as AssistantAudioFrame;
    
    return audioFrame;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[TTS Processor] Error:', errorMessage);
    throw new Error(`TTS failed: ${errorMessage}`);
  }
}

