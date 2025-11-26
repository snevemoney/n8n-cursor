#!/usr/bin/env tsx
/**
 * Cleanup Script: Remove test files from RAG store
 * 
 * This script removes test files that were previously indexed in the RAG store.
 * Run this after implementing test file filtering to clean up existing entries.
 */

import { getRAGStore } from '../lib/shared-stores';

async function cleanupTestFiles() {
  console.log('🧹 Starting cleanup of test files from RAG store...');
  
  try {
    const store = await getRAGStore();
    const allKnowledge = store.getAllKnowledge();
    
    console.log(`📊 Found ${allKnowledge.length} total knowledge entries`);
    
    // Identify test files to remove
    const testFilesToRemove: string[] = [];
    
    for (const knowledge of allKnowledge) {
      const source = knowledge.source?.toLowerCase() || '';
      const title = knowledge.title?.toLowerCase() || '';
      const id = knowledge.id?.toLowerCase() || '';
      const description = knowledge.description?.toLowerCase() || '';
      
      // Check if this is a test file
      const isTestFile = 
        source.includes('test-') ||
        title.includes('test-') ||
        id.includes('test-') ||
        description.includes('test-174857') || // Specific pattern from user's issue
        id.match(/test-\d+/) ||
        source.match(/test-\d+/) ||
        title.match(/test-\d+/);
      
      if (isTestFile) {
        testFilesToRemove.push(knowledge.id);
        console.log(`  ❌ Found test file: ${knowledge.id} - ${knowledge.title}`);
      }
    }
    
    if (testFilesToRemove.length === 0) {
      console.log('✅ No test files found in RAG store. Nothing to clean up.');
      return;
    }
    
    console.log(`\n🗑️  Removing ${testFilesToRemove.length} test files...`);
    
    // Remove test files using the batch delete method
    const removed = await store.removeKnowledgeBatch(testFilesToRemove);
    
    console.log(`✅ Removed ${removed} test files from RAG store`);
    console.log(`📊 Remaining entries: ${store.getAllKnowledge().length}`);
    
  } catch (error: any) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestFiles()
  .then(() => {
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });

