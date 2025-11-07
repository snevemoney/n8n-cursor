/**
 * Automatic Sync System
 * Handles automatic knowledge ingestion and workflow syncing
 */

import { getOrchestrator as getOrchestratorAsync, getRAGStore } from './shared-stores';
import { WorkflowIngester } from '@scorpion/core';
import { N8nClient } from './n8n-client';
import path from 'path';
import chokidar from 'chokidar';
import { spawn, ChildProcess } from 'child_process';

let syncInterval: NodeJS.Timeout | null = null;
let workflowWatcher: ReturnType<typeof chokidar.watch> | null = null;
let n8nPollInterval: NodeJS.Timeout | null = null;
let lastN8nWorkflowHashes: Map<string, string> = new Map();
let isInitialized = false;

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
    const n8nClient = new N8nClient(process.env.N8N_API_KEY);
    const workflowIngester = new WorkflowIngester(workspaceRoot, n8nClient);
    
    // Get workflows and check sync status
    const workflows = await workflowIngester.getWorkflows();
    const unsynced = workflows.filter(w => !w.syncedToN8n);
    
    if (unsynced.length > 0) {
      console.log(`🔄 Found ${unsynced.length} unsynced workflows, triggering sync...`);
      
      // Trigger the sync script via pnpm
      const syncProcess = spawn('pnpm', ['run', 'workflows:sync'], {
        cwd: workspaceRoot,
        stdio: 'pipe',
        shell: true
      });
      
      syncProcess.stdout?.on('data', (data: Buffer) => {
        console.log(`📥 Sync: ${data.toString().trim()}`);
      });
      
      syncProcess.stderr?.on('data', (data: Buffer) => {
        console.error(`❌ Sync error: ${data.toString().trim()}`);
      });
      
      syncProcess.on('close', (code: number | null) => {
        if (code === 0) {
          console.log('✅ Workflow sync completed');
        } else {
          console.error(`❌ Workflow sync failed with code ${code}`);
        }
      });
    } else {
      console.log('✅ All workflows are synced');
    }
  } catch (error) {
    console.error('❌ Error syncing workflows:', error);
  }
}

/**
 * Watch n8n workflows for changes
 */
function watchN8nWorkflows() {
  // Poll n8n every 30 seconds for changes
  n8nPollInterval = setInterval(() => {
    checkN8nWorkflowChanges();
  }, 30 * 1000); // 30 seconds

  // Initial check
  checkN8nWorkflowChanges();
}

/**
 * Check for workflow changes in n8n
 */
async function checkN8nWorkflowChanges() {
  try {
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    const workflowsDir = path.join(workspaceRoot, 'workflows', 'shared');
    
    // Ensure workflows directory exists
    const fs = require('fs');
    if (!fs.existsSync(workflowsDir)) {
      console.warn(`⚠️ Workflows directory not found: ${workflowsDir}. Creating it...`);
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    const n8nClient = new N8nClient(process.env.N8N_API_KEY);
    
    // Get workflows from n8n
    const n8nWorkflows = await n8nClient.listWorkflows();
    
    // Calculate hash of each workflow (simple hash based on updatedAt + nodes count)
    const currentHashes = new Map<string, string>();
    
    for (const workflow of n8nWorkflows) {
      const hash = `${workflow.id}-${(workflow as any).updatedAt || Date.now()}-${workflow.nodes?.length || 0}`;
      currentHashes.set(workflow.id, hash);
      
      // Check if workflow changed
      const lastHash = lastN8nWorkflowHashes.get(workflow.id);
      if (lastHash && lastHash !== hash) {
        console.log(`🔄 Workflow changed in n8n: ${workflow.name}`);
        await exportWorkflowFromN8n(workflow, workflowsDir);
      } else if (!lastHash) {
        // New workflow in n8n
        console.log(`📥 New workflow in n8n: ${workflow.name}`);
        await exportWorkflowFromN8n(workflow, workflowsDir);
      }
    }
    
    // Update hashes
    lastN8nWorkflowHashes = currentHashes;
    
    // Re-ingest knowledge after workflow changes
    if (currentHashes.size !== lastN8nWorkflowHashes.size) {
      const orchestrator = await getOrchestratorAsync();
      await orchestrator.ingestAll();
    }
  } catch (error) {
    console.error('❌ Error checking n8n workflow changes:', error);
  }
}

/**
 * Export workflow from n8n to filesystem
 */
async function exportWorkflowFromN8n(workflow: any, workflowsDir: string) {
  try {
    const fs = await import('fs/promises');
    const n8nClient = new N8nClient(process.env.N8N_API_KEY);
    
    // Get full workflow data
    const fullWorkflow = await n8nClient.getWorkflow(workflow.id);
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
    
    // Update knowledge
    const orchestrator = await getOrchestratorAsync();
    await orchestrator.ingestAll();
  } catch (error) {
    console.error(`❌ Error exporting workflow ${workflow.name}:`, error);
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

