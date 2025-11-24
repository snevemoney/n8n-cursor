/**
 * Behavior Configuration
 * Central control for Scorpion's behavior modes, rules, and personality
 * 
 * This replaces prompt hacking with structured dials you can turn.
 */

export type ScorpionMode = 'owner' | 'safe_saas' | 'nursing_study' | 'bitcoin_research' | 'architecture_planner';

export type SafetyBias = 'low' | 'medium' | 'high';
export type CostBias = 'conservative' | 'balanced' | 'aggressive';
export type MaxDepth = 'low' | 'medium' | 'high';

export interface ModeConfig {
  description: string;
  tone: string;
  maxDepth: MaxDepth;
  safetyBias: SafetyBias;
  costBias: CostBias;
  maxToolCalls?: number;
  allowExpensiveModels?: boolean;
  requireConfirmation?: boolean;
}

export interface BehaviorConfig {
  defaultMode: ScorpionMode;
  modes: Record<ScorpionMode, ModeConfig>;
}

export const behaviorConfig: BehaviorConfig = {
  defaultMode: 'owner',

  modes: {
    owner: {
      description: 'Personal Jarvis for Evens only',
      tone: 'direct, informal, can swear a bit, deep technical detail',
      maxDepth: 'high',
      safetyBias: 'medium',
      costBias: 'balanced',
      maxToolCalls: 10,
      allowExpensiveModels: true,
      requireConfirmation: false,
    },

    safe_saas: {
      description: 'Future client-facing mode',
      tone: 'professional, neutral, shorter answers',
      maxDepth: 'medium',
      safetyBias: 'high',
      costBias: 'conservative',
      maxToolCalls: 5,
      allowExpensiveModels: false,
      requireConfirmation: true,
    },

    nursing_study: {
      description: 'Focused mode for nursing studies',
      tone: 'educational, clear, structured',
      maxDepth: 'medium',
      safetyBias: 'high',
      costBias: 'balanced',
      maxToolCalls: 5,
      allowExpensiveModels: false,
    },

    bitcoin_research: {
      description: 'Deep dive into Bitcoin and economics',
      tone: 'analytical, technical, evidence-based',
      maxDepth: 'high',
      safetyBias: 'medium',
      costBias: 'balanced',
      maxToolCalls: 8,
      allowExpensiveModels: true,
    },

    architecture_planner: {
      description: 'System architecture and planning mode',
      tone: 'precise, technical, comprehensive',
      maxDepth: 'high',
      safetyBias: 'medium',
      costBias: 'balanced',
      maxToolCalls: 10,
      allowExpensiveModels: true,
    },
  },
} as const;

/**
 * Get mode configuration
 */
export function getModeConfig(mode?: ScorpionMode): ModeConfig {
  const selectedMode = mode || behaviorConfig.defaultMode;
  return behaviorConfig.modes[selectedMode];
}

/**
 * Check if mode allows expensive models
 */
export function allowsExpensiveModels(mode?: ScorpionMode): boolean {
  return getModeConfig(mode).allowExpensiveModels ?? false;
}

/**
 * Get max tool calls for mode
 */
export function getMaxToolCalls(mode?: ScorpionMode): number {
  return getModeConfig(mode).maxToolCalls ?? 5;
}

