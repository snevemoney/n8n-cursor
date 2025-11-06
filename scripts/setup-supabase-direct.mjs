#!/usr/bin/env node

/**
 * Direct Supabase Database Setup
 * 
 * Attempts to create the database structure using Supabase client methods
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://xlrxpfptulcugoqjccyf.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_9aSbJTovjd0XFH5hz1qB2A_AS5wmDpx';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabaseDirect() {
  console.log('🚀 Setting up Depreciation Radar using direct methods...');
  console.log(`📡 Connecting to: ${SUPABASE_URL}`);
  
  try {
    // Test connection first
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

    // Try to create the table using a different approach
    console.log('🔧 Attempting to create table structure...');
    
    // Method 1: Try to create a simple table first
    try {
      console.log('📝 Creating radar_snapshots table...');
      
      // We'll try to insert data and let Supabase create the table structure
      const { data: insertData, error: insertError } = await supabase
        .from('radar_snapshots')
        .insert({
          depreciation_score: 75,
          stale_workflows_count: 2,
          credential_issues_count: 2,
          deadletters_backlog_count: 2,
          jobs_bloat_count: 2,
          stale_invoices_count: 2,
          memory_bloat_count: 2,
          tenant_throttle_hits_count: 2
        })
        .select();

      if (insertError) {
        console.log(`⚠️  Table creation failed: ${insertError.message}`);
        console.log('💡 This means we need to create the table manually');
        
        // Provide manual instructions
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('1. Go to: https://supabase.com/dashboard/project/xlrxpfptulcugoqjccyf');
        console.log('2. Click: "SQL Editor" (left sidebar)');
        console.log('3. Click: "New query"');
        console.log('4. Copy and paste the SQL script I provided');
        console.log('5. Click: "Run"');
        
        return;
      } else {
        console.log('✅ Table created and data inserted successfully!');
      }

    } catch (createError) {
      console.log(`❌ Table creation error: ${createError.message}`);
      console.log('💡 Manual setup required');
    }

    console.log('🎉 Setup attempt complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('💡 Manual setup required in Supabase dashboard');
  }
}

// Run the setup
setupDatabaseDirect().catch(console.error);

