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
 * Get system RAM information for debugging
 */
export function getSystemRAMInfo(): { totalGB: number; totalBytes: number } {
  const totalBytes = totalmem();
  const totalGB = totalBytes / (1024 * 1024 * 1024);
  return { totalGB, totalBytes };
}

