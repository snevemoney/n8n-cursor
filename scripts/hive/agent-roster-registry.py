#!/usr/bin/env python3
"""OS agent alias registry — 17 core agents (grokbot-setup-agents.py) + retired fusedInto aliases.

Active roster provisioning count = 0 (all 17 are core Grok agents).
Writes: scripts/hive/agent-roster-registry.json

Usage:
  python3 scripts/hive/agent-roster-registry.py --write
  python3 scripts/hive/agent-roster-registry.py --validate
"""
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
REGISTRY_PATH = Path(__file__).resolve().parent / "agent-roster-registry.json"
SCHEMA_PATH = ROOT / "schemas" / "hive-agent-registry.schema.json"
ROSTER_DOC = ROOT / "docs/hive/outer-heaven/AGENT_ROSTER.md"

_cfg_spec = importlib.util.spec_from_file_location(
    "os_agents_config", Path(__file__).resolve().parent / "os_agents_config.py"
)
_cfg = importlib.util.module_from_spec(_cfg_spec)
assert _cfg_spec.loader is not None
_cfg_spec.loader.exec_module(_cfg)


def build_registry() -> dict[str, Any]:
    """Build alias registry — no separate roster agents to provision."""
    retired_aliases: dict[str, str] = {}
    for row in _cfg.RETIRED_AGENTS:
        retired_aliases[row["name"]] = row["fusedInto"]
    for old, new in _cfg.RENAME_MAP.items():
        retired_aliases[old] = new

    core_meta = []
    for name in _cfg.CORE_AGENT_NAMES:
        card = _cfg.AGENT_CARDS[name]
        core_meta.append(
            {
                "displayName": name,
                "id": f"grok-os-{name.lower().replace(' ', '-')}",
                "lane": card["lane"],
                "title": card["title"],
                "operatorSummary": card["job"][:120],
                "partnerOutcome": card["solves"][:120],
                "valueBucket": card["lane"],
                "status": "core",
                "core": True,
            }
        )

    return {
        "version": "3.0.0-os",
        "description": "EVENS AI OS — 17 core agents; roster provisioning retired",
        "agentCount": 0,
        "coreAgentCount": len(_cfg.CORE_AGENT_NAMES),
        "coreAgents": core_meta,
        "agents": [],
        "retiredAliases": retired_aliases,
        "renameMap": dict(_cfg.RENAME_MAP),
        "fusedIntoIndex": {
            r["name"]: r["fusedInto"] for r in _cfg.RETIRED_AGENTS
        },
    }


def load_registry() -> dict[str, Any]:
    if not REGISTRY_PATH.is_file():
        return build_registry()
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def resolve_roster_name(name: str) -> str | None:
    """Resolve legacy/roster display name → current core agent name."""
    name = name.strip()
    data = load_registry()
    if name in _cfg.CORE_AGENT_NAMES:
        return name
    aliases = data.get("retiredAliases") or {}
    if name in aliases:
        return aliases[name]
    fused = data.get("fusedIntoIndex") or {}
    if name in fused:
        return fused[name]
    return None


def validate_registry(data: dict[str, Any] | None = None) -> list[str]:
    data = data or load_registry()
    errors: list[str] = []
    if data.get("coreAgentCount") != 17:
        errors.append(f"coreAgentCount must be 17, got {data.get('coreAgentCount')}")
    if data.get("agentCount") != 0:
        errors.append(f"agentCount must be 0 (roster retired), got {data.get('agentCount')}")
    if data.get("agents"):
        errors.append("agents array must be empty — use grokbot-setup-agents.py for core 17")
    aliases = data.get("retiredAliases") or {}
    if len(aliases) < 30:
        errors.append(f"retiredAliases too small: {len(aliases)}")
    for old, fused in aliases.items():
        if fused not in _cfg.CORE_AGENT_NAMES:
            errors.append(f"alias {old} → {fused} not in CORE_AGENT_NAMES")
    return errors


def write_doc(data: dict[str, Any]) -> None:
    lines = [
        "# Agent roster — EVENS AI OS (17 core)",
        "",
        f"**Core agents:** {data['coreAgentCount']} (provision via `grokbot-setup-agents.py`)",
        f"**Roster agents:** {data['agentCount']} (retired — fused into core)",
        "",
        "Regenerate: `python3 scripts/hive/agent-roster-registry.py --write --write-doc`",
        "",
        "## Core 17",
        "",
        "| Agent | Lane | Title |",
        "|-------|------|-------|",
    ]
    for row in data.get("coreAgents", []):
        lines.append(f"| {row['displayName']} | {row['lane']} | {row['title']} |")
    lines.extend(
        [
            "",
            "## Retired aliases (fusedInto)",
            "",
            "Old names resolve to core agents for orchestrator + hive tools.",
            "",
        ]
    )
    for old, fused in sorted((data.get("retiredAliases") or {}).items()):
        lines.append(f"- `{old}` → **{fused}**")
    text = "\n".join(lines) + "\n"
    ROSTER_DOC.parent.mkdir(parents=True, exist_ok=True)
    ROSTER_DOC.write_text(text, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--write-doc", action="store_true")
    ap.add_argument("--validate", action="store_true")
    args = ap.parse_args()

    data = build_registry()
    if args.write:
        REGISTRY_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {REGISTRY_PATH} (core={data['coreAgentCount']}, roster={data['agentCount']})")

    if args.write_doc or args.write:
        write_doc(data)
        print(f"Wrote {ROSTER_DOC}")

    errs = validate_registry(data if args.write else None)
    if args.validate or not args.write:
        if errs:
            for e in errs:
                print(f"FAIL: {e}")
            return 1
        print(f"agent-roster-registry valid (core=17, roster=0, aliases={len(data['retiredAliases'])})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
