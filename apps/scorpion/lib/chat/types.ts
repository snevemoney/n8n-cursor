import { z } from 'zod';

/**
 * Chat types for AGI orchestration
 */

export const MessageRoleSchema = z.enum(['user', 'assistant', 'tool', 'planner', 'council']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

// Part types
export const TextPartSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
});

export const ToolCallPartSchema = z.object({
  type: z.literal('tool_call'),
  tool: z.string(),
  args: z.record(z.any()),
  callId: z.string(),
});

export const ToolResultPartSchema = z.object({
  type: z.literal('tool_result'),
  tool: z.string(),
  callId: z.string(),
  ok: z.boolean(),
  data: z.any(),
  error: z.string().optional(),
});

export const PlanStepPartSchema = z.object({
  type: z.literal('plan_step'),
  stepId: z.string(),
  title: z.string(),
  tool: z.string(),
  args: z.record(z.any()).optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  result: z.any().optional(),
});

export const CitationPartSchema = z.object({
  type: z.literal('citation'),
  title: z.string(),
  url: z.string(),
  spans: z.array(z.object({ text: z.string() })),
});

export const PartSchema = z.discriminatedUnion('type', [
  TextPartSchema,
  ToolCallPartSchema,
  ToolResultPartSchema,
  PlanStepPartSchema,
  CitationPartSchema,
]);

export type Part = z.infer<typeof PartSchema>;

// Message
export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  ts: z.number(),
  content: z.string(),
  parts: z.array(PartSchema).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// Conversation
export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Folder = z.infer<typeof FolderSchema>;

// Update ConversationSchema to include folderId
export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  folderId: z.string().optional(), // NEW
  createdAt: z.number(),
  updatedAt: z.number(),
  meta: z.object({
    projectId: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// Tool spec
export const ToolSpecSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string(),
  schema: z.any(), // Zod schema
});

export type ToolSpec = z.infer<typeof ToolSpecSchema>;

// Council vote
export const CouncilVoteSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  weight: z.number(),
  vote: z.enum(['approve', 'revise', 'reject']),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  scores: z.object({
    scope: z.number(),
    risk: z.number(),
    cost: z.number(),
    prob: z.number(),
  }).optional(),
  edits: z.array(z.any()).optional(),
});

export type CouncilVote = z.infer<typeof CouncilVoteSchema>;

// Plan
export const PlanStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  tool: z.string(),
  args: z.record(z.any()).optional(),
  dependsOn: z.array(z.string()).optional(),
  success: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(), // Execution status
});

export const PlanSchema = z.object({
  objective: z.string(),
  assumptions: z.array(z.string()),
  reasoning: z.string().optional(), // Deep reasoning explanation (Claude Sonnet 4.5 level)
  plan: z.array(PlanStepSchema),
  done_when: z.array(z.string()),
  fallbacks: z.array(z.object({
    if: z.string(),
    then: z.string(),
  })).optional(),
  needsCouncil: z.boolean().optional(), // Whether this plan needs council review
  questionType: z.enum(['casual', 'technical', 'conversational']).optional(), // Type of question for adaptive output
  councilRationale: z.string().optional(), // Why council is/isn't needed
  intent: z.enum(['small_talk', 'general_question', 'project_help', 'system_debug', 'other']).optional(), // Intent classification
});

export type Plan = z.infer<typeof PlanSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;

// Intent classification
export type ScorpionIntent =
  | 'identity'         // "What is Scorpion?", "Who are you?" - identity questions
  | 'small_talk'       // hi, hello, thanks, how are you, etc.
  | 'general_question' // generic knowledge, explanation, etc.
  | 'project_help'     // about Scorpion, the repo, code, workflows
  | 'system_debug'     // "why is Scorpion doing X?", "fix the agent itself"
  | 'web_research'     // "research bitcoin news", "latest crypto updates" - web research queries
  | 'other';

