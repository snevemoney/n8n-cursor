'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, DataTable } from '@/components/scorpion';
import { ChevronDown, ChevronRight, Folder, File, Database, Workflow, Code, AlertCircle, CheckCircle2, Clock, RefreshCw, MessageSquare } from 'lucide-react';

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

export default function ProjectPage() {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
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
      }
    } catch (error) {
      console.error('Failed to load project status:', error);
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
        console.error('Ingestion failed:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to ingest knowledge:', error);
    } finally {
      setIngesting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0d10]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20 mx-auto"></div>
          <div className="text-sm text-white/40 sc-mono">Loading project analysis...</div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0d10]">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-sm text-white/40 sc-mono">No project status available</div>
          <div className="text-xs text-white/30 sc-mono leading-relaxed">
            Auto-sync is initializing... Knowledge will be ingested automatically.
          </div>
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 disabled:opacity-50 text-white/60 sc-mono transition-all"
            title="Manual sync (auto-sync runs automatically)"
          >
            {ingesting ? 'Ingesting...' : 'Force Sync Now'}
          </button>
        </div>
      </div>
    );
  }

  const syncPercentage = status.workflows.total > 0 
    ? Math.round((status.workflows.synced / status.workflows.total) * 100)
    : 0;

  return (
    <div className="h-full overflow-y-auto bg-[#0a0d10]">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header - Clean and Structured */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="sc-title text-2xl font-bold mb-2">Project Dashboard</h1>
            <div className="flex items-center gap-4 text-sm text-white/50 sc-mono">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Last ingestion: {mounted && status.lastIngestion ? new Date(status.lastIngestion).toLocaleString() : '...'}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Auto-sync enabled</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 disabled:opacity-50 text-white/60 sc-mono transition-all"
            title="Manual sync (auto-sync runs automatically)"
          >
            <RefreshCw className={`h-4 w-4 ${ingesting ? 'animate-spin' : ''}`} />
            {ingesting ? 'Syncing...' : 'Manual Sync'}
          </button>
        </div>

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="h-4 w-4 text-white/40" />
                  <span className="text-xs text-white/50 sc-mono uppercase">Apps</span>
                </div>
                <div className="text-2xl font-bold text-white">{status.workspace.apps}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <File className="h-4 w-4 text-white/40" />
                  <span className="text-xs text-white/50 sc-mono uppercase">Packages</span>
                </div>
                <div className="text-2xl font-bold text-white">{status.workspace.packages}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-white/40" />
                  <span className="text-xs text-white/50 sc-mono uppercase">Databases</span>
                </div>
                <div className="text-2xl font-bold text-white">{status.databases}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow className="h-4 w-4 text-white/40" />
                  <span className="text-xs text-white/50 sc-mono uppercase">Workflows</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {status.workflows.synced}/{status.workflows.total}
                </div>
                <div className="text-xs text-white/40 mt-1 sc-mono">
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-xs text-white/50 sc-mono uppercase mb-2">Total</div>
              <div className="text-2xl font-bold text-white">{status.techDebt.total}</div>
            </div>
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-400/20 text-center">
              <div className="text-xs text-red-400 sc-mono uppercase mb-2">Critical</div>
              <div className="text-2xl font-bold text-red-400">{status.techDebt.critical}</div>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-400/20 text-center">
              <div className="text-xs text-yellow-400 sc-mono uppercase mb-2">High</div>
              <div className="text-2xl font-bold text-yellow-400">{status.techDebt.high}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-xs text-white/50 sc-mono uppercase mb-2">Medium</div>
              <div className="text-2xl font-bold text-white/60">{status.techDebt.medium}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-xs text-white/50 sc-mono uppercase mb-2">Low</div>
              <div className="text-2xl font-bold text-white/40">{status.techDebt.low}</div>
            </div>
          </div>
        </ExpandableSection>

        {/* Missing Features - Expandable Section */}
        <ExpandableSection 
          title="Missing Features" 
          icon={<AlertCircle className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-400/20">
              <div className="text-xs text-red-400 sc-mono uppercase mb-2">P0 (Critical)</div>
              <div className="text-2xl font-bold text-red-400">{status.missingFeatures.p0}</div>
              <div className="text-xs text-white/40 mt-2 sc-mono">Requires immediate attention</div>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-400/20">
              <div className="text-xs text-yellow-400 sc-mono uppercase mb-2">P1 (High)</div>
              <div className="text-2xl font-bold text-yellow-400">{status.missingFeatures.p1}</div>
              <div className="text-xs text-white/40 mt-2 sc-mono">High priority features</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="text-xs text-white/50 sc-mono uppercase mb-2">P2 (Medium)</div>
              <div className="text-2xl font-bold text-white/60">{status.missingFeatures.p2}</div>
              <div className="text-xs text-white/40 mt-2 sc-mono">Nice to have features</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="text-xs text-white/50 sc-mono uppercase mb-2">Total Knowledge Items</div>
              <div className="text-2xl font-bold text-white">{status.knowledge.total}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="text-xs text-white/50 sc-mono uppercase mb-2">Last Ingestion</div>
              <div className="text-lg font-semibold text-white sc-mono">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-white/40" />
                <span className="text-xs text-white/50 sc-mono uppercase">Total Conversations</span>
              </div>
              <div className="text-2xl font-bold text-white">{status.conversations.total}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-white/40" />
                <span className="text-xs text-white/50 sc-mono uppercase">Total Messages</span>
              </div>
              <div className="text-2xl font-bold text-white">{status.conversations.totalMessages}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-white/40" />
                <span className="text-xs text-white/50 sc-mono uppercase">Recent (7 days)</span>
              </div>
              <div className="text-2xl font-bold text-white">{status.conversations.recent}</div>
            </div>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}
