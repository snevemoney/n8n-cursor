/**
 * File Cache System
 * LRU cache for frequently accessed files with smart invalidation
 */

import fs from 'fs/promises';
import path from 'path';

export interface FileContent {
  path: string;
  content: string;
  language: string;
  lastModified: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheEntry {
  file: FileContent;
  accessTime: number;
}

export class FileCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get file content from cache or read from disk
   */
  async get(filePath: string): Promise<FileContent | null> {
    const normalizedPath = path.normalize(filePath);
    
    // Check cache first
    const cached = this.cache.get(normalizedPath);
    if (cached) {
      // Check if file has been modified
      try {
        const stats = await fs.stat(normalizedPath);
        if (stats.mtimeMs === cached.file.lastModified) {
          // Update access tracking
          cached.file.accessCount++;
          cached.file.lastAccessed = Date.now();
          cached.accessTime = Date.now();
          this.hits++;
          return cached.file;
        } else {
          // File changed, invalidate cache entry
          this.cache.delete(normalizedPath);
        }
      } catch (error) {
        // File doesn't exist or can't be accessed
        this.cache.delete(normalizedPath);
        this.misses++;
        return null;
      }
    }

    // Cache miss - read from disk
    this.misses++;
    try {
      const content = await fs.readFile(normalizedPath, 'utf-8');
      const stats = await fs.stat(normalizedPath);
      const ext = path.extname(normalizedPath).slice(1) || 'text';
      
      const fileContent: FileContent = {
        path: normalizedPath,
        content,
        language: ext,
        lastModified: stats.mtimeMs,
        accessCount: 1,
        lastAccessed: Date.now()
      };

      // Add to cache (evict if needed)
      this.set(normalizedPath, fileContent);
      
      return fileContent;
    } catch (error) {
      // File read failed
      return null;
    }
  }

  /**
   * Cache file content
   */
  set(filePath: string, fileContent: FileContent): void {
    const normalizedPath = path.normalize(filePath);
    
    // Evict least recently used if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(normalizedPath)) {
      this.evictLRU();
    }

    this.cache.set(normalizedPath, {
      file: fileContent,
      accessTime: Date.now()
    });
  }

  /**
   * Invalidate a specific file from cache
   */
  invalidate(filePath: string): void {
    const normalizedPath = path.normalize(filePath);
    this.cache.delete(normalizedPath);
  }

  /**
   * Invalidate multiple files
   */
  invalidateMultiple(filePaths: string[]): void {
    filePaths.forEach(path => this.invalidate(path));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessTime < oldestTime) {
        oldestTime = entry.accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Singleton instance
let fileCacheInstance: FileCache | null = null;

/**
 * Get the global file cache instance
 */
export function getFileCache(maxSize?: number): FileCache {
  if (!fileCacheInstance) {
    fileCacheInstance = new FileCache(maxSize);
  }
  return fileCacheInstance;
}

