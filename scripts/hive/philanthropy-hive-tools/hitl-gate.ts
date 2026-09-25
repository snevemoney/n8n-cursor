/**
 * Tier 3 HITL gate — hard block mutate_prod from Telegram / OpenClaw agent lane.
 * Deploy to /opt/philanthropy/app/api/agent/tools/hitl-gate.ts
 */
import { NextResponse } from 'next/server'

export type HitlCategory = 'money' | 'deploy' | 'secrets' | 'client_send' | 'destructive'

export type Tier3Block = {
  category: HitlCategory
  operatorSurface: string
  reason: string
}

/** Tools that must NEVER run via POST /api/agent (Telegram face). */
export const TIER3_BLOCKED_TOOLS: Record<string, Tier3Block> = {
  deploy_trigger: {
    category: 'deploy',
    operatorSurface: 'SSH + operator runbook — never auto-deploy from Telegram',
    reason: 'Production deploy requires explicit operator approval outside agent lane',
  },
  vercel_deploy: {
    category: 'deploy',
    operatorSurface: 'Vercel dashboard or approved CI — not Telegram',
    reason: 'Production deploy is Tier 3 HITL',
  },
  restart_service: {
    category: 'destructive',
    operatorSurface: 'SSH / pm2 — operator only',
    reason: 'Service restart can take prod offline',
  },
  git_ops: {
    category: 'deploy',
    operatorSurface: 'GitHub PR + operator merge',
    reason: 'Git mutations can reach production',
  },
  file_manage: {
    category: 'secrets',
    operatorSurface: 'SSH — operator only',
    reason: 'File tools can touch secrets and openclaw.json',
  },
  computer_use: {
    category: 'destructive',
    operatorSurface: 'Operator workstation',
    reason: 'Unbounded machine control',
  },
  deal_update: {
    category: 'money',
    operatorSurface: 'https://evenslouis.ca/pro',
    reason: 'CE deal mutations require /pro HITL',
  },
  lead_update: {
    category: 'money',
    operatorSurface: 'https://evenslouis.ca/pro',
    reason: 'CE lead status mutations require /pro HITL',
  },
  crm_create: {
    category: 'money',
    operatorSurface: 'https://evenslouis.ca/pro',
    reason: 'Creating CRM records touches money path',
  },
  send_discord: {
    category: 'client_send',
    operatorSurface: 'https://evenslouis.ca/pro',
    reason: 'External send requires CE approve',
  },
  send_whatsapp: {
    category: 'client_send',
    operatorSurface: 'https://evenslouis.ca/pro',
    reason: 'Client WhatsApp send requires CE approve',
  },
  meta_post: {
    category: 'client_send',
    operatorSurface: 'https://evenslouis.ca/pro',
    reason: 'Public social post requires operator approve',
  },
  twitter_post: {
    category: 'client_send',
    operatorSurface: 'https://evenslouis.ca/pro',
    reason: 'Public social post requires operator approve',
  },
}

/** CE audit ledger tools — allowed; not money mutations. */
export const TIER2_CE_LEDGER_TOOLS = new Set([
  'ce_list_actions',
  'ce_lookup_lead',
  'ce_approve_action',
  'ce_reject_action',
  'ce_resolve_action',
])

const MONEY_PARAM_KEYS = new Set([
  'approvedAt',
  'proposalSentAt',
  'dealOutcome',
  'buildApproved',
  'sendApproved',
  'invoiceSentAt',
])

const VERBS = ['KILL', 'KEEP', 'SEND', 'PUBLISH'] as const
const RECEIPT_KEYS = ['authorized_by', 'executed_by', 'target', 'timestamp', 'result_evidence'] as const
const ONE_FLAG_KEYS = ['approved', 'done', 'execute', 'active', 'flag'] as const
const FLAG_TOKENS = new Set(['true', 'false', '1', '0', 'yes', 'no', 'on', 'off', 'y', 'n'])
const DONE_EVIDENCE = new Set(['done', 'complete', 'completed', 'ok', 'worker said done', 'worker_done'])

function isFlagValue(value: unknown): boolean {
  if (typeof value === 'boolean') return true
  if (typeof value === 'number' && Number.isFinite(value)) return true
  if (typeof value === 'string') return FLAG_TOKENS.has(value.trim().toLowerCase())
  return false
}

/**
 * KILL, KEEP, SEND, and PUBLISH keep recommendation, Evens decision, and
 * execution as separate fields. A boolean, a number, or a flag string is
 * not an action. The three fields do not excuse an extra one-flag.
 * Returns a reason when the payload collapses them, otherwise null.
 */
export function actionStatesCollapsed(params: Record<string, unknown>): string | null {
  for (const verb of VERBS) {
    if (isFlagValue(params[verb]) || isFlagValue(params[verb.toLowerCase()])) {
      return 'recommendation and execution cannot collapse into one flag'
    }
  }
  for (const key of ONE_FLAG_KEYS) {
    if (isFlagValue(params[key])) {
      return 'recommendation and execution cannot collapse into one flag'
    }
  }
  const hasThree =
    'recommendation' in params && 'evens_decision' in params && 'execution' in params
  if (!hasThree) return null
  if (params.recommendation === params.execution && params.execution !== 'not_executed') {
    return 'recommendation and execution cannot collapse into one flag'
  }
  if (params.execution === 'executed' && params.evens_decision !== 'yes') {
    return 'execution requires Evens decision yes'
  }
  if (params.execution === 'executed') {
    const receipt =
      params.receipt && typeof params.receipt === 'object'
        ? (params.receipt as Record<string, unknown>)
        : params
    for (const key of RECEIPT_KEYS) {
      if (!receipt[key]) return `consequential action missing ${key}`
    }
    const evidence = String(receipt.result_evidence).trim().toLowerCase()
    if (DONE_EVIDENCE.has(evidence)) return 'a worker saying done is not a receipt'
  }
  return null
}

function paramsAttemptMoneyBypass(params: Record<string, unknown>): boolean {
  for (const key of Object.keys(params)) {
    if (MONEY_PARAM_KEYS.has(key)) return true
    if (key === 'status' && params._mutateCe === true) return true
  }
  return false
}

export function tier3BlockResponse(tool: string, block: Tier3Block): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      code: 'TIER3_HITL_BLOCKED',
      tier: 3,
      tool,
      category: block.category,
      message: block.reason,
      operatorSurface: block.operatorSurface,
      proposeInstead: 'hitl_propose_action',
      docs: 'docs/hive/TIER3_HITL.md',
    },
    { status: 403 },
  )
}

/**
 * Returns a 403 response when tool is Tier-3 blocked, else null (proceed).
 */
export function enforceTier3HitlGate(
  tool: string,
  params: Record<string, unknown>,
): NextResponse | null {
  const block = TIER3_BLOCKED_TOOLS[tool]
  if (block) {
    return tier3BlockResponse(tool, block)
  }

  const collapsed = actionStatesCollapsed(params)
  if (collapsed) {
    return tier3BlockResponse(tool, {
      category: 'client_send',
      operatorSurface: 'Evens — recommendation, decision, and execution stay separate',
      reason: collapsed,
    })
  }

  if (paramsAttemptMoneyBypass(params)) {
    return tier3BlockResponse(tool, {
      category: 'money',
      operatorSurface: 'https://evenslouis.ca/pro',
      reason: 'Payload contains money-path status fields — use /pro HITL',
    })
  }

  return null
}

export function listTier3Policy() {
  return {
    tier: 3,
    rule: 'Money mutations, prod deploy, secrets, and client send never execute from Telegram. KILL, KEEP, SEND, and PUBLISH keep recommendation, Evens decision, and execution as separate fields. A worker saying done is not a receipt.',
    blockedTools: Object.keys(TIER3_BLOCKED_TOOLS),
    tier2LedgerTools: [...TIER2_CE_LEDGER_TOOLS],
    operatorSurfaces: {
      money: 'https://evenslouis.ca/pro',
      deploy: 'GitHub PR + operator verify',
      secrets: 'SSH / operator password files (never git)',
    },
    proposeTool: 'hitl_propose_action',
  }
}
