'use client';

import { useState, useEffect } from 'react';
import { Panel, PageLoadingBar } from '@/components/scorpion';
import { Brain, Code, TrendingUp, Building2, DollarSign, GraduationCap, FileCheck, PenTool } from 'lucide-react';

interface SpecializedAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
}

interface ExecutionResult {
  agentId: string;
  method: string;
  result: any;
}

export default function SpecializedAgentsPage() {
  const [agents, setAgents] = useState<SpecializedAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [method, setMethod] = useState<string>('');
  const [params, setParams] = useState<string>('{}');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately

  useEffect(() => {
    // Defer data fetch so page renders first
    setTimeout(() => {
      loadAgents();
    }, 0);
  }, []);

  const loadAgents = async () => {
    try {
      // Only show loading spinner on initial load
      if (agents.length === 0) {
        setLoading(true);
      }
      const response = await fetch('/api/agents/specialized');
      if (response.ok) {
        const data = await response.json();
        const loadedAgents = data.success ? (data.data?.agents || []) : (data.agents || []);
        setAgents(loadedAgents);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAgentIcon = (id: string) => {
    const icons: Record<string, any> = {
      'data-analytics': TrendingUp,
      'system-design': Building2,
      'ai-tools': Brain,
      'business-strategy': DollarSign,
      'python-expert': Code,
      'llm-training': GraduationCap,
      'model-evaluation': FileCheck,
      'prompt-engineering': PenTool,
    };
    return icons[id] || Brain;
  };

  const getAvailableMethods = (agentId: string): string[] => {
    const methods: Record<string, string[]> = {
      'data-analytics': ['analyze', 'recommendVisualization', 'suggestMetrics'],
      'system-design': ['design', 'reviewArchitecture', 'suggestTechnologies'],
      'ai-tools': ['recommendTools', 'designAgent', 'orchestrateWorkflow'],
      'business-strategy': ['analyzeBusinessModel', 'createGTMStrategy', 'analyzeCompetition'],
      'python-expert': ['generateCode', 'reviewCode', 'optimizeCode'],
      'llm-training': ['recommendTrainingStrategy', 'optimizeHyperparameters', 'analyzeTrainingData'],
      'model-evaluation': ['evaluateModel', 'compareModels', 'benchmarkPerformance'],
      'prompt-engineering': ['optimizePrompt', 'generateTemplate', 'testPrompts'],
    };
    return methods[agentId] || [];
  };

  const handleExecute = async () => {
    if (!selectedAgent || !method) {
      setError('Please select an agent and method');
      return;
    }

    setExecuting(true);
    setError(null);
    setResult(null);

    try {
      let parsedParams;
      try {
        parsedParams = JSON.parse(params);
      } catch (e) {
        setError('Invalid JSON in parameters');
        setExecuting(false);
        return;
      }

      const response = await fetch('/api/agents/specialized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          method,
          params: parsedParams
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error || data.message || 'Execution failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute agent');
    } finally {
      setExecuting(false);
    }
  };

  const selectedAgentInfo = agents.find(a => a.id === selectedAgent);
  const availableMethods = selectedAgent ? getAvailableMethods(selectedAgent) : [];

  return (
    <>
      <PageLoadingBar loading={loading && agents.length === 0} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        <Panel title="Specialized AI Agents">
          <p className="text-sm text-white/60 mb-4">
            Expert AI agents specialized in specific domains. Each agent has deep knowledge and capabilities in its area.
          </p>

          {loading ? (
            <div className="text-center py-8 text-white/40">Loading agents...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agents.map((agent) => {
                const Icon = getAgentIcon(agent.id);
                const isSelected = selectedAgent === agent.id;

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedAgent(agent.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${agent.name} agent`}
                    aria-pressed={isSelected}
                    className={`p-4 rounded-lg border cursor-pointer transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2 ${isSelected
                        ? 'border-emerald-400/50 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl" aria-hidden="true">{agent.icon}</div>
                      <Icon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                      <h3 className="font-semibold text-sm">{agent.name}</h3>
                    </div>
                    <p className="text-xs text-white/60 mb-3">{agent.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 text-[10px] rounded bg-white/5 text-white/60 border border-white/10"
                        >
                          {cap}
                        </span>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] text-white/40">
                          +{agent.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {selectedAgentInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title={`Execute: ${selectedAgentInfo.name}`}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="agent-method" className="block text-sm font-medium mb-2">Method</label>
                  <select
                    id="agent-method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
                    aria-label="Select agent method"
                  >
                    <option value="">Select a method...</option>
                    {availableMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="agent-params" className="block text-sm font-medium mb-2">Parameters (JSON)</label>
                  <textarea
                    id="agent-params"
                    value={params}
                    onChange={(e) => setParams(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
                    placeholder='{"question": "Your question here", ...}'
                    aria-label="Agent parameters in JSON format"
                  />
                </div>

                <button
                  onClick={handleExecute}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!executing && method) {
                        handleExecute();
                      }
                    }
                  }}
                  disabled={executing || !method}
                  className="w-full px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
                  aria-label={executing ? 'Executing agent method' : 'Execute agent method'}
                >
                  {executing ? 'Executing...' : 'Execute Agent'}
                </button>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400" role="alert">
                    {error}
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Execution Result">
              {result ? (
                <div className="space-y-4">
                  <div className="text-sm">
                    <span className="text-white/60">Agent:</span>{' '}
                    <span className="font-mono">{result.agentId}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-white/60">Method:</span>{' '}
                    <span className="font-mono">{result.method}</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-white/60 mb-2">Result:</div>
                    <pre className="p-4 bg-white/5 border border-white/10 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">
                  Execute an agent method to see results here
                </div>
              )}
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}

