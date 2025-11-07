'use client';

import { useState, useEffect } from 'react';
import { ASCIILogo } from '@/components/scorpion';
import { Panel, Metric } from '@/components/scorpion';
import { NotificationBadge } from '@/components/scorpion/NotificationBadge';
import Link from 'next/link';

interface SystemStats {
  projects: { total: number; active: number };
  agents: { total: number; active: number };
  workflows: { total: number; active: number };
  knowledge: { total: number };
  operations: { total: number; running: number; completed: number; failed: number };
  system: { health: string };
  recentActivity: Array<{ type: string; message: string; timestamp: string }>;
}

export default function ScorpionHomePage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health?: string) => {
    switch (health) {
      case 'healthy': return 'text-emerald-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-white/40';
    }
  };

  return (
    <div className="h-full flex items-center justify-center sc-grid-bg relative">
      <NotificationBadge />
      <div className="max-w-2xl w-full space-y-8 p-8">
        {/* ASCII Logo */}
        <div className="flex justify-center">
          <ASCIILogo />
        </div>

        {/* System Status */}
        <Panel>
          <div className="text-center space-y-4">
            <div className="sc-title">System Status</div>
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                stats?.system.health === 'healthy' ? 'bg-emerald-400' : 'bg-yellow-400'
              }`}></div>
              <div className="text-lg font-semibold">SCORPION // SYSTEM ONLINE</div>
            </div>
            {stats && (
              <div className={`text-sm sc-mono ${getHealthColor(stats.system.health)}`}>
                System Status: {stats.system.health.toUpperCase()}
              </div>
            )}
            {loading && !stats && (
              <div className="text-sm text-white/40">Loading...</div>
            )}
          </div>
        </Panel>

        {/* Quick Stats */}
        {stats && (
          <Panel title="System Overview">
            <div className="grid grid-cols-4 gap-4">
              <Metric 
                label="Projects" 
                value={stats.projects.active.toString()} 
                valueColor="text-emerald-400"
              />
              <Metric 
                label="Active Agents" 
                value={`${stats.agents.active}/${stats.agents.total}`} 
                valueColor="text-cyan-400"
              />
              <Metric 
                label="Workflows" 
                value={stats.workflows.total.toString()} 
                valueColor="text-blue-400"
              />
              <Metric 
                label="Knowledge Items" 
                value={stats.knowledge.total.toString()} 
                valueColor="text-purple-400"
              />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Metric 
                label="Total Ops" 
                value={stats.operations.total.toString()} 
              />
              <Metric 
                label="Running" 
                value={stats.operations.running.toString()} 
                valueColor="text-yellow-400"
              />
              <Metric 
                label="Completed" 
                value={stats.operations.completed.toString()} 
                valueColor="text-emerald-400"
              />
              <Metric 
                label="Failed" 
                value={stats.operations.failed.toString()} 
                valueColor="text-red-400"
              />
            </div>
          </Panel>
        )}
        
        {loading && !stats && (
          <Panel title="System Overview">
            <div className="text-center py-8 text-white/40">Loading system statistics...</div>
          </Panel>
        )}

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/project" className="sc-panel p-4 hover:bg-white/5 transition-colors block">
            <div className="sc-title mb-2">Project</div>
            <div className="text-sm text-white/70">Complete project dashboard</div>
          </Link>
          <Link href="/ops" className="sc-panel p-4 hover:bg-white/5 transition-colors block">
            <div className="sc-title mb-2">Operations</div>
            <div className="text-sm text-white/70">Monitor agents & workflows</div>
          </Link>
          <Link href="/workflows" className="sc-panel p-4 hover:bg-white/5 transition-colors block">
            <div className="sc-title mb-2">Workflows</div>
            <div className="text-sm text-white/70">Manage n8n workflows</div>
          </Link>
          <Link href="/council" className="sc-panel p-4 hover:bg-white/5 transition-colors block">
            <div className="sc-title mb-2">Council</div>
            <div className="text-sm text-white/70">Multi-agent deliberation</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

