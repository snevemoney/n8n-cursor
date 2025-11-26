#!/usr/bin/env node
/**
 * n8n Workflow Sync Down Script
 * Pulls all workflows from source environment to target environment
 * 
 * Usage:
 *   node scripts/n8n-sync-down.mjs --from production --to local
 *   node scripts/n8n-sync-down.mjs --from staging --to testing --overwrite
 */

import fs from 'fs';
import path from 'path';
import process from 'process';

// Parse command line arguments
const argv = new Map(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) {
      const key = cur.replace(/^--/, '');
      const val = arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true;
      acc.push([key, val]);
    }
    return acc;
  }, [])
);

// Validate required arguments
const fromEnv = argv.get('from');
const toEnv = argv.get('to');
const overwrite = !!argv.get('overwrite');

if (!fromEnv || !toEnv) {
  console.error('❌ Missing required arguments: --from <environment> --to <environment>');
  console.error('Example: node scripts/n8n-sync-down.mjs --from production --to local');
  process.exit(1);
}

// Environment configuration
const envConfig = {
  local: {
    baseUrl: process.env.N8N_LOCAL_BASE_URL || 'http://localhost:5678',
    apiKey: process.env.N8N_LOCAL_API_KEY,
    apiPath: '/api/v1',
    authHeader: 'X-N8N-API-KEY'
  },
  integration: {
    baseUrl: process.env.N8N_INT_BASE_URL,
    apiKey: process.env.N8N_INT_API_KEY,
    apiPath: '/api/v1',
    authHeader: 'X-N8N-API-KEY'
  },
  testing: {
    baseUrl: process.env.N8N_TEST_BASE_URL,
    apiKey: process.env.N8N_TEST_API_KEY,
    apiPath: '/api/v1',
    authHeader: 'X-N8N-API-KEY'
  },
  staging: {
    baseUrl: process.env.N8N_STG_BASE_URL,
    apiKey: process.env.N8N_STG_API_KEY,
    apiPath: '/api/v1',
    authHeader: 'X-N8N-API-KEY'
  },
  production: {
    baseUrl: process.env.N8N_PRD_BASE_URL || 'https://n8ncloud.tech',
    apiKey: process.env.N8N_PRD_API_KEY,
    apiPath: '/api/v1',
    authHeader: 'X-N8N-API-KEY'
  }
};

// Validate environment configuration
const sourceEnv = envConfig[fromEnv];
const targetEnv = envConfig[toEnv];

if (!sourceEnv || !sourceEnv.baseUrl || !sourceEnv.apiKey) {
  console.error(`❌ Invalid source environment: ${fromEnv}`);
  console.error('Make sure environment variables are set');
  process.exit(1);
}

if (!targetEnv || !targetEnv.baseUrl || !targetEnv.apiKey) {
  console.error(`❌ Invalid target environment: ${toEnv}`);
  console.error('Make sure environment variables are set');
  process.exit(1);
}

console.log(`🔄 Syncing workflows from ${fromEnv} to ${toEnv}`);
console.log(`Source: ${sourceEnv.baseUrl}${sourceEnv.apiPath}`);
console.log(`Target: ${targetEnv.baseUrl}${targetEnv.apiPath}`);
console.log(`Overwrite: ${overwrite ? 'Yes' : 'No'}`);

// Helper function to make authenticated API calls
async function n8nApiCall(env, endpoint, method = 'GET', body = null) {
  const url = `${env.baseUrl}${env.apiPath}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Set authentication header
  if (env.authHeader === 'X-N8N-API-KEY') {
    headers['X-N8N-API-KEY'] = env.apiKey;
  } else {
    headers['Authorization'] = `Bearer ${env.apiKey}`;
  }

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${method} ${url} -> ${response.status} ${response.statusText}\n${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    throw new Error(`Failed to call n8n API: ${error.message}`);
  }
}

// Get all workflows from source environment
async function getSourceWorkflows() {
  console.log(`📥 Fetching workflows from ${fromEnv}...`);
  const workflows = await n8nApiCall(sourceEnv, '/workflows');
  const workflowList = workflows.data || workflows;
  
  console.log(`✅ Found ${workflowList.length} workflows in ${fromEnv}`);
  return workflowList;
}

// Get existing workflows in target environment
async function getTargetWorkflows() {
  console.log(`📥 Fetching existing workflows from ${toEnv}...`);
  const workflows = await n8nApiCall(targetEnv, '/workflows');
  const workflowList = workflows.data || workflows;
  
  console.log(`✅ Found ${workflowList.length} existing workflows in ${toEnv}`);
  return workflowList;
}

// Sanitize workflow for target environment
function sanitizeWorkflow(workflow, fromEnv, toEnv) {
  // Clone the workflow
  const sanitized = JSON.parse(JSON.stringify(workflow));
  
  // Remove workflow-level identifiers
  delete sanitized.id;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  sanitized.active = false; // Start inactive for safety
  
  // Sanitize nodes
  if (sanitized.nodes) {
    for (const node of sanitized.nodes) {
      // Remove node IDs
      delete node.id;
      
      // Handle webhook paths (add environment prefix if configured)
      if (node.type?.includes('webhook') && node.parameters?.path) {
        const envPrefix = process.env[`SYNC_${toEnv.toUpperCase()}_WEBHOOK_PREFIX`];
        if (envPrefix) {
          const currentPath = String(node.parameters.path);
          if (!currentPath.startsWith(envPrefix)) {
            node.parameters.path = `${envPrefix}${currentPath}`;
          }
        }
      }
      
      // Handle HTTP Request URLs (replace base URLs if configured)
      if (node.type?.includes('httpRequest') && node.parameters?.url) {
        const replaceBase = process.env[`SYNC_${toEnv.toUpperCase()}_REPLACE_BASE`];
        const withBase = process.env[`SYNC_${toEnv.toUpperCase()}_WITH_BASE`];
        
        if (replaceBase && withBase && typeof node.parameters.url === 'string') {
          if (node.parameters.url.startsWith(replaceBase)) {
            node.parameters.url = withBase + node.parameters.url.slice(replaceBase.length);
          }
        }
      }
      
      // Handle credentials (prefer names over IDs)
      if (node.credentials) {
        for (const [, cred] of Object.entries(node.credentials)) {
          if (cred && typeof cred === 'object') {
            delete cred.id;
            // Keep cred.name for server-side resolution
          }
        }
      }
    }
  }
  
  return sanitized;
}

// Check if workflow exists in target by name
function workflowExists(workflowName, targetWorkflows) {
  return targetWorkflows.find(w => w.name === workflowName);
}

// Create or update workflow in target environment
async function syncWorkflow(workflow, targetEnv, targetWorkflows, overwrite) {
  const existing = workflowExists(workflow.name, targetWorkflows);
  
  if (existing && !overwrite) {
    console.log(`  ⏭️  Skipping "${workflow.name}" (already exists, use --overwrite to force)`);
    return { skipped: true, name: workflow.name };
  }
  
  if (existing && overwrite) {
    console.log(`  🔄 Updating "${workflow.name}" (ID: ${existing.id})`);
    
    // Delete existing workflow first
    await n8nApiCall(targetEnv, `/workflows/${existing.id}`, 'DELETE');
    
    // Create new one
    const sanitized = sanitizeWorkflow(workflow, fromEnv, toEnv);
    const created = await n8nApiCall(targetEnv, '/workflows', 'POST', sanitized);
    const newId = created.id || created.data?.id;
    
    return { updated: true, name: workflow.name, id: newId };
  } else {
    console.log(`  ➕ Creating "${workflow.name}"`);
    
    const sanitized = sanitizeWorkflow(workflow, fromEnv, toEnv);
    const created = await n8nApiCall(targetEnv, '/workflows', 'POST', sanitized);
    const newId = created.id || created.data?.id;
    
    return { created: true, name: workflow.name, id: newId };
  }
}

// Main sync process
async function syncWorkflows() {
  try {
    // Step 1: Get source workflows
    const sourceWorkflows = await getSourceWorkflows();
    
    // Step 2: Get target workflows
    const targetWorkflows = await getTargetWorkflows();
    
    // Step 3: Sync each workflow
    console.log(`\n🔄 Starting sync process...`);
    
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0
    };
    
    for (const workflow of sourceWorkflows) {
      try {
        const result = await syncWorkflow(workflow, targetEnv, targetWorkflows, overwrite);
        
        if (result.created) results.created++;
        else if (result.updated) results.updated++;
        else if (result.skipped) results.skipped++;
        
      } catch (error) {
        console.error(`  ❌ Failed to sync "${workflow.name}": ${error.message}`);
        results.failed++;
      }
    }
    
    // Step 4: Summary
    console.log('\n🎉 Sync completed!');
    console.log(`📊 Summary:`);
    console.log(`   Created: ${results.created}`);
    console.log(`   Updated: ${results.updated}`);
    console.log(`   Skipped: ${results.skipped}`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Total: ${sourceWorkflows.length}`);
    
    // Save sync report
    const reportFile = `sync-report-${fromEnv}-to-${toEnv}-${Date.now()}.json`;
    const report = {
      timestamp: new Date().toISOString(),
      from: fromEnv,
      to: toEnv,
      results,
      sourceCount: sourceWorkflows.length,
      targetCount: targetWorkflows.length
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`💾 Sync report saved to: ${reportFile}`);
    
  } catch (error) {
    console.error(`❌ Sync failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the sync
syncWorkflows();
