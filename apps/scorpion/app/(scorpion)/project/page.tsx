'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, DataTable } from '@/components/scorpion';

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
  lastIngestion: string;
}

export default function ProjectPage() {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        // Map new API format to expected format
        setStatus({
          overallHealth: data.health?.status === 'healthy' ? 'healthy' : 'degraded',
          techDebt: {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          },
          missingFeatures: {
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
          lastIngestion: data.lastUpdated || new Date().toISOString()
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
      const response = await fetch('/api/project/knowledge/ingest', {
        method: 'POST'
      });
      if (response.ok) {
        await loadStatus();
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

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-400';
      case 'offline': return 'bg-red-400';
      default: return 'bg-white/20';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-white/40">Loading project status...</div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-sm text-white/40">No project status available</div>
          <div className="text-xs text-white/30">
            Auto-sync is initializing... Knowledge will be ingested automatically.
          </div>
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm hover:bg-white/10 disabled:opacity-50 text-white/60"
            title="Manual sync (auto-sync runs automatically)"
          >
            {ingesting ? 'Ingesting...' : 'Force Sync Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Project Dashboard</h1>
          <div className="text-sm text-white/40">
            Last ingestion: {new Date(status.lastIngestion).toLocaleString()}
            <span className="ml-2 text-emerald-400">• Auto-sync enabled</span>
          </div>
        </div>
        <button
          onClick={handleIngest}
          disabled={ingesting}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-sm hover:bg-white/10 disabled:opacity-50 text-white/60"
          title="Manual sync (auto-sync runs automatically)"
        >
          {ingesting ? 'Ingesting...' : 'Manual Sync'}
        </button>
      </div>

      {/* Overall Health */}
      <Panel title="Overall Health">
        <div className="flex items-center gap-4">
          <div className={`text-3xl font-bold ${getHealthColor(status.overallHealth)}`}>
            {status.overallHealth.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-4 gap-4">
              <Metric label="Apps" value={status.workspace.apps.toString()} />
              <Metric label="Packages" value={status.workspace.packages.toString()} />
              <Metric label="Databases" value={status.databases.toString()} />
              <Metric label="Workflows" value={`${status.workflows.synced}/${status.workflows.total}`} />
            </div>
          </div>
        </div>
      </Panel>

      {/* Tech Debt */}
      <Panel title="Tech Debt">
        <div className="grid grid-cols-5 gap-4">
          <Metric label="Total" value={status.techDebt.total.toString()} />
          <Metric label="Critical" value={status.techDebt.critical.toString()} className="text-red-400" />
          <Metric label="High" value={status.techDebt.high.toString()} className="text-yellow-400" />
          <Metric label="Medium" value={status.techDebt.medium.toString()} className="text-white/60" />
          <Metric label="Low" value={status.techDebt.low.toString()} className="text-white/40" />
        </div>
      </Panel>

      {/* Missing Features */}
      <Panel title="Missing Features">
        <div className="grid grid-cols-3 gap-4">
          <Metric label="P0 (Critical)" value={status.missingFeatures.p0.toString()} className="text-red-400" />
          <Metric label="P1 (High)" value={status.missingFeatures.p1.toString()} className="text-yellow-400" />
          <Metric label="P2 (Medium)" value={status.missingFeatures.p2.toString()} className="text-white/60" />
        </div>
      </Panel>

      {/* Services */}
      <Panel title="Services">
        <DataTable
          columns={[
            { key: 'name', label: 'Service' },
            { key: 'status', label: 'Status' },
            { key: 'url', label: 'URL' },
            { key: 'lastChecked', label: 'Last Checked' }
          ]}
          data={status.services.map(s => ({
            name: s.name,
            status: (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getServiceStatusColor(s.status)}`}></div>
                <span className="text-xs">{s.status}</span>
              </div>
            ),
            url: s.url || '-',
            lastChecked: s.lastChecked ? new Date(s.lastChecked).toLocaleString() : '-'
          }))}
        />
      </Panel>

      {/* Knowledge Summary */}
      <Panel title="Knowledge Base">
        <div className="grid grid-cols-2 gap-4">
          <Metric label="Total Knowledge Items" value={status.knowledge.total.toString()} />
          <Metric label="Last Ingestion" value={new Date(status.lastIngestion).toLocaleString()} />
        </div>
      </Panel>
    </div>
  );
}

