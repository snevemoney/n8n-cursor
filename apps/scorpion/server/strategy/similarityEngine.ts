// apps/scorpion/server/strategy/similarityEngine.ts

import { ScorpionContextSnapshot } from '../types/strategy';

export interface SimilarMission {
  id: string;
  title: string;
  summary: string;
  /** e.g., 'ops-page', 'chat-orchestrator', 'research-agent' */
  domain?: string;
  /** Cosine similarity or any score 0–1 */
  similarityScore: number;
  /** Optional stored learnings or notes */
  lessonsLearned?: string[];
}

/**
 * Simple interface for a mission log storage.
 * Implement the backing store with Supabase, Postgres, file-based JSON, etc.
 */
export interface MissionLogStore {
  searchSimilarMissions(
    query: string,
    opts?: { limit?: number; domain?: string },
  ): Promise<SimilarMission[]>;

  logSuccessfulMission(payload: {
    missionId?: string;
    title: string;
    summary: string;
    domain?: string;
    lessonsLearned?: string[];
  }): Promise<void>;
}

/**
 * Helper to build a text query for similarity search.
 */
export function buildSimilarityQuery(
  snapshot: ScorpionContextSnapshot,
): string {
  const lastUserMessage = [...snapshot.messages]
    .reverse()
    .find((m) => m.role === 'user');

  const baseText = lastUserMessage?.content ?? '';
  const planText = snapshot.planSummary ?? '';

  const combined = `${baseText}\n\nPLAN:\n${planText}`.trim();
  return combined.slice(0, 2000); // avoid huge payloads
}

/**
 * High-level similarity retrieval: ask the store for similar missions.
 */
export async function findSimilarMissions(
  snapshot: ScorpionContextSnapshot,
  store: MissionLogStore,
  opts?: { limit?: number; domain?: string },
): Promise<SimilarMission[]> {
  const query = buildSimilarityQuery(snapshot);
  if (!query) return [];

  const results = await store.searchSimilarMissions(query, {
    limit: opts?.limit ?? 5,
    domain: opts?.domain,
  });

  // Sort by similarity descending as a safety net
  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Stub implementation for MissionLogStore (file-based JSON).
 * Replace with Supabase/Postgres implementation later.
 */
export class FileBasedMissionLogStore implements MissionLogStore {
  private filePath: string;

  constructor(filePath: string = './data/scorpion-missions.json') {
    this.filePath = filePath;
  }

  async searchSimilarMissions(
    query: string,
    opts?: { limit?: number; domain?: string },
  ): Promise<SimilarMission[]> {
    // TODO: Implement actual similarity search (vector embeddings, cosine similarity, etc.)
    // For now, return empty array - implement with your preferred vector DB or simple text matching
    return [];
  }

  async logSuccessfulMission(payload: {
    missionId?: string;
    title: string;
    summary: string;
    domain?: string;
    lessonsLearned?: string[];
  }): Promise<void> {
    // TODO: Implement file-based persistence
    // For now, this is a no-op - implement with fs.writeFile or your storage layer
  }
}

