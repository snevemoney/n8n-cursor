/**
 * Expert Router for MoE (Mixture of Experts) System
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 */

import type { ExpertConfig, ExpertTag } from './experts';
import { EXPERTS } from './experts';

export interface RoutingContext {
  phase: 'PLAN' | 'COUNCIL' | 'TOOLS' | 'KNOWLEDGE' | 'USER_TOOLS';
  // Short description of the current goal, not the entire user message
  goalSummary: string;
  // Optional tags from intent classifier / planner
  intentTags?: string[];
}

export interface RoutedExpertsResult {
  phase: RoutingContext['phase'];
  selected: ExpertConfig[];
  // For observability / brain map
  reason: string;
}

// Power of 10 Rule 2: Bounded constant
const MAX_EXPERTS_PER_PHASE = 4;

/**
 * Filter candidates by phase
 * Power of 10 Rule 3: ≤ 60 lines, Rule 2: Bounded iteration
 */
function filterCandidates(ctx: RoutingContext): ExpertConfig[] {
  const relevantTags: ExpertTag[] = [];

  // Power of 10 Rule 1: No recursion, explicit conditionals
  if (ctx.phase === 'PLAN') {
    relevantTags.push('planning', 'orchestration');
  } else if (ctx.phase === 'COUNCIL') {
    relevantTags.push('council');
  } else if (ctx.phase === 'TOOLS') {
    relevantTags.push('tools', 'orchestration');
  } else if (ctx.phase === 'KNOWLEDGE') {
    relevantTags.push('knowledge', 'bitcoin');
  } else if (ctx.phase === 'USER_TOOLS') {
    relevantTags.push('user_tools');
  }

  const candidates: ExpertConfig[] = [];
  // Power of 10 Rule 2: Bounded loop
  for (let i = 0; i < EXPERTS.length; i++) {
    const expert = EXPERTS[i];
    if (!expert) continue;
    
    // Check if expert has any relevant tag - Power of 10 Rule 7: Guard undefined
    let hasRelevantTag = false;
    for (let j = 0; j < expert.tags.length; j++) {
      const tag = expert.tags[j];
      if (tag && relevantTags.includes(tag)) {
        hasRelevantTag = true;
        break;
      }
    }
    
    if (hasRelevantTag) {
      candidates.push(expert);
    }
  }
  
  return candidates;
}

/**
 * Score expert based on context
 * Power of 10 Rule 3: ≤ 60 lines
 */
function scoreExpert(expert: ExpertConfig, ctx: RoutingContext): number {
  let score = expert.priority;

  const text = ctx.goalSummary.toLowerCase();

  // Power of 10 Rule 1: No recursion, explicit conditionals
  if (text.includes('bitcoin') && expert.tags.includes('bitcoin')) {
    score += 3;
  }
  if (text.includes('voice') && expert.tags.includes('voice')) {
    score += 3;
  }
  if (text.includes('n8n') && expert.tags.includes('orchestration')) {
    score += 2;
  }
  if (text.includes('code') && expert.tags.includes('coding')) {
    score += 2;
  }
  if (text.includes('infra') && expert.tags.includes('infra')) {
    score += 2;
  }

  // Check intent tags
  if (ctx.intentTags && ctx.intentTags.length > 0) {
    for (let i = 0; i < ctx.intentTags.length; i++) {
      const intentTag = ctx.intentTags[i];
      if (intentTag === 'observability' && expert.tags.includes('observability')) {
        score += 2;
      }
      if (intentTag === 'safety' && expert.tags.includes('safety')) {
        score += 2;
      }
    }
  }

  return score;
}

/**
 * Route experts for a given phase
 * Power of 10 Rule 3: ≤ 60 lines, Rule 2: Bounded iteration
 */
export function routeExperts(ctx: RoutingContext): RoutedExpertsResult {
  const candidates = filterCandidates(ctx);
  
  // Score and sort
  const scored: Array<{ expert: ExpertConfig; score: number }> = [];
  for (let i = 0; i < candidates.length; i++) {
    const expert = candidates[i];
    if (expert) {
      scored.push({
        expert,
        score: scoreExpert(expert, ctx),
      });
    }
  }
  
  // Sort by score (descending) - Power of 10 Rule 7: Guard undefined
  for (let i = 0; i < scored.length - 1; i++) {
    const itemI = scored[i];
    if (!itemI) continue;
    
    for (let j = i + 1; j < scored.length; j++) {
      const itemJ = scored[j];
      if (!itemJ) continue;
      
      if (itemJ.score > itemI.score) {
        scored[i] = itemJ;
        scored[j] = itemI;
      }
    }
  }
  
  // Take top-k
  const selected: ExpertConfig[] = [];
  const maxSelect = Math.min(MAX_EXPERTS_PER_PHASE, scored.length);
  for (let i = 0; i < maxSelect; i++) {
    const item = scored[i];
    if (item && item.expert) {
      selected.push(item.expert);
    }
  }

  return {
    phase: ctx.phase,
    selected,
    reason: `Selected ${selected.length} expert(s) based on phase=${ctx.phase} and goal="${ctx.goalSummary}"`,
  };
}

