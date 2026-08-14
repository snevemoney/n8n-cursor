#!/usr/bin/env python3
"""SSOT generator/check/matrix for per-agent tool assignment.

Usage:
  python3 scripts/hive/agent-tool-inventory.py --write
  python3 scripts/hive/agent-tool-inventory.py --check
  python3 scripts/hive/agent-tool-inventory.py --matrix
  python3 scripts/hive/agent-tool-inventory.py --sync-job-cards
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/hive/outer-heaven/CONTENT/AGENT_TOOL_INVENTORY.json"
MATRIX = ROOT / "docs/hive/outer-heaven/CONTENT/job-cards/TOOL_MATRIX.md"
JOB_CARDS = ROOT / "docs/hive/outer-heaven/CONTENT/job-cards"
N8N_CATALOG = ROOT / "scripts/hive/n8n-catalog.json"
SKILLS_DIR = ROOT / "scripts/hive/grok-skills"

_roles_spec = importlib.util.spec_from_file_location(
    "grokbot_agent_roles", Path(__file__).resolve().parent / "grokbot-agent-roles.py"
)
_roles = importlib.util.module_from_spec(_roles_spec)
assert _roles_spec.loader is not None
_roles_spec.loader.exec_module(_roles)

_cfg_spec = importlib.util.spec_from_file_location(
    "os_agents_config", Path(__file__).resolve().parent / "os_agents_config.py"
)
_cfg = importlib.util.module_from_spec(_cfg_spec)
assert _cfg_spec.loader is not None
_cfg_spec.loader.exec_module(_cfg)

CORE = list(_cfg.CORE_AGENT_NAMES)

# Short codes for matrix: R read · D draft · 3 HITL propose · - never · U use
HITL_CODE = {"read": "R", "draft": "D", "tier3": "3", "never": "-"}

SEED_TOOLS: dict[str, dict] = {
    "gmail": {
        "layer": "grok_plugin",
        "status": "connected",
        "hitl": "draft",
        "owners": ["Communications Manager", "Day Planner", "Big Boss", "Career Strategist"],
        "never": ["Wealth Manager"],
        "note": "Send is Tier 3. Career = read employer threads only.",
    },
    "calendar": {
        "layer": "grok_plugin",
        "status": "connected",
        "hitl": "read",
        "owners": ["Day Planner", "Big Boss"],
        "never": [],
        "note": "Never accept/invite without HITL.",
    },
    "github": {
        "layer": "grok_plugin",
        "status": "connected",
        "hitl": "draft",
        "owners": ["Forge", "Watchdog", "Big Boss"],
        "never": ["Creative Studio", "Publishing Engine"],
        "note": "PR/CI. Prod merge = HITL.",
    },
    "higgsfield": {
        "layer": "grok_plugin",
        "status": "connected",
        "hitl": "draft",
        "owners": ["Creative Studio", "Publishing Engine"],
        "never": ["Lead Hunter"],
        "note": "Check authorized on this bot. Ad spend = HITL.",
    },
    "brief": {
        "layer": "grok_native",
        "status": "connected",
        "hitl": "read",
        "owners": list(CORE),
        "never": [],
        "note": "outer-heaven-brief.py — all 17",
    },
    "browser": {
        "layer": "grok_native",
        "status": "connected",
        "hitl": "read",
        "owners": list(CORE),
        "never": [],
        "note": "Read-only research/demos. No localhost in client drafts.",
    },
    "shell": {
        "layer": "grok_native",
        "status": "connected",
        "hitl": "read",
        "owners": list(CORE),
        "never": [],
        "note": "Cookbook scripts only. No secrets in chat.",
    },
    "delegate": {
        "layer": "grok_native",
        "status": "connected",
        "hitl": "read",
        "owners": list(CORE),
        "never": [],
        "note": "In-chat @Agent with a concrete task.",
    },
    "twilio_number": {
        "layer": "n8n_webhook",
        "status": "connected_n8n",
        "hitl": "tier3",
        "owners": ["HITL Operator", "Communications Manager"],
        "never": ["Lead Hunter", "Product GTM"],
        "secret": "operator",
        "note": "Number already on Twilio/n8n. Do not store digits or keys in git.",
    },
    "n8n.elevenlabs-post-call": {
        "layer": "n8n_webhook",
        "status": "legacy",
        "hitl": "tier3",
        "owners": ["Creative Studio", "HITL Operator"],
        "never": [],
        "n8n_id": "7GkfpweJWvHmzSQ0",
        "catalog": "evens-elevenlabs-post-call",
        "note": "Client audio = operatorConfirm. No vendor keys in Cursor/Grok.",
    },
    "n8n.on-demand-calling": {
        "layer": "n8n_webhook",
        "status": "legacy",
        "hitl": "tier3",
        "owners": ["HITL Operator", "Communications Manager"],
        "never": ["Lead Hunter", "Product GTM"],
        "n8n_id": "yYhgcj1b6XgPObIZ",
        "catalog": "evens-on-demand-calling",
        "note": "Hive number path. Propose only — Forge/Watchdog trigger after HITL.",
    },
    "n8n.voice-assistant-telegram": {
        "layer": "n8n_webhook",
        "status": "legacy",
        "hitl": "read",
        "owners": ["Day Planner", "Communications Manager"],
        "never": [],
        "n8n_id": "EsQaobwWMvt3mPK0",
        "note": "Telegram + Gcal — not PSTN. No client book.",
    },
    "n8n.outbound-calls": {
        "layer": "n8n_webhook",
        "status": "kill",
        "hitl": "never",
        "owners": [],
        "never": list(CORE),
        "n8n_id": "xbMNXMcrgfYFDrCK",
        "note": "Inactive autodial. Do not activate.",
    },
    "n8n.dentist-voice-agent": {
        "layer": "n8n_webhook",
        "status": "kill",
        "hitl": "never",
        "owners": [],
        "never": list(CORE),
        "n8n_id": "i2CN5woqG017s6X8",
        "note": "Auto-book voice adjacent. Do not revive.",
    },
    "n8n.voice-assistant-2": {
        "layer": "n8n_webhook",
        "status": "legacy",
        "hitl": "never",
        "owners": [],
        "never": list(CORE),
        "n8n_id": "ikfzzGIQb6L7qRtr",
        "note": "Inactive parked copy.",
    },
    "vapi": {
        "layer": "grok_plugin",
        "status": "kill",
        "hitl": "never",
        "owners": [],
        "never": list(CORE),
        "note": "Second voice vendor — stack lock.",
    },
    "auto-dial": {
        "layer": "skill",
        "status": "kill",
        "hitl": "never",
        "owners": [],
        "never": list(CORE),
        "note": "Kill ICP / machine.",
    },
}

SHARED_USE = ["brief", "browser", "shell", "delegate"]
SHARED_NEVER = ["vapi", "n8n.outbound-calls", "n8n.dentist-voice-agent", "n8n.voice-assistant-2", "auto-dial"]

# Extra use beyond shared (never always includes SHARED_NEVER)
SEED_USE: dict[str, list[str]] = {
    "Big Boss": ["gmail", "calendar", "github"],
    "Day Planner": ["gmail", "calendar", "n8n.voice-assistant-telegram"],
    "Watchdog": ["github", "n8n_trigger_catalog_webhook"],
    "HITL Operator": ["twilio_number", "n8n.on-demand-calling", "n8n.elevenlabs-post-call", "hitl_propose_action"],
    "Money Desk": ["ce_list_actions", "ce_lookup_lead"],
    "Lead Hunter": ["ce_lookup_lead"],
    "Product GTM": ["ce_list_actions", "ce_lookup_lead"],
    "Researcher": ["scorpion_register_outcome"],
    "Forge": ["github", "n8n_trigger_catalog_webhook"],
    "Creative Studio": ["higgsfield", "n8n.elevenlabs-post-call"],
    "Consultant": [],
    "Librarian": [],
    "Wealth Manager": [],
    "Personal CFO": [],
    "Career Strategist": ["gmail"],
    "Communications Manager": ["gmail", "twilio_number", "n8n.on-demand-calling", "n8n.voice-assistant-telegram"],
    "Publishing Engine": ["higgsfield"],
}

SEED_NEVER_EXTRA: dict[str, list[str]] = {
    "Lead Hunter": ["twilio_number", "n8n.on-demand-calling", "gmail"],
    "Product GTM": ["twilio_number", "n8n.on-demand-calling"],
    "Creative Studio": ["github", "ce_list_actions", "ce_lookup_lead"],
    "Librarian": ["ce_list_actions", "ce_lookup_lead"],
    "Wealth Manager": ["gmail"],
    "Publishing Engine": ["github"],
}

JOB_SLUG = {
    "Big Boss": "big-boss",
    "Day Planner": "day-planner",
    "Watchdog": "watchdog",
    "HITL Operator": "hitl-operator",
    "Money Desk": "money-desk",
    "Lead Hunter": "lead-hunter",
    "Product GTM": "product-gtm",
    "Researcher": "researcher",
    "Forge": "forge",
    "Creative Studio": "creative-studio",
    "Consultant": "consultant",
    "Librarian": "librarian",
    "Wealth Manager": "wealth-manager",
    "Personal CFO": "personal-cfo",
    "Career Strategist": "career-strategist",
    "Communications Manager": "communications-manager",
    "Publishing Engine": "publishing-engine",
}


def _uniq(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for i in items:
        if i not in seen:
            seen.add(i)
            out.append(i)
    return out


def _hive_tool_meta(tool_id: str) -> dict:
    return {
        "layer": "hive_tool",
        "status": "legacy",
        "hitl": "tier3" if tool_id in ("n8n_trigger_catalog_webhook", "ce_approve_action", "ce_reject_action") else "read",
        "owners": [],
        "never": [],
        "note": "Fallback via grok-hive-tool.py — tokens stay on VPS.",
    }


def discover_tools(existing: dict[str, dict]) -> dict[str, dict]:
    tools = dict(existing)
    for tid, meta in SEED_TOOLS.items():
        tools[tid] = {**meta, **tools.get(tid, {})} if tid in tools else dict(meta)
        # seed wins for phone/kill status
        if tid in SEED_TOOLS:
            for k in ("status", "hitl", "n8n_id", "catalog", "secret", "note", "layer"):
                if k in SEED_TOOLS[tid]:
                    tools[tid][k] = SEED_TOOLS[tid][k]
            tools[tid]["owners"] = list(SEED_TOOLS[tid].get("owners") or [])
            tools[tid]["never"] = list(SEED_TOOLS[tid].get("never") or [])

    for ht in sorted(_roles.HIVE_TOOLS):
        if ht in _roles.GROK_BLOCKED_TOOLS:
            continue
        if ht not in tools:
            tools[ht] = _hive_tool_meta(ht)

    if N8N_CATALOG.is_file():
        catalog = json.loads(N8N_CATALOG.read_text(encoding="utf-8"))
        for entry in catalog.get("entries") or []:
            name = entry.get("name") or ""
            tid = f"n8n.{name}"
            if tid in tools or name in ("evens-elevenlabs-post-call", "evens-on-demand-calling"):
                continue
            tools[tid] = {
                "layer": "n8n_webhook",
                "status": "legacy",
                "hitl": "tier3" if entry.get("hitl") else "read",
                "owners": ["Forge", "Watchdog"] if not entry.get("hitl") else ["HITL Operator"],
                "never": [],
                "catalog": name,
                "note": (entry.get("note") or "n8n catalog webhook")[:160],
            }

    if SKILLS_DIR.is_dir():
        for p in sorted(SKILLS_DIR.glob("*.md")):
            tid = f"skill.{p.stem}"
            if tid not in tools:
                tools[tid] = {
                    "layer": "skill",
                    "status": "connected",
                    "hitl": "read",
                    "owners": [],
                    "never": [],
                    "note": f"scripts/hive/grok-skills/{p.name}",
                }
    return tools


def build_agents() -> dict[str, dict]:
    agents: dict[str, dict] = {}
    for name in CORE:
        use = _uniq([*SHARED_USE, *SEED_USE.get(name, [])])
        never = _uniq([*SHARED_NEVER, *SEED_NEVER_EXTRA.get(name, [])])
        never = [t for t in never if t not in use]
        agents[name] = {"use": use, "never": never}
    return agents


def build_inventory() -> dict:
    tools = discover_tools(dict(SEED_TOOLS))
    agents = build_agents()
    return {
        "version": "1.0.0",
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "rules": [
            "Grok plugins are workspace-shared — assignment is policy, not OAuth isolation",
            "PSTN stays on n8n + HITL — no Twilio/ElevenLabs keys in Cursor or Grok plugins",
            "Kill tools must never appear in agents.use",
            "Hive tools in use must be in grokbot-agent-roles allowlist",
        ],
        "layers": ["grok_plugin", "grok_native", "mac_script", "hive_tool", "n8n_webhook", "skill"],
        "tools": tools,
        "agents": agents,
    }


def load_inventory() -> dict:
    if OUT.is_file():
        return json.loads(OUT.read_text(encoding="utf-8"))
    return build_inventory()


def write_inventory() -> dict:
    data = build_inventory()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    return data


def check(data: dict | None = None) -> list[str]:
    data = data or load_inventory()
    errors: list[str] = []
    tools = data.get("tools") or {}
    agents = data.get("agents") or {}

    for name in CORE:
        if name not in agents:
            errors.append(f"missing agent assignment: {name}")
            continue
        use = agents[name].get("use") or []
        never = set(agents[name].get("never") or [])
        for tid in use:
            if tid not in tools:
                errors.append(f"{name} uses unknown tool {tid}")
                continue
            if tools[tid].get("status") == "kill":
                errors.append(f"{name} uses kill tool {tid}")
            if tid in never:
                errors.append(f"{name} both use and never {tid}")
            if tools[tid].get("layer") == "hive_tool":
                allowed = _roles.allowed_tools(name)
                if allowed is None:
                    errors.append(f"{name} has no hive allowlist")
                elif tid not in allowed:
                    errors.append(f"{name} uses hive tool {tid} not in GROK_AGENT_MAP allowlist")
        for tid in SHARED_NEVER:
            if tid in use:
                errors.append(f"{name} uses shared-never {tid}")
    return errors


def matrix_markdown(data: dict) -> str:
    tools = data.get("tools") or {}
    agents = data.get("agents") or {}
    # Focus rows: plugins, native, phone, hive ACL — skip skill.* flood
    rows = [
        tid
        for tid, meta in tools.items()
        if meta.get("layer") in ("grok_plugin", "grok_native", "n8n_webhook", "hive_tool")
        or tid.startswith("n8n.")
        or tid in SEED_TOOLS
    ]
    rows = _uniq(rows)
    # Keep matrix readable
    priority = [
        "gmail",
        "calendar",
        "github",
        "higgsfield",
        "brief",
        "browser",
        "shell",
        "delegate",
        "twilio_number",
        "n8n.on-demand-calling",
        "n8n.elevenlabs-post-call",
        "n8n.voice-assistant-telegram",
        "n8n.outbound-calls",
        "n8n.dentist-voice-agent",
        "vapi",
        "auto-dial",
        "n8n_trigger_catalog_webhook",
        "ce_lookup_lead",
        "ce_list_actions",
        "hitl_propose_action",
    ]
    ordered = [t for t in priority if t in tools]
    for t in rows:
        if t not in ordered and not t.startswith("skill.") and not (
            t.startswith("n8n.") and t not in SEED_TOOLS and t not in priority
        ):
            if tools[t].get("layer") == "hive_tool":
                ordered.append(t)

    shorts = [n.replace(" Manager", "").replace(" Operator", "")[:4] for n in CORE]
    header = "| tool | " + " | ".join(shorts) + " | hitl |"
    sep = "|------|" + "|".join(["-----"] * len(CORE)) + "|------|"
    lines = [
        "# Agent tool matrix",
        "",
        "Generated by `python3 scripts/hive/agent-tool-inventory.py --matrix`.",
        "Codes: **U** use · **-** never · empty = not assigned (shared native still applies if listed).",
        "Do not put Twilio/ElevenLabs API keys in Cursor or Grok plugins.",
        "",
        header,
        sep,
    ]
    for tid in ordered:
        meta = tools[tid]
        cells = []
        for name in CORE:
            use = set((agents.get(name) or {}).get("use") or [])
            never = set((agents.get(name) or {}).get("never") or [])
            if tid in never or meta.get("status") == "kill":
                cells.append("-")
            elif tid in use:
                cells.append("U")
            else:
                cells.append("")
        lines.append(f"| `{tid}` | " + " | ".join(cells) + f" | {meta.get('hitl', '')} |")
    lines.append("")
    lines.append("Full SSOT: [AGENT_TOOL_INVENTORY.json](../AGENT_TOOL_INVENTORY.json)")
    lines.append("")
    return "\n".join(lines)


def sync_job_cards(data: dict) -> int:
    agents = data.get("agents") or {}
    n = 0
    for name, slug in JOB_SLUG.items():
        path = JOB_CARDS / f"{slug}.md"
        if not path.is_file():
            continue
        use = ", ".join(f"`{t}`" for t in (agents.get(name) or {}).get("use") or [])
        never = ", ".join(f"`{t}`" for t in (agents.get(name) or {}).get("never") or [])
        block = f"## Tools\n- **Use:** {use or '—'}\n- **Never:** {never or '—'}\n"
        text = path.read_text(encoding="utf-8")
        if re.search(r"^## Tools\s*$", text, re.MULTILINE):
            text = re.sub(
                r"^## Tools\s*\n(?:.*\n)*?(?=^## |\Z)",
                block + "\n",
                text,
                count=1,
                flags=re.MULTILINE,
            )
        else:
            # insert after You never / before Hard step
            if "## Hard step" in text:
                text = text.replace("## Hard step", block + "\n## Hard step", 1)
            else:
                text = text.rstrip() + "\n\n" + block
        path.write_text(text, encoding="utf-8")
        n += 1
    return n


def assignment_line(agent: str, data: dict | None = None) -> str:
    data = data or load_inventory()
    row = (data.get("agents") or {}).get(agent) or {}
    use = ", ".join((row.get("use") or [])[:8])
    never = ", ".join((row.get("never") or [])[:6])
    return f"Tools you use: {use}. Tools you never: {never}."


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--matrix", action="store_true")
    ap.add_argument("--sync-job-cards", action="store_true")
    ap.add_argument("--agent", help="Print assignment line for one agent")
    args = ap.parse_args()

    if args.write:
        data = write_inventory()
        print(f"Wrote {OUT} tools={len(data['tools'])} agents={len(data['agents'])}")
    else:
        data = load_inventory()

    if args.matrix:
        MATRIX.parent.mkdir(parents=True, exist_ok=True)
        MATRIX.write_text(matrix_markdown(data), encoding="utf-8")
        print(f"Wrote {MATRIX}")

    if args.sync_job_cards:
        n = sync_job_cards(data)
        print(f"Synced Tools section on {n} job cards")

    if args.agent:
        print(assignment_line(args.agent, data))

    if args.check or not any([args.write, args.matrix, args.sync_job_cards, args.agent]):
        errs = check(data)
        if errs:
            print("FAIL: agent-tool-inventory", file=sys.stderr)
            for e in errs:
                print(f"  - {e}", file=sys.stderr)
            return 1
        print("OK: agent-tool-inventory")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
