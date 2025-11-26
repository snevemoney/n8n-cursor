/**
 * Logging and Observability for Transformer Architecture
 * 
 * Provides structured logging for decoder blocks, attention queries,
 * and tool execution for debugging and monitoring.
 */

import type { ScorpionContext } from '@/server/transformer/scorpion-context';
import type { HeadOutput, IntegrationPlan } from '@/server/transformer/head-output';
import type { ResourceIndex } from '@/server/transformer/resource-index';

export interface DecoderBlockLog {
  blockNumber: number;
  timestamp: Date;
  context: {
    query?: string;
    riskMode?: string;
    pipelineStage?: string;
    stepNumber?: number;
  };
  attention: {
    topTools: Array<{ id: string; score: number; title: string }>;
    topDocs: Array<{ id: string; score: number; title: string }>;
  };
  heads: Array<{
    name: string;
    priorityCount: number;
    actionCount: number;
    riskCount: number;
  }>;
  plan: {
    stepCount: number;
    toolCount: number;
    riskLevel: string;
  };
  execution: {
    completed: number;
    failed: number;
    total: number;
  };
}

/**
 * Log decoder block execution
 */
export function logDecoderBlock(
  blockNumber: number,
  context: ScorpionContext,
  attentionResults: Array<{ entry: any; score: number }>,
  headOutputs: HeadOutput[],
  plan: IntegrationPlan,
  executionResults: Array<{ stepId: string; success: boolean }>
): void {
  const log: DecoderBlockLog = {
    blockNumber,
    timestamp: new Date(),
    context: {
      query: context.userQuery,
      riskMode: (context as any).riskMode,
      pipelineStage: context.pipelineStage,
      stepNumber: context.stepNumber,
    },
    attention: {
      topTools: attentionResults
        .filter(r => r.entry.type === 'tool')
        .slice(0, 5)
        .map(r => ({ id: r.entry.id, score: r.score, title: r.entry.title })),
      topDocs: attentionResults
        .filter(r => r.entry.type === 'doc')
        .slice(0, 3)
        .map(r => ({ id: r.entry.id, score: r.score, title: r.entry.title })),
    },
    heads: headOutputs.map(head => ({
      name: head.headName,
      priorityCount: head.priorities.length,
      actionCount: head.actions.length,
      riskCount: head.risks.length,
    })),
    plan: {
      stepCount: plan.orderedSteps.length,
      toolCount: plan.chosenTools.length,
      riskLevel: plan.riskLevel,
    },
    execution: {
      completed: executionResults.filter(r => r.success).length,
      failed: executionResults.filter(r => !r.success).length,
      total: executionResults.length,
    },
  };

  console.log('[Transformer] Decoder Block', JSON.stringify(log, null, 2));
}

/**
 * Log attention query results
 */
export function logAttentionQuery(
  query: string,
  results: Array<{ entry: any; score: number }>,
  limit: number = 5
): void {
  console.log('[Transformer] Attention Query:', {
    query,
    topResults: results.slice(0, limit).map(r => ({
      id: r.entry.id,
      type: r.entry.type,
      title: r.entry.title,
      score: r.score.toFixed(3),
    })),
  });
}

/**
 * Log head outputs
 */
export function logHeadOutputs(headOutputs: HeadOutput[]): void {
  console.log('[Transformer] Head Outputs:', {
    heads: headOutputs.map(head => ({
      name: head.headName,
      priorities: head.priorities.slice(0, 3).map(p => ({
        itemId: p.itemId,
        score: p.score.toFixed(3),
      })),
      actions: head.actions.slice(0, 2),
      risks: head.risks,
    })),
  });
}

/**
 * Log tool execution
 */
export function logToolExecution(
  toolName: string,
  params: Record<string, unknown>,
  result: { success: boolean; output?: unknown; error?: string }
): void {
  console.log('[Transformer] Tool Execution:', {
    tool: toolName,
    params: Object.keys(params),
    success: result.success,
    error: result.error,
    outputType: result.output ? typeof result.output : 'none',
  });
}

