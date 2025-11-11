/**
 * Dynamic Storage Path Configuration
 * Safely manages storage paths with backup and migration support
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { detectStorage, type DetectionResult } from './storage-detector';
import { ensureDirWithFallback, isStorageAccessible } from './storage-error-handler';

export interface StorageConfig {
  dataDir: string;
  mediaTempDir: string;
  backupDir?: string;
  cacheDir?: string;
  isSSD: boolean;
  storageInfo: DetectionResult;
}

let config: StorageConfig | null = null;

/**
 * Get the optimal data directory path
 */
async function getOptimalDataDir(): Promise<string> {
  const detection = await detectStorage();

  // Use detected SSD path if available
  if (detection.detectedSSDPath) {
    const ssdDataDir = path.join(detection.detectedSSDPath, 'scorpion-data');
    
    // Check if storage is accessible before using it
    if (await isStorageAccessible(ssdDataDir)) {
      const dirResult = await ensureDirWithFallback(ssdDataDir);
      if (dirResult.success) {
        return dirResult.path;
      }
    }
    
    console.warn(`⚠️ Cannot use SSD path ${ssdDataDir}, falling back to default`);
  }

  // Fallback to default location
  const defaultDir = path.join(process.cwd(), 'data', 'scorpion');
  const dirResult = await ensureDirWithFallback(defaultDir);
  return dirResult.path;
}

/**
 * Get the optimal temp directory for media processing
 */
async function getOptimalTempDir(): Promise<string> {
  const detection = await detectStorage();

  // Use SSD temp directory if SSD is available
  if (detection.detectedSSDPath && detection.isSSD) {
    const ssdTempDir = path.join(detection.detectedSSDPath, 'scorpion-temp');
    if (await isStorageAccessible(ssdTempDir)) {
      const dirResult = await ensureDirWithFallback(ssdTempDir);
      if (dirResult.success) {
        return dirResult.path;
      }
    }
  }

  // Use system temp directory
  const systemTempDir = path.join(os.tmpdir(), 'scorpion-media');
  const dirResult = await ensureDirWithFallback(systemTempDir);
  return dirResult.path;
}

/**
 * Safely backup existing data before migration
 */
async function backupData(sourceDir: string, backupDir: string): Promise<void> {
  try {
    // Check if source directory exists and has files
    const files = await fs.readdir(sourceDir).catch(() => []);
    if (files.length === 0) {
      return; // Nothing to backup
    }

    // Create backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `scorpion-backup-${timestamp}`);
    await fs.mkdir(backupPath, { recursive: true });

    // Copy all files
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(backupPath, file);

      try {
        const stats = await fs.stat(sourcePath);
        if (stats.isDirectory()) {
          // Recursively copy directories
          await copyDirectory(sourcePath, destPath);
        } else {
          // Copy files
          await fs.copyFile(sourcePath, destPath);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to backup ${file}:`, error);
      }
    }

    console.log(`✅ Backup created: ${backupPath}`);
  } catch (error) {
    console.error(`❌ Backup failed:`, error);
    throw error;
  }
}

/**
 * Recursively copy directory
 */
async function copyDirectory(source: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destPath);
    } else {
      await fs.copyFile(sourcePath, destPath);
    }
  }
}

/**
 * Safely migrate data from source to destination
 * Never overwrites existing files in destination
 */
async function migrateDataSafely(
  sourceDir: string,
  destDir: string
): Promise<{ migrated: number; skipped: number; errors: number }> {
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Ensure destination exists
    await fs.mkdir(destDir, { recursive: true });

    // Get source files
    const sourceFiles = await fs.readdir(sourceDir, { withFileTypes: true }).catch(() => []);
    
    for (const entry of sourceFiles) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      try {
        // Check if destination file already exists
        const destExists = await fs.access(destPath).then(() => true).catch(() => false);
        
        if (destExists) {
          console.log(`⏭️ Skipping ${entry.name} (already exists in destination)`);
          skipped++;
          continue;
        }

        if (entry.isDirectory()) {
          // Recursively copy directories
          await copyDirectory(sourcePath, destPath);
        } else {
          // Copy files
          await fs.copyFile(sourcePath, destPath);
        }

        migrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate ${entry.name}:`, error);
        errors++;
      }
    }
  } catch (error) {
    console.error(`❌ Migration failed:`, error);
    throw error;
  }

  return { migrated, skipped, errors };
}

/**
 * Initialize storage configuration
 */
export async function initializeStorageConfig(): Promise<StorageConfig> {
  if (config) {
    return config;
  }

  const detection = await detectStorage();
  const dataDir = await getOptimalDataDir();
  const mediaTempDir = await getOptimalTempDir();
  
  // Get optimal backup and cache directories (SSD if available)
  // Use inline logic to avoid circular dependency
  let backupDir: string;
  let cacheDir: string;
  
  if (detection.isSSD && detection.detectedSSDPath) {
    const ssdBackupPath = path.join(detection.detectedSSDPath, 'scorpion-backups');
    const ssdCachePath = path.join(detection.detectedSSDPath, 'scorpion-cache');
    
    // Try SSD backup path with fallback
    if (await isStorageAccessible(ssdBackupPath)) {
      const backupResult = await ensureDirWithFallback(ssdBackupPath);
      if (backupResult.success) {
        backupDir = backupResult.path;
      } else {
        backupDir = path.join(process.cwd(), 'backups', 'scorpion');
      }
    } else {
      backupDir = path.join(process.cwd(), 'backups', 'scorpion');
    }
    
    // Try SSD cache path with fallback
    if (await isStorageAccessible(ssdCachePath)) {
      const cacheResult = await ensureDirWithFallback(ssdCachePath);
      if (cacheResult.success) {
        cacheDir = cacheResult.path;
      } else {
        cacheDir = path.join(os.tmpdir(), 'scorpion-cache');
      }
    } else {
      cacheDir = path.join(os.tmpdir(), 'scorpion-cache');
    }
  } else {
    backupDir = path.join(process.cwd(), 'backups', 'scorpion');
    cacheDir = path.join(os.tmpdir(), 'scorpion-cache');
  }
  
  // Ensure directories exist with fallback support
  const backupResult = await ensureDirWithFallback(backupDir);
  backupDir = backupResult.path;
  
  const cacheResult = await ensureDirWithFallback(cacheDir);
  cacheDir = cacheResult.path;

  // Check if we need to migrate from default location to SSD
  const defaultDir = path.join(process.cwd(), 'data', 'scorpion');
  const isMigratingToSSD = detection.isSSD && dataDir !== defaultDir;

  if (isMigratingToSSD) {
    try {
      // Check if default directory has data
      const defaultFiles = await fs.readdir(defaultDir).catch(() => []);
      
      if (defaultFiles.length > 0) {
        console.log(`🔄 Migrating data from ${defaultDir} to ${dataDir}...`);
        
        // Create backup first
        await backupData(defaultDir, backupDir);
        
        // Migrate data safely (won't overwrite existing files)
        const result = await migrateDataSafely(defaultDir, dataDir);
        console.log(`✅ Migration complete: ${result.migrated} files migrated, ${result.skipped} skipped, ${result.errors} errors`);
      }
    } catch (error) {
      console.error(`⚠️ Migration failed, using default location:`, error);
      // Continue with default location if migration fails
    }
  }

  config = {
    dataDir,
    mediaTempDir,
    backupDir,
    cacheDir,
    isSSD: detection.isSSD,
    storageInfo: detection,
  };

  // Run auto-migrations in background when SSD is detected
  if (detection.isSSD && detection.detectedSSDPath) {
    // Run migrations asynchronously (don't block initialization)
    runAutoMigrations().then((report) => {
      if (report && report.totalMigrated > 0) {
        console.log(`🚀 Auto-migrated ${report.totalMigrated} items to SSD`);
        report.migrations.forEach((m) => {
          if (m.success && m.migrated > 0) {
            console.log(`  ✅ ${m.service}: ${m.migrated} items migrated`);
            if (m.performanceGain) {
              console.log(`     ⚡ ${m.performanceGain}`);
            }
          }
        });
        console.log(`⚡ SUPER POWERS ACTIVATED! ${report.performanceImprovements.length} performance improvements enabled`);
      }
    }).catch((error) => {
      console.warn('Auto-migration failed:', error);
    });
  }

  return config;
}

/**
 * Run auto-migrations (imported function to avoid circular dependency)
 */
async function runAutoMigrations() {
  try {
    const { runAutoMigrations } = await import('./ssd-auto-migrator');
    return await runAutoMigrations();
  } catch (error) {
    // Auto-migration is optional, don't fail initialization
    console.debug('Auto-migration not available:', error);
    return null;
  }
}

/**
 * Get current storage configuration (cached)
 */
export async function getStorageConfig(): Promise<StorageConfig> {
  if (!config) {
    return await initializeStorageConfig();
  }
  return config;
}

/**
 * Get data directory path
 */
export async function getDataDir(): Promise<string> {
  const config = await getStorageConfig();
  return config.dataDir;
}

/**
 * Get media temp directory path
 */
export async function getMediaTempDir(): Promise<string> {
  const config = await getStorageConfig();
  return config.mediaTempDir;
}

/**
 * Check if currently using SSD
 */
export async function isUsingSSD(): Promise<boolean> {
  const config = await getStorageConfig();
  return config.isSSD;
}

/**
 * Reset configuration (useful for testing or after drive changes)
 */
export function resetStorageConfig(): void {
  config = null;
}

