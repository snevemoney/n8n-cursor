#!/usr/bin/env tsx
/**
 * Explain a Workflow
 * Searches RAG for a workflow and explains it
 */

import { getRAGStore } from '../lib/shared-stores';

const workflowName = process.argv[2] || 'ElevenLabs';

async function explainWorkflow() {
  console.log(`🔍 Searching for workflow: "${workflowName}"\n`);
  
  const store = await getRAGStore();
  
  // Search for the workflow
  const results = await store.search(workflowName, 10);
  
  if (results.length === 0) {
    console.log(`❌ No workflows found matching "${workflowName}"`);
    console.log('\n💡 Try searching with:');
    console.log('   - Exact workflow name');
    console.log('   - Part of the workflow name');
    console.log('   - Node types used (e.g., "OpenAI workflow")');
    process.exit(1);
  }
  
  console.log(`✅ Found ${results.length} matching workflow(s)\n`);
  
  // Find the best match (highest similarity or exact name match)
  const bestMatch = results.find(r => 
    r.title?.toLowerCase().includes(workflowName.toLowerCase())
  ) || results[0];
  
  console.log('='.repeat(60));
  console.log(`📋 WORKFLOW: ${bestMatch.title}`);
  console.log('='.repeat(60));
  console.log(`\n${bestMatch.description}\n`);
  
  // Show patterns/use cases
  if (bestMatch.patterns && bestMatch.patterns.length > 0) {
    console.log('🔧 Patterns & Features:');
    bestMatch.patterns.forEach(p => console.log(`   - ${p}`));
    console.log('');
  }
  
  if (bestMatch.useCases && bestMatch.useCases.length > 0) {
    console.log('💼 Use Cases:');
    bestMatch.useCases.forEach(uc => console.log(`   - ${uc}`));
    console.log('');
  }
  
  if (bestMatch.tags && bestMatch.tags.length > 0) {
    console.log('🏷️  Tags:');
    console.log(`   ${bestMatch.tags.join(', ')}\n`);
  }
  
  // Show code snippets if available
  if (bestMatch.codeSnippets && bestMatch.codeSnippets.length > 0) {
    console.log('📝 Workflow Structure:');
    bestMatch.codeSnippets.slice(0, 2).forEach((snippet, i) => {
      console.log(`\n   Snippet ${i + 1}: ${snippet.explanation}`);
      console.log(`   ${'─'.repeat(50)}`);
      const code = snippet.code.length > 500 
        ? snippet.code.substring(0, 500) + '...'
        : snippet.code;
      console.log(`   ${code.split('\n').map(l => `   ${l}`).join('\n')}`);
    });
  }
  
  // Show other matches if any
  if (results.length > 1) {
    console.log('\n' + '='.repeat(60));
    console.log(`\n📚 Other matching workflows (${results.length - 1}):`);
    results.slice(1, 5).forEach((r, i) => {
      console.log(`   ${i + 2}. ${r.title} (similarity: ${(r as any).similarity?.toFixed(3) || 'N/A'})`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💬 You can now ask Scorpion:');
  console.log(`   - "Explain my ${workflowName} workflow in detail"`);
  console.log(`   - "How does my ${workflowName} workflow work?"`);
  console.log(`   - "What improvements can I make to ${workflowName}?"`);
  console.log(`   - "Create a workflow similar to ${workflowName}"`);
}

explainWorkflow().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});












