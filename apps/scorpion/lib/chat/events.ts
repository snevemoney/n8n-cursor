import { z } from 'zod';
import type { Message, CouncilVote, PlanStep } from './types';

/**
 * SSE event types for chat streaming
 */

export const ChatEventSchema = z.discriminatedUnion('type', [
  // Connection
  z.object({
    type: z.literal('connected'),
    data: z.object({ message: z.string() }),
  }),
  
  // Message events
  z.object({
    type: z.literal('message'),
    data: z.any(), // Message object
  }),
  
  // Token streaming
  z.object({
    type: z.literal('delta'),
    data: z.object({
      content: z.string(),
    }),
  }),
  
  // Tool execution
  z.object({
    type: z.literal('tool'),
    data: z.object({
      tool: z.string(),
      callId: z.string(),
      args: z.record(z.any()),
      status: z.enum(['pending', 'running', 'completed', 'failed']),
      result: z.any().optional(),
      error: z.string().optional(),
    }),
  }),
  
  // Status updates
  z.object({
    type: z.literal('status'),
    data: z.object({
      message: z.string(),
      phase: z.enum(['planning', 'council', 'executing', 'summarizing', 'searching', 'researching', 'extracting']).optional(),
      stepId: z.string().optional(),
    }),
  }),
  
  // Council votes
  z.object({
    type: z.literal('council_vote'),
    data: z.any(), // CouncilVote object
  }),
  
  // Plan steps
  z.object({
    type: z.literal('plan_step'),
    data: z.any(), // PlanStep object
  }),
  
  // Errors
  z.object({
    type: z.literal('error'),
    data: z.object({
      message: z.string(),
      details: z.string().optional(),
    }),
  }),
  
  // Completion
  z.object({
    type: z.literal('done'),
    data: z.object({
      messageId: z.string(),
    }),
  }),
  
  // Council deliberation events
  z.object({
    type: z.literal('council_start'),
    data: z.object({
      message: z.string(),
      members: z.array(z.object({
        id: z.string(),
        name: z.string(),
        role: z.string().optional(),
      })),
      planSummary: z.string().optional(),
    }),
  }),
  
  z.object({
    type: z.literal('council_thinking'),
    data: z.object({
      memberId: z.string(),
      memberName: z.string(),
      memberRole: z.string().optional(),
      status: z.enum(['analyzing', 'formulating', 'completed']),
      message: z.string(),
      fullResponse: z.string().optional(),
    }),
  }),
  
  z.object({
    type: z.literal('council_thinking_delta'),
    data: z.object({
      memberId: z.string(),
      memberName: z.string(),
      content: z.string(),
      accumulated: z.string(),
    }),
  }),
  
  z.object({
    type: z.literal('council_communication'),
    data: z.object({
      memberId: z.string(),
      memberName: z.string(),
      message: z.string(),
      vote: z.string(),
      confidence: z.number(),
    }),
  }),
  
  z.object({
    type: z.literal('council_complete'),
    data: z.object({
      message: z.string(),
      totalVotes: z.number(),
    }),
  }),
  
  z.object({
    type: z.literal('council_error'),
    data: z.object({
      message: z.string(),
    }),
  }),
  
  z.object({
    type: z.literal('council_consensus'),
    data: z.object({
      score: z.number(),
      approved: z.boolean(),
      summary: z.string(),
    }),
  }),
  
  // Knowledge search results
  z.object({
    type: z.literal('knowledge'),
    data: z.object({
      hits: z.array(z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        spans: z.array(z.object({ text: z.string() })),
        relevance: z.number().optional(),
      })),
    }),
  }),

  // Add new event types
  z.object({
    type: z.literal('progress'),
    data: z.object({
      phase: z.string(),
      step: z.string().optional(),
      progress: z.number().optional(), // 0-100
      message: z.string(),
    }),
  }),

  z.object({
    type: z.literal('tool_progress'),
    data: z.object({
      tool: z.string(),
      callId: z.string(),
      progress: z.string(),
      status: z.enum(['starting', 'running', 'completed', 'failed']),
    }),
  }),

  // New event types for thinking overlay
  z.object({
    type: z.literal('thought'),
    data: z.object({
      phase: z.enum(['planning', 'council', 'executing', 'summarizing', 'researching']),
      message: z.string(), // Sanitized, 1 sentence reason
      timestamp: z.number().optional(),
    }),
  }),

  z.object({
    type: z.literal('search_query'),
    data: z.object({
      query: z.string(),
      provider: z.string().optional(), // 'tavily', 'brave', 'serpapi', etc.
      timestamp: z.number().optional(),
    }),
  }),

  z.object({
    type: z.literal('citation'),
    data: z.object({
      title: z.string(),
      url: z.string(),
      rank: z.number().optional(),
      reason: z.string().optional(), // Why this source was chosen
      score: z.number().optional(),
      timestamp: z.number().optional(),
    }),
  }),

  // Knowledge hit event (already exists but ensure it's in schema)
  z.object({
    type: z.literal('knowledge_hit'),
    data: z.object({
      title: z.string(),
      url: z.string(),
      score: z.number().optional(),
      excerpt: z.string().optional(),
      snippet: z.string().optional(),
      provider: z.string().optional(),
      publishedAt: z.string().optional(),
      query: z.string().optional(),
      category: z.string().optional(),
      conversationId: z.string().optional(),
    }),
  }),
]);

export type ChatEvent = z.infer<typeof ChatEventSchema>;

/**
 * Helper to create SSE message
 */
export function createSSEMessage(event: ChatEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

