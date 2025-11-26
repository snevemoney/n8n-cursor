/**
 * Scorpion Event Bus
 * Pub/Sub pattern implementation for event-driven architecture
 * 
 * Current: Postgres-based (simple, reliable)
 * Future: Redis Streams or Kafka for higher throughput
 */

import { EventEmitter } from 'events';
import { ScorpionEvent, EnrichedEvent, EventMetadata } from './types';
import { query } from '../db/client';

export interface EventBusConfig {
  persistence?: boolean; // Store events in DB
  maxListeners?: number;
  enableMetrics?: boolean;
}

export class ScorpionEventBus extends EventEmitter {
  private config: Required<EventBusConfig>;
  private eventCount: Map<string, number> = new Map();
  private dbInitialized: boolean = false;

  constructor(config: EventBusConfig = {}) {
    super();
    this.config = {
      persistence: config.persistence ?? true,
      maxListeners: config.maxListeners ?? 100,
      enableMetrics: config.enableMetrics ?? true,
    };
    this.setMaxListeners(this.config.maxListeners);
  }

  /**
   * Publish an event to the bus
   */
  async publish(event: ScorpionEvent, metadata?: EventMetadata): Promise<void> {
    const enrichedEvent: EnrichedEvent = {
      ...event,
      metadata: {
        ...metadata,
        timestamp: event.timestamp || new Date().toISOString(),
      },
    };

    // Emit to local listeners (synchronous)
    this.emit(event.type, enrichedEvent);
    this.emit('*', enrichedEvent); // Wildcard listener

    // Persist to database if enabled
    if (this.config.persistence) {
      await this.persistEvent(enrichedEvent);
    }

    // Update metrics
    if (this.config.enableMetrics) {
      const count = this.eventCount.get(event.type) || 0;
      this.eventCount.set(event.type, count + 1);
    }
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(
    eventTypes: string | string[],
    handler: (event: EnrichedEvent) => void | Promise<void>
  ): () => void {
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
    
    types.forEach(type => {
      this.on(type, handler);
    });

    // Return unsubscribe function
    return () => {
      types.forEach(type => {
        this.off(type, handler);
      });
    };
  }

  /**
   * Subscribe to all events (wildcard)
   */
  subscribeAll(handler: (event: EnrichedEvent) => void | Promise<void>): () => void {
    this.on('*', handler);
    return () => this.off('*', handler);
  }

  /**
   * Get event metrics
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.eventCount);
  }

  /**
   * Persist event to database
   */
  private async persistEvent(event: EnrichedEvent): Promise<void> {
    try {
      // Check if DATABASE_URL is configured
      if (!process.env.DATABASE_URL) {
        // Silently skip persistence if DB not configured
        return;
      }

      const insertQuery = `
        INSERT INTO events (
          id, type, severity, timestamp, source, environment, data, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO NOTHING
      `;

      await query(insertQuery, [
        event.id,
        event.type,
        event.severity,
        event.timestamp || new Date().toISOString(),
        event.source || null,
        event.environment || null,
        JSON.stringify(event.data || {}),
        JSON.stringify(event.metadata || {}),
      ]);
    } catch (error) {
      // Log but don't throw - event was still emitted to listeners
      console.error('[EventBus] Failed to persist event:', error);
      // Don't block event emission if DB is down
    }
  }

  /**
   * Query events from database
   */
  async queryEvents(filters: {
    type?: string;
    severity?: string;
    source?: string;
    environment?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): Promise<EnrichedEvent[]> {
    try {
      // Check if DATABASE_URL is configured
      if (!process.env.DATABASE_URL) {
        console.warn('[EventBus] DATABASE_URL not configured, cannot query events');
        return [];
      }

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.type) {
        conditions.push(`type = $${paramIndex++}`);
        params.push(filters.type);
      }

      if (filters.severity) {
        conditions.push(`severity = $${paramIndex++}`);
        params.push(filters.severity);
      }

      if (filters.source) {
        conditions.push(`source = $${paramIndex++}`);
        params.push(filters.source);
      }

      if (filters.environment) {
        conditions.push(`environment = $${paramIndex++}`);
        params.push(filters.environment);
      }

      if (filters.startTime) {
        conditions.push(`timestamp >= $${paramIndex++}`);
        params.push(filters.startTime);
      }

      if (filters.endTime) {
        conditions.push(`timestamp <= $${paramIndex++}`);
        params.push(filters.endTime);
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

      const limit = filters.limit || 100;
      const limitClause = `LIMIT $${paramIndex++}`;
      params.push(limit);

      const queryText = `
        SELECT 
          id, type, severity, timestamp, source, environment, data, metadata
        FROM events
        ${whereClause}
        ORDER BY timestamp DESC
        ${limitClause}
      `;

      const result = await query<{
        id: string;
        type: string;
        severity: string;
        timestamp: string;
        source: string | null;
        environment: string | null;
        data: any;
        metadata: any;
      }>(queryText, params);

      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        severity: row.severity as any,
        timestamp: row.timestamp,
        source: row.source || undefined,
        environment: row.environment as any,
        data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      }));
    } catch (error) {
      console.error('[EventBus] Failed to query events:', error);
      return [];
    }
  }
}

// Singleton instance
let eventBusInstance: ScorpionEventBus | null = null;

export function getEventBus(): ScorpionEventBus {
  if (!eventBusInstance) {
    eventBusInstance = new ScorpionEventBus({
      persistence: true,
      enableMetrics: true,
    });
  }
  return eventBusInstance;
}

// Helper function to create and publish events
export async function emitEvent(
  event: ScorpionEvent,
  metadata?: EventMetadata
): Promise<void> {
  const bus = getEventBus();
  await bus.publish(event, metadata);
}

