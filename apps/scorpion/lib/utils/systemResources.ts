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
  
  // Auto-detect: Enable lightweight mode for systems with <= 8GB RAM
  const totalRAMBytes = totalmem();
  const totalRAMGB = totalRAMBytes / (1024 * 1024 * 1024);
  const EIGHT_GB = 8;
  
  // Enable lightweight mode if system has 8GB or less RAM
  const shouldUseLightweight = totalRAMGB <= EIGHT_GB;
  
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
  
  // Aggressive optimizations for 8GB systems
  return {
    ragContextChunks: 3, // Reduced from 5
    batchSize: 2, // Reduced from 5
    concurrency: 1, // Reduced from 3
    cacheTTL: 10 * 60 * 1000, // 10 minutes (reduced from 30)
    enablePrefetch: false, // Disabled for memory savings
    fileWatcherDebounce: 5000, // Increased debounce to reduce CPU
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

