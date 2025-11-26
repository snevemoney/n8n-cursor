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
      useTelemetryStore.getState().setLastHeartbeat(Date.now());
      reconnectAttempts = 0;
    };
    
    // Message received
    eventSource.onmessage = (e) => {
      try {
        // Parse SSE message format: {"type":"event|heartbeat|connected","data":{...},"ts":...}
        // EventSource automatically strips "data: " prefix, but may include trailing newlines
        const rawData = e.data.trim();
        if (!rawData) return;
        
        const message = JSON.parse(rawData);
        console.log('[Telemetry] Received message type:', message.type, 'has data:', !!message.data);
        
        if (message.type === 'heartbeat') {
          // Update heartbeat timestamp
          useTelemetryStore.getState().setLastHeartbeat(message.ts || Date.now());
        } else if (message.type === 'connected') {
          // Connection confirmed
          console.log('[Telemetry] Stream connected successfully');
          useTelemetryStore.getState().setLastHeartbeat(Date.now());
        } else if (message.type === 'event' && message.data) {
          // Parse domain event - message.data is already the event object
          console.log('[Telemetry] Processing event:', message.data.type, message.data.source);
          try {
            const event = eventAdapter(JSON.stringify(message.data));
            if (event) {
              console.log('[Telemetry] Event validated, adding to store:', event.type);
              useTelemetryStore.getState().addEvent(event);
            } else {
              console.warn('[Telemetry] Event adapter returned null for:', message.data);
            }
          } catch (adapterError) {
            console.error('[Telemetry] Error in event adapter:', adapterError, 'Data:', message.data);
          }
        } else if (message.type === 'metrics' && message.data) {
          // Handle metrics if needed
          // For now, we can store metrics in the store if needed
          console.log('[Telemetry] Received metrics:', message.data);
        } else if (message.type) {
          // Unknown message type, log for debugging
          console.warn('[Telemetry] Unknown message type:', message.type, message);
        }
      } catch (error) {
        console.error('[Telemetry] Error processing message:', error, 'Raw data:', e.data);
      }
    };
    
    // Connection error
    eventSource.onerror = (error) => {
      const readyState = eventSource?.readyState;
      // Only log and reconnect if connection is actually closed (readyState === 2)
      // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
      if (readyState === EventSource.CLOSED) {
        console.warn('[Telemetry] Stream closed, attempting reconnect');
        useTelemetryStore.getState().setLiveConnected(false);
        
        // Close and attempt reconnect
        eventSource?.close();
        eventSource = null;
        
        scheduleReconnect();
      } else if (readyState === EventSource.CONNECTING) {
        // Still connecting, don't log as error
        console.debug('[Telemetry] Stream connecting...');
      }
      // If OPEN (1), don't do anything - connection is fine
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
    console.error('[Telemetry] Max reconnect attempts reached. Stream will not reconnect automatically.');
    useTelemetryStore.getState().setLiveConnected(false);
    return;
  }
  
  reconnectAttempts++;
  
  const delay = Math.min(
    BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1),
    30000 // Max 30 seconds
  );
  
  console.log(`[Telemetry] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  
  reconnectTimeout = setTimeout(() => {
    // Reset attempts if we successfully connect
    connectTelemetryStream();
  }, delay);
}

/**
 * Check if stream is connected
 */
export function isStreamConnected(): boolean {
  return eventSource?.readyState === EventSource.OPEN;
}

