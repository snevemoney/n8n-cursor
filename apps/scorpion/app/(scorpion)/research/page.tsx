'use client';

import { useEffect, useState } from 'react';
import { NextBestAction } from '@/server/types/strategy';
import { SimilarMission } from '@/server/strategy/similarityEngine';
import { NextBestActionCard } from '../components/NextBestActionCard';

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [output, setOutput] = useState<string>('');
  const [nba, setNba] = useState<NextBestAction | null>(null);
  const [similar, setSimilar] = useState<SimilarMission[]>([]);

  async function runResearch() {
    setOutput('Thinking...');
    try {
      const res = await fetch('/api/research/run', {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setOutput(data.answer || '');
      setNba(data.nextBestAction || null);
      setSimilar(data.similarMissions || []);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Research Cockpit</h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 flex-1">
        {/* Left: query + answer */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-black/40 border border-neutral-700 rounded-md px-3 py-2 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  runResearch();
                }
              }}
              placeholder="Ask Scorpion to investigate something (web, code, knowledge)..."
            />
            <button
              onClick={runResearch}
              className="px-3 py-2 text-sm rounded-md bg-neutral-200 text-black hover:bg-white"
            >
              Run
            </button>
          </div>
          <div className="flex-1 rounded-md border border-neutral-800 p-3 text-sm bg-black/40 overflow-auto whitespace-pre-wrap">
            {output || 'No research yet. Submit a query to start.'}
          </div>
                  </div>
                  
        {/* Right: NBA + similar missions */}
        <div className="flex flex-col gap-3">
          {nba && <NextBestActionCard nba={nba} />}
          {similar.length > 0 && (
            <section className="rounded-md border border-neutral-800 p-3 text-sm bg-black/40">
              <h3 className="font-semibold mb-2">Similar Missions</h3>
              <ul className="space-y-2">
                {similar.map((m) => (
                  <li key={m.id} className="border border-neutral-700 rounded p-2">
                    <p className="font-medium">{m.title}</p>
                    <p className="text-neutral-300 text-xs">
                      {m.summary.slice(0, 160)}
                      {m.summary.length > 160 ? '…' : ''}
                    </p>
                    {m.lessonsLearned && m.lessonsLearned.length > 0 && (
                      <ul className="mt-1 text-xs text-neutral-400 list-disc list-inside">
                        {m.lessonsLearned.map((l, i) => (
                          <li key={i}>{l}</li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
            </section>
          )}
            </div>
      </div>
    </div>
  );
}
