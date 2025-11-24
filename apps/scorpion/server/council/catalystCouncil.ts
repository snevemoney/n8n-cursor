// apps/scorpion/server/council/catalystCouncil.ts
// Innovation Advisor - Evolved for new architecture opportunities

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';

export const CatalystCouncilMember: CouncilMember = {
  id: 'catalyst',
  name: 'Catalyst',
  description:
    'Innovation Advisor - Identifies opportunities for cutting-edge improvements, new technologies, and creative solutions. Balances innovation with complexity and ROI.',
  weight: 0.9,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for innovation opportunities
    const mentionsInnovation = /(innovate|new|cutting-edge|latest|experimental|try|different|creative)/i.test(text);
    const mentionsComplexity = /(complex|complicated|difficult|challenging)/i.test(text);
    const mentionsROI = /(cost|time|effort|benefit|value|return)/i.test(text);

    if (!mentionsInnovation) {
      return { approved: true, issues: [] };
    }

    // 1) Innovation vs complexity trade-off
    if (mentionsInnovation && mentionsComplexity) {
      issues.push({
        severity: 1,
        tag: 'complexity',
        message: 'Innovation opportunity with complexity trade-off.',
        recommendation:
          'Consider the ROI: does the innovation justify the complexity? The new modular architecture supports experimentation - consider using specialized agents or isolated workflows for new approaches.',
        councillorId: 'catalyst',
      });
    }

    // 2) New technology integration
    const mentionsNewTech = /(llm|ai|model|training|fine-tuning|mcp|agent)/i.test(text);
    if (mentionsInnovation && mentionsNewTech) {
      issues.push({
        severity: 1,
        tag: 'efficiency',
        message: 'New AI/ML technology opportunity detected.',
        recommendation:
          'Leverage the new architecture: use specialized agents for AI tasks, MCP tools for external integrations, and the council system for multi-agent deliberation. Consider Mentor for LLM training guidance.',
        councillorId: 'catalyst',
      });
    }

    // 3) Architecture evolution opportunities
    const mentionsArchitecture = /(architecture|system|design|structure)/i.test(text);
    if (mentionsInnovation && mentionsArchitecture) {
      issues.push({
        severity: 1,
        tag: 'workflow-design',
        message: 'Architectural innovation opportunity.',
        recommendation:
          'The new modular architecture (orchestrator, planner, executor, council) provides a solid foundation for innovation. Consider how new ideas fit into this structure rather than replacing it.',
        councillorId: 'catalyst',
      });
    }

    // 4) ROI considerations
    if (mentionsInnovation && !mentionsROI) {
      issues.push({
        severity: 1,
        tag: 'efficiency',
        message: 'Innovation without clear ROI assessment.',
        recommendation:
          'Consider the return on investment: time saved, quality improved, or capabilities gained. Balance innovation with practical value.',
        councillorId: 'catalyst',
      });
    }

    return {
      approved: true,
      issues,
    };
  },
};

