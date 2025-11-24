// apps/scorpion/server/types/plan.ts

export type PlanStepKind =
  | 'reasoning'
  | 'tool'
  | 'refactor'
  | 'test'
  | 'review';

export interface PlanStep {
  id: string;
  kind: PlanStepKind;
  description: string;
  /** Optional tool name if kind === 'tool' */
  toolName?: string;
  /** Step depends on these step ids */
  dependsOn?: string[];
  /** Optional tags (e.g. 'high-impact', 'optional') */
  tags?: string[];
}

export interface ScorpionPlan {
  id: string;
  missionId?: string;
  steps: PlanStep[];
  createdAt: string;
}

