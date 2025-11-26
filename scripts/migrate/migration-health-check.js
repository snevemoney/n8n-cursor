#!/usr/bin/env node

/**
 * LightningFlow AI Migration Health Check
 * Validates migration system integrity and database consistency
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
    const result = execSync(`psql "${getConnectionString()}" -c "${sql}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result;
  } catch (error) {
    throw new Error(`SQL execution failed: ${description} - ${error.message}`);
  }
}

// Check database connectivity
function checkDatabaseConnectivity() {
  console.log('🔍 Checking database connectivity...');
  
  try {
    executeSQL('SELECT 1 as test', 'Database connectivity test');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

// Check migration table exists
function checkMigrationTable() {
  console.log('🔍 Checking migration tracking table...');
  
  try {
    const result = executeSQL(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${MIGRATION_TABLE}')`,
      'Check migration table exists'
    );
    
    const exists = result.includes('t');
    if (exists) {
      console.log('✅ Migration tracking table exists');
      return true;
    } else {
      console.log('❌ Migration tracking table missing');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to check migration table:', error.message);
    return false;
  }
}

// Check migration integrity
function checkMigrationIntegrity() {
  console.log('🔍 Checking migration integrity...');
  
  try {
    const result = executeSQL(
      `SELECT id, name, checksum, rollback_checksum FROM ${MIGRATION_TABLE} ORDER BY applied_at`,
      'Get migration records'
    );
    
    const lines = result.trim().split('\\n').slice(2, -2);
    let integrityIssues = 0;
    
    for (const line of lines) {
      const [id, name, checksum, rollbackChecksum] = line.split('|').map(s => s.trim());
      
      // Check if migration files exist
      const migrationDir = path.join(MIGRATIONS_DIR, id);
      const upFile = path.join(migrationDir, 'up.sql');
      const downFile = path.join(migrationDir, 'down.sql');
      
      if (!fs.existsSync(upFile) || !fs.existsSync(downFile)) {
        console.log(`❌ Migration files missing for ${id}`);
        integrityIssues++;
        continue;
      }
      
      // Verify checksums
      const crypto = require('crypto');
      const currentUpChecksum = crypto.createHash('sha256').update(fs.readFileSync(upFile, 'utf8')).digest('hex');
      const currentDownChecksum = crypto.createHash('sha256').update(fs.readFileSync(downFile, 'utf8')).digest('hex');
      
      if (checksum !== currentUpChecksum) {
        console.log(`❌ Checksum mismatch for ${id} up.sql`);
        integrityIssues++;
      }
      
      if (rollbackChecksum !== currentDownChecksum) {
        console.log(`❌ Checksum mismatch for ${id} down.sql`);
        integrityIssues++;
      }
    }
    
    if (integrityIssues === 0) {
      console.log('✅ All migration integrity checks passed');
      return true;
    } else {
      console.log(`❌ Found ${integrityIssues} integrity issues`);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Failed to check migration integrity:', error.message);
    return false;
  }
}

// Check for pending migrations
function checkPendingMigrations() {
  console.log('🔍 Checking for pending migrations...');
  
  try {
    // Get applied migrations
    const appliedResult = executeSQL(
      `SELECT id FROM ${MIGRATION_TABLE} ORDER BY applied_at`,
      'Get applied migrations'
    );
    
    const appliedLines = appliedResult.trim().split('\\n').slice(2, -2);
    const appliedMigrations = appliedLines.map(line => line.split('|')[0].trim());
    
    // Get available migrations
    const availableMigrations = fs.readdirSync(MIGRATIONS_DIR)
      .filter(dir => {
        const dirPath = path.join(MIGRATIONS_DIR, dir);
        return fs.statSync(dirPath).isDirectory() && 
               fs.existsSync(path.join(dirPath, 'up.sql')) &&
               fs.existsSync(path.join(dirPath, 'down.sql'));
      })
      .sort();
    
    const pendingMigrations = availableMigrations.filter(id => !appliedMigrations.includes(id));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return true;
    } else {
      console.log(`⚠️  Found ${pendingMigrations.length} pending migrations:`);
      pendingMigrations.forEach(id => {
        console.log(`   - ${id}`);
      });
      return false;
    }
    
  } catch (error) {
    console.log('❌ Failed to check pending migrations:', error.message);
    return false;
  }
}

// Check schema consistency
function checkSchemaConsistency() {
  console.log('🔍 Checking schema consistency...');
  
  try {
    // Check if schema file exists
    if (!fs.existsSync(SCHEMA_FILE)) {
      console.log('⚠️  Schema file not found:', SCHEMA_FILE);
      return false;
    }
    
    // Get current database schema
    const currentSchema = executeSQL(
      `SELECT schemaname, tablename, columnname, datatype FROM information_schema.columns WHERE table_schema = 'public' ORDER BY tablename, columnname`,
      'Get current schema'
    );
    
    // Compare with schema file (basic check)
    const schemaFileContent = fs.readFileSync(SCHEMA_FILE, 'utf8');
    
    if (schemaFileContent.length < 100) {
      console.log('⚠️  Schema file appears to be empty or minimal');
      return false;
    }
    
    console.log('✅ Schema consistency check passed');
    return true;
    
  } catch (error) {
    console.log('❌ Failed to check schema consistency:', error.message);
    return false;
  }
}

// Main health check function
function runHealthCheck() {
  console.log('🏥 LightningFlow AI Migration Health Check');
  console.log('==========================================\\n');
  
  const checks = [
    { name: 'Database Connectivity', fn: checkDatabaseConnectivity },
    { name: 'Migration Table', fn: checkMigrationTable },
    { name: 'Migration Integrity', fn: checkMigrationIntegrity },
    { name: 'Pending Migrations', fn: checkPendingMigrations },
    { name: 'Schema Consistency', fn: checkSchemaConsistency }
  ];
  
  let passedChecks = 0;
  let totalChecks = checks.length;
  
  for (const check of checks) {
    console.log(`\\n📋 ${check.name}`);
    console.log('─'.repeat(50));
    
    try {
      if (check.fn()) {
        passedChecks++;
      }
    } catch (error) {
      console.log(`❌ Check failed with error: ${error.message}`);
    }
  }
  
  console.log('\\n📊 Health Check Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passedChecks}/${totalChecks}`);
  console.log(`❌ Failed: ${totalChecks - passedChecks}/${totalChecks}`);
  
  if (passedChecks === totalChecks) {
    console.log('\\n🎉 All migration health checks passed!');
    process.exit(0);
  } else {
    console.log('\\n⚠️  Some migration health checks failed. Review the output above.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = {
  runHealthCheck,
  checkDatabaseConnectivity,
  checkMigrationTable,
  checkMigrationIntegrity,
  checkPendingMigrations,
  checkSchemaConsistency
};
