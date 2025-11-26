/**
 * RAG Configuration
 * Anti-hallucination RAG system for Scorpion
 *
 * Based on "current RAG meta":
 * - Intent-based retrieval
 * - Hybrid search (vector + keyword)
 * - Reranking with threshold gating
 * - Citation enforcement
 * - Domain-specific namespaces
 */

export type RAGIntent =
  | 'code_query'           // Code-related questions
  | 'ml_query'             // ML/AI questions
  | 'n8n_schema'           // n8n workflow/schema questions
  | 'infrastructure'       // Infra/deployment questions
  | 'architecture'         // System architecture questions
  | 'rag_config'           // RAG system questions
  | 'agent_policy'         // Agent behavior questions
  | 'tool_spec'            // Tool/API questions
  | 'general';             // General knowledge

/**
 * Pinecone namespace mapping
 */
export const RAG_NAMESPACES: Record<RAGIntent, string> = {
  code_query: 'scorpion-code',
  ml_query: 'scorpion-ml',
  n8n_schema: 'agentpilot-n8n',
  infrastructure: 'infra-docs',
  architecture: 'scorpion-architecture',
  rag_config: 'scorpion-rag',
  agent_policy: 'scorpion-agents',
  tool_spec: 'scorpion-tools',
  general: 'scorpion-general',
};

/**
 * Retrieval configuration per intent
 */
export interface RetrievalConfig {
  topK: number;              // How many candidates to retrieve
  minSimilarity: number;     // Minimum cosine similarity (0-1)
  useHybrid: boolean;        // Enable keyword + vector hybrid search
  keywordWeight: number;     // Weight for keyword search (0-1)
  vectorWeight: number;      // Weight for vector search (0-1)
  rerank: boolean;           // Enable reranker
  rerankTopN: number;        // Keep top N after reranking
  rerankThreshold: number;   // Min reranker score (0-1)
  graphExpansion: boolean;   // Enable graph-based context expansion
  graphDepth: number;        // How many hops to expand (0 = disabled)
}

/**
 * Intent-specific retrieval configs
 */
export const RETRIEVAL_CONFIGS: Record<RAGIntent, RetrievalConfig> = {
  code_query: {
    topK: 20,
    minSimilarity: 0.65,
    useHybrid: true,
    keywordWeight: 0.3,
    vectorWeight: 0.7,
    rerank: true,
    rerankTopN: 5,
    rerankThreshold: 0.68,
    graphExpansion: true,
    graphDepth: 2,
  },
  ml_query: {
    topK: 15,
    minSimilarity: 0.70,
    useHybrid: true,
    keywordWeight: 0.4,
    vectorWeight: 0.6,
    rerank: true,
    rerankTopN: 5,
    rerankThreshold: 0.72,
    graphExpansion: false,
    graphDepth: 0,
  },
  n8n_schema: {
    topK: 10,
    minSimilarity: 0.75,
    useHybrid: true,
    keywordWeight: 0.5,
    vectorWeight: 0.5,
    rerank: true,
    rerankTopN: 3,
    rerankThreshold: 0.80,
    graphExpansion: true,
    graphDepth: 1,
  },
  infrastructure: {
    topK: 12,
    minSimilarity: 0.68,
    useHybrid: true,
    keywordWeight: 0.4,
    vectorWeight: 0.6,
    rerank: true,
    rerankTopN: 4,
    rerankThreshold: 0.70,
    graphExpansion: false,
    graphDepth: 0,
  },
  architecture: {
    topK: 15,
    minSimilarity: 0.65,
    useHybrid: true,
    keywordWeight: 0.3,
    vectorWeight: 0.7,
    rerank: true,
    rerankTopN: 5,
    rerankThreshold: 0.68,
    graphExpansion: true,
    graphDepth: 2,
  },
  rag_config: {
    topK: 10,
    minSimilarity: 0.72,
    useHybrid: true,
    keywordWeight: 0.4,
    vectorWeight: 0.6,
    rerank: true,
    rerankTopN: 3,
    rerankThreshold: 0.75,
    graphExpansion: false,
    graphDepth: 0,
  },
  agent_policy: {
    topK: 8,
    minSimilarity: 0.75,
    useHybrid: true,
    keywordWeight: 0.3,
    vectorWeight: 0.7,
    rerank: true,
    rerankTopN: 3,
    rerankThreshold: 0.78,
    graphExpansion: true,
    graphDepth: 1,
  },
  tool_spec: {
    topK: 10,
    minSimilarity: 0.70,
    useHybrid: true,
    keywordWeight: 0.4,
    vectorWeight: 0.6,
    rerank: true,
    rerankTopN: 4,
    rerankThreshold: 0.72,
    graphExpansion: false,
    graphDepth: 0,
  },
  general: {
    topK: 12,
    minSimilarity: 0.60,
    useHybrid: true,
    keywordWeight: 0.4,
    vectorWeight: 0.6,
    rerank: true,
    rerankTopN: 5,
    rerankThreshold: 0.65,
    graphExpansion: false,
    graphDepth: 0,
  },
};

/**
 * Chunk configuration for semantic chunking
 */
export interface ChunkConfig {
  minChunkSize: number;
  maxChunkSize: number;
  overlap: number;
  respectBoundaries: boolean;  // Respect function/class boundaries
}

export const CODE_CHUNK_CONFIG: ChunkConfig = {
  minChunkSize: 200,
  maxChunkSize: 1500,
  overlap: 100,
  respectBoundaries: true,
};

export const DOC_CHUNK_CONFIG: ChunkConfig = {
  minChunkSize: 300,
  maxChunkSize: 1000,
  overlap: 150,
  respectBoundaries: false,
};

/**
 * AutoCut configuration (filter noisy chunks)
 */
export interface AutoCutConfig {
  minChunkLength: number;
  removeContradictions: boolean;
  removeOutdated: boolean;
  deduplicate: boolean;
  deduplicationThreshold: number;  // Cosine similarity threshold
}

export const DEFAULT_AUTOCUT_CONFIG: AutoCutConfig = {
  minChunkLength: 200,
  removeContradictions: true,
  removeOutdated: true,
  deduplicate: true,
  deduplicationThreshold: 0.95,
};

/**
 * Generation validation config
 */
export interface GenerationConfig {
  requireCitations: boolean;
  maxResponseLength: number;
  allowHallucination: boolean;
  insufficientContextMessage: string;
}

export const GENERATION_CONFIG: GenerationConfig = {
  requireCitations: true,
  maxResponseLength: 4000,
  allowHallucination: false,
  insufficientContextMessage: `⚠️ Insufficient retrieved context to answer reliably.

I cannot provide an accurate answer without more relevant information from the knowledge base.

Possible reasons:
- The information may not exist in the indexed documents
- The query might need to be more specific
- The relevant documents might not be indexed yet

Please try:
- Rephrasing your question with more specific details
- Breaking down the question into smaller parts
- Checking if the relevant documentation has been indexed`,
};

/**
 * Embedding model configuration
 */
export interface EmbeddingModelConfig {
  provider: 'openai' | 'ollama' | 'jina';
  model: string;
  dimensions: number;
}

export const EMBEDDING_MODELS: Record<string, EmbeddingModelConfig> = {
  'openai-small': {
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: 1536,
  },
  'openai-large': {
    provider: 'openai',
    model: 'text-embedding-3-large',
    dimensions: 3072,
  },
  'ollama-nomic': {
    provider: 'ollama',
    model: 'nomic-embed-text',
    dimensions: 768,
  },
  'jina-code': {
    provider: 'jina',
    model: 'jina-embeddings-v3-code',
    dimensions: 1024,
  },
};

/**
 * Default embedding model (code-aware)
 */
export const DEFAULT_EMBEDDING_MODEL: EmbeddingModelConfig = EMBEDDING_MODELS['openai-small'];

/**
 * Reranker model configuration
 */
export interface RerankerConfig {
  provider: 'bge' | 'cohere' | 'local';
  model: string;
  enabled: boolean;
}

export const RERANKER_CONFIG: RerankerConfig = {
  provider: 'bge',
  model: 'bge-reranker-large',
  enabled: true,
};

/**
 * Get retrieval config for intent
 */
export function getRetrievalConfig(intent: RAGIntent): RetrievalConfig {
  return RETRIEVAL_CONFIGS[intent] || RETRIEVAL_CONFIGS.general;
}

/**
 * Get namespace for intent
 */
export function getNamespace(intent: RAGIntent): string {
  return RAG_NAMESPACES[intent] || RAG_NAMESPACES.general;
}
