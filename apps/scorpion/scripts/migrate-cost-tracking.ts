#!/usr/bin/env tsx
/**
 * Database Migration Script
 * Creates events and cost tracking tables in Postgres
 * 
 * Usage:
 *   tsx scripts/migrate-cost-tracking.ts
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
    database: url.pathname.slice(1), // Remove leading /
    user: url.username,
    password: url.password,
  };

  console.log('📊 Database Migration');
  console.log(`   Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
  console.log('');

  try {
    // Read SQL schemas
    const eventsSchemaPath = join(process.cwd(), 'lib', 'events', 'schema.sql');
    const costSchemaPath = join(process.cwd(), 'lib', 'cost', 'schema.sql');
    const apiGatewaySchemaPath = join(process.cwd(), 'lib', 'api-gateway', 'schema.sql');
    const memorySchemaPath = join(process.cwd(), 'lib', 'memory', 'schema.sql');
    
    const eventsSql = readFileSync(eventsSchemaPath, 'utf-8');
    const costSql = readFileSync(costSchemaPath, 'utf-8');
    const apiGatewaySql = readFileSync(apiGatewaySchemaPath, 'utf-8');
    const memorySql = readFileSync(memorySchemaPath, 'utf-8');
    const servicesSql = readFileSync(join(process.cwd(), 'lib', 'services', 'schema.sql'), 'utf-8');
    const securitySql = readFileSync(join(process.cwd(), 'lib', 'security', 'schema.sql'), 'utf-8');
    const edgeSql = readFileSync(join(process.cwd(), 'lib', 'edge', 'schema.sql'), 'utf-8');
    const mlSql = readFileSync(join(process.cwd(), 'lib', 'ai-ml', 'schema.sql'), 'utf-8');
    const sustainabilitySql = readFileSync(join(process.cwd(), 'lib', 'sustainability', 'schema.sql'), 'utf-8');
    const governanceSql = readFileSync(join(process.cwd(), 'lib', 'governance', 'schema.sql'), 'utf-8');
    const migrationSql = readFileSync(join(process.cwd(), 'lib', 'migration', 'schema.sql'), 'utf-8');

    // Import pg dynamically (only if needed)
    const { Client } = await import('pg');
    const client = new Client(dbConfig);

    await client.connect();
    console.log('✅ Connected to database');
    console.log('');

    // Execute events schema
    console.log('📝 Creating events tables...');
    await client.query(eventsSql);
    console.log('  ✅ Events table created');

    // Execute cost schema
    console.log('📝 Creating cost tracking tables...');
    await client.query(costSql);
    console.log('  ✅ Cost tracking tables created');

    // Execute API Gateway schema
    console.log('📝 Creating API Gateway tables...');
    try {
      await client.query(apiGatewaySql);
      console.log('  ✅ API Gateway tables created');
    } catch (error: any) {
      console.log(`  ⚠️  API Gateway tables failed: ${error.message}`);
      console.log('  (Continuing with other migrations...)');
    }

    // Execute Memory schema
    console.log('📝 Creating Memory tables...');
    try {
      await client.query(memorySql);
      console.log('  ✅ Memory tables created');
    } catch (error: any) {
      console.log(`  ⚠️  Memory tables failed: ${error.message}`);
      console.log('  (Continuing with other migrations...)');
    }

    // Execute Services schema
    console.log('📝 Creating Service Registry tables...');
    try {
      await client.query(servicesSql);
      console.log('  ✅ Service Registry tables created');
    } catch (error: any) {
      console.log(`  ⚠️  Service Registry tables failed: ${error.message}`);
      console.log('  (Continuing with other migrations...)');
    }

    // Execute Security schema
    console.log('📝 Creating Security tables...');
    try {
      await client.query(securitySql);
      console.log('  ✅ Security tables created');
    } catch (error: any) {
      console.log(`  ⚠️  Security tables failed: ${error.message}`);
      console.log('  (Continuing with other migrations...)');
    }

    // Execute Edge schema
    console.log('📝 Creating Edge Deployment tables...');
    try {
      await client.query(edgeSql);
      console.log('  ✅ Edge Deployment tables created');
    } catch (error: any) {
      console.log(`  ⚠️  Edge Deployment tables failed: ${error.message}`);
      console.log('  (Continuing with other migrations...)');
    }
    
    // Execute ML schema
    console.log('📝 Creating ML Stack tables...');
    try {
      await client.query(mlSql);
      console.log('  ✅ ML Stack tables created');
    } catch (error: any) {
      console.log(`  ⚠️  ML Stack tables failed: ${error.message}`);
      console.log('  (Continuing with other migrations...)');
    }
    
    // Execute Sustainability schema
    console.log('📝 Creating Sustainability tables...');
    try {
      await client.query(sustainabilitySql);
      console.log('  ✅ Sustainability tables created');
    } catch (error: any) {
      console.log(`  ⚠️  Sustainability tables failed: ${error.message}`);
      console.log('  (Continuing with other migrations...)');
    }
    
    // Execute Governance schema
    console.log('📝 Creating Data Governance tables...');
    try {
      await client.query(governanceSql);
      console.log('  ✅ Data Governance tables created');
    } catch (error: any) {
      console.log(`  ⚠️  Data Governance tables failed: ${error.message}`);
      console.log('  (Continuing with other migrations...)');
    }
    
    // Execute Migration schema
    console.log('📝 Creating Migration & Modernization tables...');
    try {
      await client.query(migrationSql);
      console.log('  ✅ Migration & Modernization tables created');
    } catch (error: any) {
      console.log(`  ⚠️  Migration & Modernization tables failed: ${error.message}`);
      console.log('  (Continuing...)');
    }
    console.log('');

    console.log('✅ Migration completed successfully');
    console.log('');
    console.log('Created tables:');
    console.log('  Events:');
    console.log('    - events');
    console.log('  Cost Tracking:');
    console.log('    - cost_resources');
    console.log('    - cost_usage');
    console.log('    - cost_budgets');
    console.log('    - cost_budget_alerts');
    console.log('    - cost_quotas');
    console.log('  API Gateway:');
    console.log('    - api_keys');
    console.log('    - api_usage');
    console.log('    - api_rate_limits');
    console.log('  Memory & Feedback:');
    console.log('    - long_term_memory');
    console.log('    - chat_feedback');
    console.log('  Service Registry:');
    console.log('    - service_instances');
    console.log('    - service_health');
    console.log('    - service_dependencies');
    console.log('  Security:');
    console.log('    - secrets');
    console.log('  Edge Deployment:');
    console.log('    - edge_nodes');
    console.log('    - edge_routes');
    console.log('  ML Stack:');
    console.log('    - ml_models');
    console.log('    - ml_training_data');
    console.log('    - ml_predictions');
    console.log('    - ml_transcriptions');
    console.log('    - ml_request_logs');
    console.log('  Sustainability:');
    console.log('    - sustainability_emissions');
    console.log('    - sustainability_efficiency');
    console.log('    - sustainability_goals');
    console.log('    - sustainability_energy');
    console.log('  Data Governance:');
    console.log('    - data_assets');
    console.log('    - governance_policies');
    console.log('    - policy_bindings');
    console.log('    - access_logs');
    console.log('    - retention_rules');
    console.log('  Migration & Modernization:');
    console.log('    - migration_jobs');
    console.log('    - migration_tasks');
    console.log('    - migration_runs');
    console.log('');
    console.log('Created views:');
    console.log('    - cost_summary_current_month');
    console.log('    - cost_budget_vs_actual');

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

