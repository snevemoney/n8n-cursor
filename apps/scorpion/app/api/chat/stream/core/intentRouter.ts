/**
 * Intent Router Module
 *
 * Determines the execution path for incoming requests:
 * - Short-circuit paths (identity, small_talk, user_tool)
 * - Transformer orchestrator
 * - Standard multi-phase pipeline
 *
 * IMPORTANT: This module makes routing DECISIONS only.
 * It does NOT execute handlers - it returns a RouteResult that tells
 * the caller which handler to invoke.
 *
 * Behavior guarantee:
 * - Reuses existing detection logic (detectUserTool, isSimpleGreeting)
 * - No new behavior - just extracts existing routing decisions
 * - Maintains exact same precedence order as before
 */

import type { IngestedRequest, RouteResult, DetectedUserTool } from './types';
import { detectUserTool } from '@/lib/chat/tools';
import { isSimpleGreeting } from '../helpers/intentHandlers';
import { FEATURE_FLAGS } from '../config/pipelineConfig';

// ============================================================================
// ROUTING DECISION
// ============================================================================

/**
 * Determine which execution path to take for this request
 *
 * Precedence order (matches existing behavior):
 * 1. Transformer orchestrator (if enabled)
 * 2. Identity intent short-circuit
 * 3. Small talk intent short-circuit
 * 4. User tool command short-circuit
 * 5. Standard pipeline (default)
 *
 * @param request - Ingested request with classification
 * @returns Route decision indicating which path to take
 *
 * Behavior guarantee:
 * - Exact same precedence as existing inline code
 * - Uses existing helpers (detectUserTool, isSimpleGreeting, FEATURE_FLAGS)
 * - No new logic introduced
 */
export async function routeRequest(
  request: IngestedRequest
): Promise<RouteResult> {
  const { intent, userMessage } = request;

  // ========================================================================
  // PRIORITY 1: Transformer orchestrator (if enabled)
  // ========================================================================
  // Check if transformer orchestrator is enabled via feature flag
  if (FEATURE_FLAGS.USE_TRANSFORMER()) {
    console.log('[Intent Router] Routing to transformer orchestrator');
    return { type: 'transformer' };
  }

  // ========================================================================
  // PRIORITY 2: Identity intent short-circuit
  // ========================================================================
  // Identity questions are answered directly without tools/planner/council
  if (intent === 'identity') {
    console.log('[Intent Router] Routing to identity short-circuit');
    return {
      type: 'short-circuit',
      handler: 'identity',
    };
  }

  // ========================================================================
  // PRIORITY 3: Small talk intent short-circuit
  // ========================================================================
  // Small talk and simple greetings are handled directly without tools/planner
  // Uses existing isSimpleGreeting helper for compatibility
  if (intent === 'small_talk' || isSimpleGreeting(userMessage)) {
    console.log('[Intent Router] Routing to small_talk short-circuit');
    return {
      type: 'short-circuit',
      handler: 'small_talk',
    };
  }

  // ========================================================================
  // PRIORITY 4: User tool command short-circuit
  // ========================================================================
  // Detect slash commands or user-invoked tools
  // Uses existing detectUserTool helper for compatibility
  let detectedTool: DetectedUserTool | null = null;
  try {
    const detected = detectUserTool(userMessage);
    if (detected && !detected.isAiTool) {
      detectedTool = detected as DetectedUserTool;
    }
  } catch (error: any) {
    console.error('[Intent Router] Error detecting user tool:', error);
    // Continue to standard pipeline if detection fails
  }

  if (detectedTool) {
    console.log('[Intent Router] Routing to user_tool short-circuit:', detectedTool.tool?.name);
    return {
      type: 'short-circuit',
      handler: 'user_tool',
      detectedTool,
    };
  }

  // ========================================================================
  // DEFAULT: Standard multi-phase pipeline
  // ========================================================================
  // No short-circuits matched - use full pipeline:
  // PLANNER → COUNCIL (if needed) → EXECUTOR → SUMMARIZER
  console.log('[Intent Router] Routing to standard pipeline');
  return {
    type: 'standard-pipeline',
  };
}

// ============================================================================
// ROUTING HELPERS
// ============================================================================

/**
 * Check if request should use transformer orchestrator
 *
 * Separated for testability and clarity
 */
export function shouldUseTransformer(): boolean {
  return FEATURE_FLAGS.USE_TRANSFORMER();
}

/**
 * Check if request should short-circuit to identity handler
 */
export function shouldShortCircuitIdentity(intent: string): boolean {
  return intent === 'identity';
}

/**
 * Check if request should short-circuit to small talk handler
 */
export function shouldShortCircuitSmallTalk(intent: string, userMessage: string): boolean {
  return intent === 'small_talk' || isSimpleGreeting(userMessage);
}
