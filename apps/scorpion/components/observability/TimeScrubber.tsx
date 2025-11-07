'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTelemetryStore } from '@/lib/telemetry/store';

/**
 * TimeScrubber - Single source of truth for time navigation
 * Features: Live/Pause toggle, keyboard shortcuts, URL sync
 */
export function TimeScrubber() {
  const { timeRange, setTimeRange } = useTelemetryStore();
  const [localFrom, setLocalFrom] = useState(new Date(timeRange.from).toISOString().slice(0, 16));
  const [localTo, setLocalTo] = useState(new Date(timeRange.to).toISOString().slice(0, 16));
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with inputs
      }
      
      const shiftAmount = e.shiftKey ? 60000 : 10000; // Shift = ±60s, normal = ±10s
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newFrom = timeRange.from - shiftAmount;
        const newTo = timeRange.to - shiftAmount;
        setTimeRange({ from: newFrom, to: newTo, live: false });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newFrom = timeRange.from + shiftAmount;
        const newTo = timeRange.to + shiftAmount;
        setTimeRange({ from: newFrom, to: newTo, live: false });
      } else if (e.key === ' ') {
        e.preventDefault();
        setTimeRange({ live: !timeRange.live });
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [timeRange, setTimeRange]);
  
  // Live mode - update 'to' every second
  useEffect(() => {
    if (!timeRange.live) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const duration = timeRange.to - timeRange.from;
      setTimeRange({ from: now - duration, to: now });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeRange.live, timeRange.from, timeRange.to, setTimeRange]);
  
  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('from', timeRange.from.toString());
    params.set('to', timeRange.to.toString());
    params.set('live', timeRange.live ? '1' : '0');
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [timeRange]);
  
  const handleFromChange = (value: string) => {
    setLocalFrom(value);
    const ts = new Date(value).getTime();
    if (!isNaN(ts)) {
      setTimeRange({ from: ts, live: false });
    }
  };
  
  const handleToChange = (value: string) => {
    setLocalTo(value);
    const ts = new Date(value).getTime();
    if (!isNaN(ts)) {
      setTimeRange({ to: ts, live: false });
    }
  };
  
  const toggleLive = () => {
    if (!timeRange.live) {
      // Going live - set to "now"
      const now = Date.now();
      const duration = timeRange.to - timeRange.from;
      setTimeRange({ from: now - duration, to: now, live: true });
    } else {
      setTimeRange({ live: false });
    }
  };
  
  const quickRange = (minutes: number) => {
    const now = Date.now();
    setTimeRange({ from: now - minutes * 60000, to: now, live: true });
  };
  
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border-b border-white/10">
      {/* Live/Pause */}
      <button
        onClick={toggleLive}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          timeRange.live
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-white/10 hover:bg-white/20 text-white/80'
        }`}
        title="Space to toggle"
      >
        {timeRange.live ? (
          <>
            <Play className="h-3 w-3" />
            Live
          </>
        ) : (
          <>
            <Pause className="h-3 w-3" />
            Paused
          </>
        )}
      </button>
      
      {/* Time navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const duration = timeRange.to - timeRange.from;
            setTimeRange({ from: timeRange.from - duration, to: timeRange.to - duration, live: false });
          }}
          className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
          title="← / Shift+← for ±10s/±60s"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <input
          type="datetime-local"
          value={localFrom}
          onChange={(e) => handleFromChange(e.target.value)}
          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
          disabled={timeRange.live}
        />
        
        <span className="text-white/40 text-xs">to</span>
        
        <input
          type="datetime-local"
          value={localTo}
          onChange={(e) => handleToChange(e.target.value)}
          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
          disabled={timeRange.live}
        />
        
        <button
          onClick={() => {
            const duration = timeRange.to - timeRange.from;
            setTimeRange({ from: timeRange.from + duration, to: timeRange.to + duration, live: false });
          }}
          className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
          title="→ / Shift+→ for ±10s/±60s"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Quick ranges */}
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-xs text-white/40 mr-2">Quick:</span>
        {[5, 15, 60, 360].map(minutes => (
          <button
            key={minutes}
            onClick={() => quickRange(minutes)}
            className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white transition-colors"
          >
            {minutes < 60 ? `${minutes}m` : `${minutes/60}h`}
          </button>
        ))}
      </div>
    </div>
  );
}

