// apps/scorpion/server/council/satoriCouncil.ts
// Alignment & Safety - Evolved to work with EthicsCouncilMember

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';

export const SatoriCouncilMember: CouncilMember = {
  id: 'satori',
  name: 'Satori',
  description:
    'Alignment & Safety - Ensures decisions align with user intent, privacy, and business rules. Focuses on human impact, safety, and long-term consequences.',
  weight: 1.0,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for alignment and safety concerns
    const mentionsUser = /(user|client|customer|person|individual)/i.test(text);
    const mentionsPrivacy = /(privacy|data|personal|sensitive|pii|gdpr)/i.test(text);
    const mentionsIntent = /(intent|goal|objective|purpose|want|need)/i.test(text);

    // 1) User intent alignment
    if (mentionsUser && !mentionsIntent) {
      issues.push({
        severity: 2,
        tag: 'human-context',
        message: 'User-focused query without clear intent alignment.',
        recommendation:
          'Ensure the plan and response align with the user\'s actual intent. Use intent classification (system_debug, project_help, etc.) to guide tool selection and response format.',
        councillorId: 'satori',
      });
    }

    // 2) Privacy concerns
    if (mentionsPrivacy) {
      issues.push({
        severity: 3,
        tag: 'data-privacy',
        message: 'Privacy-sensitive operation detected.',
        recommendation:
          'Ensure proper data handling: no sensitive data in logs, proper access controls, and compliance with privacy regulations. Use the security council for detailed security review.',
        councillorId: 'satori',
      });
    }

    // 3) Safety and ethical considerations
    const mentionsSafety = /(safety|harm|risk|danger|unsafe)/i.test(text);
    if (mentionsSafety) {
      issues.push({
        severity: 3,
        tag: 'safety',
        message: 'Safety concerns detected in plan or response.',
        recommendation:
          'Review safety implications carefully. Consider human oversight, fail-safes, and proper error handling. Consult with EthicsCouncilMember for bias and ethical concerns.',
        councillorId: 'satori',
      });
    }

    // 4) Business rules alignment
    const mentionsBusiness = /(business|rule|policy|compliance|regulation)/i.test(text);
    if (mentionsBusiness) {
      issues.push({
        severity: 2,
        tag: 'correctness',
        message: 'Business rules or policies mentioned.',
        recommendation:
          'Ensure the plan complies with established business rules, project guardrails (PROJECTS.yaml, ENV_MATRIX.yaml), and system policies. Verify against project scope definitions.',
        councillorId: 'satori',
      });
    }

    // Note: Works alongside EthicsCouncilMember - Satori focuses on alignment, Ethics focuses on bias
    return {
      approved: true,
      issues,
    };
  },
};

