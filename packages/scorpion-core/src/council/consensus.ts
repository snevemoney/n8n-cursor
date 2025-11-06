/**
 * Consensus Engine - Merges council member responses with weighted voting
 */

export interface CouncilResult {
  name: string;
  weight: number;
  score: number;
  reply: string;
}

export interface Consensus {
  score: number;
  summary: string;
}

export function computeConsensus(results: any[]): Consensus {
  const parsed = results.map((r) => {
    const match = r.reply.match(/CONFIDENCE:\s*(\d+(\.\d+)?)/i);
    const score = match ? parseFloat(match[1]) : 5;
    
    return {
      name: r.name,
      weight: r.weight ?? 1,
      score,
      reply: r.reply
    };
  });

  const totalWeight = parsed.reduce((s, p) => s + p.weight, 0);
  const weightedScore =
    parsed.reduce((s, p) => s + p.score * p.weight, 0) / (totalWeight || 1);

  const summary = parsed
    .map(
      (p) => `• ${p.name} (${p.score}/10): ${firstLines(p.reply, 2)}`
    )
    .join("\n");

  return {
    score: Number(weightedScore.toFixed(2)),
    summary
  };
}

function firstLines(text: string, lines = 2): string {
  return text.split("\n").slice(0, lines).join(" ");
}

