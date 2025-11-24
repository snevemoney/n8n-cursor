// apps/scorpion/app/(scorpion)/components/NextBestActionCard.tsx

'use client';

import { NextBestAction } from '@/server/types/strategy';

interface Props {
  nba: NextBestAction;
}

export function NextBestActionCard({ nba }: Props) {
  return (
    <section className="rounded-md border border-neutral-800 p-3 text-sm bg-black/40 backdrop-blur">
      <h3 className="font-semibold mb-1 text-neutral-100">Next Best Action</h3>
      <p className="text-neutral-300 mb-2">{nba.description}</p>

      <ul className="list-disc list-inside text-neutral-200 mb-2 space-y-1">
        {nba.steps.map((s, idx) => (
          <li key={idx} className="text-xs">{s}</li>
        ))}
      </ul>

      <p className="text-xs text-neutral-400 mb-1">
        <span className="font-semibold">Why:</span> {nba.rationale}
      </p>

      {nba.suggestedTools && nba.suggestedTools.length > 0 && (
        <p className="text-xs text-neutral-400 mb-1">
          <span className="font-semibold">Suggested tools:</span>{' '}
          {nba.suggestedTools.join(', ')}
        </p>
      )}

      {nba.risks && nba.risks.length > 0 && (
        <p className="text-xs text-red-400">
          <span className="font-semibold">Risks:</span>{' '}
          {nba.risks.join(' · ')}
        </p>
      )}
    </section>
  );
}

