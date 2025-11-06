'use client';

import { Panel, Metric, LogRow } from '@/components/scorpion';

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <div className="h-full grid grid-cols-[360px_1fr] p-4 gap-4">
      {/* Left: Agent Profile */}
      <Panel title="Agent Details">
        <div className="text-2xl font-semibold mb-2 sc-mono">AGENT {id.toUpperCase()}</div>
        <div className="text-xs text-white/40 mb-4">Code name: WHISSPERIA</div>
        <div className="text-xs text-white/40 mb-6">Active until: 19/02/2040</div>

        <div className="mb-4">
          <div className="sc-title mb-2">Risk Profile</div>
          <div className="flex gap-2">
            <RiskPill label="High" value={30} />
            <RiskPill label="Medium" value={34} />
            <RiskPill label="Low" value={8} />
          </div>
        </div>

        <div>
          <div className="sc-title mb-2">Current Cognitive Context</div>
          <ul className="text-xs text-white/70 space-y-1">
            <li>• Task: "Implement FE basic structure"</li>
            <li>• Linked project: LightningFlow</li>
            <li>• Source memory: RAG chunk #4598</li>
          </ul>
        </div>
      </Panel>

      {/* Right: Operations */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Missions Completed" value="72" />
          <Metric label="Success Rate" value="62%" />
          <Metric label="Tokens Used" value="12,944" />
        </div>

        <Panel title="Target Operation">
          <div className="h-56 flex items-center justify-center text-white/20 text-xs tracking-[0.2em] uppercase sc-mono">
            Target Operation Graph
          </div>
        </Panel>

        <Panel title="Activity Log">
          <div className="space-y-0">
            <LogRow time="2025-06-27 14:33" text="Aligned eng spec with MP, ready for council review." />
            <LogRow time="2025-06-27 12:04" text="Retrieved RAG context: design-system-v2." />
            <LogRow time="2025-06-27 10:52" text="Escalated: inconsistent project scope." level="error" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RiskPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 rounded-sm px-2 py-1 text-[10px]">
      {label} <span className="text-white/40 ml-1">{value}</span>
    </div>
  );
}

