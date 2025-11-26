/**
 * Performance Monitor
 * Tracks and compares performance metrics between SSD and HDD modes
 */

import { getStorageConfig } from './storage-config';
import { detectStorage } from './storage-detector';

export interface PerformanceMetrics {
  readSpeed: number; // MB/s
  writeSpeed: number; // MB/s
  latency: number; // ms
  timestamp: number;
}

export interface PerformanceComparison {
  current: PerformanceMetrics;
  hddBaseline: PerformanceMetrics;
  improvement: {
    readSpeed: number; // multiplier
    writeSpeed: number;
    latency: number; // reduction factor
  };
  estimatedSpeedup: {
    modelLoading: string;
    workflowSync: string;
    mediaProcessing: string;
    backupRestore: string;
  };
}

const HDD_BASELINE: PerformanceMetrics = {
  readSpeed: 100, // MB/s
  writeSpeed: 80, // MB/s
  latency: 10, // ms
  timestamp: Date.now(),
};

/**
 * Get current performance metrics
 */
export async function getCurrentPerformanceMetrics(): Promise<PerformanceMetrics> {
  const detection = await detectStorage();
  
  if (detection.storageInfo) {
    return {
      readSpeed: detection.storageInfo.readSpeed,
      writeSpeed: detection.storageInfo.writeSpeed,
      latency: detection.storageInfo.latency,
      timestamp: Date.now(),
    };
  }

  return HDD_BASELINE;
}

/**
 * Get performance comparison (SSD vs HDD)
 */
export async function getPerformanceComparison(): Promise<PerformanceComparison> {
  const current = await getCurrentPerformanceMetrics();
  const config = await getStorageConfig();
  
  const improvement = {
    readSpeed: current.readSpeed / HDD_BASELINE.readSpeed,
    writeSpeed: current.writeSpeed / HDD_BASELINE.writeSpeed,
    latency: HDD_BASELINE.latency / current.latency,
  };

  // Estimate speedups for different operations
  const estimatedSpeedup = {
    modelLoading: config.isSSD 
      ? `${(improvement.readSpeed * 5).toFixed(1)}x faster` // Models benefit more from read speed
      : '1x (baseline)',
    workflowSync: config.isSSD
      ? `${(improvement.writeSpeed * 4).toFixed(1)}x faster` // Batch operations benefit from write speed
      : '1x (baseline)',
    mediaProcessing: config.isSSD
      ? `${(improvement.readSpeed * 3).toFixed(1)}x faster` // Media benefits from read/write
      : '1x (baseline)',
    backupRestore: config.isSSD
      ? `${(improvement.writeSpeed * 10).toFixed(1)}x faster` // Backups are very I/O intensive
      : '1x (baseline)',
  };

  return {
    current,
    hddBaseline: HDD_BASELINE,
    improvement,
    estimatedSpeedup,
  };
}

/**
 * Benchmark a specific operation
 */
export async function benchmarkOperation(
  operation: () => Promise<void>
): Promise<{ duration: number; throughput: number }> {
  const start = Date.now();
  await operation();
  const duration = Date.now() - start;
  
  // Rough throughput estimate (would need actual data size for accurate calculation)
  const throughput = 1000 / duration; // operations per second
  
  return { duration, throughput };
}

