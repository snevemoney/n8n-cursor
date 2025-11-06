'use client';

import { useState } from 'react';
import { Panel } from '@/components/scorpion';

export default function SettingsPage() {
  const [ragIndexing, setRagIndexing] = useState(true);
  const [autoTrigger, setAutoTrigger] = useState(false);
  const [modelSource, setModelSource] = useState('ollama');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');

  return (
    <div className="h-full grid grid-cols-2 gap-4 p-4 overflow-y-auto">
      <Panel title="Model Configuration">
        <div className="space-y-3">
          <div>
            <label className="sc-title block mb-1">Model Source</label>
            <select 
              value={modelSource}
              onChange={(e) => setModelSource(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 text-white"
            >
              <option value="ollama">Ollama</option>
              <option value="openai">OpenAI</option>
              <option value="local">Local</option>
            </select>
          </div>
          <div>
            <label className="sc-title block mb-1">Ollama URL</label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm sc-mono focus:outline-none focus:border-emerald-400/50 text-white"
            />
          </div>
          {modelSource === 'openai' && (
            <div>
              <label className="sc-title block mb-1">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm sc-mono focus:outline-none focus:border-emerald-400/50 text-white placeholder-white/30"
              />
            </div>
          )}
        </div>
      </Panel>

      <Panel title="System Settings">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Enable RAG Indexing</div>
              <div className="text-xs text-white/40">Automatically index entities in RAG store</div>
            </div>
            <input 
              type="checkbox" 
              checked={ragIndexing}
              onChange={(e) => setRagIndexing(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Auto-trigger Workflows</div>
              <div className="text-xs text-white/40">Automatically trigger workflows on decisions</div>
            </div>
            <input 
              type="checkbox" 
              checked={autoTrigger}
              onChange={(e) => setAutoTrigger(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Council Auto-Context</div>
              <div className="text-xs text-white/40">Inject ontology context in council meetings</div>
            </div>
            <input 
              type="checkbox" 
              defaultChecked
              className="w-4 h-4 accent-emerald-500"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Ontology Settings">
        <div className="space-y-3">
          <div>
            <label className="sc-title block mb-1">Entity Retention</label>
            <select className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 text-white">
              <option>30 days</option>
              <option>90 days</option>
              <option>1 year</option>
              <option>Forever</option>
            </select>
          </div>
          <div>
            <label className="sc-title block mb-1">RAG Embedding Model</label>
            <select className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 text-white">
              <option>nomic-embed-text</option>
              <option>all-minilm</option>
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="Performance">
        <div className="space-y-3">
          <div>
            <div className="sc-title mb-1">Max Concurrent Agents</div>
            <input
              type="number"
              defaultValue={4}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm sc-mono focus:outline-none focus:border-emerald-400/50 text-white"
            />
          </div>
          <div>
            <div className="sc-title mb-1">Request Timeout (ms)</div>
            <input
              type="number"
              defaultValue={30000}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm sc-mono focus:outline-none focus:border-emerald-400/50 text-white"
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}

