#!/usr/bin/env node

/**
 * Simple Supabase Depreciation Radar Setup
 * 
 * Uses Supabase client methods instead of RPC calls
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://xlrxpfptulcugoqjccyf.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_9aSbJTovjd0XFH5hz1qB2A_AS5wmDpx';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupSimple() {
  console.log('🚀 Setting up Depreciation Radar in Supabase (Simple Method)...');
  console.log(`📡 Connecting to: ${SUPABASE_URL}`);
  
  try {
    // Test basic connection
    console.log('🔍 Testing basic connection...');
    
    // Try to create a simple test record
    const { data, error } = await supabase
      .from('radar_snapshots')
      .insert([
        {
          depreciation_score: 75,
          stale_workflows_count: 2,
          credential_issues_count: 2,
          deadletters_backlog_count: 2,
          jobs_bloat_count: 2,
          stale_invoices_count: 2,
          memory_bloat_count: 2,
          tenant_throttle_hits_count: 2
        }
      ])
      .select();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Table does not exist. Creating it...');
        
        // Since we can't create tables via the client, we need to do it manually
        console.log('\n🔧 MANUAL SETUP REQUIRED:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ngxzcpmgw-wgfehl9vje2a');
        console.log('2. Click on "SQL Editor" in the left sidebar');
        console.log('3. Copy and paste this SQL:');
        console.log('\n' + '='.repeat(60));
        console.log('CREATE TABLE IF NOT EXISTS radar_snapshots (');
        console.log('  id SERIAL PRIMARY KEY,');
        console.log('  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  depreciation_score INTEGER,');
        console.log('  stale_workflows_count INTEGER,');
        console.log('  credential_issues_count INTEGER,');
        console.log('  deadletters_backlog_count INTEGER,');
        console.log('  jobs_bloat_count INTEGER,');
        console.log('  stale_invoices_count INTEGER,');
        console.log('  memory_bloat_count INTEGER,');
        console.log('  tenant_throttle_hits_count INTEGER');
        console.log(');');
        console.log('\n-- Insert demo data');
        console.log('INSERT INTO radar_snapshots (');
        console.log('  depreciation_score, stale_workflows_count, credential_issues_count,');
        console.log('  deadletters_backlog_count, jobs_bloat_count, stale_invoices_count,');
        console.log('  memory_bloat_count, tenant_throttle_hits_count');
        console.log(') VALUES (75, 2, 2, 2, 2, 2, 2, 2);');
        console.log('='.repeat(60));
        
        console.log('\n4. Click "Run" to execute the SQL');
        console.log('5. Come back here and run this script again');
        
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    } else {
      console.log('✅ Successfully inserted test data!');
      console.log('📊 Data:', data);
      
      // Now let's create the views
      console.log('\n📝 Creating views...');
      await createViews();
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Please check your internet connection and try again');
  }
}

async function createViews() {
  console.log('🔧 Creating views via RPC...');
  
  const viewSQL = `
    CREATE OR REPLACE VIEW v_stale_workflows AS
    SELECT 'demo-workflow-1' as workflow_id, 'Demo Workflow 1' as workflow_name, '2024-01-01'::date as last_run, 'stale' as status
    UNION ALL
    SELECT 'demo-workflow-2' as workflow_id, 'Demo Workflow 2' as workflow_name, '2024-01-15'::date as last_run, 'stale' as status;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: viewSQL });
    if (error) {
      console.log(`⚠️  View creation failed: ${error.message}`);
      console.log('🔧 You may need to create views manually in the SQL Editor');
    } else {
      console.log('✅ Views created successfully!');
    }
  } catch (error) {
    console.log(`⚠️  RPC call failed: ${error.message}`);
    console.log('🔧 Please create views manually in the SQL Editor');
  }
}

// Run the setup
setupSimple().catch(console.error);
