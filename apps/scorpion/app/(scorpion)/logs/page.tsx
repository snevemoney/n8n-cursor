'use client';

import { Panel, LogRow } from '@/components/scorpion';

const MOCK_LOGS = [
  { time: '2025-06-27 14:33:12', text: 'Council meeting completed - Consensus: 7.5/10', level: 'info' as const },
  { time: '2025-06-27 14:30:45', text: 'Workflow execution started: email-notifications', level: 'info' as const },
  { time: '2025-06-27 14:28:22', text: 'RAG search completed - 5 results found', level: 'info' as const },
  { time: '2025-06-27 14:25:10', text: 'WARNING: High token usage detected', level: 'warn' as const },
  { time: '2025-06-27 14:20:05', text: 'ERROR: Failed to connect to Ollama', level: 'error' as const },
  { time: '2025-06-27 14:15:33', text: 'Ontology entity stored: Workflow-123', level: 'info' as const },
  { time: '2025-06-27 14:10:22', text: 'Agent Pragmaton completed task: Setup server', level: 'info' as const },
];

export default function LogsPage() {
  return (
    <div className="p-4">
      <Panel title="System Logs">
        <div className="space-y-0">
          {MOCK_LOGS.map((log, idx) => (
            <LogRow key={idx} time={log.time} text={log.text} level={log.level} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

