import type { NextRequest } from 'next/server';

/**
 * When HIVE_MACHINE_TOKEN is set, require Bearer or X-Hive-Token.
 * When unset (local/dev), allow — operator Caddy basic_auth still gates /scorpion.
 */
export function assertHiveMachineAuth(req: NextRequest): Response | null {
  const expected = process.env.HIVE_MACHINE_TOKEN?.trim();
  if (!expected) return null;

  const header = req.headers.get('authorization') || '';
  const bearer = header.toLowerCase().startsWith('bearer ')
    ? header.slice(7).trim()
    : '';
  const alt = req.headers.get('x-hive-token')?.trim() || '';
  if (bearer === expected || alt === expected) return null;

  return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}
