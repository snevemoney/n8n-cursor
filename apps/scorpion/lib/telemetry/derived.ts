import type { DomainEvent } from './schema';

/**
 * Derived metrics computations from raw telemetry events
 */

export interface BackpressureMetrics {
  ratio: number;
  enqueueRate: number;
  drainRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AgentKPI {
  agentId: string;
  agentName: string;
  successCount: number;
  errorCount: number;
  successRate: number;
  lastSeen: number;
}

/**
 * Compute backpressure from queue events
 */
export function computeBackpressure(events: DomainEvent[]): BackpressureMetrics {
  const now = Date.now();
  const window = 60000; // Last 60 seconds
  const recentEvents = events.filter(e => e.ts > now - window);
  
  // Count enqueue and dequeue events
  let enqueues = 0;
  let dequeues = 0;
  
  recentEvents.forEach(event => {
    if (event.type === 'job.queued') {
      enqueues++;
    } else if (event.type === 'job.completed' || event.type === 'job.failed') {
      dequeues++;
    }
  });
  
  // Calculate rates (per second)
  const enqueueRate = enqueues / (window / 1000);
  const drainRate = dequeues / (window / 1000);
  
  // Calculate ratio (0 = perfect drain, >1 = backpressure)
  const ratio = drainRate > 0 ? enqueueRate / drainRate : enqueueRate > 0 ? Infinity : 0;
  
  // Determine trend by comparing first half vs second half of window
  const midpoint = now - (window / 2);
  const firstHalf = recentEvents.filter(e => e.ts < midpoint);
  const secondHalf = recentEvents.filter(e => e.ts >= midpoint);
  
  const firstEnqueues = firstHalf.filter(e => e.type === 'job.queued').length;
  const secondEnqueues = secondHalf.filter(e => e.type === 'job.queued').length;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (secondEnqueues > firstEnqueues * 1.2) {
    trend = 'up';
  } else if (secondEnqueues < firstEnqueues * 0.8) {
    trend = 'down';
  }
  
  return {
    ratio: isFinite(ratio) ? ratio : 0,
    enqueueRate,
    drainRate,
    trend,
  };
}

/**
 * Compute per-agent KPIs
 */
export function computeAgentKPIs(events: DomainEvent[]): AgentKPI[] {
  const agentStats = new Map<string, {
    name: string;
    successes: number;
    errors: number;
    lastSeen: number;
  }>();
  
  // First pass: collect agent names from agent.started events
  events.forEach(event => {
    if (event.type === 'agent.started') {
      const agentId = 'agentId' in event ? String(event.agentId) : 'unknown';
      const agentName = 'agentName' in event ? String(event.agentName) : agentId;
      
      if (!agentStats.has(agentId)) {
        agentStats.set(agentId, {
          name: agentName,
          successes: 0,
          errors: 0,
          lastSeen: event.ts,
        });
      } else {
        // Update name if we see it again
        const stats = agentStats.get(agentId)!;
        stats.name = agentName;
        stats.lastSeen = Math.max(stats.lastSeen, event.ts);
      }
    }
  });
  
  // Second pass: count operations
  events.forEach(event => {
    if (event.type === 'agent.operation.completed' || event.type === 'agent.operation.failed') {
      const agentId = 'agentId' in event ? String(event.agentId) : 'unknown';
      
      if (!agentStats.has(agentId)) {
        // If we haven't seen agent.started, use agentId as name
        agentStats.set(agentId, {
          name: agentId,
          successes: 0,
          errors: 0,
          lastSeen: event.ts,
        });
      }
      
      const stats = agentStats.get(agentId)!;
      
      if (event.type === 'agent.operation.completed') {
        stats.successes++;
      } else {
        stats.errors++;
      }
      
      stats.lastSeen = Math.max(stats.lastSeen, event.ts);
    }
  });
  
  return Array.from(agentStats.entries()).map(([agentId, stats]) => {
    const total = stats.successes + stats.errors;
    return {
      agentId,
      agentName: stats.name,
      successCount: stats.successes,
      errorCount: stats.errors,
      successRate: total > 0 ? stats.successes / total : 0,
      lastSeen: stats.lastSeen,
    };
  });
}

/**
 * Compute queue depth over time
 */
export function computeQueueDepth(events: DomainEvent[], queueId: string): number[] {
  let depth = 0;
  const depths: number[] = [];
  
  events
    .filter(e => 
      (e.type === 'job.queued' || e.type === 'job.completed' || e.type === 'job.failed') &&
      'queue' in e && e.queue === queueId
    )
    .forEach(event => {
      if (event.type === 'job.queued') {
        depth++;
      } else if (event.type === 'job.completed' || event.type === 'job.failed') {
        depth = Math.max(0, depth - 1);
      }
      depths.push(depth);
    });
  
  return depths;
}

/**
 * Compute throughput (events per second)
 */
export function computeThroughput(events: DomainEvent[], windowMs: number = 60000): number {
  const now = Date.now();
  const recentEvents = events.filter(e => e.ts > now - windowMs);
  return recentEvents.length / (windowMs / 1000);
}

/**
 * Compute error rate
 */
export function computeErrorRate(events: DomainEvent[], windowMs: number = 60000): number {
  const now = Date.now();
  const recentEvents = events.filter(e => e.ts > now - windowMs);
  
  const total = recentEvents.length;
  const errors = recentEvents.filter(e => 
    e.type.includes('failed') || e.type.includes('error')
  ).length;
  
  return total > 0 ? errors / total : 0;
}

