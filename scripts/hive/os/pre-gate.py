#!/usr/bin/env python3
"""PRE-GATE — wrap can-act / should-run. Exit 2 when decision != RUN.

Operator rule 2026-08-27: every workflow, tool, and skill pairs PRE with POST.
PRE can block (PreToolUse, UserPromptSubmit, Stop). Hive equivalent is
product-state.py --can-act AGENT PROJECT — not RUN = block.

No network beyond reading local product-state JSON.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

OS_DIR = Path(__file__).resolve().parent
HIVE_DIR = OS_DIR.parent
PRODUCT_STATE = HIVE_DIR / "product-state.py"
SHOULD_RUN = OS_DIR / "should-run.py"


def _load(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise FileNotFoundError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def exit_for(decision: str) -> int:
    """Exit 0 on RUN. Exit 2 on any other decision (block)."""
    return 0 if decision == "RUN" else 2


def evaluate(
    agent: str,
    project: str | None = None,
    *,
    state: dict[str, Any] | None = None,
    event: dict[str, Any] | None = None,
    audit_path: Path | None = None,
) -> dict[str, Any]:
    """Wrap can-act when a project is named; otherwise should-run on local state."""
    if state is not None:
        sr = _load("should_run", SHOULD_RUN)
        kwargs: dict[str, Any] = {}
        if audit_path is not None:
            kwargs["audit_path"] = audit_path
        decision, reason = sr.should_run(agent, event, state, **kwargs)
        return {
            "agent": agent,
            "project_id": (state or {}).get("project_id"),
            "decision": decision,
            "reason": reason,
            "gate_prefix": sr.gate_prompt_prefix(agent, decision, reason),
            "via": "should-run",
        }

    if not PRODUCT_STATE.is_file():
        return {
            "agent": agent,
            "project_id": project,
            "decision": "IGNORE",
            "reason": "product-state.py missing — PRE-GATE blocks",
            "gate_prefix": "",
            "via": "pre-gate",
        }

    try:
        ps = _load("product_state", PRODUCT_STATE)
        result = ps.can_act(agent, project)
        result = {**result, "via": "can-act"}
        return result
    except SystemExit as exc:
        return {
            "agent": agent,
            "project_id": project,
            "decision": "IGNORE",
            "reason": str(exc) or "can-act SystemExit — PRE-GATE blocks",
            "gate_prefix": "",
            "via": "can-act",
        }
    except Exception as exc:  # noqa: BLE001 — gate must never raise into a hook
        return {
            "agent": agent,
            "project_id": project,
            "decision": "IGNORE",
            "reason": f"can-act failed: {exc}",
            "gate_prefix": "",
            "via": "can-act",
        }


def self_test() -> int:
    fails = 0
    for decision, expected in (
        ("RUN", 0),
        ("IGNORE", 2),
        ("WAIT_FOR_STATE", 2),
        ("WAIT_FOR_HUMAN", 2),
        ("QUEUE", 2),
    ):
        got = exit_for(decision)
        if got != expected:
            print(f"FAIL exit {decision}: expected {expected} got {got}")
            fails += 1

    cases = (
        ("Watchdog", "hive-os", "RUN", 0),
        ("Product GTM", "hive-os", "IGNORE", 2),
    )
    for agent, project, exp_dec, exp_code in cases:
        result = evaluate(agent, project)
        code = exit_for(str(result.get("decision")))
        if result.get("decision") != exp_dec or code != exp_code:
            print(f"FAIL can-act {agent}/{project}: expected {exp_dec}/{exp_code} got {result}")
            fails += 1

    audit = Path("/tmp/os-audit-pregate-selftest.jsonl")
    sr_result = evaluate(
        "Product GTM",
        state={"lifecycle": "development"},
        audit_path=audit,
    )
    if sr_result.get("decision") != "WAIT_FOR_STATE" or exit_for(str(sr_result.get("decision"))) != 2:
        print(f"FAIL should-run GTM development: {sr_result}")
        fails += 1

    unknown = evaluate("Watchdog", "not-a-real-project")
    if exit_for(str(unknown.get("decision"))) != 2:
        print(f"FAIL unknown project must block: {unknown}")
        fails += 1

    if fails:
        return 1
    print("pre-gate self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="PRE-GATE: exit 2 when can-act / should-run is not RUN")
    ap.add_argument("--can-act", nargs=2, metavar=("AGENT", "PROJECT"), help="Wrap product-state --can-act")
    ap.add_argument("--agent", help="Agent display name")
    ap.add_argument("--project", help="Local product-state project id")
    ap.add_argument("--state", help="Project state JSON string (direct should-run, no network)")
    ap.add_argument("--event", help="Optional event JSON string for should-run")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    agent = args.agent
    project = args.project
    if args.can_act:
        agent, project = args.can_act
    if not agent:
        ap.print_help()
        return 2

    state = json.loads(args.state) if args.state else None
    event = json.loads(args.event) if args.event else None
    result = evaluate(agent, project, state=state, event=event)
    print(json.dumps(result, indent=2))
    return exit_for(str(result.get("decision")))


if __name__ == "__main__":
    raise SystemExit(main())
