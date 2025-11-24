// Power of 10 Rule 4: Focused tests for plan executor
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executePlanToStream } from '../planExecutor';
import type { PlanExecutionInput } from '../planExecutor';
import type { Plan } from '@/lib/chat/types';

// Mock handleExecutorPhase
vi.mock('../../phases/executorPhase', () => ({
  handleExecutorPhase: vi.fn(),
}));

// Mock buildSummarizerContext
vi.mock('@/server/orchestrator/summarizer', () => ({
  buildSummarizerContext: vi.fn(() => ({
    sources: [],
  })),
}));

describe('executePlanToStream', () => {
  const mockPlan: Plan = {
    objective: 'Test objective',
    reasoning: 'Test reasoning',
    plan: [
      {
        id: 'step-1',
        title: 'Step 1',
        tool: 'kb.search',
        args: { query: 'test' },
      },
    ],
  };

  const mockInput: PlanExecutionInput = {
    plan: mockPlan,
    userMessage: 'Test message',
    conversationHistory: [],
    conversationId: 'test-conv-123',
    defaultModel: 'scorpion:latest',
    executor: {
      getPad: vi.fn(() => null),
    } as any,
    checkAbort: vi.fn(),
    send: vi.fn(),
    emitToolResult: vi.fn(),
    emitKnowledgeHits: vi.fn(),
    isCouncilQuestion: false,
    hasMeaningfulTools: true,
    intent: 'project_help',
    earlyKbSearchCompleted: false,
    knowledgeHitsForCouncil: [],
    shouldUseKnowledgeBase: vi.fn(() => true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env['SCORPION_USE_LEGACY_EXECUTOR'] = undefined;
  });

  it('skips execution for council questions with no meaningful tools', async () => {
    const councilInput = {
      ...mockInput,
      isCouncilQuestion: true,
      hasMeaningfulTools: false,
    };

    const result = await executePlanToStream(councilInput);

    expect(result.results).toEqual([]);
    expect(result.executorResult).toBeNull();
    expect(councilInput.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'status',
        data: expect.objectContaining({
          message: 'Council will explain the process directly...',
        }),
      })
    );
  });

  it('executes plan using new executor system by default', async () => {
    const { handleExecutorPhase } = await import('../../phases/executorPhase');
    (handleExecutorPhase as any).mockResolvedValue({
      scratchpad: {
        tools: {
          'step-1': { ok: true, data: { hits: [] } },
        },
        knowledge: [],
      },
      reason: 'all_steps_complete',
    });

    const result = await executePlanToStream(mockInput);

    expect(handleExecutorPhase).toHaveBeenCalled();
    expect(result.results).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.executorResult).toBeDefined();
  });

  it('converts research.run results to sources format', async () => {
    const { handleExecutorPhase } = await import('../../phases/executorPhase');
    const researchPlan: Plan = {
      ...mockPlan,
      plan: [
        {
          id: 'step-1',
          title: 'Research step',
          tool: 'research.run',
          args: { query: 'test query' },
        },
      ],
    };

    (handleExecutorPhase as any).mockResolvedValue({
      scratchpad: {
        tools: {
          'step-1': {
            ok: true,
            top3: [
              { title: 'Result 1', url: 'http://example.com', snippet: 'Snippet 1', score: 0.9 },
            ],
          },
        },
        knowledge: [],
      },
      reason: 'all_steps_complete',
    });

    const result = await executePlanToStream({
      ...mockInput,
      plan: researchPlan,
    });

    expect(result.results[0].result.sources).toBeDefined();
    expect(result.results[0].result.sources[0]).toMatchObject({
      title: 'Result 1',
      url: 'http://example.com',
    });
  });

  it('handles executor errors gracefully', async () => {
    const { handleExecutorPhase } = await import('../../phases/executorPhase');
    (handleExecutorPhase as any).mockRejectedValue(new Error('Executor failed'));

    const result = await executePlanToStream(mockInput);

    // Should return empty results on error
    expect(result.results).toEqual([]);
    expect(result.executorResult).toBeNull();
  });

  it('returns empty results when new executor is disabled', async () => {
    process.env['SCORPION_USE_LEGACY_EXECUTOR'] = '1';

    const result = await executePlanToStream(mockInput);

    // Legacy executor not yet extracted, so returns empty
    expect(result.results).toEqual([]);
    expect(result.executorResult).toBeNull();
  });

  it('sends progress events during execution', async () => {
    const { handleExecutorPhase } = await import('../../phases/executorPhase');
    (handleExecutorPhase as any).mockResolvedValue({
      scratchpad: { tools: {}, knowledge: [] },
      reason: 'all_steps_complete',
    });

    await executePlanToStream(mockInput);

    expect(mockInput.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'status',
        data: expect.objectContaining({
          message: 'Executing plan...',
        }),
      })
    );
  });
});

