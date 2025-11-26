/**
 * Helper Orchestrator Module
 *
 * Orchestrates the execution of AI helpers before the main pipeline:
 * - SafetyGuard: Validates request safety
 * - ToolRouter: Recommends tools for the request
 * - BudgetGovernor: Allocates compute budget
 * - Dispatcher: Determines execution placement (multi-machine)
 *
 * IMPORTANT: This module coordinates existing helper logic.
 * It does NOT duplicate behavior - it calls existing helpers and functions.
 *
 * Behavior guarantee:
 * - Uses existing helper schemas and prompt files
 * - Uses existing helper config functions
 * - Maintains exact same execution order and fallback logic
 * - All error handling preserved
 */

import type { Message, ScorpionIntent } from '@/lib/chat/types';
import type { HelperOrchestratorInput, HelperOrchestratorResult, ModelConfig, SendFunction } from '../core/types';
import { runModelUnified } from '@/lib/chat/modelRunner';
import {
  runPromptWithKillSwitch,
  SafetyGuardSchema,
  ToolRouterSchema,
  BudgetGovernorSchema,
  DispatcherSchema,
} from '@scorpion/core';
import { getHelperConfig, getHelperDefaults } from '@/lib/chat/helper-config';
import { fallbackRoute } from '../helpers/toolRouter';
import {
  getModelConfig,
  DEFAULT_CLIENT_MODE,
} from '../config/pipelineConfig';
import {
  shouldEnableSafetyGuard,
  shouldEnableToolRouter,
  shouldEnableBudgetGovernor,
  shouldEnableDispatcher,
  TOOL_ROUTER_RETRY_CONFIG,
  HELPER_CONTEXT_LIMITS,
  getRequiredToolsForIntent,
  logHelperStatus,
  logHelperConfigSummary,
} from '../config/helperOrchestrationConfig';

// ============================================================================
// HELPER ORCHESTRATION
// ============================================================================

/**
 * Orchestrate AI helpers for request validation and planning
 *
 * Executes helpers in sequence:
 * 1. SafetyGuard - Check if request is safe to process
 * 2. ToolRouter - Determine which tools are needed
 * 3. BudgetGovernor - Allocate compute budget
 * 4. Dispatcher - Determine execution placement (multi-machine only)
 *
 * @param input - Request context and configuration
 * @returns Helper results or null if request was blocked
 *
 * Behavior guarantee:
 * - Exact same execution order as inline code
 * - All error handling and fallbacks preserved
 * - Uses existing helpers and schemas
 * - No new logic introduced
 */
export async function orchestrateHelpers(
  input: HelperOrchestratorInput
): Promise<HelperOrchestratorResult | null> {
  const {
    userMessage,
    intent,
    conversationHistory,
    conversationId,
    lightweightMode,
    provider,
    model,
    send,
  } = input;

  // Build model configuration
  const generalConfig = getModelConfig(lightweightMode, 'general');
  const modelConfig: ModelConfig = {
    provider: provider || 'ollama',
    model,
    maxTokens: generalConfig.maxTokens,
    temperature: generalConfig.temperature,
  };

  // Wrapper for runModelUnified to match prompt adapter signature
  // Add error handling to catch model errors early
  const runModelForPrompt = async (systemPrompt: string, userPrompt: string, config: any) => {
    try {
      return await runModelUnified(systemPrompt, userPrompt, config);
    } catch (error: any) {
      // Check if it's a model not found error
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('not found') || errorMsg.includes('404')) {
        // Send error to client immediately
        send({
          type: 'error',
          data: {
            message: `Model error: ${errorMsg}. Please check your Ollama installation and ensure the model is available.`,
            phase: 'model',
          },
        });
      }
      throw error; // Re-throw to let caller handle it
    }
  };

  // JARVIS MODE: Single-user system context
  const context = {
    clientMode: DEFAULT_CLIENT_MODE,
    conversationId: conversationId || 'unknown',
    intent,
    lightweightMode,
  };

  // Get intent-aware helper configuration
  const helperConfig = getHelperConfig(intent, lightweightMode);
  const helperDefaults = getHelperDefaults();

  // Log helper configuration for debugging
  logHelperConfigSummary(intent, lightweightMode, context.clientMode, helperConfig);

  // ========================================================================
  // 1. SAFETY GUARD
  // ========================================================================
  const safetyGuardEnabled = shouldEnableSafetyGuard(intent, helperConfig);
  logHelperStatus('Safety Guard', safetyGuardEnabled, {
    configFlag: helperConfig.useSafetyGuard,
  });

  let safetyCheck: any = null;
  if (safetyGuardEnabled) {
    try {
      const rawResponse = await runPromptWithKillSwitch(
        'safety-guard.system.txt',
        { question: userMessage, draft: '', clientMode: context.clientMode },
        SafetyGuardSchema,
        modelConfig,
        runModelForPrompt
      );

      // If kill-switch activated (rawResponse is null), use safe defaults immediately
      if (rawResponse) {
        safetyCheck = rawResponse;
      } else {
        console.warn('[Helper Orchestrator] Safety guard kill-switch activated, using safe defaults');
        safetyCheck = helperDefaults.safetyGuard;
      }

      // Check if request is blocked
      if (safetyCheck && !safetyCheck.allowed) {
        return {
          safetyCheck,
          routing: null,
          budget: null,
          dispatcher: null,
          blocked: true,
          modelConfig,
          runModelForPrompt,
        };
      }
    } catch (error: any) {
      // Network/model errors - use safe defaults immediately
      console.warn('[Helper Orchestrator] Safety guard failed, using defaults:', error.message);
      safetyCheck = helperDefaults.safetyGuard; // Use default: allowed=true
    }
  } else {
    // Skip safety guard for this intent
    console.log(`[Helper Orchestrator] Skipping safety-guard for intent: ${intent}`);
    safetyCheck = helperDefaults.safetyGuard;
  }

  // ========================================================================
  // 2. TOOL ROUTER
  // ========================================================================
  const toolRouterEnabled = shouldEnableToolRouter(intent);
  logHelperStatus('Tool Router', toolRouterEnabled, {
    intent,
  });

  let routing: any = null;
  if (toolRouterEnabled) {
    // Check fallback first for critical queries
    const fallback = fallbackRoute(userMessage);
    if (fallback) {
      console.log('[Helper Orchestrator] Using deterministic fallback for:', userMessage);
      routing = {
        intent: fallback.intent,
        tools: fallback.tools.map((tool: string) => ({
          tool,
          reason: `Deterministic routing for ${fallback.intent}`,
          priority: 5
        })),
        notes: 'Deterministic fallback routing'
      };
    } else {
      // Try LLM-based router with retry and fallback
      let retries = TOOL_ROUTER_RETRY_CONFIG.maxRetries;
      let lastError: any = null;
      let iterationCount = 0;

      while (retries > 0 && iterationCount < TOOL_ROUTER_RETRY_CONFIG.maxIterations) {
        iterationCount++;
        try {
          routing = await runPromptWithKillSwitch(
            'tool-router.system.txt',
            { question: userMessage, history: conversationHistory.slice(-HELPER_CONTEXT_LIMITS.toolRouter) },
            ToolRouterSchema,
            modelConfig,
            runModelForPrompt
          );

          if (routing) {
            console.log('[Helper Orchestrator] Tool Router Intent:', routing.intent, 'Tools:', routing.tools?.map((t: any) => t.tool).join(', '));
            break; // Success, exit retry loop
          }
        } catch (error: any) {
          lastError = error;
          console.warn(`[Helper Orchestrator] Tool Router attempt ${TOOL_ROUTER_RETRY_CONFIG.maxRetries - retries + 1} failed:`, error.message);
          retries--;

          if (retries === 0) {
            // Final fallback: use deterministic routing if available
            const finalFallback = fallbackRoute(userMessage);
            if (finalFallback) {
              console.log('[Helper Orchestrator] Using fallback after LLM failures');
              routing = {
                intent: finalFallback.intent,
                tools: finalFallback.tools.map((tool: string) => ({
                  tool,
                  reason: `Fallback routing after LLM failure`,
                  priority: 5
                })),
                notes: 'Fallback after JSON parsing failures'
              };
            } else {
              console.warn('[Helper Orchestrator] Tool router failed after retries:', lastError?.message);
            }
          }
        }
      }

      if (iterationCount >= TOOL_ROUTER_RETRY_CONFIG.maxIterations) {
        console.warn('[Helper Orchestrator] Reached MAX_ITERATIONS limit for tool router');
      }
    }

    // SPECIAL HANDLING: For web_research intent, force research.run tool
    const requiredTools = getRequiredToolsForIntent(intent);
    if (requiredTools) {
      console.log('[Helper Orchestrator] Forcing required tools for intent:', intent, requiredTools);
      if (!routing || !routing.tools || routing.tools.length === 0) {
        routing = {
          intent,
          tools: requiredTools.map((tool: string) => ({
            tool,
            why: getToolRoutingRationale(intent),
            priority: 10
          })),
          notes: `Auto-configured for ${intent} intent`
        };
      } else {
        // Add missing required tools
        for (const tool of requiredTools) {
          if (!routing.tools.some((t: any) => t.tool === tool)) {
            routing.tools.push({
              tool,
              why: getToolRoutingRationale(intent),
              priority: 10
            });
          }
        }
      }
    }
  }

  // ========================================================================
  // 3. BUDGET GOVERNOR
  // ========================================================================
  const budgetGovernorEnabled = shouldEnableBudgetGovernor(helperConfig);
  logHelperStatus('Budget Governor', budgetGovernorEnabled, {
    configFlag: helperConfig.useBudgetGovernor,
  });

  let budget: any = null;
  if (budgetGovernorEnabled) {
    try {
      budget = await runPromptWithKillSwitch(
        'budget-governor.system.txt',
        { routing: routing || { intent, tools: [] } },
        BudgetGovernorSchema,
        modelConfig,
        runModelForPrompt
      );

      if (budget) {
        console.log('[Helper Orchestrator] Budget:', budget.budget, 'Model choices:', budget.modelChoices);
      }
    } catch (error: any) {
      console.warn('[Helper Orchestrator] Budget governor failed, using defaults:', error.message);
      budget = helperDefaults.budgetGovernor;
    }
  } else {
    console.log(`[Helper Orchestrator] Skipping budget-governor for intent: ${intent}`);
    budget = helperDefaults.budgetGovernor;
  }

  // ========================================================================
  // 4. DISPATCHER
  // ========================================================================
  const dispatcherEnabled = shouldEnableDispatcher();
  logHelperStatus('Dispatcher', dispatcherEnabled, {});

  let dispatcher: any = null;
  if (dispatcherEnabled) {
    try {
      dispatcher = await runPromptWithKillSwitch(
        'dispatcher.system.txt',
        { routing: routing || { intent, tools: [] }, budget },
        DispatcherSchema,
        modelConfig,
        runModelForPrompt
      );

      if (dispatcher) {
        console.log('[Helper Orchestrator] Placements:', dispatcher.placements);
      }
    } catch (error: any) {
      console.warn('[Helper Orchestrator] Dispatcher failed, using local execution:', error.message);
    }
  }

  // ========================================================================
  // RETURN RESULTS
  // ========================================================================
  return {
    safetyCheck,
    routing,
    budget,
    dispatcher,
    blocked: false,
    modelConfig,
    runModelForPrompt,
  };
}
