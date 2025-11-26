#!/usr/bin/env node

/**
 * Depreciation Radar Audit Script
 * 
 * This script runs depreciation checks and fails CI if thresholds are exceeded.
 * It can work with either Supabase or local PostgreSQL databases.
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

// Configuration
const ENV = process.argv[2] || 'local';
const THRESHOLDS = {
  local: {
    depreciation_score: 80,
    stale_workflows: 5,
    credential_issues: 3,
    deadletters_backlog: 10,
    jobs_bloat: 5,
    stale_invoices: 5,
    memory_bloat: 3,
    tenant_throttle_hits: 5
  },
  staging: {
    depreciation_score: 70,
    stale_workflows: 3,
    credential_issues: 2,
    deadletters_backlog: 5,
    jobs_bloat: 3,
    stale_invoices: 3,
    memory_bloat: 2,
    tenant_throttle_hits: 3
  },
  production: {
    depreciation_score: 60,
    stale_workflows: 2,
    credential_issues: 1,
    deadletters_backlog: 3,
    jobs_bloat: 2,
    stale_invoices: 2,
    memory_bloat: 1,
    tenant_throttle_hits: 2
  }
};

// Database connection functions
async function connectToSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

async function connectToLocalPostgres() {
  const client = new pg.Client({
    host: 'localhost',
    port: 5433,
    database: 'lightningflow_monitoring',
    user: 'lightningflow',
    password: 'lightningflow2024'
  });
  
  await client.connect();
  return client;
}

async function queryDatabase(client, query, isSupabase = false) {
  try {
    if (isSupabase) {
      const { data, error } = await client.rpc('exec_sql', { sql_query: query });
      if (error) throw error;
      return data;
    } else {
      const result = await client.query(query);
      return result.rows;
    }
  } catch (error) {
    console.error(`❌ Database query failed: ${error.message}`);
    return [];
  }
}

// Main audit function
async function runAudit() {
  console.log(`🔍 Running Depreciation Radar Audit for ${ENV.toUpperCase()} environment...`);
  
  let client;
  let isSupabase = false;
  
  try {
    // Try Supabase first, fallback to local
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      console.log('📡 Connecting to Supabase...');
      client = await connectToSupabase();
      isSupabase = true;
    } else {
      console.log('🏠 Connecting to local PostgreSQL...');
      client = await connectToLocalPostgres();
    }
    
    const threshold = THRESHOLDS[ENV] || THRESHOLDS.local;
    console.log(`📊 Using thresholds:`, threshold);
    
    // Run depreciation checks
    const results = await runDepreciationChecks(client, isSupabase);
    
    // Calculate depreciation score
    const depreciationScore = calculateDepreciationScore(results, threshold);
    
    // Display results
    displayResults(results, depreciationScore, threshold);
    
    // Check if we should fail CI
    if (depreciationScore > threshold.depreciation_score) {
      console.log(`❌ Depreciation score ${depreciationScore} exceeds threshold ${threshold.depreciation_score}`);
      console.log('🚨 CI will fail - depreciation issues detected!');
      process.exit(2);
    } else {
      console.log(`✅ Depreciation score ${depreciationScore} is within acceptable range`);
      console.log('🎉 All checks passed!');
    }
    
  } catch (error) {
    console.error(`❌ Audit failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (client && !isSupabase) {
      await client.end();
    }
  }
}

async function runDepreciationChecks(client, isSupabase) {
  const checks = [
    { name: 'stale_workflows', query: 'SELECT COUNT(*) as count FROM v_stale_workflows;' },
    { name: 'credential_issues', query: 'SELECT COUNT(*) as count FROM v_credential_issues;' },
    { name: 'deadletters_backlog', query: 'SELECT COUNT(*) as count FROM v_deadletters_backlog;' },
    { name: 'jobs_bloat', query: 'SELECT COUNT(*) as count FROM v_jobs_bloat;' },
    { name: 'stale_invoices', query: 'SELECT COUNT(*) as count FROM v_invoices_stale;' },
    { name: 'memory_bloat', query: 'SELECT COUNT(*) as count FROM v_memory_bloat;' },
    { name: 'tenant_throttle_hits', query: 'SELECT COUNT(*) as count FROM v_tenant_throttle_hit;' }
  ];
  
  const results = {};
  
  for (const check of checks) {
    try {
      const data = await queryDatabase(client, check.query, isSupabase);
      results[check.name] = parseInt(data[0]?.count || 0);
    } catch (error) {
      console.warn(`⚠️  Warning: Could not check ${check.name}: ${error.message}`);
      results[check.name] = 0;
    }
  }
  
  return results;
}

function calculateDepreciationScore(results, threshold) {
  let score = 0;
  let maxScore = 0;
  
  for (const [key, count] of Object.entries(results)) {
    const thresholdValue = threshold[key] || 0;
    maxScore += thresholdValue;
    
    if (count > thresholdValue) {
      score += Math.min(count, thresholdValue * 2); // Cap penalty at 2x threshold
    }
  }
  
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

function displayResults(results, depreciationScore, threshold) {
  console.log('\n📊 Depreciation Radar Results:');
  console.log('=' .repeat(50));
  
  for (const [key, count] of Object.entries(results)) {
    const thresholdValue = threshold[key] || 0;
    const status = count <= thresholdValue ? '✅' : '❌';
    const keyName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    console.log(`${status} ${keyName}: ${count}/${thresholdValue}`);
  }
  
  console.log('=' .repeat(50));
  console.log(`🎯 Overall Depreciation Score: ${depreciationScore}/100`);
  console.log(`📏 Threshold: ${threshold.depreciation_score}/100`);
}

// Run the audit
runAudit().catch(console.error);
