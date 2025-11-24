/**
 * Chat Processor - User Text to Assistant Text
 * 
 * Power of 10 Rule 3: Processor ≤ 60 lines
 */

import type { VoiceFrame, VoiceContext, AssistantTextFrame } from '../types';
import { invariant, createFrame, isFrameType } from '../utils';

/**
 * Call Scorpion chat endpoint
 */
async function callChatEndpoint(
  userText: string,
  conversationId: string | undefined,
  config: VoiceContext['config']
): Promise<string> {
  const { profile, llm } = config;
  
  // Use existing chat endpoint
  const chatUrl = process.env['CHAT_API_URL'] || 'http://localhost:3003/api/chat/stream';
  
  const response = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: userText }],
      conversationId,
      provider: profile === 'local' ? 'ollama' : llm?.provider || 'ollama',
      model: llm?.model || (profile === 'local' ? 'llama3.1:8b' : undefined),
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }
  
  // Read streaming response
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }
  
  const decoder = new TextDecoder();
  let fullText = '';
  
  // Power of 10 Rule 2: Explicit max iterations
  const MAX_ITERATIONS = 10000;
  let iteration = 0;
  
  while (iteration < MAX_ITERATIONS) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'message' && parsed.data?.content) {
            fullText += parsed.data.content;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
    
    iteration++;
  }
  
  if (iteration >= MAX_ITERATIONS) {
    throw new Error('Stream processing exceeded max iterations');
  }
  
  return fullText || 'I apologize, but I could not generate a response.';
}

/**
 * Chat Processor: Converts user.text → assistant.text
 */
export async function chatProcessor(
  frame: VoiceFrame,
  ctx: VoiceContext
): Promise<VoiceFrame | null> {
  // Only process user.text frames
  if (!isFrameType(frame, 'user.text')) {
    return null;
  }
  
  invariant(frame.data && typeof frame.data === 'object', 'Invalid text frame data');
  const textData = frame.data as { text: string };
  
  // Check for quit commands
  const lowerText = textData.text.toLowerCase().trim();
  if (lowerText === 'quit' || lowerText === 'exit' || lowerText === 'stop') {
    return createFrame('system.end', ctx.sessionId, { reason: 'user_quit' });
  }
  
  try {
    const assistantText = await callChatEndpoint(
      textData.text,
      ctx.conversationId,
      ctx.config
    );
    
    if (!assistantText || assistantText.trim().length === 0) {
      return null;
    }
    
    const textFrame = createFrame('assistant.text', ctx.sessionId, { text: assistantText }) as AssistantTextFrame;
    return textFrame;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Chat Processor] Error:', errorMessage);
    throw new Error(`Chat failed: ${errorMessage}`);
  }
}

