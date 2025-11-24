/**
 * Council Integration for Transformer Architecture
 * 
 * Connects the transformer multi-head attention to the existing council system.
 * Each council member acts as an attention head.
 */

import type { HeadOutput } from '@/server/transformer/head-output';
import type { ScorpionContext } from '@/server/transformer/scorpion-context';
import type { ResourceIndex } from '@/server/transformer/resource-index';
import { councilAgentAttentionQuery } from '@/server/transformer/attention-query';
import { runCouncilDeliberationStreaming } from '@/lib/chat/council';
import type { Plan } from '@/lib/chat/types';

/**
 * Run council deliberation and convert to HeadOutput format
 */
export async function runCouncilAsMultiHead(
  resourceIndex: ResourceIndex,
  context: ScorpionContext,
  plan?: Plan
): Promise<HeadOutput[]> {
  // If we have a plan, use the existing council system
  if (plan) {
    const councilVotes = await runCouncilDeliberationStreaming(
      plan,
      {
        provider: 'ollama',
        model: process.env.DEFAULT_MODEL || 'llama3.2',
        temperature: 0.7,
      },
      (event) => {
        // Handle streaming events if needed
        console.log('[Council] Event:', event.type);
      }
    );

    // Convert council votes to HeadOutput format
    return councilVotes.map((vote, idx) => ({
      headName: vote.agentId || vote.agentName || `council-member-${idx}`,
      priorities: [
        {
          itemId: plan.id || 'plan',
          score: vote.vote === 'approve' ? 0.9 : 0.3,
          reason: vote.rationale || vote.note || 'Council deliberation',
        },
      ],
      actions: vote.vote === 'approve' 
        ? ['Approve plan execution']
        : ['Revise plan before execution'],
      risks: vote.vote === 'revise' ? [vote.rationale || 'Plan needs revision'] : [],
    }));
  }

  // Otherwise, use attention queries for each council perspective
  const perspectives = ['architecture', 'data', 'code', 'risk'];
  return Promise.all(
    perspectives.map(perspective => 
      councilAgentAttentionQuery(resourceIndex, context, perspective)
    )
  );
}

