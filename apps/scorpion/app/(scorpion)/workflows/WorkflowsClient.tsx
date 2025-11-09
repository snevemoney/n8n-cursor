'use client';

import { useState, useEffect, useMemo } from 'react';
import { Panel, DataTable } from '@/components/scorpion';
import { WorkflowViewer } from '@/components/scorpion/WorkflowViewer';
import { Eye, ExternalLink } from 'lucide-react';

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
  source?: 'filesystem' | 'n8n' | 'both';
  connections?: any;
}

export function WorkflowsClient() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filterSource, setFilterSource] = useState<'all' | 'n8n' | 'filesystem'>('n8n');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'nodes' | 'trigger'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
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
  };

  const filteredWorkflows = useMemo(() => {
    if (loading) return [];
    
    let filtered = workflows.filter(w => {
      if (filterSource === 'n8n' && !w.n8nId) return false;
      if (filterSource === 'filesystem' && w.n8nId) return false;
      if (filterTrigger !== 'all' && w.trigger !== filterTrigger) return false;
      if (filterActive === 'active' && !w.active) return false;
      if (filterActive === 'inactive' && w.active) return false;
      return true;
    });
    
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'updatedAt':
          aVal = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          bVal = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
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
    
    return filtered;
  }, [workflows, filterSource, filterTrigger, filterActive, sortBy, sortOrder, loading]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-white/40">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Workflows</h1>
          {summary && (
            <div className="text-sm text-white/40">
              {summary.total} total, {summary.synced} synced, {summary.active} active
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-sm">
            <button
              onClick={() => setFilterSource('n8n')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filterSource === 'n8n'
                  ? 'bg-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Show all workflows in n8ncloud.tech (including synced local workflows)"
            >
              ☁️ n8n Cloud ({summary?.inN8n || 0})
            </button>
            <button
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filterSource === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Show all workflows (cloud + local)"
            >
              🌐 All ({summary?.total || 0})
            </button>
            <button
              onClick={() => setFilterSource('filesystem')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
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
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-emerald-400/50"
            >
              <option value="all">All Triggers</option>
              {[...new Set(workflows.map(w => w.trigger).filter(Boolean))].sort().map(trigger => (
                <option key={trigger} value={trigger}>{trigger}</option>
              ))}
            </select>
            
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-emerald-400/50"
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
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-emerald-400/50"
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
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm hover:bg-white/10 text-white/60"
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
        
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'trigger', label: 'Trigger' },
            { key: 'nodes', label: 'Nodes' },
            { key: 'status', label: 'Status' },
            { key: 'sync', label: 'Location' },
            { key: 'actions', label: 'Actions' }
          ]}
          data={filteredWorkflows.map(w => ({
            name: (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWorkflow(w)}
                  className="text-left hover:text-blue-400 transition-colors cursor-pointer hover:underline"
                  title="Click to view workflow"
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
                  onClick={() => setSelectedWorkflow(w)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30 transition-colors whitespace-nowrap"
                  title="View workflow"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                {w.n8nId && (
                  <a
                    href={`https://n8ncloud.tech/workflow/${w.n8nId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500/30 transition-colors whitespace-nowrap inline-flex"
                    title="Open in n8n"
                  >
                    <ExternalLink className="w-3 h-3" />
                    n8n
                  </a>
                )}
              </div>
            )
          }))}
        />
      </Panel>

      {/* Workflow Viewer Modal */}
      {selectedWorkflow && (
        <WorkflowViewer
          workflow={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
        />
      )}
    </div>
  );
}

