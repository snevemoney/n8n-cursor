'use client';

import { useState, useEffect } from 'react';
import { Panel, DataTable, PageLoadingBar, Badge } from '@/components/scorpion';
import { CheckCircle, XCircle, AlertCircle, Zap, Cpu, Cloud } from 'lucide-react';

interface ProviderStatus {
  provider: 'ollama' | 'llamacpp' | 'vllm' | 'openai';
  available: boolean;
  healthy: boolean;
  priority: number;
  error?: string;
}

interface ProviderData {
  selected: 'ollama' | 'llamacpp' | 'vllm' | 'openai';
  all: ProviderStatus[];
  recommendation: string;
}

type ProviderStatusState = 'idle' | 'loading' | 'ok' | 'error';

export default function ModelsPage() {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderData | null>(null);
  const [providerStatusState, setProviderStatusState] = useState<ProviderStatusState>('idle');
  const [providerErrorMsg, setProviderErrorMsg] = useState<string | null>(null);

  const loadProviderStatus = async () => {
    try {
      setProviderStatusState('loading');
      setProviderErrorMsg(null);
      
      const response = await fetch('/api/llm/providers', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setProviderStatus(data.data);
        setProviderStatusState('ok');
      } else {
        throw new Error(data.error || 'API returned error');
      }
    } catch (err) {
      console.error('[LLM Models] Failed to load provider status:', err);
      setProviderStatusState('error');
      setProviderErrorMsg(err instanceof Error ? err.message : 'Failed to load provider status');
    }
  };

  useEffect(() => {
    console.log('[LLM Models] useEffect fired - loading data');
    // Load data immediately
    loadModels();
    loadProviderStatus();

    // Refresh provider status every 10 seconds
    const interval = setInterval(() => {
      loadProviderStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadModels = async () => {
    try {
      setError(null);
      // Only show loading spinner on initial load
      if (models.length === 0) {
        setLoading(true);
      }
      const response = await fetch('/api/ollama/models');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.models)) {
        // Extract model names from Ollama response format
        const modelNames = data.models.map((m: any) => m.name || m);
        setModels(modelNames);
      } else if (data.models && Array.isArray(data.models)) {
        // Fallback: handle direct array
        setModels(data.models.map((m: any) => m.name || m));
      } else {
        setError(data.message || 'Failed to load models');
        setModels([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
      console.error('Failed to load models:', err);
      setError(errorMessage);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'ollama': return <Cpu className="h-4 w-4" />;
      case 'llamacpp': return <Cpu className="h-4 w-4" />;
      case 'vllm': return <Zap className="h-4 w-4" />;
      case 'openai': return <Cloud className="h-4 w-4" />;
      default: return null;
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'ollama': return 'Ollama (Local CPU)';
      case 'llamacpp': return 'llama.cpp (Local CPU/GPU)';
      case 'vllm': return 'VLLM (GPU)';
      case 'openai': return 'OpenAI (Cloud)';
      default: return provider;
    }
  };

  return (
    <>
      <PageLoadingBar loading={loading && models.length === 0} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        {/* Hybrid AI Compute Stack Algorithm */}
        <Panel title="🦂 Hybrid AI Compute Stack - Provider Selection">
          {providerStatusState === 'loading' && (
            <div className="text-center py-4 text-white/40 text-sm">Loading provider status...</div>
          )}
          {providerStatusState === 'error' && (
            <div className="text-center py-4">
              <div className="text-red-400 mb-2">Failed to load provider status</div>
              <div className="text-white/60 text-sm">{providerErrorMsg || 'Unknown error'}</div>
            </div>
          )}
          {providerStatusState === 'ok' && providerStatus ? (
            <div className="space-y-4">
              {/* Current Selection */}
              <div className="border border-emerald-500/20 bg-emerald-500/5 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold">Selected Provider</span>
                </div>
                <div className="flex items-center gap-2">
                  {getProviderIcon(providerStatus.selected)}
                  <span className="text-lg font-bold text-emerald-400">
                    {getProviderLabel(providerStatus.selected).toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-white/60 mt-2">{providerStatus.recommendation}</div>
              </div>

              {/* Provider Status */}
              <div>
                <div className="text-xs text-white/60 mb-2">Provider Status (Fallback Chain)</div>
                <div className="space-y-2">
                  {providerStatus.all.map((provider, idx) => {
                    const isSelected = provider.provider === providerStatus.selected;
                    const icon = provider.healthy 
                      ? <CheckCircle className="h-4 w-4 text-emerald-400" />
                      : provider.available 
                      ? <AlertCircle className="h-4 w-4 text-yellow-400" />
                      : <XCircle className="h-4 w-4 text-red-400" />;
                    
                    return (
                      <div
                        key={provider.provider}
                        className={`flex items-center justify-between p-2 rounded border ${
                          isSelected 
                            ? 'border-emerald-500/50 bg-emerald-500/10' 
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40 w-4">{idx + 1}.</span>
                          {getProviderIcon(provider.provider)}
                          <span className="text-sm text-white">{getProviderLabel(provider.provider)}</span>
                          {isSelected && (
                            <Badge variant="success" size="sm">ACTIVE</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className={`text-xs ${
                            provider.healthy ? 'text-emerald-400' :
                            provider.available ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {provider.healthy ? 'HEALTHY' :
                             provider.available ? 'DEGRADED' :
                             'UNAVAILABLE'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Algorithm Flow */}
              <div className="border-t border-white/10 pt-4">
                <div className="text-xs text-white/60 mb-3">Algorithm Flow</div>
                <div className="bg-black/30 rounded p-3 text-xs font-mono space-y-1">
                  <div className="text-emerald-400">1. Discovery → Check provider health</div>
                  <div className="text-emerald-400">2. Selection → Choose first healthy provider</div>
                  <div className="text-emerald-400">3. Execution → Try providers in priority order</div>
                  <div className="text-emerald-400">4. Fallback → Auto-retry on failure</div>
                </div>
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel title="Available Models">
        {loading ? (
          <div className="text-center py-8 text-white/40">Loading models...</div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">Error loading models</div>
            <div className="text-white/60 text-sm">{error}</div>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-8 text-white/40">No models available</div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Model Name' },
            ]}
            data={models.map(model => ({
              name: <span className="sc-mono">{model}</span>,
            }))}
          />
        )}
      </Panel>

      <Panel title="Model Comparison">
        <div className="text-white/60 text-sm">
          Use the chat interface or API to compare models. Example:
          <pre className="mt-2 p-4 bg-white/5 rounded text-xs overflow-x-auto">
{`POST /api/llm/models/compare
{
  "prompt": "Explain quantum computing",
  "models": [
    { "name": "llama3.2:3b", "provider": "ollama" },
    { "name": "llama3.2:1b", "provider": "ollama" }
  ]
}`}
          </pre>
        </div>
      </Panel>
      </div>
    </>
  );
}

