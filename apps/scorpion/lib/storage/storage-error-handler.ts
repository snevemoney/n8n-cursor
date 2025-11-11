/**
 * Storage Error Handler
 * Provides robust error handling for storage operations with retry and fallback
 */

import fs from 'fs/promises';
import path from 'path';
import { getStorageConfig, resetStorageConfig, type StorageConfig } from './storage-config';
import { detectStorage, clearDetectionCache } from './storage-detector';

export interface StorageError extends Error {
  code?: string;
  isStorageError?: boolean;
  originalPath?: string;
  fallbackPath?: string;
}

export interface WriteOperationResult {
  success: boolean;
  path: string;
  error?: string;
  usedFallback?: boolean;
}

/**
 * Check if an error is a storage-related error (disconnection, permission, etc.)
 */
export function isStorageError(error: any): boolean {
  if (!error) return false;
  
  // Common storage error codes
  const storageErrorCodes = [
    'ENOENT',      // No such file or directory
    'EACCES',      // Permission denied
    'ENOTDIR',     // Not a directory
    'EISDIR',      // Is a directory
    'EMFILE',      // Too many open files
    'ENOSPC',      // No space left on device
    'EROFS',       // Read-only file system
    'EBUSY',       // Device or resource busy
    'ENXIO',       // No such device or address
    'EIO',         // Input/output error
  ];
  
  return (
    error.code && storageErrorCodes.includes(error.code) ||
    error.isStorageError === true ||
    (error.message && (
      error.message.includes('ENOENT') ||
      error.message.includes('EACCES') ||
      error.message.includes('disconnected') ||
      error.message.includes('not found') ||
      error.message.includes('permission denied')
    ))
  );
}

/**
 * Check if storage path is currently accessible
 */
export async function isStorageAccessible(storagePath: string): Promise<boolean> {
  try {
    // Try to access the directory
    await fs.access(storagePath, fs.constants.R_OK | fs.constants.W_OK);
    
    // Try to write a test file
    const testFile = path.join(storagePath, '.scorpion-access-test');
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
 * Get fallback storage path when primary storage fails
 */
async function getFallbackStoragePath(primaryPath: string): Promise<string> {
  // Get current config
  const config = await getStorageConfig();
  
  // If primary path is on SSD and SSD is disconnected, use default
  if (config.isSSD && primaryPath.startsWith(config.storageInfo.detectedSSDPath || '')) {
    const defaultDir = path.join(process.cwd(), 'data', 'scorpion');
    await fs.mkdir(defaultDir, { recursive: true });
    return defaultDir;
  }
  
  // Otherwise, try to get a valid storage path
  try {
    const detection = await detectStorage();
    if (detection.detectedSSDPath) {
      const fallbackPath = path.join(detection.detectedSSDPath, 'scorpion-data');
      if (await isStorageAccessible(fallbackPath)) {
        return fallbackPath;
      }
    }
  } catch {
    // Fall through to default
  }
  
  // Ultimate fallback: default directory
  const defaultDir = path.join(process.cwd(), 'data', 'scorpion');
  await fs.mkdir(defaultDir, { recursive: true });
  return defaultDir;
}

/**
 * Write file with retry and fallback storage
 */
export async function writeFileWithFallback(
  filePath: string,
  content: string | Buffer,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    ensureDir?: boolean;
  } = {}
): Promise<WriteOperationResult> {
  const {
    maxRetries = 3,
    retryDelay = 100,
    ensureDir = true
  } = options;
  
  let lastError: any = null;
  let usedFallback = false;
  let currentPath = filePath;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Ensure directory exists
      if (ensureDir) {
        const dir = path.dirname(currentPath);
        await fs.mkdir(dir, { recursive: true });
      }
      
      // Check if storage is accessible before writing
      const dir = path.dirname(currentPath);
      if (!(await isStorageAccessible(dir))) {
        throw new Error(`Storage not accessible: ${dir}`);
      }
      
      // Write file
      await fs.writeFile(currentPath, content, typeof content === 'string' ? 'utf-8' : undefined);
      
      return {
        success: true,
        path: currentPath,
        usedFallback
      };
    } catch (error: any) {
      lastError = error;
      
      // If it's a storage error and we haven't tried fallback yet
      if (isStorageError(error) && !usedFallback && attempt < maxRetries - 1) {
        // Clear detection cache to force re-detection
        clearDetectionCache();
        resetStorageConfig();
        
        // Get fallback path
        const fallbackDir = await getFallbackStoragePath(path.dirname(currentPath));
        const fileName = path.basename(currentPath);
        currentPath = path.join(fallbackDir, fileName);
        usedFallback = true;
        
        console.warn(`⚠️ Storage error on attempt ${attempt + 1}, switching to fallback: ${currentPath}`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
      
      // If not a storage error or we've exhausted retries, break
      if (!isStorageError(error) || attempt === maxRetries - 1) {
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  // All retries failed
  const storageError: StorageError = lastError || new Error('Write operation failed');
  storageError.isStorageError = true;
  storageError.originalPath = filePath;
  storageError.fallbackPath = currentPath;
  
  return {
    success: false,
    path: currentPath,
    error: storageError.message || 'Unknown error',
    usedFallback
  };
}

/**
 * Read file with fallback storage
 */
export async function readFileWithFallback(
  filePath: string,
  options: {
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<{ success: boolean; content?: string; error?: string; path?: string }> {
  const {
    maxRetries = 2,
    retryDelay = 100
  } = options;
  
  let lastError: any = null;
  let currentPath = filePath;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const content = await fs.readFile(currentPath, 'utf-8');
      return {
        success: true,
        content,
        path: currentPath
      };
    } catch (error: any) {
      lastError = error;
      
      // If file doesn't exist, try fallback location
      if (error.code === 'ENOENT' && attempt < maxRetries - 1) {
        const fallbackDir = await getFallbackStoragePath(path.dirname(currentPath));
        const fileName = path.basename(currentPath);
        currentPath = path.join(fallbackDir, fileName);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      break;
    }
  }
  
  return {
    success: false,
    error: lastError?.message || 'File read failed',
    path: currentPath
  };
}

/**
 * Ensure directory exists with fallback
 */
export async function ensureDirWithFallback(
  dirPath: string,
  options: {
    maxRetries?: number;
  } = {}
): Promise<{ success: boolean; path: string; usedFallback?: boolean }> {
  const { maxRetries = 2 } = options;
  
  let currentPath = dirPath;
  let usedFallback = false;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if storage is accessible
      if (await isStorageAccessible(path.dirname(currentPath))) {
        await fs.mkdir(currentPath, { recursive: true });
        return {
          success: true,
          path: currentPath,
          usedFallback
        };
      } else {
        throw new Error('Storage not accessible');
      }
    } catch (error: any) {
      if (isStorageError(error) && attempt < maxRetries - 1) {
        // Try fallback
        const fallbackDir = await getFallbackStoragePath(currentPath);
        currentPath = fallbackDir;
        usedFallback = true;
        continue;
      }
      
      // If we can't create directory, at least try to ensure parent exists
      try {
        const parentDir = path.dirname(currentPath);
        await fs.mkdir(parentDir, { recursive: true });
        return {
          success: true,
          path: currentPath,
          usedFallback
        };
      } catch {
        return {
          success: false,
          path: currentPath,
          usedFallback
        };
      }
    }
  }
  
  return {
    success: false,
    path: currentPath,
    usedFallback
  };
}

/**
 * Validate storage configuration and refresh if needed
 */
export async function validateAndRefreshStorage(): Promise<{
  isValid: boolean;
  wasRefreshed: boolean;
  config: StorageConfig;
}> {
  const currentConfig = await getStorageConfig();
  
  // Check if current storage is accessible
  const isAccessible = await isStorageAccessible(currentConfig.dataDir);
  
  if (isAccessible) {
    return {
      isValid: true,
      wasRefreshed: false,
      config: currentConfig
    };
  }
  
  // Storage is not accessible, refresh detection
  console.warn('⚠️ Current storage not accessible, refreshing detection...');
  clearDetectionCache();
  resetStorageConfig();
  
  const { initializeStorageConfig } = await import('./storage-config');
  const refreshedConfig = await initializeStorageConfig();
  
  return {
    isValid: await isStorageAccessible(refreshedConfig.dataDir),
    wasRefreshed: true,
    config: refreshedConfig
  };
}

