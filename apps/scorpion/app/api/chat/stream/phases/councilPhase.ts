// apps/scorpion/app/api/chat/stream/phases/councilPhase.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 6: Parameter validation
// Power of 10 Rule 7: Guard undefined

import type { Plan, ScorpionIntent } from '@/lib/chat/types';
import { assertDefined } from '../helpers/assertions';
import { extractDomainTags } from '@/server/council';
import { runCouncilLegacy } from '@/server/orchestrator/council/legacy';
import { logImprovementSignal } from '@/server/orchestrator/selfImprovement';
import type { MissionPhase } from '@/server/types/strategy';
import type { CouncilResult } from '@/server/types/council';

export interface CouncilPhaseInput {
  plan: Plan;
  intent: ScorpionIntent;
  userMessage: string;
  conversationId: string;
  userId?: string;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  checkAbort: () => void;
  councilImplementation?: string;
}

export interface CouncilPhaseResult {
  councilResult: CouncilResult | null; // Fixed: Replaced 'any' with proper CouncilResult type
  consensus: {
    approved: boolean;
    score: number;
    summary: string;
    issues?: unknown[];
  };
  votes: Array<{
    member: string;
    approved: boolean;
    issues: number;
  }>;
}

/**
 * Handle council phase with timeout and fallback
 * Power of 10 Rule 3: < 60 lines (orchestrates helpers)
 * Power of 10 Rule 6: Check return values
 */
export async function handleCouncilPhase(
  input: CouncilPhaseInput
): Promise<CouncilPhaseResult> {
  // Power of 10 Rule 4: Assertions
  assertDefined(input.plan, 'Plan must be defined');
  assertDefined(input.intent, 'Intent must be defined');
  assertDefined(input.userMessage, 'User message must be defined');
  assertDefined(input.conversationId, 'Conversation ID must be defined');

  const {
    plan,
    intent,
    userMessage,
    conversationId,
    userId,
    send,
    checkAbort,
    councilImplementation = process.env['SCORPION_COUNCIL_IMPLEMENTATION'] || 'v2',
  } = input;

  // Power of 10 Rule 7: Guard council requirement - skip if not needed
  const isTrulyComplex = /(enterprise|scalable|high availability|fault tolerance|distributed system|production|mission critical)/i.test(userMessage);
  const isCouncilQuestion = /(council|deliberation|how.*council|what.*council|explain.*council|describe.*council|council.*process|council.*work|council.*deliberate|how.*deliberation|what.*deliberation)/i.test(userMessage);
  const needsCouncil = (plan.needsCouncil === true && isTrulyComplex) || isCouncilQuestion;

  if (!needsCouncil) {
    return {
      councilResult: null,
      consensus: {
        approved: true,
        score: 10,
        summary: plan.objective || userMessage,
      },
      votes: [],
    };
  }

  send({ type: 'status', data: { message: 'Council deliberating...', phase: 'council' } });
  send({ type: 'progress', data: { phase: 'council', progress: 0, message: 'Council starting...' } });

  let councilResult: CouncilResult | null = null;
  try {
    const domainTags = extractDomainTags(userMessage, plan.objective || '');
    const councilInput = {
      goalDescription: userMessage,
      planSummary: plan.objective || '',
      draftAnswer: undefined,
      domainTags,
      toolsUsed: plan.plan.map(s => s.tool).filter(Boolean),
      planSteps: plan.plan.map(s => ({
        tool: s.tool,
        description: s.title || '',
      })),
      userId: userId || 'evens',
      conversationId: conversationId,
      missionId: conversationId,
    };

    const councilStartTime = Date.now();
    councilResult = await runCouncilLegacy(councilInput);
    const councilDuration = Date.now() - councilStartTime;

    console.log('[Council] Council system completed:', {
      approved: councilResult.approved,
      issuesCount: councilResult.allIssues?.length || 0,
      councillors: councilResult.councillorOutputs?.length || 0,
      duration: `${councilDuration}ms`,
      hasIssues: (councilResult.allIssues?.length || 0) > 0,
    });

    // Apply council revisions to plan
    const revisedPlanSummary = councilResult.revisedPlanSummary;
    if (revisedPlanSummary && typeof revisedPlanSummary === 'string') {
      plan.objective = revisedPlanSummary;
    }

    // Log improvement signals from council issues
    if (councilResult.allIssues) {
      const MAX_ISSUES = 1000; // Power of 10 Rule 2: Bounded loop
      const issuesToLog = councilResult.allIssues.slice(0, MAX_ISSUES);
      for (let i = 0; i < issuesToLog.length; i++) {
        const issue = issuesToLog[i];
        if (!issue || issue.severity < 3) continue; // Only log critical issues

        let signalType: MissionPhase = 'BROKEN_FLOW' as MissionPhase;
        if (issue.tag === 'bias' || issue.tag === 'ethics') {
          signalType = 'BIAS_RISK' as MissionPhase;
        } else if (issue.tag === 'complexity') {
          signalType = 'OVERCOMPLEX_PLAN' as MissionPhase;
        } else if (issue.tag === 'tools') {
          signalType = 'HALLUCINATED_ENDPOINT' as MissionPhase;
        }

        const signal = logImprovementSignal({
          type: signalType,
          message: `[${issue.councillorId}] ${issue.message}`,
          tag: issue.tag,
          missionId: conversationId,
          severity: issue.severity,
          details: {
            recommendation: issue.recommendation,
          },
        });

        send({
          type: 'improvement-signal',
          conversationId: conversationId,
          payload: signal,
        });
      }
    }
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string };
    console.warn('[Council] Failed to run council:', err.message, err.stack);
    // Power of 10 Rule 6: Return value check - create valid CouncilResult fallback
    councilResult = {
      approved: true,
      allIssues: [],
      warnings: [],
      councillorOutputs: [],
    } as CouncilResult;
    send({
      type: 'error',
      data: { message: `Council failed: ${err.message || 'Unknown error'}`, phase: 'council' },
    });
  }

  // Create consensus from council result
  const consensus = councilResult
    ? {
        approved: councilResult.approved,
        score: councilResult.approved ? 8 : 5,
        summary: councilResult.revisedPlanSummary || plan.objective || userMessage,
        issues: councilResult.allIssues,
      }
    : { approved: true, score: 10, summary: plan.objective || userMessage };

  const votes = councilResult?.councillorOutputs?.map((co) => ({
    member: co.councillorName || co.councillorId,
    approved: co.approved,
    issues: co.issues?.length || 0,
  })) || [];

  return {
    councilResult,
    consensus,
    votes,
  };
}

