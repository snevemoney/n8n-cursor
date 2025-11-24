/**
 * Knowledge Configuration
 * Source weights and re-ranking rules for RAG/knowledge system
 * 
 * Controls what Scorpion believes and prioritizes.
 */

export type KnowledgeSource = 
  | 'evens_notes'
  | 'scorpion_docs'
  | 'books_summaries'
  | 'web_generic'
  | 'code_repo'
  | 'architecture_docs'
  | 'bitcoin_corpus'
  | 'nursing_materials';

export interface KnowledgeSourceWeights {
  [key: string]: number;
}

/**
 * Source weights - higher = more trusted/prioritized
 */
export const knowledgeSourceWeights: Record<KnowledgeSource, number> = {
  evens_notes: 1.5,           // Personal notes, highest authority
  scorpion_docs: 1.3,         // Architecture, agents, repo docs
  architecture_docs: 1.3,     // System architecture documentation
  bitcoin_corpus: 1.2,        // Bitcoin/economics knowledge base
  books_summaries: 1.1,       // Curated PDFs, econ/AI books
  code_repo: 1.0,             // Codebase knowledge
  nursing_materials: 1.0,     // Nursing study materials
  web_generic: 0.8,           // Generic web results
};

/**
 * Get weight for a source
 */
export function getSourceWeight(source: string): number {
  return knowledgeSourceWeights[source as KnowledgeSource] ?? 1.0;
}

/**
 * Re-rank RAG hits using source weights
 */
export interface RAGHit {
  id: string;
  content: string;
  source: string;
  similarityScore: number;
  metadata?: Record<string, any>;
}

export interface ScoredHit extends RAGHit {
  finalScore: number;
}

/**
 * Score a hit using base similarity and source weight
 */
export function scoreHit(hit: RAGHit): number {
  const base = hit.similarityScore;
  const weight = getSourceWeight(hit.source);
  return base * weight;
}

/**
 * Re-rank hits by final score
 */
export function rankHits(hits: RAGHit[]): ScoredHit[] {
  return hits
    .map(h => ({ ...h, finalScore: scoreHit(h) }))
    .sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * Filter hits by minimum score threshold
 */
export function filterHits(hits: RAGHit[], minScore: number = 0.5): ScoredHit[] {
  const scored = rankHits(hits);
  return scored.filter(h => h.finalScore >= minScore);
}

/**
 * Get top N hits after re-ranking
 */
export function getTopHits(hits: RAGHit[], topN: number = 10): ScoredHit[] {
  const ranked = rankHits(hits);
  return ranked.slice(0, topN);
}

