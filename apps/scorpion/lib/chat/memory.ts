import { getRAGStore } from '@/lib/shared-stores';

/**
 * Chat memory - short-term and long-term
 */

// Short-term memory (per conversation)
const conversationMemory = new Map<string, Array<{ text: string; ts: number }>>();

/**
 * Add to short-term memory
 */
export function remember(conversationId: string, text: string, tags?: string[]): void {
  const existing = conversationMemory.get(conversationId) || [];
  existing.push({ text, ts: Date.now() });
  
  // Keep last 20 items
  if (existing.length > 20) {
    existing.shift();
  }
  
  conversationMemory.set(conversationId, existing);
}

/**
 * Recall from short-term memory
 */
export function recall(conversationId: string, limit: number = 5): string[] {
  const memory = conversationMemory.get(conversationId) || [];
  return memory.slice(-limit).map(m => m.text);
}

/**
 * Commit to long-term memory (RAG store)
 */
export async function commitToLongTerm(
  conversationId: string,
  docIds: string[]
): Promise<void> {
  try {
    const store = await getRAGStore();
    const memory = conversationMemory.get(conversationId) || [];
    
    // Store in RAG with special tag
    for (const item of memory) {
      await store.add({
        id: `mem-${conversationId}-${Date.now()}`,
        title: `Memory from conversation ${conversationId}`,
        description: item.text,
        category: 'conversation-memory',
        tags: ['chat', conversationId],
        metadata: { conversationId, timestamp: item.ts },
      });
    }
  } catch (error) {
    console.error('[Memory] Failed to commit to long-term:', error);
  }
}

/**
 * Clear short-term memory
 */
export function clearMemory(conversationId: string): void {
  conversationMemory.delete(conversationId);
}

