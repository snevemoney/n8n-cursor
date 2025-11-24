#!/usr/bin/env tsx
/**
 * Check if a specific documentation file is indexed in the RAG store
 * Usage: tsx scripts/check-doc-indexing.ts [filename]
 */

import { getRAGStore } from '../../lib/rag-store';
import path from 'path';

async function main() {
  const filename = process.argv[2] || 'MACRO_AND_MICRO_PATTERNS.md';
  
  console.log(`🔍 Checking if "${filename}" is indexed in RAG store...\n`);
  
  try {
    const ragStore = await getRAGStore();
    const allKnowledge = ragStore.getAllKnowledge();
    
    console.log(`📊 Total knowledge items in RAG: ${allKnowledge.length}\n`);
    
    // Search for the file by various methods
    const searchTerms = [
      filename.toLowerCase(),
      filename.replace('.md', '').toLowerCase(),
      'macro.*micro.*pattern',
      'macro.*pattern',
      'micro.*pattern'
    ];
    
    // Method 1: Search by file path in codeSnippets
    const byFilePath = allKnowledge.filter(k => {
      const filePath = k.codeSnippets?.[0]?.file || k.filePath || '';
      return filePath.toLowerCase().includes(filename.toLowerCase()) ||
             filePath.toLowerCase().includes('macro_and_micro');
    });
    
    // Method 2: Search by title/description
    const byContent = allKnowledge.filter(k => {
      const searchText = `${k.title} ${k.description} ${k.id}`.toLowerCase();
      return searchTerms.some(term => {
        const regex = new RegExp(term.replace(/\*/g, '.*'), 'i');
        return regex.test(searchText);
      });
    });
    
    // Method 3: Search by tags
    const byTags = allKnowledge.filter(k => {
      return k.tags?.some(tag => 
        searchTerms.some(term => {
          const regex = new RegExp(term.replace(/\*/g, '.*'), 'i');
          return regex.test(tag.toLowerCase());
        })
      );
    });
    
    // Combine all matches
    const allMatches = new Map<string, typeof allKnowledge[0]>();
    [...byFilePath, ...byContent, ...byTags].forEach(k => {
      allMatches.set(k.id, k);
    });
    
    const matches = Array.from(allMatches.values());
    
    console.log(`🔎 Search Results:\n`);
    
    if (matches.length === 0) {
      console.log(`❌ "${filename}" NOT FOUND in RAG store\n`);
      console.log(`📋 Documentation items found (${allKnowledge.filter(k => k.category === 'documentation' || k.source === 'docs').length}):`);
      const docItems = allKnowledge
        .filter(k => k.category === 'documentation' || k.source === 'docs')
        .slice(0, 10);
      docItems.forEach(k => {
        const filePath = k.codeSnippets?.[0]?.file || k.filePath || 'unknown';
        console.log(`   - ${k.id}: ${k.title} (${filePath})`);
      });
      if (docItems.length === 0) {
        console.log(`   ⚠️  No documentation items found at all!`);
      }
    } else {
      console.log(`✅ Found ${matches.length} matching item(s):\n`);
      matches.forEach((k, i) => {
        console.log(`${i + 1}. ID: ${k.id}`);
        console.log(`   Title: ${k.title}`);
        console.log(`   Category: ${k.category}`);
        console.log(`   Source: ${k.source}`);
        console.log(`   File Path: ${k.codeSnippets?.[0]?.file || k.filePath || 'N/A'}`);
        console.log(`   Tags: ${k.tags?.join(', ') || 'none'}`);
        console.log(`   Description: ${k.description.substring(0, 100)}...`);
        console.log('');
      });
    }
    
    // Check if it's a documentation item
    const docItems = allKnowledge.filter(k => 
      k.category === 'documentation' || 
      k.source === 'docs' ||
      (k.codeSnippets?.[0]?.file?.includes('docs/') ?? false)
    );
    
    console.log(`\n📚 Documentation Indexing Stats:`);
    console.log(`   Total documentation items: ${docItems.length}`);
    console.log(`   Percentage of total: ${((docItems.length / allKnowledge.length) * 100).toFixed(1)}%`);
    
    // Check for common docs
    const commonDocs = [
      'MACRO_AND_MICRO_PATTERNS.md',
      'README.md',
      'PERFORMANCE_OPTIMIZATIONS_COMPLETE.md',
      'ORCHESTRATOR_ARCHITECTURE.md'
    ];
    
    console.log(`\n📄 Common Documentation Files Check:`);
    for (const doc of commonDocs) {
      const found = allKnowledge.some(k => {
        const filePath = k.codeSnippets?.[0]?.file || k.filePath || '';
        return filePath.toLowerCase().includes(doc.toLowerCase());
      });
      console.log(`   ${found ? '✅' : '❌'} ${doc}`);
    }
    
  } catch (error: any) {
    console.error(`❌ Error checking RAG store:`, error.message);
    process.exit(1);
  }
}

main().catch(console.error);

