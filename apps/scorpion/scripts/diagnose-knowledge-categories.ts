#!/usr/bin/env tsx
/**
 * Diagnostic script to check knowledge categories in RAG store
 * Helps identify why tech debt and missing features show as 0
 */

import { getRAGStore } from '@/lib/shared-stores';

async function diagnoseCategories() {
  console.log('🔍 Diagnosing knowledge categories...\n');
  
  const ragStore = await getRAGStore();
  
  const allKnowledge = ragStore.getAllKnowledge();
  console.log(`Total knowledge items: ${allKnowledge.length}\n`);
  
  // Group by category
  const byCategory = new Map<string, number>();
  const categoryExamples = new Map<string, string[]>();
  
  for (const knowledge of allKnowledge) {
    const category = knowledge.category || 'uncategorized';
    byCategory.set(category, (byCategory.get(category) || 0) + 1);
    
    if (!categoryExamples.has(category) || categoryExamples.get(category)!.length < 3) {
      const examples = categoryExamples.get(category) || [];
      examples.push(`${knowledge.id}: ${knowledge.title}`);
      categoryExamples.set(category, examples);
    }
  }
  
  // Sort by count
  const sortedCategories = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1]);
  
  console.log('📊 Category breakdown:');
  console.log('─'.repeat(60));
  for (const [category, count] of sortedCategories) {
    console.log(`  ${category.padEnd(30)} ${count.toString().padStart(4)} items`);
    const examples = categoryExamples.get(category) || [];
    if (examples.length > 0) {
      examples.slice(0, 2).forEach(ex => {
        console.log(`    └─ ${ex}`);
      });
    }
  }
  
  console.log('\n');
  
  // Check specifically for tech-debt and missing-features
  const techDebt = allKnowledge.filter(k => k.category === 'tech-debt');
  const missingFeatures = allKnowledge.filter(k => k.category === 'missing-features');
  
  console.log('🎯 Tech Debt & Missing Features:');
  console.log('─'.repeat(60));
  console.log(`  tech-debt:        ${techDebt.length} items`);
  console.log(`  missing-features: ${missingFeatures.length} items`);
  
  if (techDebt.length > 0) {
    console.log('\n  Tech Debt examples:');
    techDebt.slice(0, 5).forEach(k => {
      console.log(`    - ${k.id}: ${k.title}`);
      console.log(`      Tags: ${k.tags?.join(', ') || 'none'}`);
    });
  }
  
  if (missingFeatures.length > 0) {
    console.log('\n  Missing Features examples:');
    missingFeatures.slice(0, 5).forEach(k => {
      console.log(`    - ${k.id}: ${k.title}`);
      console.log(`      Tags: ${k.tags?.join(', ') || 'none'}`);
    });
  }
  
  // Check if items have tags that might indicate tech debt or missing features
  console.log('\n🔖 Checking for items with tech-debt/missing-features in tags:');
  console.log('─'.repeat(60));
  const itemsWithTechDebtTag = allKnowledge.filter(k => 
    k.tags?.some(t => t.toLowerCase().includes('tech-debt') || t.toLowerCase().includes('techdebt'))
  );
  const itemsWithMissingFeatureTag = allKnowledge.filter(k => 
    k.tags?.some(t => t.toLowerCase().includes('missing-feature') || t.toLowerCase().includes('missingfeature'))
  );
  
  console.log(`  Items with 'tech-debt' in tags: ${itemsWithTechDebtTag.length}`);
  if (itemsWithTechDebtTag.length > 0) {
    itemsWithTechDebtTag.slice(0, 3).forEach(k => {
      console.log(`    - ${k.id}: category="${k.category}", tags=[${k.tags?.join(', ')}]`);
    });
  }
  
  console.log(`  Items with 'missing-feature' in tags: ${itemsWithMissingFeatureTag.length}`);
  if (itemsWithMissingFeatureTag.length > 0) {
    itemsWithMissingFeatureTag.slice(0, 3).forEach(k => {
      console.log(`    - ${k.id}: category="${k.category}", tags=[${k.tags?.join(', ')}]`);
    });
  }
  
  // Check source breakdown
  console.log('\n📦 Knowledge by source:');
  console.log('─'.repeat(60));
  const bySource = new Map<string, number>();
  for (const knowledge of allKnowledge) {
    const source = knowledge.source || 'unknown';
    bySource.set(source, (bySource.get(source) || 0) + 1);
  }
  
  const sortedSources = Array.from(bySource.entries())
    .sort((a, b) => b[1] - a[1]);
  
  for (const [source, count] of sortedSources) {
    console.log(`  ${source.padEnd(40)} ${count.toString().padStart(4)} items`);
  }
}

diagnoseCategories().catch(console.error);

