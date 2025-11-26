/**
 * Core Pipeline Types
 *
 * Type definitions for the chat pipeline stages.
 * These types define the data contracts between pipeline stages.
 *
 * IMPORTANT: These types are part of the internal pipeline contract.
 * Changes here affect multiple stages of the pipeline.
 */

import type { Message, ScorpionIntent } from '@/lib/chat/types';
import type { ReadableStreamDefaultController } from 'stream/web';

// ============================================================================
// REQUEST INGESTION TYPES
// ============================================================================

/**
 * Result of request validation and ingestion
 *
 * Contains all information extracted from the raw request
 * that is needed for subsequent pipeline stages.
 */
export interface IngestedRequest {
  /** The latest user message (extracted from messages array) */
  userMessage: string;

  /** Unique identifier for this message */
  messageId: string;

  /** Full conversation history (all messages) */
  conversationHistory: Message[];

  /** Filtered history (validated messages only) */
  filteredHistory: Message[];

  /** Classified intent for this request */
  intent: ScorpionIntent;

  /** User ID (single-user mode: always 'evens') */
  userId: string;

  /** Whether system is in lightweight resource mode */
  lightweightMode: boolean;

  /** Conversation ID (if provided) */
  conversationId: string | undefined;

  /** Provider for model execution (e.g., 'ollama') */
  provider: string | undefined;

  /** Model name (e.g., 'llama3') */
  model: string | undefined;
}

// ============================================================================
// STREAM TYPES
// ============================================================================

/**
 * Stream state tracking
 */
export interface StreamState {
  closed: boolean;
  aborted: boolean;
}

/**
 * SSE event sender function
 */
export type SendFunction = (event: {
  type: string;
  data: Record<string, unknown>;
}) => void;

/**
 * Stream context containing all stream-related utilities
 */
export interface StreamContext {
  streamState: StreamState;
  encoder: TextEncoder;
  send: SendFunction;
  checkAbort: () => void;
  controller: ReadableStreamDefaultController<Uint8Array>;
}

// ============================================================================
// QUERY CLASSIFICATION TYPES
// ============================================================================

/**
 * Query classification flags
 *
 * Computed from user message for quick access throughout pipeline
 */
export interface QueryClassification {
  /** Is this a codebase-related question? */
  isCodebaseQuestion: boolean;

  /** Is this an operational/health question? */
  isOperationalQuestion: boolean;

  /** Is this a workflow-related question? */
  isWorkflowQuestion: boolean;

  /** Is this an analysis/investigation question? */
  isAnalysisQuestion: boolean;

  /** Is this a file query (recent files)? */
  isFileQuery: boolean;
}

// ============================================================================
// MODEL CONFIGURATION TYPES
// ============================================================================

/**
 * Model configuration for LLM calls
 */
export interface ModelConfig {
  provider: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// ============================================================================
// ROUTING TYPES
// ============================================================================

/**
 * User tool detection result
 */
export interface DetectedUserTool {
  tool: any; // UserTool type from @/lib/chat/tools
  argsText: string;
  isAiTool: boolean;
}

/**
 * Route result - determines which pipeline path to take
 *
 * This union type represents the routing decision made by the intent router.
 * Each variant triggers a different execution path in the main pipeline.
 */
export type RouteResult =
  | {
      /** Route to short-circuit handler (identity, small_talk, or user_tool) */
      type: 'short-circuit';
      /** Which handler to use */
      handler: 'identity' | 'small_talk' | 'user_tool';
      /** Detected user tool (only present when handler === 'user_tool') */
      detectedTool?: DetectedUserTool;
    }
  | {
      /** Route to transformer orchestrator */
      type: 'transformer';
    }
  | {
      /** Route to standard multi-phase pipeline (planner → council → executor → summarizer) */
      type: 'standard-pipeline';
    };

// ============================================================================
// HELPER ORCHESTRATION TYPES
// ============================================================================

/**
 * Input for helper orchestration
 */
export interface HelperOrchestratorInput {
  userMessage: string;
  intent: ScorpionIntent;
  conversationHistory: Message[];
  conversationId: string | undefined;
  lightweightMode: boolean;
  provider: string | undefined;
  model: string;
  send: SendFunction;
}

/**
 * Result from helper orchestration
 * Contains all helper outputs needed for subsequent pipeline stages
 */
export interface HelperOrchestratorResult {
  /** Safety guard check result */
  safetyCheck: any | null;
  /** Tool routing recommendation */
  routing: any | null;
  /** Budget allocation recommendation */
  budget: any | null;
  /** Dispatcher placement (for multi-machine setups) */
  dispatcher: any | null;
  /** Whether request was blocked by safety guard */
  blocked: boolean;
  /** Model configuration used for helpers */
  modelConfig: ModelConfig;
  /** Function to run models (with error handling) */
  runModelForPrompt: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Context object for JARVIS mode
 */
export interface JarvisContext {
  clientMode: string;
  conversationId: string;
  intent: ScorpionIntent;
  lightweightMode: boolean;
}

// ============================================================================
// PIPELINE EXECUTION TYPES
// ============================================================================

/**
 * Input for full pipeline execution
 */
export interface PipelineExecutorInput {
  /** User's message */
  userMessage: string;
  /** Unique message identifier */
  messageId: string;
  /** Full conversation history */
  conversationHistory: Message[];
  /** Filtered conversation history (context-limited) */
  filteredHistory: Message[];
  /** Classified intent */
  intent: ScorpionIntent;
  /** User identifier (JARVIS mode: always 'evens') */
  userId: string;
  /** Whether running in lightweight mode */
  lightweightMode: boolean;
  /** Optional conversation identifier */
  conversationId: string | undefined;
  /** Model provider */
  provider: string | undefined;
  /** Model name */
  model: string;

  /** Query classification flags */
  queryClassification: QueryClassification;

  /** Preflight check results */
  preflightResult: {
    safety: any;
    routing: any;
    budget: any;
    finalIntent: ScorpionIntent;
    modelConfig: ModelConfig;
    runModelForPrompt: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
  };

  /** Stream context (send, checkAbort, streamState) */
  streamContext: StreamContext;

  /** Tools available for execution */
  tools: any;

  /** User-defined tools */
  userTools: any[];

  /** Orchestrator instance */
  orchestrator: any;

  /** File tracker (optional) */
  tracker: unknown;

  /** Chat job for tracking (optional) */
  chatJob: any | null;
}

/**
 * Output from full pipeline execution
 */
export interface PipelineExecutorOutput {
  /** Generated plan */
  plan: any | null;
  /** Council result (if council was used) */
  councilResult: any | null;
  /** Execution result */
  executionResult: any | null;
  /** Final summary/answer */
  summary: string | null;
  /** Whether execution was successful */
  success: boolean;
  /** Final refined intent */
  finalIntent: ScorpionIntent;
}
