#!/usr/bin/env python3
"""Generate grok-roster-roles.generated.ts from agent-roster-registry.json."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "philanthropy-hive-tools" / "grok-roster-roles.generated.ts"

_spec = importlib.util.spec_from_file_location(
    "agent_roster_registry", Path(__file__).resolve().parent / "agent-roster-registry.py"
)
_mod = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_mod)


def main() -> int:
    registry = _mod.build_registry()
    profiles: dict[str, str] = {}
    lines: dict[str, str] = {}
    for a in registry["agents"]:
        aid = a["id"]
        profile = a["roleProfile"]
        profiles[aid] = profile
        cat = "biz" if a["category"] == "business" else "craft"
        lines[aid] = f"Grok roster {cat} — {a['displayName']} ({a['lane']})"

    body = f"""/**
 * AUTO-GENERATED — do not edit by hand.
 * Regenerate: python3 scripts/hive/sync-grok-roster-agent-roles.py
 */

export const GROK_ROSTER_AGENT_PROFILE: Record<string, string> = {json.dumps(profiles, indent=2)}

export const GROK_ROSTER_ROLE_LINES: Record<string, string> = {json.dumps(lines, indent=2)}
"""
    OUT.write_text(body, encoding="utf-8")
    print(f"Wrote {OUT} ({len(profiles)} roster agents)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
