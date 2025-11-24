/**
 * Scorpion Context - The "Context Window" for Scorpion
 * 
 * Maps to: LLM Tokens & Context Window
 * 
 * This is the unified context object that all agents (Planner, Council, Tools)
 * read from at the start of each "thinking cycle". Think of it as the prompt window.
 */

export type ResourceType = 'tool' | 'doc' | 'workflow' | 'schema' | 'log' | 'event';

export interface ResourceIndexEntry {
  type: ResourceType;
  id: string;
  title: string;
  description: string;
  tags: string[];
  vector?: number[]; // Embedding vector
  metadata: Record<string, unknown>;
}

export interface Event {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  data: Record<string, unknown>;
  stage?: string; // Pipeline stage: 'planner' | 'council' | 'exec' | 'validation' | 'notification'
  stepNumber?: number;
}

export interface ActionDraft {
  id: string;
  type: string;
  description: string;
  tool?: string;
  params?: Record<string, unknown>;
  risks?: string[];
  priority?: number;
}

/**
 * ScorpionContext - The unified context window
 * 
 * Maps to: LLM Context Window (tokens)
 * 
 * Everything that goes into one "thinking cycle" lives here.
 */
export interface ScorpionContext {
  // Current request
  userQuery?: string;
  currentTask?: string;
  
  // Past events (append-only, no time travel)
  pastEvents: Event[];
  
  // Planned actions (can reason about, but not committed)
  plannedActions: ActionDraft[];
  
  // Resource Index (embeddings + metadata)
  resourceIndex: ResourceIndexEntry[];
  
  // Pipeline position
  pipelineStage?: 'planner' | 'council' | 'tool_selection' | 'knowledge_retrieval' | 'execution' | 'validation' | 'notification';
  stepNumber?: number;
  
  // Conversation history
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  
  // Current state summary
  contextSummary?: {
    techDebtCount?: number;
    openTodos?: string[];
    failingWorkflows?: string[];
    keyMetrics?: Record<string, number>;
  };
  
  // Version/timestamp info (positional encoding)
  version?: string;
  lastUpdatedAt?: Date;
}

/**
 * Create a canonical ScorpionContext from various sources
 * 
 * This is your "tokenization" step - converting raw events into structured context
 */
export function createScorpionContext(
  userQuery?: string,
  pastEvents: Event[] = [],
  resourceIndex: ResourceIndexEntry[] = [],
  options?: {
    pipelineStage?: ScorpionContext['pipelineStage'];
    stepNumber?: number;
    conversationHistory?: ScorpionContext['conversationHistory'];
  }
): ScorpionContext {
  return {
    userQuery,
    pastEvents,
    plannedActions: [],
    resourceIndex,
    pipelineStage: options?.pipelineStage,
    stepNumber: options?.stepNumber,
    conversationHistory: options?.conversationHistory,
    lastUpdatedAt: new Date(),
  };
}

/**
 * Add positional encoding tags to context entries
 * 
 * Maps to: Positional Encoding
 * 
 * Tags like [STEP 3][STAGE: council][SOURCE: agent-importer]
 */
export function addPositionalTags(
  context: ScorpionContext,
  source: string
): string {
  const parts: string[] = [];
  
  if (context.stepNumber !== undefined) {
    parts.push(`[STEP ${context.stepNumber}]`);
  }
  
  if (context.pipelineStage) {
    parts.push(`[STAGE: ${context.pipelineStage}]`);
  }
  
  parts.push(`[SOURCE: ${source}]`);
  
  if (context.version) {
    parts.push(`[VERSION: ${context.version}]`);
  }
  
  return parts.join(' ');
}

