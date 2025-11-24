#!/usr/bin/env tsx
/**
 * Test to see what happens during actual ingestion
 * Captures the exact moment items should be stored
 */

import { getOrchestrator, getRAGStore } from '@/lib/shared-stores';

async function testStorageDuringIngestion() {
  console.log('🔍 Testing storage during ingestion...\n');
  
  const ragStore = await getRAGStore();
  const before = ragStore.getAllKnowledge();
  console.log(`Before ingestion: ${before.length} items in store`);
  console.log(`  Tech-debt: ${before.filter(k => k.category === 'tech-debt').length}`);
  console.log(`  Missing-features: ${before.filter(k => k.category === 'missing-features').length}\n`);
  
  console.log('Running ingestEssential()...\n');
  const orchestrator = await getOrchestrator();
  
  // Monitor the store during ingestion
  const checkInterval = setInterval(() => {
    const current = ragStore.getAllKnowledge();
    const techDebt = current.filter(k => k.category === 'tech-debt');
    const missingFeatures = current.filter(k => k.category === 'missing-features');
    if (techDebt.length > 0 || missingFeatures.length > 0) {
      console.log(`  [During] Store now has: ${current.length} total, ${techDebt.length} tech-debt, ${missingFeatures.length} missing-features`);
    }
  }, 2000);
  
  try {
    const result = await orchestrator.ingestEssential();
    
    clearInterval(checkInterval);
    
    console.log('\n✅ Ingestion complete');
    console.log(`  Created: ${result.techDebt.length} tech debt items`);
    console.log(`  Created: ${result.recommendations.length} recommendations`);
    console.log(`  Created: ${result.documentation.length} documentation items\n`);
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check store immediately after
    const after = ragStore.getAllKnowledge();
    const techDebtAfter = after.filter(k => k.category === 'tech-debt');
    const missingFeaturesAfter = after.filter(k => k.category === 'missing-features');
    
    console.log(`After ingestion: ${after.length} items in store`);
    console.log(`  Tech-debt: ${techDebtAfter.length} (expected: ${result.techDebt.filter(k => k.category === 'tech-debt').length})`);
    console.log(`  Missing-features: ${missingFeaturesAfter.length} (expected: ${result.techDebt.filter(k => k.category === 'missing-features').length})`);
    
    if (techDebtAfter.length === 0 && result.techDebt.length > 0) {
      console.log('\n❌ PROBLEM IDENTIFIED:');
      console.log(`   Created ${result.techDebt.length} tech debt items but 0 are in the store!`);
      console.log(`   This means items are NOT being stored during ingestion.`);
      
      // Check if items have the right structure
      if (result.techDebt.length > 0) {
        const sample = result.techDebt[0];
        console.log(`\n   Sample item structure:`);
        console.log(`     ID: ${sample.id}`);
        console.log(`     Category: ${sample.category}`);
        console.log(`     Source: ${sample.source}`);
        console.log(`     Title: ${sample.title}`);
      }
    }
    
    // Check recommendations
    const recommendationsAfter = after.filter(k => 
      k.source === 'recommendation-engine' || 
      k.tags?.some(t => t.includes('recommendation'))
    );
    console.log(`\n  Recommendations in store: ${recommendationsAfter.length} (expected: ${result.recommendations.length})`);
    
  } catch (error: any) {
    clearInterval(checkInterval);
    console.error('❌ Error during ingestion:', error);
    console.error('   Stack:', error.stack);
  }
}

testStorageDuringIngestion().catch(console.error);

