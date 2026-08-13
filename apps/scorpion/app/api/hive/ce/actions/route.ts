import { NextRequest, NextResponse } from 'next/server';
import {
  assertHiveMachineAuth,
  listCeActions,
  lookupCeLead,
} from '../../../../../server/hive';

export const dynamic = 'force-dynamic';

/** GET /api/hive/ce/actions?limit=10&q=optionalLeadQuery */
export async function GET(req: NextRequest) {
  const denied = assertHiveMachineAuth(req);
  if (denied) return denied;

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (q) {
    const result = await lookupCeLead(q);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  }

  const limit = Math.min(
    50,
    Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 10),
  );
  const result = await listCeActions(limit);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
