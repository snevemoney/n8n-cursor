/**
 * Client Engine bridge for hive read tools.
 * Prefers CE_HIVE_BASE_URL + CE_HIVE_TOKEN; falls back to empty ledger for local stub.
 */

export interface CeAction {
  id: string;
  type: string;
  summary: string;
  createdAt: string;
  source?: string;
}

export interface CeLeadHit {
  id: string;
  name: string;
  status?: string;
  email?: string;
}

function ceBase(): string | null {
  const b = process.env.CE_HIVE_BASE_URL?.trim();
  return b ? b.replace(/\/$/, '') : null;
}

function ceHeaders(): HeadersInit {
  const token = process.env.CE_HIVE_TOKEN?.trim();
  const h: Record<string, string> = { Accept: 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function listCeActions(limit = 10): Promise<{
  ok: boolean;
  actions: CeAction[];
  source: 'ce' | 'stub';
  error?: string;
}> {
  const base = ceBase();
  if (!base) {
    return {
      ok: true,
      source: 'stub',
      actions: [],
    };
  }
  try {
    const res = await fetch(`${base}/api/hive/actions?limit=${limit}`, {
      headers: ceHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return {
        ok: false,
        source: 'ce',
        actions: [],
        error: `ce_http_${res.status}`,
      };
    }
    const data = (await res.json()) as { actions?: CeAction[] };
    return { ok: true, source: 'ce', actions: data.actions ?? [] };
  } catch (e) {
    return {
      ok: false,
      source: 'ce',
      actions: [],
      error: e instanceof Error ? e.message : 'ce_fetch_failed',
    };
  }
}

export async function lookupCeLead(q: string): Promise<{
  ok: boolean;
  hits: CeLeadHit[];
  source: 'ce' | 'stub';
  error?: string;
}> {
  const base = ceBase();
  if (!base) {
    return { ok: true, source: 'stub', hits: [] };
  }
  try {
    const res = await fetch(
      `${base}/api/hive/leads?q=${encodeURIComponent(q)}`,
      { headers: ceHeaders(), cache: 'no-store' },
    );
    if (!res.ok) {
      return {
        ok: false,
        source: 'ce',
        hits: [],
        error: `ce_http_${res.status}`,
      };
    }
    const data = (await res.json()) as { hits?: CeLeadHit[] };
    return { ok: true, source: 'ce', hits: data.hits ?? [] };
  } catch (e) {
    return {
      ok: false,
      source: 'ce',
      hits: [],
      error: e instanceof Error ? e.message : 'ce_fetch_failed',
    };
  }
}
