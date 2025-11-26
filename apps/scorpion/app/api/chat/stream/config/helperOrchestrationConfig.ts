/**
 * Helper Orchestration Configuration
 *
 * Configuration for the orchestration of AI helpers (SafetyGuard, ToolRouter,
 * BudgetGovernor, Dispatcher) including:
 * - Helper enablement logic
 * - Intent-based configuration
 * - Retry and timeout policies
 *
 * IMPORTANT: These settings control when helpers are invoked.
 * Changing these values affects helper behavior.
 */

import type { ScorpionIntent } from '@/lib/chat/types';
import { FEATURE_FLAGS, LIMITS } from './pipelineConfig';

// ============================================================================
// HELPER ENABLEMENT
// ============================================================================

/**
 * Determine if SafetyGuard helper should be enabled for the current request
 *
 * SafetyGuard is disabled by environment variable or for specific intents
 */
export function shouldEnableSafetyGuard(
  intent: ScorpionIntent,
  helperConfig: { useSafetyGuard: boolean }
): boolean {
  return helperConfig.useSafetyGuard && FEATURE_FLAGS.ENABLE_SAFETY_GUARD();
}

/**
 * Determine if ToolRouter helper should be enabled for the current request
 *
 * ToolRouter is skipped for identity and small_talk intents (they have no tools)
 */
export function shouldEnableToolRouter(intent: ScorpionIntent): boolean {
  const intentStr = intent as string;
  return intentStr !== 'identity' &&
         intentStr !== 'small_talk' &&
         FEATURE_FLAGS.ENABLE_TOOL_ROUTER();
}

/**
 * Determine if BudgetGovernor helper should be enabled for the current request
 */
export function shouldEnableBudgetGovernor(
  helperConfig: { useBudgetGovernor: boolean }
): boolean {
  return helperConfig.useBudgetGovernor && FEATURE_FLAGS.ENABLE_BUDGET_GOVERNOR();
}

/**
 * Determine if Dispatcher helper should be enabled for the current request
 *
 * Dispatcher requires both the feature flag and multi-machine mode
 */
export function shouldEnableDispatcher(): boolean {
  return FEATURE_FLAGS.ENABLE_DISPATCHER() && FEATURE_FLAGS.MULTI_MACHINE();
}

// ============================================================================
// RETRY POLICIES
// ============================================================================

/**
 * Retry configuration for tool router LLM calls
 */
export const TOOL_ROUTER_RETRY_CONFIG = {
  /** Maximum number of retries before giving up */
  maxRetries: LIMITS.TOOL_ROUTER_MAX_RETRIES,
  /** Maximum iterations for safety (prevents infinite loops) */
  maxIterations: LIMITS.MAX_RETRY_ITERATIONS,
} as const;

// ============================================================================
// CONTEXT LIMITS
// ============================================================================

/**
 * How much conversation history to include in helper prompts
 */
export const HELPER_CONTEXT_LIMITS = {
  /** Max history items for tool router */
  toolRouter: LIMITS.MAX_HISTORY_FOR_HELPERS,
  /** Max history items for RAG retriever */
  ragRetriever: LIMITS.MAX_HISTORY_FOR_RAG,
} as const;

// ============================================================================
// INTENT-SPECIFIC CONFIGURATION
// ============================================================================

/**
 * Force specific tools for certain intents
 *
 * This is a deterministic fallback when the LLM-based tool router
 * fails to suggest appropriate tools.
 */
export function getRequiredToolsForIntent(intent: ScorpionIntent): string[] | null {
  if (intent === 'web_research') {
    return ['research.run'];
  }
  return null;
}

/**
 * Get tool routing rationale for forced intent tools
 */
export function getToolRoutingRationale(intent: ScorpionIntent): string {
  if (intent === 'web_research') {
    return 'Web research query requires the research.run tool for searching and analyzing web content';
  }
  return 'Auto-configured for intent';
}

// ============================================================================
// HELPER ORCHESTRATION LOGGING
// ============================================================================

/**
 * Log helper system status for debugging
 */
export function logHelperStatus(
  helperName: string,
  enabled: boolean,
  context: {
    envFlag?: string | boolean;
    configFlag?: boolean;
    intent?: ScorpionIntent;
  } = {}
): void {
  console.log(`[${helperName}] System status:`, {
    enabled,
    ...context,
    system: enabled ? 'ACTIVE' : 'DISABLED',
  });
}

/**
 * Log helper configuration summary
 */
export function logHelperConfigSummary(
  intent: ScorpionIntent,
  lightweightMode: boolean,
  clientMode: string,
  config: {
    useSafetyGuard: boolean;
    useBudgetGovernor: boolean;
    useMemoryManager: boolean;
    useStyleEnforcer: boolean;
  }
): void {
  console.log(`[Helper Config] Intent: ${intent}, Lightweight: ${lightweightMode}, ClientMode: ${clientMode}`);
  console.log(`[Helper Config] Safety: ${config.useSafetyGuard}, Budget: ${config.useBudgetGovernor}, Memory: ${config.useMemoryManager}, Style: ${config.useStyleEnforcer}`);
}
