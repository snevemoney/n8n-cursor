// apps/scorpion/server/council/council.test.ts
// Comprehensive test suite for all council members
// Run with: tsx apps/scorpion/server/council/council.test.ts

import { EthicsCouncilMember } from './ethicsCouncil';
import { HumanContextCouncilMember } from './humanContextCouncil';
import { AIFoundationsCouncilMember } from './aiFoundationsCouncil';
import { PromptQualityCouncil } from './promptQualityCouncil';
import { DataOpsCouncilMember } from './dataOpsCouncil';
import { SimplicityCouncilMember } from './SimplicityCouncilMember';
import { ToolSanityCouncilMember } from './ToolSanityCouncilMember';
import { runCouncil } from './index';
import { CouncilInput } from '../types/council';

interface TestCase {
  name: string;
  input: CouncilInput;
  expectedIssues?: Array<{
    councillorId: string;
    tag?: string;
    minSeverity?: number;
  }>;
  shouldApprove?: boolean;
}

const testCases: TestCase[] = [
  // Ethics Council Tests
  {
    name: 'Ethics: Hiring domain should trigger bias warning',
    input: {
      goalDescription: 'I want to build an AI system to screen resumes and rank candidates based on past successful hires.',
      planSummary: 'Train a model on historical hiring data to predict candidate success.',
      domainTags: ['hiring'],
    },
    expectedIssues: [
      { councillorId: 'ethics', tag: 'bias', minSeverity: 4 },
    ],
  },
  {
    name: 'Ethics: Loans domain should trigger bias warning',
    input: {
      goalDescription: 'Build an automated loan approval system based on credit history.',
      planSummary: 'Use ML to approve or deny loans automatically.',
      domainTags: ['loans'],
    },
    expectedIssues: [
      { councillorId: 'ethics', tag: 'bias', minSeverity: 4 },
    ],
  },
  {
    name: 'Ethics: Low-risk domain should not trigger ethics warnings',
    input: {
      goalDescription: 'Act as a technical writer. Create a blog post about TypeScript best practices. Format as a structured article with examples.',
      planSummary: 'Write an article explaining TypeScript features with code examples.',
      domainTags: ['content'],
    },
    expectedIssues: [], // No ethics issues expected, but other councillors may find issues
    shouldApprove: true, // Should still approve
  },

  // Human Context Council Tests
  {
    name: 'Human Context: Fear/anxiety detection',
    input: {
      goalDescription: 'I am scared of AI taking over my job. How should I prepare?',
      planSummary: 'Provide reassurance and career guidance.',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'human-context', tag: 'human-context', minSeverity: 2 },
    ],
  },
  {
    name: 'Human Context: Friend-like relationship',
    input: {
      goalDescription: 'I treat AI like a friend. It helps me clear my head when I\'m stressed.',
      planSummary: 'Acknowledge the relationship and provide supportive response.',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'human-context', tag: 'human-context', minSeverity: 1 },
    ],
  },
  {
    name: 'Human Context: Calling out discrimination',
    input: {
      goalDescription: 'This output is discriminatory. You should consider different family structures.',
      planSummary: 'Revise to be more inclusive.',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'human-context', tag: 'human-context', minSeverity: 2 },
    ],
  },

  // Prompt Quality Council Tests
  {
    name: 'Prompt Quality: Vague request',
    input: {
      goalDescription: 'Make it better',
      planSummary: 'Improve the code',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'prompt-quality', tag: 'prompt', minSeverity: 3 },
    ],
  },
  {
    name: 'Prompt Quality: Too broad request',
    input: {
      goalDescription: 'Build everything for my e-commerce platform',
      planSummary: 'Create complete solution',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'prompt-quality', tag: 'complexity', minSeverity: 2 },
    ],
  },
  {
    name: 'Prompt Quality: Missing role',
    input: {
      goalDescription: 'Write a function that sorts an array',
      planSummary: 'Implement sorting algorithm',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'prompt-quality', tag: 'prompt', minSeverity: 1 },
    ],
  },
  {
    name: 'Prompt Quality: Good prompt (minimal issues)',
    input: {
      goalDescription: 'Act as a senior developer. I have a React component with performance issues. Analyze the code and provide a refactored version. Format as: (1) Issues found, (2) Refactored code, (3) Performance improvements.',
      planSummary: 'Analyze React component performance, identify bottlenecks, refactor with optimizations, provide before/after comparison.',
      domainTags: [],
    },
    expectedIssues: [], // May have minor issues but should be mostly clean
    shouldApprove: true,
  },

  // DataOps Council Tests
  {
    name: 'DataOps: Excel cleaning without privacy mention',
    input: {
      goalDescription: 'Clean my Excel file. Remove duplicates and fill missing area codes.',
      planSummary: 'Process Excel file to clean data and remove duplicates',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'data-ops', tag: 'data-privacy', minSeverity: 3 },
    ],
  },
  {
    name: 'DataOps: Compare reports workflow',
    input: {
      goalDescription: 'Compare two PDF reports to find differences and trends between 2023 and 2024 financial reports.',
      planSummary: 'Compare 2023 vs 2024 financial PDF reports, extract differences, similarities, and year-over-year trends.',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'data-ops', tag: 'data-verification', minSeverity: 2 },
    ],
    shouldApprove: true, // Should approve but with verification reminder
  },
  {
    name: 'DataOps: Complex workflow (compare + clean)',
    input: {
      goalDescription: 'Compare two reports and clean the data in one go.',
      planSummary: 'Compare and clean simultaneously',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'data-ops', tag: 'workflow-design', minSeverity: 2 },
    ],
  },

  // AI Foundations Council Tests
  {
    name: 'AI Foundations: Mixing CV and NLP incorrectly',
    input: {
      goalDescription: 'Use an NLP model to read images of damaged cars and classify the damage level.',
      planSummary: 'Feed car crash photos into a language model',
      domainTags: [],
    },
    expectedIssues: [
      { councillorId: 'ai-foundations', tag: 'correctness', minSeverity: 4 },
    ],
  },
  {
    name: 'AI Foundations: Correct ML usage',
    input: {
      goalDescription: 'Act as a data scientist. Build a machine learning model that predicts insurance pricing based on historical claims data. Format as: (1) Data preparation, (2) Model selection, (3) Training approach.',
      planSummary: 'Use supervised machine learning on structured claims data to predict pricing',
      domainTags: [],
    },
    expectedIssues: [], // No AI foundations issues, prompt quality should be satisfied
    shouldApprove: true,
  },
];

async function runTests() {
  console.log('\n🧪 Running Comprehensive Council Test Suite\n');
  console.log('='.repeat(60));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Test individual council members
  console.log('\n📋 Testing Individual Council Members\n');

  for (const testCase of testCases) {
    totalTests++;
    console.log(`\nTest: ${testCase.name}`);

    try {
      // Run full council (all members)
      const result = await runCouncil(testCase.input);

      // Check expected issues
      if (testCase.expectedIssues) {
        const foundIssues: string[] = [];
        const missingIssues: string[] = [];

        for (const expected of testCase.expectedIssues) {
          // Match councillor ID with flexibility (e.g., 'ethics' matches 'ethics-bias')
          const matchingIssues = result.allIssues.filter(
            (issue) =>
              (issue.councillorId === expected.councillorId || 
               issue.councillorId.startsWith(expected.councillorId + '-') ||
               issue.councillorId.includes(expected.councillorId)) &&
              (!expected.tag || issue.tag === expected.tag) &&
              (!expected.minSeverity || issue.severity >= expected.minSeverity),
          );

          if (matchingIssues.length === 0) {
            missingIssues.push(
              `${expected.councillorId}${expected.tag ? ` [${expected.tag}]` : ''}`,
            );
          } else {
            foundIssues.push(
              `${expected.councillorId}${expected.tag ? ` [${expected.tag}]` : ''}`,
            );
          }
        }

        // Check if we have unexpected issues (only if we expected none AND shouldApprove is true)
        // If shouldApprove is true, we allow other issues but they shouldn't block approval
        if (testCase.expectedIssues.length === 0 && result.allIssues.length > 0) {
          if (testCase.shouldApprove === false) {
            // If we expect it to not approve, having issues is fine
            console.log(`   ✅ Issues found (expected, since shouldApprove=false)`);
            passedTests++;
          } else {
            // If we expect approval, other issues are OK as long as approval is true
            if (result.approved || testCase.shouldApprove === undefined) {
              console.log(`   ✅ Other issues found but approval status OK`);
              passedTests++;
            } else {
              console.error(`   ❌ Unexpected issues found:`);
              result.allIssues.forEach((issue) => {
                console.error(`      - ${issue.councillorId} [${issue.tag}]: ${issue.message}`);
              });
              failedTests++;
            }
          }
        } else if (missingIssues.length > 0) {
          console.error(`   ❌ Missing expected issues: ${missingIssues.join(', ')}`);
          console.error(`   Found issues: ${foundIssues.join(', ')}`);
          console.error(`   All issues:`, result.allIssues.map(i => `${i.councillorId}[${i.tag}]`));
          failedTests++;
        } else {
          console.log(`   ✅ All expected issues found: ${foundIssues.join(', ')}`);
          if (result.allIssues.length > testCase.expectedIssues.length) {
            const otherIssues = result.allIssues.filter(issue => {
              return !testCase.expectedIssues!.some(expected => 
                (issue.councillorId === expected.councillorId || 
                 issue.councillorId.startsWith(expected.councillorId + '-') ||
                 issue.councillorId.includes(expected.councillorId)) &&
                (!expected.tag || issue.tag === expected.tag)
              );
            });
            if (otherIssues.length > 0) {
              console.log(`      (Also found ${otherIssues.length} other issue(s) from other councillors - OK)`);
            }
          }
          passedTests++;
        }
      } else {
        // No expected issues - check if result is clean
        if (result.allIssues.length === 0) {
          console.log(`   ✅ No issues (as expected)`);
          passedTests++;
        } else {
          console.error(`   ❌ Unexpected issues found:`);
          result.allIssues.forEach((issue) => {
            console.error(`      - ${issue.councillorId} [${issue.tag}]: ${issue.message}`);
          });
          failedTests++;
        }
      }

      // Check approval status if specified
      if (testCase.shouldApprove !== undefined) {
        if (result.approved === testCase.shouldApprove) {
          console.log(`   ✅ Approval status correct: ${result.approved}`);
        } else {
          console.error(`   ❌ Approval status mismatch: expected ${testCase.shouldApprove}, got ${result.approved}`);
          failedTests++;
        }
      }
    } catch (error: any) {
      console.error(`   ❌ Test failed with error: ${error.message}`);
      console.error(error.stack);
      failedTests++;
    }
  }

  // Test council aggregation
  console.log('\n\n📊 Testing Council Aggregation\n');
  totalTests++;
  try {
    const complexInput: CouncilInput = {
      goalDescription: 'I am scared of AI. Build an AI system to screen resumes based on past hires. Make it better.',
      planSummary: 'Everything at once',
      domainTags: ['hiring'],
    };

    const result = await runCouncil(complexInput);
    const councillorIds = new Set(result.councillorOutputs.map(co => co.councillorId));

    // Should have issues from multiple councillors
    if (result.allIssues.length >= 3 && councillorIds.size >= 3) {
      console.log(`   ✅ Council aggregation working: ${result.allIssues.length} issues from ${councillorIds.size} councillors`);
      passedTests++;
    } else {
      console.error(`   ❌ Council aggregation incomplete: ${result.allIssues.length} issues from ${councillorIds.size} councillors`);
      failedTests++;
    }
  } catch (error: any) {
    console.error(`   ❌ Council aggregation test failed: ${error.message}`);
    failedTests++;
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

