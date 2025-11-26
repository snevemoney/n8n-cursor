/**
 * Orchestrator Example - Integration with Transformer Architecture
 * 
 * Shows how to use the transformer mapping in a real orchestrator step.
 * This integrates:
 * - System prompt loader
 * - ResourceIndex backed by tool registry
 * - Decoder block execution
 */

import { createToolResourceIndex } from './toolResourceIndex';
import { getSystemPrompt, type RiskMode } from './systemPrompt';
import { runDecoderBlock } from '@/server/transformer/decoder-block';
import type { ScorpionContext, Event } from '@/server/transformer/scorpion-context';
import type { HeadOutput, IntegrationPlan } from '@/server/transformer/head-output';
import type { ResourceIndex } from '@/server/transformer/resource-index';
import { createScorpionContext } from '@/server/transformer/scorpion-context';

/**
 * Orchestrator Input
 */
export interface OrchestratorInput {
  userId?: string;
  query: string;
  previousEvents?: Event[];
  riskMode?: RiskMode;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  pipelineStage?: ScorpionContext['pipelineStage'];
  stepNumber?: number;
}

/**
 * Orchestrator Result
 */
export interface OrchestratorResult {
  context: ScorpionContext;
  integrationPlan: IntegrationPlan;
  executionResults: Array<{
    stepId: string;
    success: boolean;
    output?: unknown;
    error?: string;
  }>;
}

/**
 * Minimal "decoder block" orchestrator showing how pieces fit together.
 * 
 * This demonstrates the transformer architecture:
 * - Multi-head attention (Planner + Council)
 * - Feed-forward (Tool execution)
 * - Residual connections (State merging)
 */
export async function orchestrateScorpionStep(
  input: OrchestratorInput
): Promise<OrchestratorResult> {
  const riskMode = input.riskMode ?? 'balanced';

  // a) Build base context (tokenization step)
  const context = createScorpionContext(
    input.query,
    input.previousEvents || [],
    [], // Resource index entries (will be populated from tool registry)
    {
      pipelineStage: input.pipelineStage,
      stepNumber: input.stepNumber,
      conversationHistory: input.conversationHistory,
    }
  );

  // b) Create ResourceIndex (tool-backed, populated from registry)
  const resourceIndex: ResourceIndex = createToolResourceIndex();

  // c) Get system prompt with risk mode
  const systemPrompt = getSystemPrompt({ 
    riskMode,
    extraInstructions: input.userId ? `User: ${input.userId}` : undefined,
  });

  // d) Run one "decoder block" cycle
  // This internally:
  //   1. Normalizes context (builds summary)
  //   2. Runs multi-head attention (Planner + Council query ResourceIndex)
  //   3. Merges head outputs into IntegrationPlan
  //   4. Executes tools (feed-forward)
  //   5. Merges state (residual connection)
  const { updatedContext, plan, executionResults } = await runDecoderBlock(
    resourceIndex,
    context,
    {
      useCouncilSystem: false, // Use transformer attention queries
    }
  );

  return {
    context: updatedContext,
    integrationPlan: plan,
    executionResults,
  };
}

/**
 * Example: Run multiple decoder blocks in sequence
 * 
 * This simulates a "transformer stack" - multiple decoder layers
 * where each layer refines the context and plan.
 */
export async function runDecoderStack(
  input: OrchestratorInput,
  maxBlocks: number = 3
): Promise<OrchestratorResult> {
  let currentContext = createScorpionContext(
    input.query,
    input.previousEvents || [],
    [],
    {
      pipelineStage: input.pipelineStage,
      stepNumber: 0,
      conversationHistory: input.conversationHistory,
    }
  );

  const resourceIndex = createToolResourceIndex();
  let finalPlan: IntegrationPlan | null = null;
  let finalExecutionResults: OrchestratorResult['executionResults'] = [];

  // Run multiple decoder blocks (like transformer layers)
  for (let blockNum = 0; blockNum < maxBlocks; blockNum++) {
    currentContext.stepNumber = blockNum;
    currentContext.pipelineStage = 
      blockNum === 0 ? 'planner' :
      blockNum === 1 ? 'council' :
      blockNum === 2 ? 'execution' :
      'validation';

    const result = await runDecoderBlock(resourceIndex, currentContext);
    
    currentContext = result.updatedContext;
    finalPlan = result.plan;
    finalExecutionResults = result.executionResults;

    // Early exit if plan is complete or no more steps needed
    if (result.plan.orderedSteps.length === 0 || 
        result.executionResults.every(r => r.success && !r.error)) {
      break;
    }
  }

  if (!finalPlan) {
    throw new Error('Failed to generate plan after decoder stack');
  }

  return {
    context: currentContext,
    integrationPlan: finalPlan,
    executionResults: finalExecutionResults,
  };
}

/**
 * Helper: Convert orchestrator result to a user-friendly response
 */
export function formatOrchestratorResult(result: OrchestratorResult): string {
  const { integrationPlan, executionResults } = result;
  
  const steps = integrationPlan.orderedSteps
    .map(step => `  - ${step.description}`)
    .join('\n');
  
  const tools = integrationPlan.chosenTools
    .map(tool => `  - ${tool.name}`)
    .join('\n');
  
  const completed = executionResults.filter(r => r.success).length;
  const failed = executionResults.filter(r => !r.success).length;
  
  return `
Integration Plan (Risk: ${integrationPlan.riskLevel}):
${steps}

Tools to use:
${tools}

Execution: ${completed} completed, ${failed} failed
`.trim();
}

