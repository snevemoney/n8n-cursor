/**
 * Pattern Learning Integration Helpers
 * Connects pattern learning to the chat stream orchestration
 */

import type { Plan } from '@/lib/chat/types';
import type { CouncilResult } from '@/server/types/council';
import {
  learnFromSuccess,
  enhancePlanWithLearning,
  generateLearningContext,
  type LearningContext,
} from './patternLearningIntegration';
import type { PatternMatch } from '@/lib/learning/pattern-learning';

export interface LearnFromInteractionInput {
  userMessage: string;
  plan: Plan;
  councilResult: CouncilResult | null;
  executionSuccess: boolean;
  conversationLength: number;
  userIntent?: string;
}

export interface EnhancePlanInput {
  userMessage: string;
  basePlan: Plan;
}

export interface EnhancePlanResult {
  enhancedPlan: Plan;
  matches: PatternMatch[];
  learningContext: string;
}

/**
 * Learn from a successful interaction
 * Call this after successful execution and before sending "done" event
 */
export async function learnFromInteraction(input: LearnFromInteractionInput): Promise<void> {
  try {
    const context: LearningContext = {
      userQuery: input.userMessage,
      plan: input.plan,
      councilResult: input.councilResult || undefined,
      executionSuccess: input.executionSuccess,
      conversationLength: input.conversationLength,
      userIntent: input.userIntent,
    };

    await learnFromSuccess(context);
    console.log(`📚 [Pattern Learning] Stored pattern for: "${input.userMessage}"`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.warn('[Pattern Learning] Failed to learn from interaction:', err?.message);
  }
}

/**
 * Enhance plan with learned patterns
 * Call this BEFORE executing the planner to retrieve relevant patterns
 */
export async function enhancePlanWithPatterns(input: EnhancePlanInput): Promise<EnhancePlanResult> {
  try {
    const { enhancedPlan, matches } = await enhancePlanWithLearning(
      input.userMessage,
      input.basePlan
    );

    const learningContext = generateLearningContext(matches);

    if (matches.length > 0) {
      console.log(`🎯 [Pattern Learning] Found ${matches.length} relevant pattern(s) for: "${input.userMessage}"`);
    }

    return {
      enhancedPlan,
      matches,
      learningContext,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.warn('[Pattern Learning] Failed to enhance plan:', err?.message);
    return {
      enhancedPlan: input.basePlan,
      matches: [],
      learningContext: '',
    };
  }
}

/**
 * Determine if execution was successful
 * Used to decide whether to store a success pattern
 */
export function determineExecutionSuccess(
  plan: Plan,
  results: Array<{ step?: string; success?: boolean; error?: string }>,
  councilResult: CouncilResult | null
): boolean {
  // If council rejected, not successful
  if (councilResult && !councilResult.approved) {
    return false;
  }

  // If any step explicitly failed, not successful
  const hasFailedStep = results.some(r => r.error || r.success === false);
  if (hasFailedStep) {
    return false;
  }

  // If plan has steps but no results, not successful
  if (plan.plan && plan.plan.length > 0 && results.length === 0) {
    return false;
  }

  // Otherwise, consider successful
  return true;
}
