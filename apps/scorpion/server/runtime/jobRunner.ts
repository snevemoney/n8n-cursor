/**
 * Cooperative Job Runner (Fiber-like scheduler)
 * 
 * Advances jobs one phase/step at a time, yielding control between steps.
 * This enables:
 * - Multiple jobs to interleave
 * - Long-running work doesn't freeze everything
 * - Jobs can be paused and resumed
 * - Better visibility and control
 */

import { Job, JobPhase } from './jobTypes';
import { getJob, updateJob, appendJobLog } from './jobStore';
import {
  runPlanPhaseStep,
  runCouncilPhaseStep,
  runToolSelectPhaseStep,
  runKnowledgePhaseStep,
  runUserToolsPhaseStep,
  runExecutePhaseStep,
} from '../orchestrator/jobPhases';

const PHASE_ORDER: JobPhase[] = [
  'PLAN',
  'COUNCIL',
  'TOOL_SELECT',
  'KNOWLEDGE',
  'USER_TOOLS',
  'EXECUTE',
];

/**
 * Run one tick of a job (advance one step)
 * 
 * This is the "cooperative fiber" - one call = one slice of work
 * Can be called:
 * - per HTTP request
 * - from a cron/interval
 * - from a queue worker
 */
export async function runJobTick(jobId: string): Promise<Job | undefined> {
  const job = getJob(jobId);
  if (!job) {
    console.warn(`[JobRunner] Job ${jobId} not found`);
    return undefined;
  }
  
  // Don't advance completed/failed/paused jobs
  if (job.status === 'completed' || job.status === 'failed' || job.status === 'paused') {
    return job;
  }
  
  // Initialize phase if not set
  if (!job.currentPhase) {
    const updated = updateJob(job.id, {
      currentPhase: PHASE_ORDER[0],
      phaseStep: 0,
      status: 'running',
    });
    appendJobLog(job.id, {
      phase: 'system',
      message: `Job started, beginning phase: ${PHASE_ORDER[0]}`,
    });
    return updated;
  }
  
  // Log that we're running this phase + step
  appendJobLog(job.id, {
    phase: job.currentPhase,
    message: `Running phase ${job.currentPhase}, step ${job.phaseStep}`,
  });
  
  // Run the appropriate phase step
  let phaseResult: { done: boolean; contextPatch?: Record<string, any>; error?: Error } = {
    done: false,
  };
  
  try {
    switch (job.currentPhase) {
      case 'PLAN':
        phaseResult = await runPlanPhaseStep(job);
        break;
      case 'COUNCIL':
        phaseResult = await runCouncilPhaseStep(job);
        break;
      case 'TOOL_SELECT':
        phaseResult = await runToolSelectPhaseStep(job);
        break;
      case 'KNOWLEDGE':
        phaseResult = await runKnowledgePhaseStep(job);
        break;
      case 'USER_TOOLS':
        phaseResult = await runUserToolsPhaseStep(job);
        break;
      case 'EXECUTE':
        phaseResult = await runExecutePhaseStep(job);
        break;
      default:
        appendJobLog(job.id, {
          phase: 'system',
          message: `Unknown phase: ${job.currentPhase}`,
        });
        return updateJob(job.id, { status: 'failed' });
    }
  } catch (error: any) {
    console.error(`[JobRunner] Error in phase ${job.currentPhase}:`, error);
    appendJobLog(job.id, {
      phase: job.currentPhase,
      message: `Error: ${error?.message || String(error)}`,
    });
    return updateJob(job.id, {
      status: 'failed',
      context: {
        ...job.context,
        error: {
          phase: job.currentPhase,
          step: job.phaseStep,
          message: error?.message || String(error),
        },
      },
    });
  }
  
  // Apply context patch if any
  let updated = job;
  if (phaseResult.contextPatch) {
    updated = updateJob(job.id, {
      context: {
        ...job.context,
        ...phaseResult.contextPatch,
      },
    })!;
  }
  
  // If phase is done, move to next phase
  if (phaseResult.done) {
    const currentIndex = PHASE_ORDER.indexOf(updated.currentPhase!);
    const nextPhase = PHASE_ORDER[currentIndex + 1];
    
    if (nextPhase) {
      updated = updateJob(updated.id, {
        currentPhase: nextPhase,
        phaseStep: 0,
        status: 'running',
      })!;
      appendJobLog(updated.id, {
        phase: 'system',
        message: `Phase ${updated.currentPhase} completed, advancing to: ${nextPhase}`,
      });
    } else {
      // All phases completed
      updated = updateJob(updated.id, {
        status: 'completed',
      })!;
      appendJobLog(updated.id, {
        phase: 'system',
        message: 'Job completed successfully.',
      });
    }
  } else {
    // Same phase, next internal step
    updated = updateJob(updated.id, {
      phaseStep: updated.phaseStep + 1,
      status: 'running',
    })!;
  }
  
  return updated;
}

/**
 * Run a job until completion or timeout
 * 
 * Useful for running a job synchronously with a time budget
 */
export async function runJobUntilComplete(
  jobId: string,
  options: {
    maxTicks?: number;
    timeBudgetMs?: number;
    onTick?: (job: Job) => void;
  } = {},
): Promise<Job | undefined> {
  const { maxTicks = 100, timeBudgetMs = 5000, onTick } = options;
  const startTime = Date.now();
  let ticks = 0;
  
  while (ticks < maxTicks) {
    const elapsed = Date.now() - startTime;
    if (elapsed > timeBudgetMs) {
      appendJobLog(jobId, {
        phase: 'system',
        message: `Time budget exceeded (${timeBudgetMs}ms), pausing job`,
      });
      updateJob(jobId, { status: 'paused' });
      break;
    }
    
    const job = await runJobTick(jobId);
    if (!job) break;
    
    if (onTick) {
      onTick(job);
    }
    
    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }
    
    ticks++;
  }
  
  return getJob(jobId);
}

