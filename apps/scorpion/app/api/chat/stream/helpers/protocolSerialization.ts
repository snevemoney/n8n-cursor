// apps/scorpion/app/api/chat/stream/helpers/protocolSerialization.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 2: All loops have fixed upper bounds
// Power of 10 Rule 7: Guard undefined

import type { Plan } from '@/lib/chat/types';
import type { KnowledgeHit } from '@/server/types/events';
import { createProtocolFromContext } from '@/server/orchestrator/protocol';
import type { CouncilResult } from '@/server/types/council';

export interface ProtocolSerializationInput {
  conversationId: string;
  intent: string;
  plan: Plan;
  results: Array<{ step: string; result: unknown }>;
  councilResult: CouncilResult | null;
  consensus: {
    approved: boolean;
    score: number;
    summary: string;
    issues?: unknown[];
    votes?: Array<{ memberId?: string; id?: string; vote?: string; approved?: boolean; comment?: string; reason?: string }>;
  } | null;
  knowledgeHitsForCouncil: KnowledgeHit[];
  userMessage?: string;
}

/**
 * Serialize orchestrator context into protocol format
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loops
 */
export function serializeProtocol(input: ProtocolSerializationInput): any {
  const { conversationId, intent, plan, results, councilResult, consensus, knowledgeHitsForCouncil, userMessage } = input;

  // Collect tool calls from results
  const MAX_RESULTS = 1000; // Power of 10 Rule 2: Bounded loop
  const resultsToProcess = results.slice(0, MAX_RESULTS);
  
  const toolCalls = resultsToProcess
    .filter((r: any) => r && r.step && r.result)
    .map((r: any) => {
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      if (!step) return null;
      return {
        tool: step.tool || 'none',
        input: (step.args || {}) as Record<string, unknown>,
        tool_call_id: r.step,
        result: (r.result as any).ok 
          ? { ok: true, truncated: true } 
          : { ok: false, error: (r.result as any).error },
      };
    })
    .filter((call: any) => call && call.tool !== 'none');

  // Collect knowledge evidence
  const MAX_KNOWLEDGE = 1000; // Power of 10 Rule 2: Bounded loop
  const knowledgeToProcess = knowledgeHitsForCouncil.slice(0, MAX_KNOWLEDGE);
  
  const knowledgeEvidence = knowledgeToProcess
    .filter((hit: any) => hit && (hit.title || hit.url))
    .map((hit: any) => ({
      source: hit.source || hit.url || 'unknown',
      summary: hit.title || hit.description || hit.snippet || '',
    }));

  // Extract council votes
  let councilVotes: Array<{ id: string; vote: string; comment?: string }> = [];
  if (councilResult && councilResult.councillorOutputs) {
    const MAX_COUNCILLORS = 100; // Power of 10 Rule 2: Bounded loop
    const councillorsToProcess = councilResult.councillorOutputs.slice(0, MAX_COUNCILLORS);
    councilVotes = councillorsToProcess.map((output) => ({
      id: output.councillorId || 'unknown',
      vote: output.approved ? 'approve' : 'revise',
      comment: output.issues && output.issues[0] ? output.issues[0].message : undefined,
    }));
  } else if (consensus && consensus.votes) {
    const MAX_VOTES = 100; // Power of 10 Rule 2: Bounded loop
    const votesToProcess = consensus.votes.slice(0, MAX_VOTES);
    councilVotes = votesToProcess.map((v) => ({
      id: v.memberId || v.id || 'unknown',
      vote: v.vote || (v.approved ? 'approve' : 'revise'),
      comment: v.comment || v.reason || undefined,
    }));
  }

  // Create protocol JSON
  const protocol = createProtocolFromContext({
    sessionId: conversationId,
    intent: intent,
    plan: {
      steps: plan.plan.map((step: any) => ({
        id: step.id || 'unknown',
        description: step.title || step.description || '',
        tool: step.tool || undefined,
      })),
      objective: plan.objective || userMessage || '',
    },
    council: councilVotes.length > 0 ? {
      approved: councilResult?.approved ?? consensus?.approved ?? true,
      votes: councilVotes,
    } : undefined,
    tools: toolCalls.length > 0 ? {
      name: toolCalls[0]?.tool || 'unknown',
      calls: toolCalls.filter((call: any) => call !== null) as Array<{ tool: string; input: unknown; tool_call_id?: string; result?: unknown }>,
    } : undefined,
    knowledge: knowledgeEvidence.length > 0 ? knowledgeEvidence : undefined,
  });

  return protocol;
}

