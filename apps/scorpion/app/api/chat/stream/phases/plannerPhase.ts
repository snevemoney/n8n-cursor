// apps/scorpion/app/api/chat/stream/phases/plannerPhase.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 6: Parameter validation

import type { Plan, ScorpionIntent } from '@/lib/chat/types';
import type { ScorpionOrchestrator } from '@scorpion/core';
import { assertDefined } from '../helpers/assertions';
import { generateSimplePlan } from '@/server/orchestrator/planner';

export interface PlannerPhaseInput {
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  intent: ScorpionIntent;
  tools: Record<string, unknown>;
  plannerPrompt: string;
  orchestrator: ScorpionOrchestrator;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  checkAbort: () => void;
  tracker: unknown;
}

export interface PlannerPhaseResult {
  plan: Plan;
  intent: ScorpionIntent;
}

/**
 * Handle planner phase with timeout and fallback
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 6: Check return values
 */
export async function handlePlannerPhase(
  input: PlannerPhaseInput
): Promise<PlannerPhaseResult> {
  // Power of 10 Rule 4: Assertions
  assertDefined(input.userMessage, 'User message must be defined');
  assertDefined(input.intent, 'Intent must be defined');
  assertDefined(input.orchestrator, 'Orchestrator must be defined');

  const {
    userMessage,
    conversationHistory,
    intent,
    tools,
    plannerPrompt,
    orchestrator,
    send,
    checkAbort,
    tracker,
  } = input;

  const plannerStartTime = Date.now();
  
  // Map local intent to core intent for orchestrator compatibility
  const coreIntent: import('@scorpion/core').ScorpionIntent =
    (intent as string) === 'identity' ? 'other' : (intent as import('@scorpion/core').ScorpionIntent);

  const plannerPromise = orchestrator.runPlanner(
    userMessage,
    conversationHistory,
    coreIntent,
    send,
    checkAbort,
    tools,
    tracker,
    plannerPrompt
  );

  // Power of 10 Rule 7: Guard timeout - Use longer timeout for complex queries, shorter for simple ones
  const isSimpleQuery =
    (intent as string) === 'small_talk' ||
    /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|test)$/i.test(userMessage.trim());
  const plannerTimeout = isSimpleQuery ? 20000 : 60000; // 20s for simple, 60s for complex

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`Planner timeout after ${plannerTimeout / 1000}s. Model may be unresponsive.`)),
      plannerTimeout
    );
  });

  let rawPlan;
  try {
    rawPlan = await Promise.race([plannerPromise, timeoutPromise]);
  } catch (timeoutError: unknown) {
    // Power of 10 Rule 7: Guard timeout - Fallback to simple plan if timeout occurs
    const error = timeoutError as { message?: string };
    if (error?.message?.includes('timeout')) {
      console.warn('[Chat Stream] Planner timeout, falling back to simple plan');
      try {
        rawPlan = {
          plan: generateSimplePlan(userMessage),
          intent: intent as import('@scorpion/core').ScorpionIntent,
          objective: userMessage,
        };
        console.log('[Chat Stream] Fallback plan generated successfully:', rawPlan.plan.length, 'steps');
      } catch (importError: unknown) {
        // If import fails, create a minimal plan directly
        const importErr = importError as { message?: string };
        console.warn('[Chat Stream] Failed to import generateSimplePlan, creating minimal plan:', importErr?.message);
        rawPlan = {
          plan: [
            {
              id: 's1',
              title: 'Respond to user query',
              tool: 'none',
              args: {},
            },
          ],
          intent: intent as import('@scorpion/core').ScorpionIntent,
          objective: userMessage,
        };
      }
    } else {
      throw timeoutError;
    }
  }

  const plannerDuration = Date.now() - plannerStartTime;
  console.log('[Planner System] Completed planner phase:', {
    system: 'NEW (orchestrator.runPlanner)',
    duration: `${plannerDuration}ms`,
    hasPlan: !!rawPlan,
    stepsCount: rawPlan?.plan?.length || 0,
    hasObjective: !!rawPlan?.objective,
  });

  // Normalize plan intent for type compatibility
  const plan: Plan = rawPlan
    ? ({
        ...rawPlan,
        intent:
          ((rawPlan.intent as string) === 'identity' ? 'other' : rawPlan.intent) as
          | import('@scorpion/core').ScorpionIntent
          | undefined,
      } as Plan)
    : ({
        objective: userMessage,
        assumptions: [],
        plan: [
          {
            id: 's1',
            title: 'Respond to user',
            tool: 'none',
            args: {},
          },
        ],
        done_when: ['User receives response'],
        needsCouncil: false,
        questionType: 'casual',
        councilRationale: 'Fallback plan - planner failed',
      } as Plan);

  return {
    plan,
    intent: (plan.intent || intent) as ScorpionIntent,
  };
}

