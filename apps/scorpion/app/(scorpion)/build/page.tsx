'use client';

import { useState, useEffect } from 'react';
import { Panel, useToast, PageLoadingBar } from '@/components/scorpion';

interface BuildPlan {
  target: string;
  features?: string[];
  scaffold?: {
    framework: string;
    structure: any;
  };
  plan?: string;
}

export default function BuildPage() {
  const { showToast } = useToast();
  const [selectedProject, setSelectedProject] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState('');
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<BuildPlan | null>(null);
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKnowledgeStats();
  }, []);

  const loadKnowledgeStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/build');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setKnowledgeStats(result.data);
        } else {
          // Fallback for old API format
          setKnowledgeStats(result);
        }
      }
    } catch (error) {
      console.error('Failed to load knowledge stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (currentFeature.trim()) {
      setFeatures([...features, currentFeature.trim()]);
      setCurrentFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleGeneratePlan = async () => {
    if (!selectedProject) {
      showToast('warning', 'Please enter a project name');
      return;
    }
    
    if (features.length === 0) {
      showToast('warning', 'Please add at least one feature');
      return;
    }
    
    setGenerating(true);
    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: selectedProject,
          features,
          requirements: projectDescription
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        setPlan(data.plan);
        showToast('success', 'Build plan generated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to generate plan');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate plan';
      showToast('error', errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendToN8n = async () => {
    if (!plan) {
      showToast('warning', 'Please generate a plan first');
      return;
    }

    try {
      showToast('info', 'Creating workflow in n8n...');
      
      const response = await fetch('/api/build/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Build: ${selectedProject}`,
          plan: plan,
          description: `Build plan for ${selectedProject} with ${plan.features?.length || 0} features`
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        showToast('success', `Workflow "${data.workflowName}" created successfully in n8n!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to create workflow');
      }
    } catch (error: any) {
      console.error('Send error:', error);
      showToast('error', `Failed to send to n8n: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <>
      <PageLoadingBar loading={loading && !knowledgeStats} />
    <div className="h-full grid grid-cols-[320px_1fr] gap-4 p-4">
      <div className="space-y-4">
        <Panel title="Knowledge Base">
          {knowledgeStats ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Total Items:</span>
                <span className="font-semibold">{knowledgeStats.totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Workflows:</span>
                <span className="text-cyan-400">{knowledgeStats.categories?.workflows || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Databases:</span>
                <span className="text-purple-400">{knowledgeStats.categories?.databases || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Docs:</span>
                <span className="text-blue-400">{knowledgeStats.categories?.documentation || 0}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-white/40">Loading...</div>
          )}
        </Panel>

        <Panel title="Build Steps">
          <div className="space-y-2">
            {['Analyze Requirements', 'Extract Knowledge', 'Generate Plan', 'Create Scaffold', 'Deploy'].map((step, idx) => (
              <div key={idx} className="border border-white/5 rounded-sm p-2 bg-white/0 hover:bg-white/5 transition-colors">
                <div className="text-xs sc-mono mb-1">STEP {idx + 1}</div>
                <div className="text-sm">{step}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Project Configuration">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Project Name</label>
              <input
                type="text"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                placeholder="e.g., my-new-saas"
                className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50"
              />
            </div>
            
            <div>
              <label className="text-xs text-white/60 mb-1 block">Description (optional)</label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Brief description of what you're building..."
                rows={2}
                className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 resize-none"
              />
            </div>
            
            <div>
              <label className="text-xs text-white/60 mb-1 block">Features</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                  placeholder="Add a feature..."
                  className="flex-1 bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50"
                />
                <button
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700 transition-colors"
                  aria-label="Add feature"
                  title="Add feature to the list"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 rounded-sm px-3 py-2 text-sm">
                    <span>{feature}</span>
                    <button
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-red-400 hover:text-red-300 text-xs"
                      aria-label={`Remove feature: ${feature}`}
                      title={`Remove "${feature}" from the list`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {features.length === 0 && (
                  <div className="text-xs text-white/40">No features added yet</div>
                )}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Generated Plan">
          <div className="text-sm text-white/70 max-h-[400px] overflow-y-auto">
            {plan ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(plan, null, 2)}</pre>
            ) : selectedProject ? (
              <div className="space-y-3">
                <div>Build plan will appear here after analysis...</div>
                <div className="text-xs text-white/40">Click "Generate Plan" to begin</div>
              </div>
            ) : (
              'Enter a project name and add features to generate a build plan...'
            )}
          </div>
        </Panel>

        <div className="flex justify-end gap-2">
          <button 
            onClick={handleGeneratePlan}
            disabled={!selectedProject || features.length === 0 || generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Generate build plan"
            title={!selectedProject ? 'Enter a project name first' : features.length === 0 ? 'Add at least one feature first' : 'Generate build plan from project configuration'}
          >
            {generating ? 'Generating...' : 'Generate Plan'}
          </button>
          <button 
            onClick={handleSendToN8n}
            disabled={!plan}
            className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-sm text-sm hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send plan to n8n"
            title={!plan ? 'Generate a plan first' : 'Send build plan to n8n workflow (coming soon)'}
          >
            Send to n8n
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

