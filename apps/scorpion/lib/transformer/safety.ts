/**
 * Safety Guards for Transformer Architecture
 * 
 * Implements risk mode checks to prevent destructive operations
 * in safe mode and ensure proper safeguards in all modes.
 */

import type { ToolMeta } from '@/lib/orchestrator/tool-registry';
import type { Step, ToolCall } from '@/server/transformer/head-output';

export type RiskMode = 'safe' | 'balanced' | 'exploratory';

/**
 * Check if a tool is destructive (writes, deletes, modifies production)
 */
export function isDestructiveTool(tool: ToolMeta | string): boolean {
  const toolName = typeof tool === 'string' ? tool : tool.name;
  const lower = toolName.toLowerCase();
  
  // Destructive operations
  const destructivePatterns = [
    'delete',
    'remove',
    'drop',
    'write',
    'create', // Can be destructive if creates in prod
    'update',
    'modify',
    'edit',
    'import', // Can modify workflows
    'deploy',
    'publish',
    'commit',
    'push',
  ];
  
  // Safe read-only operations
  const safePatterns = [
    'read',
    'list',
    'get',
    'search',
    'query',
    'analyze',
    'inspect',
    'status',
    'health',
  ];
  
  // Check if it's explicitly safe
  if (safePatterns.some(pattern => lower.includes(pattern))) {
    return false;
  }
  
  // Check if it's destructive
  return destructivePatterns.some(pattern => lower.includes(pattern));
}

/**
 * Check if a step should be allowed based on risk mode
 */
export function isStepAllowed(step: Step, riskMode: RiskMode): boolean {
  if (riskMode === 'exploratory') {
    return true; // Allow everything in exploratory mode
  }
  
  if (riskMode === 'safe') {
    // In safe mode, block destructive operations
    if (step.type === 'tool_call' && step.tool) {
      // We'd need to check the actual tool, but for now use heuristics
      const destructiveKeywords = ['delete', 'remove', 'write', 'modify', 'deploy', 'import'];
      if (destructiveKeywords.some(keyword => step.tool?.toLowerCase().includes(keyword))) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Filter tools based on risk mode
 */
export function filterToolsByRiskMode(
  tools: ToolCall[],
  riskMode: RiskMode
): ToolCall[] {
  if (riskMode === 'exploratory') {
    return tools; // Allow all tools
  }
  
  if (riskMode === 'safe') {
    // In safe mode, prefer read-only tools
    return tools.filter(tool => {
      const lower = tool.name.toLowerCase();
      const safePatterns = ['read', 'list', 'get', 'search', 'query', 'analyze', 'inspect'];
      return safePatterns.some(pattern => lower.includes(pattern));
    });
  }
  
  // Balanced mode: allow most tools but log warnings for destructive ones
  return tools;
}

/**
 * Get risk mode from context or environment
 */
export function getRiskMode(context?: { riskMode?: RiskMode }): RiskMode {
  if (context?.riskMode) {
    return context.riskMode;
  }
  
  // Default based on environment
  if (process.env.NODE_ENV === 'production') {
    return 'safe';
  }
  
  return 'balanced';
}

/**
 * Require confirmation for destructive operations
 */
export function requiresConfirmation(step: Step, riskMode: RiskMode): boolean {
  if (riskMode === 'exploratory') {
    return false; // No confirmation needed in exploratory mode
  }
  
  if (step.type === 'tool_call' && step.tool) {
    const destructiveKeywords = ['delete', 'remove', 'deploy', 'import', 'publish'];
    return destructiveKeywords.some(keyword => step.tool?.toLowerCase().includes(keyword));
  }
  
  return false;
}

