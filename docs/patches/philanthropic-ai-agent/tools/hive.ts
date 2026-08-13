/**
 * Scorpion hive bridge tools — Outer Heaven / philanthropic-ai-agent.
 * Prefer public hive under /scorpion; auth via HIVE_MACHINE_TOKEN.
 */
import { NextResponse } from 'next/server'
import { ToolHandler, ToolRegistry } from './types'
import { fetchWithTimeout, missingKeyAlert } from './utils'

function hiveBase(): string {
  const raw =
    process.env.SCORPION_HIVE_BASE?.trim() ||
    process.env.SCORPION_BASE_URL?.trim() ||
    'https://evenslouis.ca/scorpion'
  return raw.replace(/\/$/, '')
}

function hiveToken(): string | null {
  const t =
    process.env.HIVE_MACHINE_TOKEN?.trim() ||
    process.env.SCORPION_HIVE_TOKEN?.trim() ||
    ''
  return t || null
}

async function hiveFetch(
  toolName: string,
  path: string,
  init?: RequestInit,
): Promise<NextResponse> {
  const token = hiveToken()
  if (!token) {
    await missingKeyAlert(
      toolName,
      'HIVE_MACHINE_TOKEN',
      'Copy from VPS domain-paths/n8n-cursor/.env.hive into /opt/philanthropy/.env',
    )
    return NextResponse.json(
      {
        error: 'HIVE_MACHINE_TOKEN not configured on Outer Heaven',
        code: 'MISSING_KEY',
      },
      { status: 503 },
    )
  }

  const url = `${hiveBase()}${path.startsWith('/') ? path : `/${path}`}`
  try {
    const res = await fetchWithTimeout(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers || {}),
      },
    })
    const text = await res.text()
    let body: unknown
    try {
      body = text ? JSON.parse(text) : {}
    } catch {
      body = { raw: text.slice(0, 500) }
    }
    if (!res.ok) {
      return NextResponse.json(
        {
          error: (body as { error?: string })?.error || `http_${res.status}`,
          code: 'HIVE_ERROR',
          status: res.status,
          body,
        },
        { status: res.status >= 500 ? 502 : res.status },
      )
    }
    return NextResponse.json({ ok: true, data: body })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: message, code: 'HIVE_FETCH_FAILED' },
      { status: 502 },
    )
  }
}

const ce_list_actions: ToolHandler = async (params) => {
  const limit = Math.min(50, Math.max(1, Number(params.limit) || 10))
  return hiveFetch('ce_list_actions', `/api/hive/ce/actions?limit=${limit}`)
}

const ce_lookup_lead: ToolHandler = async (params) => {
  const q = String(params.q || params.query || '').trim()
  if (!q) {
    return NextResponse.json(
      { error: 'Missing q', code: 'MISSING_PARAM' },
      { status: 400 },
    )
  }
  return hiveFetch(
    'ce_lookup_lead',
    `/api/hive/ce/actions?q=${encodeURIComponent(q)}`,
  )
}

const scorpion_health: ToolHandler = async () => {
  return hiveFetch('scorpion_health', '/api/hive/health')
}

const scorpion_register_outcome: ToolHandler = async (params) => {
  const missionId = String(params.missionId || '').trim()
  const summary = String(params.summary || '').trim()
  const target = String(params.target || '').trim()
  if (!missionId || !summary || !target) {
    return NextResponse.json(
      {
        error: 'missionId, summary, and target are required',
        code: 'MISSING_PARAM',
      },
      { status: 400 },
    )
  }
  if (!['ce', 'scorpion', 'both'].includes(target)) {
    return NextResponse.json(
      { error: 'target must be ce | scorpion | both', code: 'MISSING_PARAM' },
      { status: 400 },
    )
  }
  const body: Record<string, unknown> = { missionId, summary, target }
  if (typeof params.sourceTopicId === 'number') body.sourceTopicId = params.sourceTopicId
  if (typeof params.agentId === 'string') body.agentId = params.agentId
  return hiveFetch('scorpion_register_outcome', '/api/hive/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const n8n_get_execution: ToolHandler = async (params) => {
  const id = String(params.id || params.executionId || '').trim()
  if (!id) {
    return NextResponse.json(
      { error: 'Missing id', code: 'MISSING_PARAM' },
      { status: 400 },
    )
  }
  return hiveFetch(
    'n8n_get_execution',
    `/api/hive/n8n/executions?id=${encodeURIComponent(id)}`,
  )
}

export const hiveTools: ToolRegistry = {
  ce_list_actions,
  ce_lookup_lead,
  scorpion_health,
  scorpion_register_outcome,
  n8n_get_execution,
}
