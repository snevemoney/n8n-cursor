#!/usr/bin/env node

/**
 * UI Consistency Checker
 * 
 * This script analyzes React component files to check for UI consistency
 * based on the standards defined in docs/ui-consistency-checklist.md
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configure paths to check
const PAGES_DIR = path.join(process.cwd(), 'web/src/app');
const COMPONENTS_DIR = path.join(process.cwd(), 'web/src/components');

// Define patterns to check for
const REQUIRED_PATTERNS = {
  'PageShell': /(?:<PageShell|<Layout|className=".*?p-4.*?md:p-6")/,
  'Topbar': /(?:<Topbar|<TopBar|<Header)/,
  'Sidebar': /(?:<Sidebar|<SideNav)/,
  'Grid system': /grid-cols-1\s+md:grid-cols-\d+/,
  'Card layout': /(?:<Card|className=".*?(?:bg-card|rounded-xl|shadow)")/,
  'Responsive padding': /p-\d+\s+md:p-\d+/,
  'Dark mode': /(?:text-foreground|bg-background|dark:)/,
  'Overflow handling': /overflow-(?:auto|hidden|scroll)/
};

const CONDITIONAL_PATTERNS = {
  'Advanced Mode guard': /(?:advancedMode|isAdvancedMode|showAdvanced)/,
  'System Check badge': /(?:SystemStatus|healthCheck|systemHealth)/
};

// Define pages that should have specific checks
const PAGE_SPECIFIC_CHECKS = {
  'dashboard': ['Grid system', 'Card layout'],
  'payment-links': ['Card layout'],
  'team-wallets': ['Card layout', 'Advanced Mode guard'],
  'ai-assistant': ['Overflow handling'],
  'analytics': ['Grid system', 'Card layout'],
  'console': ['Advanced Mode guard'],
  'backups': ['Advanced Mode guard'],
};

// Function to scan a file for UI patterns
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    console.log(chalk.blue(`\nChecking: ${relativePath}`));
    
    // Determine which page this is for specific checks
    const pageName = detectPageFromPath(filePath);
    
    let passedChecks = 0;
    let totalChecks = 0;
    let warnings = [];
    
    // Check for required patterns
    Object.entries(REQUIRED_PATTERNS).forEach(([patternName, pattern]) => {
      totalChecks++;
      
      if (pattern.test(content)) {
        console.log(`  ${chalk.green('✓')} ${patternName}`);
        passedChecks++;
      } else {
        // Skip Grid system check for non-dashboard pages unless specifically required
        if (patternName === 'Grid system' && 
            !pageName.includes('dashboard') && 
            !PAGE_SPECIFIC_CHECKS[pageName]?.includes('Grid system')) {
          console.log(`  ${chalk.gray('-')} ${patternName} (Not required for this page)`);
          passedChecks++; // Don't count against score
        } else {
          console.log(`  ${chalk.red('✗')} ${patternName}`);
        }
      }
    });
    
    // Check for conditional patterns
    Object.entries(CONDITIONAL_PATTERNS).forEach(([patternName, pattern]) => {
      // Only check if this page specifically needs this pattern
      if (PAGE_SPECIFIC_CHECKS[pageName]?.includes(patternName)) {
        totalChecks++;
        
        if (pattern.test(content)) {
          console.log(`  ${chalk.green('✓')} ${patternName}`);
          passedChecks++;
        } else {
          console.log(`  ${chalk.yellow('!')} ${patternName} (Recommended)`);
          warnings.push(`Consider adding ${patternName} to ${relativePath}`);
        }
      } else {
        console.log(`  ${chalk.gray('-')} ${patternName} (Not required for this page)`);
      }
    });
    
    // Page-specific additional checks
    if (pageName === 'ai-assistant' && !content.includes('overflow-auto')) {
      warnings.push('The AI Assistant page should have overflow handling for chat scrolling');
    }
    
    if (pageName === 'console' && !content.includes('advancedMode')) {
      warnings.push('The Console page should be guarded with advancedMode check');
    }
    
    // Calculate consistency score
    const score = Math.round((passedChecks / totalChecks) * 100);
    
    // Show warnings
    if (warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings:'));
      warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }
    
    return {
      file: relativePath,
      page: pageName,
      score,
      passed: passedChecks,
      total: totalChecks,
      warnings: warnings.length
    };
    
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
    return null;
  }
}

// Determine page name from file path
function detectPageFromPath(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Extract page name from route structure
  const parts = relativePath.split(path.sep);
  const appIndex = parts.indexOf('app');
  
  if (appIndex !== -1 && parts.length > appIndex + 1) {
    return parts[appIndex + 1];
  }
  
  // For page.tsx files, get the parent directory
  if (parts.includes('page.tsx')) {
    const pageIndex = parts.indexOf('page.tsx');
    if (pageIndex > 0) {
      return parts[pageIndex - 1];
    }
  }
  
  return 'unknown';
}

// Find all page files recursively
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findPageFiles(filePath, fileList);
    } else if (
      (file === 'page.tsx' || file === 'page.jsx' || 
       file.endsWith('.page.tsx') || file.endsWith('.page.jsx'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main function
async function checkUIConsistency() {
  console.log(chalk.bold.blue('Lightning AI UI Consistency Checker'));
  console.log(chalk.gray('Analyzing pages based on UI consistency checklist...\n'));
  
  // Find all page files
  const pageFiles = findPageFiles(PAGES_DIR);
  
  // Scan each file
  const results = pageFiles.map(filePath => scanFile(filePath)).filter(Boolean);
  
  // Summarize results
  console.log(chalk.bold.blue('\nUI Consistency Summary'));
  console.log('='.repeat(50));
  
  let totalScore = 0;
  
  results.forEach(result => {
    const scoreColor = result.score >= 90 ? 'green' : 
                       result.score >= 70 ? 'yellow' : 'red';
    
    console.log(`${result.page.padEnd(20)} ${chalk[scoreColor](`${result.score}%`.padStart(6))} (${result.passed}/${result.total})`);
    totalScore += result.score;
  });
  
  const averageScore = Math.round(totalScore / results.length);
  const averageColor = averageScore >= 90 ? 'green' : 
                       averageScore >= 70 ? 'yellow' : 'red';
  
  console.log('='.repeat(50));
  console.log(`Overall Score: ${chalk[averageColor](`${averageScore}%`)}`);
  
  // Provide recommendations
  if (averageScore < 80) {
    console.log(chalk.yellow('\nRecommendations:'));
    console.log('1. Review docs/ui-consistency-checklist.md for UI standards');
    console.log('2. Focus on pages with scores below 70%');
    console.log('3. Ensure consistent use of PageShell, responsive layouts, and dark mode support');
  }
  
  // Return overall status
  return averageScore >= 80;
}

// Run the check
checkUIConsistency()
  .then(passed => {
    if (!passed) {
      console.log(chalk.yellow('\nSome UI consistency issues were found. See recommendations above.'));
      process.exit(1);
    } else {
      console.log(chalk.green('\nUI consistency check passed!'));
    }
  })
  .catch(error => {
    console.error('Error running UI consistency check:', error);
    process.exit(1);
  }); 