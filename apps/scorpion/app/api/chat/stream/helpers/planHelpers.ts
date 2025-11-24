// apps/scorpion/app/api/chat/stream/helpers/planHelpers.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 2: All loops have fixed upper bounds

import type { Plan, PlanStep } from '@/lib/chat/types';

/**
 * Validate plan structure
 * Power of 10 Rule 6: Check validity of parameters
 */
export function validatePlanStructure(plan: unknown): plan is Plan {
  // Power of 10 Rule 4: Assertions
  if (!plan || typeof plan !== 'object') {
    return false;
  }

  const p = plan as Record<string, unknown>;
  if (!Array.isArray(p.plan)) {
    return false;
  }

  // Power of 10 Rule 2: Bounded loop
  const MAX_STEPS = 100;
  const steps = p.plan as unknown[];
  if (steps.length > MAX_STEPS) {
    console.warn(`[Plan Validation] Plan has ${steps.length} steps, max is ${MAX_STEPS}`);
    return false;
  }

  // Power of 10 Rule 2: Bounded loop - validate each step
  for (let i = 0; i < steps.length && i < MAX_STEPS; i++) {
    const step = steps[i];
    if (!step || typeof step !== 'object') {
      return false;
    }
    const s = step as Record<string, unknown>;
    if (typeof s.id !== 'string' || typeof s.tool !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Normalize plan steps - ensure all required fields
 * Power of 10 Rule 2: Bounded loop
 */
export function normalizePlanSteps(steps: unknown[]): PlanStep[] {
  // Power of 10 Rule 4: Assertions
  if (!Array.isArray(steps)) {
    return [];
  }

  // Power of 10 Rule 2: Bounded loop
  const MAX_STEPS = 100;
  const normalized: PlanStep[] = [];
  
  for (let i = 0; i < steps.length && i < MAX_STEPS; i++) {
    const step = steps[i];
    if (!step || typeof step !== 'object') {
      continue;
    }

    const s = step as Record<string, unknown>;
    normalized.push({
      id: typeof s.id === 'string' ? s.id : `s${i + 1}`,
      title: typeof s.title === 'string' ? s.title : 'Untitled step',
      tool: typeof s.tool === 'string' ? s.tool : 'none',
      args: s.args && typeof s.args === 'object' ? (s.args as Record<string, unknown>) : {},
      dependsOn: Array.isArray(s.dependsOn) ? (s.dependsOn as string[]) : undefined,
      success: typeof s.success === 'string' ? s.success : undefined,
    });
  }

  return normalized;
}

