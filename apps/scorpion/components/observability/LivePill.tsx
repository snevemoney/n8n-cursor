'use client';

import { useTelemetryStore } from '@/lib/telemetry/store';

/**
 * LivePill - Connection status indicator with pulsing dot
 */
export function LivePill() {
  const connected = useTelemetryStore(state => state.connected);
  const lastHeartbeat = useTelemetryStore(state => state.lastHeartbeat);
  
  const isStale = Date.now() - lastHeartbeat > 30000; // 30s threshold
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-full border border-white/10">
      <div className={`relative h-2 w-2 rounded-full ${
        connected && !isStale ? 'bg-emerald-400' : 'bg-red-400'
      }`}>
        {connected && !isStale && (
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
        )}
      </div>
      <span className="text-xs text-white/60">
        {connected && !isStale ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

