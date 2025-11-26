// Power of 10 Rule 4: Extract intent handling to focused functions
import type { ReadableStreamDefaultController } from 'stream/web';
import type { StreamState } from '../phases';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { runModelUnified } from '@/lib/chat/modelRunner';

/**
 * Resolve prompt file path correctly regardless of cwd
 */
function getPromptPath(filename: string): string {
  const cwd = process.cwd();
  
  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }
  
  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }
  
  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);
  
  return fallbackPath;
}

/**
 * Handle identity intent - direct answer without tools/planner/council
 * Power of 10 Rule 4: Small function (<60 lines)
 */
export async function handleIdentityIntent(
  userMessage: string,
  _conversationId: string | undefined,
  model: string | undefined,
  provider: string | undefined,
  send: (event: { type: string; data: Record<string, unknown> }) => void,
  streamState: StreamState,
  controller: ReadableStreamDefaultController<Uint8Array>,
  messageId: string
): Promise<boolean> {
  try {
    // Load identity prompt
    const identityPromptPath = getPromptPath('identity.system.txt');
    if (!existsSync(identityPromptPath)) {
      throw new Error(`Identity prompt file not found: ${identityPromptPath}`);
    }
    const identityPrompt = readFileSync(identityPromptPath, 'utf-8');
    if (!identityPrompt || identityPrompt.trim().length === 0) {
      throw new Error('Identity prompt file is empty');
    }
    console.log('[Prompt] using identity.system.txt for intent: identity');
    
    // Stream direct LLM response without planner/council/tools
    const defaultModel = model || process.env['OLLAMA_MODEL'] || 'scorpion:latest';
    
    // Add timeout for identity response (10 seconds)
    const identityTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Identity response timeout after 10s')), 10000);
    });
    
    const identityResponse = runModelUnified(
      identityPrompt,
      userMessage,
      {
        provider: provider || 'ollama',
        model: defaultModel,
        maxTokens: 500,
        temperature: 0.4
      },
      (chunk: string) => {
        send({ type: 'delta', data: { content: chunk } });
      }
    );
    
    await Promise.race([identityResponse, identityTimeout]);
    
    // Send final message
    send({ type: 'done', data: { messageId } });
    streamState.closed = true;
    controller.close();
    return true; // Handled
  } catch (error: unknown) {
    console.error('[Chat Stream] Error handling identity intent:', error);
    send({
      type: 'error',
      data: {
        message: 'Failed to load identity configuration. Please check server logs.',
        phase: 'identity',
      },
    });
    controller.close();
    return true; // Handled (even if error)
  }
}

/**
 * Check if message is a simple greeting
 */
export function isSimpleGreeting(message: string): boolean {
  return /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|test|hello test)$/i.test(message.trim());
}

/**
 * Handle small talk intent - direct conversational response without tools/planner/council
 * Power of 10 Rule 4: Extract large function to focused module
 */
export async function handleSmallTalkIntent(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  model: string | undefined,
  provider: string | undefined,
  send: (event: { type: string; data: Record<string, unknown> }) => void,
  streamState: StreamState,
  controller: ReadableStreamDefaultController<Uint8Array>,
  messageId: string
): Promise<boolean> {
  try {
    // Extract user name from CURRENT MESSAGE, conversation history, AND RAG store
    let userName = 'Evens Louis'; // Default
    let userRole = 'master and system owner'; // Default
    
    // CRITICAL: Check CURRENT message first (not just history)
    const currentMessageLower = userMessage.toLowerCase();
    
    // Pattern 1: "[name] i am your master" - e.g., "evens i am your master"
    const nameMasterPattern = currentMessageLower.match(/([a-z]+(?:\s+[a-z]+)?)\s+(?:i am|i'm)\s+(?:your\s+)?(?:master|owner)/i);
    if (nameMasterPattern && nameMasterPattern[1]) {
      userName = nameMasterPattern[1].trim();
      userName = userName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      console.log('[Small Talk] Extracted name from current message (pattern 1):', userName);
    }
    // Pattern 2: "i am [name]" or "my name is [name]"
    else {
      const nameIntroPattern = currentMessageLower.match(/(?:i am|i'm|my name is|call me)\s+([a-z]+(?:\s+[a-z]+)?)/i);
      if (nameIntroPattern && nameIntroPattern[1]) {
        userName = nameIntroPattern[1].trim();
        userName = userName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        console.log('[Small Talk] Extracted name from current message (pattern 2):', userName);
      }
      // Pattern 3: Check for "evens" specifically with master/owner
      else if (currentMessageLower.includes('evens') && (currentMessageLower.includes('master') || currentMessageLower.includes('owner'))) {
        userName = 'Evens';
        console.log('[Small Talk] Extracted name from current message (pattern 3):', userName);
      }
    }
    
    // If not found in current message, try conversation history
    if (userName === 'Evens Louis' && conversationHistory && conversationHistory.length > 0) {
      // Look for name introductions in previous messages
      for (const msg of conversationHistory.slice().reverse()) {
        const content = (msg.content || '').toLowerCase();
        // Check for "i am [name]" or "my name is [name]" or "[name] i am your master"
        const nameMatch = content.match(/(?:i am|i'm|my name is|call me)\s+([a-z]+(?:\s+[a-z]+)?)/i) ||
                          content.match(/([a-z]+(?:\s+[a-z]+)?)\s+(?:i am|i'm)\s+(?:your\s+)?(?:master|owner)/i);
        if (nameMatch && nameMatch[1]) {
          userName = nameMatch[1].trim();
          // Capitalize first letter of each word
          userName = userName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          console.log('[Small Talk] Extracted name from conversation history:', userName);
          break;
        }
        // Check for "evens" specifically
        if (content.includes('evens') && (content.includes('master') || content.includes('owner'))) {
          userName = 'Evens';
          console.log('[Small Talk] Extracted name from conversation history (evens):', userName);
          break;
        }
      }
    }
    
    // If not found in conversation history, try RAG store for user identity
    if (userName === 'Evens Louis' && (userMessage.toLowerCase().includes('name') || userMessage.toLowerCase().includes('remember'))) {
      try {
        const { getRAGStore } = await import('@/lib/shared-stores');
        const ragStore = await getRAGStore();
        const identityResults = await ragStore.search('user identity name', 5);
        
        // Look for user identity entries
        for (const result of identityResults) {
          if (result.category === 'user-identity' || result.tags?.includes('identity')) {
            // Power of 10 Rule 7: Guard optional property - metadata may not exist on ExtractedKnowledge
            const metadata = (result as any).metadata || {};
            if (metadata.key === 'user_name' && metadata.value) {
              userName = metadata.value;
              console.log('[Small Talk] Found user name in RAG:', userName);
              break;
            }
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        console.warn('[Small Talk] Failed to search RAG for user identity:', err?.message);
        // Continue with default name
      }
    }
    
    // Build conversation context for name recall
    const recentHistory = conversationHistory?.slice(-5).map((m: any) => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n') || '';
    
    // Check if this is an identity statement (user introducing themselves as master)
    const isIdentityStatement = /(i am|i'm)\s+(your|the)\s+(master|owner)/i.test(userMessage) || 
                               /([a-z]+)\s+(i am|i'm)\s+(your|the)\s+(master|owner)/i.test(userMessage);
    
    // Simple conversational prompt for small talk
    let smallTalkPrompt = `You are Scorpion, a helpful AI assistant serving ${userName} (the system owner). The user is greeting you or making casual conversation.

${recentHistory ? `RECENT CONVERSATION HISTORY:\n${recentHistory}\n\n` : ''}

IMPORTANT CONTEXT:
- The user's name is ${userName}
- They are your ${userRole}
- If they ask "what's my name?" or "do you remember my name?", answer: "Yes, you're ${userName}, my ${userRole}. How can I help you today?"
- If they introduce themselves, acknowledge it warmly and remember their name

${isIdentityStatement ? `CRITICAL: The user just said "${userMessage}". This is an identity statement where they are introducing themselves as your master/owner. You MUST acknowledge this directly and warmly. Respond with something like: "Yes, ${userName}! I recognize you as my ${userRole}. How can I help you today?" or "Understood, ${userName}! You're my ${userRole}. What would you like me to do?"\n\n` : ''}

Respond naturally and friendly. Keep it brief and conversational. No need for tools or complex planning - just be friendly and helpful.

Examples:
- "hi" → "Hey there! How can I help you today?"
- "hello" → "Hello! What can I do for you?"
- "how are you" → "I'm doing well, thanks for asking! How can I help you today?"
- "thanks" → "You're welcome! Anything else I can help with?"
- "what's my name?" → "Yes, you're ${userName}, my ${userRole}. How can I help you today?"
- "do you remember my name?" → "Yes, you're ${userName}, my ${userRole}. How can I help you today?"
- "${userName.toLowerCase()} i am your master" → "Yes, ${userName}! I recognize you as my ${userRole}. How can I help you today?"

Be warm, brief, and helpful. Don't overthink it.`;
    
    // Stream direct LLM response without planner/council/tools
    const defaultModel = model || process.env['OLLAMA_MODEL'] || 'scorpion:latest';
    
    // Add timeout for small talk response (5 seconds - should be quick)
    const smallTalkTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Small talk response timeout after 5s')), 5000);
    });
    
    const smallTalkResponse = runModelUnified(
      smallTalkPrompt,
      userMessage,
      {
        provider: provider || 'ollama',
        model: defaultModel,
        maxTokens: 150, // Brief responses for small talk
        temperature: 0.7 // Higher temperature for more natural conversation
      },
      (chunk: string) => {
        // Stream response chunks
        send({ type: 'delta', data: { content: chunk } });
      }
    );
    
    await Promise.race([smallTalkResponse, smallTalkTimeout]);
    
    // Send final message
    send({ type: 'done', data: { messageId } });
    streamState.closed = true;
    controller.close();
    return true; // Handled
  } catch (error: unknown) {
    console.error('[Chat Stream] Error handling small talk intent:', error);
    // Fallback to simple response
    send({
      type: 'message',
      data: {
        id: messageId,
        role: 'assistant',
        content: 'Hey there! How can I help you today?',
      },
    });
    send({ type: 'done', data: { messageId } });
    controller.close();
    return true; // Handled (even if error)
  }
}

