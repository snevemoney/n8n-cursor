/**
 * Storage Detection System
 * Detects storage type (SSD vs HDD) and external drives
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface StorageInfo {
  path: string;
  type: 'ssd' | 'hdd' | 'unknown';
  readSpeed: number; // MB/s
  writeSpeed: number; // MB/s
  latency: number; // ms
  isExternal: boolean;
  freeSpace: number; // bytes
  totalSpace: number; // bytes
}

export interface DetectionResult {
  isSSD: boolean;
  storageInfo: StorageInfo | null;
  detectedSSDPath: string | null;
  allDrives: StorageInfo[];
}

const CACHE_DURATION = 30 * 1000; // 30 seconds - shorter cache for faster SSD detection
let cachedResult: DetectionResult | null = null;
let cacheTimestamp = 0;

/**
 * Check if a previously detected SSD path is still accessible
 * This allows immediate detection of disconnection without waiting for cache expiry
 */
export async function validateDetectedSSD(ssdPath: string | null): Promise<boolean> {
  if (!ssdPath) return false;
  
  try {
    await fs.access(ssdPath, fs.constants.R_OK | fs.constants.W_OK);
    // Try to write a small test file
    const testFile = path.join(ssdPath, '.scorpion-validate-test');
    try {
      await fs.writeFile(testFile, 'test', 'utf-8');
      await fs.unlink(testFile);
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Detect storage type by benchmarking I/O performance
 */
async function benchmarkStorage(storagePath: string): Promise<StorageInfo> {
  const testFile = path.join(storagePath, '.scorpion-speed-test');
  const testSize = 10 * 1024 * 1024; // 10MB
  const testData = Buffer.alloc(testSize, 0x42);

  try {
    // Ensure directory exists
    await fs.mkdir(storagePath, { recursive: true });

    // Write benchmark
    const writeStart = Date.now();
    await fs.writeFile(testFile, testData);
    const writeTime = Date.now() - writeStart;
    const writeSpeed = (testSize / 1024 / 1024) / (writeTime / 1000); // MB/s

    // Read benchmark
    const readStart = Date.now();
    await fs.readFile(testFile);
    const readTime = Date.now() - readStart;
    const readSpeed = (testSize / 1024 / 1024) / (readTime / 1000); // MB/s

    // Latency test (small file)
    const latencyStart = Date.now();
    await fs.writeFile(testFile + '.latency', Buffer.alloc(1024));
    await fs.readFile(testFile + '.latency');
    const latency = Date.now() - latencyStart;

    // Cleanup
    await fs.unlink(testFile).catch(() => {});
    await fs.unlink(testFile + '.latency').catch(() => {});

    // Determine storage type
    // More lenient detection: SSDs typically have high read speeds OR high write speeds
    // and low latency. USB SSDs may have slower write speeds but still benefit from SSD optimizations.
    const isSSD = (
      (readSpeed > 100 || writeSpeed > 50) && // High read OR decent write
      latency < 10 && // Low latency is key indicator
      (readSpeed > 50 || writeSpeed > 20) // Minimum performance threshold
    );

    // Get disk space info (simplified - Node.js doesn't have statfs)
    // Will be enhanced with actual disk space detection if needed
    let freeSpace = 0;
    let totalSpace = 0;
    try {
      // Try to get directory stats
      const dirStats = await fs.stat(storagePath);
      // For now, we'll estimate - could use a library like 'check-disk-space' later
      freeSpace = 0; // Will be populated by detection if needed
      totalSpace = 0;
    } catch {
      // Ignore errors
    }

    return {
      path: storagePath,
      type: isSSD ? 'ssd' : 'hdd',
      readSpeed,
      writeSpeed,
      latency,
      isExternal: false, // Will be set by caller
      freeSpace,
      totalSpace,
    };
  } catch (error) {
    // If benchmark fails, assume HDD
    return {
      path: storagePath,
      type: 'hdd',
      readSpeed: 0,
      writeSpeed: 0,
      latency: 0,
      isExternal: false,
      freeSpace: 0,
      totalSpace: 0,
    };
  }
}

/**
 * Get all mounted drives on the system
 */
async function getMountedDrives(): Promise<string[]> {
  const platform = os.platform();
  const drives: string[] = [];

  if (platform === 'darwin') {
    // macOS: Check /Volumes
    try {
      const volumes = await fs.readdir('/Volumes');
      for (const volume of volumes) {
        // Skip system volumes
        if (volume.startsWith('.') || volume === 'Macintosh HD') {
          continue;
        }
        const volumePath = path.join('/Volumes', volume);
        try {
          const stats = await fs.stat(volumePath);
          if (stats.isDirectory()) {
            drives.push(volumePath);
          }
        } catch {
          // Skip inaccessible volumes
        }
      }
    } catch {
      // /Volumes might not be accessible
    }
  } else if (platform === 'linux') {
    // Linux: Check /mnt and /media
    for (const basePath of ['/mnt', '/media']) {
      try {
        const entries = await fs.readdir(basePath);
        for (const entry of entries) {
          const entryPath = path.join(basePath, entry);
          try {
            const stats = await fs.stat(entryPath);
            if (stats.isDirectory()) {
              drives.push(entryPath);
            }
          } catch {
            // Skip inaccessible entries
          }
        }
      } catch {
        // Directory might not exist
      }
    }
  }

  return drives;
}

/**
 * Detect storage type for a given path
 */
export async function detectStorageType(storagePath: string): Promise<StorageInfo> {
  return await benchmarkStorage(storagePath);
}

/**
 * Detect all available storage options and find best SSD
 */
export async function detectStorage(): Promise<DetectionResult> {
  // Check cache, but validate SSD is still accessible
  const now = Date.now();
  if (cachedResult && (now - cacheTimestamp) < CACHE_DURATION) {
    // If we have a cached SSD result, validate it's still accessible
    if (cachedResult.isSSD && cachedResult.detectedSSDPath) {
      const isValid = await validateDetectedSSD(cachedResult.detectedSSDPath);
      if (!isValid) {
        // SSD was disconnected, clear cache and re-detect
        console.warn('⚠️ Cached SSD path no longer accessible, re-detecting...');
        cachedResult = null;
        cacheTimestamp = 0;
      } else {
        return cachedResult;
      }
    } else {
      return cachedResult;
    }
  }

  const allDrives: StorageInfo[] = [];
  let detectedSSDPath: string | null = null;
  let bestSSD: StorageInfo | null = null;

  // Check manual override first
  const manualPath = process.env.SCORPION_SSD_PATH;
  if (manualPath) {
    try {
      await fs.access(manualPath);
      const info = await benchmarkStorage(manualPath);
      info.isExternal = true;
      allDrives.push(info);
      if (info.type === 'ssd') {
        detectedSSDPath = manualPath;
        bestSSD = info;
      }
    } catch {
      // Manual path not accessible, continue with auto-detection
    }
  }

  // Check default data directory
  const defaultPath = path.join(process.cwd(), 'data', 'scorpion');
  try {
    await fs.mkdir(defaultPath, { recursive: true });
    const defaultInfo = await detectStorageType(defaultPath);
    defaultInfo.isExternal = false;
    allDrives.push(defaultInfo);
  } catch {
    // Default path not accessible
  }

  // Check external drives
  const externalDrives = await getMountedDrives();
  for (const drivePath of externalDrives) {
    try {
      // Test if writable
      await fs.access(drivePath, fs.constants.W_OK);
      const info = await benchmarkStorage(drivePath);
      info.isExternal = true;
      allDrives.push(info);

      // Prefer SSD over HDD, prefer external over internal
      if (info.type === 'ssd' && (!bestSSD || !bestSSD.isExternal)) {
        bestSSD = info;
        detectedSSDPath = drivePath;
      }
    } catch {
      // Drive not accessible or not writable
    }
  }

  // If no SSD found, use best available drive
  if (!detectedSSDPath && allDrives.length > 0) {
    const bestDrive = allDrives.reduce((best, current) => {
      if (!best) return current;
      if (current.type === 'ssd' && best.type !== 'ssd') return current;
      if (current.readSpeed > best.readSpeed) return current;
      return best;
    });
    detectedSSDPath = bestDrive.path;
  }

  const result: DetectionResult = {
    isSSD: bestSSD?.type === 'ssd' || false,
    storageInfo: bestSSD || allDrives[0] || null,
    detectedSSDPath,
    allDrives,
  };

  // Cache result
  cachedResult = result;
  cacheTimestamp = now;

  return result;
}

/**
 * Clear detection cache (useful after drive mount/unmount)
 */
export function clearDetectionCache(): void {
  cachedResult = null;
  cacheTimestamp = 0;
}

/**
 * Check if a path is on an SSD
 */
export async function isSSD(storagePath: string): Promise<boolean> {
  const info = await detectStorageType(storagePath);
  return info.type === 'ssd';
}

