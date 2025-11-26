// apps/scorpion/server/orchestrator/index.ts

import { computeNextBestAction } from '../strategy/nextBestAction';
import { findSimilarMissions } from '../strategy/similarityEngine';
import { MissionLogStoreEmbedding } from '../strategy/MissionLogStoreEmbedding';
import { logImprovementSignal } from './selfImprovement';
import { ScorpionContextSnapshot } from '../types/strategy';
import { extractDomainTags } from '../council';
import { runCouncilLegacy } from './council/legacy';
import { CouncilInput } from '../types/council';
import { selectCreativePipeline } from '../strategy/creativePipeline';
import { selectDataWorkflow } from '../strategy/dataWorkflowSelector';

export async function runScorpionBrain(
  snapshot: ScorpionContextSnapshot,
  opts?: {
    draftAnswer?: string;
    planSummaryOverride?: string;
    domainTags?: string[];
    councilResult?: import('../types/council').CouncilResult; // Allow passing pre-computed council result
  },
) {
  // Use existing plan summary or override if your planner generated one separately
  const planSummary = opts?.planSummaryOverride ?? (snapshot.planSummary || '');
  const lastUserMessage =
    snapshot.messages[snapshot.messages.length - 1]?.content || '';

  // 1) Decide creative pipeline (if any)
  const creativeDecision = selectCreativePipeline({
    text: `${lastUserMessage}\n\n${planSummary}`,
    domainTags: opts?.domainTags,
  });

  // 1b) Decide data workflow (if any)
  const dataWorkflow = selectDataWorkflow({
    text: `${lastUserMessage}\n\n${planSummary}`,
    domainTags: opts?.domainTags,
  });

  // 2) Council - use provided result or compute new one
  let councilResult: import('../types/council').CouncilResult;
  if (opts?.councilResult) {
    // Use pre-computed council result to avoid duplicate execution
    councilResult = opts.councilResult;
  } else {
    // Compute council result
    const councilInput: CouncilInput = {
      goalDescription: lastUserMessage,
      planSummary,
      draftAnswer: opts?.draftAnswer,
      domainTags: opts?.domainTags || extractDomainTags(lastUserMessage, planSummary),
      toolsUsed: snapshot.toolsUsed,
      planSteps: snapshot.planSummary
        ? planSummary
            .split('\n')
            .filter((l) => l.trim())
            .map((line, idx) => ({
              description: line.replace(/^\d+\.\s*/, '').trim(),
              tool: line.match(/\[tool\]\s*(\w+\.\w+)/i)?.[1],
            }))
        : undefined,
    };
    councilResult = await runCouncilLegacy(councilInput);
  }

  if (!councilResult.approved) {
    logImprovementSignal({
      type: 'OVERCOMPLEX_PLAN',
      message: 'Council did not approve the plan. Check issues for details.',
      missionId: snapshot.missionId,
      severity: 3,
      tag: 'council',
    });
  }

  // 3) Similar missions
  const similar = await findSimilarMissions(snapshot, MissionLogStoreEmbedding, {
    limit: 3,
  });

  // 4) NBA (Next Best Action) - use revised plan if council modified it
  const nba = computeNextBestAction({
    ...snapshot,
    planSummary: councilResult.revisedPlanSummary ?? planSummary,
  });

  return {
    similar,
    nextBestAction: nba,
    council: councilResult,
    // if you pass draftAnswer into brain, you can use revisedAnswer here
    revisedAnswer: councilResult.revisedAnswer ?? opts?.draftAnswer,
    creativePipeline: creativeDecision,
    dataWorkflow,
  };
}
