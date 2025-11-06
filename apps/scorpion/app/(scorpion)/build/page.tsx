'use client';

import { useState } from 'react';
import { Panel, Metric } from '@/components/scorpion';

export default function BuildPage() {
  const [selectedProject, setSelectedProject] = useState('');

  return (
    <div className="h-full grid grid-cols-[320px_1fr] gap-4 p-4">
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

      <div className="space-y-4">
        <Panel title="Project Selector">
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 text-white"
          >
            <option value="">Select side hustle...</option>
            <option value="lightningflow">LightningFlow</option>
            <option value="n8n-cursor">n8n-cursor</option>
          </select>
        </Panel>

        <Panel title="Generated Plan">
          <div className="text-sm text-white/70">
            {selectedProject ? (
              <div className="space-y-3">
                <div>Build plan will appear here after analysis...</div>
                <div className="text-xs text-white/40">Select a project and click "Generate Plan" to begin</div>
              </div>
            ) : (
              'Select a project to generate build plan...'
            )}
          </div>
        </Panel>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-sm text-sm hover:bg-emerald-500/30 transition-colors">
            Send to n8n
          </button>
        </div>
      </div>
    </div>
  );
}

