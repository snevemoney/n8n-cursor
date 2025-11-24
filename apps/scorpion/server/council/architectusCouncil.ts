// apps/scorpion/server/council/architectusCouncil.ts
// System Architect - Evolved for modular architecture

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

export const ArchitectusCouncilMember: CouncilMember = {
  id: 'architectus',
  name: 'Architectus',
  description:
    'System Architect - Ensures plans align with Scorpion\'s modular, scalable architecture. Focuses on system design, modularity, and long-term maintainability.',
  weight: 1.5,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for architectural concerns in the new modular system
    const mentionsArchitecture = /(architecture|system design|modular|scalable|monorepo|services|structure)/i.test(text);
    const mentionsCode = /(code|file|implementation|function|class|module)/i.test(text);

    if (!mentionsArchitecture && !mentionsCode) {
      return { approved: true, issues: [] };
    }

    // 1) Modularity concerns - ensure new code fits the modular architecture
    const mentionsMonolithic = /(monolithic|spaghetti|tightly coupled|god class|god function)/i.test(text);
    if (mentionsMonolithic || (mentionsCode && !mentionsArchitecture)) {
      issues.push({
        severity: 2,
        tag: 'complexity',
        message: 'Plan may introduce non-modular code patterns.',
        recommendation:
          'Ensure implementation follows the modular architecture: separate concerns, use clear interfaces, and maintain service boundaries. Consider using the new orchestrator, planner, and executor modules.',
        councillorId: 'architectus',
      });
    }

    // 2) System boundaries - ensure tools and services are properly separated
    const mentionsMultipleServices = /(orchestrator|planner|executor|council|tool registry)/i.test(text);
    if (mentionsCode && !mentionsMultipleServices && text.length > 100) {
      issues.push({
        severity: 1,
        tag: 'workflow-design',
        message: 'Plan may not leverage the modular system architecture.',
        recommendation:
          'Consider using the new modular components: orchestrator for coordination, planner for planning, executor for tool execution, and council for deliberation.',
        councillorId: 'architectus',
      });
    }

    // 3) Scalability concerns
    const mentionsScale = /(scale|performance|bottleneck|concurrent|parallel)/i.test(text);
    if (mentionsScale) {
      issues.push({
        severity: 2,
        tag: 'performance',
        message: 'Scalability considerations detected.',
        recommendation:
          'Ensure the plan accounts for the modular architecture\'s ability to scale. Consider using lightweight mode for resource-constrained scenarios and proper tool registry selection.',
        councillorId: 'architectus',
      });
    }

    // 4) Integration points - ensure proper use of new system components
    const usesOldPatterns = /(legacy|old|deprecated|simple_planner|basic_council|identity)/i.test(text);
    if (usesOldPatterns) {
      issues.push({
        severity: 3,
        tag: 'workflow-design',
        message: 'Plan may reference deprecated or legacy patterns.',
        recommendation:
          'Use the new consolidated planner (server/orchestrator/planner.ts), new executor (server/orchestrator/executor.ts), and new council system (server/council/index.ts). Avoid legacy patterns.',
        councillorId: 'architectus',
      });

      logImprovementSignal({
        type: 'BROKEN_FLOW',
        message: 'Legacy patterns detected in plan - should use new modular architecture.',
        tag: 'architecture',
        severity: 3,
      });
    }

    return {
      approved: issues.length === 0 || issues.every(i => i.severity < 3),
      issues,
    };
  },
};

