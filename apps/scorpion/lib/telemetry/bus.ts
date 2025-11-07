import { EventEmitter } from 'events';
import type { DomainEvent, MetricsPoint } from './schema';

/**
 * Telemetry event bus - central hub for all events
 * Supports Redis Pub/Sub when REDIS_URL is present
 */
class TelemetryBus extends EventEmitter {
  private redisAdapter: any = null;
  
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
    this.emit('metrics', metrics);
    
    if (this.redisAdapter) {
      this.redisAdapter.publish('scorpion:metrics', JSON.stringify(metrics));
    }
  }
  
  /**
   * Subscribe to all events
   */
  onEvent(handler: (event: DomainEvent) => void): () => void {
    this.on('event', handler);
    return () => this.off('event', handler);
  }
  
  /**
   * Subscribe to metrics
   */
  onMetrics(handler: (metrics: MetricsPoint) => void): () => void {
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

