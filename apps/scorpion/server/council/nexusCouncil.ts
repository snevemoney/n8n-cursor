// apps/scorpion/server/council/nexusCouncil.ts
// Integration Specialist - Evolved for modular system integration

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';

export const NexusCouncilMember: CouncilMember = {
  id: 'nexus',
  name: 'Nexus',
  description:
    'Integration Specialist - Ensures seamless communication between services, proper API design, data flows, and webhook integration. Focuses on system interconnectivity.',
  weight: 1.1,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for integration concerns
    const mentionsIntegration = /(integrate|api|webhook|endpoint|service|connection|data flow)/i.test(text);
    const mentionsMultipleServices = /(orchestrator|planner|executor|council|tool registry|summarizer)/i.test(text);

    if (!mentionsIntegration && !mentionsMultipleServices) {
      return { approved: true, issues: [] };
    }

    // 1) Module integration - ensure proper use of new modular components
    if (mentionsMultipleServices) {
      issues.push({
        severity: 1,
        tag: 'workflow-design',
        message: 'Multiple system modules referenced - verify integration points.',
        recommendation:
          'Ensure proper integration between modules: orchestrator coordinates phases, planner generates plans, executor runs tools, council provides deliberation. Verify data contracts between modules.',
        councillorId: 'nexus',
      });
    }

    // 2) API contract concerns
    const mentionsAPI = /(api|endpoint|contract|schema|interface)/i.test(text);
    if (mentionsAPI) {
      issues.push({
        severity: 2,
        tag: 'correctness',
        message: 'API integration detected - verify contracts.',
        recommendation:
          'Ensure API contracts are properly defined and validated. Use Tool Contract v2 format ({ok, data, error, meta}) for tool results. Verify request/response schemas match.',
        councillorId: 'nexus',
      });
    }

    // 3) Data flow concerns
    const mentionsDataFlow = /(data flow|pipeline|stream|event|message)/i.test(text);
    if (mentionsDataFlow) {
      issues.push({
        severity: 2,
        tag: 'workflow-design',
        message: 'Data flow operation detected.',
        recommendation:
          'Ensure proper data flow: planner → council → executor → summarizer. Verify data formats are consistent across phases and proper error propagation.',
        councillorId: 'nexus',
      });
    }

    // 4) Webhook integration
    const mentionsWebhook = /(webhook|callback|notification|event)/i.test(text);
    if (mentionsWebhook) {
      issues.push({
        severity: 1,
        tag: 'workflow-design',
        message: 'Webhook or event-based integration detected.',
        recommendation:
          'Ensure proper webhook handling: validate payloads, handle retries, and provide proper error responses. Consider using n8n workflows for complex webhook processing.',
        councillorId: 'nexus',
      });
    }

    return {
      approved: true,
      issues,
    };
  },
};

