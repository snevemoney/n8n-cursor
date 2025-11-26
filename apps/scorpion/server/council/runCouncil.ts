// apps/scorpion/server/council/runCouncil.ts

import { CouncilInput, CouncilResult, CouncilMember } from '../types/council';
import { EthicsCouncilMember } from './EthicsCouncilMember';
import { SimplicityCouncilMember } from './SimplicityCouncilMember';
import { ToolSanityCouncilMember } from './ToolSanityCouncilMember';

/**
 * Run all council members and aggregate their outputs
 */
export async function runCouncil(input: CouncilInput): Promise<CouncilResult> {
  const members: CouncilMember[] = [
    new EthicsCouncilMember(),
    new SimplicityCouncilMember(),
    new ToolSanityCouncilMember(),
  ];

  const allIssues: CouncilResult['allIssues'] = [];
  const warnings: string[] = [];
  let revisedPlanSummary = input.planSummary;
  let revisedAnswer = input.draftAnswer;
  let approved = true;

  const councillorOutputs: CouncilResult['councillorOutputs'] = [];

  // Run each councillor
  for (const member of members) {
    try {
      const output = await Promise.resolve(member.run(input));
      councillorOutputs.push({
        councillorId: member.id,
        councillorName: member.name,
        issues: output.issues,
        approved: output.approved,
      });

      allIssues.push(...output.issues);

      if (output.warnings) {
        warnings.push(...output.warnings);
      }

      if (output.revisedPlanSummary) {
        revisedPlanSummary = output.revisedPlanSummary;
      }

      if (output.revisedAnswer) {
        revisedAnswer = output.revisedAnswer;
      }

      // If any councillor strongly disapproves (severity 5), we may want to flag it
      if (!output.approved && output.issues.some((i) => i.severity >= 5)) {
        approved = false;
      }
    } catch (error: any) {
      console.warn(`[Council] ${member.id} failed:`, error.message);
      // Continue with other councillors even if one fails
    }
  }

  return {
    approved,
    allIssues,
    revisedPlanSummary,
    revisedAnswer,
    warnings,
    councillorOutputs,
  };
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

