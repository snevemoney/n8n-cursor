// apps/scorpion/server/orchestrator/strategyHandler.ts

import { computeNextBestAction } from '../strategy/nextBestAction';
import {
  logImprovementSignal,
  analyzeSignalsIntoPatchReport,
} from './selfImprovement';
import { findSimilarMissions, MissionLogStore } from '../strategy/similarityEngine';
import { ScorpionContextSnapshot, NextBestAction, MissionPhase, PatchReport } from '../types/strategy';
import type { Message } from '@scorpion/core';

/**
 * Convert orchestrator context to ScorpionContextSnapshot
 */
export function createContextSnapshot(
  userMessage: string,
  conversationHistory: Message[],
  currentPhase?: MissionPhase,
  planSummary?: string,
  toolsUsed?: string[],
  missionId?: string,
): ScorpionContextSnapshot {
  return {
    missionId,
    userId: 'evens',
    timestamp: new Date().toISOString(),
    messages: conversationHistory.map((m) => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    })),
    currentPhase,
    planSummary,
    toolsUsed,
  };
}

/**
 * Main strategy handler that integrates NBA, similarity, and self-improvement.
 * Call this from your chat handler or orchestrator.
 */
export async function handleScorpionStrategy(
  snapshot: ScorpionContextSnapshot,
  opts?: {
    missionCountAnalyzedForReport?: number;
    missionLogStore?: MissionLogStore;
  },
): Promise<{
  similarMissions: Awaited<ReturnType<typeof findSimilarMissions>>;
  nextBestAction: NextBestAction;
  patchReport: PatchReport | null;
}> {
  // Use provided store or default to stub
  const missionLogStore: MissionLogStore = opts?.missionLogStore || {
    async searchSimilarMissions() {
      return [];
    },
    async logSuccessfulMission() {
    },
  };

  // 1) Similar missions (optional: pass into LLM context)
  const similarMissions = await findSimilarMissions(snapshot, missionLogStore, {
    limit: 3,
  });

  // 2) Compute NBA
  const nba = computeNextBestAction(snapshot);

  // 3) Optionally generate a patch report periodically
  const patchReport =
    typeof opts?.missionCountAnalyzedForReport === 'number'
      ? analyzeSignalsIntoPatchReport(opts.missionCountAnalyzedForReport)
      : null;

  return {
    similarMissions,
    nextBestAction: nba,
    patchReport,
  };
}

/**
 * Helper to log common failure patterns as improvement signals.
 * Call this from error handlers, tool wrappers, etc.
 */
/**
 * Power of 10 Rule 5: Typed error parameter with type guard
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

export function logCommonFailures(
  error: unknown,
  context: {
    tag?: string;
    missionId?: string;
    toolName?: string;
    latency?: number;
  },
) {
  const errorMessage = getErrorMessage(error);
  
  // Log tool failures
  if (context.toolName) {
    logImprovementSignal({
      type: 'TOOL_FAILURE',
      message: `Tool ${context.toolName} failed: ${errorMessage}`,
      tag: context.tag,
      missionId: context.missionId,
      details: { toolName: context.toolName, error: errorMessage },
      severity: 3,
    });
  }

  // Log high latency
  if (context.latency && context.latency > 10000) {
    logImprovementSignal({
      type: 'LATENCY_HIGH',
      message: `Operation exceeded 10s latency: ${context.latency}ms`,
      tag: context.tag,
      missionId: context.missionId,
      details: { latency: context.latency },
      severity: 2,
    });
  }
}

