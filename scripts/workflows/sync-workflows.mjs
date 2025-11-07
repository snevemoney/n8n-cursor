#!/usr/bin/env node

/**
 * Automated Workflow Sync Script
 * Syncs workflows from workflows/ directory to n8n instance
 * 
 * Usage:
 *   node scripts/workflows/sync-workflows.mjs [--watch] [--dry-run]
 * 
 * Environment Variables:
 *   N8N_BASE_URL - n8n instance URL (default: http://localhost:5678)
 *   N8N_API_KEY - n8n API key for authentication
 *   WORKFLOWS_DIR - Directory containing workflow files (default: ./workflows)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '../..');

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const WORKFLOWS_DIR = process.env.WORKFLOWS_DIR || join(ROOT_DIR, 'workflows');

const args = process.argv.slice(2);
const WATCH_MODE = args.includes('--watch');
const DRY_RUN = args.includes('--dry-run');

/**
 * Get all workflow files from workflows directory
 */
function getWorkflowFiles() {
  const files = [];
  
  function scanDir(dir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}:`, error.message);
    }
  }
  
  scanDir(WORKFLOWS_DIR);
  return files;
}

/**
 * Read and parse workflow file
 */
function readWorkflow(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading workflow ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get workflow name from file
 */
function getWorkflowName(workflow) {
  return workflow.name || workflow.meta?.name || 'Unnamed Workflow';
}

/**
 * List workflows from n8n
 */
async function listN8nWorkflows() {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (N8N_API_KEY) {
      headers['X-N8N-API-KEY'] = N8N_API_KEY;
    }
    
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list workflows: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to list n8n workflows:', error.message);
    return [];
  }
}

/**
 * Create or update workflow in n8n
 */
async function upsertWorkflow(workflow) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (N8N_API_KEY) {
      headers['X-N8N-API-KEY'] = N8N_API_KEY;
    }
    
    // Check if workflow exists
    const existing = await listN8nWorkflows();
    const existingWorkflow = existing.find(w => w.name === getWorkflowName(workflow));
    
    const url = existingWorkflow
      ? `${N8N_BASE_URL}/api/v1/workflows/${existingWorkflow.id}`
      : `${N8N_BASE_URL}/api/v1/workflows`;
    
    const method = existingWorkflow ? 'PUT' : 'POST';
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would ${existingWorkflow ? 'update' : 'create'} workflow: ${getWorkflowName(workflow)}`);
      return { success: true, created: !existingWorkflow };
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(workflow),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to ${existingWorkflow ? 'update' : 'create'} workflow: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ ${existingWorkflow ? 'Updated' : 'Created'} workflow: ${getWorkflowName(workflow)}`);
    return { success: true, created: !existingWorkflow, workflow: result };
  } catch (error) {
    console.error(`❌ Failed to sync workflow ${getWorkflowName(workflow)}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sync all workflows
 */
async function syncWorkflows() {
  console.log('🔄 Syncing workflows...');
  console.log(`   Source: ${WORKFLOWS_DIR}`);
  console.log(`   Target: ${N8N_BASE_URL}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('');
  
  const files = getWorkflowFiles();
  console.log(`📋 Found ${files.length} workflow files`);
  
  if (files.length === 0) {
    console.log('⚠️  No workflow files found');
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const workflow = readWorkflow(file);
    if (!workflow) {
      errorCount++;
      continue;
    }
    
    const result = await upsertWorkflow(workflow);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Small delay to avoid overwhelming n8n
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('');
  console.log(`✅ Sync complete: ${successCount} succeeded, ${errorCount} failed`);
}

/**
 * Watch mode - sync on file changes
 */
function watchMode() {
  console.log('👀 Watching for workflow file changes...');
  console.log(`   Directory: ${WORKFLOWS_DIR}`);
  console.log('');
  
  // Initial sync
  syncWorkflows();
  
  // Watch for changes (simple polling for now)
  setInterval(() => {
    syncWorkflows();
  }, 30000); // Check every 30 seconds
  
  console.log('Press Ctrl+C to stop watching');
}

// Main execution
if (WATCH_MODE) {
  watchMode();
} else {
  syncWorkflows().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

