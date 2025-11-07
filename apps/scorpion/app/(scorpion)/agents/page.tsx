'use client';

import { useState, useEffect } from 'react';
import { Panel, DataTable, LogRow, Metric } from '@/components/scorpion';
import Link from 'next/link';

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
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, standby: 0, offline: 0 });
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
    loadAgentLogs();
    // Refresh logs every 15 seconds
    const interval = setInterval(loadAgentLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentLogs = async () => {
    try {
      // Get recent logs and filter for agent-related activity
      const response = await fetch('/api/logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        // Transform logs to agent activity format
        const recentLogs = data.logs.slice(0, 10).map((log: any) => ({
          time: new Date(log.timestamp).toLocaleTimeString('en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          text: `[${log.source}]: ${log.message}`,
          level: log.level
        }));
        setAgentLogs(recentLogs);
      }
    } catch (error) {
      console.error('Failed to load agent logs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'standby': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-white/40';
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Agent Summary Stats */}
      <Panel title="Agent Fleet Overview">
        <div className="grid grid-cols-4 gap-4">
          <Metric label="Total Agents" value={summary.total.toString()} />
          <Metric label="Active" value={summary.active.toString()} valueColor="text-emerald-400" />
          <Metric label="Standby" value={summary.standby.toString()} valueColor="text-yellow-400" />
          <Metric label="Offline" value={summary.offline.toString()} valueColor="text-red-400" />
        </div>
      </Panel>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
        <Panel title="Agent Roster">
          {loading ? (
            <div className="text-center py-8 text-white/40">Loading agents...</div>
          ) : (
            <DataTable
              columns={[
                { key: 'id', label: 'Agent ID' },
                { key: 'codename', label: 'Codename' },
                { key: 'role', label: 'Role' },
                { key: 'success', label: 'Success' },
                { key: 'failed', label: 'Failed' },
                { key: 'status', label: 'Status' },
              ]}
              data={agents.map(a => ({
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
                success: <span className="text-emerald-300">{a.stats.successCount}</span>,
                failed: <span className="text-red-300">{a.stats.failedCount}</span>,
                status: <span className={getStatusColor(a.status)}>{a.status.toUpperCase()}</span>,
              }))}
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
    </div>
  );
}

