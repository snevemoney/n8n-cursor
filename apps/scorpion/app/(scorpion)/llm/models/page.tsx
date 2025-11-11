'use client';

import { useState, useEffect } from 'react';
import { Panel, DataTable, PageLoadingBar } from '@/components/scorpion';

export default function ModelsPage() {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Defer data fetch aggressively so page renders instantly
    const loadData = () => {
      loadModels();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
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

  return (
    <>
      <PageLoadingBar loading={loading && models.length === 0} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
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

