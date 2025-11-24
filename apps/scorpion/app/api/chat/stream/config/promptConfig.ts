/**
 * Prompt Configuration
 *
 * Utilities for resolving prompt file paths and managing response caching.
 *
 * IMPORTANT: These functions handle file path resolution across different
 * working directory contexts. Do not modify without testing in multiple
 * deployment scenarios.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { CACHE_CONFIG } from './pipelineConfig';

// ============================================================================
// PROMPT PATH RESOLUTION
// ============================================================================

/**
 * Resolve prompt file path correctly regardless of current working directory
 *
 * This handles cases where:
 * - cwd is apps/scorpion
 * - cwd is project root
 * - cwd has nested apps/scorpion paths
 *
 * @param filename - Name of the prompt file (e.g., 'planner.system.txt')
 * @returns Absolute path to the prompt file
 */
export function getPromptPath(filename: string): string {
  const cwd = process.cwd();

  // If we're already in apps/scorpion, use relative path
  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }

  // Try project root path
  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }

  // Fallback: remove duplicate apps/scorpion if present
  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);

  return fallbackPath;
}

// ============================================================================
// RESPONSE CACHING
// ============================================================================

/**
 * Enhanced response cache for lightweight resource usage
 * Longer TTL and larger cache to reduce model calls
 */
const responseCache = new Map<string, { response: string; timestamp: number }>();

/**
 * Generate cache key from message
 * Uses first 150 chars (normalized) for better cache hits
 */
function getCacheKey(message: string): string {
  return message.toLowerCase().trim().substring(0, CACHE_CONFIG.KEY_LENGTH);
}

/**
 * Get cached response if available and not expired
 *
 * @param message - User message to look up
 * @returns Cached response or null if not found/expired
 */
export function getCachedResponse(message: string): string | null {
  const key = getCacheKey(message);
  const cached = responseCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.TTL) {
    console.log('[Cache] Hit for query');
    return cached.response;
  }

  return null;
}

/**
 * Store response in cache with automatic cleanup
 *
 * @param message - User message as cache key
 * @param response - Response to cache
 */
export function setCachedResponse(message: string, response: string): void {
  const key = getCacheKey(message);
  responseCache.set(key, { response, timestamp: Date.now() });

  // Clean old cache entries (keep cache under MAX_SIZE)
  if (responseCache.size > CACHE_CONFIG.MAX_SIZE) {
    const oldest = Array.from(responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries based on CLEANUP_PERCENTAGE
    const toRemove = Math.floor(responseCache.size * CACHE_CONFIG.CLEANUP_PERCENTAGE);

    for (let i = 0; i < toRemove; i++) {
      const entry = oldest[i];
      if (entry) {
        responseCache.delete(entry[0]);
      }
    }
  }
}

/**
 * Clear all cached responses (for testing or manual cache invalidation)
 */
export function clearResponseCache(): void {
  responseCache.clear();
  console.log('[Cache] Cleared all cached responses');
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    size: responseCache.size,
    maxSize: CACHE_CONFIG.MAX_SIZE,
    ttl: CACHE_CONFIG.TTL,
    utilizationPercent: Math.round((responseCache.size / CACHE_CONFIG.MAX_SIZE) * 100),
  };
}
