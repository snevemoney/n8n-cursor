#!/usr/bin/env tsx
/**
 * Verify that tech debt items are actually stored in RAG after ingestion
 */

import { getOrchestrator, getRAGStore } from '@/lib/shared-stores';

async function verifyStorage() {
  console.log('🔍 Verifying tech debt storage...\n');
  
  // First, run ingestion
  console.log('1️⃣ Running essential ingestion...');
  const orchestrator = await getOrchestrator();
  const result = await orchestrator.ingestEssential();
  
  console.log(`\n✅ Ingestion complete:`);
  console.log(`   Tech Debt: ${result.techDebt.length} items`);
  console.log(`   Recommendations: ${result.recommendations.length} items`);
  console.log(`   Documentation: ${result.documentation.length} items`);
  
  // Wait a moment for async operations
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Now check what's actually in the RAG store
  console.log('\n2️⃣ Checking RAG store...');
  const ragStore = await getRAGStore();
  const allKnowledge = ragStore.getAllKnowledge();
  
  console.log(`\n📊 RAG Store Contents:`);
  console.log(`   Total items: ${allKnowledge.length}`);
  
  const techDebtInStore = allKnowledge.filter(k => k.category === 'tech-debt');
  const missingFeaturesInStore = allKnowledge.filter(k => k.category === 'missing-features');
  
  console.log(`   tech-debt category: ${techDebtInStore.length} items`);
  console.log(`   missing-features category: ${missingFeaturesInStore.length} items`);
  
  // Check by source
  const bySource = new Map<string, number>();
  allKnowledge.forEach(k => {
    const source = k.source || 'unknown';
    bySource.set(source, (bySource.get(source) || 0) + 1);
  });
  
  console.log(`\n📦 Items by source:`);
  for (const [source, count] of Array.from(bySource.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`   ${source}: ${count} items`);
  }
  
  // Check if tech debt items from ingestion match what's in store
  console.log(`\n🔍 Verification:`);
  console.log(`   Expected tech-debt: ${result.techDebt.filter(k => k.category === 'tech-debt').length}`);
  console.log(`   Found in store: ${techDebtInStore.length}`);
  console.log(`   Expected missing-features: ${result.techDebt.filter(k => k.category === 'missing-features').length}`);
  console.log(`   Found in store: ${missingFeaturesInStore.length}`);
  
  if (techDebtInStore.length === 0 && result.techDebt.length > 0) {
    console.log(`\n⚠️  ISSUE: Tech debt items were created but not stored in RAG!`);
    console.log(`   Sample tech debt item from ingestion:`);
    const sample = result.techDebt[0];
    console.log(`     ID: ${sample.id}`);
    console.log(`     Category: ${sample.category}`);
    console.log(`     Title: ${sample.title}`);
    console.log(`     Source: ${sample.source}`);
  }
  
  // Check recommendations
  const recommendationsInStore = allKnowledge.filter(k => 
    k.tags?.some(t => t.includes('recommendation')) || 
    k.source === 'recommendation-engine'
  );
  console.log(`\n   Recommendations in store: ${recommendationsInStore.length}`);
  console.log(`   Expected: ${result.recommendations.length}`);
}

verifyStorage().catch(console.error);

