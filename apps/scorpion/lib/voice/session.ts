/**
 * Voice Session - Main Orchestration
 * 
 * Power of 10 Rule 3: Main function ≤ 60 lines, helpers for complex logic
 */

import type { VoiceFrame, VoiceContext, VoiceTransport, RuntimeConfig } from './types';
import { invariant, createFrame } from './utils';
import { sttProcessor } from './processors/stt';
import { chatProcessor } from './processors/chat';
import { ttsProcessor } from './processors/tts';

/**
 * Process frame through pipeline
 */
async function processFrame(
  frame: VoiceFrame,
  ctx: VoiceContext,
  transport: VoiceTransport
): Promise<VoiceFrame | null> {
  // STT: audio → text (for LIVE TRANSCRIPTION)
  if (frame.type === 'user.audio') {
    console.log('[Voice Session] 🎤 Processing user.audio frame, size:', 
      (frame.data as { audio: ArrayBuffer | Uint8Array }).audio instanceof ArrayBuffer 
        ? (frame.data as { audio: ArrayBuffer }).audio.byteLength 
        : (frame.data as { audio: Uint8Array }).audio.byteLength);
    
    const textFrame = await sttProcessor(frame, ctx);
    if (textFrame && textFrame.type === 'user.text') {
      const textData = textFrame.data as { text: string };
      console.log('[Voice Session] 📝 Live transcribed text:', textData.text);
      // Send transcribed text immediately for live display via onTextInput callback
      // This sends it to the client without re-processing through chat
      if (transport.onTextInput) {
        await transport.onTextInput(textData.text);
      }
      // Return textFrame so pipeline continues to chat processing for voice response
      return textFrame;
    } else {
      console.log('[Voice Session] ⚠️ STT returned null or invalid frame');
      return null;
    }
  }
  
  // Chat: user.text → assistant.text (for voice response)
  if (frame.type === 'user.text') {
    const textData = frame.data as { text: string };
    console.log('[Voice Session] 💬 Processing user.text through chat:', textData.text);
    const assistantFrame = await chatProcessor(frame, ctx);
    if (assistantFrame) {
      if (assistantFrame.type === 'system.end') {
        console.log('[Voice Session] 🛑 System end frame received');
        return assistantFrame;
      }
      if (assistantFrame.type === 'assistant.text') {
        const assistantTextData = assistantFrame.data as { text: string };
        console.log('[Voice Session] ✅ Assistant response:', assistantTextData.text);
        if (transport.onTextOutput) {
          await transport.onTextOutput(assistantTextData.text);
        }
        return assistantFrame;
      }
    } else {
      console.log('[Voice Session] ⚠️ Chat processor returned null');
    }
  }
  
  // TTS: assistant.text → audio (Scorpion talks!)
  if (frame.type === 'assistant.text') {
    const textData = frame.data as { text: string };
    console.log('[Voice Session] 🔊 Converting assistant text to speech:', textData.text);
    const audioFrame = await ttsProcessor(frame, ctx);
    if (audioFrame && audioFrame.type === 'assistant.audio') {
      const audioData = audioFrame.data as { audio: ArrayBuffer | Uint8Array };
      const audioSize = audioData.audio instanceof ArrayBuffer 
        ? audioData.audio.byteLength 
        : audioData.audio.byteLength;
      console.log('[Voice Session] ✅ Generated audio response, size:', audioSize, 'bytes');
      if (transport.onAudioOutput) {
        await transport.onAudioOutput(audioData.audio as ArrayBuffer);
      }
      return audioFrame;
    } else {
      console.log('[Voice Session] ⚠️ TTS processor returned null or invalid frame');
    }
  }
  
  return null;
}

/**
 * Process a single turn through the pipeline
 * Power of 10 Rule 2: Explicit max iterations
 */
async function processTurn(
  frame: VoiceFrame,
  ctx: VoiceContext,
  transport: VoiceTransport
): Promise<boolean> {
  const MAX_ITERATIONS = 100;
  let iteration = 0;
  let currentFrame: VoiceFrame | null = frame;
  
  while (currentFrame && iteration < MAX_ITERATIONS) {
    if (ctx.abortController?.signal.aborted) {
      return false;
    }
    
    currentFrame = await processFrame(currentFrame, ctx, transport);
    
    if (currentFrame?.type === 'system.end') {
      return true; // Session should end
    }
    
    if (!currentFrame) {
      break; // Pipeline complete
    }
    
    iteration++;
  }
  
  if (iteration >= MAX_ITERATIONS) {
    throw new Error('Turn processing exceeded max iterations');
  }
  
  return false;
}

/**
 * Run voice session with interruption handling
 * Power of 10 Rule 3: Main function ≤ 60 lines
 */
export async function runVoiceSession(
  sessionId: string,
  transport: VoiceTransport,
  config: RuntimeConfig,
  conversationId?: string
): Promise<void> {
  invariant(sessionId && typeof sessionId === 'string', 'Invalid sessionId');
  invariant(transport && typeof transport === 'object', 'Invalid transport');
  invariant(config && typeof config === 'object', 'Invalid config');
  
  const ctx: VoiceContext = {
    sessionId,
    conversationId,
    profile: config.profile,
    config,
    abortController: new AbortController(),
  };
  
  let currentGeneration: AbortController | null = null;
  let isEnded = false;
  
  // Handle audio input
  const handleAudioInput = async (audio: ArrayBuffer): Promise<void> => {
    if (isEnded) {
      console.log('[Voice Session] ⚠️ Session ended, ignoring audio input');
      return;
    }
    
    console.log('[Voice Session] 🎤 Received audio input, size:', audio.byteLength, 'bytes');
    
    // Interrupt current generation
    if (currentGeneration) {
      console.log('[Voice Session] ⏹️ Interrupting current generation');
      currentGeneration.abort();
    }
    
    // Create new generation controller
    currentGeneration = new AbortController();
    ctx.abortController = currentGeneration;
    
    try {
      const audioFrame = createFrame('user.audio', sessionId, {
        audio,
        sampleRate: 24000,
        format: 'webm', // Browser sends webm, not wav
      });
      
      console.log('[Voice Session] 🔄 Processing audio turn through pipeline...');
      isEnded = await processTurn(audioFrame, ctx, transport);
      if (isEnded) {
        console.log('[Voice Session] 🛑 Session ended after processing turn');
        transport.onEnd?.();
      } else {
        console.log('[Voice Session] ✅ Turn processing completed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Voice Session] ❌ Error processing audio:', errorMessage);
      if (!ctx.abortController?.signal.aborted) {
        transport.onError?.(new Error(errorMessage));
      }
    } finally {
      currentGeneration = null;
    }
  };
  
  // Handle text input (for testing or direct input)
  const handleTextInput = async (text: string): Promise<void> => {
    if (isEnded) return;
    
    if (currentGeneration) {
      currentGeneration.abort();
    }
    
    currentGeneration = new AbortController();
    ctx.abortController = currentGeneration;
    
    try {
      const textFrame = createFrame('user.text', sessionId, { text });
      isEnded = await processTurn(textFrame, ctx, transport);
      if (isEnded) {
        transport.onEnd?.();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!ctx.abortController?.signal.aborted) {
        transport.onError?.(new Error(errorMessage));
      }
    } finally {
      currentGeneration = null;
    }
  };
  
  // Wire up transport handlers
  transport.onAudioInput = handleAudioInput;
  transport.onTextInput = handleTextInput;
}

