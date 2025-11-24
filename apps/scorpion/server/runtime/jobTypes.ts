/**
 * Core Job types for Scorpion runtime
 * 
 * Everything Scorpion does becomes a Job:
 * - chat request
 * - research task
 * - n8n import
 * - RAG maintenance
 * - etc.
 */

export type JobStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed';

export type JobType =
  | 'chat'
  | 'research'
  | 'n8n_import'
  | 'rag_update'
  | 'maintenance';

export type JobPhase =
  | 'PLAN'
  | 'COUNCIL'
  | 'TOOL_SELECT'
  | 'KNOWLEDGE'
  | 'USER_TOOLS'
  | 'EXECUTE';

export interface JobLogEntry {
  time: string; // ISO timestamp
  phase: JobPhase | 'system';
  message: string;
}

export interface JobContext {
  // Session and agent tracking
  sessionId?: string;
  agentId?: string;
  
  // Input/output
  input?: unknown;
  output?: unknown;
  
  // Phase-specific data
  plan?: any;
  councilResult?: any;
  selectedTools?: string[];
  knowledgeHits?: any[];
  userTools?: string[];
  execution?: {
    step: number;
    selectedTools: any[];
    toolResults: any[];
    startedAt: string;
    finishedAt?: string;
  };
  
  // Arbitrary additional context
  [key: string]: any;
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  currentPhase: JobPhase | null;
  phaseStep: number; // sub-step within a phase
  createdAt: string;
  updatedAt: string;
  context: JobContext;
  logs: JobLogEntry[];
}

