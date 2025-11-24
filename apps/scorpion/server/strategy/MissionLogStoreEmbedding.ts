// apps/scorpion/server/strategy/MissionLogStoreEmbedding.ts

import { MissionLogStore, SimilarMission } from './similarityEngine';
import fs from 'fs/promises';
import path from 'path';
import { EmbeddingProvider, DummyEmbeddingProvider } from './embeddingProvider';

const DB_PATH = path.join(process.cwd(), 'data', 'mission-log-embed.json');

interface MissionRecord {
  id: string;
  title: string;
  summary: string;
  domain?: string;
  lessonsLearned?: string[];
  embedding: number[];
}

const embedder: EmbeddingProvider = new DummyEmbeddingProvider();

async function ensureDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify([]), 'utf8');
  }
}

async function loadRecords(): Promise<MissionRecord[]> {
  await ensureDB();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw || '[]');
}

async function saveRecords(records: MissionRecord[]) {
  await fs.writeFile(DB_PATH, JSON.stringify(records, null, 2), 'utf8');
}

export const MissionLogStoreEmbedding: MissionLogStore = {
  async searchSimilarMissions(query, opts) {
    const records = await loadRecords();
    if (!records.length) return [];

    const qEmbedding = await embedder.embed(query);

    const scored: SimilarMission[] = records
      .filter((r) => (opts?.domain ? r.domain === opts.domain : true))
      .map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        domain: r.domain,
        lessonsLearned: r.lessonsLearned || [],
        similarityScore: embedder.similarity(qEmbedding, r.embedding),
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, opts?.limit ?? 5);

    return scored;
  },

  async logSuccessfulMission(payload) {
    const records = await loadRecords();
    const text = `${payload.title}\n\n${payload.summary}`;
    const embedding = await embedder.embed(text);

    const rec: MissionRecord = {
      id: payload.missionId || `${Date.now()}-${records.length}`,
      title: payload.title,
      summary: payload.summary,
      domain: payload.domain,
      lessonsLearned: payload.lessonsLearned,
      embedding,
    };

    records.push(rec);
    await saveRecords(records);
  },
};

