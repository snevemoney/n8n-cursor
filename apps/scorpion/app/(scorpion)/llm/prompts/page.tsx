'use client';

import { useState } from 'react';
import { Panel, PageLoadingBar } from '@/components/scorpion';

export default function PromptsPage() {
  const [testPrompt, setTestPrompt] = useState('');
  const [testModels, setTestModels] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (!testPrompt || testModels.length === 0) {
      alert('Please provide a prompt and select at least one model');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch('/api/llm/prompts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: [{ name: 'Test Prompt', prompt: testPrompt }],
          models: testModels,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setTestResult(result.data);
      } else {
        alert('Test failed: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <PageLoadingBar loading={testing} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        <Panel title="Prompt Testing">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/40 mb-2">Prompt</label>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded p-3 text-white font-mono text-sm"
              rows={6}
              placeholder="Enter your prompt here..."
            />
          </div>

          <div>
            <label className="block text-sm text-white/40 mb-2">Models (comma-separated)</label>
            <input
              type="text"
              value={testModels.join(', ')}
              onChange={(e) => setTestModels(e.target.value.split(',').map(m => m.trim()).filter(Boolean))}
              className="w-full bg-white/5 border border-white/10 rounded p-3 text-white"
              placeholder="llama3.2:3b, llama3.2:1b"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={testing || !testPrompt || testModels.length === 0}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/10 disabled:text-white/40 rounded transition-colors"
          >
            {testing ? 'Testing...' : 'Test Prompt'}
          </button>

          {testResult && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Results</h3>
              {testResult.results?.[0]?.modelResults?.map((result: any, idx: number) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded p-4">
                  <div className="font-semibold mb-2">{result.model}</div>
                  {result.success ? (
                    <div className="text-sm text-white/60">{result.response}</div>
                  ) : (
                    <div className="text-sm text-red-400">Error: {result.error}</div>
                  )}
                  {result.duration && (
                    <div className="text-xs text-white/40 mt-2">Duration: {result.duration}ms</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Prompt Templates">
        <div className="text-white/60 text-sm">
          Prompt templates and optimization features coming soon. Use the testing interface above to test prompts.
        </div>
      </Panel>
      </div>
    </>
  );
}

