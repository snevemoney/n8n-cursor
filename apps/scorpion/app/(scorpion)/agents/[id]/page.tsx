'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, DataTable } from '@/components/scorpion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  const [dossier, setDossier] = useState<AgentDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAgentDossier();
    }
  }, [id]);

  const loadAgentDossier = async () => {
    try {
      const response = await fetch(`/api/agents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDossier(data);
      } else {
        setError('Agent not found');
      }
    } catch (err) {
      console.error('Failed to load agent dossier:', err);
      setError('Failed to load agent dossier');
    } finally {
      setLoading(false);
    }
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
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/40">Loading agent dossier...</div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="h-full flex items-center justify-center">
        <Panel title="Error">
          <div className="text-center py-8 text-red-400">
            {error || 'Agent not found'}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/agents" className="text-cyan-400 hover:text-cyan-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="sc-title text-2xl">Agent Dossier: {dossier.codename}</h1>
      </div>

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

      {/* Operation History */}
      <Panel title="Operation List">
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
    </div>
  );
}
