'use client';

import { useState, useRef, useEffect } from 'react';
import { useTelemetryStore } from '@/lib/telemetry/store';
import { Pause, Play, Search } from 'lucide-react';

/**
 * LogStream - Virtualized log viewer with level filters
 */
export function LogStream() {
  const logs = useTelemetryStore(state => state.logs);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>(['info', 'warn', 'error', 'critical']);
  const [pausedLogs, setPausedLogs] = useState(logs);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Update paused logs snapshot
  useEffect(() => {
    if (!paused) {
      setPausedLogs(logs);
    }
  }, [logs, paused]);
  
  // Auto-scroll when not paused
  useEffect(() => {
    if (!paused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [pausedLogs, paused]);
  
  const displayLogs = paused ? pausedLogs : logs;
  
  const filteredLogs = displayLogs.filter(log => {
    if (!levelFilter.includes(log.level)) return false;
    if (filter && !log.message.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });
  
  const toggleLevel = (level: string) => {
    if (levelFilter.includes(level)) {
      setLevelFilter(levelFilter.filter(l => l !== level));
    } else {
      setLevelFilter([...levelFilter, level]);
    }
  };
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-900/20';
      case 'error': return 'text-red-400 bg-red-900/10';
      case 'warn': return 'text-yellow-400 bg-yellow-900/10';
      default: return 'text-white/60 bg-white/5';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-black/20">
        <button
          onClick={() => setPaused(!paused)}
          className={`p-1.5 rounded ${paused ? 'bg-yellow-600' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
          title="Pause/Resume (keeps scrolling)"
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
        
        <div className="flex gap-1">
          {['info', 'warn', 'error', 'critical'].map(level => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                levelFilter.includes(level)
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/40'
              }`}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="flex-1 flex items-center gap-2 ml-auto">
          <Search className="h-4 w-4 text-white/40" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter logs..."
            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        
        <div className="text-xs text-white/40">
          {filteredLogs.length} / {displayLogs.length}
        </div>
      </div>
      
      {/* Log list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs p-2 space-y-0.5"
      >
        {filteredLogs.map((log, i) => (
          <div key={`${log.id}-${i}`} className="flex gap-2 hover:bg-white/5 px-1 py-0.5 rounded">
            <span className="text-white/30 flex-shrink-0">
              {new Date(log.ts).toLocaleTimeString()}
            </span>
            <span className={`flex-shrink-0 px-1.5 rounded text-[10px] uppercase ${getLevelColor(log.level)}`}>
              {log.level}
            </span>
            <span className="text-white/40 flex-shrink-0">[{log.source}]</span>
            <span className="text-white/80 flex-1 break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

