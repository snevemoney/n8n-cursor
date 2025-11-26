/**
 * Chat Route Integration for Transformer Architecture
 * 
 * Integrates the transformer orchestrator into the existing chat stream.
 * This can be used as an alternative or enhancement to the existing orchestrator.
 */

import { orchestrateScorpionStep } from './orchestrator-example';
import type { OrchestratorInput, OrchestratorResult } from './orchestrator-example';
import type { Message } from '@/lib/chat/types';
import { formatOrchestratorResult } from './orchestrator-example';

/**
 * Stream callback type for SSE streaming
 */
export type StreamCallback = (event: { type: string; data: unknown }) => void;

/**
 * Transformer Orchestration Response
 * Standardized format for chat route integration
 */
export interface TransformerResponse {
  reply: string; // Final assistant text
  integrationPlan: OrchestratorResult['integrationPlan'];
  executionLog: Array<{
    stepId: string;
    success: boolean;
    output?: unknown;
    error?: string;
  }>;
  context: OrchestratorResult['context'];
  debug?: {
    attentionHits?: Array<{ entryId: string; score: number }>;
    headOutputs?: Array<{ headName: string; priorities: number }>;
  };
}

/**
 * Run transformer-based orchestration for a chat message
 * 
 * This can be called from the chat route to use transformer architecture
 * instead of or alongside the existing orchestrator.
 * 
 * Supports streaming via optional send callback for SSE compatibility.
 */
export async function runTransformerOrchestration(
  userMessage: string,
  conversationHistory: Message[],
  options?: {
    riskMode?: 'safe' | 'balanced' | 'exploratory';
    userId?: string;
    pipelineStage?: 'planner' | 'council' | 'tool_selection' | 'knowledge_retrieval' | 'execution' | 'validation' | 'notification';
    useCouncilSystem?: boolean;
    debug?: boolean;
    send?: StreamCallback; // Optional SSE streaming callback
  }
): Promise<TransformerResponse> {
  try {
    const input: OrchestratorInput = {
      query: userMessage,
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      })),
      riskMode: options?.riskMode || 'balanced',
      userId: options?.userId,
      pipelineStage: options?.pipelineStage,
    };

    // Send status updates if streaming
    if (options?.send) {
      options.send({ type: 'status', data: { message: 'Analyzing request...', phase: 'transformer-planning' } });
    }

    const result = await orchestrateScorpionStep(input);

  // Send execution updates if streaming
  if (options?.send) {
    options.send({ 
      type: 'status', 
      data: { 
        message: `Executing ${result.executionResults.length} steps...`, 
        phase: 'transformer-execution' 
      } 
    });
    
    // Stream tool execution results
    for (const execResult of result.executionResults) {
      if (execResult.success) {
        options.send({ 
          type: 'tool', 
          data: { 
            name: execResult.stepId, 
            result: execResult.output,
            success: true 
          } 
        });
      } else {
        options.send({ 
          type: 'tool', 
          data: { 
            name: execResult.stepId, 
            error: execResult.error,
            success: false 
          } 
        });
      }
    }
  }

    // Format reply from execution results
    const reply = formatOrchestratorResult(result);

    return {
      reply,
      integrationPlan: result.integrationPlan,
      executionLog: result.executionResults,
      context: result.context,
      debug: options?.debug ? {
        // Add debug info if requested
      } : undefined,
    };
  } catch (error: any) {
    console.error('[Transformer Orchestrator] Error:', error);
    
    // Send error status if streaming
    if (options?.send) {
      options.send({ 
        type: 'error', 
        data: { 
          message: `Transformer orchestrator error: ${error.message || 'Unknown error'}`,
          phase: 'transformer-error'
        } 
      });
    }
    
    // Return a fallback response instead of throwing
    return {
      reply: `I encountered an error while processing your request: ${error.message || 'Unknown error'}. Please try again or use the standard chat mode.`,
      integrationPlan: {
        orderedSteps: [],
        chosenTools: [],
        riskLevel: 'safe',
      },
      executionLog: [{
        stepId: 'error',
        success: false,
        error: error.message || 'Unknown error',
      }],
      context: {} as any,
    };
  }
}

/**
 * Check if transformer orchestration should be used
 * 
 * Can be controlled via environment variable or feature flag
 * Also supports user-specific enablement
 */
export function shouldUseTransformerOrchestration(userId?: string): boolean {
  const envEnabled = process.env.USE_TRANSFORMER_ORCHESTRATOR === 'true';
  
  // Allow user-specific enablement in production
  if (userId && process.env.ENABLE_TRANSFORMER_FOR_USERS) {
    const allowedUsers = process.env.ENABLE_TRANSFORMER_FOR_USERS.split(',').map(u => u.trim());
    if (allowedUsers.includes(userId)) {
      return true;
    }
  }
  
  return envEnabled;
}

