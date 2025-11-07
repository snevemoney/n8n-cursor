/**
 * Simple in-memory cache with TTL
 * Provides fast response caching for expensive API operations
 */

interface CacheEntry {
  data: any;
  expires: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();

  /**
   * Set a value in cache with TTL
   */
  set(key: string, data: any, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
  }

  /**
   * Get a value from cache (returns null if expired or not found)
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Invalidate a specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate multiple cache keys (useful after mutations)
   */
  invalidateMultiple(keys: string[]): void {
    keys.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const responseCache = new ResponseCache();

/**
 * Helper to wrap async functions with caching
 */
export function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): () => Promise<T> {
  return async () => {
    const cached = responseCache.get(key);
    if (cached !== null) {
      return cached as T;
    }
    
    const result = await fn();
    responseCache.set(key, result, ttlMs);
    return result;
  };
}

/**
 * Cache invalidation groups (related caches that should be cleared together)
 */
export const CacheGroups = {
  WORKFLOWS: ['workflows-list', 'project-status'],
  KNOWLEDGE: ['project-status', 'health-check'],
  ALL: ['workflows-list', 'project-status', 'health-check']
};

