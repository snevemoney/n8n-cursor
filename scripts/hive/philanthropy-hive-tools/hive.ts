/**
 * Scorpion + CE hive bridge tools — deployed to /opt/philanthropy via upgrade-hive-leverage.py
 */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'
import { ToolHandler, ToolRegistry } from './types'
import { fetchWithTimeout, missingKeyAlert, sendTelegramAlert } from './utils'
import { sendTelegramVoiceBrief } from '@/lib/telegram'
import { listTier3Policy } from './hitl-gate'

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

function ceBase(): string {
  return (
    process.env.CE_HIVE_BASE_URL?.trim() ||
    process.env.CE_HIVE_BASE?.trim() ||
    'http://127.0.0.1:3205'
  ).replace(/\/$/, '')
}

function ceToken(): string | null {
  return process.env.CE_HIVE_TOKEN?.trim() || null
}

function n8nBase(): string | null {
  const raw =
    process.env.N8N_BASE_URL?.trim() ||
    process.env.N8N_API_URL?.trim() ||
    'http://127.0.0.1:5678'
  return raw.replace(/\/$/, '')
}

function n8nKey(): string | null {
  return process.env.N8N_API_KEY?.trim() || null
}

async function ceFetch(path: string, init?: RequestInit): Promise<NextResponse> {
  const token = ceToken()
  if (!token) {
    return NextResponse.json(
      { error: 'CE_HIVE_TOKEN not configured on Outer Heaven', code: 'MISSING_KEY' },
      { status: 503 },
    )
  }
  try {
    const res = await fetchWithTimeout(`${ceBase()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers || {}),
      },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: (body as { error?: string }).error || `ce_http_${res.status}`, body },
        { status: res.status >= 500 ? 502 : res.status },
      )
    }
    return NextResponse.json({ ok: true, data: body })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message, code: 'CE_FETCH_FAILED' }, { status: 502 })
  }
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
      'Copy from VPS .env.hive into /opt/philanthropy/.env',
    )
    return NextResponse.json(
      { error: 'HIVE_MACHINE_TOKEN not configured on Outer Heaven', code: 'MISSING_KEY' },
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
    return NextResponse.json({ error: message, code: 'HIVE_FETCH_FAILED' }, { status: 502 })
  }
}

type CatalogEntry = {
  name: string
  webhookPath?: string | null
  /** Full URL override — prefer webhookPath + evenslouis.ca/webhook base */
  webhookUrl?: string
  hitl: boolean
  authHeader: string
  registerTo?: string
  note?: string
}

type CatalogFile = {
  webhookBase?: string
  entries: CatalogEntry[]
}

function loadN8nCatalog(): CatalogFile {
  const candidates = [
    process.env.N8N_CATALOG_PATH?.trim(),
    '/opt/philanthropy/config/n8n-catalog.json',
    join(process.cwd(), 'config/n8n-catalog.json'),
    join(process.cwd(), '../scripts/hive/n8n-catalog.json'),
  ].filter(Boolean) as string[]

  for (const path of candidates) {
    try {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf8')) as CatalogFile
      }
    } catch {
      /* try next */
    }
  }
  return { entries: [] }
}

function findCatalogEntry(name: string): CatalogEntry | undefined {
  const catalog = loadN8nCatalog()
  const key = name.trim().toLowerCase()
  return catalog.entries.find((e) => e.name.toLowerCase() === key)
}

const ce_list_actions: ToolHandler = async (params) => {
  const limit = Math.min(50, Math.max(1, Number(params.limit) || 10))
  return hiveFetch('ce_list_actions', `/api/hive/ce/actions?limit=${limit}`)
}

const ce_lookup_lead: ToolHandler = async (params) => {
  const q = String(params.q ?? params.query ?? '').trim()
  const limit = Math.min(20, Math.max(1, Number(params.limit) || 10))
  const query = q ? `?q=${encodeURIComponent(q)}&limit=${limit}` : `?limit=${limit}`
  return ceFetch(`/api/hive/leads${query}`)
}

const ce_resolve_action: ToolHandler = async (params) => {
  const actionId = String(params.actionId || params.id || '').trim()
  const decision = String(params.decision || '').trim()
  if (!actionId || !['approve', 'reject'].includes(decision)) {
    return NextResponse.json(
      { error: 'actionId and decision (approve|reject) required', code: 'MISSING_PARAM' },
      { status: 400 },
    )
  }
  const body: Record<string, unknown> = { decision }
  if (typeof params.note === 'string') body.note = params.note
  return ceFetch(`/api/hive/actions/${encodeURIComponent(actionId)}/resolve`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const ce_approve_action: ToolHandler = async (params) => {
  const actionId = String(params.actionId || params.id || '').trim()
  if (!actionId) {
    return NextResponse.json({ error: 'actionId required', code: 'MISSING_PARAM' }, { status: 400 })
  }
  const note = typeof params.note === 'string' ? params.note : undefined
  return ceFetch(`/api/hive/actions/${encodeURIComponent(actionId)}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ decision: 'approve', note }),
  })
}

const ce_reject_action: ToolHandler = async (params) => {
  const actionId = String(params.actionId || params.id || '').trim()
  if (!actionId) {
    return NextResponse.json({ error: 'actionId required', code: 'MISSING_PARAM' }, { status: 400 })
  }
  const note = typeof params.note === 'string' ? params.note : undefined
  return ceFetch(`/api/hive/actions/${encodeURIComponent(actionId)}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ decision: 'reject', note }),
  })
}

const scorpion_health: ToolHandler = async () => {
  return hiveFetch('scorpion_health', '/api/hive/health')
}

const scorpion_list_missions: ToolHandler = async (params) => {
  const limit = Math.min(200, Math.max(1, Number(params.limit) || 20))
  return hiveFetch('scorpion_list_missions', `/api/hive/missions?limit=${limit}`)
}

const scorpion_obsidian_context: ToolHandler = async () => {
  const status = await hiveFetch('scorpion_obsidian_context', '/api/hive/obsidian/status')
  return status
}

const scorpion_register_outcome: ToolHandler = async (params) => {
  const missionId = String(params.missionId || params.correlationId || '').trim()
  const summary = String(params.summary || '').trim()
  const target = String(params.target || params.registerTo || '').trim()
  if (!missionId || !summary || !target) {
    return NextResponse.json(
      { error: 'missionId, summary, and target are required', code: 'MISSING_PARAM' },
      { status: 400 },
    )
  }
  if (!['ce', 'scorpion', 'both'].includes(target)) {
    return NextResponse.json(
      { error: 'target must be ce | scorpion | both', code: 'MISSING_PARAM' },
      { status: 400 },
    )
  }
  const body: Record<string, unknown> = {
    correlationId: missionId,
    jobType: String(params.jobType || 'handoff.register'),
    goal: String(params.goal || summary),
    source: String(params.source || 'telegram'),
    status: String(params.status || 'done'),
    registerTo: target,
    summary,
  }
  if (Array.isArray(params.artifacts)) body.artifacts = params.artifacts
  if (params.metadata && typeof params.metadata === 'object') body.metadata = params.metadata
  return hiveFetch('scorpion_register_outcome', '/api/hive/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const n8n_get_execution: ToolHandler = async (params) => {
  const id = String(params.id || params.executionId || '').trim()
  if (!id) {
    return NextResponse.json({ error: 'Missing id', code: 'MISSING_PARAM' }, { status: 400 })
  }
  return hiveFetch('n8n_get_execution', `/api/hive/n8n/executions?id=${encodeURIComponent(id)}`)
}

const n8n_list_workflows: ToolHandler = async (params) => {
  const cap = Math.min(250, Math.max(1, Number(params.limit) || 250))
  const fetchAll = params.all === true || params.all === 'true'
  const base = n8nBase()
  const key = n8nKey()
  if (!key) {
    return NextResponse.json(
      { error: 'N8N_API_KEY not configured on Outer Heaven', code: 'MISSING_KEY' },
      { status: 503 },
    )
  }
  try {
    type Wf = { id?: string; name?: string; active?: boolean }
    const collected: Wf[] = []
    let cursor: string | undefined
    const pageSize = 100

    do {
      const qs = new URLSearchParams({ limit: String(pageSize) })
      if (cursor) qs.set('cursor', cursor)
      const res = await fetchWithTimeout(`${base}/api/v1/workflows?${qs}`, {
        headers: { Accept: 'application/json', 'X-N8N-API-KEY': key },
      })
      const body = (await res.json()) as { data?: Wf[]; nextCursor?: string | null }
      if (!res.ok) {
        return NextResponse.json({ error: `n8n_http_${res.status}`, body }, { status: 502 })
      }
      collected.push(...(body.data ?? []))
      cursor = body.nextCursor ?? undefined
    } while (cursor && (fetchAll || collected.length < cap))

    const slice = fetchAll ? collected : collected.slice(0, cap)
    const workflows = slice.map((w) => ({
      id: String(w.id ?? ''),
      name: String(w.name ?? 'unnamed'),
      active: Boolean(w.active),
    }))
    const catalog = loadN8nCatalog()
    const triggerable = catalog.entries
      .filter(
        (e) =>
          (e.webhookUrl && e.webhookUrl.startsWith('http')) ||
          (e.webhookPath && !e.webhookPath.includes('TBD')),
      )
      .map((e) => ({
        name: e.name,
        hitl: e.hitl,
        path: e.webhookUrl || e.webhookPath,
      }))
    const activeCount = collected.filter((w) => w.active).length
    return NextResponse.json({
      ok: true,
      data: {
        workflows,
        catalog: triggerable,
        source: 'n8n',
        meta: {
          returned: workflows.length,
          total: collected.length,
          active: activeCount,
          inactive: collected.length - activeCount,
          truncated: !fetchAll && collected.length > cap,
          hint:
            collected.length > workflows.length
              ? 'Pass all=true or limit=250 for full inventory'
              : undefined,
        },
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message, code: 'N8N_FETCH_FAILED' }, { status: 502 })
  }
}

const n8n_trigger_catalog_webhook: ToolHandler = async (params) => {
  const name = String(params.name || params.workflow || '').trim()
  if (!name) {
    return NextResponse.json({ error: 'name required (catalog workflow name)', code: 'MISSING_PARAM' }, { status: 400 })
  }

  const entry = findCatalogEntry(name)
  if (!entry) {
    const catalog = loadN8nCatalog()
    const names = catalog.entries.map((e) => e.name).join(', ')
    return NextResponse.json(
      { error: `not_in_catalog: ${name}`, code: 'CATALOG_MISS', allowed: names || 'none loaded' },
      { status: 404 },
    )
  }

  if (!entry.webhookUrl && (!entry.webhookPath || entry.webhookPath.includes('TBD'))) {
    return NextResponse.json({ error: 'workflow has no triggerable webhook path', code: 'NO_WEBHOOK' }, { status: 400 })
  }

  const operatorConfirm = params.operatorConfirm === true || params.operatorConfirm === 'true'
  if (entry.hitl && !operatorConfirm) {
    return NextResponse.json(
      {
        error: 'HITL workflow — set operatorConfirm: true after operator approval',
        code: 'HITL_REQUIRED',
        workflow: entry.name,
      },
      { status: 403 },
    )
  }

  let url: string
  if (entry.webhookUrl?.startsWith('http')) {
    url = entry.webhookUrl
  } else {
    const catalog = loadN8nCatalog()
    const webhookBase = (
      process.env.N8N_WEBHOOK_BASE?.trim() ||
      catalog.webhookBase ||
      'https://evenslouis.ca/webhook'
    ).replace(/\/$/, '')
    const path = String(entry.webhookPath).replace(/^\/webhook/, '').replace(/^\//, '')
    url = `${webhookBase}/${path}`
  }

  const correlationId = String(
    params.correlationId || `hive-n8n-${entry.name}-${Date.now()}`,
  ).trim()
  const payload =
    params.payload && typeof params.payload === 'object' && !Array.isArray(params.payload)
      ? (params.payload as Record<string, unknown>)
      : {}
  if (!payload.correlationId) payload.correlationId = correlationId

  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (entry.authHeader === 'X-Hive-Secret') {
    const secret = process.env.HIVE_WEBHOOK_SECRET?.trim()
    if (!secret) {
      return NextResponse.json(
        { error: 'HIVE_WEBHOOK_SECRET not configured', code: 'MISSING_KEY' },
        { status: 503 },
      )
    }
    headers['X-Hive-Secret'] = secret
  }

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    let body: unknown
    try {
      body = text ? JSON.parse(text) : { raw: text.slice(0, 500) }
    } catch {
      body = { raw: text.slice(0, 500) }
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `webhook_http_${res.status}`, url, body, correlationId },
        { status: 502 },
      )
    }

    await hiveFetch('n8n_trigger_catalog_webhook', '/api/hive/register', {
      method: 'POST',
      body: JSON.stringify({
        correlationId,
        jobType: 'n8n.webhook.trigger',
        goal: `Triggered catalog workflow ${entry.name}`,
        source: 'telegram',
        status: 'done',
        registerTo: entry.registerTo === 'ce' ? 'ce' : entry.registerTo === 'both' ? 'both' : 'scorpion',
        summary: `n8n catalog trigger ${entry.name}`,
        metadata: { workflow: entry.name, url },
      }),
    })

    return NextResponse.json({
      ok: true,
      workflow: entry.name,
      correlationId,
      url,
      status: res.status,
      body,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message, code: 'WEBHOOK_FAILED', url }, { status: 502 })
  }
}

const HIVE_REPORT_DEDUPE_MS = 15 * 60 * 1000
const HIVE_REPORT_LAST_ALERT = '/tmp/hive-report-last-alert.json'

function shouldSkipHiveAlert(reportText: string, forceAlert: boolean): boolean {
  if (forceAlert) return false
  try {
    if (!existsSync(HIVE_REPORT_LAST_ALERT)) return false
    const raw = readFileSync(HIVE_REPORT_LAST_ALERT, 'utf8')
    const prev = JSON.parse(raw) as { text?: string; at?: number }
    if (!prev.text || !prev.at) return false
    if (Date.now() - prev.at > HIVE_REPORT_DEDUPE_MS) return false
    return prev.text === reportText
  } catch {
    return false
  }
}

function recordHiveAlert(reportText: string): void {
  writeFileSync(
    HIVE_REPORT_LAST_ALERT,
    JSON.stringify({ text: reportText, at: Date.now() }),
    'utf8',
  )
}

function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim()
}

function formatGoldenPathReport(gp: {
  passCount?: number
  total?: number
  paths?: Array<{ path: string; name: string; pass: boolean; detail?: string }>
}): { text: string; voiceBrief: string } {
  const pass = gp.passCount ?? '?'
  const total = gp.total ?? '?'
  const lines = [`🦂 Hive score: ${pass}/${total} golden paths OK`, '']
  for (const p of gp.paths ?? []) {
    const label = stripUrls(String(p.name || p.path || ''))
    lines.push(`${p.pass ? '✅' : '❌'} ${p.path}: ${label}`)
  }
  lines.push('', 'Updated automatically when golden paths change.')
  return { text: lines.join('\n'), voiceBrief: `Hive report. ${pass} of ${total} golden paths passing.` }
}

const hive_send_report: ToolHandler = async (params) => {
  const correlationId = String(params.correlationId || `hive-report-${Date.now()}`).trim()
  const topicId = Math.max(1, Number(params.topicId) || 13)

  let gp: {
    passCount?: number
    total?: number
    paths?: Array<{ path: string; name: string; pass: boolean; detail?: string }>
  }
  try {
    const res = await fetchWithTimeout(`${hiveBase()}/api/hive/golden-paths`)
    const body = (await res.json()) as typeof gp & { ok?: boolean }
    if (!res.ok) {
      return NextResponse.json(
        { error: 'golden-paths fetch failed', code: 'HIVE_ERROR', status: res.status, body },
        { status: 502 },
      )
    }
    gp = body
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message, code: 'HIVE_FETCH_FAILED' }, { status: 502 })
  }

  const { text, voiceBrief } = formatGoldenPathReport(gp)
  const skipAlert = params.skipAlert === true || params.skipAlert === 'true'
  const forceAlert = params.forceAlert === true || params.forceAlert === 'true'
  const deduped = shouldSkipHiveAlert(text, forceAlert)
  if (!skipAlert && !deduped) {
    await sendTelegramAlert(text, topicId)
    recordHiveAlert(text)
  }
  const wantVoice = params.voice === true || params.voice === 'true'
  if (wantVoice) {
    await sendTelegramVoiceBrief(voiceBrief, topicId)
  }

  const reg = await hiveFetch('hive_send_report', '/api/hive/register', {
    method: 'POST',
    body: JSON.stringify({
      correlationId,
      jobType: 'report.notify',
      goal: 'Outer Heaven hive golden-path report (Big Boss)',
      source: 'telegram',
      status: 'done',
      registerTo: 'scorpion',
      summary: `Telegram report ${gp.passCount ?? '?'}/${gp.total ?? '?'} golden paths`,
      metadata: { topicId, agentId: params.agentId ?? 'bigboss' },
    }),
  })

  const regJson = await reg.json()
  return NextResponse.json({
    ok: true,
    correlationId,
    passCount: gp.passCount,
    total: gp.total,
    topicId,
    postedTo: '#alerts',
    summary: text,
    register: regJson,
  })
}

const hitl_gate_status: ToolHandler = async () => {
  return NextResponse.json({ ok: true, policy: listTier3Policy() })
}

const hitl_propose_action: ToolHandler = async (params) => {
  const category = String(params.category || '').trim()
  const type = String(params.type || '').trim()
  const reason = String(params.reason || '').trim()
  const allowed = ['money', 'deploy', 'secrets', 'client_send']
  if (!category || !type || !reason) {
    return NextResponse.json(
      { error: 'category, type, and reason required', code: 'MISSING_PARAM' },
      { status: 400 },
    )
  }
  if (!allowed.includes(category)) {
    return NextResponse.json(
      { error: `category must be one of: ${allowed.join(', ')}`, code: 'MISSING_PARAM' },
      { status: 400 },
    )
  }

  const correlationId = String(params.correlationId || `hitl-propose-${Date.now()}`).trim()
  const payload =
    params.payload && typeof params.payload === 'object' && !Array.isArray(params.payload)
      ? (params.payload as Record<string, unknown>)
      : {}

  const queueRes = await ceFetch('/api/hive/actions/queue', {
    method: 'POST',
    body: JSON.stringify({
      type: `tier3.${type}`,
      reason: `[${category}] ${reason}`,
      payload: { category, correlationId, ...payload, tier: 3, proposeOnly: true },
    }),
  })
  const queueJson = await queueRes.json()

  const surfaces: Record<string, string> = {
    money: 'https://evenslouis.ca/pro',
    deploy: 'GitHub PR + operator verify (never deploy_trigger from Telegram)',
    secrets: 'SSH — operator only; never commit secrets',
    client_send: 'https://evenslouis.ca/pro',
  }

  await hiveFetch('hitl_propose_action', '/api/hive/register', {
    method: 'POST',
    body: JSON.stringify({
      correlationId,
      jobType: 'hitl.propose',
      goal: reason,
      source: 'telegram',
      status: 'need_hitl',
      registerTo: 'both',
      summary: `Tier 3 propose [${category}]: ${type}`,
      metadata: { category, type, tier: 3 },
    }),
  })

  return NextResponse.json({
    ok: true,
    tier: 3,
    proposeOnly: true,
    category,
    type,
    correlationId,
    operatorSurface: surfaces[category],
    queue: queueJson,
    message: 'Queued for operator — action does NOT execute from Telegram',
  })
}

export const hiveTools: ToolRegistry = {
  ce_list_actions,
  ce_lookup_lead,
  ce_resolve_action,
  ce_approve_action,
  ce_reject_action,
  scorpion_health,
  scorpion_list_missions,
  scorpion_obsidian_context,
  scorpion_register_outcome,
  n8n_get_execution,
  n8n_list_workflows,
  n8n_trigger_catalog_webhook,
  hive_send_report,
  hitl_gate_status,
  hitl_propose_action,
}
