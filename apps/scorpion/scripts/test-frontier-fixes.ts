/**
 * Frontier-Level Fixes Test Suite
 * 
 * Tests the 4 critical fixes:
 * 1. Safety-guard tolerant parsing (no "unsafe" enum errors)
 * 2. Executor tolerant parsing (no "success|failed|skipped" errors)
 * 3. Intent-aware self-correction (no KB for system_debug)
 * 4. Intent-specific summarizer (no "web sources" for system_debug)
 * 
 * Usage: pnpm --filter scorpion tsx scripts/test-frontier-fixes.ts
 */

interface TestCase {
  name: string;
  prompt: string;
  expectedIntent: string;
  expectedTools: string[];
  forbiddenTools?: string[];
  forbiddenPhrases?: string[];
  maxLatencyMs?: number;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'System Health Check',
    prompt: 'Check system health',
    expectedIntent: 'system_debug',
    expectedTools: ['system.health', 'stats.get'],
    forbiddenTools: ['kb.search', 'research.run', 'research.start'],
    forbiddenPhrases: ['web sources', 'internet search', 'research', 'I was unable to find'],
    maxLatencyMs: 15000, // Should be fast without retries
  },
  {
    name: 'System Logs Query',
    prompt: 'Show last 20 error logs',
    expectedIntent: 'system_debug',
    expectedTools: ['logs.tail'],
    forbiddenTools: ['kb.search', 'research.run'],
    forbiddenPhrases: ['web sources', 'internet search'],
  },
  {
    name: 'Internal Docs Query',
    prompt: 'Explain how the planner works in Scorpion',
    expectedIntent: 'project_help',
    expectedTools: ['kb.search'],
    forbiddenTools: ['system.health', 'stats.get'],
  },
];

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  errors: string[];
  warnings: string[];
  actualIntent?: string;
  actualTools?: string[];
  response?: string;
  latencyMs?: number;
}

async function runTest(testCase: TestCase, baseUrl: string = 'http://localhost:3003'): Promise<TestResult> {
  const result: TestResult = {
    testCase,
    passed: true,
    errors: [],
    warnings: [],
  };

  const startTime = Date.now();

  try {
    const response = await fetch(`${baseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId: `test-${Date.now()}`,
        messages: [
          {
            role: 'user',
            content: testCase.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      result.errors.push(`HTTP ${response.status}: ${response.statusText}`);
      result.passed = false;
      return result;
    }

    // Read SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let intent: string | undefined;
    let tools: string[] = [];
    let finalMessage = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Extract intent
              if (data.type === 'intent' || data.data?.intent) {
                intent = data.data?.intent || data.intent;
                result.actualIntent = intent;
              }

              // Extract tools used from multiple event types
              if (data.type === 'tool' || data.type === 'tool_call') {
                const toolName = data.data?.tool || data.tool;
                if (toolName && !tools.includes(toolName)) {
                  tools.push(toolName);
                }
              }
              
              // Also check plan_step events (tools are shown there too)
              if (data.type === 'plan_step' && data.data?.tool) {
                const toolName = data.data.tool;
                if (toolName && toolName !== 'none' && !tools.includes(toolName)) {
                  tools.push(toolName);
                }
              }
              
              // Also check plan events (plan structure shows tools)
              if (data.type === 'plan' && data.data?.plan) {
                const planData = data.data.plan;
                // Handle both plan.plan (array) and plan.plan.plan (nested)
                const planSteps = planData.plan || (Array.isArray(planData) ? planData : []);
                if (Array.isArray(planSteps)) {
                  for (const step of planSteps) {
                    if (step.tool && step.tool !== 'none' && !tools.includes(step.tool)) {
                      tools.push(step.tool);
                    }
                  }
                }
              }

              // Extract final message
              if (data.type === 'message' && data.data?.role === 'assistant') {
                finalMessage = data.data.content || '';
                result.response = finalMessage;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    }

    result.actualTools = tools;
    result.latencyMs = Date.now() - startTime;

    // Validate intent
    if (testCase.expectedIntent && intent !== testCase.expectedIntent) {
      result.errors.push(`Intent mismatch: expected "${testCase.expectedIntent}", got "${intent}"`);
      result.passed = false;
    }

    // Validate expected tools
    for (const tool of testCase.expectedTools) {
      if (!tools.includes(tool)) {
        result.errors.push(`Missing expected tool: ${tool}`);
        result.passed = false;
      }
    }

    // Validate forbidden tools
    if (testCase.forbiddenTools) {
      for (const tool of testCase.forbiddenTools) {
        if (tools.includes(tool)) {
          result.errors.push(`Forbidden tool used: ${tool}`);
          result.passed = false;
        }
      }
    }

    // Validate forbidden phrases in response
    if (testCase.forbiddenPhrases && finalMessage) {
      const lowerResponse = finalMessage.toLowerCase();
      for (const phrase of testCase.forbiddenPhrases) {
        if (lowerResponse.includes(phrase.toLowerCase())) {
          result.errors.push(`Forbidden phrase found in response: "${phrase}"`);
          result.passed = false;
        }
      }
    }

    // Validate latency
    if (testCase.maxLatencyMs && result.latencyMs > testCase.maxLatencyMs) {
      result.warnings.push(`Latency ${result.latencyMs}ms exceeds max ${testCase.maxLatencyMs}ms`);
    }

  } catch (error: any) {
    result.errors.push(`Test execution failed: ${error.message}`);
    result.passed = false;
  }

  return result;
}

async function main() {
  console.log('🧪 Frontier-Level Fixes Test Suite\n');
  console.log('Testing 4 critical fixes:');
  console.log('  1. Safety-guard tolerant parsing');
  console.log('  2. Executor tolerant parsing');
  console.log('  3. Intent-aware self-correction');
  console.log('  4. Intent-specific summarizer\n');

  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3003';
  console.log(`Testing against: ${baseUrl}\n`);

  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    console.log(`Running: ${testCase.name}...`);
    const result = await runTest(testCase, baseUrl);
    results.push(result);

    if (result.passed) {
      console.log(`  ✅ PASSED (${result.latencyMs}ms)`);
      if (result.warnings.length > 0) {
        result.warnings.forEach(w => console.log(`     ⚠️  ${w}`));
      }
    } else {
      console.log(`  ❌ FAILED`);
      result.errors.forEach(e => console.log(`     ❌ ${e}`));
    }
    console.log('');
  }

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Results: ${passed}/${total} tests passed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (passed === total) {
    console.log('✅ All tests passed! Frontier-level fixes are working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Review errors above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { runTest, TEST_CASES };

