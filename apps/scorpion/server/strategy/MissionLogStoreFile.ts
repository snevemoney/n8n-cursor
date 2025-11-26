// apps/scorpion/server/strategy/MissionLogStoreFile.ts

import { MissionLogStore, SimilarMission } from './similarityEngine';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'mission-log.json');

interface MissionRecord {
  id: string;
  title: string;
  summary: string;
  domain?: string;
  lessonsLearned?: string[];
  embedding?: number[];
}

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

export const MissionLogStoreFile: MissionLogStore = {
  async searchSimilarMissions(query: string, opts?: { limit?: number; domain?: string }) {
    const records = await loadRecords();
    const limit = opts?.limit ?? 5;

    // Naive text similarity — replace with embeddings later
    function textSim(a: string, b: string) {
      const wordsA = new Set(a.toLowerCase().split(/\W+/));
      const wordsB = new Set(b.toLowerCase().split(/\W+/));
      const intersect = [...wordsA].filter((w) => wordsB.has(w));
      return intersect.length / Math.sqrt(wordsA.size * wordsB.size);
    }

    const scored: SimilarMission[] = records
      .filter((r) => (opts?.domain ? r.domain === opts.domain : true))
      .map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        similarityScore: textSim(query, r.summary),
        domain: r.domain,
        lessonsLearned: r.lessonsLearned || [],
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    return scored;
  },

  async logSuccessfulMission(payload) {
    const records = await loadRecords();
    const rec: MissionRecord = {
      id: crypto.randomUUID(),
      title: payload.title,
      summary: payload.summary,
      domain: payload.domain,
      lessonsLearned: payload.lessonsLearned,
    };
    records.push(rec);
    await saveRecords(records);
  },
};

