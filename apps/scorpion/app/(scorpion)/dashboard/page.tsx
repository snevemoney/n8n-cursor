'use client';

import { useEffect, useState } from 'react';
import { Panel } from '@/components/scorpion/Panel';
import { Metric } from '@/components/scorpion/Metric';
import { CheckCircle, XCircle, AlertTriangle, Activity, Database, Workflow, Brain, Shield } from 'lucide-react';

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

export default function DashboardPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadHealth();
    if (autoRefresh) {
      const interval = setInterval(loadHealth, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadHealth = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (error) {
      console.error('Failed to load health:', error);
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
        return 'text-emerald-400 border-emerald-400/20';
      case 'warning':
        return 'text-yellow-400 border-yellow-400/20';
      case 'error':
        return 'text-red-400 border-red-400/20';
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
      workflows: <Workflow className="h-4 w-4" />
    };
    return icons[name] || <Activity className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <div className="sc-mono text-sm">Loading health status...</div>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <div className="sc-mono text-sm text-red-400">Failed to load health status</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="sc-title text-2xl mb-2">System Dashboard</h1>
          <p className="sc-mono text-sm text-gray-400">
            Last updated: {mounted ? new Date(health.timestamp).toLocaleString() : '...'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="sc-mono text-sm">Auto-refresh</span>
          </label>
          <button
            onClick={loadHealth}
            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded sc-mono text-sm hover:bg-emerald-500/30"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <Panel>
        <div className="flex items-center justify-between">
          <div>
            <div className="sc-title text-lg mb-2">Overall Status</div>
            <div className={`flex items-center gap-2 text-2xl font-bold ${
              health.status === 'healthy' ? 'text-emerald-400' :
              health.status === 'degraded' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {health.status === 'healthy' ? <CheckCircle className="h-8 w-8" /> :
               health.status === 'degraded' ? <AlertTriangle className="h-8 w-8" /> :
               <XCircle className="h-8 w-8" />}
              {health.status.toUpperCase()}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Metric
              label="Healthy"
              value={health.summary.healthy.toString()}
              className="text-emerald-400"
            />
            <Metric
              label="Warnings"
              value={health.summary.warnings.toString()}
              className="text-yellow-400"
            />
            <Metric
              label="Errors"
              value={health.summary.errors.toString()}
              className="text-red-400"
            />
          </div>
        </div>
      </Panel>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(health.systems).map(([name, system]) => (
          <Panel key={name} className="p-4">
            <div className={`flex items-start justify-between mb-3 pb-3 border-b ${getStatusColor(system.status)}`}>
              <div className="flex items-center gap-2">
                {getSystemIcon(name)}
                <span className="sc-mono text-sm font-semibold capitalize">
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              {getStatusIcon(system.status)}
            </div>
            
            {system.details && (
              <div className="space-y-2">
                {Object.entries(system.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="sc-mono text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="sc-mono font-semibold">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {system.message && (
              <div className="mt-2 text-xs sc-mono text-yellow-400">
                {system.message}
              </div>
            )}
          </Panel>
        ))}
      </div>

      {/* Metrics Link */}
      <Panel>
        <div className="text-center">
          <div className="sc-mono text-sm text-gray-400 mb-2">
            Prometheus metrics available at
          </div>
          <a
            href="/api/metrics"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 sc-mono text-sm underline"
          >
            /api/metrics
          </a>
        </div>
      </Panel>
    </div>
  );
}

