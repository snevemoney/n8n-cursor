// apps/scorpion/server/council/oracleCouncil.ts
// Data & Analytics - Evolved to complement DataAnalyticsCouncilMember

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';

export const OracleCouncilMember: CouncilMember = {
  id: 'oracle',
  name: 'Oracle',
  description:
    'Data & Analytics Seer - Tracks metrics, insights, predictive analytics, and observability. Works alongside DataAnalyticsCouncilMember for comprehensive data analysis.',
  weight: 1.1,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for data and analytics concerns
    const mentionsData = /(data|metrics|analytics|insight|trend|pattern|statistic|measure|observability|telemetry)/i.test(text);
    const mentionsPredictive = /(predict|forecast|future|trend|pattern)/i.test(text);

    if (!mentionsData) {
      return { approved: true, issues: [] };
    }

    // 1) Metrics and observability
    if (mentionsData && !mentionsPredictive) {
      issues.push({
        severity: 1,
        tag: 'data-analytics',
        message: 'Data/metrics operation detected.',
        recommendation:
          'Ensure proper observability: use telemetry for tracking, metrics for monitoring, and logs for debugging. DataAnalyticsCouncilMember will provide detailed analytics methodology review.',
        councillorId: 'oracle',
      });
    }

    // 2) Predictive analytics
    if (mentionsPredictive) {
      issues.push({
        severity: 2,
        tag: 'data-analytics',
        message: 'Predictive analytics detected.',
        recommendation:
          'Ensure proper methodology: distinguish correlation from causation, use appropriate models, and validate predictions. DataAnalyticsCouncilMember will review methodology and ethical considerations.',
        councillorId: 'oracle',
      });
    }

    // 3) Data quality concerns
    const mentionsQuality = /(quality|accuracy|reliable|trust|verify|validate)/i.test(text);
    if (mentionsData && mentionsQuality) {
      issues.push({
        severity: 2,
        tag: 'data-verification',
        message: 'Data quality concerns detected.',
        recommendation:
          'Ensure data quality: verify sources, validate inputs, and check for completeness. Use proper data verification tools and consider data ops best practices.',
        councillorId: 'oracle',
      });
    }

    // 4) System metrics integration
    const mentionsSystemMetrics = /(system.*metric|performance.*metric|health.*metric)/i.test(text);
    if (mentionsSystemMetrics) {
      issues.push({
        severity: 1,
        tag: 'data-analytics',
        message: 'System metrics operation detected.',
        recommendation:
          'Leverage system health tools (system.health, stats.get) for metrics. Ensure proper telemetry integration and observability dashboard updates.',
        councillorId: 'oracle',
      });
    }

    // Note: Works alongside DataAnalyticsCouncilMember
    // Oracle provides high-level data insights, DataAnalytics provides detailed methodology review
    return {
      approved: true,
      issues,
    };
  },
};

