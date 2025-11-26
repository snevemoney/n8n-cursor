/**
 * Canonical Council Contract
 * 
 * This is the single source of truth for council types.
 * All council implementations must conform to this contract.
 */

/**
 * Power of 10 Rule 5: Typed council question context
 */
import type { Plan } from '@/lib/chat/types';

export interface CouncilQuestion {
  id: string;
  text: string;
  context: {
    plan?: Plan;
    planSummary?: string;
    previousTools?: string[];
    sessionId?: string;
    agentId?: string;
    conversationHistory?: Array<{ role: string; content: string; [key: string]: unknown }>;
    knowledgeHits?: Array<{ id: string; snippet: string; source: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
}

export interface CouncilVote {
  agentId: string;
  agentName: string;
  reasoning: string;
  answer: string;
  confidence: number;
  vote?: 'approve' | 'reject' | 'revise';
  weight?: number;
  rationale?: string;
}

export interface CouncilResult {
  questionId: string;
  votes: CouncilVote[];
  finalAnswer: string;
  approved: boolean;
  score?: number;
  summary?: string;
  issues?: Array<{
    severity: number;
    tag: string;
    message: string;
    recommendation: string;
  }>;
  warnings?: string[];
  meta?: Record<string, unknown>;
}


