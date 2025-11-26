// apps/scorpion/server/council/sentinelCouncil.ts
// Security & Performance - Evolved to complement SecurityCouncilMember and PerformanceCouncilMember

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';

export const SentinelCouncilMember: CouncilMember = {
  id: 'sentinel',
  name: 'Sentinel',
  description:
    'Security & Performance Guardian - Monitors security threats, performance bottlenecks, and system integrity. Works alongside SecurityCouncilMember and PerformanceCouncilMember for comprehensive protection.',
  weight: 1.2,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for security and performance concerns
    const mentionsSecurity = /(security|auth|permission|access|vulnerability|attack|threat)/i.test(text);
    const mentionsPerformance = /(performance|slow|bottleneck|timeout|latency|optimization|speed)/i.test(text);

    if (!mentionsSecurity && !mentionsPerformance) {
      return { approved: true, issues: [] };
    }

    // 1) Security concerns - complement SecurityCouncilMember
    if (mentionsSecurity) {
      issues.push({
        severity: 3,
        tag: 'security',
        message: 'Security-sensitive operation detected.',
        recommendation:
          'Review security implications: authentication, authorization, input validation, and data protection. SecurityCouncilMember will provide detailed security analysis.',
        councillorId: 'sentinel',
      });
    }

    // 2) Performance concerns - complement PerformanceCouncilMember
    if (mentionsPerformance) {
      issues.push({
        severity: 2,
        tag: 'performance',
        message: 'Performance considerations detected.',
        recommendation:
          'Consider performance implications: use lightweight mode for resource-constrained scenarios, optimize tool selection, and leverage caching. PerformanceCouncilMember will provide detailed performance analysis.',
        councillorId: 'sentinel',
      });
    }

    // 3) System integrity
    const mentionsSystem = /(system|infrastructure|server|deployment)/i.test(text);
    if (mentionsSystem && (mentionsSecurity || mentionsPerformance)) {
      issues.push({
        severity: 2,
        tag: 'security',
        message: 'System-level operation with security/performance implications.',
        recommendation:
          'Ensure system operations maintain integrity: proper error handling, resource limits, and monitoring. Verify no single points of failure in the modular architecture.',
        councillorId: 'sentinel',
      });
    }

    // Note: Works alongside SecurityCouncilMember and PerformanceCouncilMember
    // Sentinel provides high-level vigilance, others provide detailed analysis
    return {
      approved: true,
      issues,
    };
  },
};

