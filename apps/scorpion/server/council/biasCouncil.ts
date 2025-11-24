// apps/scorpion/server/council/biasCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

export const BiasCouncilMember: CouncilMember = {
  id: 'bias',
  name: 'Bias Detection Councillor',
  description:
    'Detects potential biases in plans, tool selection, and responses. Ensures fair representation, avoids stereotyping, and promotes inclusive solutions.',

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Demographic bias patterns
    const demographicBiasPatterns = [
      /assume.*(male|female|man|woman)/i,
      /typical.*(user|customer|person)/i,
      /most people/i,
      /everyone knows/i,
      /obviously/i,
      /of course.*(they|he|she)/i,
    ];

    const hasDemographicBias = demographicBiasPatterns.some((pattern) =>
      pattern.test(text),
    );

    if (hasDemographicBias) {
      issues.push({
        severity: 2,
        tag: 'bias',
        message:
          'Potential demographic assumptions detected in the plan or response.',
        recommendation:
          'Avoid making assumptions about user demographics, backgrounds, or characteristics. Use inclusive language and consider diverse perspectives.',
        councillorId: 'bias',
      });

      logImprovementSignal({
        type: 'BROKEN_FLOW',
        message: 'Demographic bias detected in plan or response.',
        tag: 'bias',
        severity: 2,
      });
    }

    // Cultural bias patterns
    const culturalBiasPatterns = [
      /western.*(standard|norm|approach)/i,
      /american.*(way|standard)/i,
      /english.*only/i,
      /assume.*(language|culture)/i,
    ];

    const hasCulturalBias = culturalBiasPatterns.some((pattern) =>
      pattern.test(text),
    );

    if (hasCulturalBias) {
      issues.push({
        severity: 2,
        tag: 'bias',
        message: 'Potential cultural assumptions detected.',
        recommendation:
          'Consider cultural diversity and avoid assuming a single cultural context. Support internationalization and localization where relevant.',
        councillorId: 'bias',
      });
    }

    // Technical bias (assuming certain tech stacks, platforms)
    const technicalBiasPatterns = [
      /everyone uses.*(windows|mac|linux)/i,
      /assume.*(browser|device|platform)/i,
      /standard.*(browser|device)/i,
    ];

    const hasTechnicalBias = technicalBiasPatterns.some((pattern) =>
      pattern.test(text),
    );

    if (hasTechnicalBias) {
      issues.push({
        severity: 1,
        tag: 'bias',
        message: 'Potential technical platform assumptions detected.',
        recommendation:
          'Avoid assuming specific platforms, browsers, or devices. Consider cross-platform compatibility and diverse technical environments.',
        councillorId: 'bias',
      });
    }

    // Exclusionary language
    const exclusionaryPatterns = [
      /only.*(developers|experts|professionals)/i,
      /requires.*(experience|knowledge|background)/i,
      /too complex.*(for|to)/i,
      /not for.*(beginners|novices)/i,
    ];

    const hasExclusionaryLanguage = exclusionaryPatterns.some((pattern) =>
      pattern.test(text),
    );

    if (hasExclusionaryLanguage) {
      issues.push({
        severity: 2,
        tag: 'bias',
        message: 'Exclusionary language detected that may limit accessibility.',
        recommendation:
          'Use inclusive language that welcomes users of all skill levels. Provide clear explanations and consider progressive disclosure of complexity.',
        councillorId: 'bias',
      });
    }

    // Tool selection bias (favoring certain tools without justification)
    if (input.toolsUsed && input.toolsUsed.length > 0) {
      const toolDiversity = new Set(input.toolsUsed).size;
      if (toolDiversity === 1 && input.toolsUsed.length > 3) {
        issues.push({
          severity: 1,
          tag: 'bias',
          message:
            'Tool selection may be biased toward a single tool without considering alternatives.',
          recommendation:
            'Consider whether alternative tools or approaches might be more appropriate. Justify tool selection based on requirements, not habit.',
          councillorId: 'bias',
        });
      }
    }

    return {
      approved: issues.length === 0,
      issues,
    };
  },
};

