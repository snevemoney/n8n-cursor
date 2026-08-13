#!/usr/bin/env python3
"""Grok Bot agent → Philanthropy hive tool allowlist (mirrors agent-roles.ts).

Usage:
  python3 scripts/hive/grokbot-agent-roles.py --list-agents
  python3 scripts/hive/grokbot-agent-roles.py --grok-agent "Watchdog Ops" --list-tools
  python3 scripts/hive/grokbot-agent-roles.py --grok-agent "Watchdog Ops" --tool scorpion_health
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Literal

RoleProfile = Literal[
    "commander",
    "council_read",
    "research",
    "infra_ops",
    "comms_qa",
    "builder",
    "finance",
    "finance_read",
    "biz_crm",
    "lead_gen",
    "content",
    "knowledge",
    "security",
    "creative",
    "gtm",
    "revenue_intel",
]

HIVE_TOOLS = frozenset(
    {
        "ce_list_actions",
        "ce_lookup_lead",
        "ce_resolve_action",
        "ce_approve_action",
        "ce_reject_action",
        "scorpion_health",
        "scorpion_list_missions",
        "scorpion_obsidian_context",  # OpenClaw/Telegram only — blocked for Grok agents
        "scorpion_register_outcome",
        "n8n_get_execution",
        "n8n_list_workflows",
        "n8n_trigger_catalog_webhook",
        "hive_send_report",
        "hitl_gate_status",
        "hitl_propose_action",
    }
)

# Grok Bot reads Outer Heaven via outer-heaven-brief.py — never Scorpion obsidian HTTP
GROK_BLOCKED_TOOLS = frozenset({"scorpion_obsidian_context"})

BASE_TOOLS = ("scorpion_health", "hitl_gate_status", "hitl_propose_action")
COUNCIL_READ_TOOLS = (
    "scorpion_list_missions",
    "n8n_list_workflows",
    "n8n_get_execution",
)
RESEARCH_EXTRA = ("scorpion_register_outcome",)
INFRA_OPS_EXTRA = ("hive_send_report", "n8n_trigger_catalog_webhook")
BUILDER_EXTRA = ("n8n_trigger_catalog_webhook",)
FINANCE_EXTRA = (
    "ce_list_actions",
    "ce_lookup_lead",
    "ce_resolve_action",
    "ce_approve_action",
    "ce_reject_action",
    "scorpion_register_outcome",
)
FINANCE_READ_EXTRA = ("ce_list_actions", "ce_lookup_lead")
BIZ_CRM_EXTRA = ("ce_list_actions", "ce_lookup_lead", "scorpion_register_outcome")
LEAD_GEN_EXTRA = ("ce_lookup_lead", "scorpion_register_outcome")
CONTENT_EXTRA = ("scorpion_register_outcome",)
KNOWLEDGE_EXTRA = (
    "scorpion_list_missions",
    "scorpion_register_outcome",
)
SECURITY_EXTRA = ("scorpion_register_outcome",)
GTM_EXTRA = (
    "ce_list_actions",
    "ce_lookup_lead",
    "scorpion_register_outcome",
    "hitl_propose_action",
)
REVENUE_INTEL_EXTRA = (
    "ce_list_actions",
    "scorpion_register_outcome",
    "scorpion_list_missions",
)

# Grok display name → (philanthropy agentId, role profile) — 17-agent OS
GROK_AGENT_MAP: dict[str, tuple[str, RoleProfile]] = {
    "Big Boss": ("grok-big-boss", "commander"),
    "Day Planner": ("grok-day-planner", "comms_qa"),
    "Watchdog": ("grok-watchdog", "infra_ops"),
    "HITL Operator": ("grok-hitl-operator", "finance_read"),
    "Money Desk": ("grok-money-desk", "biz_crm"),
    "Lead Hunter": ("grok-lead-hunter", "lead_gen"),
    "Product GTM": ("grok-product-gtm", "gtm"),
    "Researcher": ("grok-researcher", "research"),
    "Forge": ("grok-forge", "builder"),
    "Creative Studio": ("grok-creative-studio", "creative"),
    "Consultant": ("grok-consultant", "council_read"),
    "Librarian": ("grok-librarian", "knowledge"),
    "Wealth Manager": ("grok-wealth-manager", "finance_read"),
    "Personal CFO": ("grok-personal-cfo", "finance_read"),
    "Career Strategist": ("grok-career-strategist", "council_read"),
    "Communications Manager": ("grok-comms-manager", "comms_qa"),
    "Publishing Engine": ("grok-publishing-engine", "content"),
}

GROK_ROLE_LINES: dict[str, str] = {
    "grok-big-boss": "Grok Commander — full hive operator console",
    "grok-watchdog-ops": "Grok infra ops — health smokes, golden paths",
    "grok-life-business-ops": "Grok life/business lanes — smokes + approved fixes",
    "grok-hitl-operator": "Grok HITL digest — read queue, propose only",
    "grok-n8n-automation": "Grok n8n — evenslouis.ca catalog only",
    "grok-ce-leads": "Grok CE read — leads + propose",
    "grok-telegram-console": "Grok Telegram — shortcut parity verify",
    "grok-forge-builder": "Grok builder — catalog webhooks + smokes",
    "grok-scout-lead-gen": "Grok lead gen — lookup + register",
    "grok-vault-librarian": "Grok knowledge — Obsidian + chronicle",
    "grok-engineering-lead": "Grok engineering — smokes + register + Cursor handoff",
    "grok-creative-studio": "Grok creative — research register, no CE money",
    "grok-security-reviewer": "Grok security — read-only posture + propose findings",
}


def _uniq(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def _filter_grok_tools(tools: list[str]) -> list[str]:
    return [t for t in tools if t not in GROK_BLOCKED_TOOLS]


def tools_for_profile(profile: RoleProfile, agent_id: str) -> list[str]:
    if profile == "commander":
        return sorted(_filter_grok_tools(list(HIVE_TOOLS)))
    if profile == "council_read":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS]))
    if profile == "research" or profile == "creative":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *RESEARCH_EXTRA]))
    if profile in ("infra_ops", "comms_qa"):
        return _filter_grok_tools(
            _uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *RESEARCH_EXTRA, *INFRA_OPS_EXTRA])
        )
    if profile == "builder":
        return _filter_grok_tools(
            _uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *RESEARCH_EXTRA, *BUILDER_EXTRA])
        )
    if profile == "finance":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *FINANCE_EXTRA]))
    if profile == "finance_read":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *FINANCE_READ_EXTRA]))
    if profile == "biz_crm":
        tools = _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *BIZ_CRM_EXTRA]))
        if agent_id == "grok-ce-leads":
            return tools
        return tools
    if profile == "lead_gen":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *LEAD_GEN_EXTRA]))
    if profile == "content":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *CONTENT_EXTRA]))
    if profile == "knowledge":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *KNOWLEDGE_EXTRA]))
    if profile == "security":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *SECURITY_EXTRA]))
    if profile == "gtm":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *GTM_EXTRA]))
    if profile == "revenue_intel":
        return _filter_grok_tools(_uniq([*BASE_TOOLS, *COUNCIL_READ_TOOLS, *REVENUE_INTEL_EXTRA]))
    raise ValueError(f"Unknown profile: {profile}")


def _load_roster_map() -> dict[str, tuple[str, RoleProfile]]:
    """Merge core Grok agents with retired alias registry."""
    roster_path = Path(__file__).resolve().parent / "agent-roster-registry.json"
    out: dict[str, tuple[str, RoleProfile]] = dict(GROK_AGENT_MAP)
    if not roster_path.is_file():
        return out
    data = json.loads(roster_path.read_text(encoding="utf-8"))
    for old, fused in (data.get("retiredAliases") or {}).items():
        if fused in GROK_AGENT_MAP:
            out[old] = GROK_AGENT_MAP[fused]
    for row in data.get("coreAgents") or []:
        name = row["displayName"]
        if name in GROK_AGENT_MAP:
            GROK_ROLE_LINES[GROK_AGENT_MAP[name][0]] = f"Grok OS — {name} ({row.get('lane', 'ops')})"
    return out


def philanthropy_agent_id(grok_agent: str) -> str | None:
    row = _load_roster_map().get(grok_agent.strip())
    return row[0] if row else None


def allowed_tools(grok_agent: str) -> list[str] | None:
    row = _load_roster_map().get(grok_agent.strip())
    if not row:
        return None
    agent_id, profile = row
    return tools_for_profile(profile, agent_id)


def tool_allowed(grok_agent: str, tool: str) -> tuple[bool, str]:
    if tool not in HIVE_TOOLS:
        return False, f"Unknown hive tool: {tool}"
    tools = allowed_tools(grok_agent)
    if tools is None:
        return False, f"Unknown Grok agent: {grok_agent}"
    if tool in tools:
        return True, "ok"
    agent_id = philanthropy_agent_id(grok_agent) or "unknown"
    role = GROK_ROLE_LINES.get(agent_id, agent_id)
    # Craft roster agents must never use CE money mutation tools
    if agent_id.startswith("grok-craft-") and tool.startswith("ce_") and tool not in (
        "ce_list_actions",
        "ce_lookup_lead",
    ):
        return False, f'Craft agent blocked from money tool "{tool}"'
    return False, f'Tool "{tool}" blocked for {grok_agent} ({role})'


def list_policy() -> dict:
    agents = []
    for name, (agent_id, profile) in sorted(_load_roster_map().items()):
        agents.append(
            {
                "grokAgent": name,
                "philanthropyAgentId": agent_id,
                "profile": profile,
                "tools": tools_for_profile(profile, agent_id),
            }
        )
    return {"grokAgents": agents, "hiveTools": sorted(HIVE_TOOLS)}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grok-agent", help="Grok Bot agent display name")
    ap.add_argument("--tool", help="Hive tool name to check")
    ap.add_argument("--list-agents", action="store_true")
    ap.add_argument("--list-tools", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    if args.list_agents or (not args.grok_agent and not args.tool):
        payload = list_policy()
        if args.json:
            print(json.dumps(payload, indent=2))
        else:
            for row in payload["grokAgents"]:
                print(f"{row['grokAgent']} → {row['philanthropyAgentId']} ({row['profile']})")
        return 0

    if not args.grok_agent:
        print("Missing --grok-agent", file=sys.stderr)
        return 1

    if args.list_tools:
        tools = allowed_tools(args.grok_agent)
        if tools is None:
            print(f"Unknown agent: {args.grok_agent}", file=sys.stderr)
            return 1
        if args.json:
            print(json.dumps({"grokAgent": args.grok_agent, "tools": tools}, indent=2))
        else:
            for t in tools:
                print(t)
        return 0

    if args.tool:
        ok, msg = tool_allowed(args.grok_agent, args.tool)
        if args.json:
            print(json.dumps({"ok": ok, "message": msg}, indent=2))
        else:
            print(msg)
        return 0 if ok else 2

    print("Use --list-tools or --tool", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
