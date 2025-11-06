'use client';

import { Panel } from '@/components/scorpion';

const RULES = ['Validate', 'Split', 'If', 'Contains', 'Match', 'Compare'];
const ACTIONS = [
  'Manage Sequence',
  'Run AI Prompt',
  'Fetch Data',
  'Enrich Data',
  'Assign Manual Task',
  'Send Notification',
];

export default function WorkflowsPage() {
  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Palette */}
      <aside className="w-64 border-r border-white/5 bg-[#0f1318] p-4 overflow-y-auto shrink-0">
        <h2 className="sc-title mb-3">Build Block</h2>
        <Section title="Rules" items={RULES} />
        <Section title="List & Sequence" items={ACTIONS} />
      </aside>

      {/* Canvas */}
      <div className="flex-1 relative bg-[#0a0d10] sc-grid-bg overflow-hidden">
        <div className="relative w-full h-full p-8">
          <WorkflowNode x={80} y={40} label="Generate e-book outline" status="done" />
          <WorkflowNode x={340} y={90} label="Expand outline into chapters" status="running" />
          <WorkflowNode x={620} y={160} label="Format into PDF" status="idle" />
          <WorkflowNode x={880} y={160} label="Create product page" status="idle" />
          <Connector from={{ x: 230, y: 70 }} to={{ x: 340, y: 120 }} />
          <Connector from={{ x: 500, y: 120 }} to={{ x: 620, y: 190 }} />
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#0f1318]/95 border-t border-white/5 flex items-center justify-between px-4">
          <div className="sc-title">Template: Simple Workflow</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white/5 rounded-sm text-xs hover:bg-white/10">Run</button>
            <button className="px-3 py-1 bg-white/5 rounded-sm text-xs hover:bg-white/10">Step</button>
            <div className="text-xs text-white/40 sc-mono">900%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-4">
      <div className="sc-title mb-2">{title}</div>
      <div className="space-y-1">
        {items.map((i) => (
          <div
            key={i}
            className="bg-white/0 hover:bg-white/5 border border-white/5 rounded-sm px-2 py-1 text-xs cursor-pointer transition-colors"
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowNode({ x, y, label, status }: { x: number; y: number; label: string; status: 'done' | 'running' | 'idle' }) {
  const color =
    status === 'done'
      ? 'border-emerald-400/80'
      : status === 'running'
      ? 'border-amber-400/80'
      : 'border-white/10';

  return (
    <div
      className={`absolute bg-[#10151b] border ${color} rounded-sm px-3 py-2 w-48`}
      style={{ left: x, top: y }}
    >
      <div className="text-[10px] uppercase text-white/30 mb-1">/true</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}

function Connector({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const width = to.x - from.x;
  const height = to.y - from.y;

  return (
    <svg
      className="absolute overflow-visible pointer-events-none"
      style={{ left: from.x, top: from.y }}
      width={Math.abs(width)}
      height={Math.abs(height)}
    >
      <path
        d={`M0 0 L ${width} ${height}`}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1.1}
        fill="none"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

