#!/usr/bin/env tsx
/**
 * Test script to run tech debt analyzer and see what it finds
 */

import { getOrchestrator } from '@/lib/shared-stores';

async function testTechDebtAnalyzer() {
  console.log('🔍 Testing Tech Debt Analyzer via Orchestrator...\n');
  
  const orchestrator = await getOrchestrator();
  
  console.log('Running ingestEssential() (includes tech debt analysis)...\n');
  const result = await orchestrator.ingestEssential();
  
  console.log(`\n✅ Analysis complete!`);
  console.log(`Tech Debt items: ${result.techDebt.length}`);
  console.log(`Recommendations: ${result.recommendations.length}`);
  console.log(`Documentation: ${result.documentation.length}\n`);
  
  const total = result.techDebt.length + result.recommendations.length + result.documentation.length;
  
  if (total === 0) {
    console.log('⚠️  No tech debt or missing features found.');
    console.log('This could mean:');
    console.log('  1. The codebase is clean (no TODOs, FIXMEs, etc.)');
    console.log('  2. The analyzer is not scanning the right directories');
    console.log('  3. The analyzer is failing silently\n');
    
    // Check if directories exist
    const appsDir = path.join(workspaceRoot, 'apps');
    const packagesDir = path.join(workspaceRoot, 'packages');
    
    const fs = await import('fs/promises');
    try {
      const appsExists = await fs.access(appsDir).then(() => true).catch(() => false);
      const packagesExists = await fs.access(packagesDir).then(() => true).catch(() => false);
      
      console.log(`Directory check:`);
      console.log(`  apps: ${appsDir} - ${appsExists ? '✅ exists' : '❌ not found'}`);
      console.log(`  packages: ${packagesDir} - ${packagesExists ? '✅ exists' : '❌ not found'}`);
    } catch (error) {
      console.error('Error checking directories:', error);
    }
  } else {
    console.log('📊 Breakdown:');
    console.log(`  tech-debt category: ${result.techDebt.filter(k => k.category === 'tech-debt').length} items`);
    console.log(`  missing-features category: ${result.techDebt.filter(k => k.category === 'missing-features').length} items`);
    console.log(`  recommendations (tech-debt): ${result.recommendations.filter(k => k.category === 'tech-debt').length} items`);
    console.log(`  recommendations (missing-features): ${result.recommendations.filter(k => k.category === 'missing-features').length} items`);
    
    if (result.techDebt.length > 0) {
      console.log('\n📋 Sample Tech Debt items:');
      result.techDebt.slice(0, 5).forEach((k, i) => {
        console.log(`\n  ${i + 1}. ${k.title}`);
        console.log(`     Category: ${k.category}`);
        console.log(`     Tags: ${k.tags?.join(', ') || 'none'}`);
        console.log(`     Source: ${k.source}`);
      });
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n📋 Sample Recommendations:');
      result.recommendations.slice(0, 5).forEach((k, i) => {
        console.log(`\n  ${i + 1}. ${k.title}`);
        console.log(`     Category: ${k.category}`);
        console.log(`     Tags: ${k.tags?.join(', ') || 'none'}`);
      });
    }
  }
}

testTechDebtAnalyzer().catch(console.error);

