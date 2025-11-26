// Power of 10 Rule 4: Extract response cache to focused module
// Simple in-memory cache for chat responses
//
// NOTE: This module re-exports functions from config/promptConfig.ts
// Kept for backward compatibility during refactoring.

export {
  getCachedResponse,
  setCachedResponse,
  clearResponseCache,
  getCacheStats,
} from '../config/promptConfig';

