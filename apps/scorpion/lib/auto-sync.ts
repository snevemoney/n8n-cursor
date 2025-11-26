/**
 * Automatic Sync System
 * Handles automatic knowledge ingestion and workflow syncing
 */

import { getOrchestrator as getOrchestratorAsync, getRAGStore } from './shared-stores';
import { WorkflowIngester } from '@scorpion/core';
import { N8nClient } from './n8n-client';
import { responseCache } from './cache';
import { getOptimizedBatchSize, getOptimizedBatchDelay } from './storage/performance-optimizer';
import path from 'path';
import chokidar from 'chokidar';
import { spawn, ChildProcess } from 'child_process';

let syncInterval: NodeJS.Timeout | null = null;
let workflowWatcher: ReturnType<typeof chokidar.watch> | null = null;
let n8nPollInterval: NodeJS.Timeout | null = null;
let lastN8nWorkflowHashes: Map<string, string> = new Map();
let ingestionTimeout: NodeJS.Timeout | null = null;
let isInitialized = false;
let isSyncing = false; // Prevent overlapping syncs
let lastAuthErrorTime: number = 0;
const AUTH_ERROR_THROTTLE = 5 * 60 * 1000; // Only log auth errors once per 5 minutes

/**
 * Initialize automatic syncing
 */
export function initializeAutoSync() {
  if (isInitialized) {
    console.log('🦂 Auto-sync already initialized');
    return;
  }

  // Check if auto-sync is disabled via environment variable
  if (process.env['DISABLE_AUTO_SYNC'] === 'true') {
    console.log('🦂 Auto-sync disabled via DISABLE_AUTO_SYNC environment variable');
    return;
  }

  isInitialized = true;

  // Initial sync on startup (don't await - let it run in background)
  // Increased delay to allow server to fully initialize
  performInitialSync().catch(err => {
    console.error('❌ Failed to perform initial sync:', err);
  });

  // Periodic sync interval (configurable via env, default 15 minutes for better performance)
  const syncIntervalMs = process.env['AUTO_SYNC_INTERVAL_MS'] 
    ? parseInt(process.env['AUTO_SYNC_INTERVAL_MS'], 10) 
    : 15 * 60 * 1000; // 15 minutes (increased from 5 minutes)
  
  syncInterval = setInterval(() => {
    performPeriodicSync().catch(err => {
      console.error('❌ Failed to perform periodic sync:', err);
    });
  }, syncIntervalMs);

  // Watch workflow files for changes (filesystem → n8n)
  // Can be disabled via environment variable
  if (process.env['DISABLE_FILE_WATCHER'] !== 'true') {
  watchWorkflowFiles().catch(err => {
    console.error('Failed to initialize workflow watcher:', err);
  });
  } else {
    console.log('🦂 File watcher disabled via DISABLE_FILE_WATCHER environment variable');
  }

  // Watch n8n workflows for changes (n8n → filesystem)
  watchN8nWorkflows();

  console.log(`🦂 Automatic syncing enabled (bidirectional, sync interval: ${syncIntervalMs / 1000 / 60} minutes)`);
}

/**
 * Perform initial sync on startup
 * Always runs full ingestion to ensure recommendations and tech debt analysis are up to date
 * Now runs in background with deferred start to avoid blocking server startup
 */
async function performInitialSync() {
  try {
    // Defer heavy ingestion to allow server to start faster
    // Increased delay for better performance (configurable via env)
    const initialDelayMs = process.env['AUTO_SYNC_INITIAL_DELAY_MS']
      ? parseInt(process.env['AUTO_SYNC_INITIAL_DELAY_MS'], 10)
      : 3000; // 3 seconds (increased from 500ms for better startup performance)
    await new Promise(resolve => setTimeout(resolve, initialDelayMs));
    
    console.log('🦂 Performing initial knowledge ingestion (including recommendations)...');
    console.log('🦂 Getting orchestrator...');
    const orchestrator = await getOrchestratorAsync();
    console.log('🦂 Orchestrator ready, starting ingestion...');
    
    // Run lightweight essential ingestion (tech debt + recommendations + key docs)
    // This is faster and focuses on what the dashboard needs and common queries
    console.log('🦂 Running essential ingestion (tech debt + recommendations + key docs)...');
    const result = await orchestrator.ingestEssential();
    
    const totalItems = result.techDebt.length + result.recommendations.length + result.documentation.length;
    console.log(`🦂 Essential ingestion returned ${totalItems} items (${result.techDebt.length} tech debt + ${result.recommendations.length} recommendations + ${result.documentation.length} key docs)`);
    
    // Invalidate caches to ensure fresh data
    orchestrator.invalidateCache();
    responseCache.invalidate('project-status');
    responseCache.invalidate('health-check');
    responseCache.invalidate('workflows-list');
    
    // Verify what was actually stored
    const ragStore = await getRAGStore();
    const storedKnowledge = ragStore.getAllKnowledge();
    const techDebtStored = storedKnowledge.filter(k => k.category === 'tech-debt').length;
    const missingFeaturesStored = storedKnowledge.filter(k => k.category === 'missing-features').length;
    const recommendationsStored = storedKnowledge.filter(k => k.source === 'recommendation-engine').length;
    const documentationStored = storedKnowledge.filter(k => k.category === 'documentation' || k.source === 'docs').length;
    
    console.log(`✅ Essential ingestion complete: ${totalItems} items processed`);
    console.log(`   Stored in RAG: ${storedKnowledge.length} total`);
    console.log(`   Tech Debt items: ${techDebtStored}`);
    console.log(`   Missing Features items: ${missingFeaturesStored}`);
    console.log(`   Recommendations: ${recommendationsStored}`);
    console.log(`   Documentation: ${documentationStored}`);
  } catch (error) {
    console.error('❌ Error during initial sync:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
  }
}

/**
 * Perform periodic sync
 * Runs full ingestion including recommendations and tech debt analysis
 */
async function performPeriodicSync() {
  try {
    console.log('🦂 Performing periodic sync (essential: tech debt + recommendations)...');
    const orchestrator = await getOrchestratorAsync();
    
    // Run lightweight essential ingestion (faster, focused on dashboard needs)
    const result = await orchestrator.ingestEssential();
    
    // Invalidate caches to ensure fresh data
    orchestrator.invalidateCache();
    responseCache.invalidate('project-status');
    responseCache.invalidate('health-check');
    responseCache.invalidate('workflows-list');
    
    // Sync workflows (filesystem → n8n)
    await syncWorkflows();
    
    // Check n8n for changes (n8n → filesystem)
    await checkN8nWorkflowChanges();
    
    const totalItems = result.techDebt.length + result.recommendations.length;
    console.log(`✅ Periodic sync completed: ${totalItems} items (${result.techDebt.length} tech debt + ${result.recommendations.length} recommendations)`);
  } catch (error) {
    console.error('❌ Error during periodic sync:', error);
  }
}

/**
 * Watch workflow files for changes
 */
async function watchWorkflowFiles() {
  try {
    // Use SSD-aware workflow directory
    const { getOptimalWorkflowDir } = await import('./storage/workflow-storage');
    const workflowsDir = await getOptimalWorkflowDir();
    
    // Use async fs - NEVER use existsSync!
    const fs = await import('fs/promises');
    try {
      await fs.access(workflowsDir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(workflowsDir, { recursive: true });
    }
    
    console.log(`🦂 Watching workflow files in ${workflowsDir}...`);
    
    workflowWatcher = chokidar.watch(workflowsDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    // Debounce sync to avoid multiple syncs for rapid changes (optimized based on storage)
    let syncTimeout: NodeJS.Timeout | null = null;
    const debouncedSync = async () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
      // Get optimized debounce delay (shorter on SSD)
      const { getFileWatcherDebounce } = await import('./storage/performance-optimizer');
      const debounceDelay = await getFileWatcherDebounce();
      syncTimeout = setTimeout(() => {
        syncWorkflows();
      }, debounceDelay);
    };

    workflowWatcher
      .on('add', async (filePath: string) => {
        console.log(`📥 Workflow file added: ${filePath}`);
        debouncedSync();
      })
      .on('change', async (filePath: string) => {
        console.log(`🔄 Workflow file changed: ${filePath}`);
        debouncedSync();
      })
      .on('unlink', async (filePath: string) => {
        console.log(`🗑️ Workflow file removed: ${filePath}`);
        debouncedSync();
      })
      .on('error', (error: unknown) => {
        console.error('❌ Workflow watcher error:', error);
      });

    console.log('✅ Workflow file watcher started');
  } catch (error) {
    console.error('❌ Error setting up workflow watcher:', error);
  }
}

/**
 * Sync workflows to n8n
 */
async function syncWorkflows() {
  try {
    // Find workspace root (go up from apps/scorpion/lib)
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    const n8nClient = new N8nClient();
    
    // Check if API key is configured
    if (!process.env['N8N_API_KEY']) {
      // Silently skip if not configured (no need to log every time)
      return;
    }
    
    const compatClient = {
      listWorkflows: () => n8nClient.listWorkflows(),
      getWorkflow: (id: string) => n8nClient.getWorkflow(id),
      exportWorkflow: async (id: string) => {
        const workflow = await n8nClient.getWorkflow(id);
        return workflow ? true : false;
      }
    } as any;
    const workflowIngester = new WorkflowIngester(workspaceRoot, compatClient);
    
    // Get workflows and check sync status
    let workflows;
    try {
      workflows = await workflowIngester.getWorkflows();
    } catch (error: any) {
      // Handle auth errors gracefully
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('authentication')) {
        const now = Date.now();
        if (now - lastAuthErrorTime > AUTH_ERROR_THROTTLE) {
          console.warn('⚠️ n8n authentication failed - check N8N_API_KEY. Skipping workflow sync.');
          lastAuthErrorTime = now;
        }
        return; // Silently skip
      }
      throw error; // Re-throw other errors
    }
    
    const unsynced = workflows.filter(w => !w.syncedToN8n);
    
    if (unsynced.length > 0) {
      console.log(`🔄 Found ${unsynced.length} unsynced workflows (filesystem-only)`);
      
      // Note: These are workflows in the filesystem that don't exist in n8n yet.
      // For now, we'll just log them. To actually sync them to n8n, 
      // use the sync script: pnpm run workflows:sync
      // 
      // We don't auto-upload because:
      // 1. Prevents accidental overwrites of n8n workflows
      // 2. Gives user control over what gets synced
      // 3. Avoids API rate limiting
      
      console.log('💡 Run `pnpm run workflows:sync` to upload these to n8n');
    } else {
      console.log('✅ All filesystem workflows exist in n8n');
    }
  } catch (error: any) {
    // Only log non-auth errors to prevent spam
    if (!error.message?.includes('401') && !error.message?.includes('403') && !error.message?.includes('authentication')) {
      console.error('❌ Error syncing workflows:', error);
    }
  }
}

/**
 * Watch n8n workflows for changes
 */
function watchN8nWorkflows() {
  // Poll n8n for workflow changes (configurable via env, default 15 minutes for better performance)
  const pollIntervalMs = process.env['N8N_POLL_INTERVAL_MS']
    ? parseInt(process.env['N8N_POLL_INTERVAL_MS'], 10)
    : 15 * 60 * 1000; // 15 minutes (increased from 5 minutes)
  
  n8nPollInterval = setInterval(() => {
    checkN8nWorkflowChanges();
  }, pollIntervalMs);

  // Initial check (deferred to avoid blocking startup)
  setTimeout(() => {
  checkN8nWorkflowChanges();
  }, 5000); // Wait 5 seconds before first check
}

/**
 * Force sync all workflows from n8n (for manual sync trigger)
 */
export async function forceSyncN8nWorkflows() {
  // Reset hashes to force sync of all workflows
  lastN8nWorkflowHashes.clear();
  return checkN8nWorkflowChanges(true); // Pass force=true
}

/**
 * Check for workflow changes in n8n
 */
async function checkN8nWorkflowChanges(forceSync: boolean = false) {
  // Skip if already syncing (prevent thundering herd)
  if (isSyncing) {
    console.log('⏭️ Sync already in progress, skipping...');
    return;
  }
  
  isSyncing = true;
  try {
    // Use SSD-aware workflow directory
    const { getOptimalWorkflowDir } = await import('./storage/workflow-storage');
    const baseWorkflowsDir = await getOptimalWorkflowDir();
    const workflowsDir = path.join(baseWorkflowsDir, 'shared');
    
    // Use async fs - NEVER use existsSync!
    const fs = await import('fs/promises');
    try {
      await fs.access(workflowsDir);
    } catch {
      await fs.mkdir(workflowsDir, { recursive: true });
    }
    
    const n8nClient = new N8nClient();
    
    // Check if API key is configured
    if (!process.env['N8N_API_KEY']) {
      const now = Date.now();
      if (now - lastAuthErrorTime > AUTH_ERROR_THROTTLE) {
        console.warn('⚠️ n8n client not configured - skipping workflow sync. Set N8N_API_KEY to enable.');
        lastAuthErrorTime = now;
      }
      return;
    }
    
    // Get workflows from n8n using direct API
    let n8nWorkflows;
    try {
      n8nWorkflows = await n8nClient.listWorkflows();
    } catch (error: any) {
      // Handle authentication errors gracefully
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('authentication')) {
        const now = Date.now();
        if (now - lastAuthErrorTime > AUTH_ERROR_THROTTLE) {
          console.warn('⚠️ n8n authentication failed - check N8N_API_KEY. Skipping workflow sync.');
          lastAuthErrorTime = now;
        }
        return; // Exit gracefully, don't throw
      }
      // Re-throw other errors (network issues, etc.)
      throw error;
    }
    
    // Calculate hash of each workflow (simple hash based on updatedAt + nodes count)
    const currentHashes = new Map<string, string>();
    let hasChanges = false;
    const workflowsToExport: any[] = [];
    
    for (const workflow of n8nWorkflows) {
      const hash = `${workflow.id}-${(workflow as any).updatedAt || Date.now()}-${workflow.nodes?.length || 0}`;
      currentHashes.set(workflow.id, hash);
      
      // If force sync, export all workflows
      if (forceSync) {
        console.log(`📥 Force syncing workflow: ${workflow.name}`);
        workflowsToExport.push(workflow);
        hasChanges = true;
      } else {
      // Check if workflow changed
      const lastHash = lastN8nWorkflowHashes.get(workflow.id);
      if (lastHash && lastHash !== hash) {
        console.log(`🔄 Workflow changed in n8n: ${workflow.name}`);
        workflowsToExport.push(workflow);
        hasChanges = true;
      } else if (!lastHash) {
        // New workflow in n8n
        console.log(`📥 New workflow in n8n: ${workflow.name}`);
        workflowsToExport.push(workflow);
        hasChanges = true;
        }
      }
    }
    
    // Export workflows in optimized batches (size based on storage type)
    if (workflowsToExport.length > 0) {
      const batchSize = await getOptimizedBatchSize();
      const batchDelay = await getOptimizedBatchDelay();
      console.log(`📦 Exporting ${workflowsToExport.length} workflows in batches of ${batchSize}...`);
      for (let i = 0; i < workflowsToExport.length; i += batchSize) {
        const batch = workflowsToExport.slice(i, i + batchSize);
        await Promise.all(batch.map(w => exportWorkflowFromN8n(w, workflowsDir)));
        // Optimized delay between batches (shorter on SSD)
        if (i + batchSize < workflowsToExport.length) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }
    }
    
    // Update hashes
    lastN8nWorkflowHashes = currentHashes;
    
    // Debounced re-ingestion: wait 5 seconds after last change to batch multiple updates
    if (hasChanges) {
      if (ingestionTimeout) {
        clearTimeout(ingestionTimeout);
      }
      ingestionTimeout = setTimeout(async () => {
        console.log('🦂 Re-ingesting knowledge after workflow changes (debounced)...');
        try {
          const orchestrator = await getOrchestratorAsync();
          await orchestrator.ingestAll();
          
          // Invalidate caches after ingestion
          orchestrator.invalidateCache();
          responseCache.invalidate('workflows-list');
          responseCache.invalidate('project-status');
          responseCache.invalidate('health-check');
          
          console.log('✅ Knowledge re-ingestion complete');
        } catch (error) {
          console.error('❌ Error during debounced re-ingestion:', error);
        }
      }, 5000); // 5 second debounce
    }
  } catch (error: any) {
    // Only log non-auth errors (auth errors are handled above)
    if (!error.message?.includes('401') && !error.message?.includes('403') && !error.message?.includes('authentication')) {
      console.error('❌ Error checking n8n workflow changes:', error);
    }
  } finally {
    isSyncing = false;
  }
}

/**
 * Export workflow from n8n to filesystem
 */
async function exportWorkflowFromN8n(workflow: any, workflowsDir: string) {
  try {
    const fs = await import('fs/promises');
    const n8nClient = new N8nClient();
    
    // Get full workflow data using direct API
    let fullWorkflow;
    try {
      fullWorkflow = await n8nClient.getWorkflow(workflow.id);
    } catch (error: any) {
      // Handle auth errors gracefully - silently skip this workflow
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('authentication')) {
        return;
      }
      throw error; // Re-throw other errors
    }
    
    if (!fullWorkflow) {
      return;
    }
    
    // Ensure directory exists
    await fs.mkdir(workflowsDir, { recursive: true });
    
    // Sanitize filename
    const fileName = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const filePath = path.join(workflowsDir, fileName);
    
    // Write to filesystem
    await fs.writeFile(filePath, JSON.stringify(fullWorkflow, null, 2), 'utf-8');
    console.log(`✅ Exported workflow from n8n: ${filePath}`);
    
    // Note: Re-ingestion is handled by the debounced logic in checkN8nWorkflowChanges
    // We don't trigger full ingestion here to avoid cascading re-ingestions
  } catch (error: any) {
    // Only log non-auth errors to prevent spam
    if (!error.message?.includes('401') && !error.message?.includes('403') && !error.message?.includes('authentication')) {
      console.error(`❌ Error exporting workflow ${workflow.name}:`, error);
    }
  }
}

/**
 * Stop automatic syncing
 */
export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  if (n8nPollInterval) {
    clearInterval(n8nPollInterval);
    n8nPollInterval = null;
  }
  
  if (workflowWatcher) {
    workflowWatcher.close();
    workflowWatcher = null;
  }
  
  isInitialized = false;
  console.log('🦂 Auto-sync stopped');
}

