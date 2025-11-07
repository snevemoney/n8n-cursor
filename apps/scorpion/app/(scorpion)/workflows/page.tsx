'use client';

import { useState, useEffect } from 'react';
import { Panel, DataTable } from '@/components/scorpion';

interface Workflow {
  id: string;
  name: string;
  path: string;
  trigger?: string;
  nodes: number;
  active: boolean;
  syncedToN8n: boolean;
  n8nId?: string;
  lastSync?: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    total: number;
    synced: number;
    active: number;
    inN8n: number;
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
        <div className="flex items-center gap-2">
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
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="sc-title mb-1">Total</div>
              <div className="text-2xl font-semibold">{summary.total}</div>
            </div>
            <div>
              <div className="sc-title mb-1">Synced</div>
              <div className="text-2xl font-semibold text-emerald-400">{summary.synced}</div>
            </div>
            <div>
              <div className="sc-title mb-1">Active</div>
              <div className="text-2xl font-semibold text-emerald-400">{summary.active}</div>
            </div>
            <div>
              <div className="sc-title mb-1">In n8n</div>
              <div className="text-2xl font-semibold">{summary.inN8n}</div>
            </div>
          </div>
        </Panel>
      )}

      {/* Workflows Table */}
      <Panel title="All Workflows">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'trigger', label: 'Trigger' },
            { key: 'nodes', label: 'Nodes' },
            { key: 'status', label: 'Status' },
            { key: 'sync', label: 'Sync Status' },
            { key: 'path', label: 'Path' }
          ]}
          data={workflows.map(w => ({
            name: w.name,
            trigger: w.trigger || 'Manual',
            nodes: w.nodes.toString(),
            status: (
              <span className={w.active ? 'text-emerald-400' : 'text-white/40'}>
                {w.active ? 'Active' : 'Inactive'}
              </span>
            ),
            sync: (
              <div className="flex items-center gap-2">
                {w.syncedToN8n ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs text-emerald-400">Synced</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                    <span className="text-xs text-white/40">Not Synced</span>
                  </>
                )}
              </div>
            ),
            path: <span className="text-xs text-white/40 sc-mono">{w.path}</span>
          }))}
        />
      </Panel>
    </div>
  );
}
