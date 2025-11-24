/**
 * Planner Enforcement
 * Rules that modify plans based on mode, user message, and context
 * 
 * This is where you "rewire" Scorpion's strategy instead of editing prompts.
 */

import { getModeConfig, type ScorpionMode } from '@/config/behavior';
import type { Plan } from '@scorpion/core';

export interface PlanEnforcementContext {
  mode: ScorpionMode;
  userMessage: string;
  draftPlan: Plan;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * Enforce plan rules based on mode and user message
 */
export function enforcePlan(context: PlanEnforcementContext): Plan {
  const { mode, userMessage, draftPlan } = context;
  const config = getModeConfig(mode);
  let plan = { ...draftPlan };

  const lower = userMessage.toLowerCase();

  // 1) Apply mode-based constraints
  if (config.maxToolCalls) {
    plan.maxSteps = Math.min(plan.maxSteps || 10, config.maxToolCalls);
  }

  // 2) Force RAG for certain topics
  if (lower.includes('bitcoin') || lower.includes('economy') || lower.includes('economics')) {
    plan = ensureTool(plan, 'knowledge.searchBitcoinCorpus', {
      query: extractTopic(userMessage, ['bitcoin', 'economy', 'economics']),
    });
  }

  // 3) Force code/tools for "Scorpion" / "architecture" queries
  if (lower.includes('scorpion') || lower.includes('agentpilot') || lower.includes('architecture')) {
    plan = ensureTool(plan, 'code.readFile', { path: 'README.md' });
    plan = ensureTool(plan, 'knowledge.searchScorpionDocs', {
      query: extractTopic(userMessage, ['scorpion', 'agentpilot', 'architecture']),
    });
  }

  // 4) Force knowledge search for nursing topics
  if (lower.includes('nursing') || lower.includes('medical') || lower.includes('patient')) {
    plan = ensureTool(plan, 'knowledge.searchNursingMaterials', {
      query: extractTopic(userMessage, ['nursing', 'medical', 'patient']),
    });
  }

  // 5) Owner mode = more aggressive tool usage
  if (mode === 'owner') {
    // Allow longer chains
    plan.maxSteps = Math.max(plan.maxSteps || 5, 10);
    
    // Allow expensive models if configured
    if (config.allowExpensiveModels) {
      plan.preferredModel = 'gpt-4'; // or your expensive model
    }
  }

  // 6) Safe SaaS mode = conservative tool usage
  if (mode === 'safe_saas') {
    plan.maxSteps = Math.min(plan.maxSteps || 10, 5);
    plan.preferredModel = 'gpt-3.5-turbo'; // cheaper model
  }

  return plan;
}

/**
 * Ensure a tool is in the plan
 */
function ensureTool(plan: Plan, toolName: string, params?: Record<string, any>): Plan {
  // Check if tool already exists in plan steps
  const hasTool = plan.steps?.some(step => 
    step.tool === toolName || step.action?.includes(toolName)
  );

  if (!hasTool) {
    // Add tool as first step
    plan.steps = [
      {
        tool: toolName,
        action: `Use ${toolName} to gather information`,
        params: params || {},
      },
      ...(plan.steps || []),
    ];
  }

  return plan;
}

/**
 * Extract topic/keywords from user message
 */
function extractTopic(message: string, keywords: string[]): string {
  const lower = message.toLowerCase();
  const found = keywords.find(k => lower.includes(k));
  return found || message.substring(0, 100); // Fallback to first 100 chars
}

/**
 * Check if plan requires confirmation based on mode
 */
export function requiresConfirmation(mode: ScorpionMode, plan: Plan): boolean {
  const config = getModeConfig(mode);

  if (!config.requireConfirmation) {
    return false;
  }

  // Require confirmation for expensive operations
  const expensiveTools = ['code.writeFile', 'code.deleteFile', 'workflow.create', 'workflow.delete'];
  const hasExpensiveTool = plan.steps?.some(step =>
    expensiveTools.some(tool => step.tool === tool || step.action?.includes(tool))
  );

  return hasExpensiveTool;
}

/**
 * Parse planner response (tolerant JSON parsing)
 */
export function parsePlannerResponse(response: string): Plan | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');

    const parsed = JSON.parse(cleaned);
    return parsed as Plan;
  } catch (error) {
    console.warn('[Planner Enforcement] Failed to parse plan:', error);
    return null;
  }
}

/**
 * Create fallback plan based on intent
 */
export function createFallbackPlan(intent: string, userMessage: string): Plan {
  const lower = userMessage.toLowerCase();

  // Detect if it's a research query
  const isResearchQuery =
    intent === 'web_research' ||
    /research|find|search|discover|explore|look up|investigate|latest|current|recent|new|today|trending|top|competitors|alternatives|compare|vs|versus/.test(lower);

  if (isResearchQuery) {
    return {
      objective: userMessage,
      assumptions: [],
      plan: [{
        id: 's1',
        title: `Research latest news and information (5 sources)`,
        tool: 'research.run',
        args: {
          query: userMessage,
          depth: 'medium',
          maxSites: 5
        }
      }],
      done_when: ['User receives response'],
      needsCouncil: false,
      questionType: 'casual',
      councilRationale: 'Fallback research plan'
    };
  }

  // Default fallback for other queries
  return {
    objective: userMessage,
    assumptions: [],
    plan: [{
      id: 's1',
      title: 'Respond to user',
      tool: 'none',
    }],
    done_when: ['User receives response'],
    needsCouncil: false,
    questionType: 'casual',
    councilRationale: 'Fallback plan - parsing failed'
  };
}

/**
 * Enforce plan rules (system health, research enforcement, etc.)
 */
export function enforcePlanRules(plan: Plan, intent: string, userMessage: string): Plan {
  const lower = userMessage.toLowerCase();
  let enforcedPlan = { ...plan };

  // 1. Enforce research.run for research queries
  const isResearchQuery =
    intent === 'web_research' ||
    /research|find|search|discover|explore|look up|investigate/.test(lower) ||
    /latest|current|recent|new|today|trending|top/.test(lower) ||
    /competitors|alternatives|compare|vs|versus/.test(lower) ||
    /bitcoin|crypto|stocks|markets|macro|financial/.test(lower);

  if (isResearchQuery) {
    // Check if plan has research.run
    const hasResearchTool = enforcedPlan.plan?.some((step: any) =>
      step.tool === 'research.run'
    );

    if (!hasResearchTool) {
      console.log('[Planner Enforcement] Research query detected, enforcing research.run');
      enforcedPlan.plan = [{
        id: 's1',
        title: `Research: ${userMessage.substring(0, 50)}`,
        tool: 'research.run',
        args: {
          query: userMessage,
          depth: 'medium',
          maxSites: 5
        }
      }, ...(enforcedPlan.plan || [])];
    }
  }

  // 2. Enforce system.health for system health queries
  if (/system|health|status|check/.test(lower)) {
    const hasHealthTool = enforcedPlan.plan?.some((step: any) =>
      step.tool === 'system.health'
    );

    if (!hasHealthTool) {
      console.log('[Planner Enforcement] System health query detected, enforcing system.health');
      enforcedPlan.plan = [{
        id: 's_health',
        title: 'Check system health',
        tool: 'system.health',
        args: {}
      }, ...(enforcedPlan.plan || [])];
    }
  }

  // 3. Remove "none" tool steps for research queries
  if (isResearchQuery) {
    enforcedPlan.plan = enforcedPlan.plan?.filter((step: any) =>
      step.tool !== 'none'
    ) || [];
  }

  return enforcedPlan;
}
