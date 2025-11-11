import { EventEmitter } from 'events';
import type { DomainEvent, MetricsPoint } from './schema';

/**
 * Telemetry event bus - central hub for all events
 * Supports Redis Pub/Sub when REDIS_URL is present
 * Buffers recent events to replay to new subscribers
 */
class TelemetryBus extends EventEmitter {
  private redisAdapter: any = null;
  private eventBuffer: DomainEvent[] = [];
  private metricsBuffer: MetricsPoint[] = [];
  private readonly MAX_BUFFER_SIZE = 100; // Keep last 100 events
  
  constructor() {
    super();
    this.setMaxListeners(100); // Increase for high-throughput scenarios
    
    // Initialize Redis adapter if available
    this.initRedisAdapter();
  }
  
  private async initRedisAdapter() {
    if (!process.env.REDIS_URL) {
      console.log('[TelemetryBus] No REDIS_URL found, using in-memory EventEmitter');
      return;
    }
    
    try {
      // Only initialize if Redis is available
      console.log('[TelemetryBus] Redis URL detected, but adapter not implemented yet');
      // TODO: Implement Redis Pub/Sub adapter
      // const redis = await import('redis');
      // this.redisAdapter = redis.createClient({ url: process.env.REDIS_URL });
      // await this.redisAdapter.connect();
    } catch (error) {
      console.warn('[TelemetryBus] Failed to initialize Redis adapter:', error);
    }
  }
  
  /**
   * Emit a domain event
   */
  emitEvent(event: DomainEvent): void {
    // Add to buffer for replay to new subscribers
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > this.MAX_BUFFER_SIZE) {
      this.eventBuffer.shift(); // Remove oldest
    }
    
    const listenerCount = this.listenerCount('event');
    if (listenerCount === 0) {
      console.warn(`[TelemetryBus] No listeners for event: ${event.type} (buffered for replay)`);
    }
    this.emit('event', event);
    this.emit(event.type, event);
    
    // If Redis is available, publish there too
    if (this.redisAdapter) {
      this.redisAdapter.publish('scorpion:events', JSON.stringify(event));
    }
  }
  
  /**
   * Emit metrics
   */
  emitMetrics(metrics: MetricsPoint): void {
    // Add to buffer for replay to new subscribers
    this.metricsBuffer.push(metrics);
    if (this.metricsBuffer.length > this.MAX_BUFFER_SIZE) {
      this.metricsBuffer.shift(); // Remove oldest
    }
    
    this.emit('metrics', metrics);
    
    if (this.redisAdapter) {
      this.redisAdapter.publish('scorpion:metrics', JSON.stringify(metrics));
    }
  }
  
  /**
   * Subscribe to all events
   * Replays buffered events to new subscribers
   */
  onEvent(handler: (event: DomainEvent) => void): () => void {
    // Replay buffered events to new subscriber
    if (this.eventBuffer.length > 0) {
      console.log(`[TelemetryBus] Replaying ${this.eventBuffer.length} buffered events to new subscriber`);
      // Replay asynchronously to avoid blocking
      setImmediate(() => {
        this.eventBuffer.forEach(event => {
          try {
            handler(event);
          } catch (error) {
            console.error('[TelemetryBus] Error replaying buffered event:', error);
          }
        });
      });
    }
    
    this.on('event', handler);
    return () => this.off('event', handler);
  }
  
  /**
   * Subscribe to metrics
   * Replays buffered metrics to new subscribers
   */
  onMetrics(handler: (metrics: MetricsPoint) => void): () => void {
    // Replay buffered metrics to new subscriber
    if (this.metricsBuffer.length > 0) {
      console.log(`[TelemetryBus] Replaying ${this.metricsBuffer.length} buffered metrics to new subscriber`);
      // Replay asynchronously to avoid blocking
      setImmediate(() => {
        this.metricsBuffer.forEach(metrics => {
          try {
            handler(metrics);
          } catch (error) {
            console.error('[TelemetryBus] Error replaying buffered metrics:', error);
          }
        });
      });
    }
    
    this.on('metrics', handler);
    return () => this.off('metrics', handler);
  }
  
  /**
   * Subscribe to specific event type
   */
  onEventType(type: string, handler: (event: any) => void): () => void {
    this.on(type, handler);
    return () => this.off(type, handler);
  }
  
  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    this.removeAllListeners();
    if (this.redisAdapter) {
      await this.redisAdapter.quit();
    }
  }
}

// Singleton instance
let busInstance: TelemetryBus | null = null;

export function getTelemetryBus(): TelemetryBus {
  if (!busInstance) {
    busInstance = new TelemetryBus();
  }
  return busInstance;
}

export async function destroyTelemetryBus(): Promise<void> {
  if (busInstance) {
    await busInstance.destroy();
    busInstance = null;
  }
}

