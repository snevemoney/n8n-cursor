// Phase 2.1: Unified preflight checks orchestrator
// Power of 10 Rule 4: Single responsibility - orchestrate all preflight checks

import type { ScorpionIntent } from '@/lib/chat/types';
import { runSafetyGuard, type SafetyCheckResult } from './safetyGuard';
import { runToolRouter, type ToolRoutingResult } from './toolRouter';
import { runBudgetGovernor, type BudgetCheckResult } from './budgetGovernor';

export interface PreflightResult {
  safety: SafetyCheckResult;
  routing: ToolRoutingResult;
  budget: BudgetCheckResult;
  blocked: boolean;
  finalIntent: ScorpionIntent;
  blockReason?: string;
}

export interface PreflightParams {
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  intent: ScorpionIntent;
  lightweightMode: boolean;
  clientMode: string;
  modelConfig: {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  runModelForPrompt: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
}

/**
 * Run all preflight checks: Safety → Tool Router → Budget Governor
 * Power of 10 Rule 4: Orchestration function (<100 lines)
 *
 * @returns PreflightResult with all check results and final intent
 */
export async function runPreflightChecks(params: PreflightParams): Promise<PreflightResult> {
  const {
    userMessage,
    conversationHistory,
    intent,
    lightweightMode,
    clientMode,
    modelConfig,
    runModelForPrompt,
    send,
  } = params;

  console.log('[Preflight] Starting checks for intent:', intent);

  // 1. Safety Guard - Check if request is safe
  const safety = await runSafetyGuard({
    userMessage,
    intent,
    lightweightMode,
    clientMode,
    modelConfig,
    runModelForPrompt,
  });

  // If safety check blocks, return immediately
  if (safety.blocked) {
    console.log('[Preflight] Request blocked by safety guard');
    return {
      safety,
      routing: { intent, tools: [], finalIntent: intent },
      budget: { allowed: true, blocked: false },
      blocked: true,
      finalIntent: intent,
      blockReason: 'safety',
    };
  }

  // 2. Tool Router - Determine which tools to use
  const routing = await runToolRouter({
    userMessage,
    conversationHistory,
    intent,
    modelConfig,
    runModelForPrompt,
  });

  // 3. Budget Governor - Enforce resource limits (non-blocking)
  const budget = await runBudgetGovernor({
    intent: routing.finalIntent,
    lightweightMode,
    routing,
    modelConfig,
    runModelForPrompt,
  });

  // Determine final intent (tool router may have refined it)
  const finalIntent = routing.finalIntent;

  console.log('[Preflight] Checks complete:', {
    safety: safety.allowed ? 'PASS' : 'BLOCK',
    routing: `${routing.tools.length} tools`,
    budget: budget.budget || 'default',
    finalIntent,
  });

  return {
    safety,
    routing,
    budget,
    blocked: safety.blocked || budget.blocked,
    finalIntent,
  };
}

// Re-export types for convenience
export type { SafetyCheckResult, ToolRoutingResult, BudgetCheckResult };
