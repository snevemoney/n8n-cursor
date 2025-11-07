import { useTelemetryStore } from './store';
import { eventAdapter } from './eventAdapter';

/**
 * Telemetry stream client - connects to SSE endpoint and updates store
 */

let eventSource: EventSource | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000; // 1 second

/**
 * Connect to telemetry stream
 */
export function connectTelemetryStream(): void {
  if (typeof window === 'undefined') return;
  if (eventSource?.readyState === EventSource.OPEN) return;
  
  // Clear any pending reconnect
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  try {
    // Close existing connection
    if (eventSource) {
      eventSource.close();
    }
    
    // Create new SSE connection
    const url = '/api/telemetry/stream';
    eventSource = new EventSource(url);
    
    // Connection opened
    eventSource.onopen = () => {
      console.log('[Telemetry] Stream connected');
      useTelemetryStore.getState().setLiveConnected(true);
      reconnectAttempts = 0;
    };
    
    // Message received
    eventSource.onmessage = (e) => {
      try {
        const event = eventAdapter(e.data);
        if (event) {
          useTelemetryStore.getState().addEvent(event);
        }
      } catch (error) {
        console.error('[Telemetry] Error processing event:', error);
      }
    };
    
    // Connection error
    eventSource.onerror = (error) => {
      console.warn('[Telemetry] Stream error:', error);
      useTelemetryStore.getState().setLiveConnected(false);
      
      // Close and attempt reconnect
      eventSource?.close();
      eventSource = null;
      
      scheduleReconnect();
    };
  } catch (error) {
    console.error('[Telemetry] Failed to connect:', error);
    useTelemetryStore.getState().setLiveConnected(false);
    scheduleReconnect();
  }
}

/**
 * Disconnect from telemetry stream
 */
export function disconnectTelemetryStream(): void {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  
  useTelemetryStore.getState().setLiveConnected(false);
  console.log('[Telemetry] Stream disconnected');
}

/**
 * Schedule reconnect with exponential backoff
 */
function scheduleReconnect(): void {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[Telemetry] Max reconnect attempts reached');
    return;
  }
  
  reconnectAttempts++;
  
  const delay = Math.min(
    BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1),
    30000 // Max 30 seconds
  );
  
  console.log(`[Telemetry] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  
  reconnectTimeout = setTimeout(() => {
    connectTelemetryStream();
  }, delay);
}

/**
 * Check if stream is connected
 */
export function isStreamConnected(): boolean {
  return eventSource?.readyState === EventSource.OPEN;
}

