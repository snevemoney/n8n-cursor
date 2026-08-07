/**
 * Storage Status API
 * Returns storage type, paths, and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageConfig, resetStorageConfig } from '@/lib/storage/storage-config';
import { detectStorage, clearDetectionCache } from '@/lib/storage/storage-detector';
import { getActiveOptimizations, getPerformanceConfig, resetPerformanceConfig } from '@/lib/storage/performance-optimizer';
import { getSSDIntegrationsStatus } from '@/lib/storage/ssd-integrations';
import { getPerformanceComparison } from '@/lib/storage/performance-monitor';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get current storage configuration
    const config = await getStorageConfig();
    const detection = await detectStorage();
    const optimizations = await getActiveOptimizations();
    const perfConfig = await getPerformanceConfig();
    const integrations = await getSSDIntegrationsStatus();
    const performanceComparison = await getPerformanceComparison();

    // Format performance metrics
    const performance = detection.storageInfo
      ? {
          readSpeed: `${detection.storageInfo.readSpeed.toFixed(2)} MB/s`,
          writeSpeed: `${detection.storageInfo.writeSpeed.toFixed(2)} MB/s`,
          latency: `${detection.storageInfo.latency.toFixed(2)} ms`,
        }
      : null;

    // Format storage space info
    const storageSpace = detection.storageInfo
      ? {
          freeSpaceGB: (detection.storageInfo.freeSpace / 1024 / 1024 / 1024).toFixed(2),
          totalSpaceGB: (detection.storageInfo.totalSpace / 1024 / 1024 / 1024).toFixed(2),
          freeSpaceBytes: detection.storageInfo.freeSpace,
          totalSpaceBytes: detection.storageInfo.totalSpace,
        }
      : null;

    return NextResponse.json({
      success: true,
      storageType: config.isSSD ? 'ssd' : 'hdd',
      dataPath: config.dataDir,
      mediaTempPath: config.mediaTempDir,
      isSSD: config.isSSD,
      optimizationsActive: optimizations,
      performance,
      storageSpace,
      detectedSSDPath: detection.detectedSSDPath,
      allDrives: detection.allDrives.map((drive) => ({
        path: drive.path,
        type: drive.type,
        isExternal: drive.isExternal,
        readSpeed: `${drive.readSpeed.toFixed(2)} MB/s`,
        writeSpeed: `${drive.writeSpeed.toFixed(2)} MB/s`,
      })),
      performanceConfig: {
        workflowSyncBatchSize: perfConfig.workflowSyncBatchSize,
        workflowSyncConcurrency: perfConfig.workflowSyncConcurrency,
        mediaProcessingConcurrency: perfConfig.mediaProcessingConcurrency,
        mediaProcessingMaxFileSizeMB: perfConfig.mediaProcessingMaxFileSize / 1024 / 1024,
        cacheTTLMultiplier: perfConfig.cacheTTLMultiplier,
      },
      integrations: {
        ssdDetected: integrations.ssdDetected,
        ssdPath: integrations.ssdPath,
        integrations: integrations.integrations.map(i => ({
          name: i.name,
          description: i.description,
          currentPath: i.currentPath,
          ssdPath: i.ssdPath,
          isOnSSD: i.isOnSSD,
          canMigrate: i.canMigrate,
          migrationStatus: i.migrationStatus,
          size: i.size,
          sizeGB: i.size ? (i.size / 1024 / 1024 / 1024).toFixed(2) : null,
          recommendation: i.recommendation,
        })),
        totalSpaceSavedGB: (integrations.totalSpaceSaved / 1024 / 1024 / 1024).toFixed(2),
      },
      performanceComparison: {
        improvement: {
          readSpeed: `${performanceComparison.improvement.readSpeed.toFixed(2)}x`,
          writeSpeed: `${performanceComparison.improvement.writeSpeed.toFixed(2)}x`,
          latency: `${performanceComparison.improvement.latency.toFixed(2)}x`,
        },
        estimatedSpeedup: performanceComparison.estimatedSpeedup,
      },
    });
  } catch (error: any) {
    console.error('Error getting storage status:', error);
    // TODO: Investigate storage detection performance issues
    // Storage detection can fail during heavy I/O operations or when drives are being accessed
    // Consider adding retry logic or caching for frequently accessed storage info
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get storage status',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to refresh storage detection
 * Clears caches and re-detects storage (useful when SSD is connected/disconnected)
 */
export async function POST(request: NextRequest) {
  try {
    // Clear all caches FIRST
    clearDetectionCache();
    resetStorageConfig();
    resetPerformanceConfig();
    
    // Force fresh detection (bypasses cache)
    const detection = await detectStorage();
    
    // Force fresh config initialization (bypasses cache)
    const { initializeStorageConfig } = await import('@/lib/storage/storage-config');
    const config = await initializeStorageConfig();
    
    const optimizations = await getActiveOptimizations();
    
    console.log(`🔄 Storage detection refreshed: ${config.isSSD ? 'SSD' : 'HDD'} mode - ${config.dataDir}`);
    
    return NextResponse.json({
      success: true,
      message: 'Storage detection refreshed',
      storageType: config.isSSD ? 'ssd' : 'hdd',
      isSSD: config.isSSD,
      detectedSSDPath: detection.detectedSSDPath,
      dataPath: config.dataDir,
      performance: detection.storageInfo ? {
        readSpeed: `${detection.storageInfo.readSpeed.toFixed(2)} MB/s`,
        writeSpeed: `${detection.storageInfo.writeSpeed.toFixed(2)} MB/s`,
        latency: `${detection.storageInfo.latency.toFixed(2)} ms`,
      } : null,
    });
  } catch (error: any) {
    console.error('Error refreshing storage detection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to refresh storage detection',
      },
      { status: 500 }
    );
  }
}

