'use client';

import { Panel, DataTable, LogRow } from '@/components/scorpion';

const MOCK_AGENTS = [
  { id: 'G-078W', name: 'VENGEFUL SPIRIT', success: 45, failed: 27, risk: 'medium' },
  { id: 'G-079X', name: 'OBSIDIAN SENTINEL', success: 72, failed: 8, risk: 'low' },
  { id: 'E-001', name: 'ARCHITECTUS', success: 120, failed: 5, risk: 'low' },
  { id: 'A-002', name: 'ANALYTICA', success: 89, failed: 12, risk: 'low' },
  { id: 'P-003', name: 'PRAGMATON', success: 95, failed: 3, risk: 'low' },
  { id: 'S-004', name: 'SATORI', success: 67, failed: 8, risk: 'low' },
];

const MOCK_LOGS = [
  { time: '2025-06-27 14:33', text: '[AGNT:gh0stFire]: INIT >> AAA loading secure channel...', level: 'info' as const },
  { time: '2025-06-27 14:23', text: '[AGNT:zeroNight]:: RESP >> ACK... syncing #546..Φ', level: 'info' as const },
  { time: '2025-06-27 14:15', text: 'SYSTEM WARNING: MM UNUSUAL TRAFFIC FROM NODE-6', level: 'warn' as const },
  { time: '2025-06-27 14:10', text: 'DECRYPT LOG: requesting visual on suspect-41 - triangulating path...', level: 'info' as const },
];

export default function AgentsPage() {
  return (
    <div className="grid grid-cols-[1.1fr_0.9fr] gap-4 p-4">
      <Panel title="Agent Data Overview">
        <DataTable
          columns={[
            { key: 'id', label: 'Agent ID' },
            { key: 'name', label: 'Identifier' },
            { key: 'success', label: 'Success' },
            { key: 'failed', label: 'Failed' },
          ]}
          data={MOCK_AGENTS.map(a => ({
            id: <span className="sc-mono">{a.id}</span>,
            name: a.name,
            success: <span className="text-emerald-300">{a.success}</span>,
            failed: <span className="text-red-300">{a.failed}</span>,
          }))}
        />
      </Panel>

      <Panel title="Encrypted Chat Activity">
        <div className="space-y-0">
          {MOCK_LOGS.map((log, idx) => (
            <LogRow key={idx} time={log.time} text={log.text} level={log.level} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

