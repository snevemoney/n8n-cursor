#!/usr/bin/env tsx
/**
 * Quick test: Add a tech debt item directly and verify it's stored
 */

import { getRAGStore } from '@/lib/shared-stores';
import { ExtractedKnowledge } from '@scorpion/core/knowledge';

async function quickTest() {
  console.log('🔍 Quick storage test...\n');
  
  const ragStore = await getRAGStore();
  
  // Check initial state
  const before = ragStore.getAllKnowledge();
  const techDebtBefore = before.filter(k => k.category === 'tech-debt');
  console.log(`Before: ${before.length} total, ${techDebtBefore.length} tech-debt items\n`);
  
  // Create a test tech debt item
  const testItem: ExtractedKnowledge = {
    id: `test-tech-debt-${Date.now()}`,
    source: 'test',
    type: 'best-practice',
    category: 'tech-debt',
    title: 'Test Tech Debt Item',
    description: 'This is a test tech debt item to verify storage',
    codeSnippets: [],
    patterns: [],
    dependencies: [],
    useCases: [],
    tags: ['tech-debt', 'test', 'medium'],
    extractedAt: new Date().toISOString()
  };
  
  console.log('Adding test item...');
  await ragStore.addKnowledge(testItem);
  console.log('✅ Item added\n');
  
  // Check immediately after
  const after = ragStore.getAllKnowledge();
  const techDebtAfter = after.filter(k => k.category === 'tech-debt');
  console.log(`After: ${after.length} total, ${techDebtAfter.length} tech-debt items`);
  
  // Find our test item
  const found = after.find(k => k.id === testItem.id);
  if (found) {
    console.log(`\n✅ Test item found in store:`);
    console.log(`   ID: ${found.id}`);
    console.log(`   Category: ${found.category}`);
    console.log(`   Title: ${found.title}`);
    console.log(`   Source: ${found.source}`);
  } else {
    console.log(`\n❌ Test item NOT found in store!`);
    console.log(`   Looking for ID: ${testItem.id}`);
    console.log(`   Available IDs (first 5): ${after.slice(0, 5).map(k => k.id).join(', ')}`);
  }
  
  // Check by category
  console.log(`\n📊 All items with category 'tech-debt':`);
  techDebtAfter.forEach((k, i) => {
    if (i < 10) {
      console.log(`   ${i + 1}. ${k.id} - ${k.title} (source: ${k.source})`);
    }
  });
  
  // Reload store and check again
  console.log(`\n🔄 Reloading RAG store from disk...`);
  const ragStore2 = await getRAGStore();
  const reloaded = ragStore2.getAllKnowledge();
  const techDebtReloaded = reloaded.filter(k => k.category === 'tech-debt');
  console.log(`After reload: ${reloaded.length} total, ${techDebtReloaded.length} tech-debt items`);
  
  const foundAfterReload = reloaded.find(k => k.id === testItem.id);
  if (foundAfterReload) {
    console.log(`✅ Test item persisted to disk and reloaded correctly`);
  } else {
    console.log(`❌ Test item NOT found after reload - persistence issue!`);
  }
}

quickTest().catch(console.error);

