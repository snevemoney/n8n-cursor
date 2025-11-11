'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, DataTable, Tabs, TabsList, TabsTrigger, TabsContent, AgentBrainView, LoadingState, ErrorState, EmptyState, PageLoadingBar } from '@/components/scorpion';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Edit, Trash2, Copy, Download, Settings, History, Network, Brain, User } from 'lucide-react';

interface AgentActivity {
  id: string;
  timestamp: string;
  type: 'task' | 'analysis' | 'decision' | 'collaboration';
  description: string;
  risk: 'low' | 'medium' | 'high';
  status: 'success' | 'failed' | 'pending';
}

interface AgentDossier {
  id: string;
  codename: string;
  role: string;
  weight: number;
  expertise: string;
  age: string | null;
  createdAt: string;
  status: 'active' | 'standby' | 'offline';
  stats: {
    totalActivities: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
  };
  riskProfile: {
    low: number;
    medium: number;
    high: number;
  };
  recentActivities: AgentActivity[];
}

interface AgentConfig {
  systemPrompt: string;
  model: string;
  temperature: number;
  tools: string[];
  parameters: Record<string, any>;
}

interface AgentRelationships {
  workflows: Array<{
    id: string;
    name: string;
    n8nId?: string;
  }>;
  collaboratingAgents: Array<{
    id: string;
    codename: string;
    role: string;
  }>;
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  const [dossier, setDossier] = useState<AgentDossier | null>(null);
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [relationships, setRelationships] = useState<AgentRelationships | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // Defer data fetches aggressively so page renders instantly
      const loadData = () => {
        loadAgentDossier();
        loadAgentConfig();
        loadAgentRelationships();
      };
      
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
      } else {
        setTimeout(loadData, 0); // Immediate fallback
      }
    }
  }, [id]);

  const loadAgentDossier = async () => {
    try {
      setError(null);
      // Only show loading spinner on initial load
      if (!dossier) {
        setLoading(true);
      }
      const response = await fetch(`/api/agents/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDossier(result.data);
        } else {
          // Fallback for old API format
          setDossier(result);
        }
      } else {
        throw new Error(response.status === 404 ? 'Agent not found' : `Failed to load agent: ${response.statusText}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load agent dossier');
      console.error('Failed to load agent dossier:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentConfig = async () => {
    try {
      const response = await fetch(`/api/agents/${id}/config`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setConfig(result.data);
        } else {
          // Fallback: generate mock config
          setConfig({
            systemPrompt: 'You are a helpful AI agent specialized in automation and workflow management.',
            model: 'gpt-4',
            temperature: 0.7,
            tools: ['n8n-mcp', 'code-execution', 'file-operations'],
            parameters: { maxIterations: 10, timeout: 30000 },
          });
        }
      }
    } catch (error) {
      console.error('Failed to load agent config:', error);
      // Set default config on error
      setConfig({
        systemPrompt: 'Configuration not available',
        model: 'unknown',
        temperature: 0.7,
        tools: [],
        parameters: {},
      });
    }
  };

  const loadAgentRelationships = async () => {
    try {
      const response = await fetch(`/api/agents/${id}/relationships`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRelationships(result.data);
        } else {
          // Fallback: empty relationships
          setRelationships({ workflows: [], collaboratingAgents: [] });
        }
      }
    } catch (error) {
      console.error('Failed to load agent relationships:', error);
      setRelationships({ workflows: [], collaboratingAgents: [] });
    }
  };

  const handleRunPause = async () => {
    if (!dossier) return;
    setActionLoading(true);
    try {
      const action = dossier.status === 'active' ? 'pause' : 'run';
      const response = await fetch(`/api/agents/${id}/${action}`, {
        method: 'POST',
      });
      if (response.ok) {
        await loadAgentDossier();
      }
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!dossier) return;
    if (!confirm(`Are you sure you want to delete agent "${dossier.codename}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        window.location.href = '/agents';
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/agents/${id}/duplicate`, {
        method: 'POST',
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.id) {
          window.location.href = `/agents/${result.data.id}`;
        }
      }
    } catch (error) {
      console.error('Failed to duplicate agent:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    if (!dossier || !config) return;
    const exportData = {
      dossier,
      config,
      relationships,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-${dossier.codename}-${new Date().toISOString().split('T')[0]}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white/40';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-white/40';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return <LoadingState fullPage text="Loading agent dossier..." />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={loadAgentDossier}
        title="Failed to load agent"
        fullPage
      />
    );
  }

  if (!dossier) {
    return (
      <EmptyState
        icon={User}
        title="Agent not found"
        message="The requested agent could not be found."
        action={{ label: "Back to Agents", onClick: () => window.location.href = '/agents' }}
        fullPage
      />
    );
  }

  return (
    <>
      <PageLoadingBar loading={loading && !dossier} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/agents" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="sc-title text-2xl">Agent Dossier: {dossier.codename}</h1>
          <span className={`px-2 py-1 text-xs rounded ${
            dossier.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            dossier.status === 'standby' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {dossier.status.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunPause}
            disabled={actionLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
              dossier.status === 'active'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
            title={dossier.status === 'active' ? 'Pause agent' : 'Run agent'}
          >
            {dossier.status === 'active' ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </button>
          <Link
            href={`/agents/${id}?edit=true`}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
            title="Edit agent"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDuplicate}
            disabled={actionLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-sm hover:bg-cyan-500/30 transition-colors"
            title="Duplicate agent"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-sm hover:bg-purple-500/30 transition-colors"
            title="Export agent data"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm hover:bg-red-500/30 transition-colors"
            title="Delete agent"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </span>
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </span>
          </TabsTrigger>
          <TabsTrigger value="history">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </span>
          </TabsTrigger>
          <TabsTrigger value="relationships">
            <span className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Relationships
            </span>
          </TabsTrigger>
          <TabsTrigger value="brain">
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Brain View
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Agent Profile Card */}
          <Panel title="Personnel File">
            <div className="grid grid-cols-4 gap-6">
              <div className="border border-white/10 p-4 rounded">
                <div className="text-white/40 text-xs mb-1 sc-mono">AGENT ID</div>
                <div className="text-cyan-400 font-bold sc-mono text-lg">{dossier.id}</div>
              </div>
              <div className="border border-white/10 p-4 rounded">
                <div className="text-white/40 text-xs mb-1 sc-mono">CODENAME</div>
                <div className="text-white font-semibold">{dossier.codename}</div>
              </div>
              <div className="border border-white/10 p-4 rounded">
                <div className="text-white/40 text-xs mb-1 sc-mono">AGE</div>
                <div className="text-white/60">{dossier.age || 'NULL'}</div>
              </div>
              <div className="border border-white/10 p-4 rounded">
                <div className="text-white/40 text-xs mb-1 sc-mono">CREATED</div>
                <div className="text-white/60 text-sm">{getTimeSince(dossier.createdAt)}</div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <div className="text-white/40 text-sm mb-2 sc-mono">ROLE</div>
                <div className="text-white">{dossier.role}</div>
              </div>
              <div>
                <div className="text-white/40 text-sm mb-2 sc-mono">EXPERTISE</div>
                <div className="text-white">{dossier.expertise}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-white/40 text-sm mb-2 sc-mono">WEIGHT</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${dossier.weight * 100}%` }}
                  />
                </div>
                <div className="text-cyan-400 sc-mono text-sm">{dossier.weight.toFixed(2)}</div>
              </div>
            </div>
          </Panel>

          {/* Activity Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Panel title="Activity Statistics">
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Total" value={dossier.stats.totalActivities.toString()} />
                <Metric label="Pending" value={dossier.stats.pendingCount.toString()} valueColor="text-yellow-400" />
                <Metric label="Success" value={dossier.stats.successCount.toString()} valueColor="text-emerald-400" />
                <Metric label="Failed" value={dossier.stats.failedCount.toString()} valueColor="text-red-400" />
              </div>
            </Panel>

            <Panel title="Risk Profile">
              <div className="grid grid-cols-3 gap-4">
                <Metric label="Low Risk" value={dossier.riskProfile.low.toString()} valueColor="text-emerald-400" />
                <Metric label="Medium Risk" value={dossier.riskProfile.medium.toString()} valueColor="text-yellow-400" />
                <Metric label="High Risk" value={dossier.riskProfile.high.toString()} valueColor="text-red-400" />
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          {config ? (
            <>
              <Panel title="Model Settings">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-white/40 text-sm mb-2 sc-mono">MODEL</div>
                    <div className="text-white">{config.model}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-sm mb-2 sc-mono">TEMPERATURE</div>
                    <div className="text-white">{config.temperature}</div>
                  </div>
                </div>
              </Panel>

              <Panel title="System Prompt">
                <div className="p-4 bg-black/40 rounded border border-white/10">
                  <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">
                    {config.systemPrompt}
                  </pre>
                </div>
              </Panel>

              <Panel title="Available Tools">
                <div className="flex flex-wrap gap-2">
                  {config.tools.length > 0 ? (
                    config.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 text-sm"
                      >
                        {tool}
                      </span>
                    ))
                  ) : (
                    <div className="text-white/40 text-sm">No tools configured</div>
                  )}
                </div>
              </Panel>

              <Panel title="Parameters">
                <div className="space-y-2">
                  {Object.keys(config.parameters).length > 0 ? (
                    Object.entries(config.parameters).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                        <span className="text-sm text-white/60 sc-mono">{key}</span>
                        <span className="text-sm text-white/80">{JSON.stringify(value)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/40 text-sm">No parameters configured</div>
                  )}
                </div>
              </Panel>
            </>
          ) : (
            <div className="text-center py-8 text-white/40">Loading configuration...</div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Panel title="Operation History">
            <DataTable
              columns={[
                { key: 'timestamp', label: 'Timestamp' },
                { key: 'type', label: 'Type' },
                { key: 'description', label: 'Description' },
                { key: 'risk', label: 'Risk' },
                { key: 'status', label: 'Status' },
              ]}
              data={dossier.recentActivities.map(activity => ({
                timestamp: <span className="sc-mono text-xs text-white/60">{formatDate(activity.timestamp)}</span>,
                type: <span className="text-cyan-400 text-sm">{activity.type.toUpperCase()}</span>,
                description: activity.description,
                risk: <span className={getRiskColor(activity.risk)}>{activity.risk.toUpperCase()}</span>,
                status: <span className={getStatusColor(activity.status)}>{activity.status.toUpperCase()}</span>,
              }))}
            />
          </Panel>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Panel title="Connected Workflows">
              {relationships && relationships.workflows.length > 0 ? (
                <div className="space-y-2">
                  {relationships.workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="p-3 bg-white/5 rounded border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-white/80">{workflow.name}</div>
                        <div className="text-xs text-white/40 sc-mono">{workflow.id}</div>
                      </div>
                      {workflow.n8nId && (
                        <a
                          href={`https://n8ncloud.tech/workflow/${workflow.n8nId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          View in n8n →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-white/40 text-sm">No connected workflows</div>
              )}
            </Panel>

            <Panel title="Collaborating Agents">
              {relationships && relationships.collaboratingAgents.length > 0 ? (
                <div className="space-y-2">
                  {relationships.collaboratingAgents.map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/agents/${agent.id}`}
                      className="block p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-sm font-medium text-white/80">{agent.codename}</div>
                      <div className="text-xs text-white/40">{agent.role}</div>
                      <div className="text-xs text-white/30 sc-mono mt-1">{agent.id}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-white/40 text-sm">No collaborating agents</div>
              )}
            </Panel>
          </div>
        </TabsContent>

        {/* Brain View Tab */}
        <TabsContent value="brain" className="space-y-4">
          <AgentBrainView agentId={id} />
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
