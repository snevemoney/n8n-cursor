// Power of 10 Rule 4: Extract plan execution orchestration to focused function
import type { ReadableStreamDefaultController } from 'stream/web';
import type { Plan } from '@/lib/chat/types';
import type { StreamState } from '../phases';
import { handleExecutorPhase } from '../phases/executorPhase';
import { buildSummarizerContext } from '@/server/orchestrator/summarizer';
import type { Executor } from '@/server/orchestrator/executor';
import { runLegacyExecutor } from './legacyExecutor';

export interface PlanExecutionInput {
  plan: Plan;
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  conversationId: string | undefined;
  defaultModel: string;
  executor: Executor;
  checkAbort: () => void;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  emitToolResult: (stepId: string, tool: string, res: any) => void;
  emitKnowledgeHits: (hits: any[]) => void;
  isCouncilQuestion: boolean;
  hasMeaningfulTools: boolean;
  intent: string;
  earlyKbSearchCompleted: boolean;
  knowledgeHitsForCouncil: any[];
  shouldUseKnowledgeBase: (intent: string) => boolean;
  modelConfig?: {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  runModelForPrompt?: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
}

export interface PlanExecutionResult {
  results: Array<{ step: string; result: any }>;
  executorResult: { scratchpad: any; sumCtx: any; reason: string } | null;
}

/**
 * Execute plan using new executor system
 * Power of 10 Rule 3: < 80 lines
 */
async function executeWithNewExecutor(
  input: PlanExecutionInput
): Promise<PlanExecutionResult | null> {
  const {
    plan,
    userMessage,
    conversationHistory,
    conversationId,
    defaultModel,
    executor,
    checkAbort,
    send,
    emitToolResult,
    emitKnowledgeHits,
  } = input;

  try {
    const executorResult = await handleExecutorPhase({
      plan,
      executor,
      conversationId,
      checkAbort,
      send,
      emitToolResult,
      emitKnowledgeHits,
    });

    // Build summarizer context for backward compatibility
    const history = conversationHistory.map((m) => ({
      role: m.role || 'user',
      content: m.content || '',
    }));

    const executorPad = executor.getPad ? executor.getPad(conversationId) : null;
    const scratchpadEntries = executorPad?.entries || Object.entries(executorResult.scratchpad.tools).map(([stepId, result]) => ({
      step: stepId,
      result,
    }));

    const sumCtx = buildSummarizerContext(conversationId, history, scratchpadEntries);
    sumCtx.sources = executorResult.scratchpad.knowledge;

    // Convert scratchpad to results format for backward compatibility
    const results = Object.entries(executorResult.scratchpad.tools).map(([stepId, result]: [string, any]) => {
      const step = plan.plan.find((s: any) => s.id === stepId);

      // Special handling for research.run - ensure sources are accessible
      if (step?.tool === 'research.run' && result?.ok) {
        if (result.data?.sources && !result.sources) {
          result.sources = result.data.sources;
        }
        if (result.top3 && Array.isArray(result.top3) && (!result.sources || result.sources.length === 0)) {
          result.sources = result.top3.map((item: any) => ({
            title: item.title,
            url: item.url,
            snippet: item.snippet || '',
            score: item.score || 0.8,
          }));
        }
      }

      return {
        step: stepId,
        result: result,
      };
    });

    return {
      results,
      executorResult: {
        scratchpad: executorResult.scratchpad,
        sumCtx,
        reason: executorResult.reason || 'all_steps_complete',
      },
    };
  } catch (executorError: any) {
    console.error('[Chat Stream] Executor error:', executorError);
    return null;
  }
}

/**
 * Execute plan - orchestrates new vs legacy executor
 * Power of 10 Rule 3: < 100 lines (orchestrator function)
 * Power of 10 Rule 4: Single responsibility - plan execution orchestration
 */
export async function executePlanToStream(
  input: PlanExecutionInput
): Promise<PlanExecutionResult> {
  const {
    plan,
    send,
    isCouncilQuestion,
    hasMeaningfulTools,
  } = input;

  // For council questions, skip tool execution if plan has no meaningful tools
  if (isCouncilQuestion && !hasMeaningfulTools) {
    console.log('[Chat Stream] Skipping executor for council question - no meaningful tools needed');
    send({ type: 'status', data: { message: 'Council will explain the process directly...', phase: 'executing' } });
    return {
      results: [],
      executorResult: null,
    };
  }

  send({ type: 'status', data: { message: 'Executing plan...', phase: 'executing' } });
  send({ type: 'progress', data: { phase: 'executing', progress: 0, message: 'Starting execution...' } });

  // Use new executor system by default
  const USE_NEW_EXECUTOR = process.env['SCORPION_USE_LEGACY_EXECUTOR'] !== '1';

  if (USE_NEW_EXECUTOR) {
    const result = await executeWithNewExecutor(input);
    if (result) {
      return result;
    }
    // Fall through to legacy executor if new executor failed
    console.warn('[Chat Stream] New executor failed, falling back to legacy executor');
  }

  // Legacy executor (only runs if explicitly enabled or new executor failed)
  const USE_LEGACY_EXECUTOR = process.env['SCORPION_USE_LEGACY_EXECUTOR'] === '1';
  if (USE_LEGACY_EXECUTOR || !USE_NEW_EXECUTOR) {
    console.log('[Chat Stream] Using legacy executor');
    
    // Use provided modelConfig and runModelForPrompt, or create defaults
    const modelConfig = input.modelConfig || {
      provider: input.defaultModel.includes('gpt') ? 'openai' : 'ollama',
      model: input.defaultModel,
      maxTokens: 1200,
      temperature: 0.07,
    };
    
    const runModelForPrompt = input.runModelForPrompt || (async (systemPrompt: string, userPrompt: string, config: any) => {
      const { runModelUnified } = await import('@/lib/chat/modelRunner');
      return runModelUnified(systemPrompt, userPrompt, config);
    });
    
    const legacyResult = await runLegacyExecutor({
      plan,
      userMessage,
      conversationId,
      checkAbort: input.checkAbort,
      send,
      shouldUseKnowledgeBase: input.shouldUseKnowledgeBase,
      intent: input.intent,
      earlyKbSearchCompleted: input.earlyKbSearchCompleted,
      knowledgeHitsForCouncil: input.knowledgeHitsForCouncil,
      modelConfig,
      runModelForPrompt,
    });
    
    // Convert legacy results to executor result format
    const history = input.conversationHistory.map((m) => ({
      role: m.role || 'user',
      content: m.content || '',
    }));
    
    const sumCtx = buildSummarizerContext(conversationId || 'unknown', history, legacyResult.results.map(r => ({
      step: r.step,
      result: r.result,
    })));
    
    return {
      results: legacyResult.results,
      executorResult: {
        scratchpad: {
          tools: Object.fromEntries(legacyResult.results.map(r => [r.step, r.result])),
          knowledge: [],
        },
        sumCtx,
        reason: 'legacy_executor_complete',
      },
    };
  }

  // Default: no execution
  return {
    results: [],
    executorResult: null,
  };
}

