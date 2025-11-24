// apps/scorpion/server/orchestrator/strategyIntegration.example.ts
// 
// Example integration of strategy handler into chat stream route
// This shows how to wire Next-Best-Action, similarity, and self-improvement
// into your existing orchestrator flow.

import { handleScorpionStrategy, createContextSnapshot, logCommonFailures } from './strategyHandler';
import { MissionPhase } from '../types/strategy';
import type { Message, Plan } from '@scorpion/core';

/**
 * Example: Integrate strategy handler into your chat stream route
 * 
 * Add this after the planner phase in your chat stream handler:
 */
export async function exampleStrategyIntegration(
  userMessage: string,
  conversationHistory: Message[],
  plan: Plan | undefined,
  currentPhase: MissionPhase,
  toolsUsed: string[],
  missionId?: string,
) {
  // 1. Create context snapshot from orchestrator state
  const snapshot = createContextSnapshot(
    userMessage,
    conversationHistory,
    currentPhase,
    plan?.objective, // Use plan objective as planSummary
    toolsUsed,
    missionId,
  );

  // 2. Get strategy insights (NBA, similar missions, patch report)
  const strategy = await handleScorpionStrategy(snapshot, {
    // Optional: provide mission count for patch report generation
    // missionCountAnalyzedForReport: getMissionCount(),
  });

  // 3. Return strategy insights to send to frontend
  return {
    nextBestAction: strategy.nextBestAction,
    similarMissions: strategy.similarMissions,
    // patchReport: strategy.patchReport, // Only include if generating reports
  };
}

/**
 * Example: Log failures during tool execution
 * 
 * Wrap your tool execution with error handling:
 */
export async function exampleToolExecutionWithLogging(
  toolName: string,
  toolArgs: any,
  executeTool: (tool: string, args: any) => Promise<any>,
  missionId?: string,
) {
  const startTime = Date.now();
  
  try {
    const result = await executeTool(toolName, toolArgs);
    const latency = Date.now() - startTime;
    
    // Log high latency if needed
    if (latency > 10000) {
      logCommonFailures(
        { message: 'Tool execution slow' },
        { toolName, latency, missionId, tag: 'tool-execution' },
      );
    }
    
    return result;
  } catch (error: any) {
    // Log tool failure
    logCommonFailures(error, {
      toolName,
      missionId,
      tag: 'tool-execution',
    });
    
    throw error;
  }
}

/**
 * Example: Send Next-Best-Action to frontend via SSE
 * 
 * In your chat stream route, after computing strategy:
 */
export function exampleSendNBAViaSSE(
  send: (event: { type: string; data: any }) => void,
  nextBestAction: any,
) {
  send({
    type: 'next-best-action',
    data: nextBestAction,
  });
}

