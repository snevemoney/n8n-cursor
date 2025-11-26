#!/usr/bin/env tsx
/**
 * Comprehensive diagnostic to understand the storage pipeline
 * Checks: memory store, disk persistence, category values, retrieval
 */

import { getRAGStore } from '@/lib/shared-stores';
import { ExtractedKnowledge } from '@scorpion/core/knowledge';

async function comprehensiveDiagnostic() {
  console.log('🔍 Comprehensive Storage Diagnostic\n');
  console.log('='.repeat(60));
  
  const ragStore = await getRAGStore();
  
  // Step 1: Check current state
  console.log('\n1️⃣ CURRENT STATE IN MEMORY');
  console.log('-'.repeat(60));
  const allKnowledge = ragStore.getAllKnowledge();
  console.log(`Total items in memory: ${allKnowledge.length}`);
  
  // Check by category
  const byCategory = new Map<string, number>();
  const categoryExamples = new Map<string, string[]>();
  
  for (const k of allKnowledge) {
    const cat = k.category || 'uncategorized';
    byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
    
    if (!categoryExamples.has(cat) || categoryExamples.get(cat)!.length < 2) {
      const examples = categoryExamples.get(cat) || [];
      examples.push(`${k.id} (source: ${k.source})`);
      categoryExamples.set(cat, examples);
    }
  }
  
  console.log('\nItems by category:');
  for (const [cat, count] of Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(25)} ${count.toString().padStart(4)} items`);
    const examples = categoryExamples.get(cat) || [];
    if (examples.length > 0 && count <= 5) {
      examples.forEach(ex => console.log(`    └─ ${ex}`));
    }
  }
  
  // Step 2: Check for tech-debt items specifically
  console.log('\n2️⃣ TECH DEBT ITEMS CHECK');
  console.log('-'.repeat(60));
  const techDebtItems = allKnowledge.filter(k => k.category === 'tech-debt');
  const missingFeaturesItems = allKnowledge.filter(k => k.category === 'missing-features');
  
  console.log(`tech-debt category: ${techDebtItems.length} items`);
  console.log(`missing-features category: ${missingFeaturesItems.length} items`);
  
  // Check by source
  const bySource = new Map<string, number>();
  allKnowledge.forEach(k => {
    const source = k.source || 'unknown';
    bySource.set(source, (bySource.get(source) || 0) + 1);
  });
  
  console.log('\nItems by source:');
  for (const [source, count] of Array.from(bySource.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`  ${source.padEnd(40)} ${count.toString().padStart(4)} items`);
  }
  
  // Step 3: Check if items have 'code-analysis' source
  console.log('\n3️⃣ CODE-ANALYSIS SOURCE CHECK');
  console.log('-'.repeat(60));
  const codeAnalysisItems = allKnowledge.filter(k => k.source === 'code-analysis');
  console.log(`Items with source='code-analysis': ${codeAnalysisItems.length}`);
  
  if (codeAnalysisItems.length > 0) {
    console.log('\nFirst 5 code-analysis items:');
    codeAnalysisItems.slice(0, 5).forEach((k, i) => {
      console.log(`  ${i + 1}. ID: ${k.id}`);
      console.log(`     Category: ${k.category}`);
      console.log(`     Title: ${k.title}`);
      console.log(`     Tags: ${k.tags?.join(', ') || 'none'}`);
    });
  }
  
  // Step 4: Check tags for tech-debt
  console.log('\n4️⃣ TAG-BASED CHECK');
  console.log('-'.repeat(60));
  const itemsWithTechDebtTag = allKnowledge.filter(k => 
    k.tags?.some(t => t.toLowerCase().includes('tech-debt'))
  );
  const itemsWithMissingFeatureTag = allKnowledge.filter(k => 
    k.tags?.some(t => t.toLowerCase().includes('missing-feature'))
  );
  
  console.log(`Items with 'tech-debt' in tags: ${itemsWithTechDebtTag.length}`);
  if (itemsWithTechDebtTag.length > 0) {
    console.log('  Sample items:');
    itemsWithTechDebtTag.slice(0, 3).forEach(k => {
      console.log(`    - ${k.id}: category="${k.category}", source="${k.source}"`);
    });
  }
  
  console.log(`Items with 'missing-feature' in tags: ${itemsWithMissingFeatureTag.length}`);
  if (itemsWithMissingFeatureTag.length > 0) {
    console.log('  Sample items:');
    itemsWithMissingFeatureTag.slice(0, 3).forEach(k => {
      console.log(`    - ${k.id}: category="${k.category}", source="${k.source}"`);
    });
  }
  
  // Step 5: Test adding a single item
  console.log('\n5️⃣ TEST: ADD SINGLE ITEM');
  console.log('-'.repeat(60));
  const testItem: ExtractedKnowledge = {
    id: `diagnostic-test-${Date.now()}`,
    source: 'code-analysis',
    type: 'best-practice',
    category: 'tech-debt',
    title: 'Diagnostic Test Tech Debt',
    description: 'This is a test item to verify storage works',
    codeSnippets: [],
    patterns: [],
    dependencies: [],
    useCases: [],
    tags: ['tech-debt', 'test', 'diagnostic'],
    extractedAt: new Date().toISOString()
  };
  
  console.log('Adding test item...');
  try {
    await ragStore.addKnowledge(testItem);
    console.log('✅ Test item added successfully');
    
    // Check immediately
    const afterAdd = ragStore.getAllKnowledge();
    const found = afterAdd.find(k => k.id === testItem.id);
    
    if (found) {
      console.log('✅ Test item found in memory store:');
      console.log(`   ID: ${found.id}`);
      console.log(`   Category: ${found.category}`);
      console.log(`   Source: ${found.source}`);
    } else {
      console.log('❌ Test item NOT found in memory store!');
    }
    
    // Check category count
    const techDebtAfter = afterAdd.filter(k => k.category === 'tech-debt');
    console.log(`\nTech-debt items after adding test: ${techDebtAfter.length}`);
    
  } catch (error: any) {
    console.error('❌ Failed to add test item:', error.message);
    console.error('   Stack:', error.stack);
  }
  
  // Step 6: Check internal document structure
  console.log('\n6️⃣ INTERNAL DOCUMENT STRUCTURE');
  console.log('-'.repeat(60));
  // Access private documents map via reflection (if possible) or check via getAllKnowledge
  const sampleItems = allKnowledge.slice(0, 3);
  console.log('Sample items metadata:');
  sampleItems.forEach((k, i) => {
    console.log(`\n  Item ${i + 1}:`);
    console.log(`    ID: ${k.id}`);
    console.log(`    Category: ${k.category}`);
    console.log(`    Source: ${k.source}`);
    console.log(`    Type: ${k.type}`);
    console.log(`    Tags: ${k.tags?.join(', ') || 'none'}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Diagnostic complete');
}

comprehensiveDiagnostic().catch(console.error);

