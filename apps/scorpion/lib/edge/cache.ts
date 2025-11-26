/**
 * Edge Cache
 * Implements edge caching for improved performance
 */

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number; // milliseconds
  createdAt: number;
  region: string;
}

export class EdgeCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 10000;

  /**
   * Get cached value
   */
  get(key: string, region?: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.createdAt > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Check region match if specified
    if (region && entry.region !== region) {
      return null;
    }

    return entry.value;
  }

  /**
   * Set cached value
   */
  set(key: string, value: any, ttl: number = 3600000, region?: string): void {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      key,
      value,
      ttl,
      createdAt: Date.now(),
      region: region || 'global',
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete cached value
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Singleton instance
let edgeCacheInstance: EdgeCache | null = null;

export function getEdgeCache(): EdgeCache {
  if (!edgeCacheInstance) {
    edgeCacheInstance = new EdgeCache();
  }
  return edgeCacheInstance;
}

