#!/usr/bin/env python3
"""Provision fused roster agents to Grok Bot from agent-roster-registry.json.

Usage:
  python3 scripts/hive/grokbot-setup-roster.py --dry-run --wave 1
  python3 scripts/hive/grokbot-setup-roster.py --category business --squad growth-distribution
  python3 scripts/hive/grokbot-setup-roster.py --agent "SEO Architect"
  python3 scripts/hive/grokbot-setup-roster.py --all
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

_conn_dir = Path(__file__).resolve().parent
_setup_spec = importlib.util.spec_from_file_location(
    "grokbot_setup_agents", _conn_dir / "grokbot-setup-agents.py"
)
_setup_mod = importlib.util.module_from_spec(_setup_spec)
assert _setup_spec.loader is not None
_setup_spec.loader.exec_module(_setup_mod)

SHARED_RULES = _setup_mod.SHARED_RULES
load_gateway = _setup_mod.load_gateway
call = _setup_mod.call
load_automation_registry = _setup_mod.load_automation_registry
save_automation_registry = _setup_mod.save_automation_registry
automation_key = _setup_mod.automation_key
list_agent_automation_names = _setup_mod.list_agent_automation_names
AUTOMATION_REGISTRY = _setup_mod.AUTOMATION_REGISTRY

REGISTRY_PATH = _conn_dir / "agent-roster-registry.json"
GROK_AGENT_CAP = 50

CORE_AGENT_NAMES = frozenset(
    {
        "Big Boss",
        "Watchdog Ops",
        "Life & Business Ops",
        "HITL Operator",
        "n8n Automation",
        "CE & Leads",
        "Telegram Console",
        "Forge Builder",
        "Scout Lead Gen",
        "Vault Librarian",
        "Engineering Lead",
        "Creative Studio",
        "Security Reviewer",
    }
)

WAVE_RANK = {"wave1": 0, "wave2": 1, "wave3": 2, "research": 3}


def roster_priority(row: dict) -> tuple[int, str]:
    """Lower sort key = higher priority for Grok cap."""
    status = row.get("status", "wave3")
    wave_rank = WAVE_RANK.get(status, 9)
    craft_last = 1 if row.get("category") == "craft" and wave_rank > 0 else 0
    return (wave_rank, craft_last, row.get("displayName", ""))


def prioritized_roster(registry: dict, slots: int) -> list[dict]:
    roster = sorted(registry["agents"], key=roster_priority)
    return roster[: max(0, slots)]


def delete_agent(base: str, headers: dict, agent_id: str) -> bool:
    try:
        call(base, headers, "POST", "/api/deleteAgent", {"id": agent_id})
        return True
    except SystemExit:
        return False


def sync_to_cap(base: str, headers: dict, registry: dict, dry_run: bool) -> None:
    _, existing = call(base, headers, "POST", "/api/listAgents", {})
    by_name = {a["name"]: a for a in existing}
    core_present = [n for n in CORE_AGENT_NAMES if n in by_name]
    slots = GROK_AGENT_CAP - len(core_present)
    target = prioritized_roster(registry, slots)
    target_names = {r["displayName"] for r in target}
    roster_in_grok = {n: a for n, a in by_name.items() if n not in CORE_AGENT_NAMES}

    to_remove = [n for n in roster_in_grok if n not in target_names]
    to_add = [r for r in target if r["displayName"] not in by_name]

    print(f"Grok cap={GROK_AGENT_CAP} core={len(core_present)} roster_slots={slots}")
    print(f"  target roster={len(target_names)} remove={len(to_remove)} add={len(to_add)}")

    if dry_run:
        for n in to_remove:
            print(f"  [remove] {n}")
        for r in to_add:
            print(f"  [add] [{r['status']}] {r['displayName']}")
        return

    for n in to_remove:
        aid = roster_in_grok[n]["id"]
        if delete_agent(base, headers, aid):
            print(f"  removed {n} ({aid[:8]}…)")

    _, existing = call(base, headers, "POST", "/api/listAgents", {})
    by_name = {a["name"]: a for a in existing}

    for row in to_add:
        name = row["displayName"]
        if len(by_name) >= GROK_AGENT_CAP:
            print(f"  cap reached — skip {name}")
            break
        profile = {
            "name": name,
            "title": row["title"],
            "description": profile_description(row),
        }
        try:
            _, result = call(
                base,
                headers,
                "POST",
                "/api/createAgent",
                {
                    **profile,
                    "origin": "user",
                    "isKickstartRequested": False,
                    "isIntroductionSuppressed": True,
                },
            )
            agent = result.get("agent") if isinstance(result, dict) else result
            agent_id = agent["id"] if isinstance(agent, dict) else result["id"]
            by_name[name] = {"id": agent_id}
            print(f"  created {name} ({agent_id[:8]}…)")
        except SystemExit as exc:
            print(f"  failed {name}: {exc}")


SQUAD_LEAD_NAMES = {
    "growth-distribution": "Growth & SEO Lead",
    "product-gtm-proofcheck": "ProofCheck GTM",
    "product-gtm-sentinel": "SENTINEL GTM",
    "product-gtm-clipengine": "ClipEngine GTM",
    "product-gtm-trendspotter": "TrendSpotter GTM",
}


def load_registry() -> dict:
    if not REGISTRY_PATH.is_file():
        raise SystemExit(f"Missing {REGISTRY_PATH} — run agent-roster-registry.py --write")
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def web_instructions(row: dict) -> str:
    access = row.get("webAccess", "none")
    if access == "none":
        return "\nWEB: Do not browse unless operator asks — stay on repo + hive tools."
    surfaces = row.get("webSurfaces") or []
    surf = ", ".join(surfaces) if surfaces else "https://evenslouis.ca/"
    if access == "required":
        return (
            f"\nWEB (required): Use your Grok computer browser for research. "
            f"Priority URLs: {surf}. Read-only — no OAuth or money pages (Tier 3)."
        )
    return f"\nWEB (optional): Browser OK for verification on: {surf}"


def profile_description(row: dict) -> str:
    cat = row["category"]
    lane_rules = (
        "BUSINESS LANE: Propose-only — hitl_propose_action for send/deals. Never cold outreach."
        if cat == "business"
        else "CRAFT LANE: Register to Scorpion + Obsidian THEMES. Never CE money tools."
    )
    cookbook = "\n".join(f"- {c}" for c in row.get("cookbook", [])[:5])
    phases = row.get("phases") or []
    phase_block = ""
    if phases:
        rotation = " → ".join(p["name"] for p in phases)
        phase_block = (
            f"\nFUSED PHASES (rotate one per routine): {rotation}\n"
            + "\n".join(f"  - {p['name']}: {p['focus']}" for p in phases)
        )
    fused_note = ""
    if row.get("fusedFrom"):
        fused_note = f"\nCovers former agents: {', '.join(row['fusedFrom'][:6])}"
        if len(row["fusedFrom"]) > 6:
            fused_note += f" (+{len(row['fusedFrom']) - 6} more)"
    return f"""You are {row['displayName']} — {row['title']}.

FOR OPERATOR: {row.get('operatorSummary', '')}
VALUE BUCKET: {row.get('valueBucket', 'ops').upper()} | SERVICE RUNG: {row.get('serviceRung') if row.get('serviceRung') is not None else '—'}
PARTNER OUTCOME: {row.get('partnerOutcome', '')}

{row.get('mission', row.get('focus', ''))}
{phase_block}{fused_note}

{web_instructions(row)}

{lane_rules}

Tool cookbook:
{cookbook}

{SHARED_RULES}
""".strip()


def filter_agents(
    registry: dict,
    *,
    category: str | None,
    squad: str | None,
    wave: int | None,
    agent_name: str | None,
    all_waves: bool,
) -> list[dict]:
    agents = registry["agents"]
    if agent_name:
        return [a for a in agents if a["displayName"] == agent_name or a["id"] == agent_name]
    out = agents
    if category:
        out = [a for a in out if a["category"] == category]
    if squad:
        out = [a for a in out if a["squad"] == squad]
    if not all_waves and wave is not None:
        status = f"wave{wave}"
        out = [a for a in out if a["status"] == status]
    elif not all_waves and wave is None and not category and not squad:
        out = [a for a in out if a["status"] == "wave1"]
    return out


def squad_lead_automations(agents: list[dict]) -> list[dict]:
    auto: list[dict] = []
    seen: set[str] = set()
    for row in agents:
        squad = row["squad"]
        if squad in seen:
            continue
        lead_name = SQUAD_LEAD_NAMES.get(squad)
        if not lead_name or row["displayName"] != lead_name:
            automation = row.get("automation")
            if automation and row["displayName"].endswith("GTM Lead"):
                lead_name = row["displayName"]
            else:
                continue
        seen.add(squad)
        cron = row.get("automation", {}).get("cron", "0 9 * * 1")
        prompt = row.get("automation", {}).get(
            "prompt",
            f"Weekly {row['displayName']} squad check — register outcome + one operator next step.",
        )
        auto.append(
            {
                "agent_name": lead_name,
                "spec": {
                    "name": f"{row['squad']} weekly",
                    "prompt": prompt
                    + "\n\nUse grok-hive-tool.py with your agent name. Propose only — no Tier 3 auto.",
                    "enabled": True,
                    "trigger": {"type": "cron", "schedule": cron},
                },
            }
        )
    return auto


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--category", choices=["business", "craft"])
    parser.add_argument("--squad", help="Squad id from registry (e.g. growth-distribution)")
    parser.add_argument("--wave", type=int, choices=[1, 2, 3])
    parser.add_argument("--all", action="store_true", dest="all_waves")
    parser.add_argument("--sync-cap", action="store_true", help="Fit highest-priority roster into Grok 50-agent cap (keeps core 13)")
    parser.add_argument("--agent", help="Single agent displayName or grok-biz-* id")
    args = parser.parse_args()

    registry = load_registry()

    if args.sync_cap:
        base, headers = load_gateway()
        if args.dry_run:
            print("sync-cap (dry-run)")
        else:
            _, health = call(base, headers, "GET", "/health")
            print(f"Gateway OK pid={health.get('pid')}")
        sync_to_cap(base, headers, registry, dry_run=args.dry_run)
        return 0

    selected = filter_agents(
        registry,
        category=args.category,
        squad=args.squad,
        wave=args.wave,
        agent_name=args.agent,
        all_waves=args.all_waves,
    )
    if not selected:
        raise SystemExit("No agents matched filters")

    print(f"Roster provision: {len(selected)} agent(s)")

    if args.dry_run:
        for row in selected:
            print(f"  [{row['status']}] {row['displayName']} ({row['id']})")
        return 0

    base, headers = load_gateway()
    _, health = call(base, headers, "GET", "/health")
    print(f"Gateway OK pid={health.get('pid')}")

    _, existing = call(base, headers, "POST", "/api/listAgents", {})
    by_name = {a["name"]: a for a in existing}

    created: list[str] = []
    updated: list[str] = []

    for row in selected:
        name = row["displayName"]
        profile = {
            "name": name,
            "title": row["title"],
            "description": profile_description(row),
        }
        if name in by_name:
            call(
                base,
                headers,
                "POST",
                "/api/updateAgent",
                {"id": by_name[name]["id"], "profile": profile},
            )
            updated.append(name)
        else:
            _, result = call(
                base,
                headers,
                "POST",
                "/api/createAgent",
                {
                    **profile,
                    "origin": "user",
                    "isKickstartRequested": False,
                    "isIntroductionSuppressed": True,
                },
            )
            agent = result.get("agent") if isinstance(result, dict) else result
            agent_id = agent["id"] if isinstance(agent, dict) else result["id"]
            by_name[name] = {"id": agent_id}
            created.append(name)
            print(f"  created {name} ({agent_id[:8]}…)")

    registry_keys = load_automation_registry()
    for auto in squad_lead_automations(selected):
        agent = by_name.get(auto["agent_name"])
        if not agent:
            continue
        agent_id = agent["id"]
        auto_name = auto["spec"]["name"]
        key = automation_key(agent_id, auto_name)
        existing_names = list_agent_automation_names(base, headers, agent_id)
        if auto_name in existing_names or key in registry_keys:
            registry_keys.add(key)
            continue
        try:
            call(
                base,
                headers,
                "POST",
                "/api/createAgentAutomation",
                {"id": agent_id, "spec": auto["spec"]},
            )
            registry_keys.add(key)
            print(f"  automation: {auto_name} → {auto['agent_name']}")
        except SystemExit as e:
            print(f"  automation skipped ({auto['agent_name']}): {e}")

    save_automation_registry(registry_keys)
    print(f"\nDone. created={len(created)} updated={len(updated)} total_selected={len(selected)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
