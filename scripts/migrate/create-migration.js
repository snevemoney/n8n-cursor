#!/usr/bin/env node

/**
 * LightningFlow AI Migration Creator
 * Creates new database migrations with proper structure and validation
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

// Ensure migrations directory exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
}

// Get command line arguments
const args = process.argv.slice(2);
const migrationName = args[0];

if (!migrationName) {
  console.error('❌ Migration name required');
  console.log('\nUsage: node create-migration.js <migration-name>');
  console.log('\nExamples:');
  console.log('  node create-migration.js add_user_preferences');
  console.log('  node create-migration.js create_payment_tables');
  console.log('  node create-migration.js add_lightning_integration');
  process.exit(1);
}

// Generate migration ID (timestamp-based)
const now = new Date();
const migrationId = now.toISOString().replace(/[:.]/g, '-').replace('T', 'T').substring(0, 19);

// Create migration directory
const migrationDir = path.join(MIGRATIONS_DIR, migrationId);
fs.mkdirSync(migrationDir, { recursive: true });

// Migration template
const upSQL = `-- Migration: ${migrationName}
-- Created: ${now.toISOString()}
-- Description: ${migrationName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE IF NOT EXISTS example_table (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- Add indexes if needed
-- CREATE INDEX IF NOT EXISTS idx_example_table_name ON example_table(name);

-- Add constraints if needed
-- ALTER TABLE example_table ADD CONSTRAINT chk_example_table_name_length CHECK (length(name) > 0);
`;

const downSQL = `-- Rollback: ${migrationName}
-- Created: ${now.toISOString()}
-- Description: Rollback ${migrationName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

-- Add your rollback SQL here
-- Example:
-- DROP TABLE IF EXISTS example_table;

-- Remove indexes
-- DROP INDEX IF EXISTS idx_example_table_name;

-- Remove constraints
-- ALTER TABLE example_table DROP CONSTRAINT IF EXISTS chk_example_table_name_length;
`;

// Metadata template
const metadata = {
  id: migrationId,
  name: migrationName,
  description: migrationName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  created_at: now.toISOString(),
  created_by: process.env.USER || 'system',
  validation: {
    schema_changes: [],
    data_migrations: [],
    performance_impact: 'low',
    downtime_required: false
  },
  rollback_plan: {
    safe: true,
    data_loss: 'none',
    downtime_required: false,
    estimated_time: '1-5 minutes'
  },
  testing: {
    test_queries: [],
    performance_checks: [],
    data_validation: []
  },
  deployment: {
    environments: ['integration', 'staging', 'production'],
    dependencies: [],
    prerequisites: []
  }
};

// Write files
fs.writeFileSync(path.join(migrationDir, 'up.sql'), upSQL);
fs.writeFileSync(path.join(migrationDir, 'down.sql'), downSQL);
fs.writeFileSync(path.join(migrationDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

console.log(`✅ Migration created successfully!`);
console.log(`📁 Directory: ${migrationDir}`);
console.log(`🆔 ID: ${migrationId}`);
console.log(`📝 Name: ${migrationName}`);
console.log(`\n📋 Next steps:`);
console.log(`1. Edit ${path.join(migrationDir, 'up.sql')} with your migration SQL`);
console.log(`2. Edit ${path.join(migrationDir, 'down.sql')} with your rollback SQL`);
console.log(`3. Update ${path.join(migrationDir, 'metadata.json')} with validation details`);
console.log(`4. Test: node migrate.js validate ${migrationId}`);
console.log(`5. Apply: node migrate.js up ${migrationId}`);






