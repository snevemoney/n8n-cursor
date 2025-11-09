'use client';

import { useState, useEffect } from 'react';
import { Panel, useToast } from '@/components/scorpion';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [ragIndexing, setRagIndexing] = useState(true);
  const [autoTrigger, setAutoTrigger] = useState(false);
  const [councilAutoContext, setCouncilAutoContext] = useState(true);
  const [modelSource, setModelSource] = useState('ollama');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [openaiKey, setOpenaiKey] = useState('');
  const [entityRetention, setEntityRetention] = useState('90 days');
  const [ragModel, setRagModel] = useState('nomic-embed-text');
  const [maxAgents, setMaxAgents] = useState(4);
  const [requestTimeout, setRequestTimeout] = useState(30000);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        // Update state with loaded settings
        if (data.ragIndexing !== undefined) setRagIndexing(data.ragIndexing);
        if (data.autoTrigger !== undefined) setAutoTrigger(data.autoTrigger);
        if (data.councilAutoContext !== undefined) setCouncilAutoContext(data.councilAutoContext);
        if (data.modelSource) setModelSource(data.modelSource);
        if (data.ollamaUrl) setOllamaUrl(data.ollamaUrl);
        if (data.openaiKey) setOpenaiKey(data.openaiKey);
        if (data.entityRetention) setEntityRetention(data.entityRetention);
        if (data.ragModel) setRagModel(data.ragModel);
        if (data.maxAgents !== undefined) setMaxAgents(data.maxAgents);
        if (data.requestTimeout !== undefined) setRequestTimeout(data.requestTimeout);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = {
        ragIndexing,
        autoTrigger,
        councilAutoContext,
        modelSource,
        ollamaUrl,
        openaiKey,
        entityRetention,
        ragModel,
        maxAgents,
        requestTimeout
      };
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        showToast('success', 'Settings saved successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showToast('error', 'Failed to save settings. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
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
              checked={councilAutoContext}
              onChange={(e) => setCouncilAutoContext(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Ontology Settings">
        <div className="space-y-3">
          <div>
            <label className="sc-title block mb-1">Entity Retention</label>
            <select 
              value={entityRetention}
              onChange={(e) => setEntityRetention(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 text-white"
            >
              <option>30 days</option>
              <option>90 days</option>
              <option>1 year</option>
              <option>Forever</option>
            </select>
          </div>
          <div>
            <label className="sc-title block mb-1">RAG Embedding Model</label>
            <select 
              value={ragModel}
              onChange={(e) => setRagModel(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 text-white"
            >
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
              value={maxAgents}
              onChange={(e) => setMaxAgents(parseInt(e.target.value) || 4)}
              min={1}
              max={16}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm sc-mono focus:outline-none focus:border-emerald-400/50 text-white"
            />
          </div>
          <div>
            <div className="sc-title mb-1">Request Timeout (ms)</div>
            <input
              type="number"
              value={requestTimeout}
              onChange={(e) => setRequestTimeout(parseInt(e.target.value) || 30000)}
              min={1000}
              max={120000}
              step={1000}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm sc-mono focus:outline-none focus:border-emerald-400/50 text-white"
            />
          </div>
        </div>
      </Panel>
      </div>
    </div>
  );
}

