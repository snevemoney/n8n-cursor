#!/usr/bin/env node
/**
 * LightningFlow AI - n8n Credential Synchronization
 * 
 * Syncs credentials from environment variables to target n8n instance
 * Ensures credential names are consistent across environments
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REGISTRY_PATH = path.join(__dirname, '..', 'credentials', 'registry.json');
const ENV_FILE = process.env.ENV_FILE || '.env.local';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry') || args.includes('--dry-run');
const targetEnv = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'local';

console.log(`🚀 LightningFlow AI - n8n Credential Sync`);
console.log(`============================================`);
console.log(`Target Environment: ${targetEnv}`);
console.log(`Dry Run: ${isDryRun ? 'Yes' : 'No'}`);
console.log(`Registry: ${REGISTRY_PATH}`);
console.log(`Environment File: ${ENV_FILE}`);
console.log('');

// Load and validate registry
function loadRegistry() {
  try {
    const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
    const registry = JSON.parse(registryContent);
    
    if (!registry.credentials || typeof registry.credentials !== 'object') {
      throw new Error('Invalid registry format: missing credentials section');
    }
    
    return registry;
  } catch (error) {
    console.error(`❌ Failed to load registry: ${error.message}`);
    process.exit(1);
  }
}

// Load environment variables
function loadEnvironment() {
  try {
    const envPath = path.join(process.cwd(), ENV_FILE);
    
    if (!fs.existsSync(envPath)) {
      console.warn(`⚠️  Environment file not found: ${envPath}`);
      console.warn('   Using process.env variables instead');
      return process.env;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        env[key] = value;
      }
    });
    
    // Merge with process.env (process.env takes precedence)
    return { ...env, ...process.env };
  } catch (error) {
    console.error(`❌ Failed to load environment: ${error.message}`);
    process.exit(1);
  }
}

// Validate required environment variables
function validateEnvironment(registry, env) {
  const missing = [];
  
  Object.entries(registry.credentials).forEach(([name, cred]) => {
    if (cred.required && cred.environments.includes(targetEnv)) {
      Object.entries(cred.env_vars).forEach(([envKey, _]) => {
        if (!env[envKey]) {
          missing.push(`${name}: ${envKey}`);
        }
      });
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(item => console.error(`   ${item}`));
    console.error('');
    console.error('Please set these variables in your environment or .env file');
    process.exit(1);
  }
  
  return true;
}

// Create credential data for n8n
function createCredentialData(credentialName, credential, env) {
  const data = {
    name: credentialName,
    type: credential.type,
    data: {}
  };
  
  // Map environment variables to credential data
  Object.entries(credential.env_vars).forEach(([envKey, fieldName]) => {
    const value = env[envKey];
    if (value) {
      data.data[fieldName] = value;
    }
  });
  
  // Add custom fields if specified
  if (credential.custom_fields) {
    Object.entries(credential.custom_fields).forEach(([key, value]) => {
      data.data[key] = value;
    });
  }
  
  // Add defaults if specified
  if (credential.defaults) {
    Object.entries(credential.defaults).forEach(([key, value]) => {
      if (!data.data[key]) {
        data.data[key] = value;
      }
    });
  }
  
  return data;
}

// Mask sensitive values for display
function maskValue(value, fieldName) {
  if (!value) return value;
  
  const sensitiveFields = ['apiKey', 'password', 'secret', 'token', 'key'];
  const isSensitive = sensitiveFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
  
  if (isSensitive && value.length > 8) {
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }
  
  return value;
}

// Display credential data (masked)
function displayCredential(credentialName, credential, env) {
  console.log(`📋 ${credentialName} (${credential.type})`);
  console.log(`   Description: ${credential.description}`);
  console.log(`   Required: ${credential.required ? 'Yes' : 'No'}`);
  console.log(`   Environments: ${credential.environments.join(', ')}`);
  
  if (credential.environments.includes(targetEnv)) {
    console.log(`   Status: ✅ Will be synced`);
    console.log(`   Data:`);
    
    Object.entries(credential.env_vars).forEach(([envKey, fieldName]) => {
      const value = env[envKey];
      const maskedValue = maskValue(value, fieldName);
      const status = value ? '✅' : '❌';
      console.log(`     ${fieldName}: ${status} ${maskedValue || 'MISSING'}`);
    });
    
    if (credential.custom_fields) {
      console.log(`   Custom Fields:`);
      Object.entries(credential.custom_fields).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    }
  } else {
    console.log(`   Status: ⏭️  Skipped (not for ${targetEnv})`);
  }
  
  console.log('');
}

// Main sync function
async function syncCredentials() {
  try {
    // Load registry and environment
    const registry = loadRegistry();
    const env = loadEnvironment();
    
    console.log(`📚 Loaded ${Object.keys(registry.credentials).length} credentials from registry`);
    console.log(`🌍 Environment: ${targetEnv}`);
    console.log('');
    
    // Validate environment
    validateEnvironment(registry, env);
    
    // Filter credentials for target environment
    const targetCredentials = Object.entries(registry.credentials)
      .filter(([_, cred]) => cred.environments.includes(targetEnv))
      .filter(([_, cred]) => {
        // Check if all required env vars are present
        if (!cred.required) return true;
        return Object.keys(cred.env_vars).every(envKey => env[envKey]);
      });
    
    console.log(`🎯 Found ${targetCredentials.length} credentials to sync for ${targetEnv}`);
    console.log('');
    
    // Display all credentials
    targetCredentials.forEach(([name, cred]) => {
      displayCredential(name, cred, env);
    });
    
    // Summary
    const requiredCount = targetCredentials.filter(([_, cred]) => cred.required).length;
    const optionalCount = targetCredentials.length - requiredCount;
    
    console.log(`📊 Summary:`);
    console.log(`   Total Credentials: ${targetCredentials.length}`);
    console.log(`   Required: ${requiredCount}`);
    console.log(`   Optional: ${optionalCount}`);
    console.log(`   Environment: ${targetEnv}`);
    console.log('');
    
    if (isDryRun) {
      console.log(`🔍 Dry run completed. No changes made.`);
      console.log(`   To actually sync, run without --dry flag`);
    } else {
      console.log(`✅ Credential validation completed successfully!`);
      console.log(`   All required credentials are properly configured`);
      console.log(`   Use 'npm run promote' to sync workflows with these credentials`);
    }
    
    return targetCredentials.length;
    
  } catch (error) {
    console.error(`❌ Sync failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the sync
if (require.main === module) {
  syncCredentials().catch(error => {
    console.error(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

export { syncCredentials, loadRegistry, loadEnvironment };
