#!/usr/bin/env node

/**
 * LightningFlow AI Consistency Checker
 * Validates global consistency across the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONTRACTS_DIR = path.join(__dirname, '..', 'contracts');
const PACKAGES_DIR = path.join(__dirname, '..', 'packages');
const SCHEMA_DIR = path.join(__dirname, '..', 'schema');
const APPS_DIR = path.join(__dirname, '..', 'apps');

// Check results
let errors = [];
let warnings = [];

// Helper functions
function addError(message, file = null, line = null) {
  errors.push({ message, file, line, type: 'error' });
}

function addWarning(message, file = null, line = null) {
  warnings.push({ message, file, line, type: 'warning' });
}

function checkFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    addError(`${description} not found: ${filePath}`);
    return false;
  }
  return true;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    addError(`Cannot read file: ${filePath} - ${error.message}`);
    return null;
  }
}

// Contract validation
function validateContracts() {
  console.log('🔍 Validating contracts...');
  
  const contractFiles = [
    'openapi.yaml',
    'events.yaml',
    'flags.schema.json',
    'errors.yaml',
    'telemetry.yaml'
  ];
  
  for (const file of contractFiles) {
    const filePath = path.join(CONTRACTS_DIR, file);
    if (!checkFileExists(filePath, `Contract file ${file}`)) {
      continue;
    }
    
    const content = readFile(filePath);
    if (!content) continue;
    
    // Basic validation
    if (file.endsWith('.yaml')) {
      try {
        const yaml = require('yaml');
        yaml.parse(content);
      } catch (error) {
        addError(`Invalid YAML in ${file}: ${error.message}`, filePath);
      }
    } else if (file.endsWith('.json')) {
      try {
        JSON.parse(content);
      } catch (error) {
        addError(`Invalid JSON in ${file}: ${error.message}`, filePath);
      }
    }
  }
}

// Feature flags validation
function validateFeatureFlags() {
  console.log('🔍 Validating feature flags...');
  
  const flagsFile = path.join(CONTRACTS_DIR, 'flags.schema.json');
  if (!checkFileExists(flagsFile, 'Feature flags schema')) {
    return;
  }
  
  const flagsContent = readFile(flagsFile);
  if (!flagsContent) return;
  
  try {
    const flags = JSON.parse(flagsContent);
    const flagNames = Object.keys(flags.properties || {});
    
    // Check for hardcoded feature flags in code
    const codeFiles = findCodeFiles();
    for (const codeFile of codeFiles) {
      const content = readFile(codeFile);
      if (!content) continue;
      
      // Look for FF_ environment variables
      const ffMatches = content.match(/FF_[A-Z_]+/g);
      if (ffMatches) {
        for (const match of ffMatches) {
          const flagName = match.replace('FF_', '').replace('NEXT_PUBLIC_FF_', '');
          if (!flagNames.includes(flagName)) {
            addWarning(`Unknown feature flag found: ${match}`, codeFile);
          }
        }
      }
    }
    
  } catch (error) {
    addError(`Error parsing feature flags: ${error.message}`, flagsFile);
  }
}

// Error codes validation
function validateErrorCodes() {
  console.log('🔍 Validating error codes...');
  
  const errorsFile = path.join(CONTRACTS_DIR, 'errors.yaml');
  if (!checkFileExists(errorsFile, 'Error catalog')) {
    return;
  }
  
  const errorsContent = readFile(errorsFile);
  if (!errorsContent) return;
  
  try {
    const yaml = require('yaml');
    const errorCatalog = yaml.parse(errorsContent);
    const errorCodes = Object.keys(errorCatalog.errors || {});
    
    // Check for hardcoded error codes in code
    const codeFiles = findCodeFiles();
    for (const codeFile of codeFiles) {
      const content = readFile(codeFile);
      if (!content) continue;
      
      // Look for LFAI- error codes
      const errorMatches = content.match(/LFAI-[0-9]{4}/g);
      if (errorMatches) {
        for (const match of errorMatches) {
          if (!errorCodes.includes(match)) {
            addWarning(`Unknown error code found: ${match}`, codeFile);
          }
        }
      }
    }
    
  } catch (error) {
    addError(`Error parsing error catalog: ${error.message}`, errorsFile);
  }
}

// Database schema validation
function validateDatabaseSchema() {
  console.log('🔍 Validating database schema...');
  
  const schemaFile = path.join(SCHEMA_DIR, 'db.sql');
  if (!checkFileExists(schemaFile, 'Database schema')) {
    return;
  }
  
  const schemaContent = readFile(schemaFile);
  if (!schemaContent) return;
  
  // Check for required elements
  const requiredElements = [
    'CREATE EXTENSION',
    'CREATE TYPE',
    'CREATE TABLE',
    'CREATE INDEX',
    'ENABLE ROW LEVEL SECURITY'
  ];
  
  for (const element of requiredElements) {
    if (!schemaContent.includes(element)) {
      addWarning(`Schema missing ${element}`, schemaFile);
    }
  }
  
  // Check for common issues
  if (schemaContent.includes('DROP TABLE') && !schemaContent.includes('IF EXISTS')) {
    addWarning('DROP TABLE statements should use IF EXISTS', schemaFile);
  }
  
  if (schemaContent.includes('CREATE TABLE') && !schemaContent.includes('PRIMARY KEY')) {
    addWarning('Tables should have PRIMARY KEY constraints', schemaFile);
  }
}

// Type generation validation
function validateTypeGeneration() {
  console.log('🔍 Validating type generation...');
  
  const contractsPackage = path.join(PACKAGES_DIR, 'contracts');
  if (!checkFileExists(contractsPackage, 'Contracts package')) {
    return;
  }
  
  const srcDir = path.join(contractsPackage, 'src');
  if (!checkFileExists(srcDir, 'Contracts source directory')) {
    return;
  }
  
  // Check for generated type files
  const typeFiles = [
    'openapi.d.ts',
    'events.ts',
    'flags.ts',
    'errors.ts',
    'telemetry.ts'
  ];
  
  for (const file of typeFiles) {
    const filePath = path.join(srcDir, file);
    if (!checkFileExists(filePath, `Generated type file ${file}`)) {
      addWarning(`Generated type file missing: ${file}`);
    }
  }
}

// Currency and time validation
function validateCurrencyAndTime() {
  console.log('🔍 Validating currency and time handling...');
  
  const codeFiles = findCodeFiles();
  for (const codeFile of codeFiles) {
    const content = readFile(codeFile);
    if (!content) continue;
    
    // Check for hardcoded currency values
    if (content.includes('0.00000001') || content.includes('100000000')) {
      addWarning('Hardcoded currency values found - use CurrencyUtils', codeFile);
    }
    
    // Check for hardcoded timezone values
    if (content.match(/America\/|Europe\/|Asia\/|UTC/)) {
      addWarning('Hardcoded timezone values found - use TimeUtils', codeFile);
    }
    
    // Check for float currency math
    if (content.match(/\\d+\\.\\d+\\s*[*/]\\s*\\d+/)) {
      addWarning('Potential float currency math - use Decimal.js', codeFile);
    }
  }
}

// Find code files
function findCodeFiles() {
  const codeFiles = [];
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDirectory(itemPath);
        }
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        codeFiles.push(itemPath);
      }
    }
  }
  
  scanDirectory(APPS_DIR);
  scanDirectory(PACKAGES_DIR);
  
  return codeFiles;
}

// Generate report
function generateReport() {
  console.log('\\n📊 Consistency Check Report\\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All consistency checks passed!');
    return true;
  }
  
  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(error => {
      console.log(`  • ${error.message}`);
      if (error.file) {
        console.log(`    File: ${error.file}`);
      }
      if (error.line) {
        console.log(`    Line: ${error.line}`);
      }
    });
  }
  
  if (warnings.length > 0) {
    console.log('\\n⚠️  Warnings:');
    warnings.forEach(warning => {
      console.log(`  • ${warning.message}`);
      if (warning.file) {
        console.log(`    File: ${warning.file}`);
      }
      if (warning.line) {
        console.log(`    Line: ${warning.line}`);
      }
    });
  }
  
  console.log(`\\n📈 Summary:`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  
  return errors.length === 0;
}

// Main function
function main() {
  console.log('🔍 LightningFlow AI Consistency Check\\n');
  
  try {
    validateContracts();
    validateFeatureFlags();
    validateErrorCodes();
    validateDatabaseSchema();
    validateTypeGeneration();
    validateCurrencyAndTime();
    
    const success = generateReport();
    
    if (!success) {
      console.log('\\n❌ Consistency check failed. Please fix the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`\\n❌ Error during consistency check: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateContracts,
  validateFeatureFlags,
  validateErrorCodes,
  validateDatabaseSchema,
  validateTypeGeneration,
  validateCurrencyAndTime
};
