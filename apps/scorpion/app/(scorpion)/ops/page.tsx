'use client';

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Panel, Metric, Radar, MissionControl, useToast, ErrorState, LoadingState, Button, Input, Select, Modal, Badge, DataTable, Alert, EmptyState, PageLoadingBar } from '@/components/scorpion';
import { X, Search, Play, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { usePageData } from '@/hooks/usePageData';

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
  const { showToast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'running' | 'paused' | 'stopped'>('running');
  const [acceptingNew, setAcceptingNew] = useState(true);
  const [runtime, setRuntime] = useState<{ hours: number; minutes: number } | null>(null);
  const [opsData, setOpsData] = useState<OperationsData | null>(null);
  const [radarAgents, setRadarAgents] = useState<RadarAgent[]>([]);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  
  // Filtering and sorting
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('time');
  const [searchQuery, setSearchQuery] = useState('');

  // Add state for execution logs
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Missions list state
  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false); // Start false

  // Track if operations have been loaded at least once
  const hasLoadedOperationsRef = useRef(false);

  // Load functions - defined as useCallback for stable references
  const loadOperations = useCallback(async () => {
    const wasInitialLoad = !hasLoadedOperationsRef.current;
    try {
      setError(null);
      // Only show loading spinner on initial load, not on refresh
      if (wasInitialLoad) {
        setLoading(true);
      }
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout (increased from 10s)
      
      const response = await fetch('/api/operations', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to load operations: ${response.statusText}`);
      }
      const result = await response.json();
      const data = result.data || result; // Handle both wrapped and unwrapped responses
      setOpsData(data);
      hasLoadedOperationsRef.current = true;
    } catch (error: any) {
      console.error('Failed to load operations:', error);
      if (error.name === 'AbortError') {
        setError('Request timed out. Please check your connection.');
      } else {
        setError(error.message || 'Failed to load operations');
      }
      // Set empty data on error to prevent stuck loading state
      if (wasInitialLoad) {
        setOpsData({
          stats: { total: 0, running: 0, completed: 0, failed: 0, byType: {}, byLocation: {} },
          operations: []
        });
        hasLoadedOperationsRef.current = true; // Mark as loaded even on error to prevent retry loops
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSystemControl = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased from 5s)
      
      const response = await fetch('/api/operations/control', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to load system control: ${response.statusText}`);
      }
      const result = await response.json();
      const data: SystemControl = result.data || result;
      setSystemStatus(data.status);
      setAcceptingNew(data.acceptingNew);
      if (data.runtime) {
        setRuntime({ hours: data.runtime.hours, minutes: data.runtime.minutes });
      }
    } catch (error: any) {
      console.error('Failed to load system control:', error);
      // Don't set error state for system control as it's not critical
      // But ensure we have default values
      if (error.name !== 'AbortError') {
        // Only log non-timeout errors
      }
    }
  }, []);

  const loadProject = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased from 5s)
      
      const response = await fetch('/api/projects', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to load project: ${response.statusText}`);
      }
      const result = await response.json();
      const data = result.data || result;
      setProjectData({
        name: data.name || 'Scorpion',
        description: data.description || 'Central Orchestration & Intelligence Platform'
      });
    } catch (error: any) {
      console.error('Failed to load project:', error);
      // Fallback to default - always set data to prevent stuck loading
      setProjectData({
        name: 'Scorpion',
        description: 'Central Orchestration & Intelligence Platform'
      });
    }
  }, []);

  const loadRadarAgents = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout (increased from 10s)
      
      // Load agents and active operations in parallel
      const [agentsResponse, operationsResponse] = await Promise.all([
        fetch('/api/agents', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        }),
        fetch('/api/agents/operations', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        })
      ]);
      
      clearTimeout(timeoutId);
      
      if (agentsResponse.ok) {
        const result = await agentsResponse.json();
        const data = result.success && result.data ? result.data : result;
        const agentsList = data.agents || [];
        // Only update agents state if it actually changed to prevent unnecessary re-renders
        setAgents((prevAgents) => {
          if (prevAgents.length !== agentsList.length) {
            return agentsList;
          }
          // Check if any agent IDs changed
          const prevIds = new Set(prevAgents.map((a: any) => a.id));
          const newIds = new Set(agentsList.map((a: any) => a.id));
          if (prevIds.size !== newIds.size) {
            return agentsList;
          }
          for (const id of Array.from(prevIds)) {
            if (!newIds.has(id)) {
              return agentsList;
            }
          }
          // No changes, return previous state to prevent re-render
          return prevAgents;
        });
        
        // Get active executions and recent completions
        let activeExecutions: any[] = [];
        let recentCompletionsList: string[] = [];
        if (operationsResponse.ok) {
          const opsResult = await operationsResponse.json();
          const opsData = opsResult.success && opsResult.data ? opsResult.data : opsResult;
          activeExecutions = opsData.active || [];
          recentCompletionsList = opsData.recentCompletions || [];
        }
        
        const radarData: RadarAgent[] = agentsList.map((agent: any, idx: number) => {
          const angle = (360 / agentsList.length) * idx;
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
      } else {
        // If agents API fails, set empty array to prevent stuck loading
        setRadarAgents([]);
      }
    } catch (error: any) {
      console.error('Failed to load radar agents:', error);
      // Set empty array on error to prevent stuck loading state
      setRadarAgents([]);
    }
  }, []);

  const loadAllMissions = useCallback(async (showLoading = false) => {
    try {
      // Only show loading state on initial load, not on background refreshes
      if (showLoading) {
        setLoadingMissions(true);
      }
      setError(null);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (increased from 15s - missions load multiple agents)
      
      // Load all agents first
      const agentsResponse = await fetch('/api/agents', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!agentsResponse.ok) {
        const errorData = await agentsResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to load agents: ${agentsResponse.statusText}`);
      }
      
      const agentsResult = await agentsResponse.json();
      const agentsData = agentsResult.success && agentsResult.data ? agentsResult.data : agentsResult;
      const agentsList = agentsData.agents || [];
      
      if (agentsList.length === 0) {
        // No agents available - missions list will be empty
        setAllMissions([]);
        if (showLoading) {
          setLoadingMissions(false);
        }
        return;
      }
      
      // Load operations for all agents in parallel with individual timeouts
      const operationsPromises = agentsList.map(async (agent: any) => {
        try {
          const agentController = new AbortController();
          const agentTimeoutId = setTimeout(() => agentController.abort(), 20000); // 20 second timeout per agent (increased from 10s)
          
          const opsResponse = await fetch(`/api/agents/operations?agentId=${agent.id}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            signal: agentController.signal
          });
          
          clearTimeout(agentTimeoutId);
          
          if (opsResponse.ok) {
            const opsResult = await opsResponse.json();
            const opsData = opsResult.success && opsResult.data ? opsResult.data : opsResult;
            const operations = opsData.operations || [];
            
            // Map operations to missions format with agent info
            return operations.map((op: any) => ({
              id: op.id,
              name: op.name || op.id,
              description: op.description || 'No description',
              type: op.type || 'unknown',
              agentId: agent.id,
              agentName: agent.codename || agent.name || agent.id,
              agentRole: agent.role || 'Unknown',
              status: op.isActive ? 'active' : 'idle',
              isActive: op.isActive || false,
              lastExecuted: op.lastExecuted,
              canExecute: op.canExecute !== false,
              riskLevel: op.riskLevel || 'low',
              requiresApproval: op.requiresApproval || false
            }));
          } else {
            // API returned error - log but don't fail completely
            const errorData = await opsResponse.json().catch(() => ({}));
            console.warn(`Failed to load operations for agent ${agent.id}:`, errorData.error?.message || opsResponse.statusText);
            return [];
          }
        } catch (error: any) {
          // Network or parsing error - log but continue with other agents
          if (error.name !== 'AbortError') {
            console.error(`Failed to load operations for agent ${agent.id}:`, error.message || error);
          }
          return [];
        }
      });
      
      const allOperationsArrays = await Promise.all(operationsPromises);
      const flattenedMissions = allOperationsArrays.flat();
      
      // Sort missions by agent name, then by mission name for consistent display
      flattenedMissions.sort((a: any, b: any) => {
        const agentCompare = (a.agentName || '').localeCompare(b.agentName || '');
        if (agentCompare !== 0) return agentCompare;
        return (a.name || '').localeCompare(b.name || '');
      });
      
      // Only update state if missions data actually changed to prevent unnecessary re-renders
      setAllMissions((prevMissions) => {
        // Simple length check first
        if (prevMissions.length !== flattenedMissions.length) {
          return flattenedMissions;
        }
        
        // Only check if IDs changed (faster than deep comparison)
        const prevIds = new Set(prevMissions.map(m => m.id));
        const newIds = new Set(flattenedMissions.map(m => m.id));
        
        if (prevIds.size !== newIds.size || 
            ![...prevIds].every(id => newIds.has(id))) {
          return flattenedMissions;
        }
        
        // Quick status check - only check first 10 items
        for (let i = 0; i < Math.min(10, prevMissions.length); i++) {
          if (prevMissions[i].isActive !== flattenedMissions[i].isActive) {
            return flattenedMissions;
          }
        }
        
        return prevMissions; // No changes
      });
    } catch (error: any) {
      console.error('Failed to load all missions:', error);
      // Set error state but don't crash - show empty state instead
      if (error.name === 'AbortError') {
        setError('Request timed out. Please check your connection.');
      } else {
        setError(error.message || 'Failed to load missions');
      }
      setAllMissions([]);
    } finally {
      if (showLoading) {
        setLoadingMissions(false);
      }
    }
  }, []);

  // Handle visibility change - wrapped in useCallback to prevent recreation
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      loadOperations();
      loadSystemControl();
      loadRadarAgents();
      // Missions list NOT refreshed on visibility change to prevent unwanted refreshes
    }
  }, [loadOperations, loadSystemControl, loadRadarAgents]);

  useEffect(() => {
    // Defer data fetches aggressively so page renders instantly
    // Use requestIdleCallback for better performance, fallback to setTimeout
    const loadData = () => {
      // Parallelize all API calls for faster loading
      Promise.all([
        loadOperations(),
        loadSystemControl(),
        loadRadarAgents(),
        loadProject(),
      ]).then(() => {
        // Load missions after other data loads - zero delay for instant loading
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(() => {
            loadAllMissions(true);
          }, { timeout: 0 }); // Immediate - no delay
        } else {
          setTimeout(() => loadAllMissions(true), 0); // Immediate fallback
        }
      }).catch((error) => {
        console.error('Failed to load ops data:', error);
      });
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
    
    // Consolidated polling: Single interval to avoid overlapping refreshes
    // Refresh all data together every 15 seconds when tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadOperations();
        loadSystemControl();
        loadRadarAgents();
      }
    }, 15000); // Single consolidated interval
    
    // No separate intervals - all refresh together to avoid redundant requests
    
    // Missions list does NOT auto-refresh - only refreshes on manual actions
    // This prevents constant refreshing that was annoying the user
    
    // Refresh immediately when tab becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadOperations, loadSystemControl, loadRadarAgents, loadProject, loadAllMissions, handleVisibilityChange]); // Include stable callbacks in deps

  // Add function to load logs
  const loadExecutionLogs = async (operationId: string) => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`/api/operations/logs?operationId=${operationId}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        setExecutionLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load execution logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Manual refresh function - wrapped in useCallback to prevent recreation
  const refreshAll = useCallback(() => {
    loadOperations();
    loadSystemControl();
    loadRadarAgents();
    loadProject();
    loadAllMissions(false); // Background refresh - don't show loading
  }, [loadOperations, loadSystemControl, loadRadarAgents, loadProject, loadAllMissions]);

  // Memoized click handlers
  const createOperationSelectHandler = useCallback((operationId: string) => {
    return () => {
      setSelected(operationId);
    };
  }, []);

  const createMissionExecuteHandler = useCallback((mission: any) => {
    return async () => {
      try {
        const response = await fetch('/api/agents/operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationId: mission.id, agentId: mission.agentId })
        });
        if (response.ok) {
          showToast('success', `Mission "${mission.name || mission.id || 'mission'}" started`);
          refreshAll();
        } else {
          showToast('error', 'Failed to start mission');
        }
      } catch (error) {
        showToast('error', 'Failed to start mission');
      }
    };
  }, [showToast, refreshAll]);

  const handleRetryOperations = useCallback(() => {
    setError(null);
    loadOperations();
  }, [loadOperations]);

  const handleRun = async () => {
    try {
      const response = await fetch('/api/operations/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        setSystemStatus(data.status.status);
        setAcceptingNew(data.status.acceptingNew);
        if (data.status.runtime) {
          setRuntime({ hours: data.status.runtime.hours, minutes: data.status.runtime.minutes });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to resume system');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resume system';
      showToast('error', errorMessage);
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to pause system');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause system';
      showToast('error', errorMessage);
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to toggle new task acceptance');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle new task acceptance';
      showToast('error', errorMessage);
    }
  };

  // Pre-compute timestamps for operations to avoid Date() calls in sort
  const operationsWithTimestamps = useMemo(() => {
    if (!opsData?.operations) return [];
    return opsData.operations.map(op => ({
      ...op,
      startedAtTimestamp: new Date(op.startedAt).getTime(),
    }));
  }, [opsData?.operations]);

  // Filter and sort operations - memoized for performance
  const filteredAndSortedOperations = useMemo(() => {
    if (!operationsWithTimestamps.length) return [];
    
    // Pre-compute lowercase search query once
    const query = searchQuery ? searchQuery.toLowerCase() : '';
    
    let filtered = operationsWithTimestamps;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(op => op.status === filterStatus);
    }
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(op => 
        op.workflowName.toLowerCase().includes(query) ||
        op.id.toLowerCase().includes(query) ||
        op.type.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting - use pre-computed timestamps
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return b.startedAtTimestamp - a.startedAtTimestamp;
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
  }, [operationsWithTimestamps, filterStatus, searchQuery, sortBy]);

  const selectedOperation = opsData?.operations.find(op => op.id === selected);

  // Update selected operation handler
  useEffect(() => {
    if (selected) {
      const op = opsData?.operations.find(o => o.id === selected);
      if (op && op.type === 'agent' && (op as any).executionDetails?.hasLogs && op.workflowId) {
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

  // Helper function to format last run time (memoized outside render)
  const formatLastRunTime = useCallback((lastExecuted: any) => {
    if (!lastExecuted) return 'Never';
    try {
      const lastExecutedTime = typeof lastExecuted === 'number' 
        ? lastExecuted 
        : new Date(lastExecuted).getTime();
      if (isNaN(lastExecutedTime)) return 'Never';
      const diff = Date.now() - lastExecutedTime;
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch {
      return 'Never';
    }
  }, []);

  return (
    <>
      <PageLoadingBar loading={loading || !opsData} />
    <div className="h-full flex flex-col md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] xl:grid-cols-[420px_1fr]">
      {/* LEFT COLUMN */}
      <div className="border-r border-white/5 flex flex-col overflow-hidden min-w-0">
        {/* Error State */}
        {error && (
          <div className="p-3 border-b border-red-500/20">
            <ErrorState
              error={error}
              onRetry={handleRetryOperations}
              title="Error loading operations"
              fullPage={false}
            />
          </div>
        )}
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
            {loading && <LoadingState text="Loading..." skeletonLines={2} />}
            {!loading && opsData?.operations
              .filter(op => op.status === 'failed')
              .slice(0, 5)
              .map((op) => (
                <button
                  key={op.id}
                  onClick={createOperationSelectHandler(op.id)}
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

        {/* Missions List - Comprehensive table of all agent missions */}
        <Panel title="Missions List" className="rounded-none border-0 border-b">
          {loadingMissions ? (
            <LoadingState text="Loading missions..." skeletonLines={3} />
          ) : allMissions.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No missions available"
              message="No missions found for any agents. Missions will appear here when agents have available operations."
            />
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <DataTable
                columns={[
                  { key: 'agentName', label: 'Agent', width: '120px' },
                  { key: 'name', label: 'Mission', width: '200px' },
                  { key: 'type', label: 'Type', width: '80px' },
                  { key: 'status', label: 'Status', width: '100px' },
                  { key: 'lastRun', label: 'Last Run', width: '100px' },
                  { key: 'actions', label: 'Actions', width: '80px' }
                ]}
                data={allMissions.map((mission: any) => ({
                  agentName: (
                    <div>
                      <div className="text-xs font-medium text-white">{mission.agentName || 'Unknown'}</div>
                      <div className="text-[10px] text-white/40">{mission.agentRole || 'Unknown'}</div>
                    </div>
                  ),
                  name: (
                    <div>
                      <div className="text-xs font-medium text-white">{mission.name || mission.id || 'Unnamed Mission'}</div>
                      <div className="text-[10px] text-white/40 truncate max-w-[180px]">{mission.description || 'No description'}</div>
                    </div>
                  ),
                  type: (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      mission.type === 'analyze' ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' :
                      mission.type === 'review' ? 'bg-purple-500/20 border-purple-400/50 text-purple-300' :
                      mission.type === 'monitor' ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' :
                      mission.type === 'scan' ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300' :
                      'bg-white/5 border-white/10 text-white/60'
                    }`}>
                      {mission.type?.toUpperCase() || 'N/A'}
                    </span>
                  ),
                  status: mission.isActive ? (
                    <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/40">IDLE</span>
                  ),
                  lastRun: mission.lastExecuted ? (
                    <span className="text-[10px] text-white/50">
                      {(() => {
                        try {
                          const lastExecuted = typeof mission.lastExecuted === 'number' 
                            ? mission.lastExecuted 
                            : new Date(mission.lastExecuted).getTime();
                          if (isNaN(lastExecuted)) return 'Never';
                          const diff = Date.now() - lastExecuted;
                          const minutes = Math.floor(diff / 60000);
                          if (minutes < 1) return 'Just now';
                          if (minutes < 60) return `${minutes}m ago`;
                          const hours = Math.floor(minutes / 60);
                          if (hours < 24) return `${hours}h ago`;
                          return `${Math.floor(hours / 24)}d ago`;
                        } catch {
                          return 'Never';
                        }
                      })()}
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/30">Never</span>
                  ),
                  actions: (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={createMissionExecuteHandler(mission)}
                      disabled={mission.isActive || mission.canExecute === false}
                      className="text-[10px] px-2 py-1"
                    >
                      {mission.isActive ? (
                        <>
                          <Clock className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Run
                        </>
                      )}
                    </Button>
                  )
                }))}
              />
            </div>
          )}
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
            <Input
              type="text"
              placeholder="Search operations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-3 w-3" />}
            />
            
            {/* Filter and Sort */}
            <div className="flex gap-2">
              <Select
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'running', label: 'Running' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'failed', label: 'Failed' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="flex-1 text-xs"
              />
              
              <Select
                options={[
                  { value: 'time', label: 'Time' },
                  { value: 'status', label: 'Status' },
                  { value: 'name', label: 'Name' },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-[1px]">
            {loading && <div className="text-xs text-white/40">Loading operations...</div>}
            {!loading && filteredAndSortedOperations.length === 0 && (
              <div className="text-xs text-white/40 py-4 text-center">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No operations match your filters' 
                  : 'No operations found'}
              </div>
            )}
            {!loading && filteredAndSortedOperations.slice(0, 20).map((op) => {
              const timeAgo = new Date(op.startedAt).toLocaleTimeString();
              const statusColor = 
                op.status === 'completed' ? 'text-emerald-400' :
                op.status === 'running' ? 'text-yellow-400' :
                'text-red-400';
              
              return (
                <button
                  key={op.id}
                  onClick={createOperationSelectHandler(op.id)}
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
      <div className="p-3 md:p-4 flex flex-col md:grid md:grid-rows-[auto_1fr_auto] gap-3 md:gap-4 min-w-0">
        {/* METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
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
            <div className="bg-[#0f1318] border border-white/5 rounded-md relative overflow-hidden flex items-center justify-center min-h-[300px] md:min-h-0">
              <Radar agents={radarAgents.length > 0 ? radarAgents : [
                { id: '...', angle: 0, dist: 50, status: 'ok' as const, time: '--:--' }
              ]} />
              {radarAgents.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white/40 text-xs md:text-sm">Loading agents...</div>
                </div>
              )}
            </div>

        {/* CONTROL PANEL */}
        <div className="bg-[#0f1318] border border-white/5 rounded-md flex flex-col gap-2 md:gap-3 min-w-0">
          {/* Control Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3 p-2 md:px-3 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="sc-title text-[9px] md:text-[10px]">Master Control Panel</div>
              {!acceptingNew && (
                <Badge variant="warning" size="sm">
                  NOT ACCEPTING NEW
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <div className="text-[10px] md:text-xs text-white/40 whitespace-nowrap">
                {systemStatus === 'running' 
                  ? `RUNNING ${formatRuntime()}` 
                  : systemStatus === 'paused' 
                  ? 'PAUSED' 
                  : 'STOPPED'}
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                systemStatus === 'running' ? 'bg-emerald-400' :
                systemStatus === 'paused' ? 'bg-yellow-400' :
                'bg-red-400'
              }`}></div>
              <Button
                variant="success"
                size="sm"
                onClick={handleRun}
                disabled={systemStatus === 'running'}
                aria-label="Start system"
                title={systemStatus === 'running' ? 'System is already running' : 'Start the system'}
              >
                RUN
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={handlePause}
                disabled={systemStatus === 'paused'}
                aria-label="Pause system"
                title={systemStatus === 'paused' ? 'System is already paused' : 'Pause the system'}
              >
                PAUSE
              </Button>
              <Button
                variant={acceptingNew ? 'secondary' : 'danger'}
                size="sm"
                onClick={handleStopNew}
                aria-label={acceptingNew ? 'Stop accepting new tasks' : 'Resume accepting new tasks'}
                title={acceptingNew ? 'Stop accepting new tasks' : 'Resume accepting new tasks'}
              >
                {acceptingNew ? 'STOP NEW' : 'RESUME NEW'}
              </Button>
            </div>
          </div>

          {/* Missions List */}
          <div className="border-t border-white/5 px-2 md:px-3 pb-2 md:pb-3">
            <div className="sc-title text-[9px] md:text-[10px] mb-2 mt-2">MISSIONS LIST</div>
            {loadingMissions ? (
              <LoadingState text="Loading missions..." skeletonLines={3} />
            ) : allMissions.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No missions available"
                message="No missions found for any agents. Missions will appear here when agents have available operations."
              />
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-[9px] md:text-[10px] text-white/60 font-medium py-1.5 px-2">AGENT</th>
                      <th className="text-[9px] md:text-[10px] text-white/60 font-medium py-1.5 px-2">MISSION</th>
                      <th className="text-[9px] md:text-[10px] text-white/60 font-medium py-1.5 px-2">TYPE</th>
                      <th className="text-[9px] md:text-[10px] text-white/60 font-medium py-1.5 px-2">STATUS</th>
                      <th className="text-[9px] md:text-[10px] text-white/60 font-medium py-1.5 px-2">LAST RUN</th>
                      <th className="text-[9px] md:text-[10px] text-white/60 font-medium py-1.5 px-2">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMissions.map((mission: any) => (
                      <tr key={mission.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-2 px-2">
                          <div className="text-[10px] md:text-xs font-medium text-white">{mission.agentName || 'Unknown'}</div>
                          <div className="text-[9px] text-white/40">{mission.agentRole || 'Unknown'}</div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="text-[10px] md:text-xs font-medium text-white">{mission.name || mission.id || 'Unnamed Mission'}</div>
                          <div className="text-[9px] text-white/40 truncate max-w-[200px]">{mission.description || 'No description'}</div>
                        </td>
                        <td className="py-2 px-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                            mission.type === 'analyze' ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' :
                            mission.type === 'review' ? 'bg-purple-500/20 border-purple-400/50 text-purple-300' :
                            mission.type === 'monitor' ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' :
                            mission.type === 'scan' ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300' :
                            'bg-white/5 border-white/10 text-white/60'
                          }`}>
                            {mission.type?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          {mission.isActive ? (
                            <span className="text-[9px] text-cyan-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/40">IDLE</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`text-[9px] ${mission.lastExecuted ? 'text-white/50' : 'text-white/30'}`}>
                            {formatLastRunTime(mission.lastExecuted)}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={createMissionExecuteHandler(mission)}
                            disabled={mission.isActive || mission.canExecute === false}
                            className="text-[9px] px-2 py-1"
                          >
                            {mission.isActive ? (
                              <>
                                <Clock className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3" />
                                Execute
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operation Details Modal */}
      {selectedOperation && (
        <Modal
          open={!!selectedOperation}
          onClose={() => setSelected(null)}
          title={`Operation Details - ${selectedOperation.id.slice(0, 12)}`}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <div className="text-[10px] md:text-xs text-white/40 mb-1">Workflow Name</div>
              <div className="text-xs md:text-sm text-white break-words">{selectedOperation.workflowName}</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <div className="text-[10px] md:text-xs text-white/40 mb-1">Status</div>
                <Badge
                  variant={
                    selectedOperation.status === 'completed' ? 'success' :
                    selectedOperation.status === 'running' ? 'warning' :
                    'danger'
                  }
                  size="sm"
                >
                  {selectedOperation.status.toUpperCase()}
                </Badge>
              </div>
              
              <div>
                <div className="text-[10px] md:text-xs text-white/40 mb-1">Type</div>
                <div className="text-xs md:text-sm text-white break-words">{selectedOperation.type}</div>
              </div>
              
              <div>
                <div className="text-[10px] md:text-xs text-white/40 mb-1">Location</div>
                <div className="text-xs md:text-sm text-white break-words">{selectedOperation.location}</div>
              </div>
              
              <div>
                <div className="text-[10px] md:text-xs text-white/40 mb-1">Mode</div>
                <div className="text-xs md:text-sm text-white break-words">{selectedOperation.mode || 'N/A'}</div>
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
              <Alert variant="danger" title="Error Message" message={selectedOperation.error} />
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
        </Modal>
      )}
    </div>
    </>
  );
}
