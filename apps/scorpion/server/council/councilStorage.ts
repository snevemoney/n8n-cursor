// apps/scorpion/server/council/councilStorage.ts
// Persistence layer for council results

import fs from 'fs/promises';
import path from 'path';
import { CouncilResult } from '../types/council';

const STORAGE_DIR = path.join(process.cwd(), 'data', 'council-results');
const STORAGE_FILE = path.join(STORAGE_DIR, 'results.json');

interface StoredCouncilResult extends CouncilResult {
  id: string;
  timestamp: string;
  conversationId?: string;
  missionId?: string;
  userId?: string;
}

async function ensureStorage() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

async function loadResults(): Promise<StoredCouncilResult[]> {
  await ensureStorage();
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

async function saveResults(results: StoredCouncilResult[]) {
  await ensureStorage();
  await fs.writeFile(STORAGE_FILE, JSON.stringify(results, null, 2), 'utf8');
}

/**
 * Store a council result
 */
export async function storeCouncilResult(
  result: CouncilResult,
  metadata?: {
    conversationId?: string;
    missionId?: string;
    userId?: string;
  },
): Promise<string> {
  const results = await loadResults();
  const id = `${Date.now()}-${results.length}`;
  
  const stored: StoredCouncilResult = {
    ...result,
    id,
    timestamp: new Date().toISOString(),
    conversationId: metadata?.conversationId,
    missionId: metadata?.missionId,
    userId: metadata?.userId,
  };

  results.push(stored);
  await saveResults(results);

  return id;
}

/**
 * Get all council results
 */
export async function getAllCouncilResults(
  opts?: {
    limit?: number;
    userId?: string;
    conversationId?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<StoredCouncilResult[]> {
  let results = await loadResults();

  // Filter by userId
  if (opts?.userId) {
    results = results.filter((r) => r.userId === opts.userId);
  }

  // Filter by conversationId
  if (opts?.conversationId) {
    results = results.filter((r) => r.conversationId === opts.conversationId);
  }

  // Filter by date range
  if (opts?.startDate) {
    results = results.filter((r) => r.timestamp >= opts.startDate!);
  }
  if (opts?.endDate) {
    results = results.filter((r) => r.timestamp <= opts.endDate!);
  }

  // Sort by timestamp (newest first)
  results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Apply limit
  if (opts?.limit) {
    results = results.slice(0, opts.limit);
  }

  return results;
}

/**
 * Get council result by ID
 */
export async function getCouncilResultById(id: string): Promise<StoredCouncilResult | null> {
  const results = await loadResults();
  return results.find((r) => r.id === id) || null;
}

/**
 * Get statistics about council results
 */
export async function getCouncilStatistics(opts?: { userId?: string }): Promise<{
  total: number;
  approved: number;
  rejected: number;
  issuesByTag: Record<string, number>;
  issuesBySeverity: Record<number, number>;
  councillorActivity: Record<string, number>;
}> {
  const results = await loadResults();
  let filtered = opts?.userId
    ? results.filter((r) => r.userId === opts.userId)
    : results;

  const stats = {
    total: filtered.length,
    approved: 0,
    rejected: 0,
    issuesByTag: {} as Record<string, number>,
    issuesBySeverity: {} as Record<number, number>,
    councillorActivity: {} as Record<string, number>,
  };

  for (const result of filtered) {
    if (result.approved) {
      stats.approved++;
    } else {
      stats.rejected++;
    }

    for (const issue of result.allIssues) {
      stats.issuesByTag[issue.tag] = (stats.issuesByTag[issue.tag] || 0) + 1;
      stats.issuesBySeverity[issue.severity] =
        (stats.issuesBySeverity[issue.severity] || 0) + 1;
    }

    for (const output of result.councillorOutputs) {
      stats.councillorActivity[output.councillorId] =
        (stats.councillorActivity[output.councillorId] || 0) + 1;
    }
  }

  return stats;
}

