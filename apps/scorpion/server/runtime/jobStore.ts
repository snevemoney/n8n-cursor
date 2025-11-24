/**
 * In-memory Job store
 * 
 * Later we can swap this with Supabase/Postgres persistence
 */

import { Job, JobStatus, JobType, JobPhase, JobLogEntry, JobContext } from './jobTypes';
import { randomUUID } from 'crypto';

const jobs = new Map<string, Job>();

/**
 * Create a new job
 */
export function createJob(
  type: JobType,
  context: Partial<JobContext> = {},
): Job {
  const now = new Date().toISOString();
  const job: Job = {
    id: randomUUID(),
    type,
    status: 'pending',
    currentPhase: null,
    phaseStep: 0,
    createdAt: now,
    updatedAt: now,
    context: context as JobContext,
    logs: [],
  };
  
  jobs.set(job.id, job);
  return job;
}

/**
 * Get a job by ID
 */
export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

/**
 * List all jobs (optionally filtered)
 */
export function listJobs(filters?: {
  type?: JobType;
  status?: JobStatus;
  sessionId?: string;
  agentId?: string;
}): Job[] {
  let result = Array.from(jobs.values());
  
  if (filters) {
    if (filters.type) {
      result = result.filter(job => job.type === filters.type);
    }
    if (filters.status) {
      result = result.filter(job => job.status === filters.status);
    }
    if (filters.sessionId) {
      result = result.filter(job => job.context.sessionId === filters.sessionId);
    }
    if (filters.agentId) {
      result = result.filter(job => job.context.agentId === filters.agentId);
    }
  }
  
  // Sort by updatedAt descending (most recent first)
  return result.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Update a job
 */
export function updateJob(id: string, patch: Partial<Job>): Job | undefined {
  const existing = jobs.get(id);
  if (!existing) return undefined;
  
  const updated: Job = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  
  jobs.set(id, updated);
  return updated;
}

/**
 * Append a log entry to a job
 */
export function appendJobLog(
  id: string,
  entry: Omit<JobLogEntry, 'time'> & { time?: string },
): Job | undefined {
  const existing = jobs.get(id);
  if (!existing) return undefined;
  
  const logEntry: JobLogEntry = {
    time: entry.time ?? new Date().toISOString(),
    phase: entry.phase,
    message: entry.message,
  };
  
  const updated: Job = {
    ...existing,
    logs: [...existing.logs, logEntry],
    updatedAt: new Date().toISOString(),
  };
  
  jobs.set(id, updated);
  return updated;
}

/**
 * Delete a job (for cleanup)
 */
export function deleteJob(id: string): boolean {
  return jobs.delete(id);
}

/**
 * Get job statistics
 */
export function getJobStats() {
  const allJobs = Array.from(jobs.values());
  return {
    total: allJobs.length,
    byStatus: {
      pending: allJobs.filter(j => j.status === 'pending').length,
      running: allJobs.filter(j => j.status === 'running').length,
      paused: allJobs.filter(j => j.status === 'paused').length,
      completed: allJobs.filter(j => j.status === 'completed').length,
      failed: allJobs.filter(j => j.status === 'failed').length,
    },
    byType: {
      chat: allJobs.filter(j => j.type === 'chat').length,
      research: allJobs.filter(j => j.type === 'research').length,
      n8n_import: allJobs.filter(j => j.type === 'n8n_import').length,
      rag_update: allJobs.filter(j => j.type === 'rag_update').length,
      maintenance: allJobs.filter(j => j.type === 'maintenance').length,
    },
  };
}

