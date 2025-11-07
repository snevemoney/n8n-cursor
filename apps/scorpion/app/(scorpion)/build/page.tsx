'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric } from '@/components/scorpion';

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
  const [selectedProject, setSelectedProject] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState('');
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<BuildPlan | null>(null);
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null);

  useEffect(() => {
    loadKnowledgeStats();
  }, []);

  const loadKnowledgeStats = async () => {
    try {
      const response = await fetch('/api/build');
      if (response.ok) {
        const data = await response.json();
        setKnowledgeStats(data);
      }
    } catch (error) {
      console.error('Failed to load knowledge stats:', error);
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
      alert('Please enter a project name');
      return;
    }
    
    if (features.length === 0) {
      alert('Please add at least one feature');
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
        const data = await response.json();
        setPlan(data.plan);
      } else {
        throw new Error('Failed to generate plan');
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendToN8n = async () => {
    if (!plan) {
      alert('Please generate a plan first');
      return;
    }

    try {
      // Create n8n workflow with the build plan
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Build: ${selectedProject}`,
          nodes: [
            {
              name: 'Start',
              type: 'n8n-nodes-base.start',
              position: [250, 300]
            },
            {
              name: 'Build Plan',
              type: 'n8n-nodes-base.code',
              parameters: {
                code: `// Generated Build Plan\n${JSON.stringify(plan, null, 2)}`
              },
              position: [450, 300]
            }
          ]
        })
      });
      
      if (response.ok) {
        alert('Build plan sent to n8n successfully!');
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send to n8n');
    }
  };

  return (
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
          >
            {generating ? 'Generating...' : 'Generate Plan'}
          </button>
          <button 
            onClick={handleSendToN8n}
            disabled={!plan}
            className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-sm text-sm hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send to n8n
          </button>
        </div>
      </div>
    </div>
  );
}

