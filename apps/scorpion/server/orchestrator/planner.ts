// apps/scorpion/server/orchestrator/planner.ts
// Consolidated planner with full logic - replaces simple planning placeholders

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { runModelUnified, parseModelJSON } from '@/lib/chat/modelRunner';
import { pickPlannerModel } from './plannerModel';
import type { Plan, PlanStep } from '@/lib/chat/types';

/**
 * Resolve prompt file path correctly regardless of cwd
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

/**
 * Power of 10 Rule 5: Typed tool interface
 */
interface ToolMetadata {
  description?: string;
  label?: string;
  schema?: unknown;
}

export interface PlannerInput {
  objective: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: Record<string, unknown>;
  tools?: Record<string, ToolMetadata | unknown>;
  intent?: string;
  lightweightMode?: boolean;
}

export interface PlannerOutput {
  plan: Plan;
  modelUsed: string;
  provider: string;
}

/**
 * Power of 10 Rule 3: Helper to load planner prompt from file system
 */
function loadPlannerPrompt(): string {
  try {
    const promptPath = getPromptPath('planner.system.txt');
    if (!existsSync(promptPath)) {
      throw new Error(`Planner prompt file not found: ${promptPath}`);
    }
    const prompt = readFileSync(promptPath, 'utf-8');
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Planner prompt file is empty');
    }
    return prompt;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Planner] Error reading planner prompt:', error);
    throw new Error(`Failed to load planner configuration: ${errorMessage}`);
  }
  }
  
/**
 * Power of 10 Rule 3: Helper to inject tools list into prompt
 */
function injectToolsList(prompt: string, tools: Record<string, ToolMetadata | unknown>): string {
  if (!tools || Object.keys(tools).length === 0) {
    return prompt;
  }
  
    let toolsList = '\n=== AVAILABLE TOOLS ===\n';
    Object.entries(tools).forEach(([name, tool]) => {
      if (tool) {
      const toolWithProps = tool as ToolMetadata;
        const desc = toolWithProps?.description || toolWithProps?.label || name;
        toolsList += `- ${name}: ${desc}\n`;
      }
    });
  return prompt.replace('{{TOOLS_LIST}}', toolsList);
  }
  
/**
 * Power of 10 Rule 3: Helper to inject conversation history into prompt
 */
function injectConversationHistory(prompt: string, conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>): string {
  if (conversationHistory.length === 0) {
    return prompt;
  }
    const historyText = `\n\n=== CONVERSATION HISTORY ===\n${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}\n`;
  return prompt + historyText;
  }
  
/**
 * Power of 10 Rule 3: Helper to inject context into prompt
 */
function injectContext(prompt: string, context: Record<string, unknown>): string {
  if (Object.keys(context).length === 0) {
    return prompt;
  }
    const contextText = `\n\n=== ADDITIONAL CONTEXT ===\n${JSON.stringify(context, null, 2)}\n`;
  return prompt + contextText;
  }
  
/**
 * Power of 10 Rule 3: Helper to call planner model
 */
async function callPlannerModel(
  prompt: string,
  objective: string,
  modelConfig: { provider: string; model: string },
  maxTokens: number,
  temperature: number
): Promise<string> {
  try {
    const planResponse = await runModelUnified(
      prompt,
      objective,
      {
        provider: modelConfig.provider,
        model: modelConfig.model,
        maxTokens,
        temperature,
      }
    );
    
    if (!planResponse || planResponse.trim().length === 0) {
      throw new Error('Empty response from planner model');
    }
    return planResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Planner] Model error:', error);
    throw new Error(`Planner failed: ${errorMessage}`);
  }
  }
  
/**
 * Power of 10 Rule 3: Helper to validate and normalize plan
 */
function validateAndNormalizePlan(plan: Plan, objective: string): Plan {
    // Validate plan structure
    if (!plan || typeof plan !== 'object') {
      throw new Error('Invalid plan: not an object');
    }
    
    if (!plan.plan || !Array.isArray(plan.plan)) {
      throw new Error('Invalid plan: missing plan steps array');
    }
    
  // Set objective if missing
    if (!plan.objective) {
    plan.objective = objective;
    }
    
    // Ensure needsCouncil is set
    if (plan.needsCouncil === undefined) {
      plan.needsCouncil = plan.plan.length > 3 || 
        plan.plan.some((step: PlanStep) => step.tool && step.tool !== 'none');
    }
    
    // Ensure all steps have required fields
    plan.plan = plan.plan.map((step: PlanStep, index: number) => {
      if (!step.id) {
        step.id = `s${index + 1}`;
      }
      if (!step.title) {
      step.title = `Step ${index + 1}`;
      }
      return step;
    });
    
  return plan;
}

/**
 * Power of 10 Rule 3: Helper to create fallback plan
 */
function createFallbackPlan(objective: string): Plan {
  return {
      objective,
      assumptions: [],
      plan: [{
        id: 's1',
        title: 'Respond to user',
        tool: 'none',
      }],
      done_when: ['User receives response'],
      needsCouncil: false,
      questionType: 'casual',
      councilRationale: 'Fallback plan - parsing failed (will be corrected by enforcement)'
    };
  }

/**
 * Power of 10 Rule 3: Helper to parse and validate plan response
 */
function parseAndValidatePlan(planResponse: string, objective: string): Plan {
  try {
    const plan = parseModelJSON(planResponse) as Plan;
    return validateAndNormalizePlan(plan, objective);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('[Planner] Plan parsing failed, using fallback:', errorMessage.substring(0, 100));
    return createFallbackPlan(objective);
  }
}

/**
 * Generate execution plan using LLM with full planner logic
 * Power of 10 Rule 3: Refactored to use focused helper functions (< 60 lines)
 * This replaces simple planning placeholders throughout the codebase
 */
export async function generatePlan(input: PlannerInput): Promise<PlannerOutput> {
  const { objective, conversationHistory = [], context = {}, tools = {}, lightweightMode = false } = input;
  
  // Pick appropriate model for planning
  const modelConfig = await pickPlannerModel();
  const defaultMaxTokens = lightweightMode ? 600 : 2000;
  const defaultTemp = lightweightMode ? 0.05 : 0.1;
  
  // Load and enrich prompt
  let plannerPrompt = loadPlannerPrompt();
  plannerPrompt = injectToolsList(plannerPrompt, tools);
  plannerPrompt = injectConversationHistory(plannerPrompt, conversationHistory);
  plannerPrompt = injectContext(plannerPrompt, context);
  
  // Call model
  const planResponse = await callPlannerModel(plannerPrompt, objective, modelConfig, defaultMaxTokens, defaultTemp);
  
  // Parse and validate
  const plan = parseAndValidatePlan(planResponse, objective);
  
  return {
    plan,
    modelUsed: modelConfig.model,
    provider: modelConfig.provider,
  };
}

/**
 * Generate a simple plan for single-step objectives (bypasses LLM)
 */
export function generateSimplePlan(objective: string): Plan {
  return {
    objective,
    assumptions: [],
    plan: [{
      id: 's1',
      title: objective,
      tool: 'none',
    }],
    done_when: ['User receives response'],
    needsCouncil: false,
    questionType: 'casual',
    councilRationale: 'Simple single-step objective - no council needed'
  };
}

