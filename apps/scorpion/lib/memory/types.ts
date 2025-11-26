/**
 * Long-term Memory Types
 * Stores personality, preferences, and learned behaviors
 */

export interface LongTermMemory {
  id: string;
  scope: 'global' | 'finance' | 'nursing' | 'ai' | 'bitcoin' | 'architecture' | string;
  content: string;
  weight: number; // 1-5, higher = more important
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}

export interface MemoryQuery {
  scope?: string;
  tags?: string[];
  minWeight?: number;
  limit?: number;
}

