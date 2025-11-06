#!/usr/bin/env node

/**
 * Supabase Schema Management Setup
 * 
 * Attempts to create database structure using schema management
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://xlrxpfptulcugoqjccyf.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_9aSbJTovjd0XFH5hz1qB2A_AS5wmDpx';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupSchema() {
  console.log('🚀 Attempting Schema Management Setup...');
  console.log(`📡 Connecting to: ${SUPABASE_URL}`);
  
  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('radar_snapshots')
      .select('count')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('✅ Connection successful (table does not exist yet)');
    } else if (testData) {
      console.log('✅ Connection successful (table already exists)');
      return;
    }

    // Try to create a simple test table first
    console.log('🔧 Attempting to create test table...');
    
    try {
      // Try to create a minimal table structure
      const { data: createData, error: createError } = await supabase
        .from('test_table')
        .insert({ test_column: 'test_value' })
        .select();

      if (createError) {
        console.log(`⚠️  Test table creation failed: ${createError.message}`);
      } else {
        console.log('✅ Test table created successfully!');
        
        // Clean up test table
        await supabase.from('test_table').delete().eq('test_column', 'test_value');
        console.log('🧹 Test table cleaned up');
      }
    } catch (testError) {
      console.log(`❌ Test table creation error: ${testError.message}`);
    }

    // Since we can't create tables programmatically, let's provide the easiest possible manual setup
    console.log('\n📋 EASIEST MANUAL SETUP:');
    console.log('1. Open this URL: https://supabase.com/dashboard/project/xlrxpfptulcugoqjccyf');
    console.log('2. Click "SQL Editor" (left sidebar)');
    console.log('3. Click "New query"');
    console.log('4. Copy this SQL and paste it:');
    console.log('\n' + '='.repeat(60));
    
    const sqlScript = `-- Quick Depreciation Radar Setup
CREATE TABLE IF NOT EXISTS radar_snapshots (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    depreciation_score INTEGER,
    stale_workflows_count INTEGER,
    credential_issues_count INTEGER,
    deadletters_backlog_count INTEGER,
    jobs_bloat_count INTEGER,
    stale_invoices_count INTEGER,
    memory_bloat_count INTEGER,
    tenant_throttle_hits_count INTEGER
);

INSERT INTO radar_snapshots (
    depreciation_score, stale_workflows_count, credential_issues_count,
    deadletters_backlog_count, jobs_bloat_count, stale_invoices_count,
    memory_bloat_count, tenant_throttle_hits_count
) VALUES (75, 2, 2, 2, 2, 2, 2, 2);

SELECT 'Setup Complete!' as status;`;
    
    console.log(sqlScript);
    console.log('='.repeat(60));
    console.log('\n5. Click "Run"');
    console.log('6. Come back here and tell me "done"');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupSchema().catch(console.error);

