import { z } from 'zod';

/**
 * Base event structure
 */
export const EventBaseSchema = z.object({
  id: z.string(),
  ts: z.number(),
  type: z.string(),
  source: z.string(),
  severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
});

export type EventBase = z.infer<typeof EventBaseSchema>;

/**
 * Domain Events - all event types in Scorpion
 */
export const DomainEventSchema = z.discriminatedUnion('type', [
  // Agent events
  z.object({
    type: z.literal('agent.started'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    agentId: z.string(),
    agentName: z.string(),
  }),
  z.object({
    type: z.literal('agent.stopped'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    agentId: z.string(),
    agentName: z.string(),
  }),
  z.object({
    type: z.literal('agent.error'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    agentId: z.string(),
    agentName: z.string(),
    error: z.string(),
  }),
  
  // Job events
  z.object({
    type: z.literal('job.queued'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    jobId: z.string(),
    queue: z.string(),
  }),
  z.object({
    type: z.literal('job.started'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    jobId: z.string(),
    queue: z.string(),
    worker: z.string(),
  }),
  z.object({
    type: z.literal('job.completed'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    jobId: z.string(),
    queue: z.string(),
    worker: z.string(),
    duration: z.number(),
  }),
  z.object({
    type: z.literal('job.failed'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    jobId: z.string(),
    queue: z.string(),
    worker: z.string(),
    error: z.string(),
  }),
  
  // Workflow events
  z.object({
    type: z.literal('workflow.run.started'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    workflowId: z.string(),
    executionId: z.string(),
  }),
  z.object({
    type: z.literal('workflow.run.completed'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    workflowId: z.string(),
    executionId: z.string(),
    duration: z.number(),
  }),
  z.object({
    type: z.literal('workflow.run.failed'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    workflowId: z.string(),
    executionId: z.string(),
    error: z.string(),
  }),
  
  // Queue events
  z.object({
    type: z.literal('queue.depth'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    queue: z.string(),
    depth: z.number(),
  }),
  
  // HTTP events
  z.object({
    type: z.literal('http.error'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    method: z.string(),
    url: z.string(),
    status: z.number(),
    error: z.string(),
  }),
  
  // System events
  z.object({
    type: z.literal('system.health'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    service: z.string(),
    status: z.enum(['healthy', 'degraded', 'down']),
    uptime: z.number().optional(),
  }),
  
  // Deploy events
  z.object({
    type: z.literal('deploy.marker'),
    id: z.string(),
    ts: z.number(),
    source: z.string(),
    severity: z.enum(['info', 'warn', 'error', 'critical']).optional(),
    version: z.string(),
    environment: z.string(),
  }),
]);

export type DomainEvent = z.infer<typeof DomainEventSchema>;

/**
 * Metrics point for time-series data
 */
export const MetricsPointSchema = z.object({
  ts: z.number(),
  series: z.array(z.object({
    name: z.string(),
    value: z.number(),
    tags: z.record(z.string()).optional(),
  })),
});

export type MetricsPoint = z.infer<typeof MetricsPointSchema>;

/**
 * Graph snapshot for DAG visualization
 */
export const GraphSnapshotSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    kind: z.string(),
    label: z.string(),
    status: z.enum(['idle', 'running', 'success', 'error']),
    stats: z.object({
      total: z.number(),
      success: z.number(),
      error: z.number(),
    }).optional(),
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
    active: z.boolean(),
  })),
});

export type GraphSnapshot = z.infer<typeof GraphSnapshotSchema>;

/**
 * Backpressure metrics (client-side derived)
 */
export const BackpressureSchema = z.object({
  ts: z.number(),
  enqueueRate: z.number(),
  drainRate: z.number(),
  ratio: z.number(),
});

export type Backpressure = z.infer<typeof BackpressureSchema>;

