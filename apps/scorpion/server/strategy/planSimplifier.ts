// apps/scorpion/server/strategy/planSimplifier.ts

import { PlanStep, ScorpionPlan } from '../types/plan';

export interface SimplifyOptions {
  /** Default max number of steps allowed */
  maxSteps?: number;
  /** Merge very similar reasoning steps */
  mergeReasoning?: boolean;
  /** Drop clearly redundant tool steps */
  dropRedundantTools?: boolean;
}

function isSimilarText(a: string, b: string): boolean {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (Math.abs(na.length - nb.length) > 40) return false;

  let common = 0;
  const tokensA = new Set(na.split(/\W+/));
  const tokensB = new Set(nb.split(/\W+/));
  for (const t of tokensA) {
    if (tokensB.has(t)) common++;
  }

  return common >= Math.min(tokensA.size, tokensB.size) * 0.6;
}

/** Merge consecutive reasoning steps with very similar descriptions */
function mergeReasoningSteps(steps: PlanStep[]): PlanStep[] {
  const merged: PlanStep[] = [];
  for (const step of steps) {
    const last = merged[merged.length - 1];
    if (last && last.kind === 'reasoning' && step.kind === 'reasoning') {
      if (isSimilarText(last.description, step.description)) {
        last.description = `${last.description} / ${step.description}`;
        last.tags = Array.from(new Set([...(last.tags || []), 'merged']));
        continue;
      }
    }
    merged.push(step);
  }
  return merged;
}

/** Drop tool steps that clearly repeat the same tool + very similar description */
function dropRedundantToolSteps(steps: PlanStep[]): PlanStep[] {
  const kept: PlanStep[] = [];
  const seenKey = new Set<string>();
  for (const step of steps) {
    if (step.kind === 'tool' && step.toolName) {
      const key = `${step.toolName}:${step.description
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .slice(0, 80)}`;
      if (seenKey.has(key)) {
        // redundant
        continue;
      }
      seenKey.add(key);
    }
    kept.push(step);
  }
  return kept;
}

/** Truncate to maxSteps, prioritizing high-impact / non-optional tasks */
function truncatePlan(steps: PlanStep[], maxSteps: number): PlanStep[] {
  if (steps.length <= maxSteps) return steps;

  const highImpact = steps.filter((s) => s.tags?.includes('high-impact'));
  const rest = steps.filter((s) => !s.tags?.includes('high-impact'));
  const final: PlanStep[] = [];

  for (const s of highImpact) {
    if (final.length < maxSteps) final.push(s);
  }
  for (const s of rest) {
    if (final.length < maxSteps) final.push(s);
  }
  return final;
}

export function simplifyPlan(
  plan: ScorpionPlan,
  opts: SimplifyOptions = {},
): ScorpionPlan {
  const maxSteps = opts.maxSteps ?? 5;
  let steps = [...plan.steps];

  if (opts.mergeReasoning ?? true) {
    steps = mergeReasoningSteps(steps);
  }

  if (opts.dropRedundantTools ?? true) {
    steps = dropRedundantToolSteps(steps);
  }

  steps = truncatePlan(steps, maxSteps);

  return {
    ...plan,
    steps,
  };
}

