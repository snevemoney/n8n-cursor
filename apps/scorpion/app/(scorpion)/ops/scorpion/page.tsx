// Simple admin console for Scorpion
'use client';

import { useEffect, useState } from 'react';

interface PatchSuggestion {
  id: string;
  category: 'DX' | 'PERFORMANCE' | 'CORRECTNESS' | 'UX' | 'ARCHITECTURE';
  summary: string;
  rationale: string;
  recommendations: string[];
  relatedSignalIds: string[];
}

interface PatchReport {
  generatedAt: string;
  missionCountAnalyzed: number;
  signalCountAnalyzed: number;
  suggestions: PatchSuggestion[];
}

export default function ScorpionDiagnostics() {
  const [report, setReport] = useState<PatchReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scorpion/patch-report')
      .then((r) => r.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load patch report:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Loading Patch Report...</p>;

  if (!report) return <p className="p-6 text-red-400">Failed to load patch report.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Scorpion Diagnostics Report</h1>
      <p className="text-neutral-400">
        Generated at: {new Date(report.generatedAt).toLocaleString()}
      </p>
      <p className="text-sm text-neutral-300">
        Analyzed {report.missionCountAnalyzed} missions and {report.signalCountAnalyzed} signals
      </p>

      {report.suggestions.length === 0 && (
        <div className="border border-green-500/50 bg-green-500/10 p-4 rounded-md">
          <p className="text-green-400 font-semibold">No issues detected. Scorpion is stable.</p>
        </div>
      )}

      {report.suggestions.map((s) => (
        <div key={s.id} className="border border-neutral-700 p-4 rounded-md bg-black/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-300">
              {s.category}
            </span>
            <h2 className="font-semibold text-lg">{s.summary}</h2>
          </div>
          <p className="text-neutral-300 mb-3">{s.rationale}</p>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-neutral-200">Recommendations:</h3>
            <ul className="list-disc list-inside text-neutral-200 space-y-1">
              {s.recommendations.map((r, idx) => (
                <li key={idx} className="text-sm">{r}</li>
              ))}
            </ul>
          </div>
          {s.relatedSignalIds.length > 0 && (
            <p className="text-xs text-neutral-400 mt-2">
              Related to {s.relatedSignalIds.length} signal(s)
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

