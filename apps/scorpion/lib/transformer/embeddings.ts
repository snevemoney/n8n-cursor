/**
 * Embedding Service for Transformer Architecture
 * 
 * Generates vector embeddings for ResourceIndex entries.
 * Uses OpenAI embeddings API with fallback to Ollama.
 */

import { getOpenAIService, isOpenAIAvailable } from '@scorpion/core/llm';

/**
 * Generate embedding for text
 * 
 * Uses OpenAI if available, otherwise falls back to Ollama
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Try OpenAI first
  if (isOpenAIAvailable()) {
    try {
      const openai = getOpenAIService();
      const embedding = await openai.embedText(text.substring(0, 8192), 'text-embedding-3-small');
      if (embedding && embedding.length > 0) {
        return embedding;
      }
    } catch (error) {
      console.warn('[Embeddings] OpenAI failed, falling back to Ollama:', error);
    }
  }

  // Fallback to Ollama
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text.substring(0, 8192),
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding || [];
  } catch (error) {
    console.warn('[Embeddings] Ollama failed:', error);
    // Return empty embedding - will use keyword search fallback
    return [];
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (isOpenAIAvailable()) {
    try {
      const openai = getOpenAIService();
      return await openai.embedTexts(texts.map(t => t.substring(0, 8192)), 'text-embedding-3-small');
    } catch (error) {
      console.warn('[Embeddings] OpenAI batch failed, falling back to sequential:', error);
    }
  }

  // Fallback: generate sequentially
  return Promise.all(texts.map(text => generateEmbedding(text)));
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

