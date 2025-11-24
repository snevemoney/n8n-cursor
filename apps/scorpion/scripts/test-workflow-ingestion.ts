#!/usr/bin/env tsx
/**
 * Test Workflow Ingestion into RAG
 * 
 * Tests the enhanced workflow ingester to:
 * 1. Fetch workflows from n8n
 * 2. Deeply parse workflow structure
 * 3. Ingest into RAG store
 * 4. Test searchability
 */

import { EnhancedWorkflowIngester } from '@scorpion/core';
import { getRAGStore } from '../lib/shared-stores';
import { getMCPn8nClient } from '../lib/mcp-n8n-client';

async function testWorkflowIngestion() {
  console.log('🧪 Testing Workflow Ingestion into RAG\n');
  console.log('='.repeat(60));

  try {
    // Initialize RAG store
    console.log('\n📦 Step 1: Initializing RAG Store...');
    const ragStore = await getRAGStore();
    console.log(`✅ RAG Store initialized`);

    // Get n8n client
    console.log('\n🔌 Step 2: Connecting to n8n...');
    const n8nClient = getMCPn8nClient();
    
    // Test connection
    try {
      const workflows = await n8nClient.listWorkflows({ limit: 5 });
      console.log(`✅ Connected to n8n (found ${workflows.length} workflows)`);
    } catch (error: any) {
      console.error(`❌ Failed to connect to n8n: ${error.message}`);
      console.log('\n💡 Make sure N8N_API_URL and N8N_API_KEY are set in .env.local');
      process.exit(1);
    }

    // Create enhanced ingester
    console.log('\n🔧 Step 3: Creating Enhanced Workflow Ingester...');
    const ingester = new EnhancedWorkflowIngester(n8nClient);
    console.log(`✅ Ingester created`);

    // Ingest workflows
    console.log('\n📥 Step 4: Ingesting workflows into RAG...');
    const startTime = Date.now();
    const result = await ingester.ingestAllWorkflows(ragStore);
    const duration = Date.now() - startTime;

    console.log(`\n✅ Ingestion complete!`);
    console.log(`   - Ingested: ${result.ingested} workflows`);
    console.log(`   - Errors: ${result.errors.length}`);
    console.log(`   - Duration: ${duration}ms`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      result.errors.forEach(err => {
        console.log(`   - ${err.workflow}: ${err.error}`);
      });
    }

    // Test searchability
    console.log('\n🔍 Step 5: Testing Workflow Searchability...');
    
    const testQueries = [
      'workflows with OpenAI',
      'RAG workflows',
      'database workflows',
      'active workflows',
    ];

    for (const query of testQueries) {
      const results = await ragStore.search(query, 3);
      console.log(`\n   Query: "${query}"`);
      console.log(`   Results: ${results.length}`);
      if (results.length > 0) {
        results.forEach((r, i) => {
          console.log(`     ${i + 1}. ${r.title} (similarity: ${(r as any).similarity?.toFixed(3) || 'N/A'})`);
        });
      }
    }

    // Show workflow statistics
    console.log('\n📊 Step 6: Workflow Statistics...');
    const allKnowledge = ragStore.getAllKnowledge();
    const workflowKnowledge = allKnowledge.filter(k => k.source === 'n8n-workflows');
    
    console.log(`   Total workflows in RAG: ${workflowKnowledge.length}`);
    
    const activeWorkflows = workflowKnowledge.filter(k => k.tags?.includes('active'));
    const inactiveWorkflows = workflowKnowledge.filter(k => k.tags?.includes('inactive'));
    
    console.log(`   Active workflows: ${activeWorkflows.length}`);
    console.log(`   Inactive workflows: ${inactiveWorkflows.length}`);

    // Show node type distribution
    const nodeTypes = new Set<string>();
    workflowKnowledge.forEach(k => {
      k.dependencies?.forEach(dep => {
        if (dep && typeof dep === 'string') {
          nodeTypes.add(dep);
        }
      });
    });
    
    console.log(`   Unique node types: ${nodeTypes.size}`);
    console.log(`   Node types: ${Array.from(nodeTypes).slice(0, 10).join(', ')}${nodeTypes.size > 10 ? '...' : ''}`);

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Workflow ingestion test complete!');
    console.log(`\n💬 You can now chat with Scorpion about your workflows:`);
    console.log(`   - "What workflows do I have?"`);
    console.log(`   - "Show me workflows that use OpenAI"`);
    console.log(`   - "How can I improve my RAG workflow?"`);
    console.log(`   - "Create a workflow similar to my email automation"`);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testWorkflowIngestion().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});












