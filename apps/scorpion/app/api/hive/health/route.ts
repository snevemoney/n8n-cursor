import { NextRequest, NextResponse } from 'next/server';
import { assertHiveMachineAuth } from '../../../../server/hive';

export const dynamic = 'force-dynamic';

/** GET /api/hive/health — ops summary for scorpion_health tool */
export async function GET(req: NextRequest) {
  const denied = assertHiveMachineAuth(req);
  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    service: 'scorpion-hive',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/scorpion',
    ceConfigured: Boolean(process.env.CE_HIVE_BASE_URL?.trim()),
    n8nConfigured: Boolean(
      (process.env.N8N_BASE_URL || process.env.N8N_API_URL)?.trim() &&
        process.env.N8N_API_KEY?.trim(),
    ),
    machineAuthRequired: Boolean(process.env.HIVE_MACHINE_TOKEN?.trim()),
    ts: new Date().toISOString(),
  });
}
