// Phase 2.1: Extract Tool Router from processStreamStart.ts
// Power of 10 Rule 4: Focused module for tool routing decisions

import type { ScorpionIntent } from '@/lib/chat/types';
import { runPromptWithKillSwitch, ToolRouterSchema } from '@scorpion/core';
import { fallbackRoute } from '../helpers/toolRouter';

export interface ToolRoutingResult {
  intent?: ScorpionIntent;
  tools: Array<{
    tool: string;
    reason?: string;
    why?: string;
    priority?: number;
  }>;
  notes?: string;
  finalIntent: ScorpionIntent;
}

export interface ToolRouterParams {
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  intent: ScorpionIntent;
  modelConfig: {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  runModelForPrompt: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
}

/**
 * Run tool router to determine which tools should be used
 * Power of 10 Rule 4: Single responsibility - tool routing
 *
 * @returns ToolRoutingResult with selected tools and final intent
 */
export async function runToolRouter(params: ToolRouterParams): Promise<ToolRoutingResult> {
  const {
    userMessage,
    conversationHistory,
    intent,
    modelConfig,
    runModelForPrompt,
  } = params;

  // Check if tool router is enabled
  const toolRouterEnabled =
    (intent as string) !== 'identity' &&
    (intent as string) !== 'small_talk' &&
    process.env['SCORPION_ENABLE_TOOL_ROUTER'] !== '0';

  console.log('[Tool Router] System status:', {
    enabled: toolRouterEnabled,
    intent: intent,
    envFlag: process.env['SCORPION_ENABLE_TOOL_ROUTER'],
    system: toolRouterEnabled ? 'ACTIVE' : 'DISABLED',
  });

  // If disabled, return minimal routing
  if (!toolRouterEnabled) {
    return {
      intent,
      tools: [],
      finalIntent: intent,
      notes: 'Tool router disabled for this intent',
    };
  }

  let routing: any = null;

  // Check fallback first for critical queries (deterministic routing)
  const fallback = fallbackRoute(userMessage);
  if (fallback) {
    console.log('[Tool Router] Using deterministic fallback for:', userMessage);
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
    // Power of 10 Rule 2: Bounded loop - explicit max retries
    const MAX_RETRIES = 2;
    let retries = MAX_RETRIES;
    let lastError: any = null;
    let iterationCount = 0;
    const MAX_ITERATIONS = 10; // Safety limit for while loop

    while (retries > 0 && iterationCount < MAX_ITERATIONS) {
      iterationCount++;
      try {
        routing = await runPromptWithKillSwitch(
          'tool-router.system.txt',
          { question: userMessage, history: conversationHistory.slice(-5) },
          ToolRouterSchema,
          modelConfig,
          runModelForPrompt
        );

        if (routing) {
          console.log('[Tool Router] Intent:', routing.intent, 'Tools:', routing.tools?.map((t: any) => t.tool).join(', ') || '[]');
          // Tool router can override intent classification
          if (routing.intent && routing.intent !== intent) {
            console.log(`[Tool Router] Overriding intent: ${intent} → ${routing.intent}`);
          }
          break; // Success, exit retry loop
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`[Tool Router] Attempt ${MAX_RETRIES - retries + 1} failed:`, error.message);
        retries--;

        if (retries === 0) {
          // Final fallback: use deterministic routing if available
          const finalFallback = fallbackRoute(userMessage);
          if (finalFallback) {
            console.log('[Tool Router] Using fallback after LLM failures');
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
            console.warn('[Chat Stream] Tool router failed after retries, using default intent:', lastError?.message);
            // Return minimal routing with original intent
            routing = {
              intent,
              tools: [],
              notes: 'Tool router failed, using default'
            };
          }
        }
      }
    }

    // Power of 10 Rule 2: Safety check
    if (iterationCount >= MAX_ITERATIONS) {
      console.warn('[Tool Router] Reached MAX_ITERATIONS limit, exiting retry loop');
    }
  }

  // SPECIAL HANDLING: For web_research intent, force research.run tool to be included
  if (intent === 'web_research') {
    console.log('[Tool Router] web_research intent detected - forcing research.run tool');
    if (!routing || !routing.tools || routing.tools.length === 0) {
      routing = {
        intent: 'web_research',
        tools: [
          {
            tool: 'research.run',
            why: 'Web research query requires the research.run tool for searching and analyzing web content',
            priority: 10
          }
        ],
        notes: 'Auto-configured for web_research intent'
      };
      console.log('[Tool Router] Created routing for web_research:', routing);
    } else if (!routing.tools.some((t: any) => t.tool === 'research.run')) {
      // Add research.run if not already present
      routing.tools.push({
        tool: 'research.run',
        why: 'Web research query requires the research.run tool',
        priority: 10
      });
      console.log('[Tool Router] Added research.run to existing routing');
    }
  }

  // Return final routing result
  const finalIntent = routing?.intent || intent;
  return {
    ...routing,
    finalIntent,
  };
}
