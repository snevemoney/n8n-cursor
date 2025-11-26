// apps/scorpion/server/council/ethicsCouncil.ts

import { CouncilInput, CouncilMember, CouncilOutput, CouncilIssue } from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

/**
 * Ethics & Bias council member.
 * Uses domainTags + goal/plan text to decide when to warn about bias.
 * Inspired by docs/ethics/generative-ai-bias.md (your internal ethics text).
 */
export const EthicsCouncilMember: CouncilMember = {
  id: 'ethics-bias',
  name: 'Ethics & Bias Councillor',
  description:
    'Flags high-risk domains (hiring, loans, justice, healthcare) and adds bias/ethics warnings.',

  run(input: CouncilInput): CouncilOutput {
    const lowerGoal = input.goalDescription.toLowerCase();
    const lowerPlan = input.planSummary.toLowerCase();
    const text = `${lowerGoal}\n\n${lowerPlan}`;
    const tags = new Set(input.domainTags);

    // Skip bias detection for system health/debug queries (not high-risk domains)
    const isSystemQuery = /(system health|system status|check.*logs|system.*debug|analyze.*system)/i.test(text);
    if (isSystemQuery) {
      return { approved: true, issues: [] };
    }

    // Auto-tag from text if domainTags not already populated
    if (/hire|recruit|résumé|resume|candidate|cv/.test(text)) {
      tags.add('hiring');
    }
    if (/loan|credit|mortgage|approval|underwriting|score/.test(text)) {
      tags.add('loans');
    }
    if (/reoffend|recidivism|correctional|sentencing|risk score/.test(text)) {
      tags.add('justice');
    }
    // Only flag healthcare if it's about patient care, not system health
    if (/triage|diagnosis|treatment|patient|clinical/.test(text) && !isSystemQuery) {
      tags.add('healthcare');
    }

    const issues: CouncilIssue[] = [];
    let revisedAnswer = input.draftAnswer;

    const isHighRiskDomain =
      tags.has('hiring') ||
      tags.has('loans') ||
      tags.has('justice') ||
      tags.has('healthcare');

    if (!isHighRiskDomain) {
      return { approved: true, issues: [] };
    }

    // Build a canonical warning/snippet derived from your ethics text
    const warning =
      '⚠ Ethical Notice: AI systems trained on historical data can replicate or amplify existing ' +
      'social and economic biases (e.g., against certain genders, races, or neighborhoods). ' +
      'Use this system as a decision-support tool only, not as the final decision-maker. ' +
      'Implement fairness checks, monitor outputs regularly, and ensure human oversight.';

    issues.push({
      severity: 4,
      tag: 'bias',
      message: 'High-risk domain with a history of algorithmic bias detected.',
      recommendation:
        'Add explicit fairness constraints, human review steps, and avoid fully automated decisions for individuals.',
      councillorId: 'ethics-bias',
    });

    // Log a BIAS_RISK signal so it appears in your diagnostics
    logImprovementSignal({
      type: 'BIAS_RISK',
      message: `User is designing or using AI in a high-risk domain (${[
        ...tags,
      ].join(', ')}).`,
      tag: 'ethics',
      severity: 4,
    });

    if (revisedAnswer) {
      // Append ethics paragraph if not already present
      if (
        !revisedAnswer.toLowerCase().includes('ethical') &&
        !revisedAnswer.toLowerCase().includes('bias')
      ) {
        revisedAnswer = `${revisedAnswer}\n\n${warning}`;
      }
    } else {
      revisedAnswer = warning;
    }

    return {
      approved: true,
      issues,
      revisedAnswer,
    };
  },
};

