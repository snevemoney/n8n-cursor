'use client';

import { useState, useEffect } from 'react';
import { Panel, LogRow, Metric } from '@/components/scorpion';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  source: string;
  message: string;
  details?: any;
}

interface LogsData {
  stats: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
    bySource: { [key: string]: number };
  };
  logs: LogEntry[];
}

export default function LogsPage() {
  const [logsData, setLogsData] = useState<LogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
    // Refresh every 10 seconds
    const interval = setInterval(loadLogs, 10000);
    return () => clearInterval(interval);
  }, [levelFilter, sourceFilter]);

  const loadLogs = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (levelFilter) params.set('level', levelFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      
      const response = await fetch(`/api/logs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLogsData(data);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Metric 
          label="Total Logs" 
          value={logsData?.stats.total.toString() || '0'} 
        />
        <Metric 
          label="Errors" 
          value={logsData?.stats.errors.toString() || '0'} 
          valueColor="text-red-400"
        />
        <Metric 
          label="Warnings" 
          value={logsData?.stats.warnings.toString() || '0'} 
          valueColor="text-yellow-400"
        />
        <Metric 
          label="Info" 
          value={logsData?.stats.info.toString() || '0'} 
          valueColor="text-blue-400"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setLevelFilter(null)}
          className={`px-3 py-1 text-xs rounded ${
            !levelFilter ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setLevelFilter('error')}
          className={`px-3 py-1 text-xs rounded ${
            levelFilter === 'error' ? 'bg-red-500/30 text-red-300' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Errors
        </button>
        <button
          onClick={() => setLevelFilter('warn')}
          className={`px-3 py-1 text-xs rounded ${
            levelFilter === 'warn' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Warnings
        </button>
        <button
          onClick={() => setLevelFilter('info')}
          className={`px-3 py-1 text-xs rounded ${
            levelFilter === 'info' ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Info
        </button>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-hidden">
        <Panel title="System Logs" className="h-full flex flex-col">
          {loading && (
            <div className="text-center py-8 text-white/40">Loading logs...</div>
          )}
          {!loading && logsData && (
            <div className="flex-1 overflow-y-auto space-y-0">
              {logsData.logs.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  No logs found. System is running clean! ✅
                </div>
              ) : (
                logsData.logs.map((log) => (
                  <LogRow 
                    key={log.id} 
                    time={formatTimestamp(log.timestamp)} 
                    text={`[${log.source}] ${log.message}`} 
                    level={log.level} 
                  />
                ))
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

