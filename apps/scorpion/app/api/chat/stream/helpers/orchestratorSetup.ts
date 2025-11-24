// Power of 10 Rule 4: Extract orchestrator setup to focused function
import { ScorpionOrchestrator } from '@scorpion/core';
import { EnhancedOrchestrator } from '@/server/transformer';
import { runModelUnified, parseModelJSON } from '@/lib/chat/modelRunner';
import { runCouncilDeliberationStreamingLegacy } from '@/server/orchestrator/council/legacy';
import { computeConsensus } from '@/lib/chat/council';
import { executeTool } from '@/lib/chat/tools';
import { remember } from '@/lib/chat/memory';
import { classifyIntent, getToolsForIntent, shouldUseKnowledgeBase } from '@/lib/chat/intent';
import type { Message, Plan } from '@/lib/chat/types';

/**
 * Create and configure ScorpionOrchestrator instance
 * Power of 10 Rule 4: Extract complex setup to focused function
 */
export function createOrchestrator(
  provider: string | undefined,
  defaultModel: string,
  conversationId: string | undefined,
  lightweightMode: boolean
): ScorpionOrchestrator {
  // Map local ScorpionIntent (includes 'identity') to core ScorpionIntent (doesn't include 'identity')
  const coreClassifyIntent = (message: string): import('@scorpion/core').ScorpionIntent => {
    const localIntent = classifyIntent(message);
    // Map 'identity' to 'other' for core orchestrator compatibility
    return localIntent === 'identity' ? 'other' : localIntent as import('@scorpion/core').ScorpionIntent;
  };
  // Wrapper for runModelUnified to match orchestrator's expected signature
  const wrappedRunModelUnified = async (
    prompt: string,
    context: string,
    config: import('@scorpion/core').ModelConfig,
    stream?: (chunk: string) => void,
    history?: Message[]
  ): Promise<string> => {
    // Filter history to only user/assistant messages for compatibility
    const filteredHistory = history?.filter((msg) => 
      msg.role === 'user' || msg.role === 'assistant'
    ).map((msg) => ({ 
      role: msg.role as 'user' | 'assistant', 
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) 
    })) as Array<{ role: 'user' | 'assistant'; content: string }> | undefined;
    
    const result = await runModelUnified(
      prompt,
      context,
      config,
      stream,
      filteredHistory
    );
    return typeof result === 'string' ? result : JSON.stringify(result);
  };
  
  // Wrapper for runCouncilDeliberationStreaming to match orchestrator's expected signature
  const wrappedRunCouncilDeliberationStreaming = async (
    plan: import('@scorpion/core').Plan,
    modelConfig: import('@scorpion/core').ModelConfig,
    onEvent: (event: import('@scorpion/core').CouncilEvent) => void,
    knowledgeHits?: import('@scorpion/core').KnowledgeHit[]
  ): Promise<Array<{ agent: string; vote: 'approve' | 'revise'; note: string; [key: string]: unknown }>> => {
    // Normalize plan intent if needed - ensure it's a valid core ScorpionIntent
    const normalizedPlan: Plan = {
      ...plan,
      intent: ((plan.intent as string) === 'identity' ? 'other' : plan.intent) as import('@scorpion/core').ScorpionIntent | undefined,
    } as Plan;
    
    // Power of 10 Rule 7: Guard types - convert knowledgeHits format if needed
    const convertedKnowledgeHits = knowledgeHits ? knowledgeHits.map(hit => {
      const { id, snippet, source, ...rest } = hit;
      return {
        id: id || '',
        snippet: snippet || '',
        source: source || '',
        ...rest,
      };
    }) : undefined;
    
    // Power of 10 Rule 7: Guard types - convert return type to expected format
    const result = await runCouncilDeliberationStreamingLegacy(
      normalizedPlan,
      modelConfig,
      onEvent,
      convertedKnowledgeHits
    );
    
    // Convert to expected CouncilVote format
    return result.map((vote: any) => ({
      agent: vote.agentId || vote.agent || 'unknown',
      vote: vote.vote === 'reject' ? 'revise' : (vote.vote as 'approve' | 'revise'),
      note: vote.note || vote.rationale || '',
      ...vote,
    }));
  };
  
  // Wrapper for computeConsensus to match orchestrator's expected signature
  const wrappedComputeConsensus = (
    votes: Array<{ agent: string; vote: 'approve' | 'revise'; note: string; [key: string]: unknown }>,
    isCasual: boolean,
    userMessage: string
  ): { approved: boolean; score: number; summary: string } => {
    // Power of 10 Rule 7: Guard types - convert votes format (avoid duplicate properties)
    const convertedVotes = votes.map(v => {
      const { agent, vote, note, ...rest } = v;
      return {
        agentId: agent,
        agentName: agent,
        vote: vote,
        rationale: note,
        ...rest,
      };
    });
    return computeConsensus(convertedVotes as any, isCasual, userMessage);
  };
  
  const baseOrchestrator = new ScorpionOrchestrator({
    provider: provider || 'ollama',
    model: defaultModel,
    conversationId,
    lightweightMode,
    defaultModel,
    // Inject dependencies from app
    runModelUnified: wrappedRunModelUnified as any, // Type compatibility - ModelConfig is compatible
    parseModelJSON,
    runCouncilDeliberationStreaming: wrappedRunCouncilDeliberationStreaming,
    computeConsensus: wrappedComputeConsensus,
    executeTool,
    remember,
    classifyIntent: coreClassifyIntent,
    getToolsForIntent,
    shouldUseKnowledgeBase,
  });
  
  // Wrap with EnhancedOrchestrator to add transformer features
  // (positional encoding, residual connections)
  const enhancedOrchestrator = new EnhancedOrchestrator(baseOrchestrator);
  
  return enhancedOrchestrator as any; // Type compatibility - EnhancedOrchestrator wraps baseOrchestrator
}

