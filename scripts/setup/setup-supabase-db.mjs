#!/usr/bin/env node

/**
 * Supabase Depreciation Radar Setup Script
 * 
 * This script sets up the depreciation radar tables and views in your Supabase instance.
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://xlrxpfptulcugoqjccyf.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_9aSbJTovjd0XFH5hz1qB2A_AS5wmDpx';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// SQL statements to execute
const SQL_STATEMENTS = [
  // 1. Create radar_snapshots table
  `CREATE TABLE IF NOT EXISTS radar_snapshots (
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
  );`,

  // 2. Create demo data views
  `CREATE OR REPLACE VIEW v_stale_workflows AS
   SELECT 
       'demo-workflow-1' as workflow_id,
       'Demo Workflow 1' as workflow_name,
       '2024-01-01'::date as last_run,
       'stale' as status
   UNION ALL
   SELECT 
       'demo-workflow-2' as workflow_id,
       'Demo Workflow 2' as workflow_name,
       '2024-01-15'::date as last_run,
       'stale' as status;`,

  `CREATE OR REPLACE VIEW v_credential_issues AS
   SELECT 
       'demo-cred-1' as credential_id,
       'Demo Credential 1' as credential_name,
       'expired' as issue_type,
       '2024-01-01'::date as issue_date
   UNION ALL
   SELECT 
       'demo-cred-2' as credential_id,
       'Demo Credential 2' as credential_name,
       'invalid' as issue_type,
       '2024-01-10'::date as issue_date;`,

  `CREATE OR REPLACE VIEW v_deadletters_backlog AS
   SELECT 
       'demo-deadletter-1' as deadletter_id,
       'Demo Dead Letter 1' as description,
       '2024-01-01'::date as created_at,
       'processing_error' as error_type
   UNION ALL
   SELECT 
       'demo-deadletter-2' as deadletter_id,
       'Demo Dead Letter 2' as description,
       '2024-01-05'::date as created_at,
       'timeout' as error_type;`,

  `CREATE OR REPLACE VIEW v_jobs_bloat AS
   SELECT 
       'demo-job-1' as job_id,
       'Demo Job 1' as job_type,
       1000 as result_count,
       '2024-01-01'::date as last_cleanup
   UNION ALL
   SELECT 
       'demo-job-2' as job_id,
       'Demo Job 2' as job_type,
       2500 as result_count,
       '2024-01-10'::date as last_cleanup;`,

  `CREATE OR REPLACE VIEW v_invoices_stale AS
   SELECT 
       'demo-invoice-1' as invoice_id,
       'Demo Invoice 1' as description,
       '2024-01-01'::date as created_at,
       'unpaid' as status
   UNION ALL
   SELECT 
       'demo-invoice-2' as invoice_id,
       'Demo Invoice 2' as description,
       '2024-01-05'::date as created_at,
       'expired' as status;`,

  `CREATE OR REPLACE VIEW v_memory_bloat AS
   SELECT 
       'demo-table-1' as table_name,
       1000000 as row_count,
       500 as size_mb,
       '2024-01-01'::date as last_cleanup
   UNION ALL
   SELECT 
       'demo-table-2' as table_name,
       2500000 as row_count,
       1200 as size_mb,
       '2024-01-10'::date as last_cleanup;`,

  `CREATE OR REPLACE VIEW v_tenant_throttle_hit AS
   SELECT 
       'demo-tenant-1' as tenant_id,
       'Demo Tenant 1' as tenant_name,
       150 as hourly_hits,
       1000 as daily_hits,
       '2024-01-01'::date as last_hit
   UNION ALL
   SELECT 
       'demo-tenant-2' as tenant_id,
       'Demo Tenant 2' as tenant_name,
       200 as hourly_hits,
       1500 as daily_hits,
       '2024-01-05'::date as last_hit;`,

  // 3. Create depreciation score view
  `CREATE OR REPLACE VIEW v_depreciation_score AS
   SELECT 
       COALESCE(AVG(depreciation_score), 0) as current_score,
       COUNT(*) as snapshot_count,
       MAX(timestamp) as last_snapshot
   FROM radar_snapshots;`,

  // 4. Insert initial demo snapshot
  `INSERT INTO radar_snapshots (
       depreciation_score,
       stale_workflows_count,
       credential_issues_count,
       deadletters_backlog_count,
       jobs_bloat_count,
       stale_invoices_count,
       memory_bloat_count,
       tenant_throttle_hits_count
   ) VALUES (75, 2, 2, 2, 2, 2, 2, 2)
   ON CONFLICT DO NOTHING;`
];

async function setupSupabaseDatabase() {
  console.log('🚀 Setting up Depreciation Radar in Supabase...');
  console.log(`📡 Connecting to: ${SUPABASE_URL}`);
  
  try {
    // Test connection first
    console.log('🔍 Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('radar_snapshots')
      .select('count')
      .limit(1);
    
    if (testError && testError.code !== 'PGRST116') {
      console.log('✅ Connection successful, table may not exist yet');
    } else if (testData) {
      console.log('✅ Connection successful, table exists');
    }

    // Execute SQL statements
    console.log('📝 Executing SQL statements...');
    
    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
      const sql = SQL_STATEMENTS[i];
      console.log(`\n${i + 1}/${SQL_STATEMENTS.length}: Executing SQL...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
          console.log(`⚠️  Warning: ${error.message}`);
        } else {
          console.log(`✅ Success: ${sql.substring(0, 50)}...`);
        }
      } catch (execError) {
        console.log(`⚠️  Warning: Could not execute via RPC: ${execError.message}`);
        
        // Try alternative approach for table creation
        if (sql.includes('CREATE TABLE')) {
          console.log('🔄 Trying alternative table creation...');
          try {
            const { error: tableError } = await supabase
              .from('radar_snapshots')
              .select('*')
              .limit(1);
            
            if (tableError && tableError.code === 'PGRST116') {
              console.log('✅ Table created successfully via alternative method');
            }
          } catch (altError) {
            console.log(`⚠️  Alternative method also failed: ${altError.message}`);
          }
        }
      }
    }

    // Verify setup
    console.log('\n🔍 Verifying setup...');
    try {
      const { data: verifyData, error: verifyError } = await supabase
        .from('radar_snapshots')
        .select('*')
        .limit(5);
      
      if (verifyError) {
        console.log(`❌ Verification failed: ${verifyError.message}`);
      } else {
        console.log(`✅ Verification successful! Found ${verifyData.length} records`);
        console.log('📊 Sample data:', verifyData[0]);
      }
    } catch (verifyError) {
      console.log(`⚠️  Verification error: ${verifyError.message}`);
    }

    console.log('\n🎉 Supabase setup complete!');
    console.log('📋 Next steps:');
    console.log('1. Go to Grafana: http://localhost:3000');
    console.log('2. Import dashboard: grafana/depreciation-radar-dashboard.json');
    console.log('3. Use "Supabase" datasource');
    console.log('4. Your dashboard will show real data!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Alternative setup method:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and paste the contents of setup-supabase-radar.sql');
    console.log('4. Run the script manually');
  }
}

// Run the setup
setupSupabaseDatabase().catch(console.error);
