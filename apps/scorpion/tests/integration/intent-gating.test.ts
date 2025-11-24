import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { classifyIntent, getToolsForIntent, shouldUseKnowledgeBase, isToolAllowedForIntent } from '@/lib/chat/intent';
import type { ScorpionIntent } from '@/lib/chat/types';

/**
 * Test Suite: Intent Classification and Tool/KB Gating
 * 
 * This suite validates that Scorpion correctly:
 * 1. Classifies user intents
 * 2. Gates tool usage based on intent
 * 3. Gates knowledge base usage based on intent
 * 4. Prevents tool/KB usage for simple questions
 * 
 * Based on test scenarios from: intent-test-scenarios.md
 */

describe('Intent Classification', () => {
  describe('Group A - Small Talk', () => {
    test('A1: Simple greeting "hi"', () => {
      const intent = classifyIntent('hi');
      expect(intent).toBe('small_talk');
    });

    test('A2: Casual follow-up "How are you?"', () => {
      const intent = classifyIntent('How are you?');
      expect(intent).toBe('small_talk');
    });

    test('A2: Alternative greeting "hello"', () => {
      const intent = classifyIntent('hello');
      expect(intent).toBe('small_talk');
    });

    test('A2: Thanks message', () => {
      const intent = classifyIntent('thanks');
      expect(intent).toBe('small_talk');
    });
  });

  describe('Group B - Simple General Questions', () => {
    test('B1: Math question "What is 2+2?"', () => {
      const intent = classifyIntent('What is 2+2?');
      expect(intent).toBe('general_question');
    });

    test('B2: Easy fact "What is the capital of Canada?"', () => {
      const intent = classifyIntent('What is the capital of Canada?');
      expect(intent).toBe('general_question');
    });

    test('B3: Short explanation "Explain what Bitcoin is in one sentence."', () => {
      const intent = classifyIntent('Explain what Bitcoin is in one sentence.');
      expect(intent).toBe('general_question');
    });
  });

  describe('Group C - Multi-step Reasoning', () => {
    test('C1: Reasoning chain about savings', () => {
      const message = 'If someone saves $200 per month at 5% annual interest, will they have more than $5,000 after 2 years? Just estimate.';
      const intent = classifyIntent(message);
      expect(intent).toBe('general_question');
    });

    test('C2: Explanation task "Explain the difference between RAM and an SSD"', () => {
      const intent = classifyIntent('Explain the difference between RAM and an SSD in simple terms.');
      expect(intent).toBe('general_question');
    });
  });

  describe('Group D - Project/Scorpion Internal Help', () => {
    test('D1: Internal architecture question', () => {
      const intent = classifyIntent("How does Scorpion's planner and council work internally?");
      expect(intent).toBe('project_help');
    });

    test('D2: Repo/code-level help', () => {
      const intent = classifyIntent('Find where the chat API route is implemented in Scorpion and describe what it does.');
      expect(intent).toBe('project_help');
    });

    test('D3: Workflow question', () => {
      const intent = classifyIntent('When I send a message in the chat UI, what are the main steps from frontend to backend until the LLM responds?');
      expect(intent).toBe('project_help');
    });

    test('D: Mentions "scorpion" keyword', () => {
      const intent = classifyIntent('Tell me about scorpion');
      expect(intent).toBe('project_help');
    });

    test('D: Mentions "workflow" keyword', () => {
      const intent = classifyIntent('How do workflows work?');
      expect(intent).toBe('project_help');
    });
  });

  describe('Group E - System Debug', () => {
    test('E1: Why so many clarifications?', () => {
      const intent = classifyIntent('Why do you sometimes keep asking for more information instead of just answering?');
      expect(intent).toBe('system_debug');
    });

    test('E2: Meta question about tool usage', () => {
      const intent = classifyIntent('Did you use any tools to answer my last message? If yes, which ones and why?');
      // This might be system_debug or project_help depending on implementation
      expect(['system_debug', 'project_help']).toContain(intent);
    });

    test('E: "Why are you" pattern', () => {
      const intent = classifyIntent('Why are you doing that?');
      expect(intent).toBe('system_debug');
    });
  });

  describe('Group F - Edge Cases', () => {
    test('F1: Vague but answerable "Tell me about nursing"', () => {
      const intent = classifyIntent('Tell me about nursing');
      expect(intent).toBe('general_question');
    });

    test('F2: Truly missing info (should not trigger project tools)', () => {
      const intent = classifyIntent("Explain the internal process of CompanyXYZ's secret algorithm.");
      expect(intent).toBe('general_question');
    });

    test('F: General knowledge exclusion works', () => {
      // "What is 2+2" should NOT be project_help even though it has "what is"
      const intent = classifyIntent('What is 2+2?');
      expect(intent).toBe('general_question');
    });
  });
});

describe('Tool Gating by Intent', () => {
  test('small_talk should have NO tools', () => {
    const tools = getToolsForIntent('small_talk');
    expect(tools).toEqual([]);
  });

  test('general_question should have NO tools', () => {
    const tools = getToolsForIntent('general_question');
    expect(tools).toEqual([]);
  });

  test('project_help should have full tool access', () => {
    const tools = getToolsForIntent('project_help');
    expect(tools.length).toBeGreaterThan(0);
    expect(tools).toContain('kb.search');
    expect(tools).toContain('code.readFile');
    expect(tools).toContain('project.analyze');
  });

  test('system_debug should have full tool access', () => {
    const tools = getToolsForIntent('system_debug');
    expect(tools.length).toBeGreaterThan(0);
    expect(tools).toContain('kb.search');
    expect(tools).toContain('code.readFile');
  });

  test('isToolAllowedForIntent: small_talk blocks all tools', () => {
    expect(isToolAllowedForIntent('kb.search', 'small_talk')).toBe(false);
    expect(isToolAllowedForIntent('research.run', 'small_talk')).toBe(false);
    expect(isToolAllowedForIntent('code.readFile', 'small_talk')).toBe(false);
  });

  test('isToolAllowedForIntent: general_question allows research and KB tools only', () => {
    expect(isToolAllowedForIntent('kb.search', 'general_question')).toBe(true);
    expect(isToolAllowedForIntent('research.run', 'general_question')).toBe(true);
    expect(isToolAllowedForIntent('research.start', 'general_question')).toBe(true);
    expect(isToolAllowedForIntent('project.analyze', 'general_question')).toBe(false);
    expect(isToolAllowedForIntent('code.readFile', 'general_question')).toBe(false);
  });

  test('isToolAllowedForIntent: project_help allows tools', () => {
    expect(isToolAllowedForIntent('kb.search', 'project_help')).toBe(true);
    expect(isToolAllowedForIntent('code.readFile', 'project_help')).toBe(true);
    expect(isToolAllowedForIntent('project.analyze', 'project_help')).toBe(true);
  });
});

describe('Knowledge Base Gating by Intent', () => {
  test('small_talk should NOT use KB', () => {
    expect(shouldUseKnowledgeBase('small_talk')).toBe(false);
  });

  test('general_question should NOT use KB', () => {
    expect(shouldUseKnowledgeBase('general_question')).toBe(false);
  });

  test('project_help SHOULD use KB', () => {
    expect(shouldUseKnowledgeBase('project_help')).toBe(true);
  });

  test('system_debug SHOULD use KB', () => {
    expect(shouldUseKnowledgeBase('system_debug')).toBe(true);
  });
});

describe('End-to-End Intent → Tool → KB Flow', () => {
  test('A1: "hi" → small_talk → no tools → no KB', () => {
    const message = 'hi';
    const intent = classifyIntent(message);
    const tools = getToolsForIntent(intent);
    const shouldUseKB = shouldUseKnowledgeBase(intent);

    expect(intent).toBe('small_talk');
    expect(tools).toEqual([]);
    expect(shouldUseKB).toBe(false);
  });

  test('B1: "What is 2+2?" → general_question → no tools → no KB', () => {
    const message = 'What is 2+2?';
    const intent = classifyIntent(message);
    const tools = getToolsForIntent(intent);
    const shouldUseKB = shouldUseKnowledgeBase(intent);

    expect(intent).toBe('general_question');
    expect(tools).toEqual([]);
    expect(shouldUseKB).toBe(false);
  });

  test('D1: "How does Scorpion work?" → project_help → tools available → KB enabled', () => {
    const message = 'How does Scorpion work?';
    const intent = classifyIntent(message);
    const tools = getToolsForIntent(intent);
    const shouldUseKB = shouldUseKnowledgeBase(intent);

    expect(intent).toBe('project_help');
    expect(tools.length).toBeGreaterThan(0);
    expect(shouldUseKB).toBe(true);
  });

  test('E1: "Why do you keep asking?" → system_debug → tools available → KB enabled', () => {
    const message = 'Why do you keep asking?';
    const intent = classifyIntent(message);
    const tools = getToolsForIntent(intent);
    const shouldUseKB = shouldUseKnowledgeBase(intent);

    expect(intent).toBe('system_debug');
    expect(tools.length).toBeGreaterThan(0);
    expect(shouldUseKB).toBe(true);
  });
});

