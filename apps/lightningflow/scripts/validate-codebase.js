#!/usr/bin/env node

/**
 * Codebase Principles Validator
 * 
 * This script validates the codebase structure against the established
 * Lightning AI codebase principles. It checks folder structure, feature
 * organization, and other patterns defined in docs/codebase-principles.md
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Define expected structure based on principles
const EXPECTED_FOLDERS = {
  'features': 'Feature-first organization (Principle #2)',
  'background': 'Background jobs folder (Principle #1)',
  'app/api': 'API routes for user actions (Principle #1)'
};

// Define patterns to check
const patterns = [
  {
    name: 'Feature-First Structure',
    principle: 2,
    check: () => {
      // Check if features folder exists and has subdirectories that are feature domains
      if (!fs.existsSync(path.join(process.cwd(), 'features'))) {
        return {
          passed: false,
          message: 'Missing features/ directory. Create feature domains like features/payment-links/ instead of organizing by type.'
        };
      }
      
      const featureDirs = fs.readdirSync(path.join(process.cwd(), 'features'), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      if (featureDirs.length === 0) {
        return {
          passed: false,
          message: 'features/ directory exists but has no feature domains. Create subdirectories for each feature.'
        };
      }
      
      // Check that each feature folder has its own components/api/hooks
      const featuresWithoutSelfContainedStructure = featureDirs.filter(dir => {
        const featurePath = path.join(process.cwd(), 'features', dir);
        const hasComponents = fs.existsSync(path.join(featurePath, 'components'));
        const hasAPI = fs.existsSync(path.join(featurePath, 'api'));
        const hasHooks = fs.existsSync(path.join(featurePath, 'hooks'));
        
        return !(hasComponents || hasAPI || hasHooks);
      });
      
      if (featuresWithoutSelfContainedStructure.length > 0) {
        return {
          passed: false,
          message: `Some feature directories don't follow self-contained structure: ${featuresWithoutSelfContainedStructure.join(', ')}`
        };
      }
      
      return { passed: true };
    }
  },
  {
    name: 'Flow-Based Organization',
    principle: 1,
    check: () => {
      // Check if ui pages map to features
      const appPages = fs.existsSync(path.join(process.cwd(), 'app')) ? 
        fs.readdirSync(path.join(process.cwd(), 'app'), { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name !== 'api')
          .map(dirent => dirent.name) : [];
      
      const features = fs.existsSync(path.join(process.cwd(), 'features')) ? 
        fs.readdirSync(path.join(process.cwd(), 'features'), { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name) : [];
      
      const pagesWithoutFeatures = appPages.filter(page => !features.includes(page));
      
      if (pagesWithoutFeatures.length > 0) {
        return {
          passed: false,
          message: `Found UI pages without corresponding feature folders: ${pagesWithoutFeatures.join(', ')}`
        };
      }
      
      return { passed: true };
    }
  },
  {
    name: 'System Check Tests',
    principle: 3,
    check: () => {
      // Check if system-check endpoints exist for testing flows
      const hasSystemCheck = fs.existsSync(path.join(process.cwd(), 'app/api/system-check')) || 
                             fs.existsSync(path.join(process.cwd(), 'web/src/app/api/system-check'));
      
      if (!hasSystemCheck) {
        return {
          passed: false,
          message: 'Missing system-check endpoints for testing flows without UI clicking (Principle #3)'
        };
      }
      
      return { passed: true };
    }
  },
  {
    name: 'Background Jobs Traceability',
    principle: 4,
    check: () => {
      // Check if background jobs folder exists
      if (!fs.existsSync(path.join(process.cwd(), 'background')) &&
          !fs.existsSync(path.join(process.cwd(), 'workers'))) {
        return {
          passed: false,
          message: 'Missing background/ or workers/ directory for async jobs (Principle #1)'
        };
      }
      
      return { passed: true };
    }
  }
];

// Main validation function
function validateCodebase() {
  console.log(chalk.bold.blue('Lightning AI Codebase Principles Validator'));
  console.log(chalk.gray('Checking codebase structure against established principles...\n'));
  
  let passedCount = 0;
  let warningCount = 0;
  let failedCount = 0;
  
  // Check expected folders
  console.log(chalk.bold('1. Checking folder structure:'));
  
  Object.entries(EXPECTED_FOLDERS).forEach(([folder, description]) => {
    const exists = fs.existsSync(path.join(process.cwd(), folder)) ||
                  fs.existsSync(path.join(process.cwd(), 'web/src', folder));
    
    if (exists) {
      console.log(`  ${chalk.green('✓')} ${folder} - ${description}`);
      passedCount++;
    } else {
      console.log(`  ${chalk.red('✗')} ${folder} - ${description}`);
      failedCount++;
    }
  });
  
  console.log();
  
  // Run pattern checks
  console.log(chalk.bold('2. Validating architecture patterns:'));
  
  patterns.forEach(pattern => {
    try {
      const result = pattern.check();
      
      if (result.passed) {
        console.log(`  ${chalk.green('✓')} ${pattern.name} (Principle #${pattern.principle})`);
        passedCount++;
      } else {
        console.log(`  ${chalk.red('✗')} ${pattern.name} (Principle #${pattern.principle})`);
        console.log(`    ${chalk.yellow('→')} ${result.message}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`  ${chalk.yellow('!')} ${pattern.name} (Principle #${pattern.principle})`);
      console.log(`    ${chalk.yellow('→')} Error during validation: ${error.message}`);
      warningCount++;
    }
  });
  
  // Final summary
  console.log('\n' + chalk.bold('Validation Summary:'));
  console.log(`${chalk.green('✓')} ${passedCount} checks passed`);
  
  if (warningCount > 0) {
    console.log(`${chalk.yellow('!')} ${warningCount} warnings`);
  }
  
  if (failedCount > 0) {
    console.log(`${chalk.red('✗')} ${failedCount} checks failed`);
    console.log('\n' + chalk.yellow('Review docs/codebase-principles.md to ensure your codebase follows the established principles.'));
    process.exit(1);
  } else {
    console.log('\n' + chalk.green('Your codebase structure appears to follow the established principles!'));
  }
}

// Run the validation
validateCodebase(); 