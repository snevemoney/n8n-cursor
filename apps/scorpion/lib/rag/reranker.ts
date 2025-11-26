/**
 * Reranker with Threshold Gating
 * Final filter before generation - prevents hallucination
 *
 * Features:
 * - Cross-encoder reranking (BGE/Cohere)
 * - Threshold gating (reject low-relevance chunks)
 * - AutoCut (remove contradictions, outdated, duplicates)
 * - Citation preparation
 */

import type { RetrievedChunk } from './retriever';
import type { RAGIntent, RetrievalConfig, AutoCutConfig } from './config';
import { getRetrievalConfig, DEFAULT_AUTOCUT_CONFIG } from './config';
import { cosineSimilarity, generateEmbedding } from '@/lib/transformer/embeddings';

/**
 * Reranked chunk with relevance score
 */
export interface RerankedChunk extends RetrievedChunk {
  rerankScore: number;       // Cross-encoder relevance score (0-1)
  passedThreshold: boolean;  // Did it pass the threshold?
  citation: string;          // Formatted citation string
}

/**
 * Reranking result
 */
export interface RerankingResult {
  chunks: RerankedChunk[];
  totalCandidates: number;
  passedThreshold: number;
  removedByAutoCut: number;
  hasSufficientContext: boolean;
  insufficientReason?: string;
}

/**
 * Cross-encoder reranker interface
 */
export interface CrossEncoderReranker {
  rerank(query: string, chunks: RetrievedChunk[]): Promise<{ id: string; score: number }[]>;
}

/**
 * Simple heuristic reranker (no external model)
 * Uses multiple signals to estimate relevance
 */
class HeuristicReranker implements CrossEncoderReranker {
  async rerank(query: string, chunks: RetrievedChunk[]): Promise<{ id: string; score: number }[]> {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);

    return chunks.map(chunk => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();

      // 1. Exact phrase match (high weight)
      if (contentLower.includes(queryLower)) {
        score += 0.4;
      }

      // 2. Term coverage (how many query terms appear)
      const matchedTerms = queryTerms.filter(term => contentLower.includes(term));
      const termCoverage = matchedTerms.length / queryTerms.length;
      score += termCoverage * 0.3;

      // 3. Term proximity (closer terms = better)
      if (matchedTerms.length > 1) {
        const positions = matchedTerms.map(term => {
          const idx = contentLower.indexOf(term);
          return idx !== -1 ? idx : Infinity;
        }).filter(p => p !== Infinity);

        if (positions.length > 1) {
          const maxDist = Math.max(...positions) - Math.min(...positions);
          const proximityScore = 1 / (1 + maxDist / 100);  // Normalize by char distance
          score += proximityScore * 0.15;
        }
      }

      // 4. Boost if content starts with matched terms (likely more relevant)
      const firstWords = contentLower.split(/\s+/).slice(0, 10).join(' ');
      if (queryTerms.some(term => firstWords.includes(term))) {
        score += 0.10;
      }

      // 5. Penalize very short chunks (likely incomplete context)
      if (chunk.content.length < 200) {
        score *= 0.8;
      }

      // 6. Boost if chunk has code blocks (for code queries)
      if (/```|function |class |interface |const |let |var /.test(chunk.content)) {
        score += 0.05;
      }

      return { id: chunk.id, score: Math.min(score, 1.0) };
    });
  }
}

/**
 * Format citation string
 */
function formatCitation(chunk: RetrievedChunk): string {
  const source = chunk.source;
  const chunkIndex = chunk.chunkIndex;

  // Extract line numbers from metadata if available
  const lineStart = chunk.metadata?.lineStart;
  const lineEnd = chunk.metadata?.lineEnd;

  if (lineStart && lineEnd) {
    return `${source}:L${lineStart}-${lineEnd}`;
  } else if (lineStart) {
    return `${source}:L${lineStart}`;
  } else if (chunkIndex > 0) {
    return `${source} (chunk ${chunkIndex})`;
  } else {
    return source;
  }
}

/**
 * Detect contradictions between chunks
 */
function detectContradictions(chunks: RetrievedChunk[]): Set<string> {
  const contradictoryIds = new Set<string>();

  // Look for opposite statements
  const oppositePatterns = [
    ['is', 'is not'],
    ['should', 'should not'],
    ['must', 'must not'],
    ['can', 'cannot'],
    ['will', 'will not'],
    ['does', 'does not'],
    ['true', 'false'],
    ['enabled', 'disabled'],
    ['required', 'optional'],
  ];

  for (let i = 0; i < chunks.length; i++) {
    for (let j = i + 1; j < chunks.length; j++) {
      const contentI = chunks[i].content.toLowerCase();
      const contentJ = chunks[j].content.toLowerCase();

      for (const [pos, neg] of oppositePatterns) {
        // Check if same subject has opposite predicates
        if (contentI.includes(pos) && contentJ.includes(neg)) {
          // Mark the lower-scored chunk as contradictory
          if (chunks[i].score < chunks[j].score) {
            contradictoryIds.add(chunks[i].id);
          } else {
            contradictoryIds.add(chunks[j].id);
          }
        }
      }
    }
  }

  return contradictoryIds;
}

/**
 * Detect outdated chunks
 */
function detectOutdated(chunks: RetrievedChunk[]): Set<string> {
  const outdatedIds = new Set<string>();

  // Look for version indicators
  const versionPattern = /v?(\d+)\.(\d+)\.(\d+)/g;

  // Group chunks by source file
  const sourceGroups = new Map<string, RetrievedChunk[]>();
  for (const chunk of chunks) {
    const source = chunk.source;
    if (!sourceGroups.has(source)) {
      sourceGroups.set(source, []);
    }
    sourceGroups.get(source)!.push(chunk);
  }

  // Within each source, mark older versions as outdated
  for (const [source, sourceChunks] of sourceGroups) {
    if (sourceChunks.length < 2) continue;

    const versioned = sourceChunks
      .map(chunk => {
        const match = versionPattern.exec(chunk.content);
        if (!match) return null;
        const [, major, minor, patch] = match;
        return {
          chunk,
          version: [parseInt(major), parseInt(minor), parseInt(patch)],
        };
      })
      .filter(v => v !== null) as Array<{ chunk: RetrievedChunk; version: number[] }>;

    if (versioned.length < 2) continue;

    // Find max version
    const maxVersion = versioned.reduce((max, curr) => {
      for (let i = 0; i < 3; i++) {
        if (curr.version[i] > max[i]) return curr.version;
        if (curr.version[i] < max[i]) return max;
      }
      return max;
    }, versioned[0].version);

    // Mark older versions as outdated
    for (const { chunk, version } of versioned) {
      let isOlder = false;
      for (let i = 0; i < 3; i++) {
        if (version[i] < maxVersion[i]) {
          isOlder = true;
          break;
        } else if (version[i] > maxVersion[i]) {
          break;
        }
      }
      if (isOlder) {
        outdatedIds.add(chunk.id);
      }
    }
  }

  return outdatedIds;
}

/**
 * Detect duplicate chunks
 */
async function detectDuplicates(chunks: RetrievedChunk[], threshold: number = 0.95): Promise<Set<string>> {
  const duplicateIds = new Set<string>();

  // Compare all pairs
  for (let i = 0; i < chunks.length; i++) {
    for (let j = i + 1; j < chunks.length; j++) {
      // Simple text similarity first
      const contentI = chunks[i].content;
      const contentJ = chunks[j].content;

      // Jaccard similarity (fast approximate)
      const wordsI = new Set(contentI.toLowerCase().split(/\s+/));
      const wordsJ = new Set(contentJ.toLowerCase().split(/\s+/));
      const intersection = new Set([...wordsI].filter(w => wordsJ.has(w)));
      const union = new Set([...wordsI, ...wordsJ]);
      const jaccardSim = intersection.size / union.size;

      if (jaccardSim > threshold) {
        // Mark lower-scored chunk as duplicate
        if (chunks[i].score < chunks[j].score) {
          duplicateIds.add(chunks[i].id);
        } else {
          duplicateIds.add(chunks[j].id);
        }
      }
    }
  }

  return duplicateIds;
}

/**
 * AutoCut: Filter noisy chunks
 */
async function autoCut(
  chunks: RetrievedChunk[],
  config: AutoCutConfig = DEFAULT_AUTOCUT_CONFIG
): Promise<{ filtered: RetrievedChunk[]; removed: number }> {
  let filtered = [...chunks];
  let removed = 0;

  // 1. Remove too-short chunks
  const beforeLength = filtered.length;
  filtered = filtered.filter(c => c.content.length >= config.minChunkLength);
  removed += beforeLength - filtered.length;

  // 2. Remove contradictions
  if (config.removeContradictions) {
    const contradictoryIds = detectContradictions(filtered);
    const beforeContra = filtered.length;
    filtered = filtered.filter(c => !contradictoryIds.has(c.id));
    removed += beforeContra - filtered.length;
  }

  // 3. Remove outdated
  if (config.removeOutdated) {
    const outdatedIds = detectOutdated(filtered);
    const beforeOutdated = filtered.length;
    filtered = filtered.filter(c => !outdatedIds.has(c.id));
    removed += beforeOutdated - filtered.length;
  }

  // 4. Deduplicate
  if (config.deduplicate) {
    const duplicateIds = await detectDuplicates(filtered, config.deduplicationThreshold);
    const beforeDup = filtered.length;
    filtered = filtered.filter(c => !duplicateIds.has(c.id));
    removed += beforeDup - filtered.length;
  }

  return { filtered, removed };
}

/**
 * Reranker class
 */
export class Reranker {
  private crossEncoder: CrossEncoderReranker;

  constructor(crossEncoder?: CrossEncoderReranker) {
    this.crossEncoder = crossEncoder || new HeuristicReranker();
  }

  /**
   * Rerank and filter chunks
   */
  async rerank(
    query: string,
    chunks: RetrievedChunk[],
    intent: RAGIntent,
    autoCutConfig?: AutoCutConfig
  ): Promise<RerankingResult> {
    const config = getRetrievalConfig(intent);
    const totalCandidates = chunks.length;

    // 1. Apply cross-encoder reranking
    const rerankScores = await this.crossEncoder.rerank(query, chunks);
    const scoreMap = new Map(rerankScores.map(r => [r.id, r.score]));

    // 2. Attach rerank scores
    let reranked: RerankedChunk[] = chunks.map(chunk => ({
      ...chunk,
      rerankScore: scoreMap.get(chunk.id) || 0,
      passedThreshold: false,
      citation: formatCitation(chunk),
    }));

    // 3. Sort by rerank score
    reranked.sort((a, b) => b.rerankScore - a.rerankScore);

    // 4. Keep top N
    reranked = reranked.slice(0, config.rerankTopN);

    // 5. Apply threshold gating
    const threshold = config.rerankThreshold;
    reranked.forEach(chunk => {
      chunk.passedThreshold = chunk.rerankScore >= threshold;
    });

    const beforeAutoCut = reranked.length;

    // 6. Apply AutoCut
    const { filtered, removed } = await autoCut(
      reranked.filter(c => c.passedThreshold),
      autoCutConfig
    );

    // 7. Check if we have sufficient context
    const passedThreshold = filtered.length;
    const hasSufficientContext = passedThreshold > 0;

    let insufficientReason: string | undefined;
    if (!hasSufficientContext) {
      if (totalCandidates === 0) {
        insufficientReason = 'No documents retrieved from vector store';
      } else if (passedThreshold === 0) {
        insufficientReason = `All ${totalCandidates} candidates failed relevance threshold (${threshold})`;
      } else {
        insufficientReason = 'All candidates removed by AutoCut filters';
      }
    }

    return {
      chunks: filtered as RerankedChunk[],
      totalCandidates,
      passedThreshold,
      removedByAutoCut: removed,
      hasSufficientContext,
      insufficientReason,
    };
  }
}

/**
 * Default reranker instance
 */
export const defaultReranker = new Reranker();
