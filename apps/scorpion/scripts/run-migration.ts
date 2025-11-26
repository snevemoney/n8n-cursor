#!/usr/bin/env tsx
/**
 * Quick Migration Runner
 * Uses the app's database connection to run migrations
 */

import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  // Load environment variables (Next.js style)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { config } = await import('dotenv');
      config({ path: join(process.cwd(), '.env.local') });
      config({ path: join(process.cwd(), '.env') });
    } catch (e) {
      // dotenv not available, continue
    }
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('   Please set DATABASE_URL in your environment or .env.local file');
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

  console.log('📊 Running Database Migration');
  console.log(`   Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
  console.log('');

  try {
    // Read SQL schemas
    const eventsSchemaPath = join(process.cwd(), 'lib', 'events', 'schema.sql');
    const costSchemaPath = join(process.cwd(), 'lib', 'cost', 'schema.sql');

    const eventsSql = readFileSync(eventsSchemaPath, 'utf-8');
    const costSql = readFileSync(costSchemaPath, 'utf-8');

    // Import pg
    const { Client } = await import('pg');
    const client = new Client(dbConfig);

    await client.connect();
    console.log('✅ Connected to database');
    console.log('');

    // Execute events schema
    console.log('📝 Creating events table...');
    await client.query(eventsSql);
    console.log('  ✅ Events table created');

    // Execute cost schema
    console.log('📝 Creating cost tracking tables...');
    await client.query(costSql);
    console.log('  ✅ Cost tracking tables created');
    console.log('');

    console.log('✅ Migration completed successfully');
    console.log('');
    console.log('Created tables:');
    console.log('  - events');
    console.log('  - cost_resources');
    console.log('  - cost_usage');
    console.log('  - cost_budgets');
    console.log('  - cost_budget_alerts');
    console.log('  - cost_quotas');
    console.log('');
    console.log('Created views:');
    console.log('  - cost_summary_current_month');
    console.log('  - cost_budget_vs_actual');

    await client.end();
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.error('   Some tables already exist. Migration is idempotent.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Could not connect to database. Check DATABASE_URL and ensure Postgres is running.');
    } else {
      console.error('   Error details:', error);
    }
    process.exit(1);
  }
}

runMigration().catch(console.error);

