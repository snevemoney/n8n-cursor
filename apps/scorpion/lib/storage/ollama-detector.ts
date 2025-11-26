/**
 * Ollama Model Path Detection
 * Detects Ollama model storage location and optimizes based on storage type
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { isSSD } from './storage-detector';

export interface OllamaModelInfo {
  name: string;
  size: number; // bytes
  modified: Date;
  path: string;
}

export interface OllamaStorageInfo {
  modelsPath: string;
  isOnSSD: boolean;
  models: OllamaModelInfo[];
  totalSize: number; // bytes
  recommendation?: string;
}

/**
 * Detect Ollama model storage location
 */
export async function detectOllamaStorage(): Promise<OllamaStorageInfo> {
  // Check environment variable first
  const customPath = process.env.OLLAMA_MODELS;
  if (customPath) {
    return await analyzeOllamaPath(customPath);
  }

  // Check default locations based on platform
  const platform = os.platform();
  let defaultPath: string;

  if (platform === 'darwin') {
    // macOS: ~/.ollama/models
    defaultPath = path.join(os.homedir(), '.ollama', 'models');
  } else if (platform === 'linux') {
    // Linux: ~/.ollama/models
    defaultPath = path.join(os.homedir(), '.ollama', 'models');
  } else if (platform === 'win32') {
    // Windows: %USERPROFILE%\.ollama\models
    defaultPath = path.join(os.homedir(), '.ollama', 'models');
  } else {
    defaultPath = path.join(os.homedir(), '.ollama', 'models');
  }

  return await analyzeOllamaPath(defaultPath);
}

/**
 * Analyze Ollama path and detect models
 */
async function analyzeOllamaPath(modelsPath: string): Promise<OllamaStorageInfo> {
  const models: OllamaModelInfo[] = [];
  let totalSize = 0;
  let isOnSSD = false;

  try {
    // Check if path exists
    await fs.access(modelsPath);
    
    // Check if on SSD
    isOnSSD = await isSSD(modelsPath);

    // List model files
    const entries = await fs.readdir(modelsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(modelsPath, entry.name);
        try {
          const stats = await fs.stat(filePath);
          models.push({
            name: entry.name,
            size: stats.size,
            modified: stats.mtime,
            path: filePath,
          });
          totalSize += stats.size;
        } catch {
          // Skip inaccessible files
        }
      }
    }
  } catch {
    // Path doesn't exist or is inaccessible
  }

  // Generate recommendation
  let recommendation: string | undefined;
  if (!isOnSSD && models.length > 0) {
    recommendation = `Consider moving Ollama models to SSD for faster loading. Current location: ${modelsPath}`;
  } else if (isOnSSD) {
    recommendation = `Models are on SSD - optimal performance!`;
  }

  return {
    modelsPath,
    isOnSSD,
    models,
    totalSize,
    recommendation,
  };
}

/**
 * Get Ollama model loading performance estimate
 */
export async function getModelLoadingEstimate(modelSize: number): Promise<{
  estimatedLoadTime: number; // seconds
  isOnSSD: boolean;
}> {
  const storageInfo = await detectOllamaStorage();
  
  // Estimate based on storage type
  // SSD: ~500 MB/s, HDD: ~100 MB/s
  const readSpeed = storageInfo.isOnSSD ? 500 * 1024 * 1024 : 100 * 1024 * 1024; // bytes per second
  const estimatedLoadTime = modelSize / readSpeed;

  return {
    estimatedLoadTime,
    isOnSSD: storageInfo.isOnSSD,
  };
}

/**
 * Check if Ollama is configured to use SSD
 */
export async function isOllamaOnSSD(): Promise<boolean> {
  const storageInfo = await detectOllamaStorage();
  return storageInfo.isOnSSD;
}

