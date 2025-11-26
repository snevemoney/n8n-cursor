/**
 * Chat integration helpers
 * 
 * These functions help integrate the Job runtime with the existing chat flow
 * without breaking existing functionality.
 */

import {
  createJob,
  appendJobLog,
  updateJob,
  getJob,
  type Job,
} from './jobStore';
import {
  getOrCreateSessionForConversation,
  getOrCreateDefaultAgent,
} from './agentStore';
import type { Message } from '@/lib/chat/types';

/**
 * Create a Job for a chat request
 * 
 * This should be called at the start of a chat request
 */
export function createChatJob(
  conversationId: string,
  userMessage: string,
  messages: Message[] = [],
): Job {
  // Get or create session and agent
  const agent = getOrCreateDefaultAgent();
  const session = getOrCreateSessionForConversation(conversationId, agent.id);
  
  // Create job
  const job = createJob('chat', {
    sessionId: session.id,
    agentId: agent.id,
    input: userMessage,
    messages: messages,
    conversationId,
  });
  
  appendJobLog(job.id, {
    phase: 'system',
    message: `Chat job created for conversation ${conversationId}`,
  });
  
  return job;
}

/**
 * Log a phase event to a job
 */
export function logJobPhase(
  jobId: string,
  phase: string,
  message: string,
  data?: any,
): void {
  appendJobLog(jobId, {
    phase: phase as any,
    message: data ? `${message}: ${JSON.stringify(data)}` : message,
  });
}

/**
 * Update job with phase result
 */
export function updateJobWithPhaseResult(
  jobId: string,
  phase: string,
  result: any,
): void {
  const job = getJob(jobId);
  if (!job) return;
  
  const contextKey = phase.toLowerCase().replace('_', '');
  updateJob(jobId, {
    context: {
      ...job.context,
      [contextKey]: result,
    },
  });
}

/**
 * Mark job as completed with output
 */
export function completeChatJob(
  jobId: string,
  output: string,
): void {
  const job = getJob(jobId);
  if (!job) return;
  
  updateJob(jobId, {
    status: 'completed',
    context: {
      ...job.context,
      output,
    },
  });
  
  appendJobLog(jobId, {
    phase: 'system',
    message: 'Chat job completed',
  });
}

/**
 * Mark job as failed
 */
export function failChatJob(
  jobId: string,
  error: Error | string,
): void {
  const job = getJob(jobId);
  if (!job) return;
  
  updateJob(jobId, {
    status: 'failed',
    context: {
      ...job.context,
      error: typeof error === 'string' ? error : error.message,
    },
  });
  
  appendJobLog(jobId, {
    phase: 'system',
    message: `Chat job failed: ${typeof error === 'string' ? error : error.message}`,
  });
}

