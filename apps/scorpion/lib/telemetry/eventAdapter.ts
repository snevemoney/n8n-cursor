import { DomainEventSchema, type DomainEvent } from './schema';

/**
 * Event adapter - maps raw SSE messages to typed DomainEvent objects
 */

export function eventAdapter(rawData: string): DomainEvent | null {
  try {
    // Parse JSON
    const parsed = JSON.parse(rawData);
    
    // Validate against schema
    const result = DomainEventSchema.safeParse(parsed);
    
    if (!result.success) {
      console.warn('[Telemetry] Invalid event format:', result.error);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('[Telemetry] Failed to parse event:', error);
    return null;
  }
}

