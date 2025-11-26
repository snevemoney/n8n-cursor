/**
 * Scorpion Agent Protocol Schema
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 * 
 * Defines the canonical JSON structure for all Scorpion responses
 * This protocol encodes: plan, council, tools, knowledge, observability, brain_map
 */

import { z } from 'zod';

/**
 * Protocol Meta Schema
 * Power of 10 Rule 3: Small, focused schema
 */
const ProtocolMetaSchema = z.object({
  version: z.string().default('scorpion-v1'),
  session_id: z.string().optional(),
  timestamp: z.string().optional(),
});

/**
 * Plan Step Schema
 * Power of 10 Rule 3: Small schema
 */
const PlanStepSchema = z.object({
  id: z.string(),
  description: z.string(),
  owner_expert: z.string().optional(),
  tool: z.string().optional(),
  args: z.record(z.unknown()).optional(),
  dependsOn: z.array(z.string()).optional(),
});

/**
 * Plan Schema
 * Power of 10 Rule 3: Small schema
 */
const PlanSchema = z.object({
  steps: z.array(PlanStepSchema),
  objective: z.string().optional(),
});

/**
 * Council Member Vote Schema
 * Power of 10 Rule 3: Small schema
 */
const CouncilVoteSchema = z.object({
  id: z.string(),
  vote: z.enum(['approve', 'revise', 'reject']),
  comment: z.string().optional(),
});

/**
 * Council Schema
 * Power of 10 Rule 3: Small schema
 */
const CouncilSchema = z.object({
  members: z.array(CouncilVoteSchema),
  decision: z.enum(['consensus', 'revised', 'rejected']).optional(),
  approved: z.boolean().optional(),
});

/**
 * Tool Call Schema
 * Power of 10 Rule 3: Small schema
 */
const ToolCallSchema = z.object({
  tool: z.string(),
  input: z.record(z.unknown()),
  tool_call_id: z.string().optional(),
  result: z.unknown().optional(),
});

/**
 * Tools Schema
 * Power of 10 Rule 3: Small schema
 */
const ToolsSchema = z.object({
  selected: z.array(z.object({
    name: z.string(),
    reason: z.string().optional(),
  })),
  calls: z.array(ToolCallSchema).optional(),
});

/**
 * Knowledge Evidence Schema
 * Power of 10 Rule 3: Small schema
 */
const KnowledgeEvidenceSchema = z.object({
  source: z.string(),
  tool_call_id: z.string().optional(),
  summary: z.string(),
});

/**
 * Knowledge Schema
 * Power of 10 Rule 3: Small schema
 */
const KnowledgeSchema = z.object({
  evidence: z.array(KnowledgeEvidenceSchema).optional(),
});

/**
 * User Tool Suggestion Schema
 * Power of 10 Rule 3: Small schema
 */
const UserToolSuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string().optional(),
});

/**
 * User Tools Schema
 * Power of 10 Rule 3: Small schema
 */
const UserToolsSchema = z.object({
  suggestions: z.array(UserToolSuggestionSchema).optional(),
});

/**
 * Observability Phase Schema
 * Power of 10 Rule 3: Small schema
 */
const ObservabilityPhaseSchema = z.object({
  name: z.string(),
  status: z.enum(['done', 'running', 'error']),
  latency_ms: z.number().optional(),
});

/**
 * Observability Event Schema
 * Power of 10 Rule 3: Small schema
 */
const ObservabilityEventSchema = z.object({
  type: z.string(),
  experts: z.array(z.string()).optional(),
  reason: z.string().optional(),
  phase: z.string().optional(),
});

/**
 * Observability Schema
 * Power of 10 Rule 3: Small schema
 */
const ObservabilitySchema = z.object({
  phases: z.array(ObservabilityPhaseSchema).optional(),
  events: z.array(ObservabilityEventSchema).optional(),
});

/**
 * Brain Map Node Schema
 * Power of 10 Rule 3: Small schema
 */
const BrainMapNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['expert', 'phase', 'tool', 'agent']),
  weight: z.number().optional(),
});

/**
 * Brain Map Edge Schema
 * Power of 10 Rule 3: Small schema
 */
const BrainMapEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  relation: z.string().optional(),
});

/**
 * Brain Map Schema
 * Power of 10 Rule 3: Small schema
 */
const BrainMapSchema = z.object({
  active_nodes: z.array(BrainMapNodeSchema).optional(),
  edges: z.array(BrainMapEdgeSchema).optional(),
});

/**
 * Answer Schema
 * Power of 10 Rule 3: Small schema
 */
const AnswerSchema = z.object({
  summary: z.string(),
  steps: z.array(z.string()).optional(),
});

/**
 * Complete Scorpion Agent Protocol Schema
 * Power of 10 Rule 3: Composed from smaller schemas
 */
export const ScorpionProtocolSchema = z.object({
  meta: ProtocolMetaSchema.optional(),
  intent: z.string().optional(),
  plan: PlanSchema.optional(),
  council: CouncilSchema.optional(),
  tools: ToolsSchema.optional(),
  knowledge: KnowledgeSchema.optional(),
  user_tools: UserToolsSchema.optional(),
  observability: ObservabilitySchema.optional(),
  brain_map: BrainMapSchema.optional(),
  answer: AnswerSchema.optional(),
});

/**
 * TypeScript type derived from Zod schema
 */
export type ScorpionProtocol = z.infer<typeof ScorpionProtocolSchema>;

/**
 * Validate protocol JSON
 * Power of 10 Rule 3: ≤ 60 lines, Rule 7: Handle errors
 */
export function validateProtocol(data: unknown): { ok: boolean; data?: ScorpionProtocol; error?: string } {
  try {
    const result = ScorpionProtocolSchema.safeParse(data);
    if (result.success) {
      return { ok: true, data: result.data };
    } else {
      return { ok: false, error: result.error.message };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { ok: false, error: errorMessage };
  }
}

/**
 * Create protocol from orchestrator context
 * Power of 10 Rule 3: ≤ 60 lines
 */
export function createProtocolFromContext(context: {
  sessionId?: string;
  intent?: string;
  plan?: { steps: Array<{ id: string; description: string; tool?: string }>; objective?: string };
  council?: { approved: boolean; votes: Array<{ id: string; vote: string; comment?: string }> };
  tools?: { name: string; calls?: Array<{ tool: string; input: unknown; tool_call_id?: string; result?: unknown }> } | Array<{ name: string; calls?: Array<{ tool: string; input: unknown }> }>;
  knowledge?: Array<{ source: string; summary: string }>;
  expertRouting?: { phase: string; experts: Array<{ id: string; name: string }>; reason: string };
}): ScorpionProtocol {
  const protocol: ScorpionProtocol = {
    meta: {
      version: 'scorpion-v1',
      session_id: context.sessionId,
      timestamp: new Date().toISOString(),
    },
  };

  if (context.intent) {
    protocol.intent = context.intent;
  }

  if (context.plan) {
    protocol.plan = {
      steps: context.plan.steps.map(step => ({
        id: step.id,
        description: step.description,
        tool: step.tool,
      })),
      objective: context.plan.objective,
    };
  }

  if (context.council) {
    protocol.council = {
      members: context.council.votes.map(v => ({
        id: v.id,
        vote: v.vote as 'approve' | 'revise' | 'reject',
        comment: v.comment,
      })),
      approved: context.council.approved,
      decision: context.council.approved ? 'consensus' : 'revised',
    };
  }

  if (context.tools) {
    // Handle both array and single object formats - Power of 10 Rule 7: Guard types
    if (Array.isArray(context.tools)) {
      protocol.tools = {
        selected: context.tools.map(t => ({ name: t.name })),
        calls: context.tools.flatMap(t => t.calls || []).map(call => ({
          tool: call.tool,
          input: call.input as Record<string, unknown>,
        })),
      };
    } else {
      // Single tool object format - Power of 10 Rule 7: Guard types
      protocol.tools = {
        selected: [{ name: context.tools.name }],
        calls: (context.tools.calls || []).map(call => ({
          tool: call.tool,
          input: call.input as Record<string, unknown>,
          tool_call_id: call.tool_call_id,
          result: call.result,
        })),
      };
    }
  }

  if (context.knowledge) {
    protocol.knowledge = {
      evidence: context.knowledge.map(k => ({
        source: k.source,
        summary: k.summary,
      })),
    };
  }

  if (context.expertRouting) {
    const expertRouting = context.expertRouting;
    protocol.observability = {
      events: [{
        type: 'expert_routing',
        phase: expertRouting.phase,
        experts: expertRouting.experts.map(e => e.id),
        reason: expertRouting.reason,
      }],
    };

    protocol.brain_map = {
      active_nodes: expertRouting.experts.map(e => ({
        id: `expert:${e.id}`,
        type: 'expert' as const,
        weight: 0.8,
      })),
      edges: expertRouting.experts.map(e => ({
        from: `phase:${expertRouting.phase}`,
        to: `expert:${e.id}`,
        relation: 'assigned',
      })),
    };
  }

  return protocol;
}

