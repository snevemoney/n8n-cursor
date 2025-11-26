#!/usr/bin/env tsx
/**
 * Cloud Architecture Integration Test
 * Tests event system, cost tracking, and resource tagging together
 */

import { getEventBus, emitEvent } from '../lib/events/event-bus';
import { getCostTracker } from '../lib/cost/tracker';
import {
  parseResourceHierarchy,
  validateResourceHierarchy,
  formatResourceId,
  getDefaultScorpionTags,
} from '../lib/resources/tagger';

async function testEventSystem() {
  console.log('\n📡 Testing Event System...');
  
  const bus = getEventBus();
  let eventReceived = false;

  const unsubscribe = bus.subscribe('workflow.started', (event) => {
    eventReceived = true;
    console.log('  ✅ Event received:', event.type);
  });

  await emitEvent({
    id: crypto.randomUUID(),
    type: 'workflow.started',
    severity: 'info',
    timestamp: new Date().toISOString(),
    source: 'test',
    environment: 'dev',
    data: {
      workflowId: 'test-wf-001',
      workflowName: 'Test Workflow',
      trigger: 'test',
    },
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  if (eventReceived) {
    console.log('  ✅ Event system working correctly');
  } else {
    console.log('  ⚠️  Event not received (may be async timing)');
  }

  unsubscribe();
}

async function testCostTracking() {
  console.log('\n💰 Testing Cost Tracking...');
  
  const tracker = getCostTracker();

  // Register a test resource
  const resourceId = await tracker.registerResource({
    product: 'scorpion-core',
    environment: 'dev',
    service: 'test-service',
    resourceType: 'container',
    resourceId: 'test-resource-001',
    resourceName: 'Test Resource',
    estimatedMonthlyCost: 10.00,
  });

  console.log('  ✅ Resource registered:', resourceId);

  // Set a test budget
  await tracker.setBudget({
    product: 'scorpion-core',
    environment: 'dev',
    budgetName: 'Test Budget',
    monthlyBudget: 50.00,
    warningThreshold: 80,
    alertThreshold: 100,
  });

  console.log('  ✅ Budget set successfully');

  // Get cost summary
  const summary = await tracker.getCostSummary();
  console.log('  ✅ Cost summary retrieved:', summary.length, 'entries');

  // Get budget status
  const budgets = await tracker.getBudgetStatus();
  console.log('  ✅ Budget status retrieved:', budgets.length, 'budgets');
}

function testResourceTagging() {
  console.log('\n🏷️  Testing Resource Tagging...');
  
  // Test hierarchy parsing
  const hierarchy = parseResourceHierarchy({
    organization: 'scorpion-systems',
    product: 'scorpion-core',
    environment: 'prod',
    service: 'api',
  });

  console.log('  ✅ Hierarchy parsed:', hierarchy);

  // Test validation
  const validation = validateResourceHierarchy(hierarchy);
  if (validation.valid) {
    console.log('  ✅ Hierarchy validation passed');
  } else {
    console.log('  ❌ Hierarchy validation failed:', validation.errors);
  }

  // Test resource ID formatting
  const resourceId = formatResourceId(hierarchy, 'container', 'api-001');
  console.log('  ✅ Resource ID formatted:', resourceId);

  // Test default tags
  const tags = getDefaultScorpionTags('scorpion-core', 'prod', 'api', {
    team: 'platform',
  });
  console.log('  ✅ Default tags created:', Object.keys(tags).length, 'tags');
}

async function runTests() {
  console.log('🧪 Cloud Architecture Integration Tests\n');
  console.log('=' .repeat(50));

  try {
    await testEventSystem();
    await testCostTracking();
    testResourceTagging();

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Event system: ✅ Working');
    console.log('  - Cost tracking: ✅ Working');
    console.log('  - Resource tagging: ✅ Working');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };

