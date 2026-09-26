/**
 * Knowledge base persistence for pattern learning.
 * Stores success patterns in the shared RAG store.
 */

import type { ExtractedKnowledge } from '@scorpion/core';
import { getRAGStore } from '@/lib/shared-stores';

export interface KnowledgeBaseEntry {
  id: string;
  content: string;
  metadata: {
    type?: string;
    queryType?: string;
    userQuery?: string;
    toolsUsed?: string;
    timestamp?: string;
  };
}

export async function storeInKnowledgeBase(entry: KnowledgeBaseEntry): Promise<void> {
  const ragStore = await getRAGStore();
  const query = entry.metadata.userQuery?.trim() || entry.id;
  const tags = ['success_pattern'];
  if (entry.metadata.queryType) {
    tags.push(entry.metadata.queryType);
  }
  if (entry.metadata.toolsUsed) {
    tags.push(entry.metadata.toolsUsed);
  }

  const knowledge: ExtractedKnowledge = {
    id: entry.id,
    source: 'pattern-learning',
    type: 'pattern',
    category: entry.metadata.queryType || 'success_pattern',
    title: query.slice(0, 160),
    description: entry.content,
    codeSnippets: [],
    patterns: entry.metadata.type ? [entry.metadata.type] : [],
    dependencies: [],
    useCases: [],
    tags,
    extractedAt: entry.metadata.timestamp || new Date().toISOString(),
  };

  await ragStore.addKnowledge(knowledge);
}
