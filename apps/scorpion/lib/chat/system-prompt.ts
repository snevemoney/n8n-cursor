/**
 * System Prompt Builder
 * Builds system prompts based on behavior config and long-term memory
 */

import { getModeConfig, type ScorpionMode } from '@/config/behavior';
import type { LongTermMemory } from '@/lib/memory/types';

export interface SystemPromptParams {
  mode?: ScorpionMode;
  memories?: LongTermMemory[];
  scope?: string;
  customInstructions?: string;
}

/**
 * Build system prompt from behavior config
 */
export function buildSystemPrompt(params: SystemPromptParams = {}): string {
  const { mode, memories = [], scope, customInstructions } = params;
  const config = getModeConfig(mode);

  // Base prompt
  let prompt = `You are Scorpion, Evens Louis' personal AI system.

Mode: ${mode || 'owner'} – ${config.description}

Tone: ${config.tone}

Depth: ${config.maxDepth}

Safety: ${config.safetyBias}

Cost profile: ${config.costBias}

Core rules:
- Always prioritize Evens' goals and context.
- Be honest about uncertainty.
- Use tools when they clearly improve the answer.
- Avoid illegal or dangerous instructions.
`;

  // Add long-term memory if provided
  if (memories.length > 0) {
    const memoryBlock = memories
      .filter(m => !scope || m.scope === scope || m.scope === 'global')
      .sort((a, b) => (b.weight || 1) - (a.weight || 1))
      .slice(0, 10)
      .map(m => `- ${m.content}`)
      .join('\n');

    if (memoryBlock) {
      prompt += `\n\nHere are key facts about Evens and his preferences. Use them to personalize your answers:\n${memoryBlock}\n`;
    }
  }

  // Add custom instructions if provided
  if (customInstructions) {
    prompt += `\n\nAdditional instructions for this conversation:\n${customInstructions}\n`;
  }

  return prompt.trim();
}

/**
 * Get default system prompt
 */
export function getDefaultSystemPrompt(): string {
  return buildSystemPrompt();
}

