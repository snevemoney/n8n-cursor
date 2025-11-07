'use client';

import { useState, useEffect } from 'react';
import { ASCIILogo } from '@/components/scorpion';
import { Panel, Metric } from '@/components/scorpion';
import { NotificationBadge } from '@/components/scorpion/NotificationBadge';
import Link from 'next/link';

interface QuickStatus {
  overallHealth?: 'healthy' | 'degraded' | 'critical';
  workspace?: { apps: number; packages: number };
  workflows?: { total: number; synced: number };
  knowledge?: { total: number };
}

export default function ScorpionHomePage() {
  const [status, setStatus] = useState<QuickStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStatus();
  }, []);

  const loadQuickStatus = async () => {
    try {
      const response = await fetch('/api/project/status');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          overallHealth: data.overallHealth,
          workspace: data.workspace,
          workflows: data.workflows,
          knowledge: data.knowledge
        });
      }
    } catch (error) {
      console.error('Failed to load status:', error);
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
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="text-lg font-semibold">SCORPION // SYSTEM ONLINE</div>
            </div>
            {status && (
              <div className={`text-sm sc-mono ${getHealthColor(status.overallHealth)}`}>
                Project Status: {status.overallHealth?.toUpperCase() || 'UNKNOWN'}
              </div>
            )}
          </div>
        </Panel>

        {/* Quick Stats */}
        {status && (
          <Panel title="Quick Stats">
            <div className="grid grid-cols-3 gap-4">
              <Metric 
                label="Apps" 
                value={status.workspace?.apps.toString() || '0'} 
              />
              <Metric 
                label="Workflows" 
                value={`${status.workflows?.synced || 0}/${status.workflows?.total || 0}`} 
              />
              <Metric 
                label="Knowledge" 
                value={status.knowledge?.total.toString() || '0'} 
              />
            </div>
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

