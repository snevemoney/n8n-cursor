/**
 * ScorpionOrchestrator
 * 
 * Central orchestration module for Scorpion's 4-phase pipeline:
 * 1. PLANNER - Analyzes intent and generates execution plan
 * 2. COUNCIL - Expert review (conditional, based on plan.needsCouncil)
 * 3. EXECUTOR - Executes plan steps sequentially
 * 4. SUMMARIZER - Synthesizes final answer from results
 * 
 * This orchestrator encapsulates the "brain on top" logic, making
 * Scorpion's multi-agent architecture explicit in code.
 */

import { getCouncilMembers } from '../agents/registry';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Power of 10 Rule 5: Typed interfaces
 */
export interface ModelConfig {
  provider: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CouncilEvent {
  type: string;
  data: unknown;
}

export interface KnowledgeHit {
  id: string;
  snippet: string;
  source: string;
}

export interface ConsensusResult {
  score: number;
  approved: boolean;
  summary: string;
}

export interface CouncilVote {
  agent: string;
  vote: 'approve' | 'revise';
  note: string;
  [key: string]: unknown;
}

// Type definitions - these should match the app's types
export interface PlanStep {
  id: string;
  title: string;
  tool: string;
  args?: Record<string, unknown>;
  dependsOn?: string[];
  success?: string;
}

export interface Plan {
  objective: string;
  assumptions: string[];
  reasoning?: string;
  plan: PlanStep[];
  done_when: string[];
  fallbacks?: Array<{ if: string; then: string }>;
  needsCouncil?: boolean;
  questionType?: 'casual' | 'technical' | 'conversational';
  councilRationale?: string;
  intent?: string;
}

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'tool' | 'planner' | 'council';
  content: string;
  ts?: number;
  parts?: Array<{ type: string; [key: string]: unknown }>;
}

export type ScorpionIntent = 
  | 'small_talk'
  | 'general_question'
  | 'project_help'
  | 'system_debug'
  | 'other';

export interface OrchestratorConfig {
  provider?: string;
  model?: string;
  conversationId?: string;
  lightweightMode?: boolean;
  defaultModel?: string;
  // Dependencies injected from app
  // Power of 10 Rule 5: Replaced all any types with proper interfaces
  runModelUnified: (prompt: string, context: string, config: ModelConfig, stream?: (chunk: string) => void, history?: Message[]) => Promise<string>;
  parseModelJSON: <T>(response: string) => T;
  runCouncilDeliberationStreaming: (plan: Plan, modelConfig: ModelConfig, onEvent: (event: CouncilEvent) => void, knowledgeHits?: KnowledgeHit[]) => Promise<CouncilVote[]>;
  computeConsensus: (votes: CouncilVote[], isCasual: boolean, userMessage: string) => ConsensusResult;
  executeTool: (tool: string, args: Record<string, unknown>) => Promise<ToolExecutionResult>;
  remember: (conversationId: string, content: string) => void;
  classifyIntent: (message: string) => ScorpionIntent;
  getToolsForIntent: (intent: ScorpionIntent) => string[];
  shouldUseKnowledgeBase: (intent: ScorpionIntent) => boolean;
}

export interface ToolExecutionResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface OrchestratorContext {
  userMessage: string;
  conversationHistory: Message[];
  intent: ScorpionIntent;
  plan?: Plan;
  consensus?: unknown;
  results?: Array<{ step: string; result: ToolExecutionResult }>;
  finalSummary?: string;
}

export type EventCallback = (event: { type: string; data: unknown }) => void;
export type AbortChecker = () => void;

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

export class ScorpionOrchestrator {
  private config: OrchestratorConfig;
  
  constructor(config: OrchestratorConfig) {
    this.config = config;
  }
  
  // Helper methods that delegate to injected dependencies
  // Power of 10 Rule 5: Updated signatures to use typed interfaces
  private runModelUnified = (prompt: string, context: string, config: ModelConfig, stream?: (chunk: string) => void, history?: Message[]) => {
    return this.config.runModelUnified(prompt, context, config, stream, history);
  };
  
  private parseModelJSON = <T>(response: string) => {
    // Try safeExtractJson first for more robust parsing
    try {
      const { safeExtractJson } = require('./adapters/jsonExtractor');
      const extracted = safeExtractJson(response);
      return extracted as T;
    } catch (e) {
      // Fall back to the configured parser
      return this.config.parseModelJSON<T>(response);
    }
  };
  
  private runCouncilDeliberationStreaming = (plan: Plan, modelConfig: ModelConfig, onEvent: (event: CouncilEvent) => void, knowledgeHits?: KnowledgeHit[]) => {
    return this.config.runCouncilDeliberationStreaming(plan, modelConfig, onEvent, knowledgeHits);
  };
  
  private computeConsensus = (votes: CouncilVote[], isCasual: boolean, userMessage: string) => {
    return this.config.computeConsensus(votes, isCasual, userMessage);
  };
  
  private executeTool = (tool: string, args: Record<string, unknown>) => {
    return this.config.executeTool(tool, args);
  };
  
  private remember = (conversationId: string, content: string) => {
    return this.config.remember(conversationId, content);
  };
  
  private classifyIntent = (message: string) => {
    return this.config.classifyIntent(message);
  };
  
  private getToolsForIntent = (intent: ScorpionIntent) => {
    return this.config.getToolsForIntent(intent);
  };
  
  private shouldUseKnowledgeBase = (intent: ScorpionIntent) => {
    return this.config.shouldUseKnowledgeBase(intent);
  };
  
  /**
   * Power of 10 Rule 3: Helper to load planner prompt from file system
   */
  private loadPlannerPrompt(customPrompt?: string): string {
    if (customPrompt) {
      return customPrompt;
    }
    
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
      console.error('[Orchestrator] Error reading planner prompt:', error);
      throw new Error(`Failed to load planner configuration: ${errorMessage}`);
    }
  }
  
  /**
   * Power of 10 Rule 3: Helper to generate tools list string for prompt injection
   */
  private generateToolsList(
    tools: Record<string, unknown>,
    intent: ScorpionIntent
  ): string {
    const allowedTools = this.getToolsForIntent(intent);
    
    if (intent === 'small_talk') {
      return '\n=== AVAILABLE AI-CALLABLE TOOLS (GATED BY INTENT) ===\n' +
             'INTENT: small_talk - NO TOOLS AVAILABLE\n' +
             'You should respond conversationally without using any tools.\n' +
             'Just recognize the greeting and respond politely.\n\n';
    }
    
    let toolsList = `\n=== AVAILABLE AI-CALLABLE TOOLS (GATED BY INTENT) ===\n`;
    toolsList += `INTENT: ${intent} - ${allowedTools.length} tools available\n`;
    toolsList += 'You have access to these tools. Use them appropriately for the intent.\n\n';
    
    try {
      if (tools && typeof tools === 'object') {
        const toolEntries = Object.entries(tools).filter(([name]) => 
          allowedTools.includes(name)
        );
        toolsList += `Total: ${toolEntries.length} tools available for this intent\n\n`;
        
        if (toolEntries.length === 0) {
          toolsList += '- No tools available for this intent\n';
        } else {
          toolEntries.forEach(([name, tool]) => {
            if (tool) {
              const toolWithProps = tool as { description?: string; label?: string; schema?: unknown };
              const desc = toolWithProps?.description || toolWithProps?.label || name;
              const schema = toolWithProps?.schema;
              let argsInfo = '';
              
              if (schema && typeof schema === 'object' && schema !== null && 'parse' in schema) {
                try {
                  const schemaDef = (schema as { _def?: { shape?: Record<string, unknown> } })._def;
                  if (schemaDef?.shape) {
                    const fields = Object.keys(schemaDef.shape);
                    argsInfo = ` (args: ${fields.join(', ')})`;
                  }
                } catch {
                  // Ignore schema parsing errors
                }
              }
              
              toolsList += `- ${name}${argsInfo}: ${desc}\n`;
            }
          });
        }
      }
    } catch (e) {
      console.error('[Orchestrator] Error generating tools list:', e);
    }
    
    return toolsList;
  }
  
  /**
   * Power of 10 Rule 3: Helper to enrich prompt with conversation history and file context
   */
  private enrichPromptWithContext(
    prompt: string,
    conversationHistory: Message[],
    tracker?: unknown
  ): string {
    if (conversationHistory.length > 0) {
      const historyText = `\n\n=== CONVERSATION HISTORY ===\n` +
        `${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}\n`;
      prompt += historyText;
    }
    
    if (tracker && this.config.conversationId && typeof tracker === 'object' && tracker !== null) {
      try {
        const trackerWithMethod = tracker as { getContextForPlanner?: (id: string, limit: number) => string };
        if (trackerWithMethod.getContextForPlanner) {
          const fileContext = trackerWithMethod.getContextForPlanner(this.config.conversationId, 10);
          if (fileContext) {
            prompt += fileContext;
          }
        }
      } catch (e) {
        console.warn('[Orchestrator] Error getting file context:', e);
      }
    }
    
    return prompt;
  }
  
  /**
   * Power of 10 Rule 3: Helper to call planner model and get response
   */
  private async callPlannerModel(
    prompt: string,
    userMessage: string,
    conversationHistory: Message[],
    send: EventCallback
  ): Promise<string> {
    const lightweightMode = this.config.lightweightMode || false;
    const defaultMaxTokens = lightweightMode ? 600 : 2000;
    const defaultTemp = lightweightMode ? 0.05 : 0.1;
    const defaultModel = this.config.defaultModel || this.config.model || 'llama3.1:8b';
    
    send({ type: 'status', data: { message: 'Parsing plan...', phase: 'planning' } });
    send({ type: 'progress', data: { phase: 'planning', progress: 60, message: 'Parsing plan...' } });
    send({ type: 'thought', data: { phase: 'planning', message: 'Calling LLM to generate structured plan', timestamp: Date.now() } });
    
    try {
      const response = await this.runModelUnified(
        prompt,
        userMessage,
        {
          provider: this.config.provider || 'ollama',
          model: defaultModel,
          maxTokens: defaultMaxTokens,
          temperature: defaultTemp
        },
        undefined, // No streaming for planner
        conversationHistory
      );
      
      if (!response || response.trim().length === 0) {
        throw new Error('Empty response from planner model');
      }
      
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Orchestrator] Planner model error:', error);
      throw new Error(`Planner failed: ${errorMessage}`);
    }
  }
  
  /**
   * Power of 10 Rule 3: Helper to create fallback plan when parsing fails
   */
  private createFallbackPlan(userMessage: string): Plan {
    return {
      objective: userMessage,
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
   * Power of 10 Rule 3: Helper to parse and validate plan from model response
   */
  private parseAndValidatePlan(
    planResponse: string,
    userMessage: string
  ): Plan {
    try {
      const plan = this.parseModelJSON<Plan>(planResponse);
      
      // Validate plan structure
      if (!plan || typeof plan !== 'object') {
        throw new Error('Invalid plan: not an object');
      }
      
      if (!plan.plan || !Array.isArray(plan.plan)) {
        throw new Error('Invalid plan: missing plan steps array');
      }
      
      if (!plan.objective) {
        plan.objective = userMessage; // Fallback
      }
      
      // Ensure needsCouncil is set
      if (plan.needsCouncil === undefined) {
        plan.needsCouncil = plan.plan.length > 3 || 
          plan.plan.some((step: PlanStep) => step.tool && step.tool !== 'none');
      }
      
      return plan;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('[Orchestrator] Plan parsing failed, using fallback (enforcement will correct):', errorMessage.substring(0, 100));
      return this.createFallbackPlan(userMessage);
    }
  }
  
  /**
   * Main entry point: Handle a chat request through the 4-phase pipeline
   */
  async handleChat(
    userMessage: string,
    conversationHistory: Message[],
    send: EventCallback,
    checkAbort: AbortChecker,
    tools: Record<string, unknown>,
    tracker?: unknown
  ): Promise<OrchestratorContext> {
    const context: OrchestratorContext = {
      userMessage,
      conversationHistory,
      intent: this.classifyIntent(userMessage),
    };
    
    // PHASE 1: PLANNER
    context.plan = await this.runPlanner(
      userMessage,
      conversationHistory,
      context.intent,
      send,
      checkAbort,
      tools,
      tracker
    );
    
    // PHASE 2: COUNCIL (conditional)
    if (context.plan.needsCouncil) {
      context.consensus = await this.runCouncil(
        context.plan,
        userMessage,
        send,
        checkAbort
      );
    } else {
      // Skip council for casual/conversational questions
      context.consensus = {
        approved: true,
        score: 10,
        summary: context.plan.objective || userMessage
      };
    }
    
    // PHASE 3: EXECUTOR
    context.results = await this.runExecutor(
      context.plan,
      context.intent,
      userMessage,
      send,
      checkAbort
    );
    
    // PHASE 4: SUMMARIZER
    context.finalSummary = await this.runSummarizer(
      context.plan,
      context.consensus,
      context.results,
      userMessage,
      conversationHistory,
      send,
      checkAbort
    );
    
    // Remember in memory
    if (this.config.conversationId && context.finalSummary) {
      this.remember(this.config.conversationId, `User: ${userMessage}\nAssistant: ${context.finalSummary}`);
    }
    
    return context;
  }
  
  /**
   * PHASE 1: PLANNER
   * Analyzes intent and generates execution plan
   * Power of 10 Rule 3: Refactored to use focused helper functions (< 60 lines)
   */
  async runPlanner(
    userMessage: string,
    conversationHistory: Message[],
    intent: ScorpionIntent,
    send: EventCallback,
    checkAbort: AbortChecker,
    tools: Record<string, unknown>,
    tracker?: unknown,
    customPrompt?: string
  ): Promise<Plan> {
    checkAbort();
    send({ type: 'status', data: { message: 'Analyzing request...', phase: 'planning' } });
    send({ type: 'progress', data: { phase: 'planning', progress: 10, message: 'Analyzing request...' } });
    send({ type: 'thought', data: { phase: 'planning', message: 'Analyzing user intent and determining required tools', timestamp: Date.now() } });
    
    send({ type: 'status', data: { message: 'Generating plan...', phase: 'planning' } });
    send({ type: 'progress', data: { phase: 'planning', progress: 30, message: 'Generating plan...' } });
    send({ type: 'thought', data: { phase: 'planning', message: 'Generating execution plan with tool selection', timestamp: Date.now() } });
    
    // Load prompt
    let plannerPrompt = this.loadPlannerPrompt(customPrompt);
    
    // Generate and inject tools list if not using custom prompt
    if (!customPrompt) {
      const toolsList = this.generateToolsList(tools, intent);
      plannerPrompt = plannerPrompt.replace('{{TOOLS_LIST}}', toolsList);
    }
    
    // Enrich with context
    plannerPrompt = this.enrichPromptWithContext(plannerPrompt, conversationHistory, tracker);
    
    // Call model
    const planResponse = await this.callPlannerModel(plannerPrompt, userMessage, conversationHistory, send);
    
    // Parse and validate
    const plan = this.parseAndValidatePlan(planResponse, userMessage);
    
    send({ type: 'progress', data: { phase: 'planning', progress: 100, message: 'Plan created successfully' } });
    send({ type: 'plan', data: plan });
    
    return plan;
  }
  
  /**
   * PHASE 2: COUNCIL
   * Expert review of the plan (conditional, based on plan.needsCouncil)
   */
  async runCouncil(
    plan: Plan,
    userMessage: string,
    onEvent: (event: CouncilEvent) => void,
    checkAbort: AbortChecker,
    knowledgeHits?: KnowledgeHit[] // Optional knowledge base results
  ): Promise<ConsensusResult> {
    checkAbort();
    onEvent({ type: 'status', data: { message: 'Council review starting...', phase: 'council' } });
    onEvent({ type: 'progress', data: { phase: 'council', progress: 0, message: 'Council review starting...' } });
    
    const lightweightMode = this.config.lightweightMode || false;
    const councilMaxTokens = lightweightMode ? 300 : 600;
    const councilTemp = lightweightMode ? 0.1 : 0.15;
    
    // Use agent registry to get council members
    const councilMembers = getCouncilMembers();
    
    // Run council deliberation
    const votes = await this.runCouncilDeliberationStreaming(
      plan,
      {
        provider: this.config.provider || 'ollama',
        model: this.config.model || this.config.defaultModel || 'llama3.1:8b',
        maxTokens: councilMaxTokens,
        temperature: councilTemp
      },
      onEvent, // Use the provided event callback
      knowledgeHits || [] // Pass knowledge hits if available
    );
    
    // Compute consensus
    const isCasual = plan.questionType === 'casual' || plan.questionType === 'conversational';
    const consensus = this.computeConsensus(votes, isCasual, userMessage);
    
    return consensus;
  }
  
  /**
   * Power of 10 Rule 3: Helper to normalize tool execution result
   */
  private normalizeToolResult(result: unknown): { ok: boolean; data?: unknown; error?: string; originalResult?: unknown } {
    if (!result || typeof result !== 'object') {
      return {
        ok: false,
        error: 'Tool returned invalid result format',
        originalResult: result
      };
    }
    
    if (!('ok' in result)) {
      return {
        ok: true,
        data: result
      };
    }
    
    return result as { ok: boolean; data?: unknown; error?: string };
  }
  
  /**
   * Power of 10 Rule 3: Helper to execute a single plan step
   */
  private async executeStep(
    step: PlanStep,
    send: EventCallback,
    checkAbort: AbortChecker
  ): Promise<{ ok: boolean; data?: unknown; error?: string }> {
    checkAbort();
    
    // Send status updates
    send({ 
      type: 'status', 
      data: { 
        message: `Executing: ${step.title}...`, 
        phase: 'executing',
        stepId: step.id 
      } 
    });
    send({ 
      type: 'thought', 
      data: { 
        phase: 'executing', 
        message: `Executing step: ${step.title}${step.tool !== 'none' ? ` using ${step.tool}` : ''}`, 
        timestamp: Date.now() 
      } 
    });
    send({
      type: 'plan_step',
      data: { ...step, status: 'running' },
    });
    send({
      type: 'tool',
      data: {
        tool: step.tool,
        callId: step.id,
        args: step.args || {},
        status: 'running',
      },
    });
    
    try {
      checkAbort();
      const result = await this.executeTool(step.tool, step.args || {});
      return this.normalizeToolResult(result);
    } catch (toolError: unknown) {
      const errorMessage = toolError instanceof Error ? toolError.message : String(toolError);
      console.error(`[Orchestrator] Tool execution error for ${step.tool}:`, toolError);
      return {
        ok: false,
        error: errorMessage || 'Tool execution failed',
      };
    }
  }
  
  /**
   * Power of 10 Rule 3: Helper to update execution progress
   */
  private updateExecutionProgress(
    step: PlanStep,
    completedSteps: number,
    totalSteps: number,
    result: { ok: boolean; data?: unknown; error?: string },
    send: EventCallback
  ): void {
    const stepProgress = Math.floor((completedSteps / totalSteps) * 100);
    const status = result.ok ? 'completed' : 'failed';
    
    send({
      type: 'tool',
      data: {
        tool: step.tool,
        callId: step.id,
        args: step.args || {},
        status,
        ...(result.ok ? { result } : { error: result.error }),
      },
    });
    
    send({ 
      type: 'progress', 
      data: { 
        phase: 'executing', 
        step: step.id,
        progress: stepProgress, 
        message: `${result.ok ? 'Completed' : 'Failed'} step ${completedSteps}/${totalSteps}: ${step.title}` 
      } 
    });
    
    send({
      type: 'plan_step',
      data: { ...step, status, ...(result.ok ? { result } : {}) },
    });
  }
  
  /**
   * PHASE 3: EXECUTOR
   * Executes plan steps sequentially
   * Power of 10 Rule 3: Refactored to use focused helper functions (< 60 lines)
   */
  async runExecutor(
    plan: Plan,
    intent: ScorpionIntent,
    userMessage: string,
    send: EventCallback,
    checkAbort: AbortChecker
  ): Promise<Array<{ step: string; result: { ok: boolean; data?: unknown; error?: string } }>> {
    checkAbort();
    send({ type: 'status', data: { message: 'Executing plan...', phase: 'executing' } });
    send({ type: 'progress', data: { phase: 'executing', progress: 0, message: 'Starting execution...' } });
    send({ type: 'thought', data: { phase: 'executing', message: 'Starting sequential tool execution', timestamp: Date.now() } });
    
    const results: Array<{ step: string; result: { ok: boolean; data?: unknown; error?: string } }> = [];
    const totalSteps = plan.plan.filter(s => s.tool !== 'none').length;
    let completedSteps = 0;
    
    // For small_talk with tool: 'none', mark steps as completed immediately
    if (intent === 'small_talk') {
      plan.plan.forEach((step) => {
        if (step.tool === 'none') {
          send({
            type: 'plan_step',
            data: {
              ...step,
              status: 'completed',
            },
          });
        }
      });
    }
    
    for (const step of plan.plan) {
      checkAbort();
      if (step.tool === 'none') continue;
      
      // Update progress before executing
      const stepProgress = Math.floor((completedSteps / totalSteps) * 100);
      send({ 
        type: 'progress', 
        data: { 
          phase: 'executing', 
          step: step.id,
          progress: stepProgress, 
          message: `Starting step ${completedSteps + 1}/${totalSteps}: ${step.title}` 
        } 
      });
      
      // Execute step
      const result = await this.executeStep(step, send, checkAbort);
      
      // Store result and update progress
        results.push({ step: step.id, result });
        completedSteps++;
      this.updateExecutionProgress(step, completedSteps, totalSteps, result, send);
    }
    
    return results;
  }
  
  /**
   * Power of 10 Rule 3: Helper to load summarizer prompt from file system
   */
  private loadSummarizerPrompt(): string {
    try {
      const promptPath = getPromptPath('summarizer.system.txt');
      if (!existsSync(promptPath)) {
        throw new Error(`Summarizer prompt file not found: ${promptPath}`);
      }
      const prompt = readFileSync(promptPath, 'utf-8');
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Summarizer prompt file is empty');
      }
      return prompt;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Orchestrator] Error reading summarizer prompt:', error);
      throw new Error(`Failed to load summarizer configuration: ${errorMessage}`);
    }
    }
    
  /**
   * Power of 10 Rule 3: Helper to build summary context from results
   */
  private buildSummaryContext(
    userMessage: string,
    plan: Plan,
    results: Array<{ step: string; result: ToolExecutionResult }>,
    consensus?: { summary?: string }
  ): string {
    let context = `User Question: ${userMessage}\n\n`;
      
      // Add plan results
      if (results && results.length > 0) {
      context += `Execution Results:\n`;
        results.forEach((result) => {
          const step = plan.plan.find(s => s.id === result.step);
          if (step && result.result) {
            const toolName = step.tool || 'unknown';
            if (result.result.ok) {
            context += `- ${toolName}: Success\n`;
            const resultData = result.result.data;
            if (resultData && typeof resultData === 'object' && 'content' in resultData) {
              const content = String(resultData.content);
              context += `  Content: ${content.substring(0, 200)}\n`;
              }
            } else {
            context += `- ${toolName}: Failed - ${result.result.error || 'Unknown error'}\n`;
            }
          }
        });
      context += `\n`;
      }
      
      // Add council consensus if available
    if (consensus && typeof consensus === 'object' && 'summary' in consensus && consensus.summary) {
      context += `Expert Consensus: ${consensus.summary}\n\n`;
      }
    
    return context;
  }
  
  /**
   * Power of 10 Rule 3: Helper to call summarizer model and get response
   */
  private async callSummarizerModel(
    prompt: string,
    context: string,
    conversationHistory: Message[],
    send: EventCallback
  ): Promise<string> {
    const lightweightMode = this.config.lightweightMode || false;
    const summaryMaxTokens = lightweightMode ? 1200 : 2000;
    const summaryTemp = lightweightMode ? 0.1 : 0.15;
    const defaultModel = this.config.defaultModel || this.config.model || 'llama3.1:8b';
    
    send({ type: 'progress', data: { phase: 'summarizing', progress: 60, message: 'Generating response...' } });
    
    try {
      const summary = await this.runModelUnified(
        prompt,
        context,
        {
          provider: this.config.provider || 'ollama',
          model: defaultModel,
          maxTokens: summaryMaxTokens,
          temperature: summaryTemp
        },
        undefined, // No streaming for summarizer (streaming handled in route)
        conversationHistory
      );
      
      if (!summary || typeof summary !== 'string' || summary.trim().length === 0) {
        return 'I apologize, but I encountered an error generating a response. Please try again.';
      }
      
      return summary;
    } catch (summaryError: unknown) {
      const errorMessage = summaryError instanceof Error ? summaryError.message : String(summaryError);
      console.error('[Orchestrator] Summarizer error:', summaryError);
      return `I encountered an error while generating a response: ${errorMessage}. Please try again.`;
    }
  }
  
  /**
   * PHASE 4: SUMMARIZER
   * Synthesizes final answer from plan results
   * Power of 10 Rule 3: Refactored to use focused helper functions (< 60 lines)
   */
  async runSummarizer(
    plan: Plan,
    consensus: unknown,
    results: Array<{ step: string; result: ToolExecutionResult }>,
    userMessage: string,
    conversationHistory: Message[],
    send: EventCallback,
    checkAbort: AbortChecker,
    customContext?: string
  ): Promise<string> {
    checkAbort();
    send({ type: 'status', data: { message: 'Summarizing results...', phase: 'summarizing' } });
    send({ type: 'progress', data: { phase: 'summarizing', progress: 0, message: 'Preparing summary...' } });
    
    // Load prompt
    const summarizerPrompt = this.loadSummarizerPrompt();
    
    // Build context
    const summaryContext = customContext || this.buildSummaryContext(
      userMessage,
      plan,
      results,
      consensus as { summary?: string } | undefined
    );
    
    send({ type: 'progress', data: { phase: 'summarizing', progress: 40, message: 'Building context...' } });
    
    // Call model
    const summary = await this.callSummarizerModel(summarizerPrompt, summaryContext, conversationHistory, send);
    
    send({ type: 'progress', data: { phase: 'summarizing', progress: 90, message: 'Finalizing response...' } });
    
    return summary;
  }
}

