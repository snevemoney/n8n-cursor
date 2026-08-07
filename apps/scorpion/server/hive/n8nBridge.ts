/**
 * n8n execution summary for hive diagnose tools.
 */

export interface N8nExecutionSummary {
  id: string;
  finished: boolean;
  status?: string;
  workflowId?: string;
  startedAt?: string;
  stoppedAt?: string;
  error?: string;
}

function n8nBase(): string | null {
  const b =
    process.env.N8N_BASE_URL?.trim() ||
    process.env.N8N_API_URL?.trim() ||
    null;
  return b ? b.replace(/\/$/, '') : null;
}

export async function getN8nExecution(
  id: string,
): Promise<{
  ok: boolean;
  execution: N8nExecutionSummary | null;
  source: 'n8n' | 'stub';
  error?: string;
}> {
  const base = n8nBase();
  const key = process.env.N8N_API_KEY?.trim();
  if (!base || !key) {
    return {
      ok: true,
      source: 'stub',
      execution: {
        id,
        finished: false,
        status: 'stub',
        error: 'N8N_BASE_URL/N8N_API_KEY not configured on Scorpion',
      },
    };
  }
  try {
    const res = await fetch(`${base}/api/v1/executions/${encodeURIComponent(id)}`, {
      headers: {
        Accept: 'application/json',
        'X-N8N-API-KEY': key,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      return {
        ok: false,
        source: 'n8n',
        execution: null,
        error: `n8n_http_${res.status}`,
      };
    }
    const data = (await res.json()) as Record<string, unknown>;
    const errData = data.data as Record<string, unknown> | undefined;
    const resultData = errData?.resultData as Record<string, unknown> | undefined;
    const error =
      typeof resultData?.error === 'object' && resultData.error
        ? JSON.stringify(resultData.error).slice(0, 500)
        : undefined;
    return {
      ok: true,
      source: 'n8n',
      execution: {
        id: String(data.id ?? id),
        finished: Boolean(data.finished),
        status: typeof data.status === 'string' ? data.status : undefined,
        workflowId:
          typeof data.workflowId === 'string' ? data.workflowId : undefined,
        startedAt:
          typeof data.startedAt === 'string' ? data.startedAt : undefined,
        stoppedAt:
          typeof data.stoppedAt === 'string' ? data.stoppedAt : undefined,
        error,
      },
    };
  } catch (e) {
    return {
      ok: false,
      source: 'n8n',
      execution: null,
      error: e instanceof Error ? e.message : 'n8n_fetch_failed',
    };
  }
}
