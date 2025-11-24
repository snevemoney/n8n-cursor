// apps/scorpion/server/council/analyticaCouncil.ts
// Knowledge & RAG Strategist - Evolved for new knowledge system

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

export const AnalyticaCouncilMember: CouncilMember = {
  id: 'analytica',
  name: 'Analytica',
  description:
    'Knowledge & RAG Strategist - Optimizes knowledge retrieval, RAG strategies, and information quality. Focuses on maximizing reuse of past knowledge and ensuring high-quality information retrieval.',
  weight: 1.2,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for knowledge/RAG concerns
    const mentionsKnowledge = /(knowledge|rag|retrieval|search|embedding|vector|kb\.search|ontology)/i.test(text);
    const mentionsResearch = /(research|web|external|source|article)/i.test(text);

    if (!mentionsKnowledge && !mentionsResearch) {
      return { approved: true, issues: [] };
    }

    // 1) Knowledge base usage - ensure proper tool selection
    const usesKbSearch = /kb\.search|knowledge\.|ontology\./i.test(text);
    const shouldUseKb = mentionsKnowledge && !mentionsResearch;

    if (shouldUseKb && !usesKbSearch) {
      issues.push({
        severity: 2,
        tag: 'tools',
        message: 'Knowledge query detected but kb.search tool not used.',
        recommendation:
          'For knowledge queries, use kb.search or ontology.search tools. For recent files, use files.recent. Ensure proper tool selection based on query type.',
        councillorId: 'analytica',
      });
    }

    // 2) RAG quality concerns
    const mentionsLowQuality = /(low quality|poor|inaccurate|wrong|outdated)/i.test(text);
    if (mentionsKnowledge && mentionsLowQuality) {
      issues.push({
        severity: 2,
        tag: 'data-verification',
        message: 'Potential RAG quality issues detected.',
        recommendation:
          'Consider improving RAG retrieval by: using better embeddings, refining search queries, adding filters, or using ontology links for better context.',
        councillorId: 'analytica',
      });
    }

    // 3) Information source verification
    if (mentionsResearch && !mentionsKnowledge) {
      issues.push({
        severity: 1,
        tag: 'data-verification',
        message: 'External research detected without knowledge base check.',
        recommendation:
          'Consider checking the knowledge base first (kb.search) before using external research. The knowledge base may already contain relevant information from past side hustles and documentation.',
        councillorId: 'analytica',
      });
    }

    // 4) Knowledge reuse opportunities
    const mentionsNew = /(new|create|build|implement)/i.test(text);
    if (mentionsNew && !mentionsKnowledge) {
      issues.push({
        severity: 1,
        tag: 'efficiency',
        message: 'New implementation detected - check for existing knowledge.',
        recommendation:
          'Before building new solutions, search the knowledge base for similar past implementations, side hustles, or documentation that could be reused or adapted.',
        councillorId: 'analytica',
      });
    }

    return {
      approved: true,
      issues,
    };
  },
};

