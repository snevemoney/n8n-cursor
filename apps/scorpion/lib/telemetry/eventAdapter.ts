import { DomainEventSchema, type DomainEvent } from './schema';

/**
 * Event adapter - maps raw SSE messages to typed DomainEvent objects
 */

export function eventAdapter(rawData: string): DomainEvent | null {
  try {
    // Skip empty or whitespace-only data
    if (!rawData || !rawData.trim()) {
      return null;
    }
    
    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(rawData);
    } catch (parseError) {
      console.debug('[Telemetry] Failed to parse JSON:', parseError);
      return null;
    }
    
    // Skip if not an object
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    
    // Validate against schema
    const result = DomainEventSchema.safeParse(parsed);
    
    if (!result.success) {
      // Only log in development to avoid console spam
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Telemetry] Invalid event format:', {
          type: parsed.type,
          error: result.error.format(),
        });
      }
      return null;
    }
    
    return result.data;
  } catch (error) {
    // Only log unexpected errors
    console.error('[Telemetry] Unexpected error in eventAdapter:', error);
    return null;
  }
}

