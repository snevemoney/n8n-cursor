// apps/scorpion/server/council/dataAnalyticsCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

function includesAny(text: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) =>
    typeof p === 'string' ? text.includes(p.toLowerCase()) : p.test(text),
  );
}

export const DataAnalyticsCouncilMember: CouncilMember = {
  id: 'data-analytics',
  name: 'Data Analytics Councillor',
  description:
    'Specializes in analytics workflows: statistical analysis, trend detection, forecasting, data visualization, and ensuring proper analytical methodology.',

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Analytics-specific patterns
    const mentionsAnalytics = includesAny(text, [
      'analytics',
      'analysis',
      'analyze',
      'statistical',
      'statistics',
      'trend',
      'forecast',
      'prediction',
      'correlation',
      'regression',
      'visualization',
      'chart',
      'graph',
      'dashboard',
      'metrics',
      'kpi',
      'insight',
      'pattern',
      'anomaly',
      'outlier',
    ]);

    if (!mentionsAnalytics) {
      return { approved: true, issues: [] };
    }

    // 1) Sample size concerns
    const mentionsSmallSample = includesAny(text, [
      'small sample',
      'few data points',
      'limited data',
      'insufficient data',
    ]);

    const needsSampleSize = includesAny(text, [
      'analyze',
      'compare',
      'trend',
      'correlation',
      'statistical',
    ]);

    if (needsSampleSize && !mentionsSmallSample) {
      issues.push({
        severity: 2,
        tag: 'correctness',
        message:
          'Analytics task detected without mention of sample size or data sufficiency.',
        recommendation:
          'Remind the user to verify sample size is sufficient for the type of analysis. Small samples may lead to unreliable conclusions.',
        councillorId: 'data-analytics',
      });
    }

    // 2) Causation vs correlation
    const mentionsCausation = includesAny(text, [
      'causes',
      'caused by',
      'leads to',
      'results in',
      'because of',
    ]);

    const mentionsCorrelation = includesAny(text, [
      'correlation',
      'related',
      'associated',
      'linked',
    ]);

    if (mentionsCausation && !mentionsCorrelation) {
      issues.push({
        severity: 3,
        tag: 'correctness',
        message:
          'Causation language detected without proper correlation analysis.',
        recommendation:
          'Remind the user that correlation does not imply causation. Use careful language: "associated with" or "correlated with" rather than "causes" unless causation is proven.',
        councillorId: 'data-analytics',
      });

      logImprovementSignal({
        type: 'BROKEN_FLOW',
        message: 'Causation vs correlation confusion in analytics task.',
        tag: 'data-analytics',
        severity: 3,
      });
    }

    // 3) Missing methodology
    const hasMethodology = includesAny(text, [
      'method',
      'approach',
      'technique',
      'algorithm',
      'model',
      'statistical test',
      'hypothesis',
    ]);

    if (!hasMethodology && mentionsAnalytics) {
      issues.push({
        severity: 2,
        tag: 'prompt',
        message:
          'Analytics task detected without specifying analytical methodology.',
        recommendation:
          'Ask the user which analytical method they prefer (descriptive stats, regression, time series, clustering, etc.) or recommend an appropriate method based on the data type and goal.',
        councillorId: 'data-analytics',
      });
    }

    // 4) Visualization requirements
    const mentionsVisualization = includesAny(text, [
      'visualize',
      'chart',
      'graph',
      'plot',
      'dashboard',
      'visual',
    ]);

    if (mentionsVisualization) {
      const hasChartType = includesAny(text, [
        'bar',
        'line',
        'pie',
        'scatter',
        'histogram',
        'heatmap',
        'box plot',
      ]);

      if (!hasChartType) {
        issues.push({
          severity: 1,
          tag: 'prompt',
          message: 'Visualization requested without specifying chart type.',
          recommendation:
            'Ask the user which type of visualization they need (bar chart, line graph, scatter plot, etc.) or recommend based on the data type and analysis goal.',
          councillorId: 'data-analytics',
        });
      }
    }

    // 5) Time series / temporal analysis
    const mentionsTimeSeries = includesAny(text, [
      'time series',
      'over time',
      'temporal',
      'trend over',
      'historical',
      'forecast',
      'prediction',
    ]);

    if (mentionsTimeSeries) {
      const hasTimeGranularity = includesAny(text, [
        'daily',
        'weekly',
        'monthly',
        'yearly',
        'hourly',
        'by day',
        'by month',
        'by year',
      ]);

      if (!hasTimeGranularity) {
        issues.push({
          severity: 1,
          tag: 'prompt',
          message:
            'Time series analysis detected without specifying time granularity.',
          recommendation:
            'Ask the user what time granularity they need (daily, weekly, monthly, etc.) for the analysis.',
          councillorId: 'data-analytics',
        });
      }
    }

    // 6) Data quality concerns
    const mentionsDataQuality = includesAny(text, [
      'missing',
      'null',
      'invalid',
      'outlier',
      'anomaly',
      'error',
      'clean',
    ]);

    if (mentionsAnalytics && !mentionsDataQuality) {
      issues.push({
        severity: 1,
        tag: 'data-verification',
        message:
          'Analytics task detected without addressing data quality concerns.',
        recommendation:
          'Remind the user to check for missing values, outliers, and data quality issues before performing analysis.',
        councillorId: 'data-analytics',
      });
    }

    return {
      approved: issues.length === 0,
      issues,
    };
  },
};

