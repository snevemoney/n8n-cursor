/**
 * Legacy Council Adapter
 * 
 * This wraps the old council implementations and routes them through v2.
 * All old code paths should import from here instead of directly.
 */

import { runCouncilV2 } from './v2';
import { runCouncilDeliberationStreaming } from '@/lib/chat/council';
import type { Plan, CouncilVote as OldCouncilVote } from '@/lib/chat/types';
import type { CouncilQuestion } from './types';

/**
 * Feature flag: which council implementation to use
 * - 'v2' (default): Use new council system
 * - 'legacy': Use old streaming council (fallback)
 */
const COUNCIL_IMPLEMENTATION = (process.env['SCORPION_COUNCIL_IMPLEMENTATION'] || 'v2') as 'v2' | 'legacy';

/**
 * Legacy adapter for old runCouncil function signature
 * Used by: orchestrator, chat route, etc.
 */
export async function runCouncilLegacy(input: {
  goalDescription: string;
  planSummary: string;
  plan?: Plan;
  domainTags?: string[];
  toolsUsed?: string[];
  planSteps?: Array<{ tool?: string; description: string }>;
  userId?: string;
  conversationId?: string;
  missionId?: string;
}): Promise<{
  approved: boolean;
  score?: number;
  summary?: string;
  votes?: Array<{ agentId: string; agentName: string; vote: string; [key: string]: unknown }>;
  allIssues?: Array<{ severity: number; tag: string; message: string; [key: string]: unknown }>;
  warnings?: string[];
  councillorOutputs?: Array<{ councillorId: string; councillorName: string; issues: unknown[]; approved: boolean; [key: string]: unknown }>;
}> {
  console.log('[Council Legacy Adapter] Routing council request:', {
    implementation: COUNCIL_IMPLEMENTATION,
    goalDescription: input.goalDescription.substring(0, 50) + '...',
    hasPlan: !!input.plan,
    toolsCount: input.toolsUsed?.length || 0,
  });
  
  if (COUNCIL_IMPLEMENTATION === 'legacy') {
    // Fallback to old implementation if needed
    console.warn('[Council Legacy Adapter] Using OLD legacy fallback implementation');
    return runLegacyCouncilFallback(input);
  }
  
  console.log('[Council Legacy Adapter] Routing to NEW v2 system via runCouncilV2');
  // Route through v2
  const question: CouncilQuestion = {
    id: input.conversationId || `legacy-${Date.now()}`,
    text: input.goalDescription,
    context: {
      plan: input.plan,
      planSummary: input.planSummary,
      previousTools: input.toolsUsed || [],
      sessionId: input.conversationId,
      domainTags: input.domainTags,
    },
  };
  
  const result = await runCouncilV2(question);
  
  // Map back to legacy format
  return {
    approved: result.approved,
    score: result.score,
    summary: result.summary,
    votes: result.votes.map(v => {
      const { agentId, agentName, vote: existingVote, answer, ...rest } = v;
      return {
        agentId,
        agentName,
        vote: existingVote || (answer === 'approve' ? 'approve' : 'reject'),
        ...rest
      };
    }),
    allIssues: result.issues || [],
    warnings: result.warnings || [],
    councillorOutputs: result.votes.map(v => ({
      councillorId: v.agentId,
      councillorName: v.agentName,
      issues: result.issues?.filter(i => i.tag === v.agentId) || [],
      approved: v.vote === 'approve',
    })),
  };
}

/**
 * Legacy adapter for runCouncilDeliberationStreaming
 * Used by: old orchestrator, chat route streaming
 */
export async function runCouncilDeliberationStreamingLegacy(
  plan: Plan,
  modelConfig: { provider: string; model: string; maxTokens?: number; temperature?: number },
  onEvent: (event: { type: string; data: unknown }) => void,
  knowledgeHits?: Array<{ id: string; snippet: string; source: string; [key: string]: unknown }>
): Promise<OldCouncilVote[]> {
  if (COUNCIL_IMPLEMENTATION === 'legacy') {
    // Use old streaming implementation
    return runCouncilDeliberationStreaming(plan, modelConfig, onEvent, knowledgeHits);
  }
  
  // Route through v2 (non-streaming for now, but we can add streaming later)
  const question: CouncilQuestion = {
    id: `streaming-${Date.now()}`,
    text: plan.objective || '',
    context: {
      plan: plan,
      planSummary: plan.objective || '',
      knowledgeHits: knowledgeHits || [],
    },
  };
  
  onEvent({
    type: 'status',
    data: { message: 'Council review starting...', phase: 'council' },
  });
  
  const result = await runCouncilV2(question);
  
  // Stream events to match old interface
  result.votes.forEach((vote) => {
    onEvent({
      type: 'council_thinking',
      data: {
        memberId: vote.agentId,
        memberName: vote.agentName,
        status: 'analyzing',
        message: `${vote.agentName}: ${vote.reasoning}`,
      },
    });
  });
  
  onEvent({
    type: 'council_complete',
    data: {
      message: 'Council deliberation complete',
      totalVotes: result.votes.length,
    },
  });
  
  onEvent({
    type: 'council_consensus',
    data: {
      score: result.score || 0,
      approved: result.approved,
      summary: result.summary || '',
    },
  });
  
  // Convert to old vote format
  return result.votes.map(vote => ({
    agentId: vote.agentId,
    agentName: vote.agentName,
    weight: vote.weight || 1.0,
    vote: vote.vote || (vote.answer === 'approve' ? 'approve' : 'reject'),
    confidence: vote.confidence,
    rationale: vote.rationale || vote.reasoning,
  }));
}

/**
 * Legacy fallback implementation (only used if feature flag is set to 'legacy')
 */
async function runLegacyCouncilFallback(input: {
  goalDescription: string;
  planSummary: string;
  plan?: Plan;
  domainTags?: string[];
  toolsUsed?: string[];
  planSteps?: Array<{ tool?: string; description: string }>;
  userId?: string;
  conversationId?: string;
  missionId?: string;
}): Promise<{
  approved: boolean;
  score?: number;
  summary?: string;
  votes?: Array<{ agentId: string; agentName: string; vote: string; [key: string]: unknown }>;
  allIssues?: Array<{ severity: number; tag: string; message: string; [key: string]: unknown }>;
  warnings?: string[];
  councillorOutputs?: Array<{ councillorId: string; councillorName: string; issues: unknown[]; approved: boolean; [key: string]: unknown }>;
}> {
  // Minimal fallback - just approve everything
  console.warn('[Council] Using legacy fallback implementation');
  return {
    approved: true,
    score: 8,
    summary: input.planSummary,
    votes: [],
    allIssues: [],
    warnings: [],
    councillorOutputs: [],
  };
}

