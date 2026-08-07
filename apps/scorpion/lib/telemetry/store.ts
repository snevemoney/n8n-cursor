import { create } from 'zustand';
import type { DomainEvent } from './schema';

/**
 * Telemetry Zustand store - frontend state for observability
 */

interface TimeRange {
  from: number;
  to: number;
  live: boolean;
}

interface Focus {
  agentId?: string;
  nodeId?: string;
  workflowId?: string;
}

interface TelemetryState {
  // Time control
  timeRange: TimeRange;
  
  // Events ring buffer (last 1000 events)
  events: DomainEvent[];
  
  // Metrics aggregations
  metrics: Record<string, any>;
  
  // Logs
  logs: Array<{
    id: string;
    ts: number;
    level: 'info' | 'warn' | 'error' | 'critical';
    message: string;
    source: string;
  }>;
  
  // Health status
  health: Record<string, {
    status: 'up' | 'down' | 'degraded';
    lastSeen: number;
    lastError?: string;
  }>;
  
  // Focus/filter
  focus: Focus;
  
  // Connection state
  liveConnected: boolean;
  lastHeartbeat: number;
  
  // Actions
  setTimeRange: (range: Partial<TimeRange>) => void;
  addEvent: (event: DomainEvent) => void;
  addEvents: (events: DomainEvent[]) => void;
  setFocus: (focus: Focus) => void;
  setLiveConnected: (connected: boolean) => void;
  setLastHeartbeat: (timestamp: number) => void;
}

const MAX_EVENTS = 1000;
const MAX_LOGS = 500;

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  // Initial state
  timeRange: {
    from: Date.now() - 300000, // Last 5 minutes
    to: Date.now(),
    live: true,
  },
  
  events: [],
  metrics: {},
  logs: [],
  health: {},
  focus: {},
  liveConnected: false,
  lastHeartbeat: 0,
  
  // Actions
  setTimeRange: (range) => {
    set(state => ({
      timeRange: { ...state.timeRange, ...range },
    }));
  },
  
  addEvent: (event) => {
    set(state => {
      const newEvents = [...state.events, event];
      
      // Keep only last MAX_EVENTS
      if (newEvents.length > MAX_EVENTS) {
        newEvents.shift();
      }
      
      // Extract logs from events
      const newLogs = [...state.logs];
      if (event.type === 'system.log') {
        newLogs.push({
          id: `log-${event.ts}`,
          ts: event.ts,
          level: 'level' in event ? (event.level as any) : 'info',
          message: 'message' in event ? String(event.message) : 'Log event',
          source: 'source' in event ? String(event.source) : 'system',
        });
        
        // Keep only last MAX_LOGS
        if (newLogs.length > MAX_LOGS) {
          newLogs.shift();
        }
      }
      
      // Update health from system.health events
      const newHealth = { ...state.health };
      if (event.type === 'system.health') {
        const serviceId = 'serviceId' in event ? String(event.serviceId) : 'unknown';
        newHealth[serviceId] = {
          status: 'status' in event ? (event.status as any) : 'up',
          lastSeen: event.ts,
          lastError: 'error' in event ? String(event.error) : undefined,
        };
      }
      
      return {
        events: newEvents,
        logs: newLogs,
        health: newHealth,
      };
    });
  },
  
  addEvents: (events) => {
    events.forEach(event => get().addEvent(event));
  },
  
  setFocus: (focus) => {
    set({ focus });
  },
  
  setLiveConnected: (connected) => {
    set({ liveConnected: connected });
  },
  
  setLastHeartbeat: (timestamp) => {
    set({ lastHeartbeat: timestamp });
  },
}));

/** Server-side telemetry accessor used by ML API routes */
export function getTelemetryStore() {
  return {
    getRecentEvents(_limit = 100): DomainEvent[] {
      try {
        return useTelemetryStore.getState().events.slice(-_limit);
      } catch {
        return [];
      }
    },
  };
}

