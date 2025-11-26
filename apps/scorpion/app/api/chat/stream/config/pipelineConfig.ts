/**
 * Pipeline Configuration
 *
 * Centralized configuration for the chat pipeline including:
 * - Model settings (tokens, temperature)
 * - Cache settings
 * - Feature flags
 * - Query patterns
 * - Limits and constants
 *
 * IMPORTANT: Changing these values affects pipeline behavior.
 * External behavior must remain unchanged unless explicitly approved.
 */

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

/**
 * Model token limits based on system resource mode
 */
export const MODEL_CONFIG = {
  /** Max tokens for planner phase */
  PLANNER_MAX_TOKENS: {
    LIGHTWEIGHT: 500,
    NORMAL: 1500,
  },
  /** Temperature for planner phase */
  PLANNER_TEMPERATURE: {
    LIGHTWEIGHT: 0.05,
    NORMAL: 0.08,
  },
  /** Max tokens for general model calls */
  GENERAL_MAX_TOKENS: {
    LIGHTWEIGHT: 400,
    NORMAL: 1200,
  },
  /** Temperature for general model calls */
  GENERAL_TEMPERATURE: {
    LIGHTWEIGHT: 0.05,
    NORMAL: 0.07,
  },
  /** Max tokens for summarizer phase */
  SUMMARIZER_MAX_TOKENS: {
    LIGHTWEIGHT: 800,
    NORMAL: 1500,
  },
  /** Temperature for summarizer phase */
  SUMMARIZER_TEMPERATURE: {
    LIGHTWEIGHT: 0.08,
    NORMAL: 0.12,
  },
} as const;

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/**
 * Response cache settings for lightweight resource usage
 */
export const CACHE_CONFIG = {
  /** Cache time-to-live in milliseconds (30 minutes) */
  TTL: 30 * 60 * 1000,
  /** Maximum cache size (number of entries) */
  MAX_SIZE: 200,
  /** Percentage of oldest entries to remove when cache is full */
  CLEANUP_PERCENTAGE: 0.1,
  /** Maximum key length for cache keys */
  KEY_LENGTH: 150,
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature toggles - controlled via environment variables
 * These map to process.env values but are centralized here for clarity
 */
export const FEATURE_FLAGS = {
  /** Enable transformer orchestrator architecture */
  USE_TRANSFORMER: () => process.env.USE_TRANSFORMER_ORCHESTRATOR === 'true',
  /** Enable transformer debug mode */
  TRANSFORMER_DEBUG: () => process.env.TRANSFORMER_DEBUG === 'true',
  /** Enable safety guard helper */
  ENABLE_SAFETY_GUARD: () => process.env.SCORPION_ENABLE_SAFETY_GUARD !== '0',
  /** Enable tool router helper */
  ENABLE_TOOL_ROUTER: () => process.env.SCORPION_ENABLE_TOOL_ROUTER !== '0',
  /** Enable budget governor helper */
  ENABLE_BUDGET_GOVERNOR: () => process.env.SCORPION_ENABLE_BUDGET_GOVERNOR !== '0',
  /** Enable dispatcher helper */
  ENABLE_DISPATCHER: () => process.env.SCORPION_ENABLE_DISPATCHER !== '0',
  /** Multi-machine mode (required for dispatcher) */
  MULTI_MACHINE: () => process.env.SCORPION_MULTI_MACHINE === '1',
  /** Enable RAG retriever query rewriting */
  ENABLE_RAG_RETRIEVER: () => process.env.SCORPION_ENABLE_RAG_RETRIEVER !== '0',
} as const;

// ============================================================================
// QUERY PATTERN DETECTION
// ============================================================================

/**
 * Regex patterns for classifying user queries
 */
export const QUERY_PATTERNS = {
  /** Codebase-related keywords */
  CODEBASE_KEYWORDS: /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation|repository|repo|package|module)/i,

  /** Operational questions (system health, metrics) */
  OPERATIONAL: /(system health|check system|system status|show logs|recent errors|system metrics|uptime|health check)/i,

  /** Workflow-related questions */
  WORKFLOW: /(workflow|n8n|execution|orchestration|automation|trigger workflow|run workflow|workflow status|execute workflow|workflow id)/i,

  /** Analysis/investigation questions */
  ANALYSIS: /(analyze|analysis|investigate|debug|why|how|explain|trace|track|monitor)/i,

  /** File query patterns (recent files) */
  FILE_QUERY_PART1: /(file|read|show|content|code|implementation|function|class)/i,
  FILE_QUERY_PART2: /(recent|latest|last|new|modified|updated|created|change)/i,

  /** Technical fallback patterns */
  TECHNICAL_FALLBACK: /(implement|deploy|integrate|build|create|develop|design|architecture|microservices|distributed|system design|api|database|workflow|security|performance|optimize|refactor|migrate|configure|setup|install|how to|how do|how can|how should|how would|error|bug|issue|problem|fix|debug|best practice|recommend|strategy|approach|pattern)/i,

  /** Casual/informational patterns */
  CASUAL_FALLBACK: /^(what is|who is|what are|who are|tell me about|more details|more analysis|define|explain what|explain who|what|who|which|when|where)\s+(is|are|was|were|about)/i,
  CASUAL_PREFIX: /^(can you|could you|would you)\s+(tell|explain|describe|define)/i,
  CASUAL_SIMPLE: /^(scorpion|lightningflow|n8n)$/i,
  CASUAL_EXPLAIN: /^(what|who|tell me|explain|describe)\s+(scorpion|lightningflow|n8n)/i,

  /** "What is" question patterns */
  WHAT_IS_QUESTION: /^(what is|what are|who is|who are|tell me about|explain what|explain who)\s+(scorpion|lightningflow|lightning flow|n8n|the project|this app|this codebase)/i,
  WHAT_IS_SIMPLE: /^(what|who|tell me|explain|describe)\s+(is|are)\s+(scorpion|lightningflow|lightning flow|n8n)/i,
} as const;

// ============================================================================
// LIMITS & CONSTANTS
// ============================================================================

/**
 * System limits and magic numbers
 */
export const LIMITS = {
  /** Maximum validation errors to process */
  MAX_VALIDATION_ERRORS: 1000,

  /** Maximum retries for tool router LLM calls */
  TOOL_ROUTER_MAX_RETRIES: 2,

  /** Maximum iterations for retry loops (safety limit) */
  MAX_RETRY_ITERATIONS: 10,

  /** Maximum conversation history items to send to helpers */
  MAX_HISTORY_FOR_HELPERS: 5,

  /** Maximum conversation history items for RAG retriever */
  MAX_HISTORY_FOR_RAG: 3,

  /** Context items for file tracker */
  FILE_TRACKER_CONTEXT_LIMIT: 10,

  /** Transformer word chunk size for streaming */
  TRANSFORMER_CHUNK_SIZE: 10,

  /** Council timeout durations (milliseconds) */
  COUNCIL_TIMEOUT: {
    COUNCIL_QUESTION: 30000,
    OTHER: 15000,
  },
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default user ID (for single-user JARVIS mode)
 */
export const DEFAULT_USER_ID = 'evens';

/**
 * Default client mode (JARVIS mode: always owner)
 */
export const DEFAULT_CLIENT_MODE = 'owner';

/**
 * Risk modes for transformer orchestrator
 */
export const RISK_MODES = {
  LIGHTWEIGHT: 'safe' as const,
  NORMAL: 'balanced' as const,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get model config for current resource mode
 */
export function getModelConfig(lightweightMode: boolean, phase: 'planner' | 'general' | 'summarizer' = 'general') {
  const mode = lightweightMode ? 'LIGHTWEIGHT' : 'NORMAL';

  switch (phase) {
    case 'planner':
      return {
        maxTokens: MODEL_CONFIG.PLANNER_MAX_TOKENS[mode],
        temperature: MODEL_CONFIG.PLANNER_TEMPERATURE[mode],
      };
    case 'summarizer':
      return {
        maxTokens: MODEL_CONFIG.SUMMARIZER_MAX_TOKENS[mode],
        temperature: MODEL_CONFIG.SUMMARIZER_TEMPERATURE[mode],
      };
    case 'general':
    default:
      return {
        maxTokens: MODEL_CONFIG.GENERAL_MAX_TOKENS[mode],
        temperature: MODEL_CONFIG.GENERAL_TEMPERATURE[mode],
      };
  }
}

/**
 * Check if query is a file query (matches both patterns)
 */
export function isFileQuery(message: string): boolean {
  return QUERY_PATTERNS.FILE_QUERY_PART1.test(message) &&
         QUERY_PATTERNS.FILE_QUERY_PART2.test(message);
}

/**
 * Check if query is a codebase question
 */
export function isCodebaseQuestion(message: string): boolean {
  return QUERY_PATTERNS.CODEBASE_KEYWORDS.test(message);
}

/**
 * Check if query is a "what is" question
 */
export function isWhatIsQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  return QUERY_PATTERNS.WHAT_IS_QUESTION.test(lower) ||
         QUERY_PATTERNS.WHAT_IS_SIMPLE.test(lower);
}

/**
 * Check if query is technical (for fallback routing)
 */
export function isTechnicalQuery(message: string): boolean {
  return QUERY_PATTERNS.TECHNICAL_FALLBACK.test(message.toLowerCase());
}

/**
 * Check if query is casual/informational (for fallback routing)
 */
export function isCasualQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return QUERY_PATTERNS.CASUAL_FALLBACK.test(lower) ||
         QUERY_PATTERNS.CASUAL_PREFIX.test(lower) ||
         QUERY_PATTERNS.CASUAL_SIMPLE.test(lower.trim()) ||
         QUERY_PATTERNS.CASUAL_EXPLAIN.test(lower);
}
