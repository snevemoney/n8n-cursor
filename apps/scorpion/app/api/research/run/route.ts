import { NextResponse } from 'next/server';
import { runScorpionBrain } from '@/server/orchestrator';
import { ScorpionContextSnapshot } from '@/server/types/strategy';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json();
  const query: string = body.query || '';

  const snapshot: ScorpionContextSnapshot = {
    userId: 'evens',
    timestamp: new Date().toISOString(),
    messages: [{ role: 'user', content: query }],
    currentPhase: 'PLAN',
    planSummary: '',
    toolsUsed: [],
  };

  const brain = await runScorpionBrain(snapshot);

  // For now, answer is just echoing query or you can plug in your research agent here
  const answer = `Research pipeline not yet wired.\n\nQuery was: ${query}`;

  return NextResponse.json({
    answer,
    nextBestAction: brain.nba,
    similarMissions: brain.similar,
  });
}

