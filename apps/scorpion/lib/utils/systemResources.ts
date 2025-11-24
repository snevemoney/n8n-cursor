import { totalmem } from 'os';

/**
 * Detect if system should use lightweight mode based on available RAM
 * Auto-enables lightweight mode for systems with <= 8GB RAM
 * Can be overridden with CHAT_LIGHTWEIGHT_MODE environment variable
 */
export function detectLightweightMode(): boolean {
  // Allow explicit override via environment variable
  if (process.env.CHAT_LIGHTWEIGHT_MODE !== undefined) {
    return process.env.CHAT_LIGHTWEIGHT_MODE === 'true';
  }
  
  // Auto-detect: Enable lightweight mode for systems with <= 12GB RAM (more aggressive)
  const totalRAMBytes = totalmem();
  const totalRAMGB = totalRAMBytes / (1024 * 1024 * 1024);
  const LIGHTWEIGHT_THRESHOLD = 12; // Increased threshold for better resource management
  
  // Enable lightweight mode if system has <= 12GB RAM (more systems benefit)
  const shouldUseLightweight = totalRAMGB <= LIGHTWEIGHT_THRESHOLD;
  
  if (shouldUseLightweight) {
    console.log(`[System] Auto-detected ${totalRAMGB.toFixed(1)}GB RAM, enabling lightweight mode`);
  }
  
  return shouldUseLightweight;
}

/**
 * Get lightweight mode configuration with aggressive optimizations for 8GB systems
 */
export function getLightweightConfig() {
  const isLightweight = detectLightweightMode();
  
  if (!isLightweight) {
    return {
      ragContextChunks: 5,
      batchSize: 5,
      concurrency: 3,
      cacheTTL: 30 * 60 * 1000, // 30 minutes
      enablePrefetch: true,
      fileWatcherDebounce: 2000,
    };
  }
  
  // Aggressive optimizations for lightweight systems
  return {
    ragContextChunks: 2, // Further reduced for lower memory usage
    batchSize: 1, // Sequential processing to reduce memory spikes
    concurrency: 1, // No parallel operations
    cacheTTL: 60 * 60 * 1000, // 60 minutes (increased cache to reduce model calls)
    enablePrefetch: false, // Disabled for memory savings
    fileWatcherDebounce: 10000, // Increased debounce to reduce CPU usage
  };
}

/**
 * Get system RAM information for debugging
 */
export function getSystemRAMInfo(): { totalGB: number; totalBytes: number } {
  const totalBytes = totalmem();
  const totalGB = totalBytes / (1024 * 1024 * 1024);
  return { totalGB, totalBytes };
}

