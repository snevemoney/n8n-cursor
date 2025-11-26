// apps/scorpion/server/council/EthicsCouncilMember.ts

import { CouncilInput, CouncilIssue, CouncilOutput, CouncilMember } from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

const HIGH_RISK_DOMAINS = [
  'hiring',
  'recruitment',
  'loans',
  'credit',
  'lending',
  'justice',
  'sentencing',
  'risk-assessment',
  'reoffending',
  'healthcare',
  'triage',
  'policing',
  'surveillance',
  'screening',
  'approval',
  'denial',
];

const BIAS_KEYWORDS = [
  'screen resumes',
  'rank candidates',
  'approve loan',
  'deny credit',
  'predict reoffending',
  'risk score',
  'automated decision',
  'final decision',
  'auto-approve',
  'auto-deny',
];

export class EthicsCouncilMember implements CouncilMember {
  id = 'ethics';
  name = 'Ethics & Bias Councillor';

  run(input: CouncilInput): CouncilOutput {
    const issues: CouncilIssue[] = [];
    const warnings: string[] = [];
    let revisedAnswer = input.draftAnswer;

    // Check domain tags
    const hasHighRiskDomain = input.domainTags.some((tag) =>
      HIGH_RISK_DOMAINS.some((risk) => tag.toLowerCase().includes(risk)),
    );

    // Check goal/plan text for bias keywords
    const combinedText = `${input.goalDescription} ${input.planSummary} ${input.draftAnswer || ''}`.toLowerCase();
    const hasBiasKeywords = BIAS_KEYWORDS.some((keyword) => combinedText.includes(keyword));

    if (hasHighRiskDomain || hasBiasKeywords) {
      // Log improvement signal
      logImprovementSignal({
        type: 'BIAS_RISK',
        message: `High-risk domain detected: ${input.domainTags.join(', ')}. User is designing an AI workflow with potential bias risks.`,
        tag: 'ethics',
        severity: 4,
        details: {
          domainTags: input.domainTags,
          goalDescription: input.goalDescription,
        },
      });

      // Add issue
      issues.push({
        severity: 4,
        tag: 'bias',
        message: 'High-risk domain with a history of algorithmic bias.',
        recommendation:
          'Warn user about bias in historical data, require human oversight, and avoid using AI as the final decision-maker.',
        councillorId: this.id,
      });

      // Inject ethics warning into answer
      const ethicsWarning = `\n\n⚠️ **Ethics & Bias Warning**: AI systems trained on historical data can replicate or amplify past biases (e.g., against certain genders, races, or neighborhoods). You should implement fairness checks, human supervision, and avoid using AI as the final decision-maker.`;

      if (revisedAnswer) {
        revisedAnswer = revisedAnswer + ethicsWarning;
      } else {
        revisedAnswer = ethicsWarning;
      }

      warnings.push('High-risk domain detected: requires bias awareness and human oversight');
    }

    // Check for missing safety measures in plan
    if (hasHighRiskDomain && input.planSummary) {
      const planLower = input.planSummary.toLowerCase();
      const hasSafetyMeasures =
        planLower.includes('human review') ||
        planLower.includes('fairness') ||
        planLower.includes('bias check') ||
        planLower.includes('oversight');

      if (!hasSafetyMeasures) {
        issues.push({
          severity: 3,
          tag: 'safety',
          message: 'Plan lacks explicit safety measures for high-risk domain.',
          recommendation: 'Add human review step, fairness testing, and bias monitoring to the plan.',
          councillorId: this.id,
        });

        // Suggest plan revision
        const safetyAddition = '\n- Add human review step before final decision\n- Implement fairness testing\n- Set up bias monitoring';
        const revisedPlan = input.planSummary + safetyAddition;
        return {
          approved: true, // Don't block, but flag issues
          issues,
          revisedPlanSummary: revisedPlan,
          revisedAnswer,
          warnings,
        };
      }
    }

    return {
      approved: true,
      issues,
      revisedAnswer,
      warnings,
    };
  }
}

