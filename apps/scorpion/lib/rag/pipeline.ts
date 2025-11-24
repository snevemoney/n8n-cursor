/**
 * RAG Pipeline
 * Main orchestrator for retrieval-augmented generation
 *
 * Pipeline stages:
 * 1. Query Rewriting (intent classification, expansion)
 * 2. Hybrid Retrieval (vector + keyword + graph)
 * 3. Reranking (cross-encoder + threshold gating)
 * 4. Validation (pre-generation checks)
 * 5. Generation (LLM with context)
 * 6. Validation (post-generation checks)
 * 7. Citation (append sources)
 */

import type { ScorpionIntent } from '@/lib/chat/types';
import { rewriteQuery, type RewrittenQuery } from './queryRewriter';
import { HybridRetriever, type VectorStore, type KeywordSearchEngine, type GraphStore, type RetrievalResult } from './retriever';
import { Reranker, type RerankingResult } from './reranker';
import { validatePreGeneration, validatePostGeneration, formatInsufficientContextMessage, appendCitations, type ValidationResult } from './validator';
import type { RAGIntent } from './config';

/**
 * RAG pipeline configuration
 */
export interface RAGPipelineConfig {
  vectorStore: VectorStore;
  keywordSearch?: KeywordSearchEngine;
  graphStore?: GraphStore;
  enableReranking?: boolean;
  enableValidation?: boolean;
  autoCitations?: boolean;
}

/**
 * RAG pipeline result
 */
export interface RAGPipelineResult {
  success: boolean;
  query: RewrittenQuery;
  retrieval?: RetrievalResult;
  reranking?: RerankingResult;
  validation?: ValidationResult;
  context?: string;           // Final context for LLM
  error?: string;
  insufficientContext?: boolean;
  insufficientContextMessage?: string;
  metrics: {
    totalTimeMs: number;
    rewriteTimeMs: number;
    retrievalTimeMs: number;
    rerankTimeMs: number;
    validationTimeMs: number;
  };
}

/**
 * RAG Pipeline
 */
export class RAGPipeline {
  private retriever: HybridRetriever;
  private reranker: Reranker;
  private config: Required<RAGPipelineConfig>;

  constructor(config: RAGPipelineConfig) {
    this.retriever = new HybridRetriever(
      config.vectorStore,
      config.keywordSearch,
      config.graphStore
    );
    this.reranker = new Reranker();
    this.config = {
      ...config,
      enableReranking: config.enableReranking !== false,
      enableValidation: config.enableValidation !== false,
      autoCitations: config.autoCitations !== false,
    };
  }

  /**
   * Execute RAG pipeline
   */
  async execute(
    query: string,
    scorpionIntent?: ScorpionIntent
  ): Promise<RAGPipelineResult> {
    const startTime = Date.now();
    const metrics = {
      totalTimeMs: 0,
      rewriteTimeMs: 0,
      retrievalTimeMs: 0,
      rerankTimeMs: 0,
      validationTimeMs: 0,
    };

    try {
      // Stage 1: Query Rewriting
      const rewriteStart = Date.now();
      const rewrittenQuery = rewriteQuery(query, scorpionIntent);
      metrics.rewriteTimeMs = Date.now() - rewriteStart;

      console.log('[RAGPipeline] Query rewritten:', {
        original: rewrittenQuery.original,
        rewritten: rewrittenQuery.rewritten,
        intent: rewrittenQuery.intent,
        keywords: rewrittenQuery.keywords,
      });

      // Stage 2: Hybrid Retrieval
      const retrievalStart = Date.now();
      const retrieval = await this.retriever.retrieve(
        rewrittenQuery,
        rewrittenQuery.intent
      );
      metrics.retrievalTimeMs = Date.now() - retrievalStart;

      console.log('[RAGPipeline] Retrieval complete:', {
        chunks: retrieval.chunks.length,
        metrics: retrieval.metrics,
      });

      // Stage 3: Reranking (if enabled)
      let reranking: RerankingResult | undefined;
      if (this.config.enableReranking) {
        const rerankStart = Date.now();
        reranking = await this.reranker.rerank(
          rewrittenQuery.rewritten,
          retrieval.chunks,
          rewrittenQuery.intent
        );
        metrics.rerankTimeMs = Date.now() - rerankStart;

        console.log('[RAGPipeline] Reranking complete:', {
          total: reranking.totalCandidates,
          passed: reranking.passedThreshold,
          removed: reranking.removedByAutoCut,
          hasSufficientContext: reranking.hasSufficientContext,
        });

        // Check if we have sufficient context
        if (!reranking.hasSufficientContext) {
          const message = formatInsufficientContextMessage(
            query,
            reranking.insufficientReason
          );

          metrics.totalTimeMs = Date.now() - startTime;

          return {
            success: false,
            query: rewrittenQuery,
            retrieval,
            reranking,
            insufficientContext: true,
            insufficientContextMessage: message,
            metrics,
          };
        }
      }

      // Stage 4: Pre-generation Validation
      const chunks = reranking?.chunks || retrieval.chunks;

      if (this.config.enableValidation) {
        const validationStart = Date.now();
        const preValidation = validatePreGeneration(chunks);
        metrics.validationTimeMs = Date.now() - validationStart;

        if (!preValidation.canGenerate) {
          const message = formatInsufficientContextMessage(
            query,
            preValidation.reason
          );

          metrics.totalTimeMs = Date.now() - startTime;

          return {
            success: false,
            query: rewrittenQuery,
            retrieval,
            reranking,
            insufficientContext: true,
            insufficientContextMessage: message,
            metrics,
          };
        }
      }

      // Stage 5: Build context for LLM
      const context = this.buildContext(rewrittenQuery, chunks);

      metrics.totalTimeMs = Date.now() - startTime;

      return {
        success: true,
        query: rewrittenQuery,
        retrieval,
        reranking,
        context,
        metrics,
      };
    } catch (error: any) {
      metrics.totalTimeMs = Date.now() - startTime;

      console.error('[RAGPipeline] Pipeline error:', error);

      return {
        success: false,
        query: rewriteQuery(query, scorpionIntent),
        error: error.message || 'Unknown pipeline error',
        metrics,
      };
    }
  }

  /**
   * Build context string for LLM
   */
  private buildContext(query: RewrittenQuery, chunks: RerankedChunk[]): string {
    let context = `# Retrieved Context\n\n`;
    context += `**Query:** ${query.original}\n`;
    context += `**Intent:** ${query.intent}\n\n`;
    context += `---\n\n`;

    // Add chunks with citations
    chunks.forEach((chunk, idx) => {
      context += `## Source ${idx + 1}: ${chunk.citation}\n\n`;
      context += `${chunk.content}\n\n`;
      context += `**Relevance Score:** ${(chunk.rerankScore * 100).toFixed(1)}%\n\n`;
      context += `---\n\n`;
    });

    return context;
  }

  /**
   * Validate generated answer (post-generation)
   */
  validateAnswer(
    generatedText: string,
    pipelineResult: RAGPipelineResult
  ): ValidationResult {
    if (!this.config.enableValidation) {
      return {
        isValid: true,
        hasCitations: false,
        citations: [],
        issues: [],
        score: 1.0,
        shouldReject: false,
      };
    }

    const chunks = pipelineResult.reranking?.chunks || pipelineResult.retrieval?.chunks || [];
    return validatePostGeneration(generatedText, chunks);
  }

  /**
   * Append citations to answer (if enabled)
   */
  appendCitations(
    answer: string,
    pipelineResult: RAGPipelineResult
  ): string {
    if (!this.config.autoCitations) {
      return answer;
    }

    const chunks = pipelineResult.reranking?.chunks || pipelineResult.retrieval?.chunks || [];
    return appendCitations(answer, chunks);
  }
}

/**
 * Create RAG pipeline with default configuration
 */
export function createRAGPipeline(config: RAGPipelineConfig): RAGPipeline {
  return new RAGPipeline(config);
}

// Re-export types for convenience
export type { RewrittenQuery, RetrievalResult, RerankingResult, ValidationResult };
export type { RetrievedChunk } from './retriever';
export type { RerankedChunk } from './reranker';
