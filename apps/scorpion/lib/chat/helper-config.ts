/**
 * Intent-aware helper configuration
 * Determines which helper prompts should run based on user intent
 * Makes helpers strictly non-blocking and reduces latency
 */

import type { ScorpionIntent } from './types';

export interface HelperConfig {
  useSafetyGuard: boolean;
  useBudgetGovernor: boolean;
  useMemoryManager: boolean;
  useStyleEnforcer: boolean;
}

/**
 * FRONTIER-LEVEL: Intent-aware helper configuration
 * 
 * Policy (hardcoded for determinism):
 * - system_debug: safety only (no budget/memory/style)
 * - project_help: safety + budget + memory (no style)
 * - general_question: all helpers enabled
 * - small_talk, identity: safety + style only
 * 
 * In lightweight mode (8GB): Only safety, everything else off
 */
const INTENT_HELPERS: Record<ScorpionIntent, HelperConfig> = {
  system_debug: {
    useSafetyGuard: true,
    useBudgetGovernor: false,
    useMemoryManager: false,
    useStyleEnforcer: false,
  },
  project_help: {
    useSafetyGuard: true,
    useBudgetGovernor: true,
    useMemoryManager: true,
    useStyleEnforcer: false,
  },
  general_question: {
    useSafetyGuard: true,
    useBudgetGovernor: true,
    useMemoryManager: true,
    useStyleEnforcer: true,
  },
  small_talk: {
    useSafetyGuard: true,
    useBudgetGovernor: false,
    useMemoryManager: false,
    useStyleEnforcer: true,
  },
  identity: {
    useSafetyGuard: true,
    useBudgetGovernor: false,
    useMemoryManager: false,
    useStyleEnforcer: true,
  },
  other: {
    useSafetyGuard: true,
    useBudgetGovernor: true,
    useMemoryManager: true,
    useStyleEnforcer: true,
  },
};

/**
 * Get helper configuration based on intent
 * FRONTIER-LEVEL: Hardcoded policy, no runtime decisions
 */
export function getHelperConfig(intent: ScorpionIntent, lightweightMode: boolean = false): HelperConfig {
  // Get base config for intent
  const baseConfig = INTENT_HELPERS[intent] || INTENT_HELPERS.general_question;

  // In lightweight mode (8GB), only safety; everything else off
  if (lightweightMode) {
    return {
      useSafetyGuard: baseConfig.useSafetyGuard,
      useBudgetGovernor: false,
      useMemoryManager: false,
      useStyleEnforcer: false, // Optionally also disable style in lite mode
    };
  }

  return baseConfig;
}

/**
 * Get default values for helpers when they fail
 */
export function getHelperDefaults(): {
  safetyGuard: any;
  budgetGovernor: any;
  memoryManager: any;
  styleEnforcer: any;
} {
  return {
    safetyGuard: {
      allowed: true,
      issues: [],
      redactions: [],
      safeAlternative: null,
    },
    budgetGovernor: {
      budget: {
        timeSec: 30,
        tokens: 800,
        cpuPct: 40,
        gpuMemGB: 1.5,
      },
      modelChoices: [
        { task: 'plan', model: 'llama3.1:8b', reason: 'Default planning model' },
        { task: 'summarize', model: 'llama3.1:8b', reason: 'Default summarization model' },
      ],
      limits: [],
      tradeoffs: 'Balanced performance and resource usage',
    },
    memoryManager: {
      decision: 'ignore',
      reason: 'Helper failed, defaulting to ignore',
      memory: null,
    },
    styleEnforcer: {
      tone: 'casual',
      edits: [],
    },
  };
}

