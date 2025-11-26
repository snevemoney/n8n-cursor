// Discriminated union for all chat SSE events

export type EV_Progress = {
  type: 'progress';
  conversationId: string;
  phase: 'planning' | 'council' | 'searching' | 'executing' | 'summarizing';
  message: string;
  progress: number; // 0..1
};

export type EV_Status = {
  type: 'status';
  conversationId: string;
  message: string;
  level: 'info' | 'warn' | 'error';
};

export type EV_Thought = {
  type: 'thought';
  conversationId: string;
  phase: EV_Progress['phase'];
  text: string; // sanitized breadcrumb, one sentence
};

export type EV_SearchQuery = {
  type: 'search_query';
  conversationId: string;
  provider: 'tavily' | 'brave' | 'serpapi' | 'custom';
  query: string;
};

export type KnowledgeHit = {
  id?: string;
  title: string;
  url: string;
  snippet?: string;
  score?: number;         // 0..1 or provider score normalized
  publishedAt?: string;   // ISO
  source?: string;        // hostname/provider
  tags?: string[];
};

export type EV_KnowledgeHit = {
  type: 'knowledge_hit';
  conversationId: string;
  hit: KnowledgeHit;
};

export type EV_Citation = {
  type: 'citation';
  conversationId: string;
  rank: number;   // 1..N
  reason?: string;
  link: KnowledgeHit;
};

export type PlanStep = {
  id: string;
  title: string;
  tool: string;
  args: Record<string, unknown>;
  dependsOn?: string[];
  status?: 'pending' | 'running' | 'completed' | 'failed';
};

export type EV_Plan = {
  type: 'plan';
  conversationId: string;
  plan: {
    reasoning?: string;
    objective?: string;
    assumptions?: string[];
    steps: PlanStep[];
  };
};

export type EV_PlanStep = {
  type: 'plan_step';
  conversationId: string;
  step: PlanStep;
};

export type EV_ToolCall = {
  type: 'tool_call';
  conversationId: string;
  callId: string;
  tool: string;
  args: Record<string, unknown>;
};

export type EV_ToolResult = {
  type: 'tool_result';
  conversationId: string;
  callId: string;
  tool: string;
  result: import('./tooling').ToolResult<any>;
};

export type EV_CouncilVote = {
  type: 'council_vote';
  conversationId: string;
  member: string;
  vote: 'approve' | 'revise' | 'reject';
  confidence: number;
  rationale: string;
};

export type EV_CouncilConsensus = {
  type: 'council_consensus';
  conversationId: string;
  summary: string;
  score: number;
  approved: boolean;
};

export type EV_NextBestAction = {
  type: 'next-best-action';
  conversationId: string;
  payload: import('./strategy').NextBestAction;
};

export type EV_SimilarMissions = {
  type: 'similar-missions';
  conversationId: string;
  payload: import('../strategy/similarityEngine').SimilarMission[];
};

export type EV_ImprovementSignal = {
  type: 'improvement-signal';
  conversationId: string;
  payload: import('./strategy').ImprovementSignal;
};

export type EV_CouncilResult = {
  type: 'council_result';
  conversationId: string;
  payload: import('./council').CouncilResult;
};

export type EV_CreativePipeline = {
  type: 'creative-pipeline';
  conversationId: string;
  payload: import('../strategy/creativePipeline').CreativePipelineDecision;
};

export type EV_DataWorkflow = {
  type: 'data-workflow';
  conversationId: string;
  payload: import('../strategy/dataWorkflowSelector').DataWorkflowDecision;
};

export type ChatEvent =
  | EV_Progress
  | EV_Status
  | EV_Thought
  | EV_SearchQuery
  | EV_KnowledgeHit
  | EV_Citation
  | EV_Plan
  | EV_PlanStep
  | EV_ToolCall
  | EV_ToolResult
  | EV_CouncilVote
  | EV_CouncilConsensus
  | EV_NextBestAction
  | EV_SimilarMissions
  | EV_ImprovementSignal
  | EV_CouncilResult
  | EV_CreativePipeline
  | EV_DataWorkflow;

