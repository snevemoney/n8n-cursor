// apps/scorpion/server/council/SimplicityCouncilMember.ts

import { CouncilInput, CouncilIssue, CouncilOutput, CouncilMember } from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';
import { simplifyPlan } from '../strategy/planSimplifier';
import { ScorpionPlan, PlanStep } from '../types/plan';

export class SimplicityCouncilMember implements CouncilMember {
  id = 'simplicity';
  name = 'Simplicity Councillor';

  run(input: CouncilInput): CouncilOutput {
    const issues: CouncilIssue[] = [];
    let revisedPlanSummary = input.planSummary;

    // Try to parse plan into structured format for simplifier
    let planSteps: PlanStep[] = [];
    
    if (input.planSteps && input.planSteps.length > 0) {
      // Use structured plan steps if available
      planSteps = input.planSteps.map((step, idx) => ({
        id: `step-${idx}`,
        kind: step.tool ? 'tool' : 'reasoning',
        description: step.description,
        toolName: step.tool,
      }));
    } else if (input.planSummary) {
      // Parse from plan summary text
      const lines = input.planSummary.split('\n').filter(l => l.trim());
      planSteps = lines.map((line, idx) => {
        const toolMatch = line.match(/\[tool\]\s*(\w+\.\w+)/i);
        return {
          id: `step-${idx}`,
          kind: toolMatch ? 'tool' : 'reasoning',
          description: line.replace(/\[.*?\]\s*/g, '').trim(),
          toolName: toolMatch?.[1],
        };
      });
    }

    const stepCount = planSteps.length || (input.planSummary.match(/\d+\./g) || []).length;

    // Check for over-complexity
    if (stepCount > 5) {
      logImprovementSignal({
        type: 'OVERCOMPLEX_PLAN',
        message: `Plan has ${stepCount} steps, exceeding recommended maximum of 5.`,
        tag: 'simplicity',
        severity: 2,
      });

      issues.push({
        severity: 3,
        tag: 'complexity',
        message: `Plan has ${stepCount} steps, which may be unnecessarily complex.`,
        recommendation: 'Simplify to 3-5 focused steps. Merge similar steps and remove redundant ones.',
        councillorId: this.id,
      });

      // Apply plan simplifier if we have structured steps
      if (planSteps.length > 0) {
        const plan: ScorpionPlan = {
          id: 'council-review',
          createdAt: new Date().toISOString(),
          steps: planSteps,
        };

        const simplified = simplifyPlan(plan, {
          maxSteps: 5,
          mergeReasoning: true,
          dropRedundantTools: true,
        });

        if (simplified.steps.length < planSteps.length) {
          revisedPlanSummary = simplified.steps
            .map((s, i) => `${i + 1}. [${s.kind}] ${s.description}`)
            .join('\n');
        }
      }
    }

    // Check for redundant tool usage
    if (input.toolsUsed && input.toolsUsed.length > 6) {
      issues.push({
        severity: 2,
        tag: 'complexity',
        message: `Plan uses ${input.toolsUsed.length} different tools, which may indicate over-engineering.`,
        recommendation: 'Consider if all tools are necessary. Can some steps be combined?',
        councillorId: this.id,
      });
    }

    // Check for vague or overly broad descriptions
    if (input.planSummary) {
      const vaguePhrases = ['everything', 'all', 'complete', 'full', 'entire'];
      const hasVaguePhrases = vaguePhrases.some((phrase) =>
        input.planSummary.toLowerCase().includes(phrase),
      );

      if (hasVaguePhrases && stepCount > 3) {
        issues.push({
          severity: 2,
          tag: 'complexity',
          message: 'Plan contains vague descriptions that may lead to scope creep.',
          recommendation: 'Break down into more specific, concrete steps.',
          councillorId: this.id,
        });
      }
    }

    return {
      approved: true,
      issues,
      revisedPlanSummary: revisedPlanSummary !== input.planSummary ? revisedPlanSummary : undefined,
    };
  }
}
