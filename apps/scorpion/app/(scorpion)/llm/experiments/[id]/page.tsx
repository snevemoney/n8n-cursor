'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, PageLoadingBar, LoadingState } from '@/components/scorpion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  baseModel: string;
  strategy: string;
  hyperparameters: Record<string, any>;
  dataset: {
    name: string;
    size: number;
    qualityScore?: number;
  };
  metrics?: Record<string, any>;
  metricsHistory?: Array<{
    step: number;
    timestamp: string;
    metrics: Record<string, number>;
  }>;
  trainedModelName?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  logs?: string[];
}

export default function ExperimentDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // Defer data fetch so page renders first
      setTimeout(() => {
        loadExperiment();
      }, 0);
      // Refresh if running
      const interval = setInterval(() => {
        if (experiment?.status === 'running') {
          loadExperiment();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [id, experiment?.status]);

  const loadExperiment = async () => {
    try {
      // Only show loading spinner on initial load
      if (!experiment) {
        setLoading(true);
      }
      const response = await fetch(`/api/llm/experiments/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExperiment(result.data);
        } else {
          setError('Experiment not found');
        }
      } else {
        setError('Experiment not found');
      }
    } catch (err) {
      console.error('Failed to load experiment:', err);
      setError('Failed to load experiment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'running': return 'text-cyan-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-white/40';
      default: return 'text-white/40';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <PageLoadingBar loading={loading && !experiment} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        <div className="flex items-center gap-4">
        <Link href="/llm/experiments" className="text-cyan-400 hover:text-cyan-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="sc-title text-2xl">{experiment?.name || 'Loading...'}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Experiment Details">
          <div className="space-y-4">
            <div>
              <div className="text-white/40 text-xs mb-1 sc-mono">STATUS</div>
              <div className={getStatusColor(experiment?.status || 'pending')}>{experiment?.status?.toUpperCase() || 'PENDING'}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1 sc-mono">BASE MODEL</div>
              <div className="sc-mono">{experiment?.baseModel || 'N/A'}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1 sc-mono">STRATEGY</div>
              <div className="uppercase">{experiment?.strategy || 'N/A'}</div>
            </div>
            {experiment?.trainedModelName && (
              <div>
                <div className="text-white/40 text-xs mb-1 sc-mono">TRAINED MODEL</div>
                <div className="sc-mono text-cyan-400">{experiment.trainedModelName}</div>
              </div>
            )}
            {experiment?.description && (
              <div>
                <div className="text-white/40 text-xs mb-1 sc-mono">DESCRIPTION</div>
                <div className="text-white/60">{experiment.description}</div>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Dataset">
          <div className="space-y-4">
            <div>
              <div className="text-white/40 text-xs mb-1 sc-mono">NAME</div>
              <div>{experiment?.dataset?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1 sc-mono">SIZE</div>
              <div>{experiment?.dataset?.size?.toLocaleString() || '0'} examples</div>
            </div>
            {experiment?.dataset?.qualityScore !== undefined && (
              <div>
                <div className="text-white/40 text-xs mb-1 sc-mono">QUALITY SCORE</div>
                <div>{(experiment?.dataset?.qualityScore * 100).toFixed(1) || '0'}%</div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Hyperparameters">
          <div className="space-y-2">
            {Object.entries(experiment?.hyperparameters || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-white/40 text-sm sc-mono">{key}:</span>
                <span className="text-white">{typeof value === 'number' ? value.toFixed(6) : String(value)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Metrics">
          {experiment?.metrics ? (
            <div className="space-y-2">
              {Object.entries(experiment.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-white/40 text-sm sc-mono">{key}:</span>
                  <span className="text-white">
                    {typeof value === 'number' ? (key === 'accuracy' ? `${(value * 100).toFixed(2)}%` : value.toFixed(4)) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/40 text-sm">No metrics available</div>
          )}
        </Panel>
      </div>

      {experiment?.logs && experiment.logs.length > 0 && (
        <Panel title="Logs">
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {experiment.logs.slice(-50).map((log, idx) => (
              <div key={idx} className="text-xs text-white/60 font-mono">
                {log}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {experiment?.error && (
        <Panel title="Error">
          <div className="text-red-400 text-sm">{experiment.error}</div>
        </Panel>
      )}

      <Panel title="Timeline">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Created:</span>
            <span className="sc-mono">{formatDate(experiment?.createdAt || '')}</span>
          </div>
          {experiment?.startedAt && (
            <div className="flex justify-between">
              <span className="text-white/40">Started:</span>
              <span className="sc-mono">{formatDate(experiment.startedAt)}</span>
            </div>
          )}
          {experiment?.completedAt && (
            <div className="flex justify-between">
              <span className="text-white/40">Completed:</span>
              <span className="sc-mono">{formatDate(experiment.completedAt)}</span>
            </div>
          )}
        </div>
      </Panel>
      </div>
    </>
  );
}

