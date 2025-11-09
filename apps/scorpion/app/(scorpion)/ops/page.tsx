'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, Radar, MissionControl } from '@/components/scorpion';
import { X, Search } from 'lucide-react';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';

interface Operation {
  id: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  stoppedAt?: string;
  type: string;
  location: string;
  error?: string;
  workflowId?: string;
  mode?: string;
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
  isActive?: boolean;
  currentOperation?: string;
}

interface ProjectData {
  name: string;
  description: string;
}

interface SystemControl {
  status: 'running' | 'paused' | 'stopped';
  acceptingNew: boolean;
  runtime?: {
    hours: number;
    minutes: number;
    totalSeconds: number;
  };
}

type FilterStatus = 'all' | 'running' | 'completed' | 'failed';
type SortBy = 'time' | 'status' | 'name';

export default function OpsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'running' | 'paused' | 'stopped'>('running');
  const [acceptingNew, setAcceptingNew] = useState(true);
  const [runtime, setRuntime] = useState<{ hours: number; minutes: number } | null>(null);
  const [opsData, setOpsData] = useState<OperationsData | null>(null);
  const [radarAgents, setRadarAgents] = useState<RadarAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  
  // Filtering and sorting
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('time');
  const [searchQuery, setSearchQuery] = useState('');

  // Add state for execution logs
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadOperations();
    loadSystemControl();
    loadRadarAgents();
    loadProject();
    
    // Refresh operations more frequently for real-time feel (every 1 second)
    const interval = setInterval(() => {
      loadOperations();
      loadSystemControl();
      loadRadarAgents();
    }, 1000);
    
    // Refresh radar even more frequently when agents might be active (every 500ms)
    const radarInterval = setInterval(() => {
      loadRadarAgents();
    }, 500);
    
    // Update runtime display every 10 seconds (reduced from 60s)
    const runtimeInterval = setInterval(() => {
      if (systemStatus === 'running') {
        loadSystemControl();
      }
    }, 10000);
    
    // Refresh immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOperations();
        loadSystemControl();
        loadRadarAgents();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      clearInterval(runtimeInterval);
      clearInterval(radarInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [systemStatus]);

  const loadOperations = async () => {
    try {
      const response = await fetch('/api/operations', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
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
      const response = await fetch('/api/operations/control', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data: SystemControl = await response.json();
        setSystemStatus(data.status);
        setAcceptingNew(data.acceptingNew);
        if (data.runtime) {
          setRuntime({ hours: data.runtime.hours, minutes: data.runtime.minutes });
        }
      }
    } catch (error) {
      console.error('Failed to load system control:', error);
    }
  };

  const loadProject = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjectData({
          name: data.name || 'Scorpion',
          description: data.description || 'Central Orchestration & Intelligence Platform'
        });
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      // Fallback to default
      setProjectData({
        name: 'Scorpion',
        description: 'Central Orchestration & Intelligence Platform'
      });
    }
  };

  const loadRadarAgents = async () => {
    try {
      // Load agents and active operations in parallel
      const [agentsResponse, operationsResponse] = await Promise.all([
        fetch('/api/agents', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch('/api/agents/operations', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
      ]);
      
      if (agentsResponse.ok) {
        const data = await agentsResponse.json();
        const agentsList = data.agents || [];
        setAgents(agentsList);
        
        // Get active executions and recent completions
        let activeExecutions: any[] = [];
        let recentCompletionsList: string[] = [];
        if (operationsResponse.ok) {
          const opsData = await operationsResponse.json();
          activeExecutions = opsData.active || [];
          recentCompletionsList = opsData.recentCompletions || [];
        }
        
        const radarData: RadarAgent[] = agentsList.slice(0, 8).map((agent: any, idx: number) => {
          const angle = (360 / Math.min(agentsList.length, 8)) * idx;
          const activityRatio = agent.stats.successCount / (agent.stats.totalActivities || 1);
          const dist = 20 + (60 * (1 - activityRatio));
          const successRate = agent.stats.successCount / (agent.stats.totalActivities || 1);
          const status = successRate > 0.8 ? 'ok' : successRate > 0.5 ? 'warn' : 'error';
          
          // Check if agent has active operation
          const activeExecution = activeExecutions.find((exec: any) => exec.agentId === agent.id);
          const isActive = !!activeExecution;
          
          // Only show "Completed" if agent is in recentCompletions list (completed in last 5 seconds)
          const justCompleted = recentCompletionsList.includes(agent.id);

          let statusText = 'Never';
          if (isActive) {
            statusText = 'Executing...';
          } else if (justCompleted) {
            statusText = 'Completed';
          } else if (agent.stats.totalActivities > 0 && agent.lastActivity) {
            // Only show time ago if agent has actual activities (not just createdAt)
            const lastActive = new Date(agent.lastActivity);
            const now = new Date();
            const diffMs = now.getTime() - lastActive.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            
            if (diffHours > 0) {
              statusText = `${diffHours}h ${diffMins % 60}m`;
            } else {
              statusText = `${diffMins}m`;
            }
          }
          
          return {
            id: agent.id,
            angle,
            dist,
            status,
            time: statusText,
            isActive,
            currentOperation: isActive ? 'Executing...' : justCompleted ? 'Completed' : undefined
          };
        });
        setRadarAgents(radarData);
      }
    } catch (error) {
      console.error('Failed to load radar agents:', error);
    }
  };

  // Add function to load logs
  const loadExecutionLogs = async (operationId: string) => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`/api/operations/logs?operationId=${operationId}`);
      if (response.ok) {
        const data = await response.json();
        setExecutionLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load execution logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Manual refresh function
  const refreshAll = () => {
    loadOperations();
    loadSystemControl();
    loadRadarAgents();
    loadProject();
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
        if (data.status.runtime) {
          setRuntime({ hours: data.status.runtime.hours, minutes: data.status.runtime.minutes });
        }
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
        setRuntime(null);
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

  // Filter and sort operations
  const filteredAndSortedOperations = () => {
    if (!opsData?.operations) return [];
    
    let filtered = opsData.operations;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(op => op.status === filterStatus);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(op => 
        op.workflowName.toLowerCase().includes(query) ||
        op.id.toLowerCase().includes(query) ||
        op.type.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
        case 'status':
          const statusOrder = { running: 0, completed: 1, failed: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'name':
          return a.workflowName.localeCompare(b.workflowName);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const selectedOperation = opsData?.operations.find(op => op.id === selected);

  // Update selected operation handler
  useEffect(() => {
    if (selected) {
      const op = opsData?.operations.find(o => o.id === selected);
      if (op && op.type === 'agent' && (op as any).executionDetails?.hasLogs) {
        loadExecutionLogs(op.workflowId);
      } else {
        setExecutionLogs([]);
      }
    }
  }, [selected, opsData]);

  const formatRuntime = () => {
    if (!runtime) return '';
    return `${runtime.hours.toString().padStart(2, '0')}:${runtime.minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full grid grid-cols-[420px_1fr]">
      {/* LEFT COLUMN */}
      <div className="border-r border-white/5 flex flex-col overflow-hidden">
        {/* Monitoring table */}
        <Panel title="Monitoring Table" className="rounded-none border-0 border-b">
          {projectData ? (
            <>
              <div className="text-sm font-medium">Project: {projectData.name}</div>
              <div className="text-xs text-white/40 mt-1">{projectData.description}</div>
            </>
          ) : (
            <>
              <div className="text-sm font-medium">Project: Loading...</div>
              <div className="text-xs text-white/40 mt-1">Loading project information</div>
            </>
          )}
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
              .map((op) => (
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
                  {op.error && (
                    <div className="text-[10px] text-red-300/60 truncate mt-1">{op.error}</div>
                  )}
                </button>
              ))}
            {!loading && opsData?.stats.failed === 0 && (
              <div className="text-xs text-emerald-400">✅ No failed operations</div>
            )}
          </div>
        </Panel>

        {/* Mission Control */}
        <Panel title="Mission Control" className="rounded-none border-0 border-b">
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {agents.slice(0, 4).map((agent) => (
              <div key={agent.id} className="border border-white/10 rounded-sm p-2">
                <div className="text-xs font-medium text-white mb-1">{agent.codename}</div>
                <div className="text-[10px] text-white/40 mb-2">{agent.role}</div>
                <MissionControl 
                  agentId={agent.id} 
                  agentName={agent.codename}
                  onMissionExecuted={() => {
                    // Refresh all data immediately when mission is executed
                    refreshAll();
                  }}
                />
              </div>
            ))}
          </div>
        </Panel>

        {/* Recent Operations */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="sc-title mb-2">Recent Operations ({opsData?.operations.length || 0})</div>
          
          {/* Filter and Search Controls */}
          <div className="mb-3 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/40" />
              <input
                type="text"
                placeholder="Search operations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
              />
            </div>
            
            {/* Filter and Sort */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="flex-1 text-xs bg-white/5 border border-white/10 rounded-sm px-2 py-1 text-white focus:outline-none focus:border-white/20"
              >
                <option value="all">All</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="flex-1 text-xs bg-white/5 border border-white/10 rounded-sm px-2 py-1 text-white focus:outline-none focus:border-white/20"
              >
                <option value="time">Time</option>
                <option value="status">Status</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-[1px]">
            {loading && <div className="text-xs text-white/40">Loading operations...</div>}
            {!loading && filteredAndSortedOperations().length === 0 && (
              <div className="text-xs text-white/40 py-4 text-center">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No operations match your filters' 
                  : 'No operations found'}
              </div>
            )}
            {!loading && filteredAndSortedOperations().slice(0, 20).map((op) => {
              const timeAgo = new Date(op.startedAt).toLocaleTimeString();
              const statusColor = 
                op.status === 'completed' ? 'text-emerald-400' :
                op.status === 'running' ? 'text-yellow-400' :
                'text-red-400';
              
              return (
                <button
                  key={op.id}
                  onClick={() => setSelected(op.id)}
                  className={`w-full grid grid-cols-[80px_1fr_60px] items-center text-[11px] bg-white/0 border border-white/5 rounded-sm px-2 py-1 mb-1 hover:bg-white/5 transition-colors ${
                    selected === op.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="text-[10px] sc-mono truncate">{op.id.slice(0, 12)}</div>
                  <div className="text-left">
                    <div className={`uppercase text-[9px] ${statusColor}`}>{op.status}</div>
                    <div className="text-[11px] truncate">{op.workflowName}</div>
                  </div>
                  <div className="text-right text-[10px] text-white/40 sc-mono">{timeAgo.slice(0, 5)}</div>
                </button>
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
              {systemStatus === 'running' 
                ? `RUNNING ${formatRuntime()}` 
                : systemStatus === 'paused' 
                ? 'PAUSED' 
                : 'STOPPED'}
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

      {/* Operation Details Modal */}
      {selectedOperation && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">Operation Details</h2>
                <div className="text-xs text-white/40 mt-1">{selectedOperation.id}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <div className="text-xs text-white/40 mb-1">Workflow Name</div>
                <div className="text-sm text-white">{selectedOperation.workflowName}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-white/40 mb-1">Status</div>
                  <div className={`text-sm ${
                    selectedOperation.status === 'completed' ? 'text-emerald-400' :
                    selectedOperation.status === 'running' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {selectedOperation.status.toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-white/40 mb-1">Type</div>
                  <div className="text-sm text-white">{selectedOperation.type}</div>
                </div>
                
                <div>
                  <div className="text-xs text-white/40 mb-1">Location</div>
                  <div className="text-sm text-white">{selectedOperation.location}</div>
                </div>
                
                <div>
                  <div className="text-xs text-white/40 mb-1">Mode</div>
                  <div className="text-sm text-white">{selectedOperation.mode || 'N/A'}</div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-white/40 mb-1">Started At</div>
                <div className="text-sm text-white">{new Date(selectedOperation.startedAt).toLocaleString()}</div>
              </div>
              
              {selectedOperation.stoppedAt && (
                <div>
                  <div className="text-xs text-white/40 mb-1">Stopped At</div>
                  <div className="text-sm text-white">{new Date(selectedOperation.stoppedAt).toLocaleString()}</div>
                </div>
              )}
              
              {selectedOperation.error && (
                <div>
                  <div className="text-xs text-white/40 mb-1">Error Message</div>
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2 font-mono text-xs break-words">
                    {selectedOperation.error}
                  </div>
                </div>
              )}
              
              {selectedOperation.workflowId && (
                <div>
                  <div className="text-xs text-white/40 mb-1">Workflow ID</div>
                  <div className="text-sm text-white font-mono">{selectedOperation.workflowId}</div>
                </div>
              )}

              {selectedOperation.type === 'agent' && (selectedOperation as any).executionDetails && (
                <div>
                  <div className="text-xs text-white/40 mb-1">Execution Logs</div>
                  <div className="bg-black/50 rounded p-2 max-h-48 overflow-y-auto">
                    {loadingLogs ? (
                      <div className="text-xs text-white/40">Loading logs...</div>
                    ) : executionLogs.length > 0 ? (
                      <div className="space-y-1">
                        {executionLogs.map((log, idx) => (
                          <div key={idx} className="text-[10px] font-mono text-white/60">
                            {log}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-white/40">No execution logs available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
