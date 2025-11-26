/**
 * Council V2 - Canonical Implementation
 * 
 * This is the single source of truth for council logic.
 * All council calls should eventually route through this.
 */

import { CouncilQuestion, CouncilResult, CouncilVote } from './types';
import { runCouncil as runNewCouncil, extractDomainTags } from '@/server/council';
import { CouncilInput, CouncilResult as NewCouncilResult } from '@/server/types/council';

/**
 * Run council deliberation using the new council system
 */
export async function runCouncilV2(question: CouncilQuestion): Promise<CouncilResult> {
  // Extract domain tags from goal and plan
  const goalDescription = question.text;
  const planSummary = question.context.planSummary || 
                      question.context.plan?.objective || 
                      '';
  
  const domainTags = extractDomainTags(goalDescription, planSummary);
  
  // Build input for new council system
  const councilInput: CouncilInput = {
    goalDescription,
    planSummary,
    draftAnswer: typeof question.context['draftAnswer'] === 'string' ? question.context['draftAnswer'] : undefined,
    domainTags,
    toolsUsed: question.context.previousTools?.map((t: string | { name?: string; tool?: string; [key: string]: unknown }) => 
      typeof t === 'string' ? t : (t.name || t.tool || String(t))
    ) || [],
    planSteps: question.context.plan?.plan?.map((step: { tool?: string; description?: string; title?: string; name?: string; [key: string]: unknown } | string) => ({
      tool: typeof step === 'string' ? undefined : (typeof step.tool === 'string' ? step.tool : (typeof step.name === 'string' ? step.name : undefined)),
      description: typeof step === 'string' ? step : (typeof step.description === 'string' ? step.description : (typeof step.title === 'string' ? step.title : String(step))),
    })) || [],
    userId: typeof question.context['userId'] === 'string' ? question.context['userId'] : undefined,
    conversationId: typeof question.context.sessionId === 'string' ? question.context.sessionId : undefined,
    missionId: typeof question.context['missionId'] === 'string' ? question.context['missionId'] : undefined,
  };
  
  // Run the new council system
  console.log('[Council V2] Running new council system:', {
    questionId: question.id,
    goalDescription: goalDescription.substring(0, 50) + '...',
    planSummary: planSummary.substring(0, 50) + '...',
    domainTags: domainTags.length,
    toolsUsed: councilInput.toolsUsed?.length || 0,
  });
  
  const v2StartTime = Date.now();
  const newResult: NewCouncilResult = await runNewCouncil(councilInput);
  const v2Duration = Date.now() - v2StartTime;
  
  console.log('[Council V2] New council system completed:', {
    approved: newResult.approved,
    councillors: newResult.councillorOutputs.length,
    issues: newResult.allIssues.length,
    duration: `${v2Duration}ms`,
  });
  
  // Convert to canonical CouncilResult format
  const votes: CouncilVote[] = newResult.councillorOutputs.map((output) => ({
    agentId: output.councillorId,
    agentName: output.councillorName,
    reasoning: output.issues.map(i => i.message).join('; ') || 'No issues found',
    answer: newResult.approved ? 'approve' : 'revise',
    confidence: newResult.approved ? 0.8 : 0.5,
    vote: newResult.approved ? 'approve' : 'revise',
    rationale: output.issues.map(i => `${i.tag}: ${i.message}`).join('; ') || 'Approved',
  }));
  
  // Compute score from approval status and issues
  const score = newResult.approved 
    ? Math.max(7, 10 - (newResult.allIssues.length * 0.5))
    : Math.max(3, 6 - (newResult.allIssues.length * 0.5));
  
  const result: CouncilResult = {
    questionId: question.id,
    votes,
    finalAnswer: newResult.revisedAnswer || newResult.revisedPlanSummary || planSummary,
    approved: newResult.approved,
    score,
    summary: newResult.revisedPlanSummary || planSummary,
    issues: newResult.allIssues.map(issue => ({
      severity: issue.severity,
      tag: issue.tag,
      message: issue.message,
      recommendation: issue.recommendation,
    })),
    warnings: newResult.warnings,
    meta: {
      councillorCount: newResult.councillorOutputs.length,
      issueCount: newResult.allIssues.length,
      domainTags,
    },
  };
  
  return result;
}

