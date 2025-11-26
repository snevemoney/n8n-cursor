/**
 * Enhanced Orchestrator with Transformer Features
 * 
 * Adds positional encoding and residual connections to the pipeline,
 * making it more transformer-like while preserving existing functionality.
 * 
 * Power of 10 Rule 3: Functions ≤ 60 lines
 */

import type { OrchestratorContext } from '@scorpion/core/orchestration';
import { 
  createPositionalContext, 
  addPositionalEncoding,
  getPhaseEncoding 
} from './positional-encoding';

export interface EnhancedContext extends OrchestratorContext {
  positionalEncoding?: number[];
  position?: number;
  phase?: string;
  residualContext?: Record<string, unknown>; // Preserved context from previous phases
}

/**
 * Add residual connection - preserve context through phases
 * Like transformer residual connections that preserve information
 */
export function addResidualConnection(
  currentContext: EnhancedContext,
  previousContext: Partial<EnhancedContext>
): EnhancedContext {
  return {
    ...currentContext,
    residualContext: {
      ...previousContext.residualContext,
      ...previousContext,
      // Preserve key information from previous phases
      previousPlan: previousContext.plan,
      previousConsensus: previousContext.consensus,
      previousResults: previousContext.results,
    },
  };
}

/**
 * Enhanced pipeline with positional encoding and residuals
 * Proxies all base orchestrator methods while adding transformer features
 */
export class EnhancedOrchestrator {
  private baseOrchestrator: any; // The original orchestrator
  private phaseContext: Map<string, EnhancedContext> = new Map();
  
  constructor(baseOrchestrator: any) {
    this.baseOrchestrator = baseOrchestrator;
    
    // Proxy all methods from base orchestrator
    const baseMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(baseOrchestrator));
    for (const methodName of baseMethods) {
      if (methodName !== 'constructor' && typeof baseOrchestrator[methodName] === 'function') {
        (this as any)[methodName] = (...args: any[]) => {
          return baseOrchestrator[methodName].apply(baseOrchestrator, args);
        };
      }
    }
    
    // Copy all properties
    for (const prop in baseOrchestrator) {
      if (baseOrchestrator.hasOwnProperty(prop)) {
        (this as any)[prop] = baseOrchestrator[prop];
      }
    }
  }
  
  /**
   * Enhanced runPlanner with positional encoding
   */
  async runPlanner(
    userMessage: string,
    conversationHistory: any[],
    intent: any,
    send: any,
    checkAbort: () => void,
    tools: Record<string, unknown>,
    tracker?: unknown,
    plannerPrompt?: string
  ): Promise<any> {
    const positionalContext = createPositionalContext(0, 4, 'PLAN');
    const enhancedContext = addPositionalEncoding(
      { userMessage, conversationHistory, intent },
      positionalContext
    ) as EnhancedContext;
    enhancedContext.phase = 'PLAN';
    enhancedContext.position = 0;
    this.phaseContext.set('PLAN', enhancedContext);
    
    return this.baseOrchestrator.runPlanner(
      userMessage,
      conversationHistory,
      intent,
      send,
      checkAbort,
      tools,
      tracker,
      plannerPrompt
    );
  }
  
  /**
   * Enhanced runCouncil with positional encoding and residual connection
   */
  async runCouncil(
    plan: any,
    userMessage: string,
    send: any,
    checkAbort: () => void,
    knowledgeHits?: any[]
  ): Promise<any> {
    const planContext = this.phaseContext.get('PLAN');
    const positionalContext = createPositionalContext(1, 4, 'COUNCIL');
    let enhancedContext = addPositionalEncoding(
      { userMessage, plan },
      positionalContext
    ) as EnhancedContext;
    enhancedContext.phase = 'COUNCIL';
    enhancedContext.position = 1;
    
    // Add residual connection from PLAN phase
    if (planContext) {
      enhancedContext = addResidualConnection(enhancedContext, planContext);
    }
    this.phaseContext.set('COUNCIL', enhancedContext);
    
    return this.baseOrchestrator.runCouncil(plan, userMessage, send, checkAbort, knowledgeHits);
  }
  
  /**
   * Enhanced runExecutor with positional encoding and residual connection
   */
  async runExecutor(
    plan: any,
    intent: any,
    userMessage: string,
    send: any,
    checkAbort: () => void
  ): Promise<any> {
    const councilContext = this.phaseContext.get('COUNCIL') || this.phaseContext.get('PLAN');
    const positionalContext = createPositionalContext(2, 4, 'EXECUTE');
    let enhancedContext = addPositionalEncoding(
      { userMessage, plan, intent },
      positionalContext
    ) as EnhancedContext;
    enhancedContext.phase = 'EXECUTE';
    enhancedContext.position = 2;
    
    // Add residual connection from previous phases
    if (councilContext) {
      enhancedContext = addResidualConnection(enhancedContext, councilContext);
    }
    this.phaseContext.set('EXECUTE', enhancedContext);
    
    return this.baseOrchestrator.runExecutor(plan, intent, userMessage, send, checkAbort);
  }
  
  /**
   * Enhanced runSummarizer with positional encoding and residual connection
   */
  async runSummarizer(
    plan: any,
    consensus: any,
    results: any,
    userMessage: string,
    conversationHistory: any[],
    send: any,
    checkAbort: () => void
  ): Promise<string> {
    const executeContext = this.phaseContext.get('EXECUTE') || this.phaseContext.get('COUNCIL') || this.phaseContext.get('PLAN');
    const positionalContext = createPositionalContext(3, 4, 'SUMMARIZE');
    let enhancedContext = addPositionalEncoding(
      { userMessage, plan, consensus, results },
      positionalContext
    ) as EnhancedContext;
    enhancedContext.phase = 'SUMMARIZE';
    enhancedContext.position = 3;
    
    // Add residual connection from all previous phases
    if (executeContext) {
      enhancedContext = addResidualConnection(enhancedContext, executeContext);
    }
    this.phaseContext.set('SUMMARIZE', enhancedContext);
    
    return this.baseOrchestrator.runSummarizer(
      plan,
      consensus,
      results,
      userMessage,
      conversationHistory,
      send,
      checkAbort
    );
  }
  
  /**
   * Run enhanced pipeline with positional encoding
   */
  async handleChat(
    userMessage: string,
    conversationHistory: any[],
    send: (event: { type: string; data: unknown }) => void,
    checkAbort: () => void,
    tools: Record<string, unknown>,
    tracker?: unknown
  ): Promise<EnhancedContext> {
    const phases = ['PLAN', 'COUNCIL', 'EXECUTE', 'SUMMARIZE'];
    let context: EnhancedContext = {
      userMessage,
      conversationHistory,
      intent: this.baseOrchestrator.classifyIntent(userMessage),
    };
    
    // Run each phase with positional encoding and residual connections
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      
      // Add positional encoding
      const positionalContext = createPositionalContext(
        i,
        phases.length,
        phase
      );
      
      context = addPositionalEncoding(context, positionalContext) as EnhancedContext;
      context.phase = phase;
      context.position = i;
      
      // Add residual connection (preserve previous context)
      if (i > 0) {
        context = addResidualConnection(context, context);
      }
      
      // Run phase
      switch (phase) {
        case 'PLAN':
          context.plan = await this.runPlanner(
            userMessage,
            conversationHistory,
            context.intent,
            send,
            checkAbort,
            tools,
            tracker
          );
          break;
          
        case 'COUNCIL':
          if (context.plan?.needsCouncil) {
            context.consensus = await this.runCouncil(
              context.plan,
              userMessage,
              send,
              checkAbort
            );
          }
          break;
          
        case 'EXECUTE':
          context.results = await this.runExecutor(
            context.plan!,
            context.intent,
            userMessage,
            send,
            checkAbort
          );
          break;
          
        case 'SUMMARIZE':
          context.finalSummary = await this.runSummarizer(
            context.plan!,
            context.consensus,
            context.results,
            userMessage,
            conversationHistory,
            send,
            checkAbort
          );
          break;
      }
    }
    
    return context;
  }
}

