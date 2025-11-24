/**
 * Tool Matrix Test Harness
 * Runs end-to-end tests for all Scorpion tools via casual prompts
 * 
 * Usage: pnpm diag:tools
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { withToolSpy, writeReports, ToolSpyEvent, ToolMatrixReport } from '@scorpion/core/devtools/tool-spy';
import { getScenarios, Scenario } from '@scorpion/core/devtools/scenarios';
import { executeTool, listTools, tools } from '../lib/chat/tools';
import { ScorpionOrchestrator } from '@scorpion/core';
import { runModelUnified, parseModelJSON } from '../lib/chat/modelRunner';
import { runCouncilDeliberationStreaming, computeConsensus } from '../lib/chat/council';
import { remember } from '../lib/chat/memory';
import { classifyIntent, getToolsForIntent, shouldUseKnowledgeBase } from '../lib/chat/intent';
import type { Message } from '../lib/chat/types';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config(); // Try default .env
}

interface ScenarioResult {
  id: string;
  label: string;
  status: 'passed' | 'failed' | 'skipped';
  plannerOk: boolean;
  forcedOk: boolean;
  toolsSeen: string[];
  notes: string[];
}

async function runToolMatrix(options?: { conversationId?: string; onEvent?: (event: any) => void }): Promise<void> {
  console.log('🔧 Tool Matrix Test Harness');
  console.log('============================\n');

  // Collect all tool events
  const toolEvents: ToolSpyEvent[] = [];
  const onToolEvent = (event: ToolSpyEvent) => {
    toolEvents.push(event);
  };

  // Wrap executeTool with spy
  const spiedExecuteTool = withToolSpy(executeTool, onToolEvent);

  // Get planner model from env (PLANNER_MODEL takes precedence, fallback to OLLAMA_MODEL)
  const plannerModel = process.env.PLANNER_MODEL || process.env.OLLAMA_MODEL || 'llama3.1:8b';
  const plannerProvider = process.env.OLLAMA_PROVIDER || 'ollama';
  
  console.log(`Using planner model: ${plannerModel} (provider: ${plannerProvider})`);
  console.log(`Note: If model not found, set PLANNER_MODEL or OLLAMA_MODEL to an installed model\n`);

  // Initialize orchestrator (simplified - we'll use it for planner mode)
  const orchestrator = new ScorpionOrchestrator({
    provider: plannerProvider,
    model: plannerModel,
    lightweightMode: true,
    runModelUnified,
    parseModelJSON,
    runCouncilDeliberationStreaming,
    computeConsensus,
    executeTool: spiedExecuteTool,
    remember: () => {}, // No-op for tests
    classifyIntent,
    getToolsForIntent,
    shouldUseKnowledgeBase,
  });

  // Get all scenarios
  const scenarios = getScenarios();
  const scenarioResults: ScenarioResult[] = [];

  // Get all available tools
  const allToolNames = Object.keys(tools);
  const totalTools = allToolNames.length;

  console.log(`Found ${totalTools} tools in registry\n`);

  // Run each scenario
  for (const scenario of scenarios) {
    console.log(`\n📋 Scenario: ${scenario.label} (${scenario.id})`);

    // Check if gated
    if (scenario.gatedByEnv) {
      const envValue = process.env[scenario.gatedByEnv];
      if (envValue !== '1' && envValue !== 'true') {
        console.log(`  ⏭️  Skipped (gate: ${scenario.gatedByEnv})`);
        scenarioResults.push({
          id: scenario.id,
          label: scenario.label,
          status: 'skipped',
          plannerOk: false,
          forcedOk: false,
          toolsSeen: [],
          notes: [`Gated by ${scenario.gatedByEnv}`],
        });
        continue;
      }
    }

    const toolsBefore = new Set(toolEvents.map(e => e.tool));
    let plannerOk = false;
    const notes: string[] = [];

    // Try planner mode
    try {
      console.log(`  🤖 Planner mode: "${scenario.plannerPrompt}"`);
      
      // Broadcast status event
      options?.onEvent?.({
        type: 'status',
        data: {
          message: `Running scenario: ${scenario.label}`,
          phase: 'planning',
          stepId: scenario.id,
        },
      });
      
      const events: any[] = [];
      const send = (event: { type: string; data: any }) => {
        events.push(event);
        // Broadcast to SSE if onEvent provided
        options?.onEvent?.(event);
        // Track tool calls from events
        if (event.type === 'tool' && event.data?.tool) {
          onToolEvent({
            tool: event.data.tool,
            args: event.data.args || {},
            startedAt: Date.now(),
            finishedAt: Date.now(),
            ms: 0,
            ok: event.data.status === 'completed',
            error: event.data.error,
            phase: event.data.phase,
          });
        }
      };

      const checkAbort = () => {
        // No-op for tests
      };

      await orchestrator.handleChat(
        scenario.plannerPrompt,
        [],
        send,
        checkAbort,
        tools,
        undefined
      );

      plannerOk = true;
      notes.push('Planner executed successfully');
    } catch (error: any) {
      console.log(`  ⚠️  Planner failed: ${error.message}`);
      notes.push(`Planner error: ${error.message}`);
    }

    // Check which tools were called
    const toolsAfter = new Set(toolEvents.map(e => e.tool));
    const toolsSeenInPlanner = Array.from(toolsAfter).filter(t => !toolsBefore.has(t));

    // Check if expected tools were called
    const expectedToolsCalled = scenario.expectTools.some(tool => toolsSeenInPlanner.includes(tool));

    // If planner didn't call expected tools, try forced mode
    let forcedOk = false;
    if (!expectedToolsCalled && scenario.forcedSteps) {
      console.log(`  🔧 Forced mode: executing ${scenario.forcedSteps.length} steps`);
      
      // Broadcast forced mode start
      options?.onEvent?.({
        type: 'status',
        data: {
          message: `Forced mode: ${scenario.label}`,
          phase: 'executing',
          stepId: scenario.id,
        },
      });
      
      for (const step of scenario.forcedSteps) {
        try {
          // Substitute placeholders if needed
          let args = step.args;
          if (typeof args === 'object' && args !== null) {
            const argsStr = JSON.stringify(args);
            // Simple placeholder substitution (could be enhanced)
            args = JSON.parse(argsStr);
          }

          // Broadcast tool call start
          const callId = `${scenario.id}-${step.tool}-${Date.now()}`;
          options?.onEvent?.({
            type: 'tool',
            data: {
              tool: step.tool,
              callId,
              args,
              status: 'running',
            },
          });

          const result = await spiedExecuteTool(step.tool, args);
          
          // Broadcast tool call completion
          options?.onEvent?.({
            type: 'tool',
            data: {
              tool: step.tool,
              callId,
              args,
              status: 'completed',
              result: typeof result === 'string' ? result.slice(0, 200) : JSON.stringify(result).slice(0, 200),
            },
          });
          
          forcedOk = true;
          notes.push(`Forced: ${step.tool} executed`);
        } catch (error: any) {
          const errorMsg = error?.message || String(error);
          notes.push(`Forced: ${step.tool} failed - ${errorMsg}`);
          
          // Broadcast tool call failure
          options?.onEvent?.({
            type: 'tool',
            data: {
              tool: step.tool,
              callId: `${scenario.id}-${step.tool}-${Date.now()}`,
              args: step.args,
              status: 'failed',
              error: errorMsg,
            },
          });
          // Continue with next step
        }
      }
    }

    // Determine final status
    const allToolsSeen = Array.from(
      new Set(
        toolEvents
          .map((e) => e.tool)
          .filter((t) => scenario.expectTools.includes(t) || toolsSeenInPlanner.includes(t))
      )
    );

    let status: 'passed' | 'failed' | 'skipped' = 'failed';
    if (allToolsSeen.length > 0) {
      status = 'passed';
    } else if (scenario.gatedByEnv) {
      status = 'skipped';
    }

    scenarioResults.push({
      id: scenario.id,
      label: scenario.label,
      status,
      plannerOk,
      forcedOk,
      toolsSeen: allToolsSeen,
      notes,
    });

    console.log(`  ${status === 'passed' ? '✓' : status === 'failed' ? '✗' : '—'} Status: ${status}`);
    console.log(`  Tools seen: ${allToolsSeen.length > 0 ? allToolsSeen.join(', ') : 'none'}`);
  }

  // Aggregate tool statistics
  const toolStats: Record<string, {
    calls: number;
    ok: number;
    failed: number;
    msTotal: number;
    avgMs: number;
    lastError?: string;
  }> = {};

  for (const event of toolEvents) {
    if (!toolStats[event.tool]) {
      toolStats[event.tool] = {
        calls: 0,
        ok: 0,
        failed: 0,
        msTotal: 0,
        avgMs: 0,
      };
    }

    const stats = toolStats[event.tool];
    stats.calls++;
    if (event.ok) {
      stats.ok++;
    } else {
      stats.failed++;
      if (event.error) {
        stats.lastError = event.error;
      }
    }
    if (event.ms) {
      stats.msTotal += event.ms;
      stats.avgMs = stats.msTotal / stats.calls;
    }
  }

  // Compute coverage
  const toolsAttempted = Object.keys(toolStats).length;
  const toolsSucceeded = Object.values(toolStats).filter(s => s.ok > 0).length;
  const toolsFailed = Object.values(toolStats).filter(s => s.failed > 0 && s.ok === 0).length;
  const coveragePercent = totalTools > 0 ? (toolsAttempted / totalTools) * 100 : 0;

  // Aggregate errors
  const errorMap = new Map<string, { tool: string; message: string; count: number }>();
  for (const event of toolEvents) {
    if (event.error) {
      const key = `${event.tool}:${event.error}`;
      const existing = errorMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        errorMap.set(key, {
          tool: event.tool,
          message: event.error,
          count: 1,
        });
      }
    }
  }
  const errors = Array.from(errorMap.values()).sort((a, b) => b.count - a.count);

  // Generate report
  const report: ToolMatrixReport = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      ALLOW_DESTRUCTIVE_TESTS: process.env.ALLOW_DESTRUCTIVE_TESTS,
      ALLOW_DEPLOY_TESTS: process.env.ALLOW_DEPLOY_TESTS,
      ALLOW_LLM_EVAL: process.env.ALLOW_LLM_EVAL,
    },
    coverage: {
      totalTools,
      toolsAttempted,
      toolsSucceeded,
      toolsFailed,
      coveragePercent,
    },
    tools: toolStats,
    scenarios: scenarioResults,
    errors,
  };

  // Write reports
  const reportsDir = resolve(process.cwd(), 'docs/diagnostics');
  const jsonPath = resolve(reportsDir, 'tool-matrix.json');
  const mdPath = resolve(reportsDir, 'tool-matrix.md');

  writeReports(report, { jsonPath, mdPath });

  console.log('\n📊 Report Summary');
  console.log('=================');
  console.log(`Total Tools: ${totalTools}`);
  console.log(`Tools Attempted: ${toolsAttempted}`);
  console.log(`Tools Succeeded: ${toolsSucceeded}`);
  console.log(`Tools Failed: ${toolsFailed}`);
  console.log(`Coverage: ${coveragePercent.toFixed(1)}%`);
  console.log(`\nReports written to:`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  MD:   ${mdPath}`);
}

// Run if executed directly
if (require.main === module) {
  runToolMatrix().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runToolMatrix };

