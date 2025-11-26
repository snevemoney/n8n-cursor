/**
 * Workflow Storage Optimizer
 * Stores workflow execution data and workflow files on SSD when available
 */

import fs from 'fs/promises';
import path from 'path';
import { getStorageConfig } from './storage-config';

/**
 * Get optimal workflow storage directory (SSD if available)
 */
export async function getOptimalWorkflowDir(): Promise<string> {
  const config = await getStorageConfig();
  
  if (config.isSSD && config.storageInfo.detectedSSDPath) {
    const ssdWorkflowDir = path.join(config.storageInfo.detectedSSDPath, 'scorpion-workflows');
    try {
      await fs.mkdir(ssdWorkflowDir, { recursive: true });
      await fs.access(ssdWorkflowDir, fs.constants.W_OK);
      return ssdWorkflowDir;
    } catch {
      // Fallback to default
    }
  }

  // Default workflow directory
  const workspaceRoot = path.resolve(process.cwd(), '../..');
  const defaultWorkflowDir = path.join(workspaceRoot, 'workflows');
  await fs.mkdir(defaultWorkflowDir, { recursive: true });
  return defaultWorkflowDir;
}

/**
 * Get optimal workflow execution data directory (SSD if available)
 */
export async function getOptimalWorkflowExecutionDir(): Promise<string> {
  const config = await getStorageConfig();
  
  if (config.isSSD && config.storageInfo.detectedSSDPath) {
    const ssdExecDir = path.join(config.storageInfo.detectedSSDPath, 'scorpion-data', 'workflow-executions');
    try {
      await fs.mkdir(ssdExecDir, { recursive: true });
      await fs.access(ssdExecDir, fs.constants.W_OK);
      return ssdExecDir;
    } catch {
      // Fallback to data directory
    }
  }

  // Default execution directory
  const dataDir = await import('./storage-config').then(m => m.getDataDir());
  const execDir = path.join(await dataDir, 'workflow-executions');
  await fs.mkdir(execDir, { recursive: true });
  return execDir;
}

