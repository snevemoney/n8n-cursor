// apps/scorpion/server/council/pragmatonCouncil.ts
// Execution Engineer - Evolved for new executor system

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

export const PragmatonCouncilMember: CouncilMember = {
  id: 'pragmaton',
  name: 'Pragmaton',
  description:
    'Execution Engineer - Focuses on practical implementation, n8n workflows, API integration, and ensuring plans are actually executable. Translates council output into working solutions.',
  weight: 1.3,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for execution concerns
    const mentionsExecution = /(execute|implement|run|workflow|n8n|api|automation|tool)/i.test(text);
    const mentionsPlan = /(plan|step|tool|action)/i.test(text);

    if (!mentionsExecution && !mentionsPlan) {
      return { approved: true, issues: [] };
    }

    // 1) Tool execution feasibility
    const mentionsTools = input.toolsUsed && input.toolsUsed.length > 0;
    const mentionsComplexTools = /(workflows\.trigger|agent\.deploy|research\.start)/i.test(text);

    if (mentionsComplexTools) {
      issues.push({
        severity: 2,
        tag: 'tools',
        message: 'Complex tool execution detected - verify feasibility.',
        recommendation:
          'Ensure the new executor system (server/orchestrator/executor.ts) can handle these tools. Verify tool registry availability and proper error handling.',
        councillorId: 'pragmaton',
      });
    }

    // 2) n8n workflow integration
    const mentionsN8n = /(n8n|workflow|automation)/i.test(text);
    if (mentionsN8n) {
      issues.push({
        severity: 1,
        tag: 'workflow-design',
        message: 'n8n workflow integration detected.',
        recommendation:
          'Ensure proper use of workflows.list, workflows.get, and workflows.trigger tools. Verify workflow IDs exist and payloads match workflow schemas.',
        councillorId: 'pragmaton',
      });
    }

    // 3) API integration concerns
    const mentionsAPI = /(api|endpoint|http|fetch|request)/i.test(text);
    if (mentionsAPI && !mentionsN8n) {
      issues.push({
        severity: 2,
        tag: 'correctness',
        message: 'Direct API calls detected - consider using tools.',
        recommendation:
          'Prefer using registered tools over direct API calls. Tools provide proper error handling, retries, and telemetry. Use the tool registry (server/tools/tool-registry.ts) for available tools.',
        councillorId: 'pragmaton',
      });
    }

    // 4) Execution order and dependencies
    const mentionsDependencies = /(depends|before|after|sequence|order)/i.test(text);
    if (mentionsPlan && !mentionsDependencies && text.split('step').length > 2) {
      issues.push({
        severity: 1,
        tag: 'workflow-design',
        message: 'Multi-step plan without explicit dependencies.',
        recommendation:
          'Ensure plan steps have proper dependencies defined. The new planner (server/orchestrator/planner.ts) supports dependsOn arrays for step ordering.',
        councillorId: 'pragmaton',
      });
    }

    // 5) Error handling and retries
    const mentionsError = /(error|fail|exception|timeout)/i.test(text);
    if (mentionsExecution && !mentionsError) {
      issues.push({
        severity: 1,
        tag: 'correctness',
        message: 'Execution plan without error handling considerations.',
        recommendation:
          'The new executor system includes timeout handling and retries. Ensure plans account for potential failures and have fallback strategies.',
        councillorId: 'pragmaton',
      });
    }

    return {
      approved: true,
      issues,
    };
  },
};

