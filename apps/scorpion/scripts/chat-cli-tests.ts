#!/usr/bin/env tsx

/**
 * Multi-chat terminal test harness
 * Runs multiple chat scenarios through the real /api/chat/stream pipeline
 * with configurable concurrency, without requiring the UI.
 * 
 * Usage:
 *   pnpm test:chat
 *   pnpm test:chat --concurrency=3
 *   pnpm test:chat --filter=scorpion
 *   pnpm test:chat --max=5
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestScenario {
  id: string;
  prompt: string;
  tags?: string[];
  expectedIntent?: string;
  expectedTools?: string[];
}

interface TestResult {
  scenarioId: string;
  success: boolean;
  intent: string;
  phases: string[];
  toolsUsed: string[];
  responseSnippet: string;
  error?: string;
  latencyMs: number;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const CHAT_API = `${BASE_URL}/api/chat/stream`;

// Parse CLI args
const args = process.argv.slice(2);
const concurrencyArg = args.find(a => a.startsWith('--concurrency='));
const filterArg = args.find(a => a.startsWith('--filter='));
const maxArg = args.find(a => a.startsWith('--max='));

const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 3;
const FILTER = filterArg ? filterArg.split('=')[1] : undefined;
const MAX_TESTS = maxArg ? parseInt(maxArg.split('=')[1], 10) : undefined;

// Load test scenarios
function loadScenarios(): TestScenario[] {
  const scenariosPath = join(process.cwd(), 'apps/scorpion/scripts/chat-test-scenarios.json');
  
  // Try to load from JSON file first
  if (existsSync(scenariosPath)) {
    try {
      const content = readFileSync(scenariosPath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.warn(`[Warning] Failed to load ${scenariosPath}, using default scenarios`);
    }
  }
  
  // Fallback to inline scenarios
  return [
    { id: 'simple_hi', prompt: 'hi', tags: ['small_talk'], expectedIntent: 'small_talk' },
    { id: 'scorpion_arch', prompt: 'Explain the architecture', tags: ['project_help'], expectedTools: ['code.readFile'] },
    { id: 'scorpion_what', prompt: 'What is Scorpion?', tags: ['project_help'], expectedTools: ['code.readFile'] },
    { id: 'btc_news', prompt: 'Research Bitcoin news', tags: ['research'], expectedTools: ['research.run'] },
    { id: 'health', prompt: 'Check system health', tags: ['operational'], expectedTools: ['system.health'] },
    { id: 'recent_files', prompt: 'Show me recent files', tags: ['operational'], expectedTools: ['files.recent'] },
  ];
}

async function runTest(scenario: TestScenario): Promise<TestResult> {
  const startTime = Date.now();
  const phases: string[] = [];
  const toolsUsed: string[] = [];
  let responseSnippet = '';
  let intent = 'unknown';
  let error: string | undefined;
  let success = false;

  try {
    const response = await fetch(CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: scenario.prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let planFound = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            // Track intent
            if (data.type === 'debug' && data.data?.intent) {
              intent = data.data.intent;
            }
            if (data.type === 'intent') {
              intent = data.data?.intent || intent;
            }
            
            // Track phases
            if (data.type === 'status' && data.data?.phase) {
              const phase = data.data.phase;
              if (!phases.includes(phase)) {
                phases.push(phase);
              }
            }
            
            // Track plan and tools
            if (data.type === 'plan') {
              planFound = true;
              const planData = data.data;
              
              // Handle nested structure
              let planSteps: any[] = [];
              if (planData.plan && planData.plan.plan && Array.isArray(planData.plan.plan)) {
                planSteps = planData.plan.plan;
              } else if (planData.plan && Array.isArray(planData.plan)) {
                planSteps = planData.plan;
              } else if (Array.isArray(planData)) {
                planSteps = planData;
              }
              
              planSteps.forEach((step: any) => {
                if (step.tool && step.tool !== 'none') {
                  toolsUsed.push(step.tool);
                }
              });
            }
            
            // Track tool calls
            if (data.type === 'tool' && data.data?.tool) {
              const tool = data.data.tool;
              if (tool !== 'none' && !toolsUsed.includes(tool)) {
                toolsUsed.push(tool);
              }
            }
            
            // Track response content
            if (data.type === 'content') {
              responseSnippet += data.data || '';
            }
            
            // Track errors
            if (data.type === 'error') {
              error = data.data?.message || 'Unknown error';
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    // Success if we got a response (even if no plan for identity/small_talk)
    success = !error && (responseSnippet.length > 0 || planFound);
    
    // For identity/small_talk, success is just having a response
    if (intent === 'identity' || intent === 'small_talk') {
      success = !error && responseSnippet.length > 0;
    }
  } catch (err: any) {
    error = err.message;
    success = false;
  }

  return {
    scenarioId: scenario.id,
    success,
    intent,
    phases: [...new Set(phases)],
    toolsUsed: [...new Set(toolsUsed)],
    responseSnippet: responseSnippet.substring(0, 150),
    error,
    latencyMs: Date.now() - startTime,
  };
}

async function runTestsWithConcurrency(
  scenarios: TestScenario[],
  concurrency: number
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const queue = [...scenarios];
  const running: Promise<void>[] = [];

  while (queue.length > 0 || running.length > 0) {
    // Start new tests up to concurrency limit
    while (running.length < concurrency && queue.length > 0) {
      const scenario = queue.shift()!;
      const promise = runTest(scenario).then(result => {
        results.push(result);
        const index = running.indexOf(promise);
        if (index > -1) {
          running.splice(index, 1);
        }
      }).catch(err => {
        results.push({
          scenarioId: scenario.id,
          success: false,
          intent: 'unknown',
          phases: [],
          toolsUsed: [],
          responseSnippet: '',
          error: err.message,
          latencyMs: 0,
        });
        const index = running.indexOf(promise);
        if (index > -1) {
          running.splice(index, 1);
        }
      });
      running.push(promise);
    }
    
    // Wait for at least one to complete
    if (running.length > 0) {
      await Promise.race(running);
    }
  }

  return results;
}

function formatResult(result: TestResult, scenario?: TestScenario): string {
  const status = result.success ? '✅' : '❌';
  const intentStr = result.intent || 'unknown';
  const toolsStr = result.toolsUsed.length > 0 ? result.toolsUsed.join(',') : '';
  const phasesStr = result.phases.length > 0 ? result.phases.join(',') : '';
  const latencyStr = `${result.latencyMs}ms`;
  
  let line = `[${result.scenarioId}] intent=${intentStr} tools=[${toolsStr}] phases=[${phasesStr}] ${latencyStr}`;
  
  if (result.error) {
    line += ` ERROR: ${result.error.substring(0, 50)}`;
  }
  
  // Check expectations if provided
  if (scenario) {
    if (scenario.expectedIntent && result.intent !== scenario.expectedIntent) {
      line += ` ⚠️ expected intent: ${scenario.expectedIntent}`;
    }
    if (scenario.expectedTools) {
      const missing = scenario.expectedTools.filter(t => !result.toolsUsed.includes(t));
      if (missing.length > 0) {
        line += ` ⚠️ missing tools: ${missing.join(',')}`;
      }
    }
  }
  
  return line;
}

async function main() {
  let scenarios = loadScenarios();
  
  // Apply filters
  if (FILTER) {
    scenarios = scenarios.filter(s => 
      s.id.includes(FILTER) || 
      s.prompt.toLowerCase().includes(FILTER.toLowerCase())
    );
  }
  
  if (MAX_TESTS) {
    scenarios = scenarios.slice(0, MAX_TESTS);
  }
  
  if (scenarios.length === 0) {
    console.error('No scenarios to run');
    process.exit(1);
  }
  
  console.log(`🚀 Running ${scenarios.length} chat tests (concurrency: ${CONCURRENCY})`);
  console.log(`   Base URL: ${BASE_URL}`);
  if (FILTER) console.log(`   Filter: ${FILTER}`);
  if (MAX_TESTS) console.log(`   Max tests: ${MAX_TESTS}`);
  console.log();
  
  const results = await runTestsWithConcurrency(scenarios, CONCURRENCY);
  
  // Print results
  console.log('📊 Test Results\n');
  results.forEach(result => {
    const scenario = scenarios.find(s => s.id === result.scenarioId);
    console.log(formatResult(result, scenario));
  });
  
  // Summary
  const successCount = results.filter(r => r.success).length;
  const totalLatency = results.reduce((sum, r) => sum + r.latencyMs, 0);
  const avgLatency = Math.round(totalLatency / results.length);
  
  console.log();
  console.log(`✅ ${successCount}/${results.length} tests passed`);
  console.log(`⏱️  Average latency: ${avgLatency}ms`);
  
  process.exit(successCount === results.length ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

