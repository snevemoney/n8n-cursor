// apps/scorpion/server/types/strategy.ts

export type MissionPhase =
  | 'PLAN'
  | 'COUNCIL'
  | 'TOOL_SELECT'
  | 'KNOWLEDGE'
  | 'USER_TOOLS'
  | 'EXECUTE';

export interface ScorpionGoal {
  /** High-level user goal, extracted from the conversation */
  description: string;
  /** Optional category (e.g., 'architecture', 'bugfix', 'research', 'product') */
  category?: string;
  /** How clear the goal is (0 = unclear, 1 = fully clear) */
  clarityScore: number;
}

export interface ScorpionContextSnapshot {
  missionId?: string;
  userId: 'evens'; // single user system
  timestamp: string;

  /** Last N messages of the conversation (already available in your orchestrator) */
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;

  /** Optional: current mission phase, if applicable */
  currentPhase?: MissionPhase;

  /** Optional: high-level plan if one exists */
  planSummary?: string;

  /** Optional: tool usage info */
  toolsUsed?: string[];
}

/**
 * Next-Best-Action object passed back to the frontend + logs.
 */
export interface NextBestAction {
  /** Short title for the action */
  title: string;
  /** 1–3 sentences explaining what should happen next */
  description: string;
  /** Concrete steps (for Evens or Scorpion) */
  steps: string[];
  /** Why this action is important now */
  rationale: string;
  /** Optional tool suggestions */
  suggestedTools?: string[];
  /** Known risks, caveats, or blind spots */
  risks?: string[];
}

/**
 * Signals used for self-improvement and diagnostics.
 */
export type ImprovementSignalType =
  | 'TOOL_FAILURE'
  | 'LATENCY_HIGH'
  | 'MISSING_FEATURE'
  | 'BROKEN_FLOW'
  | 'UNWIRED_UI'
  | 'HALLUCINATED_ENDPOINT'
  | 'OVERCOMPLEX_PLAN'
  | 'UNDERUTILIZED_TOOL'
  | 'MISCLASSIFIED_INTENT'
  | 'USER_CORRECTION'
  | 'BIAS_RISK';

export interface ImprovementSignal {
  id: string;
  missionId?: string;
  timestamp: string;
  type: ImprovementSignalType;
  /** Short message */
  message: string;
  /** Free-form details (stack trace, payload, etc.) */
  details?: any;
  /** Optional tag (e.g., 'chat', 'ops-page', 'stats-api') */
  tag?: string;
  /** Severity from 1 (low) to 5 (critical) */
  severity: 1 | 2 | 3 | 4 | 5;
}

/**
 * Aggregated patch suggestion bundle.
 */
export interface PatchSuggestion {
  id: string;
  /** High-level category (DX, performance, correctness, UX, architecture) */
  category: 'DX' | 'PERFORMANCE' | 'CORRECTNESS' | 'UX' | 'ARCHITECTURE';
  summary: string;
  rationale: string;
  /** Concrete recommendations (code, config, workflow) */
  recommendations: string[];
  /** Signals that motivated this patch */
  relatedSignalIds: string[];
}

export interface PatchReport {
  generatedAt: string;
  missionCountAnalyzed: number;
  signalCountAnalyzed: number;
  suggestions: PatchSuggestion[];
}

