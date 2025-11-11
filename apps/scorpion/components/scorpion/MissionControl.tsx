'use client';

import { useState, useEffect, memo } from 'react';
import { Play, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface Operation {
  id: string;
  name: string;
  description: string;
  type: string;
  riskLevel: 'none' | 'low' | 'medium';
  estimatedDuration: number;
  lastExecuted?: number;
  isActive?: boolean;
  canExecute?: boolean;
}

interface AgentOperations {
  agentId: string;
  operations: Operation[];
  activeExecutions: any[];
}

interface MissionControlProps {
  agentId: string;
  agentName: string;
  onMissionExecuted?: () => void;
}

export const MissionControl = memo(function MissionControl({ agentId, agentName, onMissionExecuted }: MissionControlProps) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(false); // Start false so component renders immediately
  const [executing, setExecuting] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Map<string, { success: boolean; message: string }>>(new Map());

  useEffect(() => {
    // Defer data fetch to avoid blocking render
    const loadData = () => {
      loadOperations();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
    
    // Refresh every 5 seconds to update status
    const interval = setInterval(loadOperations, 5000);
    return () => clearInterval(interval);
  }, [agentId]);

  const loadOperations = async () => {
    try {
      const response = await fetch(`/api/agents/operations?agentId=${agentId}`);
      if (response.ok) {
        const result = await response.json();
        // Handle wrapped response structure: { success: true, data: { operations: [...] } }
        const data = result.success && result.data ? result.data : result;
        setOperations(data.operations || []);
      }
    } catch (error) {
      console.error('Failed to load operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeOperation = async (operationId: string) => {
    setExecuting(prev => new Set(prev).add(operationId));
    setResults(prev => {
      const next = new Map(prev);
      next.delete(operationId);
      return next;
    });

    try {
      // Immediately notify parent that mission started
      if (onMissionExecuted) {
        onMissionExecuted();
      }
      
      const response = await fetch('/api/agents/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId, agentId })
      });

      const data = await response.json();
      
      // Refresh radar multiple times during execution
      const refreshInterval = setInterval(() => {
        if (onMissionExecuted) {
          onMissionExecuted();
        }
      }, 500); // Refresh every 500ms during execution
      
      // Stop refreshing after operation completes (2+ seconds)
      setTimeout(() => {
        clearInterval(refreshInterval);
      }, 3000);
      
      setResults(prev => {
        const next = new Map(prev);
        next.set(operationId, {
          success: data.success,
          message: data.result?.message || (data.success ? 'Operation completed' : 'Operation failed')
        });
        return next;
      });

      // Reload operations to update status
      setTimeout(() => {
        loadOperations();
        // Final refresh after completion
        if (onMissionExecuted) {
          onMissionExecuted();
        }
      }, 2500);
    } catch (error: any) {
      setResults(prev => {
        const next = new Map(prev);
        next.set(operationId, {
          success: false,
          message: error.message || 'Failed to execute operation'
        });
        return next;
      });
    } finally {
      setExecuting(prev => {
        const next = new Set(prev);
        next.delete(operationId);
        return next;
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analyze': return 'bg-blue-500/20 border-blue-400/50 text-blue-300';
      case 'review': return 'bg-purple-500/20 border-purple-400/50 text-purple-300';
      case 'monitor': return 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300';
      case 'scan': return 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300';
      case 'cleanup': return 'bg-orange-500/20 border-orange-400/50 text-orange-300';
      case 'suggest': return 'bg-pink-500/20 border-pink-400/50 text-pink-300';
      default: return 'bg-white/5 border-white/10 text-white/60';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'none': return <span className="text-[9px] text-emerald-400">SAFE</span>;
      case 'low': return <span className="text-[9px] text-yellow-400">LOW</span>;
      case 'medium': return <span className="text-[9px] text-orange-400">MED</span>;
      default: return null;
    }
  };

  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/40 mb-2">
        Available missions for <span className="text-white/60 font-medium">{agentName}</span>
      </div>
      
      {loading && operations.length === 0 ? (
        <div className="text-center py-8 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
          Loading missions...
        </div>
      ) : operations.length === 0 ? (
        <div className="text-center py-8 text-white/40 text-sm">
          No missions available
        </div>
      ) : (
        operations.map((op) => {
          const isExecuting = executing.has(op.id);
          const result = results.get(op.id);
          const isActive = op.isActive;
          const canExecute = op.canExecute !== false && !isExecuting && !isActive;

          return (
            <div
              key={op.id}
              className={`border rounded-sm p-3 transition-all ${
                isActive 
                  ? 'border-cyan-400/50 bg-cyan-500/5' 
                  : result?.success === false
                  ? 'border-red-400/50 bg-red-500/5'
                  : result?.success === true
                  ? 'border-emerald-400/50 bg-emerald-500/5'
                  : 'border-white/10 bg-white/0'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${getTypeColor(op.type)}`}>
                      {op.type.toUpperCase()}
                    </span>
                    {getRiskBadge(op.riskLevel)}
                    {isActive && (
                      <span className="text-[9px] text-cyan-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        RUNNING
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm font-medium text-white mb-1">{op.name}</div>
                  <div className="text-xs text-white/50 mb-2">{op.description}</div>
                  
                  {result && (
                    <div className={`text-xs flex items-center gap-1.5 mt-2 ${
                      result.success ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {result.success ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {result.message}
                    </div>
                  )}
                  
                  {op.lastExecuted && !result && (
                    <div className="text-[10px] text-white/30 mt-1">
                      Last run: {formatTimeAgo(op.lastExecuted)}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => executeOperation(op.id)}
                  disabled={!canExecute}
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-all flex items-center gap-1.5 shrink-0 ${
                    canExecute
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30'
                      : isExecuting || isActive
                      ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Running...
                    </>
                  ) : isActive ? (
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
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
});

