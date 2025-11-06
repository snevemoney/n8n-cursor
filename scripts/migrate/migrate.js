#!/usr/bin/env node

/**
 * LightningFlow AI Migration Runner
 * Manages database migrations with proper validation and rollback support
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');
const SCHEMA_FILE = path.join(__dirname, '..', '..', 'schema', 'db.sql');

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'lightningflow_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true'
};

// Migration tracking table
const MIGRATION_TABLE = 'schema_migrations';

// Ensure migrations directory exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];
const migrationId = args[1];

// Database connection string
function getConnectionString() {
  const { host, port, database, user, password, ssl } = DB_CONFIG;
  let connStr = `postgresql://${user}`;
  
  if (password) {
    connStr += `:${password}`;
  }
  
  connStr += `@${host}:${port}/${database}`;
  
  if (ssl) {
    connStr += '?sslmode=require';
  }
  
  return connStr;
}

// Execute SQL command
function executeSQL(sql, description = '') {
  try {
    console.log(`Executing: ${description}`);
    const result = execSync(`psql "${getConnectionString()}" -c "${sql}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result;
  } catch (error) {
    console.error(`Error executing SQL: ${description}`);
    console.error(error.message);
    throw error;
  }
}

// Initialize migration tracking
function initializeMigrations() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      applied_by VARCHAR(255),
      checksum VARCHAR(64),
      rollback_checksum VARCHAR(64)
    );
  `;
  
  executeSQL(createTableSQL, 'Initialize migration tracking table');
}

// Get applied migrations
function getAppliedMigrations() {
  try {
    const result = executeSQL(
      `SELECT id, name, applied_at FROM ${MIGRATION_TABLE} ORDER BY applied_at`,
      'Get applied migrations'
    );
    
    const lines = result.trim().split('\\n').slice(2, -2); // Skip header and footer
    return lines.map(line => {
      const [id, name, applied_at] = line.split('|').map(s => s.trim());
      return { id, name, applied_at };
    });
  } catch (error) {
    // Table might not exist yet
    return [];
  }
}

// Get available migrations
function getAvailableMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(dir => {
      const dirPath = path.join(MIGRATIONS_DIR, dir);
      return fs.statSync(dirPath).isDirectory() && 
             fs.existsSync(path.join(dirPath, 'up.sql')) &&
             fs.existsSync(path.join(dirPath, 'down.sql'));
    })
    .sort();
}

// Calculate file checksum
function calculateChecksum(filePath) {
  const crypto = require('crypto');
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Load migration metadata
function loadMigrationMetadata(migrationId) {
  const metadataPath = path.join(MIGRATIONS_DIR, migrationId, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Migration metadata not found: ${migrationId}`);
  }
  
  return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
}

// Validate migration
function validateMigration(migrationId) {
  const migrationDir = path.join(MIGRATIONS_DIR, migrationId);
  const upFile = path.join(migrationDir, 'up.sql');
  const downFile = path.join(migrationDir, 'down.sql');
  
  if (!fs.existsSync(upFile)) {
    throw new Error(`Migration up file not found: ${upFile}`);
  }
  
  if (!fs.existsSync(downFile)) {
    throw new Error(`Migration down file not found: ${downFile}`);
  }
  
  // Check SQL syntax
  try {
    execSync(`psql "${getConnectionString()}" --dry-run -f "${upFile}"`, { stdio: 'pipe' });
    execSync(`psql "${getConnectionString()}" --dry-run -f "${downFile}"`, { stdio: 'pipe' });
  } catch (error) {
    throw new Error(`SQL syntax error in migration ${migrationId}: ${error.message}`);
  }
  
  console.log(`✅ Migration ${migrationId} validation passed`);
}

// Apply migration
function applyMigration(migrationId) {
  const migrationDir = path.join(MIGRATIONS_DIR, migrationId);
  const upFile = path.join(migrationDir, 'up.sql');
  const metadata = loadMigrationMetadata(migrationId);
  
  console.log(`\\n🚀 Applying migration: ${migrationId}`);
  console.log(`📝 Description: ${metadata.description}`);
  
  // Validate migration
  validateMigration(migrationId);
  
  // Check if already applied
  const appliedMigrations = getAppliedMigrations();
  if (appliedMigrations.some(m => m.id === migrationId)) {
    console.log(`⚠️  Migration ${migrationId} already applied`);
    return;
  }
  
  // Calculate checksums
  const upChecksum = calculateChecksum(upFile);
  const downFile = path.join(migrationDir, 'down.sql');
  const downChecksum = calculateChecksum(downFile);
  
  try {
    // Apply migration
    const sql = fs.readFileSync(upFile, 'utf8');
    executeSQL(sql, `Apply migration ${migrationId}`);
    
    // Record migration
    const recordSQL = `
      INSERT INTO ${MIGRATION_TABLE} (id, name, description, applied_by, checksum, rollback_checksum)
      VALUES ('${migrationId}', '${metadata.name}', '${metadata.description}', '${process.env.USER || 'system'}', '${upChecksum}', '${downChecksum}')
    `;
    executeSQL(recordSQL, `Record migration ${migrationId}`);
    
    console.log(`✅ Migration ${migrationId} applied successfully`);
    
    // Update schema file if this is a schema change
    if (metadata.validation.schema_changes.length > 0) {
      console.log(`\\n⚠️  Schema changes detected. Remember to update schema/db.sql`);
      console.log(`Run: npm run update-schema`);
    }
    
  } catch (error) {
    console.error(`❌ Failed to apply migration ${migrationId}: ${error.message}`);
    throw error;
  }
}

// Rollback migration
function rollbackMigration(migrationId) {
  const migrationDir = path.join(MIGRATIONS_DIR, migrationId);
  const downFile = path.join(migrationDir, 'down.sql');
  const metadata = loadMigrationMetadata(migrationId);
  
  console.log(`\\n🔄 Rolling back migration: ${migrationId}`);
  console.log(`📝 Description: ${metadata.description}`);
  
  // Check if applied
  const appliedMigrations = getAppliedMigrations();
  const appliedMigration = appliedMigrations.find(m => m.id === migrationId);
  if (!appliedMigration) {
    console.log(`⚠️  Migration ${migrationId} not found in applied migrations`);
    return;
  }
  
  // Check rollback safety
  if (!metadata.rollback_plan.safe) {
    console.log(`⚠️  WARNING: This migration is marked as unsafe to rollback!`);
    console.log(`Data loss: ${metadata.rollback_plan.data_loss}`);
    console.log(`Downtime required: ${metadata.rollback_plan.downtime_required}`);
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('Are you sure you want to continue? (yes/no): ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('Rollback cancelled');
      return;
    }
  }
  
  try {
    // Rollback migration
    const sql = fs.readFileSync(downFile, 'utf8');
    executeSQL(sql, `Rollback migration ${migrationId}`);
    
    // Remove migration record
    const deleteSQL = `DELETE FROM ${MIGRATION_TABLE} WHERE id = '${migrationId}'`;
    executeSQL(deleteSQL, `Remove migration record ${migrationId}`);
    
    console.log(`✅ Migration ${migrationId} rolled back successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to rollback migration ${migrationId}: ${error.message}`);
    throw error;
  }
}

// Show migration status
function showStatus() {
  console.log('\\n📊 Migration Status\\n');
  
  const appliedMigrations = getAppliedMigrations();
  const availableMigrations = getAvailableMigrations();
  
  console.log('Applied migrations:');
  if (appliedMigrations.length === 0) {
    console.log('  (none)');
  } else {
    appliedMigrations.forEach(migration => {
      console.log(`  ✅ ${migration.id} - ${migration.name} (${migration.applied_at})`);
    });
  }
  
  console.log('\\nAvailable migrations:');
  if (availableMigrations.length === 0) {
    console.log('  (none)');
  } else {
    availableMigrations.forEach(migrationId => {
      const isApplied = appliedMigrations.some(m => m.id === migrationId);
      const status = isApplied ? '✅' : '⏳';
      const metadata = loadMigrationMetadata(migrationId);
      console.log(`  ${status} ${migrationId} - ${metadata.description}`);
    });
  }
  
  const pendingMigrations = availableMigrations.filter(migrationId => 
    !appliedMigrations.some(m => m.id === migrationId)
  );
  
  if (pendingMigrations.length > 0) {
    console.log(`\\n⏳ ${pendingMigrations.length} pending migration(s)`);
  } else {
    console.log('\\n✅ All migrations are up to date');
  }
}

// Apply all pending migrations
function applyAllPending() {
  const appliedMigrations = getAppliedMigrations();
  const availableMigrations = getAvailableMigrations();
  
  const pendingMigrations = availableMigrations.filter(migrationId => 
    !appliedMigrations.some(m => m.id === migrationId)
  );
  
  if (pendingMigrations.length === 0) {
    console.log('✅ No pending migrations');
    return;
  }
  
  console.log(`\\n🚀 Applying ${pendingMigrations.length} pending migration(s)\\n`);
  
  for (const migrationId of pendingMigrations) {
    try {
      applyMigration(migrationId);
    } catch (error) {
      console.error(`\\n❌ Migration failed. Stopping at ${migrationId}`);
      console.error('Run individual migrations to resolve issues');
      process.exit(1);
    }
  }
  
  console.log('\\n✅ All pending migrations applied successfully');
}

// Main command handler
async function main() {
  try {
    // Initialize migration tracking
    initializeMigrations();
    
    switch (command) {
      case 'status':
        showStatus();
        break;
        
      case 'up':
        if (migrationId) {
          applyMigration(migrationId);
        } else {
          applyAllPending();
        }
        break;
        
      case 'down':
        if (!migrationId) {
          console.error('Migration ID required for rollback');
          process.exit(1);
        }
        await rollbackMigration(migrationId);
        break;
        
      case 'validate':
        if (!migrationId) {
          console.error('Migration ID required for validation');
          process.exit(1);
        }
        validateMigration(migrationId);
        break;
        
      default:
        console.log('LightningFlow AI Migration Runner');
        console.log('\\nUsage:');
        console.log('  node migrate.js status                    - Show migration status');
        console.log('  node migrate.js up                        - Apply all pending migrations');
        console.log('  node migrate.js up <migration-id>         - Apply specific migration');
        console.log('  node migrate.js down <migration-id>       - Rollback specific migration');
        console.log('  node migrate.js validate <migration-id>   - Validate migration');
        console.log('\\nExamples:');
        console.log('  node migrate.js status');
        console.log('  node migrate.js up');
        console.log('  node migrate.js up 2024-01-15T10-30-00_add_user_preferences');
        console.log('  node migrate.js down 2024-01-15T10-30-00_add_user_preferences');
        break;
    }
    
  } catch (error) {
    console.error(`\\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  applyMigration,
  rollbackMigration,
  validateMigration,
  showStatus,
  getAppliedMigrations,
  getAvailableMigrations
};








