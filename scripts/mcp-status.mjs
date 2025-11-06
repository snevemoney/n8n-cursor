#!/usr/bin/env node
/**
 * MCP Server Status Checker
 * Shows which MCP servers are enabled and their configuration status
 */

import fs from 'fs';
import path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

// MCP server configurations
const mcpServers = [
  {
    name: 'n8n-local',
    enabled: envVars.N8N_LOCAL_ENABLED,
    baseUrl: envVars.N8N_LOCAL_BASE_URL,
    apiKey: envVars.N8N_LOCAL_API_KEY,
    status: 'local'
  },
  {
    name: 'n8n-integration',
    enabled: envVars.N8N_INT_ENABLED,
    baseUrl: envVars.N8N_INT_BASE_URL,
    apiKey: envVars.N8N_INT_API_KEY,
    status: 'integration'
  },
  {
    name: 'n8n-testing',
    enabled: envVars.N8N_TEST_ENABLED,
    baseUrl: envVars.N8N_TEST_BASE_URL,
    apiKey: envVars.N8N_TEST_API_KEY,
    status: 'testing'
  },
  {
    name: 'n8n-staging',
    enabled: envVars.N8N_STG_ENABLED,
    baseUrl: envVars.N8N_STG_BASE_URL,
    apiKey: envVars.N8N_STG_API_KEY,
    status: 'staging'
  },
  {
    name: 'n8n-production',
    enabled: envVars.N8N_PRD_ENABLED,
    baseUrl: envVars.N8N_PRD_BASE_URL,
    apiKey: envVars.N8N_PRD_API_KEY,
    status: 'production'
  },
  {
    name: 'brave-search',
    enabled: envVars.BRAVE_ENABLED,
    apiKey: envVars.BRAVE_API_KEY,
    status: 'external'
  },
  {
    name: 'n8n-assistant',
    enabled: envVars.N8N_ASSISTANT_ENABLED,
    apiKey: envVars.SMITHERY_ASSISTANT_KEY,
    status: 'external'
  }
];

console.log('🔧 MCP Server Status Report');
console.log('=' .repeat(50));

mcpServers.forEach(server => {
  const isEnabled = server.enabled === '1' || server.enabled === 'true';
  const hasConfig = server.baseUrl || server.apiKey;
  
  let status = '❌ Disabled';
  if (isEnabled) {
    if (hasConfig && hasConfig !== 'your_api_key_here' && hasConfig !== 'your_base_url_here') {
      status = '✅ Enabled & Configured';
    } else if (hasConfig) {
      status = '⚠️  Enabled but Missing Config';
    } else {
      status = '❌ Enabled but No Config';
    }
  }
  
  console.log(`${server.name}: ${status}`);
  
  if (isEnabled && server.baseUrl) {
    console.log(`  URL: ${server.baseUrl}`);
  }
  
  if (isEnabled && server.apiKey && server.apiKey !== 'your_api_key_here') {
    console.log(`  API Key: ${server.apiKey.substring(0, 20)}...`);
  } else if (isEnabled && server.apiKey) {
    console.log(`  API Key: ❌ Not configured`);
  }
  
  console.log('');
});

console.log('💡 To fix issues:');
console.log('1. Set ENABLED=1 for servers you want active');
console.log('2. Configure BASE_URL and API_KEY for n8n servers');
console.log('3. Configure API_KEY for external services');
console.log('4. Restart Cursor to refresh MCP servers');

// Check for common issues
const issues = [];
mcpServers.forEach(server => {
  if (server.enabled === '1' && server.apiKey === 'your_api_key_here') {
    issues.push(`${server.name} is enabled but has placeholder API key`);
  }
  if (server.enabled === '1' && server.baseUrl === 'your_base_url_here') {
    issues.push(`${server.name} is enabled but has placeholder base URL`);
  }
});

if (issues.length > 0) {
  console.log('\n🚨 Issues Found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
}
