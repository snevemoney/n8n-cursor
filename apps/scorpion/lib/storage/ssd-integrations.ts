/**
 * SSD Integration Manager
 * Automatically integrates external services with detected SSD for maximum performance
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { getStorageConfig } from './storage-config';
import { detectOllamaStorage } from './ollama-detector';

export interface SSDIntegration {
  name: string;
  description: string;
  currentPath: string;
  ssdPath: string | null;
  isOnSSD: boolean;
  canMigrate: boolean;
  migrationStatus: 'not_migrated' | 'migrated' | 'symlinked' | 'error';
  size?: number; // bytes
  recommendation?: string;
}

export interface SSDIntegrationsStatus {
  ssdDetected: boolean;
  ssdPath: string | null;
  integrations: SSDIntegration[];
  totalSpaceSaved: number; // bytes
}

/**
 * Detect Ollama integration status
 */
async function detectOllamaIntegration(ssdPath: string | null): Promise<SSDIntegration> {
  const ollamaInfo = await detectOllamaStorage();
  const ssdOllamaPath = ssdPath ? path.join(ssdPath, 'ollama-models') : null;

  return {
    name: 'Ollama Models',
    description: 'LLM model storage for faster model loading',
    currentPath: ollamaInfo.modelsPath,
    ssdPath: ssdOllamaPath,
    isOnSSD: ollamaInfo.isOnSSD,
    canMigrate: !ollamaInfo.isOnSSD && ssdPath !== null && ollamaInfo.models.length > 0,
    migrationStatus: ollamaInfo.isOnSSD ? 'migrated' : 'not_migrated',
    size: ollamaInfo.totalSize,
    recommendation: ollamaInfo.recommendation,
  };
}

/**
 * Detect n8n data directory
 */
async function detectN8nIntegration(ssdPath: string | null): Promise<SSDIntegration> {
  const platform = os.platform();
  let n8nDataPath: string;
  let size = 0;

  // Check common n8n data locations
  if (platform === 'darwin' || platform === 'linux') {
    n8nDataPath = path.join(os.homedir(), '.n8n');
  } else if (platform === 'win32') {
    n8nDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'n8n');
  } else {
    n8nDataPath = path.join(os.homedir(), '.n8n');
  }

  // Check if n8n data exists
  let exists = false;
  let isOnSSD = false;
  try {
    await fs.access(n8nDataPath);
    exists = true;
    
    // Check if on SSD
    const { isSSD } = await import('./storage-detector');
    isOnSSD = await isSSD(n8nDataPath);
    
    // Calculate size
    try {
      const stats = await fs.stat(n8nDataPath);
      if (stats.isDirectory()) {
        // Rough estimate - would need recursive calculation for exact size
        size = stats.size || 0;
      }
    } catch {
      // Can't calculate size
    }
  } catch {
    // n8n data doesn't exist
  }

  const ssdN8nPath = ssdPath ? path.join(ssdPath, 'n8n-data') : null;

  return {
    name: 'n8n Data',
    description: 'Workflow storage and execution data',
    currentPath: n8nDataPath,
    ssdPath: ssdN8nPath,
    isOnSSD,
    canMigrate: exists && !isOnSSD && ssdPath !== null,
    migrationStatus: isOnSSD ? 'migrated' : exists ? 'not_migrated' : 'not_migrated',
    size,
    recommendation: exists && !isOnSSD 
      ? `Consider moving n8n data to SSD for faster workflow operations. Current: ${n8nDataPath}`
      : exists && isOnSSD
      ? 'n8n data is on SSD - optimal performance!'
      : 'n8n data directory not found',
  };
}

/**
 * Detect backup location integration
 */
async function detectBackupIntegration(ssdPath: string | null): Promise<SSDIntegration> {
  const defaultBackupPath = path.join(process.cwd(), 'backups', 'scorpion');
  const ssdBackupPath = ssdPath ? path.join(ssdPath, 'scorpion-backups') : null;

  let isOnSSD = false;
  let size = 0;
  let exists = false;

  try {
    await fs.access(defaultBackupPath);
    exists = true;
    
    const { isSSD } = await import('./storage-detector');
    isOnSSD = await isSSD(defaultBackupPath);
    
    // Calculate backup size
    try {
      const files = await fs.readdir(defaultBackupPath);
      for (const file of files) {
        try {
          const filePath = path.join(defaultBackupPath, file);
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            size += stats.size;
          }
        } catch {
          // Skip
        }
      }
    } catch {
      // Can't calculate
    }
  } catch {
    // Backup directory doesn't exist
  }

  return {
    name: 'Backups',
    description: 'System backup storage location',
    currentPath: defaultBackupPath,
    ssdPath: ssdBackupPath,
    isOnSSD,
    canMigrate: !isOnSSD && ssdPath !== null,
    migrationStatus: isOnSSD ? 'migrated' : 'not_migrated',
    size,
    recommendation: !isOnSSD && ssdPath !== null
      ? 'Move backups to SSD for faster backup/restore operations'
      : isOnSSD
      ? 'Backups are on SSD - optimal performance!'
      : 'No backups found',
  };
}

/**
 * Detect cache directory integration
 */
async function detectCacheIntegration(ssdPath: string | null): Promise<SSDIntegration> {
  const defaultCachePath = path.join(os.tmpdir(), 'scorpion-cache');
  const ssdCachePath = ssdPath ? path.join(ssdPath, 'scorpion-cache') : null;

  let isOnSSD = false;
  let size = 0;
  let exists = false;

  try {
    await fs.access(defaultCachePath);
    exists = true;
    
    const { isSSD } = await import('./storage-detector');
    isOnSSD = await isSSD(defaultCachePath);
    
    // Calculate cache size
    try {
      const files = await fs.readdir(defaultCachePath);
      for (const file of files) {
        try {
          const filePath = path.join(defaultCachePath, file);
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            size += stats.size;
          }
        } catch {
          // Skip
        }
      }
    } catch {
      // Can't calculate
    }
  } catch {
    // Cache directory doesn't exist
  }

  return {
    name: 'Cache',
    description: 'Extended cache storage for better performance',
    currentPath: defaultCachePath,
    ssdPath: ssdCachePath,
    isOnSSD,
    canMigrate: !isOnSSD && ssdPath !== null,
    migrationStatus: isOnSSD ? 'migrated' : 'not_migrated',
    size,
    recommendation: !isOnSSD && ssdPath !== null
      ? 'Move cache to SSD for faster cache operations'
      : isOnSSD
      ? 'Cache is on SSD - optimal performance!'
      : 'Cache directory not initialized',
  };
}

/**
 * Get all SSD integrations status
 */
export async function getSSDIntegrationsStatus(): Promise<SSDIntegrationsStatus> {
  const config = await getStorageConfig();
  const ssdPath = config.isSSD ? config.storageInfo.detectedSSDPath : null;

  const integrations: SSDIntegration[] = await Promise.all([
    detectOllamaIntegration(ssdPath),
    detectN8nIntegration(ssdPath),
    detectBackupIntegration(ssdPath),
    detectCacheIntegration(ssdPath),
  ]);

  const totalSpaceSaved = integrations
    .filter(i => i.isOnSSD && i.size)
    .reduce((sum, i) => sum + (i.size || 0), 0);

  return {
    ssdDetected: config.isSSD,
    ssdPath,
    integrations,
    totalSpaceSaved,
  };
}

/**
 * Migrate Ollama models to SSD (creates symlink)
 */
export async function migrateOllamaToSSD(): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getStorageConfig();
    if (!config.isSSD || !config.storageInfo.detectedSSDPath) {
      return { success: false, message: 'No SSD detected' };
    }

    const ollamaInfo = await detectOllamaStorage();
    if (ollamaInfo.isOnSSD) {
      return { success: true, message: 'Ollama models already on SSD' };
    }

    if (ollamaInfo.models.length === 0) {
      return { success: false, message: 'No Ollama models found to migrate' };
    }

    const ssdModelsPath = path.join(config.storageInfo.detectedSSDPath, 'ollama-models');
    
    // Create SSD directory
    await fs.mkdir(ssdModelsPath, { recursive: true });

    // Move models to SSD
    let migrated = 0;
    for (const model of ollamaInfo.models) {
      try {
        const destPath = path.join(ssdModelsPath, model.name);
        await fs.copyFile(model.path, destPath);
        migrated++;
      } catch (error: any) {
        console.warn(`Failed to migrate model ${model.name}:`, error.message);
      }
    }

    // Update OLLAMA_MODELS environment variable recommendation
    return {
      success: true,
      message: `Migrated ${migrated} models. Set OLLAMA_MODELS=${ssdModelsPath} to use SSD location`,
    };
  } catch (error: any) {
    return { success: false, message: `Migration failed: ${error.message}` };
  }
}

/**
 * Get optimal backup directory (SSD if available)
 */
export async function getOptimalBackupDir(): Promise<string> {
  const config = await getStorageConfig();
  
  if (config.isSSD && config.storageInfo.detectedSSDPath) {
    const ssdBackupPath = path.join(config.storageInfo.detectedSSDPath, 'scorpion-backups');
    try {
      await fs.mkdir(ssdBackupPath, { recursive: true });
      await fs.access(ssdBackupPath, fs.constants.W_OK);
      return ssdBackupPath;
    } catch {
      // Fallback to default
    }
  }

  // Default backup location
  const defaultBackupPath = path.join(process.cwd(), 'backups', 'scorpion');
  await fs.mkdir(defaultBackupPath, { recursive: true });
  return defaultBackupPath;
}

/**
 * Get optimal cache directory (SSD if available)
 */
export async function getOptimalCacheDir(): Promise<string> {
  const config = await getStorageConfig();
  
  if (config.isSSD && config.storageInfo.detectedSSDPath) {
    const ssdCachePath = path.join(config.storageInfo.detectedSSDPath, 'scorpion-cache');
    try {
      await fs.mkdir(ssdCachePath, { recursive: true });
      await fs.access(ssdCachePath, fs.constants.W_OK);
      return ssdCachePath;
    } catch {
      // Fallback to system temp
    }
  }

  // Default cache location
  return path.join(os.tmpdir(), 'scorpion-cache');
}

