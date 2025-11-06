#!/usr/bin/env node

/**
 * LightningFlow AI Schema Updater
 * Updates the canonical schema file from applied migrations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');
const SCHEMA_FILE = path.join(__dirname, '..', '..', 'schema', 'db.sql');
const BACKUP_DIR = path.join(__dirname, '..', '..', 'schema', 'backups');

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'lightningflow_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true'
};

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'update';

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

// Create backup of current schema
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join(BACKUP_DIR, `schema_backup_${timestamp}.sql`);
  
  if (fs.existsSync(SCHEMA_FILE)) {
    fs.copyFileSync(SCHEMA_FILE, backupFile);
    console.log(`📦 Schema backup created: ${backupFile}`);
    return backupFile;
  }
  
  return null;
}

// Get current database schema
function getCurrentSchema() {
  console.log('🔍 Extracting current database schema...');
  
  const schemaSQL = `
    -- LightningFlow AI Database Schema
    -- Generated from live database: ${new Date().toISOString()}
    -- This file is the single source of truth for database structure
    
    -- Enable necessary extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    
    -- Create custom types
    CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
    CREATE TYPE agent_type AS ENUM ('research', 'content', 'automation', 'analysis');
    CREATE TYPE agent_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
    CREATE TYPE webhook_event_type AS ENUM ('payment_received', 'payment_sent', 'invoice_created', 'invoice_paid');
    CREATE TYPE environment_type AS ENUM ('int', 'staging', 'prod');
    
    -- Tables will be generated from pg_dump
  `;
  
  try {
    // Use pg_dump to get schema
    const dumpCommand = `pg_dump "${getConnectionString()}" --schema-only --no-owner --no-privileges`;
    const schema = execSync(dumpCommand, { encoding: 'utf8' });
    
    // Clean up the dump
    const cleanedSchema = schema
      .replace(/^--.*$/gm, '') // Remove comments
      .replace(/^SET .*$/gm, '') // Remove SET statements
      .replace(/^SELECT .*$/gm, '') // Remove SELECT statements
      .replace(/^\\n+/gm, '\\n') // Remove extra newlines
      .trim();
    
    return schemaSQL + '\\n\\n' + cleanedSchema;
    
  } catch (error) {
    console.error('Error extracting schema:', error.message);
    throw error;
  }
}

// Update schema file
function updateSchema() {
  console.log('🔄 Updating schema file...');
  
  // Create backup
  const backupFile = createBackup();
  
  try {
    // Get current schema
    const currentSchema = getCurrentSchema();
    
    // Write to schema file
    fs.writeFileSync(SCHEMA_FILE, currentSchema);
    
    console.log(`✅ Schema file updated: ${SCHEMA_FILE}`);
    
    if (backupFile) {
      console.log(`📦 Previous version backed up: ${backupFile}`);
    }
    
    // Validate the schema
    validateSchema();
    
  } catch (error) {
    console.error('❌ Failed to update schema:', error.message);
    
    // Restore from backup if available
    if (backupFile && fs.existsSync(backupFile)) {
      fs.copyFileSync(backupFile, SCHEMA_FILE);
      console.log('🔄 Schema file restored from backup');
    }
    
    throw error;
  }
}

// Validate schema file
function validateSchema() {
  console.log('🔍 Validating schema file...');
  
  if (!fs.existsSync(SCHEMA_FILE)) {
    throw new Error('Schema file not found');
  }
  
  const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
  
  // Check for required elements
  const requiredElements = [
    'CREATE EXTENSION',
    'CREATE TYPE',
    'CREATE TABLE',
    'CREATE INDEX',
    'ENABLE ROW LEVEL SECURITY'
  ];
  
  for (const element of requiredElements) {
    if (!schema.includes(element)) {
      console.warn(`⚠️  Warning: Schema missing ${element}`);
    }
  }
  
  // Check for common issues
  if (schema.includes('DROP TABLE') && !schema.includes('IF EXISTS')) {
    console.warn('⚠️  Warning: DROP TABLE statements should use IF EXISTS');
  }
  
  if (schema.includes('CREATE TABLE') && !schema.includes('PRIMARY KEY')) {
    console.warn('⚠️  Warning: Tables should have PRIMARY KEY constraints');
  }
  
  console.log('✅ Schema validation completed');
}

// Compare schema with database
function compareSchema() {
  console.log('🔍 Comparing schema file with database...');
  
  try {
    // Get current database schema
    const dbSchema = getCurrentSchema();
    const fileSchema = fs.readFileSync(SCHEMA_FILE, 'utf8');
    
    // Simple comparison (in a real implementation, you'd use a proper diff library)
    if (dbSchema === fileSchema) {
      console.log('✅ Schema file is in sync with database');
    } else {
      console.log('⚠️  Schema file differs from database');
      console.log('Run "node update-schema.js update" to sync');
    }
    
  } catch (error) {
    console.error('Error comparing schema:', error.message);
    throw error;
  }
}

// Show schema status
function showStatus() {
  console.log('\\n📊 Schema Status\\n');
  
  if (fs.existsSync(SCHEMA_FILE)) {
    const stats = fs.statSync(SCHEMA_FILE);
    console.log(`📄 Schema file: ${SCHEMA_FILE}`);
    console.log(`📅 Last modified: ${stats.mtime.toISOString()}`);
    console.log(`📏 Size: ${stats.size} bytes`);
  } else {
    console.log('❌ Schema file not found');
  }
  
  // List backups
  if (fs.existsSync(BACKUP_DIR)) {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort()
      .reverse();
    
    console.log(`\\n📦 Backups (${backups.length}):`);
    if (backups.length === 0) {
      console.log('  (none)');
    } else {
      backups.slice(0, 5).forEach(backup => {
        const backupPath = path.join(BACKUP_DIR, backup);
        const stats = fs.statSync(backupPath);
        console.log(`  📄 ${backup} (${stats.mtime.toISOString()})`);
      });
      
      if (backups.length > 5) {
        console.log(`  ... and ${backups.length - 5} more`);
      }
    }
  }
  
  // Check database connection
  try {
    executeSQL('SELECT 1', 'Test database connection');
    console.log('\\n✅ Database connection: OK');
  } catch (error) {
    console.log('\\n❌ Database connection: FAILED');
  }
}

// Main command handler
function main() {
  try {
    switch (command) {
      case 'update':
        updateSchema();
        break;
        
      case 'validate':
        validateSchema();
        break;
        
      case 'compare':
        compareSchema();
        break;
        
      case 'status':
        showStatus();
        break;
        
      case 'backup':
        createBackup();
        break;
        
      default:
        console.log('LightningFlow AI Schema Updater');
        console.log('\\nUsage:');
        console.log('  node update-schema.js update     - Update schema from database');
        console.log('  node update-schema.js validate   - Validate schema file');
        console.log('  node update-schema.js compare    - Compare schema with database');
        console.log('  node update-schema.js status     - Show schema status');
        console.log('  node update-schema.js backup     - Create schema backup');
        console.log('\\nExamples:');
        console.log('  node update-schema.js update');
        console.log('  node update-schema.js validate');
        console.log('  node update-schema.js status');
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
  updateSchema,
  validateSchema,
  compareSchema,
  showStatus,
  createBackup
};
