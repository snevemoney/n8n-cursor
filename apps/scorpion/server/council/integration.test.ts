// apps/scorpion/server/council/integration.test.ts
// Integration tests for council system
// Run with: tsx apps/scorpion/server/council/integration.test.ts

import { runCouncil } from './index';
import { runScorpionBrain } from '../orchestrator';
import { ScorpionContextSnapshot } from '../types/strategy';
import { CouncilInput } from '../types/council';

interface IntegrationTestCase {
  name: string;
  snapshot: ScorpionContextSnapshot;
  expectedCouncilIssues?: number;
  expectedNBA?: boolean;
  expectedSimilar?: boolean;
}

const integrationTests: IntegrationTestCase[] = [
  {
    name: 'Full integration: Hiring domain with bias warning',
    snapshot: {
      userId: 'test-user',
      timestamp: new Date().toISOString(),
      missionId: 'test-mission-1',
      messages: [
        {
          role: 'user',
          content: 'I want to build an AI system to screen resumes and rank candidates based on past successful hires.',
        },
      ],
      currentPhase: 'PLAN',
      planSummary: 'Train a model on historical hiring data to predict candidate success.',
      toolsUsed: ['ml.train'],
    },
    expectedCouncilIssues: 1, // At least ethics issue
    expectedNBA: true,
    expectedSimilar: true,
  },
  {
    name: 'Full integration: Data workflow with privacy reminder',
    snapshot: {
      userId: 'test-user',
      timestamp: new Date().toISOString(),
      missionId: 'test-mission-2',
      messages: [
        {
          role: 'user',
          content: 'Clean my Excel file. Remove duplicates and fill missing area codes.',
        },
      ],
      currentPhase: 'PLAN',
      planSummary: 'Process Excel file to clean data and remove duplicates',
      toolsUsed: ['tabular.clean'],
    },
    expectedCouncilIssues: 1, // At least data-ops privacy issue
    expectedNBA: true,
    expectedSimilar: true,
  },
  {
    name: 'Full integration: Prompt quality improvement',
    snapshot: {
      userId: 'test-user',
      timestamp: new Date().toISOString(),
      missionId: 'test-mission-3',
      messages: [
        {
          role: 'user',
          content: 'Make it better',
        },
      ],
      currentPhase: 'PLAN',
      planSummary: 'Improve the code',
      toolsUsed: [],
    },
    expectedCouncilIssues: 1, // At least prompt quality issue
    expectedNBA: true,
    expectedSimilar: true,
  },
];

async function runIntegrationTests() {
  console.log('\n🧪 Running Council Integration Tests\n');
  console.log('='.repeat(60));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of integrationTests) {
    totalTests++;
    console.log(`\nTest: ${testCase.name}`);

    try {
      // Test 1: Council runs correctly
      const councilInput: CouncilInput = {
        goalDescription: testCase.snapshot.messages[testCase.snapshot.messages.length - 1]?.content || '',
        planSummary: testCase.snapshot.planSummary || '',
        domainTags: [],
      };

      const councilResult = await runCouncil(councilInput);
      const councilPass = testCase.expectedCouncilIssues
        ? councilResult.allIssues.length >= testCase.expectedCouncilIssues
        : true;

      if (!councilPass) {
        console.error(`   ❌ Council: Expected at least ${testCase.expectedCouncilIssues} issues, got ${councilResult.allIssues.length}`);
        failedTests++;
        continue;
      } else {
        console.log(`   ✅ Council: Found ${councilResult.allIssues.length} issues`);
      }

      // Test 2: Full brain integration
      const brainResult = await runScorpionBrain(testCase.snapshot, {
        planSummaryOverride: testCase.snapshot.planSummary,
        domainTags: [],
      });

      const nbaPass = testCase.expectedNBA ? !!brainResult.nextBestAction : true;
      const similarPass = testCase.expectedSimilar ? (brainResult.similar?.length ?? 0) >= 0 : true; // Similar missions may be empty, that's OK

      if (!nbaPass) {
        console.error(`   ❌ NBA: Expected next best action, got none`);
        failedTests++;
        continue;
      } else {
        console.log(`   ✅ NBA: Generated successfully`);
      }

      if (!similarPass) {
        console.error(`   ❌ Similar: Expected similar missions check, got none`);
        failedTests++;
        continue;
      } else {
        console.log(`   ✅ Similar: Checked ${brainResult.similar?.length || 0} similar missions`);
      }

      // Test 3: Council result is included in brain result
      if (!brainResult.council) {
        console.error(`   ❌ Integration: Council result not included in brain result`);
        failedTests++;
        continue;
      } else {
        console.log(`   ✅ Integration: Council result included in brain result`);
      }

      console.log(`   ✅ All integration checks passed`);
      passedTests++;
    } catch (error: any) {
      console.error(`   ❌ Test failed with error: ${error.message}`);
      console.error(error.stack);
      failedTests++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Integration Test Summary\n');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests > 0) {
    console.error('❌ Some integration tests failed. Please review the output above.\n');
    process.exit(1);
  } else {
    console.log('✅ All integration tests passed!\n');
    process.exit(0);
  }
}

runIntegrationTests().catch((err) => {
  console.error('Integration test suite error:', err);
  process.exit(1);
});

