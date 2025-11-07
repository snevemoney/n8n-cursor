'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, Radar } from '@/components/scorpion';

interface Operation {
  id: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  type: string;
  location: string;
}

interface OperationsData {
  stats: {
    total: number;
    running: number;
    completed: number;
    failed: number;
    byType: { [key: string]: number };
    byLocation: { [key: string]: number };
  };
  operations: Operation[];
}

interface RadarAgent {
  id: string;
  angle: number;
  dist: number;
  status: 'ok' | 'warn' | 'error';
  time: string;
}

export default function OpsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'running' | 'paused' | 'stopped'>('running');
  const [acceptingNew, setAcceptingNew] = useState(true);
  const [opsData, setOpsData] = useState<OperationsData | null>(null);
  const [radarAgents, setRadarAgents] = useState<RadarAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperations();
    loadSystemControl();
    loadRadarAgents();
    // Refresh every 15 seconds
    const interval = setInterval(() => {
      loadOperations();
      loadSystemControl();
      loadRadarAgents();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOperations = async () => {
    try {
      const response = await fetch('/api/operations');
      if (response.ok) {
        const data = await response.json();
        setOpsData(data);
      }
    } catch (error) {
      console.error('Failed to load operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemControl = async () => {
    try {
      const response = await fetch('/api/operations/control');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status);
        setAcceptingNew(data.acceptingNew);
      }
    } catch (error) {
      console.error('Failed to load system control:', error);
    }
  };

  const loadRadarAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        // Convert agents to radar positions dynamically
        const agents = data.agents || [];
        const radarData: RadarAgent[] = agents.slice(0, 8).map((agent: any, idx: number) => {
          // Distribute agents around the radar (360 degrees / number of agents)
          const angle = (360 / Math.min(agents.length, 8)) * idx;
          
          // Distance based on activity (more active = closer to center)
          const activityRatio = agent.stats.successCount / (agent.stats.totalActivities || 1);
          const dist = 20 + (60 * (1 - activityRatio)); // 20-80 range
          
          // Status based on success rate
          const successRate = agent.stats.successCount / (agent.stats.totalActivities || 1);
          const status = successRate > 0.8 ? 'ok' : successRate > 0.5 ? 'warn' : 'error';
          
          // Time since last activity (mock for now)
          const time = `${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
          
          return {
            id: agent.id,
            angle,
            dist,
            status,
            time
          };
        });
        setRadarAgents(radarData);
      }
    } catch (error) {
      console.error('Failed to load radar agents:', error);
    }
  };

  const handleRun = async () => {
    try {
      const response = await fetch('/api/operations/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status.status);
        setAcceptingNew(data.status.acceptingNew);
      }
    } catch (error) {
      console.error('Failed to resume system:', error);
      alert('Failed to resume system');
    }
  };

  const handlePause = async () => {
    try {
      const response = await fetch('/api/operations/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status.status);
        setAcceptingNew(data.status.acceptingNew);
      }
    } catch (error) {
      console.error('Failed to pause system:', error);
      alert('Failed to pause system');
    }
  };

  const handleStopNew = async () => {
    try {
      const response = await fetch('/api/operations/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_new' })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status.status);
        setAcceptingNew(data.status.acceptingNew);
      }
    } catch (error) {
      console.error('Failed to toggle new task acceptance:', error);
      alert('Failed to toggle new task acceptance');
    }
  };

  return (
    <div className="h-full grid grid-cols-[420px_1fr]">
      {/* LEFT COLUMN */}
      <div className="border-r border-white/5 flex flex-col overflow-hidden">
        {/* Monitoring table */}
        <Panel title="Monitoring Table" className="rounded-none border-0 border-b">
          <div className="text-sm font-medium">Project: Black Mesa Research Facility – Web</div>
          <div className="text-xs text-white/40 mt-1">A new website copy, design and development</div>
        </Panel>

        {/* Recent Failed Operations */}
        <Panel title="Failed Operations" className="rounded-none border-0 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-white/30">
              {opsData?.stats.failed || 0} failed
            </div>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {loading && <div className="text-xs text-white/40">Loading...</div>}
            {!loading && opsData?.operations
              .filter(op => op.status === 'failed')
              .slice(0, 5)
              .map((op, idx) => (
                <button
                  key={op.id}
                  onClick={() => setSelected(op.id)}
                  className={`w-full text-left border border-red-500/20 rounded-sm px-2 py-1.5 bg-red-500/5 hover:bg-red-500/10 transition ${
                    selected === op.id ? 'bg-red-500/15' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold sc-mono text-red-400">{op.id.slice(0, 12)}</span>
                    <span className="text-[10px] text-white/40">{op.type}</span>
                  </div>
                  <div className="text-[11px] text-white/70 truncate">{op.workflowName}</div>
                </button>
              ))}
            {!loading && opsData?.stats.failed === 0 && (
              <div className="text-xs text-emerald-400">✅ No failed operations</div>
            )}
          </div>
        </Panel>

        {/* Recent Operations */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="sc-title mb-2">Recent Operations ({opsData?.operations.length || 0})</div>
          <div className="space-y-[1px]">
            {loading && <div className="text-xs text-white/40">Loading operations...</div>}
            {!loading && opsData?.operations.slice(0, 20).map((op) => {
              const timeAgo = new Date(op.startedAt).toLocaleTimeString();
              const statusColor = 
                op.status === 'completed' ? 'text-emerald-400' :
                op.status === 'running' ? 'text-yellow-400' :
                'text-red-400';
              
              return (
                <div
                  key={op.id}
                  className="grid grid-cols-[80px_1fr_60px] items-center text-[11px] bg-white/0 border border-white/5 rounded-sm px-2 py-1 mb-1 hover:bg-white/5 transition-colors"
                >
                  <div className="text-[10px] sc-mono truncate">{op.id.slice(0, 12)}</div>
                  <div>
                    <div className={`uppercase text-[9px] ${statusColor}`}>{op.status}</div>
                    <div className="text-[11px] truncate">{op.workflowName}</div>
                  </div>
                  <div className="text-right text-[10px] text-white/40 sc-mono">{timeAgo.slice(0, 5)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="p-4 grid grid-rows-[110px_1fr_120px] gap-4">
        {/* METRICS */}
        <div className="grid grid-cols-4 gap-3">
          <Metric 
            label="Total Operations" 
            value={opsData?.stats.total.toString() || '0'} 
          />
          <Metric 
            label="Running" 
            value={opsData?.stats.running.toString() || '0'} 
            valueColor="text-yellow-400"
          />
          <Metric 
            label="Completed" 
            value={opsData?.stats.completed.toString() || '0'} 
            valueColor="text-emerald-400"
          />
          <Metric 
            label="Failed" 
            value={opsData?.stats.failed.toString() || '0'} 
            valueColor="text-red-400"
          />
        </div>

            {/* RADAR */}
            <div className="bg-[#0f1318] border border-white/5 rounded-md relative overflow-hidden flex items-center justify-center">
              <Radar agents={radarAgents.length > 0 ? radarAgents : [
                { id: '...', angle: 0, dist: 50, status: 'ok' as const, time: '--:--' }
              ]} />
              {radarAgents.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white/40 text-sm">Loading agents...</div>
                </div>
              )}
            </div>

        {/* CONTROL PANEL */}
        <div className="bg-[#0f1318] border border-white/5 rounded-md flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="sc-title">Master Control Panel</div>
            {!acceptingNew && (
              <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                NOT ACCEPTING NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/40 mr-2">
              {systemStatus === 'running' ? 'RUNNING 25:45' : 
               systemStatus === 'paused' ? 'PAUSED' : 'STOPPED'}
            </div>
            <div className={`w-2 h-2 rounded-full ${
              systemStatus === 'running' ? 'bg-emerald-400' :
              systemStatus === 'paused' ? 'bg-yellow-400' :
              'bg-red-400'
            }`}></div>
            <button 
              onClick={handleRun}
              disabled={systemStatus === 'running'}
              className="px-3 py-1 bg-emerald-500/20 text-xs border border-emerald-400/50 rounded-sm hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              RUN
            </button>
            <button 
              onClick={handlePause}
              disabled={systemStatus === 'paused'}
              className="px-3 py-1 bg-yellow-500/20 text-xs border border-yellow-400/50 rounded-sm hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              PAUSE
            </button>
            <button 
              onClick={handleStopNew}
              className={`px-3 py-1 text-xs rounded-sm transition-colors ${
                acceptingNew 
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10' 
                  : 'bg-red-500/20 border border-red-400/50 hover:bg-red-500/30'
              }`}
            >
              {acceptingNew ? 'STOP NEW' : 'RESUME NEW'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

