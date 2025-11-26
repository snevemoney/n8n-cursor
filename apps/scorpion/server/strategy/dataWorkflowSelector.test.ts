// apps/scorpion/server/strategy/dataWorkflowSelector.test.ts
// Test the Data Workflow Selector
// Run with: tsx apps/scorpion/server/strategy/dataWorkflowSelector.test.ts

import { selectDataWorkflow, DataWorkflowId } from './dataWorkflowSelector';

interface TestCase {
  name: string;
  text: string;
  domainTags?: string[];
  expectedWorkflow: DataWorkflowId;
  minConfidence?: number;
}

const testCases: TestCase[] = [
  {
    name: 'Compare PDF reports',
    text: 'Compare two PDF reports to find differences and similarities between 2023 and 2024 financials.',
    expectedWorkflow: 'COMPARE_REPORTS',
    minConfidence: 0.8,
  },
  {
    name: 'Clean Excel file',
    text: 'Clean my Excel file. Remove duplicates and fill missing area codes.',
    expectedWorkflow: 'CLEAN_TABULAR',
    minConfidence: 0.8,
  },
  {
    name: 'Enrich tabular data',
    text: 'Enrich my Excel file. Add a new column to calculate customer segments based on purchase amount in column E.',
    expectedWorkflow: 'ENRICH_TABULAR',
    minConfidence: 0.7,
  },
  {
    name: 'Simulate scenarios',
    text: 'Run a what-if simulation. What happens if we increase prices by 10%?',
    expectedWorkflow: 'SIMULATE_SCENARIOS',
    minConfidence: 0.7,
  },
  {
    name: 'Summarize single report',
    text: 'Summarize this PDF report and extract key indicators.',
    expectedWorkflow: 'SUMMARIZE_REPORT',
    minConfidence: 0.7,
  },
  {
    name: 'Non-data task',
    text: 'Write a blog post about TypeScript best practices.',
    expectedWorkflow: 'NONE',
    minConfidence: 0.0,
  },
];

async function runTests() {
  console.log('\n🧪 Testing Data Workflow Selector\n');
  console.log('='.repeat(60));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    totalTests++;
    console.log(`\nTest: ${testCase.name}`);

    try {
      const result = selectDataWorkflow({
        text: testCase.text,
        domainTags: testCase.domainTags,
      });

      const workflowMatch = result.id === testCase.expectedWorkflow;
      const confidenceMatch = testCase.minConfidence
        ? result.confidence >= testCase.minConfidence
        : true;

      if (workflowMatch && confidenceMatch) {
        console.log(`   ✅ Correct workflow: ${result.id} (confidence: ${(result.confidence * 100).toFixed(0)}%)`);
        if (result.notes) {
          console.log(`      Notes: ${result.notes}`);
        }
        passedTests++;
      } else {
        console.error(`   ❌ Expected: ${testCase.expectedWorkflow} (min confidence: ${testCase.minConfidence || 0})`);
        console.error(`      Got: ${result.id} (confidence: ${(result.confidence * 100).toFixed(0)}%)`);
        failedTests++;
      }
    } catch (error: any) {
      console.error(`   ❌ Test failed with error: ${error.message}`);
      failedTests++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests > 0) {
    console.error('❌ Some tests failed. Please review the output above.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});

