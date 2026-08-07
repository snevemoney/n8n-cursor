import { NextRequest, NextResponse } from 'next/server';
import { telemetry } from '@/lib/telemetry/emitter';
import { v4 as uuidv4 } from 'uuid';
import { createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * POST /api/telemetry/trigger
 * 
 * Trigger health checks and generate sample telemetry events
 * Useful for testing and populating the observability dashboard
 */
export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json().catch(() => ({ type: 'all' }));
    
    const results: string[] = [];
    
    // Trigger health checks
    if (type === 'all' || type === 'health') {
      try {
        // Call health endpoint to trigger health checks
        const healthUrl = new URL('/api/health', req.url);
        await fetch(healthUrl.toString());
        results.push('Health checks triggered');
      } catch (err: any) {
        results.push(`Health check error: ${err.message}`);
      }
    }
    
    // Generate sample agent events
    if (type === 'all' || type === 'agents') {
      const agentIds = ['agent-1', 'agent-2', 'agent-3'];
      const agentNames = ['Research Agent', 'Workflow Agent', 'Analysis Agent'];
      
      for (let i = 0; i < agentIds.length; i++) {
        telemetry.agentStarted(agentIds[i], agentNames[i]);
        
        // Generate some operations
        for (let j = 0; j < 3; j++) {
          const operationId = uuidv4();
          const duration = Math.random() * 2000 + 500; // 500-2500ms
          const success = Math.random() > 0.1; // 90% success rate
          
          if (success) {
            telemetry.agentOperationCompleted(
              agentIds[i],
              operationId,
              `operation-${j + 1}`,
              duration
            );
          } else {
            telemetry.agentOperationFailed(
              agentIds[i],
              operationId,
              `operation-${j + 1}`,
              'Simulated error',
              duration
            );
          }
        }
      }
      results.push(`Generated events for ${agentIds.length} agents`);
    }
    
    // Generate sample job/queue events
    if (type === 'all' || type === 'jobs') {
      const queues = ['default', 'priority', 'background'];
      
      for (const queue of queues) {
        // Generate queued jobs
        for (let i = 0; i < 5; i++) {
          const jobId = uuidv4();
          telemetry.jobQueued(jobId, queue);
          
          // Simulate job processing
          setTimeout(() => {
            const worker = `worker-${Math.floor(Math.random() * 3) + 1}`;
            telemetry.jobStarted(jobId, queue, worker);
            
            setTimeout(() => {
              const success = Math.random() > 0.15; // 85% success rate
              const duration = Math.random() * 3000 + 1000; // 1-4 seconds
              
              if (success) {
                telemetry.jobCompleted(jobId, queue, worker, duration);
              } else {
                telemetry.jobFailed(jobId, queue, worker, 'Simulated job failure');
              }
            }, Math.random() * 2000 + 500);
          }, Math.random() * 1000);
        }
      }
      results.push(`Generated events for ${queues.length} queues`);
    }
    
    // Generate sample workflow events
    if (type === 'all' || type === 'workflows') {
      const workflowIds = ['workflow-1', 'workflow-2'];
      
      for (const workflowId of workflowIds) {
        const executionId = uuidv4();
        telemetry.workflowRunStarted(workflowId, executionId);
        
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% success rate
          const duration = Math.random() * 5000 + 2000; // 2-7 seconds
          
          if (success) {
            telemetry.workflowRunCompleted(workflowId, executionId, duration);
          } else {
            telemetry.workflowRunFailed(workflowId, executionId, 'Simulated workflow error');
          }
        }, Math.random() * 3000 + 1000);
      }
      results.push(`Generated events for ${workflowIds.length} workflows`);
    }
    
    // Generate sample system logs
    if (type === 'all' || type === 'logs') {
      const logLevels: Array<'info' | 'warn' | 'error' | 'critical'> = ['info', 'warn', 'error', 'critical'];
      const sources = ['api', 'worker', 'scheduler', 'database'];
      const messages = [
        'Processing request',
        'Cache miss detected',
        'Database connection established',
        'Task completed successfully',
        'Warning: High memory usage',
        'Error: Connection timeout',
        'Critical: Service unavailable',
      ];
      
      for (let i = 0; i < 10; i++) {
        const level = logLevels[Math.floor(Math.random() * logLevels.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        telemetry.systemLog(level, message, source);
      }
      results.push('Generated 10 log events');
    }
    
    return createSuccessResponse({
      message: 'Telemetry events triggered',
      results,
    });
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      error.message || 'Failed to trigger telemetry events',
      undefined,
      500
    );
  }
}

