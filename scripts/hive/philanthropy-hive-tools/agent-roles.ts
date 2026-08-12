/**
 * Per-agent hive tool allowlist — keyed by agentId from OpenClaw.
 * Deploy to /opt/philanthropy/app/api/agent/tools/agent-roles.ts
 *
 * Non-hive tools (email, crm, media, …) pass through untouched.
 * Tier 3 HITL gate runs first (hitl-gate.ts); this gate is role scope only.
 */
import { NextResponse } from 'next/server'
import {
  GROK_ROSTER_AGENT_PROFILE,
  GROK_ROSTER_ROLE_LINES,
} from './grok-roster-roles.generated'

/** All tools registered in hive.ts — role gate applies only to these. */
export const HIVE_TOOLS = new Set([
  'ce_list_actions',
  'ce_lookup_lead',
  'ce_resolve_action',
  'ce_approve_action',
  'ce_reject_action',
  'scorpion_health',
  'scorpion_list_missions',
  'scorpion_obsidian_context',
  'scorpion_register_outcome',
  'n8n_get_execution',
  'n8n_list_workflows',
  'n8n_trigger_catalog_webhook',
  'hive_send_report',
  'hitl_gate_status',
  'hitl_propose_action',
])

/** Base grant for every known agent. */
const BASE_TOOLS = ['scorpion_health', 'hitl_gate_status', 'hitl_propose_action'] as const

const COUNCIL_READ_TOOLS = [
  'scorpion_list_missions',
  'scorpion_obsidian_context',
  'n8n_list_workflows',
  'n8n_get_execution',
] as const

const RESEARCH_EXTRA = ['scorpion_register_outcome'] as const

const INFRA_OPS_EXTRA = ['hive_send_report', 'n8n_trigger_catalog_webhook'] as const

const BUILDER_EXTRA = ['n8n_trigger_catalog_webhook'] as const

const FINANCE_EXTRA = [
  'ce_list_actions',
  'ce_lookup_lead',
  'ce_resolve_action',
  'ce_approve_action',
  'ce_reject_action',
  'scorpion_register_outcome',
] as const

const BIZ_CRM_EXTRA = ['ce_list_actions', 'ce_lookup_lead', 'scorpion_register_outcome'] as const

const LEAD_GEN_EXTRA = ['ce_lookup_lead', 'scorpion_register_outcome'] as const

const CONTENT_EXTRA = ['scorpion_register_outcome'] as const

const FINANCE_READ_EXTRA = ['ce_list_actions', 'ce_lookup_lead'] as const

const KNOWLEDGE_EXTRA = [
  'scorpion_obsidian_context',
  'scorpion_list_missions',
  'scorpion_register_outcome',
] as const

const SECURITY_EXTRA = ['scorpion_register_outcome'] as const

const GTM_EXTRA = [
  'ce_list_actions',
  'ce_lookup_lead',
  'scorpion_register_outcome',
  'hitl_propose_action',
] as const

const REVENUE_INTEL_EXTRA = [
  'ce_list_actions',
  'scorpion_register_outcome',
  'scorpion_list_missions',
] as const

export type RoleProfile =
  | 'commander'
  | 'council_read'
  | 'research'
  | 'infra_ops'
  | 'comms_qa'
  | 'builder'
  | 'finance'
  | 'finance_read'
  | 'biz_crm'
  | 'lead_gen'
  | 'content'
  | 'knowledge'
  | 'security'
  | 'creative'
  | 'gtm'
  | 'revenue_intel'

/** Human-readable role line shown in ROLE_BLOCKED responses. */
export const AGENT_ROLE_LINES: Record<string, string> = {
  bigboss: 'Commander — full hive operator console',
  solidsnake: 'Council critic — read-only hive visibility',
  venomsnake: 'Council critic — read-only hive visibility',
  liquidsnake: 'Autoresearch — experiments + register outcomes',
  sigint: 'Research intel — experiments + register outcomes',
  radar: 'Trend scout — experiments + register outcomes',
  naomi: 'Infra ops — crons, health smokes, golden paths',
  herald: 'Comms QA — ecosystem-route comms + health smokes',
  forge: 'Builder — error-heal owner; catalog webhooks only',
  ledger: 'Finance audit — CE ledger + read council',
  business: 'Business squad — CRM read + register',
  ocelot: 'CRM — leads + ce-lead route (HITL-flagged webhooks)',
  scout: 'Lead gen — lookup leads + register',
  voice: 'Content — register outcomes only',
  designer: 'Content — register outcomes only',
  social: 'Content — register outcomes only',
  creator: 'Content — register outcomes only',
  'grok-big-boss': 'Grok Commander — full hive operator console',
  'grok-watchdog-ops': 'Grok infra ops — health smokes, golden paths',
  'grok-life-business-ops': 'Grok life/business lanes — smokes + approved fixes',
  'grok-hitl-operator': 'Grok HITL digest — read queue, propose only',
  'grok-n8n-automation': 'Grok n8n — evenslouis.ca catalog only',
  'grok-ce-leads': 'Grok CE read — leads + propose',
  'grok-telegram-console': 'Grok Telegram — shortcut parity verify',
  'grok-forge-builder': 'Grok builder — catalog webhooks + smokes',
  'grok-scout-lead-gen': 'Grok lead gen — lookup + register',
  'grok-vault-librarian': 'Grok knowledge — Obsidian + chronicle',
  'grok-engineering-lead': 'Grok engineering — smokes + register + Cursor handoff',
  'grok-creative-studio': 'Grok creative — research register, no CE money',
  'grok-security-reviewer': 'Grok security — read-only posture + propose findings',
  ...GROK_ROSTER_ROLE_LINES,
}

const AGENT_PROFILE: Record<string, RoleProfile> = {
  bigboss: 'commander',
  solidsnake: 'council_read',
  venomsnake: 'council_read',
  liquidsnake: 'research',
  sigint: 'research',
  radar: 'research',
  naomi: 'infra_ops',
  herald: 'comms_qa',
  forge: 'builder',
  ledger: 'finance',
  business: 'biz_crm',
  ocelot: 'biz_crm',
  scout: 'lead_gen',
  voice: 'content',
  designer: 'content',
  social: 'content',
  creator: 'content',
  'grok-big-boss': 'commander',
  'grok-watchdog-ops': 'infra_ops',
  'grok-life-business-ops': 'infra_ops',
  'grok-hitl-operator': 'finance_read',
  'grok-n8n-automation': 'infra_ops',
  'grok-ce-leads': 'biz_crm',
  'grok-telegram-console': 'comms_qa',
  'grok-forge-builder': 'builder',
  'grok-scout-lead-gen': 'lead_gen',
  'grok-vault-librarian': 'knowledge',
  'grok-engineering-lead': 'builder',
  'grok-creative-studio': 'creative',
  'grok-security-reviewer': 'security',
  ...Object.fromEntries(
    Object.entries(GROK_ROSTER_AGENT_PROFILE).map(([id, profile]) => [id, profile as RoleProfile]),
  ),
}

function profileForAgent(agentId: string): RoleProfile | undefined {
  return AGENT_PROFILE[agentId] ?? (GROK_ROSTER_AGENT_PROFILE[agentId] as RoleProfile | undefined)
}

function isCraftMoneyToolBlocked(agentId: string, tool: string): boolean {
  if (!agentId.startsWith('grok-craft-')) return false
  if (!tool.startsWith('ce_')) return false
  return tool !== 'ce_list_actions' && tool !== 'ce_lookup_lead'
}

/** Read-only hive tools allowed when agentId is missing or unknown. */
export const READ_ONLY_HIVE_TOOLS = new Set([
  ...BASE_TOOLS,
  ...COUNCIL_READ_TOOLS,
  'ce_list_actions',
  'ce_lookup_lead',
])

function uniq<T extends string>(items: readonly T[]): T[] {
  return [...new Set(items)]
}

function toolsForProfile(profile: RoleProfile, agentId: string): string[] {
  switch (profile) {
    case 'commander':
      return [...HIVE_TOOLS]
    case 'council_read':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS])
    case 'research':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...RESEARCH_EXTRA])
    case 'infra_ops':
    case 'comms_qa':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...RESEARCH_EXTRA, ...INFRA_OPS_EXTRA])
    case 'builder':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...RESEARCH_EXTRA, ...BUILDER_EXTRA])
    case 'finance':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...FINANCE_EXTRA])
    case 'finance_read':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...FINANCE_READ_EXTRA])
    case 'biz_crm':
      if (agentId === 'ocelot') {
        return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...BIZ_CRM_EXTRA, 'n8n_trigger_catalog_webhook'])
      }
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...BIZ_CRM_EXTRA])
    case 'lead_gen':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...LEAD_GEN_EXTRA])
    case 'content':
      return uniq([...BASE_TOOLS, ...CONTENT_EXTRA])
    case 'knowledge':
      return uniq([...BASE_TOOLS, ...KNOWLEDGE_EXTRA])
    case 'security':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...SECURITY_EXTRA])
    case 'creative':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...RESEARCH_EXTRA])
    case 'gtm':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...GTM_EXTRA])
    case 'revenue_intel':
      return uniq([...BASE_TOOLS, ...COUNCIL_READ_TOOLS, ...REVENUE_INTEL_EXTRA])
    default: {
      const _exhaustive: never = profile
      return _exhaustive
    }
  }
}

export function normalizeAgentId(agentId?: string | null): string | null {
  if (!agentId || typeof agentId !== 'string') return null
  const trimmed = agentId.trim().toLowerCase()
  if (!trimmed || trimmed === 'unknown') return null
  return trimmed
}

export function allowedHiveToolsForAgent(agentId?: string | null): string[] | null {
  const normalized = normalizeAgentId(agentId)
  if (!normalized) return null
  const profile = profileForAgent(normalized)
  if (!profile) return null
  return toolsForProfile(profile, normalized)
}

/** Agents that may call a given hive tool (for error hints). */
export function agentsAllowedForTool(tool: string): string[] {
  const allowed: string[] = []
  const allIds = new Set([...Object.keys(AGENT_PROFILE), ...Object.keys(GROK_ROSTER_AGENT_PROFILE)])
  for (const agentId of allIds) {
    const profile = profileForAgent(agentId)
    if (!profile) continue
    const tools = toolsForProfile(profile, agentId)
    if (tools.includes(tool) && !isCraftMoneyToolBlocked(agentId, tool)) allowed.push(agentId)
  }
  return allowed.sort()
}

export function roleBlockResponse(tool: string, agentId: string | null, reason: string): NextResponse {
  const normalized = normalizeAgentId(agentId)
  const roleLine = normalized ? AGENT_ROLE_LINES[normalized] : undefined
  const profile = normalized ? profileForAgent(normalized) : undefined
  const mayUse = agentsAllowedForTool(tool)

  return NextResponse.json(
    {
      ok: false,
      code: 'ROLE_BLOCKED',
      tool,
      agentId: normalized ?? agentId ?? 'unknown',
      profile: profile ?? null,
      role: roleLine ?? 'Unknown or missing agent — mutating hive tools require agentId',
      message: reason,
      agentsMayUse: mayUse,
      hint: normalized
        ? `Tool \`${tool}\` is outside your role grant. Ask Big Boss or use a permitted agent.`
        : 'Include `agentId` in POST /api/agent body for mutating hive tools.',
      docs: 'docs/hive/AGENT_TOOL_MATRIX.md',
    },
    { status: 403 },
  )
}

/**
 * Returns 403 when hive tool is outside agent profile, else null (proceed).
 */
export function enforceAgentRoleGate(tool: string, agentId?: string | null): NextResponse | null {
  if (!HIVE_TOOLS.has(tool)) {
    return null
  }

  const normalized = normalizeAgentId(agentId)
  const allowed = allowedHiveToolsForAgent(normalized)

  if (allowed) {
    if (normalized && isCraftMoneyToolBlocked(normalized, tool)) {
      return roleBlockResponse(
        tool,
        normalized,
        `Craft roster agent "${normalized}" may not use CE money tool "${tool}".`,
      )
    }
    if (allowed.includes(tool)) return null
    const roleLine = AGENT_ROLE_LINES[normalized!] ?? normalized
    return roleBlockResponse(
      tool,
      normalized,
      `Agent "${normalized}" (${roleLine}) may not use hive tool "${tool}".`,
    )
  }

  // Missing or unknown agentId — read-only hive tools only
  if (READ_ONLY_HIVE_TOOLS.has(tool)) {
    return null
  }

  return roleBlockResponse(
    tool,
    agentId ?? null,
    `Mutating hive tool "${tool}" requires a known agentId in the request body.`,
  )
}

export function listRolePolicy() {
  const byProfile: Record<RoleProfile, string[]> = {
    commander: toolsForProfile('commander', 'bigboss'),
    council_read: toolsForProfile('council_read', 'solidsnake'),
    research: toolsForProfile('research', 'liquidsnake'),
    infra_ops: toolsForProfile('infra_ops', 'naomi'),
    comms_qa: toolsForProfile('comms_qa', 'herald'),
    builder: toolsForProfile('builder', 'forge'),
    finance: toolsForProfile('finance', 'ledger'),
    biz_crm: toolsForProfile('biz_crm', 'business'),
    lead_gen: toolsForProfile('lead_gen', 'scout'),
    content: toolsForProfile('content', 'voice'),
    finance_read: toolsForProfile('finance_read', 'grok-hitl-operator'),
    knowledge: toolsForProfile('knowledge', 'grok-vault-librarian'),
    security: toolsForProfile('security', 'grok-security-reviewer'),
    creative: toolsForProfile('creative', 'grok-creative-studio'),
    gtm: toolsForProfile('gtm', 'grok-biz-seo-architect'),
    revenue_intel: toolsForProfile('revenue_intel', 'grok-biz-revenue-sensor'),
  }

  const agentsByProfile: Record<RoleProfile, string[]> = {
    commander: ['bigboss', 'grok-big-boss'],
    council_read: ['solidsnake', 'venomsnake'],
    research: ['liquidsnake', 'sigint', 'radar'],
    infra_ops: ['naomi', 'grok-watchdog-ops', 'grok-life-business-ops', 'grok-n8n-automation'],
    comms_qa: ['herald', 'grok-telegram-console'],
    builder: ['forge', 'grok-forge-builder', 'grok-engineering-lead'],
    finance: ['ledger'],
    finance_read: ['grok-hitl-operator'],
    biz_crm: ['business', 'ocelot', 'grok-ce-leads'],
    lead_gen: ['scout', 'grok-scout-lead-gen'],
    content: ['voice', 'designer', 'social', 'creator'],
    knowledge: ['grok-vault-librarian'],
    security: ['grok-security-reviewer'],
    creative: ['grok-creative-studio'],
    gtm: Object.keys(GROK_ROSTER_AGENT_PROFILE).filter((id) => GROK_ROSTER_AGENT_PROFILE[id] === 'gtm'),
    revenue_intel: Object.keys(GROK_ROSTER_AGENT_PROFILE).filter(
      (id) => GROK_ROSTER_AGENT_PROFILE[id] === 'revenue_intel',
    ),
  }

  return {
    rule: 'Hive tools are allowlisted per agentId; non-hive tools pass through',
    baseTools: [...BASE_TOOLS],
    readOnlyWithoutAgentId: [...READ_ONLY_HIVE_TOOLS],
    profiles: byProfile,
    agentsByProfile,
    agentProfiles: AGENT_PROFILE,
  }
}
