/**
 * RAG types
 */

import { ExtractedKnowledge } from '../knowledge/types';

export type IndexingStrategy = 'chunk' | 'summary' | 'query' | 'sub-chunk';

export interface RAGDocument {
  id: string;
  content: string; // Full text representation of knowledge
  metadata: {
    source: string;
    type: string;
    category: string;
    tags: string[];
    extractedAt: string;
    indexingStrategy?: IndexingStrategy; // Strategy used for this entry
    originalId?: string; // ID of original knowledge entry (for summary/query/sub-chunk entries)
    chunkIndex?: number; // For sub-chunks
    chunkTotal?: number; // For sub-chunks
    // Pre-computed metadata flags for fast filtering (denormalized for performance)
    isTestFile?: boolean; // Pre-computed: true if this is a test file
    isReadme?: boolean; // Pre-computed: true if this is a README file
    isDoc?: boolean; // Pre-computed: true if this is documentation
    // File path information
    filePath?: string; // Primary file path for this knowledge item
    contentUrl?: string; // URL or path to content file
    codeSnippets?: Array<{ file: string; language: string; code: string; explanation: string }>; // Preserve code snippets
  };
  embedding?: number[]; // Vector embedding
}

