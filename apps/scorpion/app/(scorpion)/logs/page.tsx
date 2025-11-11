'use client';

import { useState, useEffect } from 'react';
import { Panel, LogRow, Metric, LoadingState, ErrorState, EmptyState, PageLoadingBar } from '@/components/scorpion';
import { FileText } from 'lucide-react';

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
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<Error | null>(null);
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
      setError(null);
      setLoading(true);
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (levelFilter) params.set('level', levelFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      
      const response = await fetch(`/api/logs?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Ensure stats object exists with defaults
          const data = {
            ...result.data,
            stats: result.data.stats || {
              total: 0,
              errors: 0,
              warnings: 0,
              info: 0,
              bySource: {}
            },
            logs: result.data.logs || []
          };
          setLogsData(data);
        } else {
          // Fallback for old API format - ensure stats exists
          const fallbackData = {
            ...result,
            stats: result.stats || {
              total: 0,
              errors: 0,
              warnings: 0,
              info: 0,
              bySource: {}
            },
            logs: result.logs || []
          };
          setLogsData(fallbackData);
        }
      } else {
        throw new Error(`Failed to load logs: ${response.statusText}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load logs');
      console.error('Failed to load logs:', error);
      setError(error);
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
    <>
      <PageLoadingBar loading={loading && !logsData} />
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Metric 
          label="Total Logs" 
          value={(logsData?.stats?.total ?? 0).toString()} 
        />
        <Metric 
          label="Errors" 
          value={(logsData?.stats?.errors ?? 0).toString()} 
          valueColor="text-red-400"
        />
        <Metric 
          label="Warnings" 
          value={(logsData?.stats?.warnings ?? 0).toString()} 
          valueColor="text-yellow-400"
        />
        <Metric 
          label="Info" 
          value={(logsData?.stats?.info ?? 0).toString()} 
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
          {loading && !logsData ? (
            <LoadingState text="Loading logs..." />
          ) : error && !logsData ? (
            <ErrorState
              error={error}
              onRetry={loadLogs}
              title="Failed to load logs"
              fullPage={false}
            />
          ) : logsData ? (
            <div className="flex-1 overflow-y-auto space-y-0">
              {logsData.logs.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No logs found"
                  message="System is running clean! No log entries to display."
                  fullPage={false}
                />
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
          ) : null}
        </Panel>
      </div>
    </div>
    </>
  );
}

