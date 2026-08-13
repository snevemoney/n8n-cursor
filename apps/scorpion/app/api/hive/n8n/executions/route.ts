import { NextRequest, NextResponse } from 'next/server';
import {
  assertHiveMachineAuth,
  getN8nExecution,
} from '../../../../../server/hive';

export const dynamic = 'force-dynamic';

/** GET /api/hive/n8n/executions?id=... */
export async function GET(req: NextRequest) {
  const denied = assertHiveMachineAuth(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json(
      { ok: false, error: 'id_required' },
      { status: 400 },
    );
  }
  const result = await getN8nExecution(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
