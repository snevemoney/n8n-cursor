/**
 * Research Session Storage
 * Persists research sessions to file storage for history tracking
 */

import fs from 'fs/promises';
import path from 'path';
import { getDataDir } from '../storage/storage-config';

export interface ResearchSession {
  sessionId: string;
  query: string;
  category: string;
  depth: string;
  maxSites: number;
  status: 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  result?: any;
  error?: string;
  errorStack?: string;
  sourcesCount?: number;
  browserActions?: any[];
}

let storagePath: string | null = null;

async function getStoragePath(): Promise<string> {
  if (storagePath) return storagePath;
  const dataDir = await getDataDir();
  storagePath = path.join(dataDir, 'research-sessions.json');
  return storagePath;
}

/**
 * Load all research sessions from storage
 */
export async function loadResearchSessions(): Promise<ResearchSession[]> {
  try {
    const filePath = await getStoragePath();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist yet, return empty array
    }
    console.error('[Research Storage] Failed to load sessions:', error);
    return [];
  }
}

/**
 * Save research sessions to storage
 */
export async function saveResearchSessions(sessions: ResearchSession[]): Promise<void> {
  try {
    const filePath = await getStoragePath();
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Keep only last 100 sessions to prevent file from growing too large
    const sortedSessions = sessions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 100);
    
    await fs.writeFile(filePath, JSON.stringify(sortedSessions, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Research Storage] Failed to save sessions:', error);
    throw error;
  }
}

/**
 * Save or update a research session
 */
export async function saveResearchSession(session: ResearchSession): Promise<void> {
  const sessions = await loadResearchSessions();
  const existingIndex = sessions.findIndex(s => s.sessionId === session.sessionId);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  await saveResearchSessions(sessions);
}

/**
 * Get a research session by ID
 */
export async function getResearchSession(sessionId: string): Promise<ResearchSession | null> {
  const sessions = await loadResearchSessions();
  return sessions.find(s => s.sessionId === sessionId) || null;
}

/**
 * Get research history (all sessions)
 */
export async function getResearchHistory(limit: number = 50): Promise<ResearchSession[]> {
  const sessions = await loadResearchSessions();
  return sessions
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

