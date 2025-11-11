'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Panel, DataTable, LogRow, Metric, Tabs, TabsList, TabsTrigger, TabsContent, LoadingState, ErrorState, EmptyState, useToast, PageLoadingBar } from '@/components/scorpion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Pause, Edit, Trash2, Copy, Search, Plus, MoreVertical, Users } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';

interface AgentSummary {
  id: string;
  codename: string;
  role: string;
  status: 'active' | 'standby' | 'offline';
  stats: {
    totalActivities: number;
    successCount: number;
    failedCount: number;
  };
}

interface AgentLog {
  time: string;
  text: string;
  level: 'info' | 'warn' | 'error';
}

export default function AgentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'standby' | 'offline'>('all');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: agentsData, loading: dataLoading, error: dataError, refetch } = usePageData({
    fetchFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const result = await response.json();
      return result.success && result.data ? result.data : result;
    },
    cacheKey: 'scorpion-agents-cache',
    timeout: 10000,
    retry: 1,
  });

  const agents = agentsData?.agents || [];
  const summary = agentsData?.summary || { total: 0, active: 0, standby: 0, offline: 0 };

  const loadAgentLogs = useCallback(async () => {
    try {
      // Get agent activity logs from operations executor
      const response = await fetch('/api/agents/activity?limit=20');
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        const logs = data.logs || [];
        // Transform to AgentLog format
        const recentLogs = logs.map((log: any) => ({
          time: log.time,
          text: log.text,
          level: log.level
        }));
        setAgentLogs(recentLogs);
      }
    } catch (error) {
      console.error('Failed to load agent logs:', error);
      // Fallback to empty array on error
      setAgentLogs([]);
    }
  }, []);

  useEffect(() => {
    // Load agent logs on mount
    loadAgentLogs();
    
    // Refresh logs every 30 seconds (less frequent to avoid unnecessary requests)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadAgentLogs();
      }
    }, 30000); // Increased from 15s to 30s
    return () => clearInterval(interval);
  }, [loadAgentLogs]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'standby': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-white/40';
    }
  }, []);

  const handleRunPause = useCallback(async (agentId: string, currentStatus: string) => {
    setActionLoading(prev => ({ ...prev, [agentId]: true }));
    try {
      const action = currentStatus === 'active' ? 'pause' : 'run';
      const response = await fetch(`/api/agents/${agentId}/${action}`, {
        method: 'POST',
      });
      if (response.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [agentId]: false }));
    }
  }, [refetch]);

  const handleDelete = useCallback(async (agentId: string, codename: string) => {
    if (deleteConfirm !== agentId) {
      setDeleteConfirm(agentId);
      showToast('warning', `Click delete again to confirm deletion of "${codename}"`);
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [agentId]: true }));
    setDeleteConfirm(null);
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await refetch();
        showToast('success', `Agent "${codename}" deleted successfully`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to delete agent');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete agent';
      showToast('error', errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [agentId]: false }));
    }
  }, [deleteConfirm, refetch, showToast]);

  const handleDuplicate = useCallback(async (agentId: string) => {
    setActionLoading(prev => ({ ...prev, [agentId]: true }));
    try {
      const response = await fetch(`/api/agents/${agentId}/duplicate`, {
        method: 'POST',
      });
      if (response.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Failed to duplicate agent:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [agentId]: false }));
    }
  }, [refetch]);

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const filteredAgents = useMemo(() => {
    if (!agents.length) return [];
    
    // Pre-compute lowercase search query once
    const query = searchQuery ? searchQuery.toLowerCase() : '';
    
    return agents.filter(agent => {
      // Status filter
      if (statusFilter !== 'all' && agent.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (query) {
        return (
          agent.id.toLowerCase().includes(query) ||
          agent.codename.toLowerCase().includes(query) ||
          agent.role.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [agents, statusFilter, searchQuery]);

  // Reusable function to create table row data - memoized to prevent recreation
  const createAgentRowData = useCallback((a: AgentSummary) => ({
    id: (
      <Link href={`/agents/${a.id}`} className="sc-mono hover:text-cyan-400 transition-colors">
        {a.id}
      </Link>
    ),
    codename: (
      <Link href={`/agents/${a.id}`} className="hover:text-cyan-400 transition-colors">
        {a.codename}
      </Link>
    ),
    role: <span className="text-white/60 text-sm">{a.role}</span>,
    success: <span className="text-emerald-300">{a.stats?.successCount ?? 0}</span>,
    failed: <span className="text-red-300">{a.stats?.failedCount ?? 0}</span>,
    status: <span className={getStatusColor(a.status)}>{(a.status || 'offline').toUpperCase()}</span>,
    actions: (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRunPause(a.id, a.status);
          }}
          disabled={actionLoading[a.id]}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title={a.status === 'active' ? 'Pause agent' : 'Run agent'}
        >
          {a.status === 'active' ? (
            <Pause className="w-3.5 h-3.5 text-yellow-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>
        <Link
          href={`/agents/${a.id}?edit=true`}
          onClick={handleStopPropagation}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Edit agent"
        >
          <Edit className="w-3.5 h-3.5 text-blue-400" />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDuplicate(a.id);
          }}
          disabled={actionLoading[a.id]}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Duplicate agent"
        >
          <Copy className="w-3.5 h-3.5 text-cyan-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(a.id, a.codename);
          }}
          disabled={actionLoading[a.id]}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Delete agent"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    ),
  }), [getStatusColor, handleRunPause, handleDuplicate, handleDelete, handleStopPropagation, actionLoading]);

  // Memoize status-filtered arrays to avoid repeated filtering on every render
  // Must be declared BEFORE table data that uses them
  const activeAgents = useMemo(() => 
    filteredAgents.filter(a => a.status === 'active'),
    [filteredAgents]
  );
  const standbyAgents = useMemo(() => 
    filteredAgents.filter(a => a.status === 'standby'),
    [filteredAgents]
  );
  const offlineAgents = useMemo(() => 
    filteredAgents.filter(a => a.status === 'offline'),
    [filteredAgents]
  );

  // Memoize DataTable data to prevent re-creation on every render
  const tableData = useMemo(() => {
    return filteredAgents.map(createAgentRowData);
  }, [filteredAgents, createAgentRowData]);

  const activeTableData = useMemo(() => {
    return activeAgents.map(createAgentRowData);
  }, [activeAgents, createAgentRowData]);

  const standbyTableData = useMemo(() => {
    return standbyAgents.map(createAgentRowData);
  }, [standbyAgents, createAgentRowData]);

  const offlineTableData = useMemo(() => {
    return offlineAgents.map(createAgentRowData);
  }, [offlineAgents, createAgentRowData]);

  // Render page structure immediately, show loading states inline

  return (
    <>
      <PageLoadingBar loading={dataLoading && agents.length === 0} />
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h1 className="sc-title text-2xl">Agent Fleet</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/agents/create')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-sm"
            title="Create new agent"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      </div>

      {dataError && (
        <ErrorState
          error={dataError}
          onRetry={refetch}
          title="Error loading agents"
          fullPage={false}
        />
      )}

      {/* Agent Summary Stats */}
      <Panel title="Agent Fleet Overview">
        <div className="grid grid-cols-4 gap-4">
          <Metric label="Total Agents" value={(summary?.total ?? 0).toString()} />
          <Metric label="Active" value={(summary?.active ?? 0).toString()} valueColor="text-emerald-400" />
          <Metric label="Standby" value={(summary?.standby ?? 0).toString()} valueColor="text-yellow-400" />
          <Metric label="Offline" value={(summary?.offline ?? 0).toString()} valueColor="text-red-400" />
        </div>
      </Panel>

      {/* Tabs and Search */}
      <Panel>
        <Tabs defaultValue="all" value={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All ({summary?.total ?? 0})</TabsTrigger>
              <TabsTrigger value="active">Active ({summary?.active ?? 0})</TabsTrigger>
              <TabsTrigger value="standby">Standby ({summary?.standby ?? 0})</TabsTrigger>
              <TabsTrigger value="offline">Offline ({summary?.offline ?? 0})</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>
          </div>

          <TabsContent value="all">
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <Panel title="Agent Roster">
                {dataLoading && agents.length === 0 ? (
                  <LoadingState variant="skeleton" skeletonLines={5} text="Loading agents..." />
                ) : filteredAgents.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title={searchQuery ? 'No agents match your search' : 'No agents yet'}
                    message={searchQuery ? 'Try adjusting your search criteria' : 'Create your first agent to get started'}
                    action={!searchQuery ? { label: "Create Agent", onClick: () => router.push('/agents/create') } : undefined}
                  />
                ) : (
                  <DataTable
                    columns={[
                      { key: 'id', label: 'Agent ID' },
                      { key: 'codename', label: 'Codename' },
                      { key: 'role', label: 'Role' },
                      { key: 'success', label: 'Success' },
                      { key: 'failed', label: 'Failed' },
                      { key: 'status', label: 'Status' },
                      { key: 'actions', label: 'Actions' },
                    ]}
                    data={tableData}
                  />
                )}
              </Panel>

              <Panel title="Agent Activity Feed">
                <div className="space-y-0">
                  {agentLogs.length > 0 ? (
                    agentLogs.map((log, idx) => (
                      <LogRow key={idx} time={log.time} text={log.text} level={log.level} />
                    ))
                  ) : (
                    <div className="text-center py-4 text-white/40 text-sm">
                      No recent agent activity
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <Panel title="Active Agents">
                {dataLoading ? (
                  <LoadingState text="Loading agents..." />
                ) : activeAgents.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No active agents"
                    message="No agents are currently active"
                  />
                ) : (
                  <DataTable
                    columns={[
                      { key: 'id', label: 'Agent ID' },
                      { key: 'codename', label: 'Codename' },
                      { key: 'role', label: 'Role' },
                      { key: 'success', label: 'Success' },
                      { key: 'failed', label: 'Failed' },
                      { key: 'actions', label: 'Actions' },
                    ]}
                    data={activeTableData}
                  />
                )}
              </Panel>
              <Panel title="Activity Feed">
                <div className="space-y-0">
                  {agentLogs.length > 0 ? (
                    agentLogs.map((log, idx) => (
                      <LogRow key={idx} time={log.time} text={log.text} level={log.level} />
                    ))
                  ) : (
                    <div className="text-center py-4 text-white/40 text-sm">
                      No recent agent activity
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="standby">
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <Panel title="Standby Agents">
                {dataLoading ? (
                  <LoadingState text="Loading agents..." />
                ) : standbyAgents.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No standby agents"
                    message="No agents are currently on standby"
                  />
                ) : (
                  <DataTable
                    columns={[
                      { key: 'id', label: 'Agent ID' },
                      { key: 'codename', label: 'Codename' },
                      { key: 'role', label: 'Role' },
                      { key: 'success', label: 'Success' },
                      { key: 'failed', label: 'Failed' },
                      { key: 'actions', label: 'Actions' },
                    ]}
                    data={standbyTableData}
                  />
                )}
              </Panel>
              <Panel title="Activity Feed">
                <div className="space-y-0">
                  {agentLogs.length > 0 ? (
                    agentLogs.map((log, idx) => (
                      <LogRow key={idx} time={log.time} text={log.text} level={log.level} />
                    ))
                  ) : (
                    <div className="text-center py-4 text-white/40 text-sm">
                      No recent agent activity
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="offline">
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <Panel title="Offline Agents">
                {dataLoading ? (
                  <LoadingState text="Loading agents..." />
                ) : offlineAgents.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No offline agents"
                    message="All agents are online"
                  />
                ) : (
                  <DataTable
                    columns={[
                      { key: 'id', label: 'Agent ID' },
                      { key: 'codename', label: 'Codename' },
                      { key: 'role', label: 'Role' },
                      { key: 'success', label: 'Success' },
                      { key: 'failed', label: 'Failed' },
                      { key: 'actions', label: 'Actions' },
                    ]}
                    data={offlineTableData}
                  />
                )}
              </Panel>
              <Panel title="Activity Feed">
                <div className="space-y-0">
                  {agentLogs.length > 0 ? (
                    agentLogs.map((log, idx) => (
                      <LogRow key={idx} time={log.time} text={log.text} level={log.level} />
                    ))
                  ) : (
                    <div className="text-center py-4 text-white/40 text-sm">
                      No recent agent activity
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </TabsContent>
        </Tabs>
      </Panel>
    </div>
    </>
  );
}

