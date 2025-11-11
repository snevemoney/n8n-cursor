import { v4 as uuidv4 } from 'uuid';
import { DomainEvent, DomainEventSchema, MetricsPoint, MetricsPointSchema } from './schema';
import { getTelemetryBus } from './bus';

/**
 * Helper to emit domain events with validation
 */
export function emitEvent(event: Omit<DomainEvent, 'id' | 'ts'>): void {
  const fullEvent = {
    ...event,
    id: uuidv4(),
    ts: Date.now(),
  } as DomainEvent;
  
  // Validate at the edge
  try {
    const validated = DomainEventSchema.parse(fullEvent);
    const bus = getTelemetryBus();
    const listenerCount = bus.listenerCount('event');
    if (listenerCount === 0) {
      console.warn(`[TelemetryEmitter] No listeners for event: ${event.type}. Event will be lost.`);
    }
    bus.emitEvent(validated);
  } catch (error) {
    console.error('[TelemetryEmitter] Invalid event:', error);
    console.error('[TelemetryEmitter] Event was:', JSON.stringify(fullEvent, null, 2));
  }
}

/**
 * Helper to emit metrics with validation
 */
export function emitMetric(metrics: Omit<MetricsPoint, 'ts'>): void {
  const fullMetrics = {
    ...metrics,
    ts: Date.now(),
  };
  
  try {
    const validated = MetricsPointSchema.parse(fullMetrics);
    const bus = getTelemetryBus();
    bus.emitMetrics(validated);
  } catch (error) {
    console.error('[TelemetryEmitter] Invalid metrics:', error);
    console.error('[TelemetryEmitter] Metrics was:', fullMetrics);
  }
}

/**
 * Convenience functions for common events
 */
export const telemetry = {
  agentStarted(agentId: string, agentName: string): void {
    emitEvent({
      type: 'agent.started',
      source: 'scorpion-core',
      agentId,
      agentName,
      severity: 'info',
    });
  },
  
  agentStopped(agentId: string, agentName: string): void {
    emitEvent({
      type: 'agent.stopped',
      source: 'scorpion-core',
      agentId,
      agentName,
      severity: 'info',
    });
  },
  
  agentError(agentId: string, agentName: string, error: string): void {
    emitEvent({
      type: 'agent.error',
      source: 'scorpion-core',
      agentId,
      agentName,
      error,
      severity: 'error',
    });
  },
  
  jobQueued(jobId: string, queue: string): void {
    emitEvent({
      type: 'job.queued',
      source: 'scorpion-core',
      jobId,
      queue,
      severity: 'info',
    });
  },
  
  jobStarted(jobId: string, queue: string, worker: string): void {
    emitEvent({
      type: 'job.started',
      source: 'scorpion-core',
      jobId,
      queue,
      worker,
      severity: 'info',
    });
  },
  
  jobCompleted(jobId: string, queue: string, worker: string, duration: number): void {
    emitEvent({
      type: 'job.completed',
      source: 'scorpion-core',
      jobId,
      queue,
      worker,
      duration,
      severity: 'info',
    });
  },
  
  jobFailed(jobId: string, queue: string, worker: string, error: string): void {
    emitEvent({
      type: 'job.failed',
      source: 'scorpion-core',
      jobId,
      queue,
      worker,
      error,
      severity: 'error',
    });
  },
  
  workflowRunStarted(workflowId: string, executionId: string): void {
    emitEvent({
      type: 'workflow.run.started',
      source: 'n8n-integration',
      workflowId,
      executionId,
      severity: 'info',
    });
  },
  
  workflowRunCompleted(workflowId: string, executionId: string, duration: number): void {
    emitEvent({
      type: 'workflow.run.completed',
      source: 'n8n-integration',
      workflowId,
      executionId,
      duration,
      severity: 'info',
    });
  },
  
  workflowRunFailed(workflowId: string, executionId: string, error: string): void {
    emitEvent({
      type: 'workflow.run.failed',
      source: 'n8n-integration',
      workflowId,
      executionId,
      error,
      severity: 'error',
    });
  },
  
  queueDepth(queue: string, depth: number): void {
    emitEvent({
      type: 'queue.depth',
      source: 'scorpion-core',
      queue,
      depth,
      severity: depth > 100 ? 'warn' : 'info',
    });
  },
  
  httpError(method: string, url: string, status: number, error: string): void {
    emitEvent({
      type: 'http.error',
      source: 'http-client',
      method,
      url,
      status,
      error,
      severity: status >= 500 ? 'error' : 'warn',
    });
  },
  
  systemHealth(service: string, status: 'healthy' | 'degraded' | 'down', uptime?: number): void {
    emitEvent({
      type: 'system.health',
      source: 'health-check',
      service,
      status,
      uptime,
      severity: status === 'down' ? 'critical' : status === 'degraded' ? 'warn' : 'info',
    });
  },
  
  deployMarker(version: string, environment: string): void {
    emitEvent({
      type: 'deploy.marker',
      source: 'deployment',
      version,
      environment,
      severity: 'info',
    });
  },
  
  systemLog(level: 'info' | 'warn' | 'error' | 'critical', message: string, source: string = 'system', context?: Record<string, any>): void {
    emitEvent({
      type: 'system.log',
      source,
      level,
      message,
      context,
      severity: level,
    });
  },
  
  agentOperationCompleted(agentId: string, operationId: string, operationName: string, duration: number): void {
    emitEvent({
      type: 'agent.operation.completed',
      source: 'scorpion-core',
      agentId,
      operationId,
      operationName,
      duration,
      severity: 'info',
    });
  },
  
  agentOperationFailed(agentId: string, operationId: string, operationName: string, error: string, duration?: number): void {
    emitEvent({
      type: 'agent.operation.failed',
      source: 'scorpion-core',
      agentId,
      operationId,
      operationName,
      error,
      duration,
      severity: 'error',
    });
  },
};

