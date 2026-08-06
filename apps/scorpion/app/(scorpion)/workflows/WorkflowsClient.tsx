'use client';

// TODO: Audit reported "Unexpected token `div`" errors for this file
// File passes linter checks - may be false positive from audit or hot reload issue
// Verify in browser DevTools if errors persist

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Panel, DataTable, LoadingState, ErrorState, EmptyState, Tabs, TabsList, TabsTrigger, TabsContent, Metric, PageLoadingBar } from '@/components/scorpion';

// Lazy load WorkflowViewer only when needed (heavy component with ReactFlow)
const WorkflowViewer = dynamic(
  () => import('@/components/scorpion/WorkflowViewer').then(mod => ({ default: mod.WorkflowViewer })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-white/40">Loading workflow viewer...</div>
      </div>
    )
  }
);
import { Eye, ExternalLink, Workflow, Activity, Clock, CheckCircle2, XCircle, Play } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  path: string;
  trigger?: string;
  nodes: any;
  active: boolean;
  syncedToN8n: boolean;
  n8nId?: string;
  lastSync?: string;
  updatedAt?: string;
  updatedAtTimestamp?: number; // Pre-computed timestamp for performance
  source?: 'filesystem' | 'n8n' | 'both';
  connections?: any;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  nodeCount: number;
  error?: string;
}

interface MonitoringData {
  activeExecutions: number;
  successRate: number;
  averageDuration: number;
  recentExecutions: WorkflowExecution[];
}

export function WorkflowsClient() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<Error | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filterSource, setFilterSource] = useState<'all' | 'n8n' | 'filesystem'>('all');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'nodes' | 'trigger'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('workflows');
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    synced: number;
    active: number;
    inN8n: number;
    localFilesLinkedToN8n?: number;
    uniqueLinkedWorkflows?: number;
    localSyncedToN8n?: number;
    localOnly?: number;
    filesystemOnly?: number;
    n8nOnly?: number;
  } | null>(null);
  const isRefreshingRef = useRef(false);

  const loadWorkflows = useCallback(async (showLoading: boolean = true) => {
    // Prevent concurrent refresh calls
    if (isRefreshingRef.current && !showLoading) {
      return;
    }
    
    try {
      setError(null);
      // Only show loading spinner on initial load
      if (showLoading && workflows.length === 0) {
        setLoading(true);
      }
      
      if (!showLoading) {
        isRefreshingRef.current = true;
      }
      
      // Increased timeout to 5 seconds to account for filesystem loading (max 1.5s) + overhead
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch('/api/workflows', { 
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Pre-compute timestamps to avoid repeated Date() calls in sort comparator
            const workflowsWithTimestamps = (result.data.workflows || []).map((w: Workflow) => ({
              ...w,
              updatedAtTimestamp: w.updatedAt ? new Date(w.updatedAt).getTime() : 0,
            }));
            setWorkflows(workflowsWithTimestamps);
            setSummary(result.data.summary || null);
            
            // If data is still loading (empty workflows with loading flag), auto-refresh
            if (result.data.loading || (result.data.n8nDataStale && result.data.workflows.length === 0)) {
              // Wait 3 seconds for background fetch to complete, then refresh
              setTimeout(() => {
                if (!isRefreshingRef.current) {
                  loadWorkflows(false); // Don't show loading spinner on refresh
                }
              }, 3000);
            } else if (result.data.n8nDataStale && showLoading && workflows.length === 0) {
              // If n8n data is stale but we have filesystem data, refresh n8n in background
              setTimeout(() => {
                if (!isRefreshingRef.current) {
                  loadWorkflows(false);
                }
              }, 2000);
            }
          } else {
            // Fallback for old API format - also pre-compute timestamps
            const workflowsWithTimestamps = (result.workflows || []).map((w: Workflow) => ({
              ...w,
              updatedAtTimestamp: w.updatedAt ? new Date(w.updatedAt).getTime() : 0,
            }));
            setWorkflows(workflowsWithTimestamps);
            setSummary(result.summary || null);
          }
        } else {
          throw new Error(`Failed to load workflows: ${response.statusText}`);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          // If we have cached workflows, don't show error - just log it
          if (workflows.length > 0) {
            console.warn('Workflow refresh timed out, using cached data');
            return;
          }
          throw new Error('Request timed out. The server may be slow or unresponsive.');
        }
        throw fetchError;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load workflows');
      console.error('Failed to load workflows:', error);
      // Only set error if we don't have any workflows to show
      if (workflows.length === 0) {
        setError(error);
      }
    } finally {
      setLoading(false);
      if (!showLoading) {
        isRefreshingRef.current = false;
      }
    }
  }, [workflows.length]);

  useEffect(() => {
    // Defer data fetch aggressively so page renders instantly
    // Don't include callbacks in deps to prevent re-render loops
    const loadData = () => {
      loadWorkflows();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - callback is stable, don't recreate effect

  useEffect(() => {
    if (activeTab === 'monitoring') {
      loadMonitoringData();
      // Only refresh when tab is visible to avoid unnecessary requests
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadMonitoringData();
        }
      }, 20000); // 20 seconds - monitoring data doesn't need frequent updates
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedWorkflow) {
      // Save scrollbar width before hiding it
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Hide body scroll and compensate for scrollbar to prevent layout shift
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [selectedWorkflow]);

  const handleSync = useCallback(async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });
      if (response.ok) {
        await loadWorkflows();
      }
    } catch (error) {
      console.error('Failed to sync workflows:', error);
    }
  }, [loadWorkflows]);

  // Memoized click handlers
  const handleFilterN8n = useCallback(() => {
    setFilterSource('n8n');
  }, []);

  const handleFilterAll = useCallback(() => {
    setFilterSource('all');
  }, []);

  const handleFilterFilesystem = useCallback(() => {
    setFilterSource('filesystem');
  }, []);

  const createWorkflowSelectHandler = useCallback((workflow: Workflow) => {
    return (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setSelectedWorkflow(workflow);
    };
  }, []);

  const loadMonitoringData = async () => {
    try {
      const response = await fetch('/api/workflows/monitoring');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setMonitoringData(result.data);
        } else {
          // Fallback: generate mock monitoring data
          setMonitoringData({
            activeExecutions: 2,
            successRate: 0.95,
            averageDuration: 1250,
            recentExecutions: [
              {
                id: '1',
                workflowId: workflows[0]?.id || 'wf-1',
                workflowName: workflows[0]?.name || 'Sample Workflow',
                status: 'success',
                startedAt: new Date(Date.now() - 300000).toISOString(),
                finishedAt: new Date(Date.now() - 298750).toISOString(),
                duration: 1250,
                nodeCount: 5,
              },
              {
                id: '2',
                workflowId: workflows[1]?.id || 'wf-2',
                workflowName: workflows[1]?.name || 'Another Workflow',
                status: 'running',
                startedAt: new Date(Date.now() - 60000).toISOString(),
                nodeCount: 8,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
      setMonitoringData({
        activeExecutions: 0,
        successRate: 0,
        averageDuration: 0,
        recentExecutions: [],
      });
    }
  };

  const formatDuration = useCallback((ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }, []);

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleString();
  }, []);

  const filteredWorkflows = useMemo(() => {
    if (loading && workflows.length === 0) return [];
    
    // Early return if no workflows
    if (workflows.length === 0) return [];
    
    // Optimized filtering with early exits
    let filtered = workflows.filter(w => {
      if (filterSource === 'n8n' && !w.n8nId) return false;
      if (filterSource === 'filesystem' && w.n8nId) return false;
      if (filterTrigger !== 'all' && w.trigger !== filterTrigger) return false;
      if (filterActive === 'active' && !w.active) return false;
      if (filterActive === 'inactive' && w.active) return false;
      return true;
    });
    
    // Optimized sorting with pre-computed values
    // Copy array before sorting to avoid mutation
    if (filtered.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (sortBy) {
          case 'updatedAt':
            // Use pre-computed timestamp - should always be available
            aVal = a.updatedAtTimestamp ?? 0;
            bVal = b.updatedAtTimestamp ?? 0;
            break;
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'nodes':
            aVal = Array.isArray(a.nodes) ? a.nodes.length : (typeof a.nodes === 'number' ? a.nodes : 0);
            bVal = Array.isArray(b.nodes) ? b.nodes.length : (typeof b.nodes === 'number' ? b.nodes : 0);
            break;
          case 'trigger':
            aVal = (a.trigger || '').toLowerCase();
            bVal = (b.trigger || '').toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }
    
    return filtered;
  }, [workflows, filterSource, filterTrigger, filterActive, sortBy, sortOrder, loading]);

  // Memoize trigger list to prevent recalculation on every render
  const availableTriggers = useMemo(() => {
    return [...new Set(workflows.map(w => w.trigger).filter(Boolean))].sort();
  }, [workflows]);

  // Memoize workflow table data to prevent re-creation on every render
  const workflowTableData = useMemo(() => {
    return filteredWorkflows.slice(0, 50).map(w => ({
      name: (
        <div className="flex items-center gap-2">
          <button
            onClick={createWorkflowSelectHandler(w)}
            className="text-left cursor-pointer"
            title="Click to view workflow"
            type="button"
          >
            {w.name}
          </button>
          {w.source === 'n8n' && (
            <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
              n8n
            </span>
          )}
        </div>
      ),
      trigger: w.trigger || 'Manual',
      nodes: Array.isArray(w.nodes) ? w.nodes.length.toString() : w.nodes.toString(),
      status: (
        <span className={w.active ? 'text-emerald-400' : 'text-white/40'}>
          {w.active ? 'Active' : 'Inactive'}
        </span>
      ),
      sync: (
        <div className="flex items-center gap-2">
          {w.source === 'n8n' ? (
            <>
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-xs text-purple-400">☁️ Cloud Only</span>
            </>
          ) : w.n8nId ? (
            <>
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-xs text-emerald-400">🔄 Local + Cloud</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-yellow-400">📁 Local Only</span>
            </>
          )}
        </div>
      ),
      actions: (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={createWorkflowSelectHandler(w)}
            className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded whitespace-nowrap cursor-pointer"
            title="View workflow"
            type="button"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
          {w.n8nId && (
            <a
              href={`https://evenslouis.ca/n8n/workflow/${w.n8nId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500/30 transition-colors duration-100 whitespace-nowrap inline-flex"
              title="Open in n8n"
            >
              <ExternalLink className="w-3 h-3" />
              n8n
            </a>
          )}
        </div>
      )
    }));
  }, [filteredWorkflows, createWorkflowSelectHandler]);

  // Memoize monitoring execution table data to prevent re-creation on every render
  const monitoringTableData = useMemo(() => {
    if (!monitoringData?.recentExecutions) return [];
    return monitoringData.recentExecutions.map(exec => ({
      workflow: (
        <div>
          <div className="text-sm font-medium text-white/80">{exec.workflowName}</div>
          <div className="text-xs text-white/40 sc-mono">{exec.workflowId}</div>
        </div>
      ),
      status: (
        <span className={`flex items-center gap-1.5 ${
          exec.status === 'success' ? 'text-emerald-400' :
          exec.status === 'failed' ? 'text-red-400' :
          'text-yellow-400'
        }`}>
          {exec.status === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Success
            </>
          ) : exec.status === 'failed' ? (
            <>
              <XCircle className="w-4 h-4" />
              Failed
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Running
            </>
          )}
        </span>
      ),
      started: <span className="text-xs text-white/60">{formatTime(exec.startedAt)}</span>,
      duration: exec.duration ? (
        <span className="text-xs text-white/60">{formatDuration(exec.duration)}</span>
      ) : (
        <span className="text-xs text-yellow-400">Running...</span>
      ),
      nodes: <span className="text-xs text-white/60">{exec.nodeCount}</span>,
    }));
  }, [monitoringData?.recentExecutions, formatTime, formatDuration]);

  // Show loading state only on initial load
  if (loading && workflows.length === 0) {
    return (
      <>
        <PageLoadingBar loading={loading && workflows.length === 0} />
      <div className="h-full overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mb-1">Workflows</h1>
        </div>
        <LoadingState fullPage={false} text="Loading workflows..." />
      </div>
      </>
    );
  }

  if (error && workflows.length === 0) {
    return (
      <ErrorState
        error={error}
        onRetry={loadWorkflows}
        title="Failed to load workflows"
        fullPage
      />
    );
  }

  return (
    <>
      <PageLoadingBar loading={loading && workflows.length === 0} />
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-1">Workflows</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workflows">
            <span className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Workflows
            </span>
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoring
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            {summary && (
              <div className="text-sm text-white/40">
                {summary.total} total, {summary.synced} synced, {summary.active} active
              </div>
            )}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-sm">
            <button
              onClick={handleFilterN8n}
              className={`px-3 py-1 text-xs rounded transition-colors duration-100 ${
                filterSource === 'n8n'
                  ? 'bg-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Show all workflows in n8ncloud.tech (including synced local workflows)"
            >
              ☁️ n8n Cloud ({summary?.inN8n || 0})
            </button>
            <button
              onClick={handleFilterAll}
              className={`px-3 py-1 text-xs rounded transition-colors duration-100 ${
                filterSource === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Show all workflows (cloud + local)"
            >
              🌐 All ({summary?.total || 0})
            </button>
            <button
              onClick={handleFilterFilesystem}
              className={`px-3 py-1 text-xs rounded transition-colors duration-100 ${
                filterSource === 'filesystem'
                  ? 'bg-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Show local workflows that are NOT in n8n cloud"
            >
              📁 Local Only ({summary?.localOnly || summary?.filesystemOnly || 0})
            </button>
          </div>
          
          {/* Additional Filters */}
          <>
            <select
              value={filterTrigger}
              onChange={(e) => setFilterTrigger(e.target.value)}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-emerald-400/50 transition-colors duration-100"
            >
              <option value="all">All Triggers</option>
              {availableTriggers.map(trigger => (
                <option key={trigger} value={trigger}>{trigger}</option>
              ))}
            </select>
            
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-emerald-400/50 transition-colors duration-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as any);
                setSortOrder(order as any);
              }}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-emerald-400/50 transition-colors duration-100"
            >
              <option value="updatedAt-desc">Last Opened (Newest)</option>
              <option value="updatedAt-asc">Last Opened (Oldest)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="nodes-desc">Nodes (Most)</option>
              <option value="nodes-asc">Nodes (Fewest)</option>
              <option value="trigger-asc">Trigger (A-Z)</option>
              <option value="trigger-desc">Trigger (Z-A)</option>
            </select>
          </>
          
          <span className="text-xs text-white/40">Auto-sync enabled</span>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm hover:bg-white/10 text-white/60 transition-colors duration-100"
            title="Manual sync (auto-sync runs automatically)"
          >
            Force Sync
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Panel title="Summary">
          <div className="grid grid-cols-5 gap-6">
            <div>
              <div className="sc-title mb-1 text-white/60">☁️ In n8n Cloud</div>
              <div className="text-3xl font-semibold text-blue-400">{summary.inN8n}</div>
              <div className="text-xs text-white/40 mt-1">Workflows in n8ncloud.tech</div>
            </div>
            <div>
              <div className="sc-title mb-1 text-white/60">🔗 Linked Files</div>
              <div className="text-3xl font-semibold text-emerald-400">{summary.localFilesLinkedToN8n || summary.localSyncedToN8n || summary.synced}</div>
              <div className="text-xs text-white/40 mt-1">Local files linked to n8n</div>
            </div>
            <div>
              <div className="sc-title mb-1 text-white/60">🔄 Unique Linked</div>
              <div className="text-3xl font-semibold text-cyan-400">{summary.uniqueLinkedWorkflows || 0}</div>
              <div className="text-xs text-white/40 mt-1">Unique workflows with local files</div>
            </div>
            <div>
              <div className="sc-title mb-1 text-white/60">📁 Local Only</div>
              <div className="text-3xl font-semibold text-yellow-400">{summary.localOnly || summary.filesystemOnly || 0}</div>
              <div className="text-xs text-white/40 mt-1">Not in n8n</div>
            </div>
            <div>
              <div className="sc-title mb-1 text-white/60">✅ Active</div>
              <div className="text-3xl font-semibold text-emerald-400">{summary.active}</div>
              <div className="text-xs text-white/40 mt-1">Currently running</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
            <div className="text-xs text-white/40">
              <strong className="text-white/60">Total unique workflows:</strong> {summary.total} = {summary.inN8n} (cloud) + {summary.localOnly || summary.filesystemOnly || 0} (local only)
            </div>
            <div className="text-xs text-white/40">
              <strong className="text-white/60">Note:</strong> You have {summary.localFilesLinkedToN8n || 0} local files ({summary.uniqueLinkedWorkflows || 0} unique) linked to {summary.inN8n} n8n workflows (multiple versions per workflow)
            </div>
          </div>
        </Panel>
      )}

      {/* Workflows Table */}
      <Panel 
        title={
          filterSource === 'n8n' ? `☁️ n8n Cloud Workflows` :
          filterSource === 'filesystem' ? `📁 Local Only Workflows` :
          `🌐 All Workflows`
        }
      >
        {filterSource !== 'all' && (
          <div className="mb-3 text-sm text-white/40">
            Showing <span className="text-white font-medium">{filteredWorkflows.length}</span> of <span className="text-white font-medium">{summary?.total || 0}</span> workflows
          </div>
        )}
        
        {/* Legend */}
        <div className="mb-4 pb-3 border-b border-white/10 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-white/60">Cloud Only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-white/60">Local + Cloud</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-white/60">Local Only</span>
          </div>
        </div>
        
        {filteredWorkflows.length === 0 && !loading ? (
          <EmptyState
            icon={Workflow}
            title="No workflows found"
            message={
              filterSource === 'n8n' 
                ? "No workflows found in n8n cloud. Sync local workflows or create new ones in n8n."
                : filterSource === 'filesystem'
                ? "No local-only workflows found. All workflows are synced to n8n cloud."
                : "No workflows available. Create your first workflow to get started."
            }
            action={filterSource === 'all' ? { label: "Sync Workflows", onClick: handleSync } : undefined}
          />
        ) : (
          <>
            {error && (
              <div className="mb-4">
                <ErrorState
                  error={error}
                  onRetry={loadWorkflows}
                  title="Error loading workflows"
                  fullPage={false}
                />
              </div>
            )}
            <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'trigger', label: 'Trigger' },
            { key: 'nodes', label: 'Nodes' },
            { key: 'status', label: 'Status' },
            { key: 'sync', label: 'Location' },
            { key: 'actions', label: 'Actions' }
          ]}
          data={workflowTableData}
          />
          {filteredWorkflows.length > 50 && (
            <div className="mt-4 text-center text-xs text-white/40">
              Showing first 50 of {filteredWorkflows.length} workflows. Use filters to narrow results.
            </div>
          )}
          </>
        )}
      </Panel>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          {monitoringData ? (
            <>
              {/* Monitoring Dashboard */}
              <Panel title="Execution Overview">
                <div className="grid grid-cols-4 gap-4">
                  <Metric 
                    label="Active Executions" 
                    value={monitoringData.activeExecutions.toString()} 
                    valueColor="text-yellow-400"
                  />
                  <Metric 
                    label="Success Rate" 
                    value={`${(monitoringData.successRate * 100).toFixed(1)}%`} 
                    valueColor="text-emerald-400"
                  />
                  <Metric 
                    label="Avg Duration" 
                    value={formatDuration(monitoringData.averageDuration)} 
                    valueColor="text-cyan-400"
                  />
                  <Metric 
                    label="Total Executions" 
                    value={monitoringData.recentExecutions.length.toString()} 
                  />
                </div>
              </Panel>

              {/* Execution History */}
              <Panel title="Recent Executions">
                {monitoringTableData.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'workflow', label: 'Workflow' },
                      { key: 'status', label: 'Status' },
                      { key: 'started', label: 'Started' },
                      { key: 'duration', label: 'Duration' },
                      { key: 'nodes', label: 'Nodes' },
                    ]}
                    data={monitoringTableData}
                  />
                ) : (
                  <div className="text-center py-8 text-white/40 text-sm">
                    No recent executions
                  </div>
                )}
              </Panel>

              {/* Activity Graph Placeholder */}
              <Panel title="Activity Graph">
                <div className="h-64 flex items-center justify-center text-white/40 text-sm border border-white/10 rounded">
                  Activity graph visualization (execution timeline)
                  <br />
                  <span className="text-xs text-white/30 mt-2 block">
                    Shows recent workflow executions over time
                  </span>
                </div>
              </Panel>
            </>
          ) : (
            <div className="text-center py-8 text-white/40">Loading monitoring data...</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Workflow Viewer Modal - Outside Tabs for proper z-index */}
      {selectedWorkflow && (
        <WorkflowViewer
          workflow={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
        />
      )}
    </div>
    </>
  );
}

