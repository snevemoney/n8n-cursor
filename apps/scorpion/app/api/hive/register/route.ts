import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentScorpionOutcomes,
  registerHiveOutcome,
  type HiveRegisterTarget,
} from '../../../../server/hive';

export const dynamic = 'force-dynamic';

const TARGETS: HiveRegisterTarget[] = ['ce', 'scorpion', 'both'];

function isTarget(v: unknown): v is HiveRegisterTarget {
  return typeof v === 'string' && (TARGETS as string[]).includes(v);
}

/** POST — register a creative-engineering mission outcome into CE and/or Scorpion. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const {
    missionId,
    summary,
    target,
    sourceTopicId,
    agentId,
    refs,
  } = body as Record<string, unknown>;

  if (typeof missionId !== 'string' || !missionId.trim()) {
    return NextResponse.json({ ok: false, error: 'missionId_required' }, { status: 400 });
  }
  if (typeof summary !== 'string' || !summary.trim()) {
    return NextResponse.json({ ok: false, error: 'summary_required' }, { status: 400 });
  }
  if (!isTarget(target)) {
    return NextResponse.json({ ok: false, error: 'target_must_be_ce_scorpion_or_both' }, { status: 400 });
  }

  const result = registerHiveOutcome({
    missionId: missionId.trim(),
    summary: summary.trim(),
    target,
    sourceTopicId: typeof sourceTopicId === 'number' ? sourceTopicId : undefined,
    agentId: typeof agentId === 'string' ? agentId : undefined,
    refs:
      refs && typeof refs === 'object' && !Array.isArray(refs)
        ? (refs as Record<string, string>)
        : undefined,
  });

  return NextResponse.json(result);
}

/** GET — recent Scorpion-side hive outcomes (ops ledger). */
export async function GET(req: NextRequest) {
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = Math.min(100, Math.max(1, Number(limitRaw) || 20));
  return NextResponse.json({
    ok: true,
    outcomes: getRecentScorpionOutcomes(limit),
  });
}
