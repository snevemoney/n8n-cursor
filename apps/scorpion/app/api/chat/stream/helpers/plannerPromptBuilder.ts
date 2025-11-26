// Power of 10 Rule 4: Extract planner prompt building to focused function
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { ScorpionIntent } from '@/lib/chat/types';
import { getToolsForIntent } from '@/lib/chat/intent';
import { generateToolsList, addQuestionTypeHints } from './promptBuilder';
import { analyzeConversationHistory } from './historyAnalysis';
import type { tools } from '@/lib/chat/tools';

/**
 * Resolve prompt file path correctly regardless of cwd
 * Power of 10 Rule 3: Small utility function
 */
function getPromptPath(filename: string): string {
  const cwd = process.cwd();
  
  // If we're already in apps/scorpion, use relative path
  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }
  
  // Try project root path
  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }
  
  // Fallback: remove duplicate apps/scorpion if present
  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);
  
  return fallbackPath;
}

export interface PlannerPromptInput {
  intent: ScorpionIntent;
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  conversationId: string | undefined;
  tools: typeof tools;
  userTools: Record<string, unknown>;
  lightweightMode: boolean;
}

export interface PlannerPromptResult {
  prompt: string;
  historyAnalysis: ReturnType<typeof analyzeConversationHistory>;
}

/**
 * Build planner prompt with all context injection
 * Power of 10 Rule 3: < 80 lines
 * Power of 10 Rule 4: Single responsibility - only prompt assembly
 */
export async function buildPlannerPrompt(
  input: PlannerPromptInput
): Promise<PlannerPromptResult> {
  const { intent, userMessage, conversationHistory, conversationId, tools, userTools } = input;
  
  // Read base planner prompt file
  let plannerPrompt: string;
  try {
    const promptPath = getPromptPath('planner.system.txt');
    if (!existsSync(promptPath)) {
      throw new Error(`Planner prompt file not found: ${promptPath}`);
    }
    plannerPrompt = readFileSync(promptPath, 'utf-8');
    if (!plannerPrompt || plannerPrompt.trim().length === 0) {
      throw new Error('Planner prompt file is empty');
    }
    console.log('[Prompt] Using planner.system.txt for intent:', intent);
  } catch (error: any) {
    console.error('[Chat Stream] Error reading planner prompt:', error);
    throw new Error(`Failed to load planner configuration: ${error.message}`);
  }
  
  // Generate dynamic tools list
  const allowedTools = getToolsForIntent(intent, userMessage);
  const toolsList = generateToolsList(intent, userMessage, tools, userTools, allowedTools);
  
  // Replace AVAILABLE TOOLS section
  plannerPrompt = plannerPrompt.replace(
    /AVAILABLE TOOLS[\s\S]*?(?=\nCRITICAL:|PLANNING STRATEGY|CONTEXT HINTS|OUTPUT FORMAT)/,
    `AVAILABLE TOOLS${toolsList}\n\n`
  );
  
  // Analyze conversation history
  const historyAnalysis = analyzeConversationHistory(conversationHistory, tools);
  console.debug('[Chat Stream] History analysis length:', historyAnalysis.historyText.length);
  plannerPrompt += historyAnalysis.historyText;
  
  // Add file tracking context
  try {
    const { getFileTracker } = await import('@/lib/chat/file-tracker');
    const tracker = getFileTracker();
    const fileContext = tracker.getContextForPlanner(conversationId, 10);
    if (fileContext) {
      plannerPrompt += fileContext;
    }
  } catch (error) {
    console.debug('[Chat Stream] File tracker not available:', error);
  }
  
  // Add question type hints
  plannerPrompt = addQuestionTypeHints(plannerPrompt, userMessage);
  
  // Validate final prompt
  if (!plannerPrompt || plannerPrompt.trim().length === 0) {
    throw new Error('Planner prompt is empty after assembly');
  }
  
  return {
    prompt: plannerPrompt,
    historyAnalysis,
  };
}

