/**
 * Performance Optimization Module
 * Configures performance settings based on storage type and system RAM
 */

import { isUsingSSD } from './storage-config';
import { detectLightweightMode } from '../utils/systemResources';

export interface PerformanceConfig {
  workflowSyncBatchSize: number;
  workflowSyncConcurrency: number;
  workflowSyncDelay: number; // ms between batches
  mediaProcessingConcurrency: number;
  mediaProcessingMaxFileSize: number; // bytes
  cacheTTLMultiplier: number; // Multiply base TTL by this
  enableAggressivePrefetch: boolean;
  fileWatcherDebounce: number; // ms
}

let cachedConfig: PerformanceConfig | null = null;

/**
 * Get performance configuration based on storage type and system RAM
 * Applies aggressive optimizations for 8GB systems
 */
export async function getPerformanceConfig(): Promise<PerformanceConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const usingSSD = await isUsingSSD();
  const isLightweight = detectLightweightMode();

  if (isLightweight) {
    // Lightweight Mode (8GB RAM): Ultra-conservative settings
    cachedConfig = {
      workflowSyncBatchSize: 2, // Reduced from 5
      workflowSyncConcurrency: 1, // Reduced from 3
      workflowSyncDelay: 1000, // Increased delay to reduce memory pressure
      mediaProcessingConcurrency: 1,
      mediaProcessingMaxFileSize: 50 * 1024 * 1024, // 50MB (reduced from 100MB)
      cacheTTLMultiplier: 0.5, // Reduced cache TTL to free memory faster
      enableAggressivePrefetch: false, // Disabled for memory savings
      fileWatcherDebounce: 5000, // Increased debounce to reduce CPU usage
    };
  } else if (usingSSD) {
    // SSD Mode: Aggressive optimizations
    cachedConfig = {
      workflowSyncBatchSize: 20, // Increased from 5
      workflowSyncConcurrency: 10, // Increased parallelism
      workflowSyncDelay: 100, // Reduced delay (was 500ms)
      mediaProcessingConcurrency: 3, // Process 3 jobs concurrently
      mediaProcessingMaxFileSize: 500 * 1024 * 1024, // 500MB (was 100MB)
      cacheTTLMultiplier: 2, // Double cache TTL
      enableAggressivePrefetch: true,
      fileWatcherDebounce: 500, // Reduced debounce (was 2000ms)
    };
  } else {
    // HDD Mode: Conservative settings (optimized for performance)
    cachedConfig = {
      workflowSyncBatchSize: 5,
      workflowSyncConcurrency: 3,
      workflowSyncDelay: 500,
      mediaProcessingConcurrency: 1,
      mediaProcessingMaxFileSize: 100 * 1024 * 1024, // 100MB
      cacheTTLMultiplier: 1,
      enableAggressivePrefetch: false,
      fileWatcherDebounce: 3000, // Increased from 2000ms for better performance
    };
  }

  return cachedConfig;
}

/**
 * Get optimized batch size for workflow sync
 */
export async function getOptimizedBatchSize(): Promise<number> {
  const config = await getPerformanceConfig();
  return config.workflowSyncBatchSize;
}

/**
 * Get optimized concurrency for parallel operations
 */
export async function getOptimizedConcurrency(): Promise<number> {
  const config = await getPerformanceConfig();
  return config.workflowSyncConcurrency;
}

/**
 * Get optimized delay between batches
 */
export async function getOptimizedBatchDelay(): Promise<number> {
  const config = await getPerformanceConfig();
  return config.workflowSyncDelay;
}

/**
 * Get media processing concurrency
 */
export async function getMediaProcessingConcurrency(): Promise<number> {
  const config = await getPerformanceConfig();
  return config.mediaProcessingConcurrency;
}

/**
 * Get maximum file size for local media processing
 */
export async function getMediaProcessingMaxFileSize(): Promise<number> {
  const config = await getPerformanceConfig();
  return config.mediaProcessingMaxFileSize;
}

/**
 * Get cache TTL multiplier
 */
export async function getCacheTTLMultiplier(): Promise<number> {
  const config = await getPerformanceConfig();
  return config.cacheTTLMultiplier;
}

/**
 * Check if aggressive prefetching is enabled
 */
export async function isAggressivePrefetchEnabled(): Promise<boolean> {
  const config = await getPerformanceConfig();
  return config.enableAggressivePrefetch;
}

/**
 * Get file watcher debounce delay
 */
export async function getFileWatcherDebounce(): Promise<number> {
  const config = await getPerformanceConfig();
  return config.fileWatcherDebounce;
}

/**
 * Reset cached config (useful after storage changes)
 */
export function resetPerformanceConfig(): void {
  cachedConfig = null;
}

/**
 * Get list of active optimizations
 */
export async function getActiveOptimizations(): Promise<string[]> {
  const config = await getPerformanceConfig();
  const optimizations: string[] = [];

  if (config.workflowSyncBatchSize > 5) {
    optimizations.push('batch-sync');
  }
  if (config.workflowSyncConcurrency > 3) {
    optimizations.push('parallel-processing');
  }
  if (config.mediaProcessingConcurrency > 1) {
    optimizations.push('parallel-media');
  }
  if (config.cacheTTLMultiplier > 1) {
    optimizations.push('extended-cache');
  }
  if (config.enableAggressivePrefetch) {
    optimizations.push('aggressive-prefetch');
  }
  if (config.fileWatcherDebounce < 2000) {
    optimizations.push('fast-file-watching');
  }

  return optimizations;
}

