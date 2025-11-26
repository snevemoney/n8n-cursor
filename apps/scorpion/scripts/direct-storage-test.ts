#!/usr/bin/env tsx
/**
 * Direct test: Add a tech debt item directly to RAG store and verify it persists
 */

import { getRAGStore } from '@/lib/shared-stores';
import { ExtractedKnowledge } from '@scorpion/core/knowledge/types';

async function testDirectStorage() {
  console.log('🧪 Direct Storage Test\n');
  
  const ragStore = await getRAGStore();
  
  // Check initial state
  const before = ragStore.getAllKnowledge();
  console.log(`📊 Initial state: ${before.length} items in store`);
  
  // Create a test tech debt item
  const testItem: ExtractedKnowledge = {
    id: 'test-tech-debt-001',
    source: 'code-analysis',
    type: 'tech-debt',
    category: 'tech-debt',
    title: 'Test Tech Debt Item',
    description: 'This is a test item to verify storage works',
    filePath: 'test-file.ts',
    tags: ['test', 'diagnostic']
  };
  
  console.log('\n➕ Adding test item...');
  console.log(`   ID: ${testItem.id}`);
  console.log(`   Category: ${testItem.category}`);
  console.log(`   Source: ${testItem.source}`);
  
  try {
    await ragStore.addKnowledge(testItem);
    console.log('✅ Item added successfully');
  } catch (error: any) {
    console.error('❌ Failed to add item:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
  
  // Wait a moment for save
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check immediately after
  const after = ragStore.getAllKnowledge();
  const techDebtItems = after.filter(k => k.category === 'tech-debt');
  
  console.log(`\n📊 After adding: ${after.length} total items`);
  console.log(`   Tech-debt items: ${techDebtItems.length}`);
  
  // Check if our test item is there
  const found = after.find(k => k.id === testItem.id);
  if (found) {
    console.log(`✅ Test item found in store!`);
    console.log(`   ID: ${found.id}`);
    console.log(`   Category: ${found.category}`);
    console.log(`   Source: ${found.source}`);
  } else {
    console.log(`❌ Test item NOT found in store!`);
    console.log(`   This means addKnowledge() is not working correctly.`);
    
    // List what IS in the store
    if (after.length > 0) {
      console.log(`\n   Items in store (first 5):`);
      after.slice(0, 5).forEach(k => {
        console.log(`     - ${k.id} (${k.category || 'no-category'})`);
      });
    }
  }
  
  // Now re-initialize the store to test persistence
  console.log('\n🔄 Testing persistence...');
  const ragStore2 = await getRAGStore(); // Should be same instance (singleton)
  const persisted = ragStore2.getAllKnowledge();
  const persistedTechDebt = persisted.filter(k => k.category === 'tech-debt');
  
  console.log(`📊 After re-initialization: ${persisted.length} total items`);
  console.log(`   Tech-debt items: ${persistedTechDebt.length}`);
  
  const persistedFound = persisted.find(k => k.id === testItem.id);
  if (persistedFound) {
    console.log(`✅ Test item persisted correctly!`);
  } else {
    console.log(`❌ Test item NOT persisted!`);
    console.log(`   This means save() is not working correctly.`);
  }
}

testDirectStorage().catch(console.error);

