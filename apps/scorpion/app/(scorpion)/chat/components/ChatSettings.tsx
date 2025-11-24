'use client';

import { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { Panel, Button, Textarea, useToast } from '@/components/scorpion';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SystemPrompt {
  value: string;
  label: string;
  description: string;
  category: string;
}

const AVAILABLE_SYSTEM_PROMPTS: SystemPrompt[] = [
  // Core Orchestration
  { value: 'planner.system.txt', label: 'Planner', description: 'Main planning and orchestration prompt', category: 'Core' },
  { value: 'council.system.txt', label: 'Council', description: 'Multi-agent deliberation prompt', category: 'Core' },
  { value: 'summarizer.system.txt', label: 'Summarizer', description: 'Response summarization prompt', category: 'Core' },
  { value: 'identity.system.txt', label: 'Identity', description: 'Identity questions handler', category: 'Core' },
  
  // Execution & Routing
  { value: 'executor.system.txt', label: 'Executor', description: 'Tool runner for approved plans', category: 'Execution' },
  { value: 'tool-router.system.txt', label: 'Tool Router', description: 'Maps requests to minimal tool sets', category: 'Execution' },
  
  // Safety & Quality
  { value: 'safety-guard.system.txt', label: 'Safety Guard', description: 'Policy, privacy, and security evaluation', category: 'Safety' },
  { value: 'style-enforcer.system.txt', label: 'Style Enforcer', description: 'Tone and output consistency', category: 'Safety' },
  
  // Knowledge & Retrieval
  { value: 'rag-retriever.system.txt', label: 'RAG Retriever', description: 'Query rewriting and source ranking', category: 'Knowledge' },
  { value: 'knowledge-ingest.system.txt', label: 'Knowledge Ingest', description: 'Normalizes text/files into chunks', category: 'Knowledge' },
  { value: 'ontology-linker.system.txt', label: 'Ontology Linker', description: 'Extracts entities and relations', category: 'Knowledge' },
  
  // Memory & State
  { value: 'memory-manager.system.txt', label: 'Memory Manager', description: 'Long-term memory storage decisions', category: 'Memory' },
  
  // Code & Implementation
  { value: 'implementer.system.txt', label: 'Implementer', description: 'Produces minimal, safe code changes', category: 'Code' },
  { value: 'tester.system.txt', label: 'Tester', description: 'Creates/extends tests for verification', category: 'Code' },
  
  // Operations & Analysis
  { value: 'incident-analyst.system.txt', label: 'Incident Analyst', description: 'Log/metric analysis and RCA', category: 'Operations' },
  { value: 'file-inspector.system.txt', label: 'File Inspector', description: 'Recent files + OCR analysis', category: 'Operations' },
  { value: 'dataframe-analyst.system.txt', label: 'Dataframe Analyst', description: 'Table analysis with stats', category: 'Operations' },
  
  // Product & Design
  { value: 'product-manager.system.txt', label: 'Product Manager', description: 'RFC synthesis from needs', category: 'Product' },
  { value: 'ui-designer.system.txt', label: 'UI Designer', description: 'Component/page specifications', category: 'Product' },
  
  // Resource Management
  { value: 'budget-governor.system.txt', label: 'Budget Governor', description: 'Resource limits and model selection', category: 'Resources' },
  { value: 'dispatcher.system.txt', label: 'Dispatcher', description: 'Multi-machine task placement', category: 'Resources' },
];

export function ChatSettings({ isOpen, onClose }: ChatSettingsProps) {
  const { showToast } = useToast();
  const [selectedPrompt, setSelectedPrompt] = useState<string>('planner.system.txt');
  const [promptContent, setPromptContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load prompt content when selection changes
  useEffect(() => {
    if (isOpen && selectedPrompt) {
      loadPromptContent(selectedPrompt);
    }
  }, [isOpen, selectedPrompt]);

  const loadPromptContent = async (promptFile: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptFile}`);
      if (response.ok) {
        const content = await response.text();
        setPromptContent(content);
      } else {
        showToast('error', 'Failed to load prompt file');
        setPromptContent('');
      }
    } catch (error) {
      console.error('[ChatSettings] Failed to load prompt:', error);
      showToast('error', 'Failed to load prompt file');
      setPromptContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPrompt || !promptContent.trim()) {
      showToast('error', 'Please select a prompt and ensure it has content');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/prompts/${selectedPrompt}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: promptContent }),
      });

      if (response.ok) {
        showToast('success', 'System prompt saved successfully');
        // Reload the prompt to ensure it's updated
        await loadPromptContent(selectedPrompt);
      } else {
        const error = await response.json();
        showToast('error', error.message || 'Failed to save prompt');
      }
    } catch (error) {
      console.error('[ChatSettings] Failed to save prompt:', error);
      showToast('error', 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1014] border border-white/10 rounded-lg shadow-2xl flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Chat Settings</h2>
              <p className="text-xs md:text-sm text-white/50 mt-0.5">Configure system prompts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <Panel title="System Prompt Configuration">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Select System Prompt
                </label>
                <select
                  value={selectedPrompt}
                  onChange={(e) => setSelectedPrompt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400/50 transition-colors"
                >
                  {Object.entries(
                    AVAILABLE_SYSTEM_PROMPTS.reduce((acc, p) => {
                      const cat = p.category || 'Other';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(p);
                      return acc;
                    }, {} as Record<string, SystemPrompt[]>)
                  ).map(([category, prompts]) => (
                    <optgroup key={category} label={category} className="bg-[#0f1318]">
                      {prompts.map(p => (
                        <option key={p.value} value={p.value} className="bg-[#0f1318] text-white">
                          {p.label} - {p.description}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {AVAILABLE_SYSTEM_PROMPTS.find(p => p.value === selectedPrompt)?.description && (
                  <p className="text-xs text-white/50 mt-1">
                    {AVAILABLE_SYSTEM_PROMPTS.find(p => p.value === selectedPrompt)?.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Prompt Content
                </label>
                {loading ? (
                  <div className="p-8 text-center text-white/50">
                    Loading prompt content...
                  </div>
                ) : (
                  <Textarea
                    value={promptContent}
                    onChange={(e) => setPromptContent(e.target.value)}
                    placeholder="System prompt content will appear here..."
                    className="font-mono text-xs md:text-sm"
                    rows={20}
                    style={{ minHeight: '400px' }}
                  />
                )}
              </div>
            </div>
          </Panel>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-white/10">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || loading || !promptContent.trim()}
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            {saving ? 'Saving...' : 'Save Prompt'}
          </Button>
        </div>
      </div>
    </div>
  );
}

