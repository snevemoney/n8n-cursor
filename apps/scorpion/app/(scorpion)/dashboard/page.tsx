'use client';

import { useEffect, useState } from 'react';
import { Panel } from '@/components/scorpion/Panel';
import { Metric } from '@/components/scorpion/Metric';
import { LoadingState, ErrorState, EmptyState, PageLoadingBar } from '@/components/scorpion';
import { CheckCircle, XCircle, AlertTriangle, Activity, Database, Workflow, Brain, Shield, TrendingUp, Zap, Radio } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load recharts - heavy library that slows initial render
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  systems: Record<string, {
    status: 'ok' | 'warning' | 'error';
    message?: string;
    details?: any;
  }>;
  summary: {
    total: number;
    healthy: number;
    warnings: number;
    errors: number;
  };
}

interface MetricPoint {
  time: string;
  healthy: number;
  warnings: number;
  errors: number;
}

export default function DashboardPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<Error | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [metricHistory, setMetricHistory] = useState<MetricPoint[]>([]);

  useEffect(() => {
    setMounted(true);
    // Defer data fetch aggressively so page renders instantly
    const loadData = () => {
      loadHealth();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
    
    if (autoRefresh) {
      // Only refresh when tab is visible to avoid unnecessary requests
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadHealth();
        }
      }, 15000); // 15 seconds - health check has 15s cache, so no need to poll more frequently
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadHealth = async () => {
    try {
      setError(null);
      // Only show loading spinner on initial load, not on refresh
      if (!health) {
        setLoading(true);
      }
      const response = await fetch('/api/health', {
        // Add cache headers for faster subsequent loads
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        setHealth(data);
        
        // Add to metric history for charts
        if (mounted && data.summary) {
          const now = new Date();
          const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
          setMetricHistory(prev => {
            const updated = [...prev, {
              time: timeStr,
              healthy: data.summary?.healthy ?? 0,
              warnings: data.summary?.warnings ?? 0,
              errors: data.summary?.errors ?? 0,
            }];
            // Keep last 20 data points
            return updated.slice(-20);
          });
        }
      } else {
        throw new Error(`Failed to load health status: ${response.statusText}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load health status');
      console.error('Failed to load health:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
      case 'warning':
        return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
      case 'error':
        return 'text-red-400 border-red-400/20 bg-red-400/5';
    }
  };

  const getSystemIcon = (name: string) => {
    const icons: Record<string, any> = {
      rag: <Brain className="h-4 w-4" />,
      ontology: <Database className="h-4 w-4" />,
      orchestrator: <Activity className="h-4 w-4" />,
      trainingData: <Brain className="h-4 w-4" />,
      mistakeLearner: <Shield className="h-4 w-4" />,
      notifications: <AlertTriangle className="h-4 w-4" />,
      systemAutomation: <Activity className="h-4 w-4" />,
      workflows: <Workflow className="h-4 w-4" />,
      n8nClient: <Zap className="h-4 w-4" />,
    };
    return icons[name] || <Activity className="h-4 w-4" />;
  };

  // Show page structure immediately, only show loading for content areas
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10]">
      <PageLoadingBar loading={loading && !health} />
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 min-w-0">
        {/* Header with Live Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
              <h1 className="sc-title text-xl md:text-2xl lg:text-3xl font-bold">System Dashboard</h1>
              {autoRefresh && health && (
                <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                  <span className="sc-mono text-[10px] md:text-xs text-emerald-400">LIVE</span>
                </div>
              )}
            </div>
            <p className="sc-mono text-xs md:text-sm text-gray-400 truncate">
              {loading && !health ? (
                <span className="animate-pulse">Loading...</span>
              ) : error && !health ? (
                <span className="text-yellow-400">Failed to load</span>
              ) : (
                `Last updated: ${mounted && health?.timestamp ? new Date(health.timestamp).toLocaleString() : '...'}`
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span className="sc-mono text-xs md:text-sm text-white/60 whitespace-nowrap">Auto-refresh</span>
            </label>
            <button
              onClick={loadHealth}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg sc-mono text-xs md:text-sm hover:bg-emerald-500/30 transition-all hover:scale-105 whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Status - Large Visual Card */}
        {loading && !health ? (
          <Panel className="border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <LoadingState variant="skeleton" skeletonLines={3} text="Loading system status..." />
          </Panel>
        ) : error && !health ? (
          <Panel className="border-2 border-yellow-400/30">
            <ErrorState
              error={error instanceof Error ? error : new Error(error)}
              onRetry={loadHealth}
              title="Failed to load health status"
            />
          </Panel>
        ) : health ? (
          <Panel className="border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl shrink-0 ${
                  health.status === 'healthy' ? 'bg-emerald-500/20' :
                  health.status === 'degraded' ? 'bg-yellow-500/20' :
                  'bg-red-500/20'
                }`}>
                  {health.status === 'healthy' ? <CheckCircle className="h-8 w-8 md:h-12 md:w-12 text-emerald-400" /> :
                   health.status === 'degraded' ? <AlertTriangle className="h-8 w-8 md:h-12 md:w-12 text-yellow-400" /> :
                   <XCircle className="h-8 w-8 md:h-12 md:w-12 text-red-400" />}
                </div>
                <div className="min-w-0">
                  <div className="sc-title text-sm md:text-lg mb-1">Overall Status</div>
                  <div className={`text-2xl md:text-3xl lg:text-4xl font-bold truncate ${
                    health.status === 'healthy' ? 'text-emerald-400' :
                    health.status === 'degraded' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {health.status?.toUpperCase() ?? 'UNKNOWN'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-6 shrink-0">
                <div className="text-center">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-400 mb-1">{health.summary?.healthy ?? 0}</div>
                  <div className="sc-mono text-[10px] md:text-xs text-white/50">Healthy</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-400 mb-1">{health.summary?.warnings ?? 0}</div>
                  <div className="sc-mono text-[10px] md:text-xs text-white/50">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-red-400 mb-1">{health.summary?.errors ?? 0}</div>
                  <div className="sc-mono text-[10px] md:text-xs text-white/50">Errors</div>
                </div>
              </div>
            </div>
          </Panel>
        ) : null}

        {/* Live Metrics Chart */}
        {metricHistory.length > 0 && (
          <Panel title="Live Metrics Trend" className="border-emerald-400/20">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metricHistory}>
                  <defs>
                    <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#ffffff40" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#ffffff40" style={{ fontSize: '10px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f1318', 
                      border: '1px solid #ffffff20',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Area type="monotone" dataKey="healthy" stroke="#10b981" fillOpacity={1} fill="url(#colorHealthy)" />
                  <Area type="monotone" dataKey="warnings" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWarnings)" />
                  <Area type="monotone" dataKey="errors" stroke="#ef4444" fillOpacity={1} fill="url(#colorErrors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {/* System Status Grid - Enhanced Visual Cards */}
        {health && (
          <div>
            <h2 className="sc-title text-base md:text-xl mb-3 md:mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 md:h-5 md:w-5" />
              System Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {Object.entries(health.systems || {}).map(([name, system]) => (
              <Panel 
                key={name} 
                className={`p-5 transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10 border-2 ${
                  system.status === 'ok' ? 'border-emerald-400/20' :
                  system.status === 'warning' ? 'border-yellow-400/20' :
                  'border-red-400/20'
                }`}
              >
                <div className={`flex items-start justify-between mb-4 pb-4 border-b ${getStatusColor(system.status)}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      system.status === 'ok' ? 'bg-emerald-500/20' :
                      system.status === 'warning' ? 'bg-yellow-500/20' :
                      'bg-red-500/20'
                    }`}>
                      {getSystemIcon(name)}
                    </div>
                    <span className="sc-mono text-sm font-semibold capitalize">
                      {name.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="animate-pulse">
                    {getStatusIcon(system.status)}
                  </div>
                </div>
                
                {system.details && (
                  <div className="space-y-2">
                    {Object.entries(system.details).slice(0, 3).map(([key, value]) => {
                      // Format value display based on type
                      let displayValue: string;
                      if (Array.isArray(value)) {
                        // For arrays, show count instead of full JSON
                        displayValue = `${value.length} items`;
                      } else if (typeof value === 'object' && value !== null) {
                        // For objects, show a summary or count
                        const keys = Object.keys(value);
                        displayValue = keys.length > 0 ? `${keys.length} properties` : 'Empty';
                      } else {
                        displayValue = String(value);
                      }

                      return (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="sc-mono text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="sc-mono font-semibold text-white/80 break-words max-w-[60%] text-right">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {system.message && (
                  <div className="mt-3 text-xs sc-mono text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                    {system.message}
                  </div>
                )}
              </Panel>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Link */}
        <Panel className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-400/20">
          <div className="text-center">
            <div className="sc-mono text-sm text-gray-400 mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Prometheus metrics available at
            </div>
            <a
              href="/api/metrics"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 sc-mono text-sm underline transition-colors"
            >
              /api/metrics
            </a>
          </div>
        </Panel>
      </div>
    </div>
  );
}
