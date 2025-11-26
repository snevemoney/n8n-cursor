// Phase 2.1: Extract Budget Governor from processStreamStart.ts
// Power of 10 Rule 4: Focused module for budget/resource governance

import type { ScorpionIntent } from '@/lib/chat/types';
import { runPromptWithKillSwitch, BudgetGovernorSchema } from '@scorpion/core';
import { getHelperConfig, getHelperDefaults } from '@/lib/chat/helper-config';

export interface BudgetCheckResult {
  allowed: boolean;
  blocked: boolean;
  budget?: string;
  modelChoices?: string[];
  reason?: string;
}

export interface BudgetGovernorParams {
  intent: ScorpionIntent;
  lightweightMode: boolean;
  routing: any; // Routing result from tool router
  modelConfig: {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  runModelForPrompt: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
}

/**
 * Run budget governor to enforce resource limits
 * Power of 10 Rule 4: Single responsibility - budget enforcement
 *
 * @returns BudgetCheckResult with resource limits and model recommendations
 */
export async function runBudgetGovernor(params: BudgetGovernorParams): Promise<BudgetCheckResult> {
  const {
    intent,
    lightweightMode,
    routing,
    modelConfig,
    runModelForPrompt,
  } = params;

  // Get intent-aware helper configuration
  const helperConfig = getHelperConfig(intent, lightweightMode);
  const helperDefaults = getHelperDefaults();

  // Check if budget governor is enabled
  const budgetGovernorEnabled =
    helperConfig.useBudgetGovernor &&
    process.env['SCORPION_ENABLE_BUDGET_GOVERNOR'] !== '0';

  console.log('[Budget Governor] System status:', {
    enabled: budgetGovernorEnabled,
    envFlag: process.env['SCORPION_ENABLE_BUDGET_GOVERNOR'],
    configFlag: helperConfig.useBudgetGovernor,
    system: budgetGovernorEnabled ? 'ACTIVE' : 'DISABLED',
  });

  // If disabled, return default (allowed)
  if (!budgetGovernorEnabled || helperConfig.useBudgetGovernor === false) {
    console.log(`[Helper Config] Skipping budget-governor for intent: ${intent}`);
    return {
      allowed: true,
      blocked: false,
      budget: helperDefaults.budgetGovernor?.budget,
      modelChoices: helperDefaults.budgetGovernor?.modelChoices,
    };
  }

  // Run budget governor check
  try {
    const budget = await runPromptWithKillSwitch(
      'budget-governor.system.txt',
      { routing: routing || { intent, tools: [] } },
      BudgetGovernorSchema,
      modelConfig,
      runModelForPrompt
    );

    if (budget) {
      console.log('[Budget Governor] Budget:', budget.budget, 'Model choices:', budget.modelChoices);

      // Budget governor is non-blocking, so always allowed
      return {
        allowed: true,
        blocked: false,
        budget: budget.budget,
        modelChoices: budget.modelChoices,
      };
    }

    // If no budget returned, use defaults
    return {
      allowed: true,
      blocked: false,
      budget: helperDefaults.budgetGovernor?.budget,
      modelChoices: helperDefaults.budgetGovernor?.modelChoices,
    };
  } catch (error: any) {
    // Network/model errors - use safe defaults (non-blocking)
    console.warn('[Chat Stream] Budget governor failed, using defaults:', error.message);
    return {
      allowed: true,
      blocked: false,
      budget: helperDefaults.budgetGovernor?.budget,
      modelChoices: helperDefaults.budgetGovernor?.modelChoices,
      reason: 'Budget governor error - defaulting to allowed',
    };
  }
}
