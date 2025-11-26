'use client';

import { useState } from 'react';
import { Panel } from '@/components/scorpion';
import { Play, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PageLoadingBar } from '@/components/scorpion';

interface ModelComparison {
  model: string;
  provider: string;
  success: boolean;
  response: string | null;
  usage: any;
  duration: number;
  error: string | null;
}

interface ComparisonResult {
  comparisons: ModelComparison[];
  similarityScores: Record<string, Record<string, number>>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export default function ModelComparePage() {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [models, setModels] = useState<Array<{ name: string; provider: 'ollama' | 'openai' }>>([
    { name: 'scorpion:latest', provider: 'ollama' },
    { name: 'llama3.2:3b', provider: 'ollama' }
  ]);
  const [temperature, setTemperature] = useState(0.7);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addModel = () => {
    setModels([...models, { name: '', provider: 'ollama' }]);
  };

  const removeModel = (index: number) => {
    setModels(models.filter((_, i) => i !== index));
  };

  const updateModel = (index: number, field: 'name' | 'provider', value: string) => {
    const updated = [...models];
    updated[index] = { ...updated[index], [field]: value };
    setModels(updated);
  };

  const handleCompare = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (models.length < 2) {
      setError('Please add at least 2 models to compare');
      return;
    }

    if (models.some(m => !m.name.trim())) {
      setError('Please fill in all model names');
      return;
    }

    setComparing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/llm/models/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          models: models.filter(m => m.name.trim()),
          systemPrompt: systemPrompt || undefined,
          temperature
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error || data.message || 'Comparison failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to compare models');
    } finally {
      setComparing(false);
    }
  };

  return (
    <>
      <PageLoadingBar loading={comparing} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        <Panel title="Model Comparison">
        <p className="text-sm text-white/60 mb-4">
          Compare multiple LLM models side-by-side on the same prompt. See response quality, speed, and similarity scores.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50"
              placeholder="Enter the prompt to test all models with..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">System Prompt (Optional)</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50"
              placeholder="Optional system prompt..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Temperature</label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Models to Compare</label>
              <button
                onClick={addModel}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all"
              >
                + Add Model
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {models.map((model, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={model.name}
                  onChange={(e) => updateModel(index, 'name', e.target.value)}
                  placeholder="Model name (e.g., llama3.2:3b)"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50"
                />
                <select
                  value={model.provider}
                  onChange={(e) => updateModel(index, 'provider', e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50"
                >
                  <option value="ollama">Ollama</option>
                  <option value="openai">OpenAI</option>
                </select>
                {models.length > 2 && (
                  <button
                    onClick={() => removeModel(index)}
                    className="px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleCompare}
            disabled={comparing || !prompt.trim() || models.length < 2}
            className="w-full px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" />
            {comparing ? 'Comparing...' : 'Compare Models'}
          </button>
        </div>
      </Panel>

      {result && (
        <div className="space-y-4">
          <Panel title="Comparison Results">
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">{result.summary.total}</div>
                <div className="text-xs text-white/60">Total Models</div>
              </div>
              <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">{result.summary.successful}</div>
                <div className="text-xs text-white/60">Successful</div>
              </div>
              <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{result.summary.failed}</div>
                <div className="text-xs text-white/60">Failed</div>
              </div>
            </div>

            <div className="space-y-4">
              {result.comparisons.map((comp, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    comp.success
                      ? 'border-emerald-400/20 bg-emerald-500/5'
                      : 'border-red-400/20 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {comp.success ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span className="font-mono font-semibold">{comp.model}</span>
                      <span className="text-xs text-white/40">({comp.provider})</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {comp.duration}ms
                      </div>
                      {comp.usage && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {comp.usage.tokens || 'N/A'} tokens
                        </div>
                      )}
                    </div>
                  </div>

                  {comp.success && comp.response ? (
                    <div>
                      <div className="text-xs text-white/60 mb-1">Response:</div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded text-sm whitespace-pre-wrap">
                        {comp.response}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-400">
                      Error: {comp.error || 'Unknown error'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {Object.keys(result.similarityScores).length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-medium mb-3">Similarity Scores</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2">Model</th>
                        {Object.keys(result.similarityScores).map((model) => (
                          <th key={model} className="text-right p-2 font-mono">
                            {model}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.similarityScores).map(([model1, scores]) => (
                        <tr key={model1} className="border-b border-white/5">
                          <td className="p-2 font-mono">{model1}</td>
                          {Object.keys(result.similarityScores).map((model2) => (
                            <td key={model2} className="text-right p-2">
                              {model1 === model2 ? (
                                <span className="text-white/40">-</span>
                              ) : (
                                <span className={scores[model2] > 0.7 ? 'text-emerald-400' : scores[model2] > 0.4 ? 'text-yellow-400' : 'text-red-400'}>
                                  {(scores[model2] * 100).toFixed(0)}%
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}
      </div>
    </>
  );
}

