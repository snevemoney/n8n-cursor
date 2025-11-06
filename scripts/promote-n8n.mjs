#!/usr/bin/env node
/**
 * n8n Workflow Promotion Script
 * Promotes workflows between different n8n environments
 * 
 * Usage:
 *   node scripts/promote-n8n.mjs --from local --to production --name "Workflow Name"
 *   node scripts/promote-n8n.mjs --from local --to production --id <WORKFLOW_ID>
 *   node scripts/promote-n8n.mjs --from local --to production --name "Workflow Name" --activate
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
const workflowId = argv.get('id');
const workflowName = argv.get('name');
const activate = !!argv.get('activate');

if (!fromEnv || !toEnv) {
  console.error('❌ Missing required arguments: --from <environment> --to <environment>');
  console.error('Example: node scripts/promote-n8n.mjs --from local --to production --name "My Workflow"');
  process.exit(1);
}

if (!workflowId && !workflowName) {
  console.error('❌ Missing workflow identifier: --id <ID> or --name "Name"');
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
  console.error('Make sure environment variables are set (e.g., N8N_LOCAL_BASE_URL, N8N_LOCAL_API_KEY)');
  process.exit(1);
}

if (!targetEnv || !targetEnv.baseUrl || !targetEnv.apiKey) {
  console.error(`❌ Invalid target environment: ${toEnv}`);
  console.error('Make sure environment variables are set (e.g., N8N_PRD_BASE_URL, N8N_PRD_API_KEY)');
  process.exit(1);
}

console.log(`🚀 Promoting workflow from ${fromEnv} to ${toEnv}`);
console.log(`Source: ${sourceEnv.baseUrl}${sourceEnv.apiPath}`);
console.log(`Target: ${targetEnv.baseUrl}${targetEnv.apiPath}`);

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

// Find workflow in source environment
async function findSourceWorkflow() {
  if (workflowId) {
    console.log(`🔍 Fetching workflow by ID: ${workflowId}`);
    return await n8nApiCall(sourceEnv, `/workflows/${encodeURIComponent(workflowId)}`);
  }
  
  if (workflowName) {
    console.log(`🔍 Searching for workflow by name: "${workflowName}"`);
    const workflows = await n8nApiCall(sourceEnv, '/workflows');
    const workflowList = workflows.data || workflows;
    const found = workflowList.find(w => w.name === workflowName);
    
    if (!found) {
      throw new Error(`Workflow named "${workflowName}" not found in ${fromEnv}`);
    }
    
    console.log(`✅ Found workflow: ${found.name} (ID: ${found.id})`);
    return await n8nApiCall(sourceEnv, `/workflows/${encodeURIComponent(found.id)}`);
  }
}

// Sanitize workflow for promotion
function sanitizeWorkflow(workflow, fromEnv, toEnv) {
  console.log('🧹 Sanitizing workflow for promotion...');
  
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
        const envPrefix = process.env[`PROMOTE_${toEnv.toUpperCase()}_WEBHOOK_PREFIX`];
        if (envPrefix) {
          const currentPath = String(node.parameters.path);
          if (!currentPath.startsWith(envPrefix)) {
            node.parameters.path = `${envPrefix}${currentPath}`;
            console.log(`  📝 Updated webhook path: ${currentPath} -> ${node.parameters.path}`);
          }
        }
      }
      
      // Handle HTTP Request URLs (replace base URLs if configured)
      if (node.type?.includes('httpRequest') && node.parameters?.url) {
        const replaceBase = process.env[`PROMOTE_${toEnv.toUpperCase()}_REPLACE_BASE`];
        const withBase = process.env[`PROMOTE_${toEnv.toUpperCase()}_WITH_BASE`];
        
        if (replaceBase && withBase && typeof node.parameters.url === 'string') {
          if (node.parameters.url.startsWith(replaceBase)) {
            const oldUrl = node.parameters.url;
            node.parameters.url = withBase + node.parameters.url.slice(replaceBase.length);
            console.log(`  🌐 Updated HTTP URL: ${oldUrl} -> ${node.parameters.url}`);
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
  
  // Keep connections as-is
  console.log('✅ Workflow sanitized successfully');
  return sanitized;
}

// Validate credentials exist in target environment
async function validateCredentials(workflow, targetEnv) {
  console.log('🔐 Validating credentials in target environment...');
  
  if (!workflow.nodes) return;
  
  const requiredCredentials = new Set();
  
  for (const node of workflow.nodes) {
    if (node.credentials) {
      for (const [credType, cred] of Object.entries(node.credentials)) {
        if (cred && cred.name) {
          requiredCredentials.add(cred.name);
        }
      }
    }
  }
  
  if (requiredCredentials.size === 0) {
    console.log('✅ No credentials required');
    return;
  }
  
  console.log(`🔍 Checking ${requiredCredentials.size} required credentials...`);
  
  try {
    const targetCredentials = await n8nApiCall(targetEnv, '/credentials');
    const credList = targetCredentials.data || targetCredentials;
    
    for (const credName of requiredCredentials) {
      const exists = credList.some(c => c.name === credName);
      if (exists) {
        console.log(`  ✅ ${credName}`);
      } else {
        console.log(`  ❌ ${credName} - MISSING`);
        console.warn(`⚠️  Credential "${credName}" not found in ${toEnv}. You may need to create it manually.`);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not validate credentials: ${error.message}`);
  }
}

// Create workflow in target environment
async function createTargetWorkflow(sanitizedWorkflow, targetEnv) {
  console.log(`🚀 Creating workflow in ${toEnv}...`);
  
  const createData = {
    name: sanitizedWorkflow.name,
    nodes: sanitizedWorkflow.nodes,
    connections: sanitizedWorkflow.connections || {},
    active: false // Start inactive for safety
  };
  
  const created = await n8nApiCall(targetEnv, '/workflows', 'POST', createData);
  const newId = created.id || created.data?.id;
  
  if (!newId) {
    throw new Error('Failed to get new workflow ID from response');
  }
  
  console.log(`✅ Workflow created successfully in ${toEnv} with ID: ${newId}`);
  return newId;
}

// Activate workflow if requested
async function activateWorkflow(workflowId, targetEnv) {
  if (!activate) return;
  
  console.log(`🔓 Activating workflow ${workflowId}...`);
  await n8nApiCall(targetEnv, `/workflows/${workflowId}`, 'PATCH', { active: true });
  console.log(`✅ Workflow activated successfully`);
}

// Main promotion process
async function promoteWorkflow() {
  try {
    // Step 1: Find source workflow
    const sourceWorkflow = await findSourceWorkflow();
    console.log(`📋 Source workflow: ${sourceWorkflow.name} (${sourceWorkflow.nodes?.length || 0} nodes)`);
    
    // Step 2: Sanitize workflow
    const sanitizedWorkflow = sanitizeWorkflow(sourceWorkflow, fromEnv, toEnv);
    
    // Step 3: Validate credentials
    await validateCredentials(sanitizedWorkflow, targetEnv);
    
    // Step 4: Create in target environment
    const newWorkflowId = await createTargetWorkflow(sanitizedWorkflow, targetEnv);
    
    // Step 5: Activate if requested
    await activateWorkflow(newWorkflowId, targetEnv);
    
    // Step 6: Success summary
    console.log('\n🎉 Workflow promotion completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   From: ${fromEnv} (${sourceWorkflow.name})`);
    console.log(`   To: ${toEnv} (ID: ${newWorkflowId})`);
    console.log(`   Status: ${activate ? 'Active' : 'Inactive'}`);
    console.log(`   Nodes: ${sanitizedWorkflow.nodes?.length || 0}`);
    
    // Optional: Save sanitized workflow to file
    const outputFile = `workflow-${fromEnv}-to-${toEnv}-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(sanitizedWorkflow, null, 2));
    console.log(`💾 Sanitized workflow saved to: ${outputFile}`);
    
  } catch (error) {
    console.error(`❌ Promotion failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the promotion
promoteWorkflow();
