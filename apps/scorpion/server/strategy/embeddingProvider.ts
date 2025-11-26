// apps/scorpion/server/strategy/embeddingProvider.ts

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  similarity(a: number[], b: number[]): number;
}

/**
 * Simple cosine similarity
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Placeholder: you can later replace `embed` with a real call to OpenAI/Supabase/etc.
 */
export class DummyEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    // Extremely naive char-based embedding
    const vec = new Array(64).fill(0);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      vec[i % 64] += code / 255;
    }
    return vec;
  }

  similarity(a: number[], b: number[]): number {
    return cosineSimilarity(a, b);
  }
}

