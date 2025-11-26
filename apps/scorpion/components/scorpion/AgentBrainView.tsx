'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric } from '@/components/scorpion';
import { Brain, MemoryStick, Lightbulb, Target, History } from 'lucide-react';

interface BrainState {
  memory: {
    totalEntries: number;
    recentEntries: Array<{
      id: string;
      timestamp: string;
      content: string;
      type: 'fact' | 'decision' | 'observation';
    }>;
  };
  reasoning: {
    recentTraces: Array<{
      id: string;
      timestamp: string;
      thought: string;
      conclusion: string;
    }>;
  };
  decisions: {
    total: number;
    recent: Array<{
      id: string;
      timestamp: string;
      decision: string;
      context: string;
      outcome: 'success' | 'failed' | 'pending';
    }>;
  };
  tools: {
    usage: Array<{
      tool: string;
      count: number;
      lastUsed: string;
    }>;
  };
}

interface AgentBrainViewProps {
  agentId: string;
}

export function AgentBrainView({ agentId }: AgentBrainViewProps) {
  const [brainState, setBrainState] = useState<BrainState | null>(null);
  const [loading, setLoading] = useState(false); // Start false so component renders immediately

  useEffect(() => {
    // Defer data fetch to avoid blocking render
    const loadData = () => {
      loadBrainState();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
    
    // Refresh every 10 seconds
    const interval = setInterval(loadBrainState, 10000);
    return () => clearInterval(interval);
  }, [agentId]);

  const loadBrainState = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/brain`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setBrainState(result.data);
        } else {
          // Fallback: generate mock data for demonstration
          setBrainState({
            memory: {
              totalEntries: 42,
              recentEntries: [
                {
                  id: '1',
                  timestamp: new Date().toISOString(),
                  content: 'User prefers structured responses with code examples',
                  type: 'observation',
                },
                {
                  id: '2',
                  timestamp: new Date(Date.now() - 3600000).toISOString(),
                  content: 'Decision: Use TypeScript for type safety',
                  type: 'decision',
                },
              ],
            },
            reasoning: {
              recentTraces: [
                {
                  id: '1',
                  timestamp: new Date().toISOString(),
                  thought: 'Analyzing user request for workflow automation',
                  conclusion: 'Best approach is to use n8n MCP tools',
                },
              ],
            },
            decisions: {
              total: 156,
              recent: [
                {
                  id: '1',
                  timestamp: new Date().toISOString(),
                  decision: 'Execute workflow validation',
                  context: 'User requested workflow creation',
                  outcome: 'success',
                },
              ],
            },
            tools: {
              usage: [
                { tool: 'n8n-mcp', count: 45, lastUsed: new Date().toISOString() },
                { tool: 'code-execution', count: 23, lastUsed: new Date(Date.now() - 1800000).toISOString() },
              ],
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to load brain state:', error);
      // Set empty state on error
      setBrainState({
        memory: { totalEntries: 0, recentEntries: [] },
        reasoning: { recentTraces: [] },
        decisions: { total: 0, recent: [] },
        tools: { usage: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Render immediately - show skeleton while loading
  if (loading && !brainState) {
    return (
      <div className="text-center py-8 text-white/40">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/5 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-white/5 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!brainState) {
    return (
      <div className="text-center py-8 text-white/40">
        Unable to load brain state
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Memory Overview */}
      <Panel title={
        <div className="flex items-center gap-2">
          <MemoryStick className="w-4 h-4 text-purple-400" />
          <span>Memory State</span>
        </div>
      }>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Metric label="Total Entries" value={brainState.memory.totalEntries.toString()} />
          <Metric 
            label="Facts" 
            value={brainState.memory.recentEntries.filter(e => e.type === 'fact').length.toString()} 
            valueColor="text-blue-400"
          />
          <Metric 
            label="Decisions" 
            value={brainState.memory.recentEntries.filter(e => e.type === 'decision').length.toString()} 
            valueColor="text-emerald-400"
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-white/40 mb-2">Recent Memory Entries</div>
          {brainState.memory.recentEntries.length > 0 ? (
            brainState.memory.recentEntries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-white/5 rounded border border-white/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">{formatTime(entry.timestamp)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    entry.type === 'fact' ? 'bg-blue-500/20 text-blue-400' :
                    entry.type === 'decision' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {entry.type}
                  </span>
                </div>
                <div className="text-sm text-white/80">{entry.content}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-white/40 text-sm">No recent memory entries</div>
          )}
        </div>
      </Panel>

      {/* Reasoning Traces */}
      <Panel title={
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span>Recent Reasoning Traces</span>
        </div>
      }>
        {brainState.reasoning.recentTraces.length > 0 ? (
          <div className="space-y-3">
            {brainState.reasoning.recentTraces.slice(0, 5).map((trace) => (
              <div
                key={trace.id}
                className="p-3 bg-white/5 rounded border border-white/10"
              >
                <div className="text-xs text-white/40 mb-2">{formatTime(trace.timestamp)}</div>
                <div className="text-sm text-white/60 mb-2">
                  <strong className="text-white/80">Thought:</strong> {trace.thought}
                </div>
                <div className="text-sm text-emerald-400">
                  <strong>Conclusion:</strong> {trace.conclusion}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-white/40 text-sm">No recent reasoning traces</div>
        )}
      </Panel>

      {/* Decision History */}
      <div className="grid grid-cols-2 gap-4">
        <Panel title={
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Decision History</span>
          </div>
        }>
          <Metric label="Total Decisions" value={brainState.decisions.total.toString()} />
          <div className="mt-4 space-y-2">
            <div className="text-xs text-white/40 mb-2">Recent Decisions</div>
            {brainState.decisions.recent.length > 0 ? (
              brainState.decisions.recent.slice(0, 3).map((decision) => (
                <div
                  key={decision.id}
                  className="p-2 bg-white/5 rounded border border-white/10"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{formatTime(decision.timestamp)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      decision.outcome === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      decision.outcome === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {decision.outcome}
                    </span>
                  </div>
                  <div className="text-xs text-white/80">{decision.decision}</div>
                  <div className="text-xs text-white/40 mt-1">{decision.context}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-2 text-white/40 text-xs">No recent decisions</div>
            )}
          </div>
        </Panel>

        {/* Tool Usage */}
        <Panel title={
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Tool Usage Patterns</span>
          </div>
        }>
          {brainState.tools.usage.length > 0 ? (
            <div className="space-y-2">
              {brainState.tools.usage.map((tool, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/5 rounded border border-white/10"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white/80">{tool.tool}</span>
                    <span className="text-xs text-cyan-400">{tool.count} uses</span>
                  </div>
                  <div className="text-xs text-white/40">Last used: {formatTime(tool.lastUsed)}</div>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all"
                      style={{ width: `${Math.min((tool.count / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-white/40 text-sm">No tool usage data</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

