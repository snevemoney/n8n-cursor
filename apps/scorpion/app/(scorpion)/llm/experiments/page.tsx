'use client';

import { useState, useEffect } from 'react';
import { Panel, DataTable, Metric, PageLoadingBar } from '@/components/scorpion';
import Link from 'next/link';

interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  baseModel: string;
  strategy: string;
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
  };
  metrics?: {
    loss?: number;
    accuracy?: number;
  };
  createdAt: string;
  completedAt?: string;
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [summary, setSummary] = useState({ total: 0, running: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(false); // Start false so page renders immediately

  useEffect(() => {
    // Defer data fetch so page renders first
    setTimeout(() => {
      loadExperiments();
    }, 0);
    // Refresh every 10 seconds if there are running experiments
    const interval = setInterval(() => {
      if (summary.running > 0) {
        loadExperiments();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [summary.running]);

  const loadExperiments = async () => {
    try {
      // Only show loading spinner on initial load
      if (experiments.length === 0) {
        setLoading(true);
      }
      const response = await fetch('/api/llm/experiments');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExperiments(result.data.experiments || []);
          const exps = result.data.experiments || [];
          setSummary({
            total: exps.length,
            running: exps.filter((e: Experiment) => e.status === 'running').length,
            completed: exps.filter((e: Experiment) => e.status === 'completed').length,
            failed: exps.filter((e: Experiment) => e.status === 'failed').length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load experiments:', error);
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
      <PageLoadingBar loading={loading && experiments.length === 0} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        <Panel title="LLM Training Experiments">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Metric label="Total" value={summary.total.toString()} />
          <Metric label="Running" value={summary.running.toString()} valueColor="text-cyan-400" />
          <Metric label="Completed" value={summary.completed.toString()} valueColor="text-emerald-400" />
          <Metric label="Failed" value={summary.failed.toString()} valueColor="text-red-400" />
        </div>

        {loading ? (
          <div className="text-center py-8 text-white/40">Loading experiments...</div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'baseModel', label: 'Base Model' },
              { key: 'strategy', label: 'Strategy' },
              { key: 'hyperparameters', label: 'Hyperparameters' },
              { key: 'metrics', label: 'Metrics' },
              { key: 'status', label: 'Status' },
              { key: 'created', label: 'Created' },
            ]}
            data={experiments.map(exp => ({
              name: (
                <Link href={`/llm/experiments/${exp.id}`} className="hover:text-cyan-400 transition-colors">
                  {exp.name}
                </Link>
              ),
              baseModel: <span className="sc-mono text-sm">{exp.baseModel}</span>,
              strategy: <span className="text-white/60 text-sm uppercase">{exp.strategy}</span>,
              hyperparameters: (
                <span className="text-white/60 text-xs">
                  LR: {exp.hyperparameters.learningRate}, BS: {exp.hyperparameters.batchSize}, E: {exp.hyperparameters.epochs}
                </span>
              ),
              metrics: exp.metrics ? (
                <span className="text-white/60 text-xs">
                  {exp.metrics.loss !== undefined && `Loss: ${exp.metrics.loss.toFixed(4)}`}
                  {exp.metrics.accuracy !== undefined && ` Acc: ${(exp.metrics.accuracy * 100).toFixed(1)}%`}
                </span>
              ) : (
                <span className="text-white/20 text-xs">-</span>
              ),
              status: <span className={getStatusColor(exp.status)}>{exp.status.toUpperCase()}</span>,
              created: <span className="sc-mono text-xs text-white/40">{formatDate(exp.createdAt)}</span>,
            }))}
          />
        )}
      </Panel>
      </div>
    </>
  );
}

