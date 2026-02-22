'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ASCIILogo } from '@/components/scorpion';
import { Panel, Metric, LoadingState, ErrorState, EmptyState, PageLoadingBar } from '@/components/scorpion';
import { Activity, Youtube, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { usePageData } from '@/hooks/usePageData';

// Lazy load NotificationBadge to improve initial page load
const NotificationBadge = dynamic(
  () => import('@/components/scorpion/NotificationBadge').then(mod => ({ default: mod.NotificationBadge })),
  { ssr: false }
);

interface SystemStats {
  projects: { total: number; active: number };
  agents: { total: number; active: number };
  workflows: { total: number; active: number };
  knowledge: { total: number };
  operations: { total: number; running: number; completed: number; failed: number };
  llmExperiments?: { total: number; running: number; completed: number; failed: number; pending: number };
  system: { health: string };
  recentActivity: Array<{ type: string; message: string; timestamp: string }>;
}

export default function ScorpionHomePage() {
  const { data: stats, loading, error, refetch } = usePageData({
    fetchFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
      const result = await response.json();
      return result.success && result.data ? result.data : result;
    },
    cacheKey: 'scorpion-stats-cache',
    cacheMaxAge: 30000,
    timeout: 10000,
    retry: 2,
    pollInterval: 60000, // 60 seconds
  });

  // Rest of component - stats, loading, error are all consistent

  const getHealthColor = useCallback((health?: string) => {
    switch (health) {
      case 'healthy': return 'text-emerald-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-white/40';
    }
  }, []);

  // Render page structure immediately, don't block on data
  return (
    <div className="min-h-full flex items-center justify-center sc-grid-bg relative py-4 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8" suppressHydrationWarning>
      <PageLoadingBar loading={loading && !stats} />
      <NotificationBadge />
      <div className="max-w-2xl w-full space-y-4 md:space-y-6 lg:space-y-8 min-w-0">
        {/* ASCII Logo */}
        <div className="flex justify-center">
          <ASCIILogo />
        </div>

        {/* System Status */}
        <Panel>
          <div className="text-center space-y-4">
            <div className="sc-title">System Status</div>
            {loading && !stats ? (
              <LoadingState variant="skeleton" skeletonLines={2} text="Loading system status..." />
            ) : error && !stats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                  <div className="text-lg font-semibold">SCORPION // SYSTEM ONLINE</div>
                </div>
                <div className="text-sm sc-mono text-yellow-400">
                  System Status: DEGRADED
                </div>
                <div className="text-xs text-white/60 max-w-md mx-auto pt-2 border-t border-white/10">
                  {error}
                  {/* retryCount is not directly available from usePageData, so this part is removed */}
                </div>
                <button
                  onClick={() => {
                    refetch(true);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-sm hover:bg-emerald-500/30 transition-all hover:scale-105 flex items-center gap-2 sc-mono text-emerald-400 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Try Again'}
                </button>
              </div>
            ) : stats ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    stats?.system?.health === 'healthy' ? 'bg-emerald-400' : 'bg-yellow-400'
                  }`}></div>
                  <div className="text-lg font-semibold">SCORPION // SYSTEM ONLINE</div>
                </div>
                {stats?.system?.health && (
                  <div className={`text-sm sc-mono ${getHealthColor(stats.system.health)}`}>
                    System Status: {stats.system.health.toUpperCase()}
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Activity}
                title="No system data available"
                message="System statistics could not be loaded. Please try refreshing."
                action={{ label: "Refresh", onClick: refetch }}
              />
            )}
          </div>
        </Panel>

        {/* Quick Stats */}
        {loading && !stats ? (
          <Panel title="System Overview">
            <LoadingState variant="skeleton" text="Loading system statistics..." skeletonLines={8} />
          </Panel>
        ) : stats ? (
          <Panel title="System Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Metric 
                label="Projects" 
                value={stats.projects?.active?.toString() ?? '0'} 
                valueColor="text-emerald-400"
              />
              <Metric 
                label="Active Agents" 
                value={`${stats.agents?.active ?? 0}/${stats.agents?.total ?? 0}`} 
                valueColor="text-cyan-400"
              />
              <Metric 
                label="Workflows" 
                value={stats.workflows?.total?.toString() ?? '0'} 
                valueColor="text-blue-400"
              />
              <Metric 
                label="Knowledge Items" 
                value={stats.knowledge?.total?.toString() ?? '0'} 
                valueColor="text-purple-400"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
              <Metric 
                label="Total Ops" 
                value={stats.operations?.total?.toString() ?? '0'} 
              />
              <Metric 
                label="Running" 
                value={stats.operations?.running?.toString() ?? '0'} 
                valueColor="text-yellow-400"
              />
              <Metric 
                label="Completed" 
                value={stats.operations?.completed?.toString() ?? '0'} 
                valueColor="text-emerald-400"
              />
              <Metric 
                label="Failed" 
                value={stats.operations?.failed?.toString() ?? '0'} 
                valueColor="text-red-400"
              />
            </div>
            {stats.llmExperiments && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mt-3 md:mt-4">
                <Metric 
                  label="LLM Experiments" 
                  value={stats.llmExperiments.total.toString()} 
                  valueColor="text-purple-400"
                />
                <Metric 
                  label="Running" 
                  value={stats.llmExperiments.running.toString()} 
                  valueColor="text-cyan-400"
                />
                <Metric 
                  label="Completed" 
                  value={stats.llmExperiments.completed.toString()} 
                  valueColor="text-emerald-400"
                />
                <Metric 
                  label="Failed" 
                  value={stats.llmExperiments.failed.toString()} 
                  valueColor="text-red-400"
                />
                <Metric 
                  label="Pending" 
                  value={stats.llmExperiments.pending.toString()} 
                  valueColor="text-yellow-400"
                />
              </div>
            )}
          </Panel>
        ) : null}

        {/* YouTube Intelligence Pipeline Card */}
        <YouTubeIngestCard />

        {/* Quick Access - Always visible for instant navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link 
            href="/project" 
            prefetch={true}
            className="sc-panel p-3 md:p-4 hover:bg-white/5 transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] block min-w-0"
          >
            <div className="sc-title mb-2">Project</div>
            <div className="text-xs md:text-sm text-white/70">Complete project dashboard</div>
          </Link>
          <Link 
            href="/ops" 
            prefetch={true}
            className="sc-panel p-3 md:p-4 hover:bg-white/5 transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] block min-w-0"
          >
            <div className="sc-title mb-2">Operations</div>
            <div className="text-xs md:text-sm text-white/70">Monitor agents & workflows</div>
          </Link>
          <Link 
            href="/workflows" 
            prefetch={true}
            className="sc-panel p-3 md:p-4 hover:bg-white/5 transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] block min-w-0"
          >
            <div className="sc-title mb-2">Workflows</div>
            <div className="text-xs md:text-sm text-white/70">Manage n8n workflows</div>
          </Link>
          <Link 
            href="/council" 
            prefetch={true}
            className="sc-panel p-3 md:p-4 hover:bg-white/5 transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] block min-w-0"
          >
            <div className="sc-title mb-2">Council</div>
            <div className="text-xs md:text-sm text-white/70">Multi-agent deliberation</div>
          </Link>
          <Link 
            href="/llm/experiments" 
            prefetch={true}
            className="sc-panel p-3 md:p-4 hover:bg-white/5 transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] block min-w-0"
          >
            <div className="sc-title mb-2">LLM Experiments</div>
            <div className="text-xs md:text-sm text-white/70">Track training runs & models</div>
          </Link>
          <Link 
            href="/agents/specialized" 
            prefetch={true}
            className="sc-panel p-3 md:p-4 hover:bg-white/5 transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] block min-w-0"
          >
            <div className="sc-title mb-2">Specialized Agents</div>
            <div className="text-xs md:text-sm text-white/70">AI expert agents including LLM training</div>
          </Link>
          <Link 
            href="/youtube" 
            prefetch={true}
            className="sc-panel p-3 md:p-4 hover:bg-white/5 transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] block min-w-0 border-red-500/20"
          >
            <div className="sc-title mb-2 flex items-center gap-2"><Youtube className="h-4 w-4 text-red-500" />YouTube Ingest</div>
            <div className="text-xs md:text-sm text-white/70">Transcript intelligence pipeline</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function YouTubeIngestCard() {
  const [stats, setStats] = useState<{ transcripts_this_week: number; failed_jobs: number; pending_review: number; promoted_count: number } | null>(null);

  useEffect(() => {
    fetch('/api/youtube/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const hasAttention = stats.failed_jobs > 0 || stats.pending_review > 0;

  return (
    <Link href="/youtube" className="block">
      <Panel>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            <span className="sc-title text-sm">YouTube Intelligence</span>
          </div>
          {hasAttention && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full sc-mono text-[10px] text-yellow-400">
              <AlertTriangle className="h-3 w-3" /> Needs attention
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400 sc-mono">{stats.transcripts_this_week}</div>
            <div className="sc-mono text-[10px] text-white/40">Transcribed</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold sc-mono ${stats.failed_jobs > 0 ? 'text-red-400' : 'text-white/30'}`}>{stats.failed_jobs}</div>
            <div className="sc-mono text-[10px] text-white/40">Failed</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold sc-mono ${stats.pending_review > 0 ? 'text-blue-400' : 'text-white/30'}`}>{stats.pending_review}</div>
            <div className="sc-mono text-[10px] text-white/40">Review</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400 sc-mono">{stats.promoted_count}</div>
            <div className="sc-mono text-[10px] text-white/40">Promoted</div>
          </div>
        </div>
      </Panel>
    </Link>
  );
}

