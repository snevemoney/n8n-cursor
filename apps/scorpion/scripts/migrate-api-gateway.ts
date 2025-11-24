#!/usr/bin/env tsx
/**
 * API Gateway Database Migration Script
 * Creates API Gateway tables in Postgres
 * 
 * Usage:
 *   tsx scripts/migrate-api-gateway.ts
 * 
 * Environment variables:
 *   DATABASE_URL - Postgres connection string (required)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.error('   Example: DATABASE_URL=postgresql://user:pass@localhost:5432/scorpion');
    process.exit(1);
  }

  // Parse DATABASE_URL
  const url = new URL(databaseUrl);
  const dbConfig = {
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  };

  console.log('🚪 API Gateway Migration');
  console.log(`   Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
  console.log('');

  try {
    // Read SQL schema
    const schemaPath = join(process.cwd(), 'lib', 'api-gateway', 'schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    // Import pg dynamically
    const { Client } = await import('pg');
    const client = new Client(dbConfig);

    await client.connect();
    console.log('✅ Connected to database');
    console.log('');

    // Execute schema
    console.log('📝 Creating API Gateway tables...');
    await client.query(sql);
    console.log('  ✅ API Gateway tables created');
    console.log('');

    console.log('✅ Migration completed successfully');
    console.log('');
    console.log('Created tables:');
    console.log('    - api_keys');
    console.log('    - api_usage');
    console.log('    - api_rate_limits');

    await client.end();
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.error('   Tables already exist. Migration is idempotent (uses IF NOT EXISTS).');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Could not connect to database. Check DATABASE_URL and ensure Postgres is running.');
    } else {
      console.error('   Error details:', error);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runMigration().catch(console.error);
}

export { runMigration };

