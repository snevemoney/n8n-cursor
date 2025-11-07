'use client';

import { useState } from 'react';
import { useTelemetryStore } from '@/lib/telemetry/store';
import { RotateCcw, Play, Pause } from 'lucide-react';

/**
 * InstantReplay - Replay last 60s of events at 2x speed
 */
export function InstantReplay() {
  const [replaying, setReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(2);
  const timeRange = useTelemetryStore(state => state.timeRange);
  const setTimeRange = useTelemetryStore(state => state.setTimeRange);
  
  const startReplay = () => {
    const now = Date.now();
    const replayStart = now - 60000; // Last 60s
    
    setReplaying(true);
    setTimeRange({ from: replayStart, to: replayStart, live: false });
    
    // Animate time forward
    const duration = 60000 / replaySpeed; // 60s at 2x = 30s
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress >= 1) {
        clearInterval(interval);
        setReplaying(false);
        setTimeRange({ from: now - 60000, to: now, live: true });
        return;
      }
      
      const currentTo = replayStart + (60000 * progress);
      setTimeRange({ from: replayStart, to: currentTo, live: false });
    }, 100);
  };
  
  const stopReplay = () => {
    setReplaying(false);
    setTimeRange({ live: true });
  };
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={replaying ? stopReplay : startReplay}
        disabled={timeRange.live && !replaying}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          replaying
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
            : 'bg-white/10 hover:bg-white/20 text-white/80 disabled:opacity-40'
        }`}
        title="Replay last 60 seconds"
      >
        {replaying ? (
          <>
            <Pause className="h-3 w-3" />
            Stop Replay
          </>
        ) : (
          <>
            <RotateCcw className="h-3 w-3" />
            Replay 60s
          </>
        )}
      </button>
      
      {replaying && (
        <select
          value={replaySpeed}
          onChange={(e) => setReplaySpeed(Number(e.target.value))}
          className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white"
        >
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="4">4x</option>
          <option value="8">8x</option>
        </select>
      )}
    </div>
  );
}

