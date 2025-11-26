/**
 * Decoder Block - One Iteration of Scorpion's Automation Loop
 * 
 * Maps to: Decoder Block Stack (LayerNorm → MHA → residual → LayerNorm → FFN → residual)
 * 
 * One iteration of ChainLogicLoop / AgentPilot loop = one decoder block:
 * 1. Normalize (Summarizer/Status) → ScorpionContextSummary
 * 2. Multi-Head Attention → Planner + Council
 * 3. Feed-Forward → Tool Execution
 * 4. Residual Connection → Merge New State
 * 5. Next Block (next loop)
 */

import type { ScorpionContext } from './scorpion-context';
import type { HeadOutput, IntegrationPlan } from './head-output';
import type { ResourceIndex } from './resource-index';
import { plannerAttentionQuery, councilAgentAttentionQuery } from './attention-query';
import { mergeHeadOutputs } from './head-output';
import { filterToolsByRiskMode, isStepAllowed, getRiskMode } from '@/lib/transformer/safety';
import { logDecoderBlock, logAttentionQuery, logHeadOutputs, logToolExecution } from '@/lib/transformer/logging';

/**
 * Context Summary (LayerNorm)
 * 
 * Maps to: LayerNorm - standardize representation format
 */
export interface ContextSummary {
  techDebtCount: number;
  openTodos: string[];
  failingWorkflows: string[];
  keyMetrics: Record<string, number>;
  lastUpdated: Date;
}

/**
 * Build context summary from current state
 */
export function buildContextSummary(context: ScorpionContext): ContextSummary {
  // Extract failing workflows from events
  const failingWorkflows = context.pastEvents
    .filter(e => e.type === 'workflow.failed' || e.type === 'workflow.test.failed')
    .map(e => e.id);
  
  // Extract TODOs from planned actions
  const openTodos = context.plannedActions
    .filter(a => a.type === 'todo')
    .map(a => a.description);
  
  return {
    techDebtCount: context.contextSummary?.techDebtCount ?? 0,
    openTodos,
    failingWorkflows,
    keyMetrics: {
      totalResources: context.resourceIndex.length,
      pastEvents: context.pastEvents.length,
      plannedActions: context.plannedActions.length,
      ...context.contextSummary?.keyMetrics,
    },
    lastUpdated: new Date(),
  };
}

/**
 * Multi-Head Attention Phase
 * 
 * Maps to: Multi-Head Attention
 * 
 * Planner + multiple specialist agents query Resource Index and generate proposals
 */
export async function multiHeadAttentionPhase(
  resourceIndex: ResourceIndex,
  context: ScorpionContext
): Promise<HeadOutput[]> {
  // Planner attention query
  const plannerAttention = await plannerAttentionQuery(resourceIndex, context);
  
  // Council agents (multi-head)
  const councilAgents = ['architecture', 'data', 'code', 'risk'];
  const councilOutputs = await Promise.all(
    councilAgents.map(agent => 
      councilAgentAttentionQuery(resourceIndex, context, agent)
    )
  );
  
  // Combine planner and council outputs
  return [
    {
      headName: 'planner',
      priorities: plannerAttention.resources.map(r => ({
        itemId: r.entryId,
        score: r.score,
        reason: r.reason,
      })),
      actions: [
        `Use tools: ${plannerAttention.topTools.map(t => t.toolId).join(', ')}`,
        `Reference docs: ${plannerAttention.topDocs.map(d => d.docId).join(', ')}`,
        `Consider workflows: ${plannerAttention.topWorkflows.map(w => w.workflowId).join(', ')}`,
      ],
      risks: [],
      toolSuggestions: plannerAttention.topTools.map(t => ({
        toolId: t.toolId,
        confidence: t.score,
        reason: t.reason,
      })),
      knowledgeHits: plannerAttention.topDocs.map(d => ({
        docId: d.docId,
        relevance: d.score,
        snippet: d.snippet,
      })),
    },
    ...councilOutputs,
  ];
}

/**
 * Feed-Forward Phase (Tool Execution)
 * 
 * Maps to: Feed-Forward Network
 * 
 * Concrete tools that turn high-level plans into actual system changes
 */
export interface ToolExecutionResult {
  stepId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  diff?: string; // For code/workflow changes
}

/**
 * Tool executor interface - injectable for testing
 */
export interface ToolExecutor {
  execute(toolName: string, params: Record<string, unknown>): Promise<unknown>;
}

/**
 * Default tool executor using the tools registry
 */
class DefaultToolExecutor implements ToolExecutor {
  async execute(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    // Dynamic import to avoid circular dependencies
    const { tools, getTool } = await import('@/lib/chat/tools');
    const { executeUserTool, getUserTool } = await import('@/lib/chat/tools/user-tools');
    
    // Check if it's a user tool
    if (toolName.startsWith('user.')) {
      const userTool = getUserTool(toolName);
      if (userTool) {
        return executeUserTool(userTool, params);
      }
    }
    
    // Check if it's a regular tool
    const tool = getTool(toolName);
    if (tool && tool.handler) {
      return tool.handler(params);
    }
    
    throw new Error(`Tool not found: ${toolName}`);
  }
}

export async function feedForwardPhase(
  plan: IntegrationPlan,
  context: ScorpionContext,
  toolExecutor?: ToolExecutor
): Promise<ToolExecutionResult[]> {
  const executor = toolExecutor || new DefaultToolExecutor();
  const results: ToolExecutionResult[] = [];
  
  // Execute each step in order
  for (const step of plan.orderedSteps) {
    // Check dependencies
    if (step.dependsOn) {
      const depsMet = step.dependsOn.every(depId => 
        results.some(r => r.stepId === depId && r.success)
      );
      if (!depsMet) {
        results.push({
          stepId: step.id,
          success: false,
          error: 'Dependencies not met',
        });
        continue;
      }
    }
    
    // Execute tool call
    if (step.type === 'tool_call' && step.tool) {
      try {
        // Log tool execution
        if (process.env['TRANSFORMER_DEBUG'] === 'true') {
          console.log('[Transformer] Executing tool:', step.tool, 'with params:', Object.keys(step.params || {}));
        }
        
        const output = await executor.execute(step.tool, step.params || {});
        
        // Log success
        if (process.env['TRANSFORMER_DEBUG'] === 'true') {
          logToolExecution(step.tool, step.params || {}, { success: true, output });
        }
        
        results.push({
          stepId: step.id,
          success: true,
          output,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Log failure
        if (process.env['TRANSFORMER_DEBUG'] === 'true') {
          logToolExecution(step.tool, step.params || {}, { success: false, error: errorMessage });
        }
        
        results.push({
          stepId: step.id,
          success: false,
          error: errorMessage,
        });
      }
    } else {
      // Non-tool step (validation, notification, etc.)
      results.push({
        stepId: step.id,
        success: true,
        output: { message: step.description },
      });
    }
  }
  
  return results;
}

/**
 * Residual Connection (Merge State)
 * 
 * Maps to: Residual Connection
 * 
 * Don't replace the world, diff & merge:
 * - Keep monorepo same, apply minimal diff
 * - Keep existing workflows, import updated version with versioning
 */
export function residualMerge(
  context: ScorpionContext,
  executionResults: ToolExecutionResult[]
): ScorpionContext {
  // Create new events from execution results
  const newEvents = executionResults.map(result => ({
    id: `event-${Date.now()}-${result.stepId}`,
    timestamp: new Date(),
    type: result.success ? 'step.completed' : 'step.failed',
    source: 'decoder-block',
    data: {
      stepId: result.stepId,
      output: result.output,
      error: result.error,
    },
    stage: context.pipelineStage,
    stepNumber: context.stepNumber,
  }));
  
  // Merge: add new events to past events (append-only)
  return {
    ...context,
    pastEvents: [...context.pastEvents, ...newEvents],
    // Clear planned actions that were executed
    plannedActions: context.plannedActions.filter(
      action => !executionResults.some(r => r.stepId === action.id)
    ),
    // Update context summary
    contextSummary: {
      ...context.contextSummary,
      keyMetrics: {
        ...context.contextSummary?.keyMetrics,
        completedSteps: executionResults.filter(r => r.success).length,
      },
    },
  };
}

/**
 * One Decoder Block Iteration
 * 
 * Maps to: One forward pass through a decoder block
 */
export async function runDecoderBlock(
  resourceIndex: ResourceIndex,
  context: ScorpionContext,
  options?: {
    toolExecutor?: ToolExecutor;
    useCouncilSystem?: boolean;
    plan?: any; // Plan from existing system
  }
): Promise<{
  updatedContext: ScorpionContext;
  plan: IntegrationPlan;
  executionResults: ToolExecutionResult[];
}> {
  // 1. Normalize (build context summary)
  const summary = buildContextSummary(context);
  const normalizedContext: ScorpionContext = {
    ...context,
    contextSummary: summary,
  };
  
  // 2. Multi-Head Attention (Planner + Council)
  let headOutputs: HeadOutput[];
  let attentionResults: Array<{ entry: any; score: number }> = [];
  
  if (options?.useCouncilSystem && options?.plan) {
    // Use existing council system
    const { runCouncilAsMultiHead } = await import('@/lib/transformer/council-integration');
    headOutputs = await runCouncilAsMultiHead(resourceIndex, normalizedContext, options.plan);
  } else {
    // Use transformer attention queries
    const plannerAttention = await plannerAttentionQuery(resourceIndex, normalizedContext);
    attentionResults = [
      ...(await resourceIndex.search(normalizedContext.userQuery || '', { type: 'tool', limit: 10 })),
      ...(await resourceIndex.search(normalizedContext.userQuery || '', { type: 'doc', limit: 5 })),
    ];
    
    // Log attention query
    if (process.env['TRANSFORMER_DEBUG'] === 'true') {
      logAttentionQuery(normalizedContext.userQuery || '', attentionResults);
    }
    
    headOutputs = await multiHeadAttentionPhase(resourceIndex, normalizedContext);
  }
  
  // Log head outputs
  if (process.env['TRANSFORMER_DEBUG'] === 'true') {
    logHeadOutputs(headOutputs);
  }
  
  // 3. Merge heads into integration plan
  let plan = mergeHeadOutputs(headOutputs, summary);
  
  // Apply risk mode filtering
  const riskMode = getRiskMode(normalizedContext as any);
  plan.chosenTools = filterToolsByRiskMode(plan.chosenTools, riskMode);
  plan.orderedSteps = plan.orderedSteps.filter(step => isStepAllowed(step, riskMode));
  
  // 4. Feed-Forward (Tool Execution)
  const executionResults = await feedForwardPhase(plan, normalizedContext, options?.toolExecutor);
  
  // Log decoder block
  if (process.env['TRANSFORMER_DEBUG'] === 'true') {
    logDecoderBlock(
      normalizedContext.stepNumber || 0,
      normalizedContext,
      attentionResults,
      headOutputs,
      plan,
      executionResults
    );
  }
  
  // 5. Residual Merge (update context)
  const updatedContext = residualMerge(normalizedContext, executionResults);
  
  return {
    updatedContext,
    plan,
    executionResults,
  };
}

