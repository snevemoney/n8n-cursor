'use client';

import { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/lib/telemetry/store';
import { computeAgentKPIs } from '@/lib/telemetry/derived';
import { Activity } from 'lucide-react';

/**
 * AgentSmallMultiples - Tiny charts per agent with KPIs
 * Click to focus agent across all panels
 */
export function AgentSmallMultiples() {
  const events = useTelemetryStore(state => state.events);
  const setFocus = useTelemetryStore(state => state.setFocus);
  const focus = useTelemetryStore(state => state.focus);
  const [agents, setAgents] = useState<any[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const kpis = computeAgentKPIs(events);
      setAgents(kpis);
    }, 2000);
    
    // Initial load
    const kpis = computeAgentKPIs(events);
    setAgents(kpis);
    
    return () => clearInterval(interval);
  }, [events]);
  
  if (agents.length === 0) {
    return (
      <div className="text-sm text-white/40 text-center py-8">
        No agent activity yet. Waiting for events...
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {agents.map(agent => {
        const isFocused = focus.agentId === agent.agentId;
        const successRate = agent.successRate * 100;
        
        return (
          <button
            key={agent.agentId}
            onClick={() => setFocus({ agentId: agent.agentId })}
            className={`p-3 rounded-lg border transition-all text-left ${
              isFocused
                ? 'bg-emerald-500/10 border-emerald-400/50 shadow-lg'
                : 'bg-black/20 border-white/10 hover:border-white/30'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-white truncate">
                  {agent.agentName}
                </div>
                <div className="text-xs text-white/40">{agent.agentId}</div>
              </div>
              <Activity className="h-4 w-4 text-white/40 flex-shrink-0" />
            </div>
            
            {/* Success rate bar */}
            <div className="mb-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    successRate >= 80 ? 'bg-emerald-400' :
                    successRate >= 50 ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-mono">
                {agent.successCount} ✓
              </span>
              <span className="text-white/60">
                {successRate.toFixed(0)}%
              </span>
              <span className="text-red-400 font-mono">
                {agent.errorCount} ✗
              </span>
            </div>
            
            {/* Last seen */}
            <div className="mt-2 text-xs text-white/30">
              {new Date(agent.lastSeen).toLocaleTimeString()}
            </div>
          </button>
        );
      })}
    </div>
  );
}

