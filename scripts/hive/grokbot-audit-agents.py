#!/usr/bin/env python3
"""Generate AGENT_AUDIT.md — plain-English audit of 17 OS Grok agents."""
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = Path(__file__).resolve().parent / "agent-roster-registry.json"
OUT = ROOT / "docs/hive/outer-heaven/AGENT_AUDIT.md"

_cfg_spec = importlib.util.spec_from_file_location(
    "os_agents_config", Path(__file__).resolve().parent / "os_agents_config.py"
)
_cfg = importlib.util.module_from_spec(_cfg_spec)
assert _cfg_spec.loader is not None
_cfg_spec.loader.exec_module(_cfg)


def build_rows() -> list[dict[str, Any]]:
    rows = []
    for name in _cfg.CORE_AGENT_NAMES:
        card = _cfg.AGENT_CARDS[name]
        rows.append(
            {
                "name": name,
                "lane": card["lane"],
                "title": card["title"],
                "operatorSummary": card["job"][:160],
                "partnerOutcome": card["solves"][:160],
                "hitl": card["hitl_level"],
            }
        )
    return rows


def write_doc(rows: list[dict[str, Any]]) -> None:
    lines = [
        "# Grok agent audit — EVENS AI OS (17 agents)",
        "",
        f"**Total:** {len(rows)} core agents (roster provisioning retired)",
        "",
        "Regenerate: `python3 scripts/hive/grokbot-audit-agents.py --write`",
        "",
        "| Agent | Lane | HITL | Operator summary |",
        "|-------|------|------|------------------|",
    ]
    for r in rows:
        lines.append(
            f"| {r['name']} | {r['lane']} | {r['hitl']} | {r['operatorSummary'][:80]}… |"
        )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def validate() -> int:
    rows = build_rows()
    if len(rows) != 17:
        print(f"FAIL: expected 17 rows, got {len(rows)}")
        return 1
    missing = [r["name"] for r in rows if not r.get("operatorSummary")]
    if missing:
        print(f"FAIL: missing summary for {missing}")
        return 1
    print("grokbot-audit-agents validate: OK (17 agents)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--validate", action="store_true")
    args = ap.parse_args()
    rows = build_rows()
    if args.write:
        write_doc(rows)
        print(f"Wrote {OUT}")
    if args.validate or not args.write:
        return validate()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
