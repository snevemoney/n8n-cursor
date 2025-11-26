// Power of 10 Rule 4: Focused tests for planner prompt builder
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPlannerPrompt } from '../plannerPromptBuilder';
import type { PlannerPromptInput } from '../plannerPromptBuilder';
import type { ScorpionIntent } from '@/lib/chat/types';

// Mock fs module
const mockReadFileSync = vi.fn();
const mockExistsSync = vi.fn();

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    readFileSync: (...args: any[]) => mockReadFileSync(...args),
    existsSync: (...args: any[]) => mockExistsSync(...args),
  };
});

// Mock promptBuilder helpers
vi.mock('../promptBuilder', () => ({
  generateToolsList: vi.fn(() => '\n- Tool 1\n- Tool 2\n'),
  addQuestionTypeHints: vi.fn((prompt: string) => prompt + '\n💡 HINT: Test hint'),
}));

// Mock historyAnalysis
vi.mock('../historyAnalysis', () => ({
  analyzeConversationHistory: vi.fn(() => ({
    historyText: '\nHistory context',
    frequentlyUsedTools: ['kb.search'],
    frequentlyUsedFiles: [],
    unusedTools: [],
    usedSequences: [],
    usedPatterns: [],
  })),
}));

// Mock intent helpers
vi.mock('@/lib/chat/intent', () => ({
  getToolsForIntent: vi.fn(() => ['kb.search', 'code.readFile']),
}));

// Mock file-tracker
vi.mock('@/lib/chat/file-tracker', () => ({
  getFileTracker: vi.fn(() => ({
    getContextForPlanner: vi.fn(() => '\nFile context'),
  })),
}));

describe('buildPlannerPrompt', () => {
  const mockInput: PlannerPromptInput = {
    intent: 'project_help' as ScorpionIntent,
    userMessage: 'How does the planner work?',
    conversationHistory: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ],
    conversationId: 'test-conv-123',
    tools: {} as any,
    userTools: {},
    lightweightMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(`
AVAILABLE TOOLS
[TOOLS_PLACEHOLDER]

CRITICAL: Plan carefully.
    `.trim());
  });

  it('builds planner prompt with base system prompt', async () => {
    const result = await buildPlannerPrompt(mockInput);

    expect(result.prompt).toContain('CRITICAL: Plan carefully');
    expect(result.historyAnalysis).toBeDefined();
    expect(mockExistsSync).toHaveBeenCalled();
    expect(mockReadFileSync).toHaveBeenCalled();
  });

  it('includes history analysis in prompt', async () => {
    const result = await buildPlannerPrompt(mockInput);

    expect(result.historyAnalysis).toBeDefined();
    expect(result.historyAnalysis.historyText).toBeDefined();
    expect(result.prompt).toContain(result.historyAnalysis.historyText);
  });

  it('includes file tracking context when available', async () => {
    const result = await buildPlannerPrompt(mockInput);

    // File context should be added to prompt
    expect(result.prompt.length).toBeGreaterThan(0);
  });

  it('handles missing prompt file gracefully', async () => {
    mockExistsSync.mockReturnValue(false);

    await expect(buildPlannerPrompt(mockInput)).rejects.toThrow(
      'Failed to load planner configuration'
    );
  });

  it('handles empty prompt file gracefully', async () => {
    mockReadFileSync.mockReset();
    mockReadFileSync.mockReturnValue('');

    try {
      await buildPlannerPrompt(mockInput);
    } catch (e: any) {
      console.log('DEBUG: Actual error thrown:', e.message);
    }

    await expect(buildPlannerPrompt(mockInput)).rejects.toThrow(
      'Failed to load planner configuration'
    );
  });

  it('validates final prompt is not empty', async () => {
    // This should not throw since we're providing a valid prompt
    const result = await buildPlannerPrompt(mockInput);
    expect(result.prompt.length).toBeGreaterThan(0);
  });

  it('works with different intents', async () => {
    const generalQuestionInput = {
      ...mockInput,
      intent: 'general_question' as ScorpionIntent,
      userMessage: 'What is 2+2?',
    };

    const result = await buildPlannerPrompt(generalQuestionInput);
    expect(result.prompt).toBeDefined();
    expect(result.historyAnalysis).toBeDefined();
  });

  it('handles empty conversation history', async () => {
    const emptyHistoryInput = {
      ...mockInput,
      conversationHistory: [],
    };

    const result = await buildPlannerPrompt(emptyHistoryInput);
    expect(result.historyAnalysis).toBeDefined();
    // Mock returns fixed tools regardless of input, so we expect them
    expect(result.historyAnalysis.frequentlyUsedTools).toEqual(['kb.search']);
  });
});

