// apps/scorpion/server/types/council.ts

export interface CouncilInput {
  goalDescription: string;
  planSummary: string;
  draftAnswer?: string;
  domainTags: string[]; // e.g. ['hiring', 'finance', 'ai-system-design']
  toolsUsed?: string[];
  planSteps?: Array<{ tool?: string; description: string }>;
  // Metadata for persistence
  userId?: string;
  conversationId?: string;
  missionId?: string;
}

export type CouncilIssueTag =
  | 'bias'
  | 'ethics'
  | 'complexity'
  | 'tools'
  | 'correctness'
  | 'safety'
  | 'human-context';

export interface CouncilIssue {
  severity: 1 | 2 | 3 | 4 | 5;
  tag: CouncilIssueTag;
  message: string;
  recommendation: string;
  councillorId: string; // 'ethics', 'simplicity', 'tools', etc.
}

export interface CouncilOutput {
  approved: boolean;
  issues: CouncilIssue[];
  revisedPlanSummary?: string;
  revisedAnswer?: string;
  warnings?: string[]; // High-level warnings to inject into answer
}

export interface CouncilMember {
  id: string; // 'ethics', 'simplicity', 'tools', etc.
  name?: string; // Optional display name
  description?: string; // Optional description of what this councillor does
  run(input: CouncilInput): Promise<CouncilOutput> | CouncilOutput;
}

export interface CouncilResult {
  approved: boolean;
  allIssues: CouncilIssue[];
  revisedPlanSummary?: string;
  revisedAnswer?: string;
  warnings: string[];
  councillorOutputs: Array<{
    councillorId: string;
    councillorName: string;
    issues: CouncilIssue[];
    approved: boolean;
  }>;
}

