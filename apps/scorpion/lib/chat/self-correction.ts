/**
 * FRONTIER-LEVEL: Self-correction logic
 * Prevents KB/research insanity for system_debug and side-effect tools
 */

import type { ScorpionIntent } from './types';
import type { ToolResult } from '@/server/types/tooling';

/**
 * Side-effect tools that should never be re-run during self-correction
 */
const SIDE_EFFECT_TOOLS = [
  'workflows.trigger',
  'agent.deploy',
  'backup.create',
  'notifications.post',
  'llm.train',
  'llm.evaluate',
] as const;

/**
 * Read-only tools that are safe for self-correction
 */
const READ_ONLY_TOOLS = [
  'kb.search',
  'logs.tail',
  'stats.get',
  'knowledge.get',
  'ontology.search',
  'files.recent',
  'system.health',
  'project.status',
  'workflows.list',
  'workflows.get',
  'agents.list',
  'agents.get',
  'operations.list',
  'settings.get',
  'notifications.list',
] as const;

export interface SelfCorrectionContext {
  intent: ScorpionIntent;
  hasUsefulData: boolean;
  hasErrorExplanation: boolean;
  toolsUsed: string[];
  results: Array<{ tool: string; result: ToolResult<any> }>;
}

/**
 * Determine if self-correction should be allowed
 * FRONTIER-LEVEL: Hard rules, no heuristics
 */
export function shouldSelfCorrect(context: SelfCorrectionContext): boolean {
  const { intent, hasUsefulData, hasErrorExplanation, toolsUsed } = context;

  // 1) Never spawn KB/research for system health
  if (intent === 'system_debug') {
    return false;
  }

  // 2) Never self-correct if side-effect tools were used
  // (Prevents re-triggering workflows, deployments, etc.)
  const hasSideEffects = toolsUsed.some(tool => 
    SIDE_EFFECT_TOOLS.includes(tool as any)
  );
  if (hasSideEffects) {
    return false;
  }

  // 3) For other intents, only if we truly have nothing
  if (!hasUsefulData && !hasErrorExplanation) {
    return true;
  }

  return false;
}

/**
 * Get allowed tools for self-correction
 * Only read-only tools are allowed
 */
export function getAllowedSelfCorrectionTools(): readonly string[] {
  return READ_ONLY_TOOLS;
}

/**
 * Check if a tool is safe for self-correction
 */
export function isToolSafeForSelfCorrection(toolName: string): boolean {
  return READ_ONLY_TOOLS.includes(toolName as any);
}

