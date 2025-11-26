'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, DataTable, LoadingState, ErrorState, EmptyState, Button, PageLoadingBar } from '@/components/scorpion';
import { ChevronDown, ChevronRight, Folder, File, Database, Workflow, Code, AlertCircle, CheckCircle2, Clock, RefreshCw, MessageSquare, Activity, Bug, FileCode, AlertTriangle, ExternalLink } from 'lucide-react';

interface ProjectStatus {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  techDebt: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  missingFeatures: {
    p0: number;
    p1: number;
    p2: number;
  };
  services: Array<{
    name: string;
    status: 'online' | 'offline' | 'unknown';
    url?: string;
    lastChecked: string;
  }>;
  workspace: {
    apps: number;
    packages: number;
  };
  databases: number;
  workflows: {
    total: number;
    synced: number;
  };
  knowledge: {
    total: number;
  };
  conversations: {
    total: number;
    totalMessages: number;
    recent: number;
  };
  lastIngestion: string;
}

interface ExpandableSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

function ExpandableSection({ title, icon, defaultExpanded = false, children }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <Panel className="border border-white/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-white/40" /> : <ChevronRight className="h-4 w-4 text-white/40" />}
          {icon && <div className="text-white/60">{icon}</div>}
          <h3 className="sc-title text-base font-semibold">{title}</h3>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          {children}
        </div>
      )}
    </Panel>
  );
}

interface Issue {
  id: string;
  type: 'tech-debt' | 'missing-feature' | 'typescript-error' | 'unimplemented-tool' | 'todo';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  file: string;
  line?: number;
  message: string;
  context?: string;
  status: 'open' | 'in-progress' | 'fixed';
  lastUpdated: string;
}

interface IssuesData {
  issues: Issue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  };
  lastUpdated: string;
}

export default function ProjectPage() {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<Error | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [issuesData, setIssuesData] = useState<IssuesData | null>(null);
  const [issuesLoading, setIssuesLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Defer data fetch aggressively so page renders instantly
    const loadData = () => {
      loadStatus();
      // Stagger issues loading slightly to avoid blocking
      setTimeout(() => {
      loadIssues();
      }, 50);
    };
    
    // Defer initial load to allow page to render first
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 100 });
    } else {
      setTimeout(loadData, 50); // Small delay to allow initial render
    }
  }, []);

  const loadStatus = async () => {
    try {
      setError(null);
      // Only show loading spinner on initial load, not on refresh
      if (!status) {
        setLoading(true);
      }
      const response = await fetch('/api/projects');
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        // Map API format to expected format with real data
        setStatus({
          overallHealth: data.health?.status === 'healthy' ? 'healthy' : 
                        data.health?.status === 'critical' ? 'critical' : 'degraded',
          techDebt: data.techDebt || {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          },
          missingFeatures: data.missingFeatures || {
            p0: 0,
            p1: 0,
            p2: 0
          },
          services: data.infrastructure?.services || [],
          workspace: {
            apps: data.workspace?.totalDirectories || 0,
            packages: data.workspace?.totalFiles || 0
          },
          databases: data.databases?.length || 0,
          workflows: {
            total: data.workflows?.total || 0,
            synced: data.workflows?.active || 0
          },
          knowledge: {
            total: data.knowledge?.totalItems || 0
          },
          conversations: {
            total: data.conversations?.total || 0,
            totalMessages: data.conversations?.totalMessages || 0,
            recent: data.conversations?.recentConversations || 0
          },
          lastIngestion: data.lastIngestion || data.lastUpdated || new Date().toISOString()
        });
      } else {
        throw new Error(`Failed to load project status: ${response.statusText}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load project status');
      console.error('Failed to load project status:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async () => {
    setIngesting(true);
    try {
      const response = await fetch('/api/project/knowledge', {
        method: 'POST'
      });
      if (response.ok) {
        await loadStatus();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Ingestion failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to ingest knowledge:', error);
    } finally {
      setIngesting(false);
    }
  };

  const loadIssues = async () => {
    try {
      setIssuesLoading(true);
      const response = await fetch('/api/projects/issues');
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        setIssuesData(data);
      }
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setIssuesLoading(false);
    }
  };

  useEffect(() => {
    // Only refresh when tab is visible to avoid unnecessary requests
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadIssues();
      }
    }, 60000); // Increased from 30s to 60s - issues don't change that frequently
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-emerald-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-white/40';
    }
  };

  const getHealthBgColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-emerald-500/10 border-emerald-400/20';
      case 'degraded': return 'bg-yellow-500/10 border-yellow-400/20';
      case 'critical': return 'bg-red-500/10 border-red-400/20';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-400';
      case 'offline': return 'bg-red-400';
      default: return 'bg-white/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-400/20';
      case 'high': return 'text-yellow-400 bg-yellow-500/10 border-yellow-400/20';
      case 'medium': return 'text-blue-400 bg-blue-500/10 border-blue-400/20';
      case 'low': return 'text-white/40 bg-white/5 border-white/10';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'typescript-error': return <FileCode className="h-4 w-4" />;
      case 'unimplemented-tool': return <Bug className="h-4 w-4" />;
      case 'todo': return <AlertTriangle className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  // Render page structure immediately, show loading states inline
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10]">
      <PageLoadingBar loading={loading && !status} />
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <div className="min-w-0">
            <h1 className="sc-title text-xl md:text-2xl lg:text-3xl font-bold mb-2">Project Analysis</h1>
            <p className="sc-mono text-xs md:text-sm text-gray-400">
              {loading && !status ? (
                <span className="animate-pulse">Loading project status...</span>
              ) : error && !status ? (
                <span className="text-yellow-400">Failed to load</span>
              ) : status ? (
                `Last updated: ${mounted && status.lastIngestion ? new Date(status.lastIngestion).toLocaleString() : '...'}`
              ) : (
                'Auto-sync is initializing...'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {loading && !status ? (
              <div className="h-10 w-24 bg-white/5 rounded animate-pulse" />
            ) : (
              <Button
                variant="secondary"
                onClick={handleIngest}
                disabled={ingesting}
                loading={ingesting}
                icon={<RefreshCw className="h-3 w-3 md:h-4 md:w-4" />}
                className="sc-mono shrink-0"
                aria-label={ingesting ? 'Syncing knowledge base' : 'Force sync knowledge base'}
                title="Force immediate sync (auto-sync runs automatically every 5 minutes)"
              >
                {ingesting ? 'Syncing...' : 'Force Sync Now'}
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && !status ? (
          <Panel>
            <LoadingState variant="skeleton" skeletonLines={6} text="Loading project analysis..." />
          </Panel>
        ) : error && !status ? (
          <Panel>
            <ErrorState
              error={error}
              onRetry={loadStatus}
              title="Failed to load project status"
            />
          </Panel>
        ) : !status ? (
          <Panel>
            <EmptyState
              icon={Activity}
              title="No project status available"
              message="Auto-sync is initializing... Knowledge will be ingested automatically."
              action={{ label: ingesting ? 'Ingesting...' : 'Force Sync Now', onClick: handleIngest }}
            />
          </Panel>
        ) : status ? (
          <>
            {(() => {
              const syncPercentage = status.workflows.total > 0 
                ? Math.round((status.workflows.synced / status.workflows.total) * 100)
                : 0;
              
              return (
                <>
                  {/* Overall Health - Structured Card */}
                  <ExpandableSection 
          title="Overall Health" 
          icon={<CheckCircle2 className="h-4 w-4" />}
          defaultExpanded={true}
        >
          <div className={`p-6 rounded-lg border-2 ${getHealthBgColor(status.overallHealth)}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getHealthColor(status.overallHealth)}`}>
                  {status.overallHealth.toUpperCase()}
                </div>
                <div className="text-sm text-white/50 sc-mono">
                  Project Status
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="h-3 w-3 md:h-4 md:w-4 text-white/40 shrink-0" />
                  <span className="text-[10px] md:text-xs text-white/50 sc-mono uppercase truncate">Apps</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">{status.workspace.apps}</div>
              </div>
              <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <File className="h-3 w-3 md:h-4 md:w-4 text-white/40 shrink-0" />
                  <span className="text-[10px] md:text-xs text-white/50 sc-mono uppercase truncate">Packages</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">{status.workspace.packages}</div>
              </div>
              <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-3 w-3 md:h-4 md:w-4 text-white/40 shrink-0" />
                  <span className="text-[10px] md:text-xs text-white/50 sc-mono uppercase truncate">Databases</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">{status.databases}</div>
              </div>
              <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow className="h-3 w-3 md:h-4 md:w-4 text-white/40 shrink-0" />
                  <span className="text-[10px] md:text-xs text-white/50 sc-mono uppercase truncate">Workflows</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {status.workflows.synced}/{status.workflows.total}
                </div>
                <div className="text-[10px] md:text-xs text-white/40 mt-1 sc-mono">
                  {syncPercentage}% synced
                </div>
              </div>
            </div>
          </div>
        </ExpandableSection>

        {/* Tech Debt - Expandable Section */}
        <ExpandableSection 
          title="Tech Debt Analysis" 
          icon={<Code className="h-4 w-4" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 text-center min-w-0">
              <div className="text-[10px] md:text-xs text-white/50 sc-mono uppercase mb-2">Total</div>
              <div className="text-xl md:text-2xl font-bold text-white">{status.techDebt.total}</div>
            </div>
            <div className="bg-red-500/10 p-3 md:p-4 rounded-lg border border-red-400/20 text-center min-w-0">
              <div className="text-[10px] md:text-xs text-red-400 sc-mono uppercase mb-2">Critical</div>
              <div className="text-xl md:text-2xl font-bold text-red-400">{status.techDebt.critical}</div>
            </div>
            <div className="bg-yellow-500/10 p-3 md:p-4 rounded-lg border border-yellow-400/20 text-center min-w-0">
              <div className="text-[10px] md:text-xs text-yellow-400 sc-mono uppercase mb-2">High</div>
              <div className="text-xl md:text-2xl font-bold text-yellow-400">{status.techDebt.high}</div>
            </div>
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 text-center min-w-0">
              <div className="text-[10px] md:text-xs text-white/50 sc-mono uppercase mb-2">Medium</div>
              <div className="text-xl md:text-2xl font-bold text-white/60">{status.techDebt.medium}</div>
            </div>
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 text-center min-w-0">
              <div className="text-[10px] md:text-xs text-white/50 sc-mono uppercase mb-2">Low</div>
              <div className="text-xl md:text-2xl font-bold text-white/40">{status.techDebt.low}</div>
            </div>
          </div>
        </ExpandableSection>

        {/* Missing Features - Expandable Section */}
        <ExpandableSection 
          title="Missing Features" 
          icon={<AlertCircle className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-red-500/10 p-3 md:p-4 rounded-lg border border-red-400/20 min-w-0">
              <div className="text-[10px] md:text-xs text-red-400 sc-mono uppercase mb-2">P0 (Critical)</div>
              <div className="text-xl md:text-2xl font-bold text-red-400">{status.missingFeatures.p0}</div>
              <div className="text-[10px] md:text-xs text-white/40 mt-2 sc-mono">Requires immediate attention</div>
            </div>
            <div className="bg-yellow-500/10 p-3 md:p-4 rounded-lg border border-yellow-400/20 min-w-0">
              <div className="text-[10px] md:text-xs text-yellow-400 sc-mono uppercase mb-2">P1 (High)</div>
              <div className="text-xl md:text-2xl font-bold text-yellow-400">{status.missingFeatures.p1}</div>
              <div className="text-[10px] md:text-xs text-white/40 mt-2 sc-mono">High priority features</div>
            </div>
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
              <div className="text-[10px] md:text-xs text-white/50 sc-mono uppercase mb-2">P2 (Medium)</div>
              <div className="text-xl md:text-2xl font-bold text-white/60">{status.missingFeatures.p2}</div>
              <div className="text-[10px] md:text-xs text-white/40 mt-2 sc-mono">Nice to have features</div>
            </div>
          </div>
        </ExpandableSection>

        {/* Services - Expandable Table Section */}
        <ExpandableSection 
          title="Infrastructure Services" 
          icon={<Database className="h-4 w-4" />}
        >
          {status.services.length > 0 ? (
            <DataTable
              columns={[
                { key: 'name', label: 'Service' },
                { key: 'status', label: 'Status' },
                { key: 'url', label: 'URL' },
                { key: 'lastChecked', label: 'Last Checked' }
              ]}
              data={status.services.map(s => ({
                name: <span className="sc-mono text-sm">{s.name}</span>,
                status: (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getServiceStatusColor(s.status)}`}></div>
                    <span className="text-xs sc-mono capitalize">{s.status}</span>
                  </div>
                ),
                url: <span className="sc-mono text-xs text-white/60">{s.url || '-'}</span>,
                lastChecked: <span className="sc-mono text-xs text-white/50">
                  {mounted && s.lastChecked ? new Date(s.lastChecked).toLocaleString() : '-'}
                </span>
              }))}
            />
          ) : (
            <div className="text-center py-8 text-white/40 sc-mono text-sm">
              No services configured
            </div>
          )}
        </ExpandableSection>

        {/* Knowledge Base - Expandable Section */}
        <ExpandableSection 
          title="Knowledge Base" 
          icon={<Code className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
              <div className="text-[10px] md:text-xs text-white/50 sc-mono uppercase mb-2">Total Knowledge Items</div>
              <div className="text-xl md:text-2xl font-bold text-white">{status.knowledge.total}</div>
            </div>
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
              <div className="text-[10px] md:text-xs text-white/50 sc-mono uppercase mb-2">Last Ingestion</div>
              <div className="text-base md:text-lg font-semibold text-white sc-mono truncate">
                {mounted && status.lastIngestion ? new Date(status.lastIngestion).toLocaleString() : '...'}
              </div>
            </div>
          </div>
        </ExpandableSection>

        {/* Conversations - Expandable Section */}
        <ExpandableSection 
          title="Conversations" 
          icon={<MessageSquare className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-white/40 shrink-0" />
                <span className="text-[10px] md:text-xs text-white/50 sc-mono uppercase truncate">Total Conversations</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{status.conversations.total}</div>
            </div>
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-white/40 shrink-0" />
                <span className="text-[10px] md:text-xs text-white/50 sc-mono uppercase truncate">Total Messages</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{status.conversations.totalMessages}</div>
            </div>
            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-white/40 shrink-0" />
                <span className="text-[10px] md:text-xs text-white/50 sc-mono uppercase truncate">Recent (7 days)</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{status.conversations.recent}</div>
            </div>
          </div>
        </ExpandableSection>

        {/* Critical Issues List - Expandable Section */}
        <ExpandableSection 
          title="Critical Issues & Fixes Needed" 
          icon={<Bug className="h-4 w-4" />}
          defaultExpanded={issuesData?.summary.critical > 0}
        >
          {issuesLoading ? (
            <LoadingState variant="skeleton" skeletonLines={5} text="Scanning codebase for issues..." />
          ) : issuesData && issuesData.issues.length > 0 ? (
            <div className="space-y-3">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                <div className="bg-white/5 p-2 rounded border border-white/10 text-center">
                  <div className="text-xs text-white/50 sc-mono mb-1">Total</div>
                  <div className="text-lg font-bold text-white">{issuesData.summary.total}</div>
                </div>
                <div className="bg-red-500/10 p-2 rounded border border-red-400/20 text-center">
                  <div className="text-xs text-red-400 sc-mono mb-1">Critical</div>
                  <div className="text-lg font-bold text-red-400">{issuesData.summary.critical}</div>
                </div>
                <div className="bg-yellow-500/10 p-2 rounded border border-yellow-400/20 text-center">
                  <div className="text-xs text-yellow-400 sc-mono mb-1">High</div>
                  <div className="text-lg font-bold text-yellow-400">{issuesData.summary.high}</div>
                </div>
                <div className="bg-blue-500/10 p-2 rounded border border-blue-400/20 text-center">
                  <div className="text-xs text-blue-400 sc-mono mb-1">Medium</div>
                  <div className="text-lg font-bold text-blue-400">{issuesData.summary.medium}</div>
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/10 text-center">
                  <div className="text-xs text-white/50 sc-mono mb-1">Low</div>
                  <div className="text-lg font-bold text-white/60">{issuesData.summary.low}</div>
                </div>
              </div>

              {/* Issues List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {issuesData.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-lg border ${getPriorityColor(issue.priority)} transition-all hover:scale-[1.01]`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="mt-0.5 shrink-0">
                          {getTypeIcon(issue.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold sc-mono ${getPriorityColor(issue.priority)}`}>
                              {issue.priority.toUpperCase()}
                            </span>
                            <span className="text-xs text-white/40 sc-mono">{issue.category}</span>
                            {issue.status === 'fixed' && (
                              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 sc-mono">
                                FIXED
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-white mb-1 break-words">
                            {issue.message}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/50 sc-mono flex-wrap">
                            <span className="truncate max-w-[300px]">{issue.file}</span>
                            {issue.line && (
                              <>
                                <span>•</span>
                                <span>Line {issue.line}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Open file in editor (VS Code protocol)
                          const filePath = issue.file.startsWith('apps/') || issue.file.startsWith('packages/')
                            ? issue.file
                            : `apps/scorpion/${issue.file}`;
                          window.open(`vscode://file/${process.cwd()}/${filePath}${issue.line ? `:${issue.line}` : ''}`, '_blank');
                        }}
                        className="shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="Open in editor"
                      >
                        <ExternalLink className="h-4 w-4 text-white/40" />
                      </button>
                    </div>
                    {issue.context && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/60 sc-mono">
                        {issue.context.substring(0, 200)}{issue.context.length > 200 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Last Updated */}
              <div className="text-xs text-white/30 sc-mono text-center pt-2 border-t border-white/5">
                Last scanned: {mounted && issuesData.lastUpdated ? new Date(issuesData.lastUpdated).toLocaleString() : '...'}
                {' • '}
                <button
                  onClick={loadIssues}
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Refresh Now
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No Issues Found"
              message="All critical issues have been resolved! 🎉"
            />
          )}
        </ExpandableSection>
                </>
              );
            })()}
          </>
        ) : null}
      </div>
    </div>
  );
}
