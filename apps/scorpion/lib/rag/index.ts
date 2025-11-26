/**
 * RAG System - Anti-Hallucination Pipeline
 *
 * A production-grade RAG system designed to eliminate hallucinations
 * by enforcing strict retrieval → reranking → validation → citation flow.
 *
 * Architecture:
 * 1. Query Rewriter - Classifies intent and rewrites queries for better retrieval
 * 2. Hybrid Retriever - Combines vector, keyword, and graph-based search
 * 3. Reranker - Cross-encoder scoring with threshold gating
 * 4. Semantic Chunker - Code-aware and doc-aware chunking
 * 5. Validator - Pre/post-generation validation with hallucination detection
 * 6. Pipeline - Orchestrates the entire flow
 *
 * Usage:
 * ```typescript
 * import { createRAGPipeline, InMemoryVectorStore } from '@/lib/rag';
 *
 * const vectorStore = new InMemoryVectorStore();
 * const pipeline = createRAGPipeline({ vectorStore });
 *
 * const result = await pipeline.execute("How does the planner work?");
 *
 * if (result.success && result.context) {
 *   // Use result.context as LLM context
 *   const answer = await llm.generate(result.context);
 *
 *   // Validate and append citations
 *   const validation = pipeline.validateAnswer(answer, result);
 *   if (validation.isValid) {
 *     const finalAnswer = pipeline.appendCitations(answer, result);
 *     console.log(finalAnswer);
 *   }
 * } else if (result.insufficientContext) {
 *   console.log(result.insufficientContextMessage);
 * }
 * ```
 */

// Core pipeline
export {
  RAGPipeline,
  createRAGPipeline,
  type RAGPipelineConfig,
  type RAGPipelineResult,
} from './pipeline';

// Query rewriting
export {
  rewriteQuery,
  rewriteQueries,
  classifyRAGIntent,
  type RewrittenQuery,
} from './queryRewriter';

// Retrieval
export {
  HybridRetriever,
  InMemoryVectorStore,
  InMemoryKeywordSearch,
  type VectorStore,
  type KeywordSearchEngine,
  type GraphStore,
  type RetrievedChunk,
  type RetrievalResult,
  type VectorSearchResult,
  type KeywordSearchResult,
  type GraphNode,
} from './retriever';

// Reranking
export {
  Reranker,
  defaultReranker,
  type RerankedChunk,
  type RerankingResult,
  type CrossEncoderReranker,
} from './reranker';

// Chunking
export {
  chunkDocument,
  chunkDocuments,
  type DocumentChunk,
} from './chunker';

// Validation
export {
  validateAnswer,
  validatePreGeneration,
  validatePostGeneration,
  formatInsufficientContextMessage,
  appendCitations,
  type ValidationResult,
  type ValidationIssue,
  type Citation,
} from './validator';

// Configuration
export {
  type RAGIntent,
  type RetrievalConfig,
  type ChunkConfig,
  type AutoCutConfig,
  type GenerationConfig,
  type EmbeddingModelConfig,
  type RerankerConfig,
  RAG_NAMESPACES,
  RETRIEVAL_CONFIGS,
  CODE_CHUNK_CONFIG,
  DOC_CHUNK_CONFIG,
  DEFAULT_AUTOCUT_CONFIG,
  GENERATION_CONFIG,
  EMBEDDING_MODELS,
  DEFAULT_EMBEDDING_MODEL,
  RERANKER_CONFIG,
  getRetrievalConfig,
  getNamespace,
} from './config';
