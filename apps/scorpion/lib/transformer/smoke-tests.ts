/**
 * Smoke Tests for Transformer Architecture
 * 
 * Run these tests to validate the transformer orchestrator before production use.
 */

import { orchestrateScorpionStep } from './orchestrator-example';
import { createToolResourceIndex } from './toolResourceIndex';
import { plannerAttentionQuery } from '@/server/transformer/attention-query';
import { createScorpionContext } from '@/server/transformer/scorpion-context';

/**
 * Test 1: Pure tool-selection test
 * 
 * Prompt: "List all tools you think are relevant to debugging n8n workflow imports"
 */
export async function testToolSelection(): Promise<void> {
  console.log('\n=== Test 1: Tool Selection ===');
  
  const query = 'List all tools you think are relevant to debugging n8n workflow imports and describe how you\'d use each.';
  
  const resourceIndex = createToolResourceIndex();
  const context = createScorpionContext(query, [], []);
  
  // Test attention query
  const attention = await plannerAttentionQuery(resourceIndex, context);
  
  console.log('Top Tools:', attention.topTools.slice(0, 5).map(t => ({
    toolId: t.toolId,
    score: t.score.toFixed(3),
    reason: t.reason,
  })));
  
  // Test full orchestration
  const result = await orchestrateScorpionStep({
    query,
    riskMode: 'safe',
  });
  
  console.log('Integration Plan Steps:', result.integrationPlan.orderedSteps.length);
  console.log('Chosen Tools:', result.integrationPlan.chosenTools.map(t => t.name));
  console.log('Risk Level:', result.integrationPlan.riskLevel);
  
  // Validation
  if (result.integrationPlan.chosenTools.length === 0) {
    throw new Error('No tools selected - attention query may have failed');
  }
  
  console.log('✅ Tool selection test passed\n');
}

/**
 * Test 2: Safe execution test (read-only)
 * 
 * Prompt: "Inspect the AgentPilot workflow schemas and summarize any obvious tech debt"
 */
export async function testSafeExecution(): Promise<void> {
  console.log('\n=== Test 2: Safe Execution (Read-Only) ===');
  
  const query = 'Inspect the AgentPilot workflow schemas and summarize any obvious tech debt. Don\'t modify anything, just read.';
  
  const result = await orchestrateScorpionStep({
    query,
    riskMode: 'safe',
  });
  
  console.log('Execution Results:', result.executionResults.map(r => ({
    stepId: r.stepId,
    success: r.success,
    error: r.error,
  })));
  
  // Check that events were appended
  const events = result.context.pastEvents.filter(e => 
    e.type.includes('execution') || e.type.includes('step')
  );
  console.log('Execution Events:', events.length);
  
  // Validation
  if (result.executionResults.length === 0) {
    throw new Error('No tools executed - execution phase may have failed');
  }
  
  const failures = result.executionResults.filter(r => !r.success);
  if (failures.length > 0) {
    console.warn('⚠️ Some tools failed:', failures.map(f => f.error));
  }
  
  console.log('✅ Safe execution test passed\n');
}

/**
 * Test 3: Council bridge test
 * 
 * Prompt: "Propose a safe step-by-step refactor and explain tradeoffs"
 */
export async function testCouncilBridge(): Promise<void> {
  console.log('\n=== Test 3: Council Bridge ===');
  
  const query = 'You are helping me refactor Scorpion\'s chat pipeline. Propose a safe step-by-step refactor and explain tradeoffs. Don\'t touch any code yet.';
  
  // This would require a plan from the existing system
  // For now, test the attention-based council
  const resourceIndex = createToolResourceIndex();
  const context = createScorpionContext(query, [], []);
  
  const attention = await plannerAttentionQuery(resourceIndex, context);
  
  console.log('Planner Attention Results:', {
    toolCount: attention.topTools.length,
    docCount: attention.topDocs.length,
    workflowCount: attention.topWorkflows.length,
  });
  
  // Test full orchestration
  const result = await orchestrateScorpionStep({
    query,
    riskMode: 'balanced',
  });
  
  console.log('Head Outputs (from plan):', {
    stepCount: result.integrationPlan.orderedSteps.length,
    toolCount: result.integrationPlan.chosenTools.length,
    riskLevel: result.integrationPlan.riskLevel,
  });
  
  // Validation
  if (result.integrationPlan.orderedSteps.length === 0) {
    throw new Error('No steps in plan - council/planner may have failed');
  }
  
  console.log('✅ Council bridge test passed\n');
}

/**
 * Run all smoke tests
 */
export async function runSmokeTests(): Promise<void> {
  console.log('🧪 Running Transformer Architecture Smoke Tests...\n');
  
  try {
    await testToolSelection();
    await testSafeExecution();
    await testCouncilBridge();
    
    console.log('✅ All smoke tests passed!');
  } catch (error: any) {
    console.error('❌ Smoke test failed:', error.message);
    throw error;
  }
}

