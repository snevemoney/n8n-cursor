/**
 * Automatic Sync System
 * Handles automatic knowledge ingestion and workflow syncing
 */

import { getOrchestrator as getOrchestratorAsync, getRAGStore } from './shared-stores';
import { WorkflowIngester } from '@scorpion/core';
import { getMCPn8nClient } from './mcp-n8n-client';
import { responseCache } from './cache';
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

  isInitialized = true;

  // Initial sync on startup
  performInitialSync();

  // Periodic sync every 5 minutes
  syncInterval = setInterval(() => {
    performPeriodicSync();
  }, 5 * 60 * 1000); // 5 minutes

  // Watch workflow files for changes (filesystem → n8n)
  watchWorkflowFiles();

  // Watch n8n workflows for changes (n8n → filesystem)
  watchN8nWorkflows();

  console.log('🦂 Automatic syncing enabled (bidirectional)');
}

/**
 * Perform initial sync on startup
 */
async function performInitialSync() {
  try {
    console.log('🦂 Performing initial knowledge ingestion...');
    const orchestrator = await getOrchestratorAsync();
    
    // Check if knowledge exists
    const summary = await orchestrator.getSummary();
    
    if (summary.totalKnowledge === 0) {
      console.log('🦂 No knowledge found, ingesting...');
      await orchestrator.ingestAll();
      console.log(`✅ Ingested ${summary.totalKnowledge} knowledge items`);
    } else {
      console.log(`✅ Knowledge already exists: ${summary.totalKnowledge} items`);
    }
  } catch (error) {
    console.error('❌ Error during initial sync:', error);
  }
}

/**
 * Perform periodic sync
 */
async function performPeriodicSync() {
  try {
    console.log('🦂 Performing periodic sync...');
    const orchestrator = await getOrchestratorAsync();
    
    // Re-ingest to catch any changes
    const result = await orchestrator.ingestAll();
    
    // Sync workflows (filesystem → n8n)
    await syncWorkflows();
    
    // Check n8n for changes (n8n → filesystem)
    await checkN8nWorkflowChanges();
    
    console.log(`✅ Periodic sync completed: ${result.knowledge.length} knowledge items`);
  } catch (error) {
    console.error('❌ Error during periodic sync:', error);
  }
}

/**
 * Watch workflow files for changes
 */
function watchWorkflowFiles() {
  try {
    // Find workspace root (go up from apps/scorpion/lib)
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    const workflowsDir = path.join(workspaceRoot, 'workflows');
    
    // Check if directory exists before watching
    const fs = require('fs');
    if (!fs.existsSync(workflowsDir)) {
      console.warn(`⚠️ Workflows directory not found: ${workflowsDir}. Creating it...`);
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    console.log(`🦂 Watching workflow files in ${workflowsDir}...`);
    
    workflowWatcher = chokidar.watch(workflowsDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    // Debounce sync to avoid multiple syncs for rapid changes
    let syncTimeout: NodeJS.Timeout | null = null;
    const debouncedSync = () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
      syncTimeout = setTimeout(() => {
        syncWorkflows();
      }, 2000); // Wait 2 seconds after last change
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
    const mcpClient = getMCPn8nClient();
    
    // Check if client is configured before attempting API calls
    if (!mcpClient.isConfigured()) {
      // Silently skip if not configured (no need to log every time)
      return;
    }
    
    const compatClient = {
      listWorkflows: () => mcpClient.listWorkflows(),
      getWorkflow: (id: string) => mcpClient.getWorkflow(id),
      exportWorkflow: (id: string) => mcpClient.exportWorkflow(id)
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
  // Poll n8n for workflow changes every 5 minutes (reduced from 30s to avoid API hammering)
  n8nPollInterval = setInterval(() => {
    checkN8nWorkflowChanges();
  }, 5 * 60 * 1000); // 5 minutes

  // Initial check
  checkN8nWorkflowChanges();
}

/**
 * Check for workflow changes in n8n
 */
async function checkN8nWorkflowChanges() {
  // Skip if already syncing (prevent thundering herd)
  if (isSyncing) {
    console.log('⏭️ Sync already in progress, skipping...');
    return;
  }
  
  isSyncing = true;
  try {
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    const workflowsDir = path.join(workspaceRoot, 'workflows', 'shared');
    
    // Ensure workflows directory exists
    const fs = require('fs');
    if (!fs.existsSync(workflowsDir)) {
      console.warn(`⚠️ Workflows directory not found: ${workflowsDir}. Creating it...`);
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    const mcpClient = getMCPn8nClient();
    
    // Check if client is configured before attempting API calls
    if (!mcpClient.isConfigured()) {
      const now = Date.now();
      if (now - lastAuthErrorTime > AUTH_ERROR_THROTTLE) {
        console.warn('⚠️ n8n client not configured - skipping workflow sync. Set N8N_API_KEY to enable.');
        lastAuthErrorTime = now;
      }
      return;
    }
    
    // Get workflows from n8n using MCP
    let n8nWorkflows;
    try {
      n8nWorkflows = await mcpClient.listWorkflows();
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
    
    // Export workflows in small batches (5 at a time) to avoid API hammering
    if (workflowsToExport.length > 0) {
      console.log(`📦 Exporting ${workflowsToExport.length} workflows in batches...`);
      for (let i = 0; i < workflowsToExport.length; i += 5) {
        const batch = workflowsToExport.slice(i, i + 5);
        await Promise.all(batch.map(w => exportWorkflowFromN8n(w, workflowsDir)));
        // Small delay between batches to respect rate limits
        if (i + 5 < workflowsToExport.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2s between batches
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
    const mcpClient = getMCPn8nClient();
    
    // Get full workflow data using MCP
    let fullWorkflow;
    try {
      fullWorkflow = await mcpClient.getWorkflow(workflow.id);
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

