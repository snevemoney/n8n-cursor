import type { Conversation, Message } from './types';

/**
 * Conversation persistence - stores to localStorage and optionally to database
 */

const STORAGE_KEY = 'scorpion-conversations';

/**
 * Load all conversations from storage
 */
export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return data.conversations || [];
  } catch (error) {
    console.error('[Persistence] Error loading conversations:', error);
    return [];
  }
}

/**
 * Load messages for a conversation
 */
export function loadMessages(conversationId: string): Message[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `${STORAGE_KEY}-${conversationId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('[Persistence] Error loading messages:', error);
    return [];
  }
}

/**
 * Save conversation metadata
 */
export function saveConversation(conversation: Conversation): void {
  if (typeof window === 'undefined') return;
  
  try {
    const conversations = loadConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    
    // Keep last 100 conversations
    const trimmed = conversations.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      conversations: trimmed,
      lastUpdated: Date.now(),
    }));
  } catch (error) {
    console.error('[Persistence] Error saving conversation:', error);
  }
}

/**
 * Save messages for a conversation
 */
export function saveMessages(conversationId: string, messages: Message[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${STORAGE_KEY}-${conversationId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('[Persistence] Error saving messages:', error);
  }
}

/**
 * Delete a conversation and its messages
 */
export function deleteConversation(conversationId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Delete messages
    const key = `${STORAGE_KEY}-${conversationId}`;
    localStorage.removeItem(key);
    
    // Delete conversation metadata
    const conversations = loadConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      conversations: filtered,
      lastUpdated: Date.now(),
    }));
  } catch (error) {
    console.error('[Persistence] Error deleting conversation:', error);
  }
}

/**
 * Export all conversations to JSON
 */
export function exportConversations(): string {
  const conversations = loadConversations();
  const allData: any = {
    conversations: [],
    exportedAt: Date.now(),
  };
  
  conversations.forEach(conv => {
    allData.conversations.push({
      ...conv,
      messages: loadMessages(conv.id),
    });
  });
  
  return JSON.stringify(allData, null, 2);
}

/**
 * Import conversations from JSON
 */
export function importConversations(json: string): { success: boolean; count: number } {
  try {
    const data = JSON.parse(json);
    
    if (!data.conversations || !Array.isArray(data.conversations)) {
      throw new Error('Invalid format');
    }
    
    data.conversations.forEach((item: any) => {
      const { messages, ...conversation } = item;
      saveConversation(conversation);
      if (messages) {
        saveMessages(conversation.id, messages);
      }
    });
    
    return {
      success: true,
      count: data.conversations.length,
    };
  } catch (error: any) {
    console.error('[Persistence] Error importing:', error);
    return {
      success: false,
      count: 0,
    };
  }
}

/**
 * Sync to remote database (optional)
 */
export async function syncToDatabase(conversationId: string): Promise<boolean> {
  try {
    const conversation = loadConversations().find(c => c.id === conversationId);
    if (!conversation) return false;
    
    const messages = loadMessages(conversationId);
    
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation,
        messages,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('[Persistence] Error syncing to database:', error);
    return false;
  }
}

