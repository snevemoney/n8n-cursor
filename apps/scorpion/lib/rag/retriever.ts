/**
 * Hybrid Retriever
 * Combines vector search + keyword search + graph expansion
 *
 * Features:
 * - Vector similarity search (cosine distance)
 * - BM25 keyword search
 * - Hybrid score fusion (RRF - Reciprocal Rank Fusion)
 * - Graph-based context expansion
 * - Metadata filtering
 */

import { generateEmbedding, cosineSimilarity } from '@/lib/transformer/embeddings';
import type { RAGIntent, RetrievalConfig } from './config';
import { getRetrievalConfig, getNamespace } from './config';
import type { RewrittenQuery } from './queryRewriter';

/**
 * Retrieved document chunk
 */
export interface RetrievedChunk {
  id: string;
  content: string;
  source: string;           // File path or URL
  chunkIndex: number;       // Position in original document
  metadata: Record<string, any>;
  score: number;            // Final retrieval score
  vectorScore?: number;     // Vector similarity score
  keywordScore?: number;    // BM25 keyword score
  graphScore?: number;      // Graph expansion bonus
}

/**
 * Retrieval result
 */
export interface RetrievalResult {
  chunks: RetrievedChunk[];
  query: RewrittenQuery;
  config: RetrievalConfig;
  metrics: {
    totalCandidates: number;
    vectorResults: number;
    keywordResults: number;
    graphResults: number;
    finalResults: number;
    retrievalTimeMs: number;
  };
}

/**
 * Vector store interface (Pinecone/Supabase)
 */
export interface VectorStore {
  query(embedding: number[], namespace: string, topK: number): Promise<VectorSearchResult[]>;
  queryByIds(ids: string[], namespace: string): Promise<VectorSearchResult[]>;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: {
    content: string;
    source: string;
    chunkIndex: number;
    [key: string]: any;
  };
}

/**
 * Keyword search interface (Supabase FTS / Elasticsearch)
 */
export interface KeywordSearchEngine {
  search(query: string, namespace: string, topK: number): Promise<KeywordSearchResult[]>;
}

export interface KeywordSearchResult {
  id: string;
  content: string;
  source: string;
  chunkIndex: number;
  score: number;
  metadata: Record<string, any>;
}

/**
 * Graph store interface (Neo4j / Postgres JSONB)
 */
export interface GraphStore {
  expandContext(chunkIds: string[], depth: number): Promise<GraphNode[]>;
}

export interface GraphNode {
  id: string;
  content: string;
  source: string;
  chunkIndex: number;
  metadata: Record<string, any>;
  relationshipType?: string;  // 'imports', 'depends_on', 'references', etc.
  distance: number;            // Graph distance from seed node
}

/**
 * BM25 scoring (simple implementation)
 * For production, use proper BM25 from Elasticsearch or pg_trgm
 */
function calculateBM25Score(
  queryTerms: string[],
  documentText: string,
  avgDocLength: number = 500,
  k1: number = 1.5,
  b: number = 0.75
): number {
  const docLength = documentText.split(/\s+/).length;
  const docTerms = documentText.toLowerCase().split(/\s+/);
  const docTermFreq = new Map<string, number>();

  // Calculate term frequencies
  for (const term of docTerms) {
    docTermFreq.set(term, (docTermFreq.get(term) || 0) + 1);
  }

  let score = 0;

  for (const queryTerm of queryTerms) {
    const termFreq = docTermFreq.get(queryTerm.toLowerCase()) || 0;
    if (termFreq === 0) continue;

    // BM25 formula
    const numerator = termFreq * (k1 + 1);
    const denominator = termFreq + k1 * (1 - b + b * (docLength / avgDocLength));
    const termScore = numerator / denominator;

    score += termScore;
  }

  return score;
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Combines multiple ranked lists into a single ranking
 */
function reciprocalRankFusion(
  rankedLists: Array<{ id: string; score: number }[]>,
  k: number = 60
): Map<string, number> {
  const fusedScores = new Map<string, number>();

  for (const rankedList of rankedLists) {
    rankedList.forEach((item, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      fusedScores.set(
        item.id,
        (fusedScores.get(item.id) || 0) + rrfScore
      );
    });
  }

  return fusedScores;
}

/**
 * Hybrid retriever
 */
export class HybridRetriever {
  constructor(
    private vectorStore: VectorStore,
    private keywordSearch?: KeywordSearchEngine,
    private graphStore?: GraphStore
  ) {}

  /**
   * Retrieve chunks using hybrid search
   */
  async retrieve(
    query: RewrittenQuery,
    intent: RAGIntent
  ): Promise<RetrievalResult> {
    const startTime = Date.now();
    const config = getRetrievalConfig(intent);
    const namespace = getNamespace(intent);

    const metrics = {
      totalCandidates: 0,
      vectorResults: 0,
      keywordResults: 0,
      graphResults: 0,
      finalResults: 0,
      retrievalTimeMs: 0,
    };

    // 1. Vector search
    let vectorResults: VectorSearchResult[] = [];
    try {
      const embedding = await generateEmbedding(query.rewritten);
      if (embedding.length > 0) {
        vectorResults = await this.vectorStore.query(
          embedding,
          namespace,
          config.topK
        );
        metrics.vectorResults = vectorResults.length;
      }
    } catch (error) {
      console.error('[HybridRetriever] Vector search failed:', error);
    }

    // 2. Keyword search (if enabled)
    let keywordResults: KeywordSearchResult[] = [];
    if (config.useHybrid && this.keywordSearch) {
      try {
        keywordResults = await this.keywordSearch.search(
          query.original,
          namespace,
          config.topK
        );
        metrics.keywordResults = keywordResults.length;
      } catch (error) {
        console.error('[HybridRetriever] Keyword search failed:', error);
      }
    }

    // 3. Merge results using RRF
    const vectorRanked = vectorResults.map((r, idx) => ({
      id: r.id,
      score: r.score,
      rank: idx,
    }));

    const keywordRanked = keywordResults.map((r, idx) => ({
      id: r.id,
      score: r.score,
      rank: idx,
    }));

    const fusedScores = reciprocalRankFusion([vectorRanked, keywordRanked]);

    // 4. Build candidate chunks
    const candidateMap = new Map<string, RetrievedChunk>();

    // Add vector results
    for (const result of vectorResults) {
      candidateMap.set(result.id, {
        id: result.id,
        content: result.metadata.content,
        source: result.metadata.source,
        chunkIndex: result.metadata.chunkIndex,
        metadata: result.metadata,
        score: 0,  // Will be set by fusion
        vectorScore: result.score,
      });
    }

    // Add keyword results
    for (const result of keywordResults) {
      if (candidateMap.has(result.id)) {
        candidateMap.get(result.id)!.keywordScore = result.score;
      } else {
        candidateMap.set(result.id, {
          id: result.id,
          content: result.content,
          source: result.source,
          chunkIndex: result.chunkIndex,
          metadata: result.metadata,
          score: 0,
          keywordScore: result.score,
        });
      }
    }

    // 5. Apply fusion scores
    for (const [id, chunk] of candidateMap) {
      const fusedScore = fusedScores.get(id) || 0;

      // Weighted combination
      const vectorWeight = config.vectorWeight;
      const keywordWeight = config.keywordWeight;

      chunk.score =
        (chunk.vectorScore || 0) * vectorWeight +
        (chunk.keywordScore || 0) * keywordWeight +
        fusedScore * 0.1;  // RRF bonus
    }

    // 6. Filter by minimum similarity
    let candidates = Array.from(candidateMap.values())
      .filter(c => (c.vectorScore || 0) >= config.minSimilarity)
      .sort((a, b) => b.score - a.score)
      .slice(0, config.topK);

    metrics.totalCandidates = candidates.length;

    // 7. Graph expansion (if enabled)
    if (config.graphExpansion && config.graphDepth > 0 && this.graphStore) {
      try {
        const seedIds = candidates.map(c => c.id);
        const graphNodes = await this.graphStore.expandContext(seedIds, config.graphDepth);

        for (const node of graphNodes) {
          if (!candidateMap.has(node.id)) {
            // Add graph-expanded nodes with distance penalty
            const distancePenalty = Math.pow(0.8, node.distance);  // 0.8 per hop
            candidates.push({
              id: node.id,
              content: node.content,
              source: node.source,
              chunkIndex: node.chunkIndex,
              metadata: node.metadata,
              score: 0.5 * distancePenalty,  // Base score with penalty
              graphScore: 0.5 * distancePenalty,
            });
          }
        }

        metrics.graphResults = graphNodes.length;
      } catch (error) {
        console.error('[HybridRetriever] Graph expansion failed:', error);
      }
    }

    // 8. Re-sort and limit
    candidates = candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, config.topK);

    metrics.finalResults = candidates.length;
    metrics.retrievalTimeMs = Date.now() - startTime;

    return {
      chunks: candidates,
      query,
      config,
      metrics,
    };
  }

  /**
   * Retrieve using sub-queries (for complex questions)
   */
  async retrieveMulti(
    queries: RewrittenQuery[],
    intent: RAGIntent
  ): Promise<RetrievalResult[]> {
    return Promise.all(queries.map(q => this.retrieve(q, intent)));
  }
}

/**
 * In-memory vector store (for testing / small datasets)
 */
export class InMemoryVectorStore implements VectorStore {
  private documents: Map<string, { embedding: number[]; metadata: any }> = new Map();

  addDocument(id: string, embedding: number[], metadata: any) {
    this.documents.set(id, { embedding, metadata });
  }

  async query(embedding: number[], namespace: string, topK: number): Promise<VectorSearchResult[]> {
    const results: VectorSearchResult[] = [];

    for (const [id, doc] of this.documents) {
      const score = cosineSimilarity(embedding, doc.embedding);
      results.push({
        id,
        score,
        metadata: doc.metadata,
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async queryByIds(ids: string[], namespace: string): Promise<VectorSearchResult[]> {
    return ids
      .filter(id => this.documents.has(id))
      .map(id => {
        const doc = this.documents.get(id)!;
        return {
          id,
          score: 1.0,
          metadata: doc.metadata,
        };
      });
  }
}

/**
 * In-memory keyword search (for testing)
 */
export class InMemoryKeywordSearch implements KeywordSearchEngine {
  private documents: Map<string, { content: string; source: string; chunkIndex: number; metadata: any }> = new Map();

  addDocument(id: string, content: string, source: string, chunkIndex: number, metadata: any) {
    this.documents.set(id, { content, source, chunkIndex, metadata });
  }

  async search(query: string, namespace: string, topK: number): Promise<KeywordSearchResult[]> {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const results: KeywordSearchResult[] = [];

    for (const [id, doc] of this.documents) {
      const score = calculateBM25Score(queryTerms, doc.content);
      if (score > 0) {
        results.push({
          id,
          content: doc.content,
          source: doc.source,
          chunkIndex: doc.chunkIndex,
          score,
          metadata: doc.metadata,
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
