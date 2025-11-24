/**
 * Phase adapter functions for Job runtime
 * 
 * These functions wrap the existing orchestrator logic
 * to work with the Job model. Each phase can be:
 * - All in one shot (done: true immediately)
 * - Multi-step (done: false, increment phaseStep)
 * 
 * For now, we implement them as "all in one shot" to avoid breaking
 * existing behavior. Later we can refine them into multi-step fibers.
 */

import { Job } from '../runtime/jobTypes';
import { appendJobLog } from '../runtime/jobStore';
import { selectToolsByTags } from '@/lib/orchestrator/tool-registry';
import { userTools } from '@/lib/chat/tools';
import { runScorpionBrain, createContextSnapshot } from './strategyHandler';
import { runCouncilV2 } from './council/v2';
import type { Message } from '@/lib/chat/types';

/**
 * Phase result type
 */
/**
 * Power of 10 Rule 5: Typed phase result
 */
export interface PhaseResult {
  done: boolean;
  contextPatch?: Record<string, unknown>;
  error?: Error;
}

/**
 * PLAN phase: Generate execution plan using consolidated planner
 * Power of 10 Rule 3: ≤ 60 lines per function
 */
export async function runPlanPhaseStep(job: Job): Promise<PhaseResult> {
  // If plan already exists, skip
  if (job.context.plan) {
    appendJobLog(job.id, {
      phase: 'PLAN',
      message: 'Plan already exists, skipping',
    });
    return { done: true };
  }
  
  try {
    const input = job.context.input;
    if (!input || typeof input !== 'string') {
      throw new Error('No input provided for planning');
    }
    
    // MoE Expert Routing - Power of 10 Rule 3: Small helper
    const { routeExperts } = await import('./expertRouter');
    const goalSummary = input.length > 100 ? input.substring(0, 100) + '...' : input;
    const routing = routeExperts({
      phase: 'PLAN',
      goalSummary,
      intentTags: job.context.intent ? [job.context.intent] : undefined,
    });
    
    // Log expert routing for observability
    appendJobLog(job.id, {
      phase: 'PLAN',
      message: `Expert routing: ${routing.selected.map(e => e.id).join(', ')} - ${routing.reason}`,
    });
    
    // Use consolidated planner with full logic
    const { generatePlan, generateSimplePlan } = await import('./planner');
    
    // Check if this is a simple query that can bypass LLM
    const isSimpleQuery = /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no)$/i.test(input.trim());
    
    let planResult;
    if (isSimpleQuery) {
      // Use simple plan for trivial queries
      planResult = { plan: generateSimplePlan(input) };
      appendJobLog(job.id, {
        phase: 'PLAN',
        message: 'Generated simple plan (bypassed LLM for trivial query)',
      });
    } else {
      // Use full planner with LLM - pass expert IDs as metadata
      planResult = await generatePlan({
        objective: input,
        conversationHistory: job.context.messages || [],
        context: {
          sessionId: job.context.sessionId,
          agentId: job.context?.agentId,
          experts: routing.selected.map(e => e.id), // MoE: pass selected experts
        },
        tools: job.context.availableTools || {},
        intent: job.context.intent,
        lightweightMode: job.context.lightweightMode || false,
      });
      
      appendJobLog(job.id, {
        phase: 'PLAN',
        message: `Generated plan with ${planResult.plan.plan.length} steps using ${planResult.provider}/${planResult.modelUsed}`,
      });
    }
    
    // Convert plan to job context format
    const plan = {
      objective: planResult.plan.objective,
      steps: planResult.plan.plan.map((step: { id: string; title: string; tool: string; args?: Record<string, unknown>; dependsOn?: string[]; success?: string }) => ({
        id: step.id,
        title: step.title,
        description: step.description || step.title,
        tool: step.tool,
        args: step.args,
        dependsOn: step.dependsOn,
      })),
      deliverable: planResult.plan.done_when?.[0] || 'Complete response to user query',
      needsCouncil: planResult.plan.needsCouncil || false,
      questionType: planResult.plan.questionType || 'casual',
    };
    
    // Store expert routing in context for observability/brain map
    return {
      done: true,
      contextPatch: { 
        plan,
        expertRouting: {
          phase: 'PLAN',
          experts: routing.selected.map(e => ({
            id: e.id,
            name: e.name,
            tags: e.tags,
          })),
          reason: routing.reason,
        },
      },
    };
  } catch (error: unknown) {
    console.error('[JobPhases] Planner error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    appendJobLog(job.id, {
      phase: 'PLAN',
      message: `Error: ${errorMessage}`,
    });
    
    // Fallback to simple plan on error
    const { generateSimplePlan } = await import('./planner');
    return {
      done: true, // Mark done even on error to continue
      contextPatch: {
        plan: {
          objective: job.context.input || 'Unknown',
          steps: [{
            id: 's1',
            title: job.context.input || 'Respond to user',
            description: job.context.input || 'Respond to user',
            tool: 'none',
          }],
          deliverable: 'Complete response to user query',
          needsCouncil: false,
          questionType: 'casual',
          error: error instanceof Error ? error.message : String(error),
        },
      },
    };
  }
}

/**
 * COUNCIL phase: Expert review
 */
export async function runCouncilPhaseStep(job: Job): Promise<PhaseResult> {
  // If council result already exists, skip
  if (job.context.councilResult) {
    appendJobLog(job.id, {
      phase: 'COUNCIL',
      message: 'Council result already exists, skipping',
    });
    return { done: true };
  }
  
  const plan = job.context.plan;
  const needsCouncil = plan?.steps?.length > 1;
  
  if (!needsCouncil) {
    appendJobLog(job.id, {
      phase: 'COUNCIL',
      message: 'Skipped: single-step objective',
    });
    return {
      done: true,
      contextPatch: {
        councilResult: {
          approved: true,
          score: 10,
          summary: plan?.objective || job.context.input || '',
        },
      },
    };
  }
  
  try {
    const input = job.context.input;
    const planText = Array.isArray(plan?.steps)
      ? plan.steps.join('\n')
      : String(plan?.objective || input || '');
    
    // MoE Expert Routing for COUNCIL - Power of 10 Rule 3: Small helper
    const { routeExperts } = await import('./expertRouter');
    const goalSummary = planText.length > 100 ? planText.substring(0, 100) + '...' : planText;
    const councilRouting = routeExperts({
      phase: 'COUNCIL',
      goalSummary,
      intentTags: job.context.intent ? [job.context.intent] : undefined,
    });
    
    // Log expert routing for observability
    appendJobLog(job.id, {
      phase: 'COUNCIL',
      message: `Expert routing: ${councilRouting.selected.map(e => e.id).join(', ')} - ${councilRouting.reason}`,
    });
    
    // Build canonical council question
    const question = {
      id: job.id,
      text: input as string || '',
      context: {
        plan: plan,
        planSummary: planText,
        previousTools: job.context.selectedTools || [],
        sessionId: job.context.sessionId,
        agentId: job.context.agentId,
        conversationHistory: job.context.messages || [],
        knowledgeHits: job.context.knowledgeHits || [],
        experts: councilRouting.selected.map(e => e.id), // MoE: pass selected experts
      },
    };
    
    // Call canonical council v2
    const councilResult = await runCouncilV2(question);
    
    appendJobLog(job.id, {
      phase: 'COUNCIL',
      message: `Council completed: ${councilResult.approved ? 'approved' : 'revised'} (${councilResult.votes.length} votes)`,
    });
    
    // Store expert routing in context for observability/brain map
    return {
      done: true,
      contextPatch: { 
        councilResult,
        expertRouting: {
          phase: 'COUNCIL',
          experts: councilRouting.selected.map(e => ({
            id: e.id,
            name: e.name,
            tags: e.tags,
          })),
          reason: councilRouting.reason,
        },
      },
    };
  } catch (error: unknown) {
    appendJobLog(job.id, {
      phase: 'COUNCIL',
      message: `Council unavailable: ${error instanceof Error ? error.message : String(error)}`,
    });
    // Proceed with plan even if council fails
    return {
      done: true,
      contextPatch: {
        councilResult: {
          approved: true,
          score: 8,
          summary: plan?.objective || job.context.input || '',
        },
      },
    };
  }
}

/**
 * TOOL_SELECT phase: Select tools by tags
 */
export async function runToolSelectPhaseStep(job: Job): Promise<PhaseResult> {
  // If tools already selected, skip
  if (job.context.selectedTools && job.context.selectedTools.length > 0) {
    appendJobLog(job.id, {
      phase: 'TOOL_SELECT',
      message: 'Tools already selected, skipping',
    });
    return { done: true };
  }
  
  try {
    const objective = job.context.plan?.objective || job.context.input || '';
    
    const selection = selectToolsByTags(objective);
    
    appendJobLog(job.id, {
      phase: 'TOOL_SELECT',
      message: `Selected ${selection.tools.length} tools: ${selection.tools.join(', ')}`,
    });
    
    return {
      done: true,
      contextPatch: {
        selectedTools: selection.tools,
        toolRationale: selection.rationale,
        toolMatchedCount: selection.matchedCount,
        toolInstalledCount: selection.installedCount,
      },
    };
  } catch (error: unknown) {
    appendJobLog(job.id, {
      phase: 'TOOL_SELECT',
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
    return {
      done: true,
      contextPatch: { selectedTools: [] },
    };
  }
}

/**
 * KNOWLEDGE phase: Search knowledge base
 */
export async function runKnowledgePhaseStep(job: Job): Promise<PhaseResult> {
  // If knowledge hits already exist, skip
  if (job.context.knowledgeHits) {
    appendJobLog(job.id, {
      phase: 'KNOWLEDGE',
      message: 'Knowledge search already completed, skipping',
    });
    return { done: true };
  }
  
  try {
    const query = job.context.plan?.objective || job.context.input || '';
    
    // For now, return empty hits
    // Later we can integrate with actual KB search
    const hits: Array<{ id: string; snippet: string; source: string; [key: string]: unknown }> = [];
    
    appendJobLog(job.id, {
      phase: 'KNOWLEDGE',
      message: hits.length > 0
        ? `Found ${hits.length} knowledge base hits`
        : 'No knowledge base hits found',
    });
    
    return {
      done: true,
      contextPatch: { knowledgeHits: hits },
    };
  } catch (error: unknown) {
    appendJobLog(job.id, {
      phase: 'KNOWLEDGE',
      message: `KB search error: ${error?.message || String(error)}`,
    });
    return {
      done: true,
      contextPatch: { knowledgeHits: [] },
    };
  }
}

/**
 * USER_TOOLS phase: Enumerate user tools
 */
export async function runUserToolsPhaseStep(job: Job): Promise<PhaseResult> {
  // If user tools already enumerated, skip
  if (job.context.userTools) {
    appendJobLog(job.id, {
      phase: 'USER_TOOLS',
      message: 'User tools already enumerated, skipping',
    });
    return { done: true };
  }
  
  try {
    const userToolNames = userTools.listNames();
    
    appendJobLog(job.id, {
      phase: 'USER_TOOLS',
      message: `Found ${userToolNames.length} user tools`,
    });
    
    return {
      done: true,
      contextPatch: { userTools: userToolNames },
    };
  } catch (error: unknown) {
    appendJobLog(job.id, {
      phase: 'USER_TOOLS',
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
    return {
      done: true,
      contextPatch: { userTools: [] },
    };
  }
}

/**
 * EXECUTE phase: Execute selected tools
 * 
 * This is where we can make it truly multi-step later:
 * - Step 0: Prepare execution
 * - Step 1: Call first tool
 * - Step 2: Call second tool (if needed)
 * - Step 3: Aggregate results
 * - Step 4: Synthesize final answer
 */
export async function runExecutePhaseStep(job: Job): Promise<PhaseResult> {
  const step = job.phaseStep;
  const execution = job.context.execution;
  
  // Step 0: Initialize execution
  if (step === 0) {
    const selectedTools = job.context.selectedTools || [];
    
    appendJobLog(job.id, {
      phase: 'EXECUTE',
      message: `Preparing execution with ${selectedTools.length} tools`,
    });
    
    return {
      done: false, // Not done yet, continue to next step
      contextPatch: {
        execution: {
          step: 0,
          selectedTools,
          toolResults: [],
          startedAt: new Date().toISOString(),
        },
      },
    };
  }
  
  // Step 1+: Execute tools
  if (!execution) {
    // Should not happen, but handle gracefully
    return {
      done: true,
      contextPatch: {
        output: 'Execution not properly initialized',
      },
    };
  }
  
  const tools = execution.selectedTools || [];
  const toolResults = execution.toolResults || [];
  
  // If we have tools to execute and haven't executed them all
  if (toolResults.length < tools.length) {
    const toolName = tools[toolResults.length];
    
    appendJobLog(job.id, {
      phase: 'EXECUTE',
      message: `Executing tool: ${toolName}`,
    });
    
    // For now, create a placeholder result
    // Later we can actually call the tool
    const result = {
      tool: toolName,
      ok: true,
      summary: `Tool ${toolName} executed (placeholder)`,
      data: {},
    };
    
    return {
      done: false, // Continue to next tool
      contextPatch: {
        execution: {
          ...execution,
          toolResults: [...toolResults, result],
        },
      },
    };
  }
  
  // All tools executed, synthesize final answer
  appendJobLog(job.id, {
    phase: 'EXECUTE',
    message: 'All tools executed, synthesizing final answer',
  });
  
  const finalAnswer = `Completed execution with ${toolResults.length} tools. Results: ${toolResults.map(r => r.summary).join('; ')}`;
  
  return {
    done: true, // EXECUTE phase completes here
    contextPatch: {
      output: finalAnswer,
      execution: {
        ...execution,
        finishedAt: new Date().toISOString(),
      },
    },
  };
}

