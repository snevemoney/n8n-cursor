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
export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
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
});

export const PlanSchema = z.object({
  objective: z.string(),
  assumptions: z.array(z.string()),
  plan: z.array(PlanStepSchema),
  done_when: z.array(z.string()),
  fallbacks: z.array(z.object({
    if: z.string(),
    then: z.string(),
  })).optional(),
});

export type Plan = z.infer<typeof PlanSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;

