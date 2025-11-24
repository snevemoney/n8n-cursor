// apps/scorpion/server/council/index.ts

import { CouncilInput, CouncilOutput, CouncilMember, CouncilIssue, CouncilResult } from '../types/council';
import { EthicsCouncilMember } from './ethicsCouncil';
import { HumanContextCouncilMember } from './humanContextCouncil';
import { AIFoundationsCouncilMember } from './aiFoundationsCouncil';
import { GenerativeModelsCouncil } from './genModelsCouncil';
import { PromptQualityCouncil } from './promptQualityCouncil';
import { DataOpsCouncilMember } from './dataOpsCouncil';
import { SecurityCouncilMember } from './securityCouncil';
import { PerformanceCouncilMember } from './performanceCouncil';
import { SimplicityCouncilMember } from './SimplicityCouncilMember';
import { ToolSanityCouncilMember } from './ToolSanityCouncilMember';
import { storeCouncilResult } from './councilStorage';

/**
 * Register all council members here.
 */
const MEMBERS: CouncilMember[] = [
  EthicsCouncilMember,
  HumanContextCouncilMember,
  AIFoundationsCouncilMember,
  GenerativeModelsCouncil,
  PromptQualityCouncil,
  DataOpsCouncilMember,
  SecurityCouncilMember,
  PerformanceCouncilMember,
  new SimplicityCouncilMember(),
  new ToolSanityCouncilMember(),
];

/**
 * Run all council members and merge their outputs.
 */
export async function runCouncil(input: CouncilInput): Promise<CouncilResult> {
  let approved = true;
  let planSummary = input.planSummary;
  let answer = input.draftAnswer;
  const allIssues: CouncilIssue[] = [];
  const warnings: string[] = [];
  const councillorOutputs: CouncilResult['councillorOutputs'] = [];

  for (const member of MEMBERS) {
    try {
      const output = await Promise.resolve(member.run(input));

      if (!output.approved) {
        approved = false;
      }

      if (output.revisedPlanSummary) {
        planSummary = output.revisedPlanSummary;
      }

      if (typeof output.revisedAnswer === 'string') {
        answer = output.revisedAnswer;
      }

      if (output.issues.length) {
        allIssues.push(...output.issues);
      }

      if (output.warnings) {
        warnings.push(...output.warnings);
      }

      councillorOutputs.push({
        councillorId: member.id,
        councillorName: member.name || member.id,
        issues: output.issues,
        approved: output.approved,
      });
    } catch (error: any) {
      console.warn(`[Council] ${member.id} failed:`, error.message);
      // Continue with other councillors even if one fails
    }
  }

  const result: CouncilResult = {
    approved,
    allIssues,
    revisedPlanSummary: planSummary === input.planSummary ? undefined : planSummary,
    revisedAnswer: answer === input.draftAnswer ? undefined : answer,
    warnings,
    councillorOutputs,
  };

  // Store result asynchronously (don't await to avoid blocking)
  if (input.userId || input.conversationId || input.missionId) {
    storeCouncilResult(result, {
      userId: input.userId,
      conversationId: input.conversationId,
      missionId: input.missionId,
    }).catch((err) => {
      console.warn('[Council] Failed to store result:', err.message);
    });
  }

  return result;
}

/**
 * Extract domain tags from goal and plan text
 */
export function extractDomainTags(goalDescription: string, planSummary: string): string[] {
  const combined = `${goalDescription} ${planSummary}`.toLowerCase();
  const tags: string[] = [];

  const domainPatterns: Record<string, string[]> = {
    hiring: ['hire', 'recruit', 'resume', 'candidate', 'interview', 'job'],
    loans: ['loan', 'credit', 'lending', 'approve', 'deny', 'borrow'],
    justice: ['sentencing', 'reoffending', 'risk assessment', 'criminal', 'justice'],
    healthcare: ['health', 'medical', 'triage', 'diagnosis', 'treatment'],
    finance: ['finance', 'trading', 'portfolio', 'investment', 'bitcoin', 'crypto'],
    ai: ['ai', 'model', 'training', 'llm', 'agent', 'workflow'],
  };

  for (const [domain, keywords] of Object.entries(domainPatterns)) {
    if (keywords.some((keyword) => combined.includes(keyword))) {
      tags.push(domain);
    }
  }

  return tags;
}

