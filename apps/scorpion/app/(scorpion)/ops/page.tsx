'use client';

import { useState } from 'react';
import { Panel, Metric, Radar } from '@/components/scorpion';

const MOCK_ACTIONS = [
  { id: 'E-3', title: 'MP AND DESIGN DOES NOT MATCH', pct: 35, type: 'eng' },
  { id: 'E-6', title: 'IMPLEMENTATION DIFFICULTIES', pct: 65, type: 'warn' },
];

const MOCK_QUEUE = [
  { id: 'P-2', type: 'PRODUCT', label: 'WRITE UP THE PROJECT SPEC', tps: '5:42', owner: 'D-9' },
  { id: 'E-9', type: 'ENG', label: 'VERIFY ALIGNMENT W DESIGN', tps: '4:19', owner: 'E-0' },
  { id: 'QA-1', type: 'QA', label: 'RUN TEST SUITE', tps: '3:02', owner: 'Q-3' },
];

const MOCK_AGENTS = [
  { id: 'E-1', angle: 30, dist: 20, status: 'ok' as const, time: '01:13' },
  { id: 'E-5', angle: 120, dist: 50, status: 'warn' as const, time: '03:49' },
  { id: 'QA-3', angle: 210, dist: 35, status: 'ok' as const, time: '00:56' },
  { id: 'M-4', angle: 315, dist: 60, status: 'error' as const, time: '50:56' },
];

export default function OpsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="h-full grid grid-cols-[420px_1fr]">
      {/* LEFT COLUMN */}
      <div className="border-r border-white/5 flex flex-col overflow-hidden">
        {/* Monitoring table */}
        <Panel title="Monitoring Table" className="rounded-none border-0 border-b">
          <div className="text-sm font-medium">Project: Black Mesa Research Facility – Web</div>
          <div className="text-xs text-white/40 mt-1">A new website copy, design and development</div>
        </Panel>

        {/* Operator action items */}
        <Panel title="Operator Action Items" className="rounded-none border-0 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-white/30">5 agents idle</div>
          </div>
          <div className="space-y-2">
            {MOCK_ACTIONS.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a.id)}
                className={`w-full text-left border border-white/5 rounded-sm px-2 py-1.5 bg-white/0 hover:bg-white/5 transition ${
                  selected === a.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold sc-mono">{a.id}</span>
                  <span className="text-[10px] text-white/40">{a.pct}%</span>
                </div>
                <div className="text-[11px] text-white/70">{a.title}</div>
              </button>
            ))}
          </div>
        </Panel>

        {/* Global queue */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="sc-title mb-2">Global Queue</div>
          <div className="space-y-[1px]">
            {MOCK_QUEUE.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[54px_1fr_54px] items-center text-[11px] bg-white/0 border border-white/5 rounded-sm px-2 py-1 mb-1 hover:bg-white/5 transition-colors"
              >
                <div className="text-[10px] sc-mono">{item.id}</div>
                <div>
                  <div className="uppercase text-white/40 text-[9px]">{item.type}</div>
                  <div className="text-[11px]">{item.label}</div>
                </div>
                <div className="text-right text-[10px] text-white/40 sc-mono">{item.tps}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="p-4 grid grid-rows-[110px_1fr_120px] gap-4">
        {/* METRICS */}
        <div className="grid grid-cols-4 gap-3">
          <Metric label="Agents" value="19" />
          <Metric label="Total Tokens" value="51,312" />
          <Metric label="Tokens / sec" value="1,921" />
          <Metric label="Project Completion" value="41%" />
        </div>

        {/* RADAR */}
        <div className="bg-[#0f1318] border border-white/5 rounded-md relative overflow-hidden flex items-center justify-center">
          <Radar agents={MOCK_AGENTS} />
        </div>

        {/* CONTROL PANEL */}
        <div className="bg-[#0f1318] border border-white/5 rounded-md flex items-center justify-between px-3">
          <div className="sc-title">Master Control Panel</div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/40 mr-2">RUNNING 25:45</div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <button className="px-3 py-1 bg-emerald-500/20 text-xs border border-emerald-400/50 rounded-sm">
              RUN
            </button>
            <button className="px-3 py-1 bg-white/5 text-xs rounded-sm">PAUSE</button>
            <button className="px-3 py-1 bg-white/5 text-xs rounded-sm">STOP NEW</button>
          </div>
        </div>
      </div>
    </div>
  );
}

