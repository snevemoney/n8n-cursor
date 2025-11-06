/**
 * RAG types
 */

import { ExtractedKnowledge } from '../knowledge/types';

export interface RAGDocument {
  id: string;
  content: string; // Full text representation of knowledge
  metadata: {
    source: string;
    type: string;
    category: string;
    tags: string[];
    extractedAt: string;
  };
  embedding?: number[]; // Vector embedding
}

