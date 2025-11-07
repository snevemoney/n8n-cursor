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
      status: z.enum(['started', 'completed', 'failed']),
      result: z.any().optional(),
      error: z.string().optional(),
    }),
  }),
  
  // Status updates
  z.object({
    type: z.literal('status'),
    data: z.object({
      message: z.string(),
      phase: z.enum(['planning', 'council', 'executing', 'summarizing']).optional(),
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
]);

export type ChatEvent = z.infer<typeof ChatEventSchema>;

/**
 * Helper to create SSE message
 */
export function createSSEMessage(event: ChatEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

