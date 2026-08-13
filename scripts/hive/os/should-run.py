#!/usr/bin/env python3
"""Suppression engine — should_run(agent, event, state) → RUN|QUEUE|IGNORE|WAIT_FOR_STATE|WAIT_FOR_HUMAN.

Used by product-state.py --can-act and routine prompts.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

Decision = Literal["RUN", "QUEUE", "IGNORE", "WAIT_FOR_STATE", "WAIT_FOR_HUMAN"]

GTM_SUPPRESSED_STATES = frozenset({"idea", "planning", "specification", "development"})
PUBLISH_SUPPRESSED_STATES = GTM_SUPPRESSED_STATES | frozenset({"testing"})
LEAD_HUNTER_WAIT_STATES = frozenset({"idea", "planning", "specification", "development"})

AGENT_GTM = frozenset({"Product GTM", "Publishing Engine"})
AGENT_LEAD = frozenset({"Lead Hunter"})


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _audit_log(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps({**row, "timestamp": _now_iso()}, ensure_ascii=False) + "\n")


def kill_switch_active(kill_path: Path | None = None) -> bool:
    p = kill_path or Path.home() / ".grokbot/os-kill-switch.json"
    if not p.is_file():
        return False
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        return bool(data.get("active"))
    except json.JSONDecodeError:
        return False


def should_run(
    agent: str,
    event: dict[str, Any] | None,
    state: dict[str, Any] | None,
    *,
    kill_path: Path | None = None,
    audit_path: Path | None = None,
) -> tuple[Decision, str]:
    """Evaluate spec §9 checklist. Returns (decision, reason)."""
    audit = audit_path or Path.home() / ".grokbot/os-audit.jsonl"
    if kill_switch_active(kill_path):
        reason = "kill switch active — all agents NO_ACTION"
        _audit_log(audit, {"agent": agent, "decision": "IGNORE", "reason": reason, "trigger": "kill_switch"})
        return "IGNORE", reason

    st = state or {}
    lifecycle = str(st.get("lifecycle", "idea")).lower()
    agent_state = str(st.get("agent_state", "IDLE")).upper()
    suppressed = set(st.get("suppressed_agents") or [])
    allowed = set(st.get("allowed_agents") or [])
    owner = st.get("owner_agent")
    blocked = bool(st.get("blocked"))
    requires_human = bool(st.get("requires_human"))

    if agent in suppressed:
        reason = f"agent in suppressed_agents for project {st.get('project_id', '?')}"
        _audit_log(audit, {"agent": agent, "decision": "IGNORE", "reason": reason})
        return "IGNORE", reason

    if allowed and agent not in allowed:
        reason = "agent not in allowed_agents for this project"
        _audit_log(audit, {"agent": agent, "decision": "IGNORE", "reason": reason})
        return "IGNORE", reason

    if requires_human and agent != "HITL Operator":
        reason = "project requires_human"
        _audit_log(audit, {"agent": agent, "decision": "WAIT_FOR_HUMAN", "reason": reason})
        return "WAIT_FOR_HUMAN", reason

    if blocked and agent not in ("Watchdog", "Big Boss", "HITL Operator"):
        reason = "project blocked"
        _audit_log(audit, {"agent": agent, "decision": "WAIT_FOR_STATE", "reason": reason})
        return "WAIT_FOR_STATE", reason

    if agent in AGENT_GTM and lifecycle in GTM_SUPPRESSED_STATES:
        reason = f"GTM/Publishing suppressed while lifecycle={lifecycle}"
        _audit_log(audit, {"agent": agent, "decision": "WAIT_FOR_STATE", "reason": reason})
        return "WAIT_FOR_STATE", reason

    if agent == "Publishing Engine" and lifecycle in PUBLISH_SUPPRESSED_STATES:
        reason = f"Publishing suppressed while lifecycle={lifecycle}"
        _audit_log(audit, {"agent": agent, "decision": "WAIT_FOR_STATE", "reason": reason})
        return "WAIT_FOR_STATE", reason

    if agent in AGENT_LEAD and lifecycle in LEAD_HUNTER_WAIT_STATES and not st.get("offer_validated"):
        reason = "Lead Hunter waits until Product GTM validates offer"
        _audit_log(audit, {"agent": agent, "decision": "WAIT_FOR_STATE", "reason": reason})
        return "WAIT_FOR_STATE", reason

    if owner and owner != agent and agent not in ("Big Boss", "Watchdog", "HITL Operator"):
        if agent_state in ("CLAIMED", "WORKING"):
            reason = f"owner_agent={owner} owns active work"
            _audit_log(audit, {"agent": agent, "decision": "IGNORE", "reason": reason})
            return "IGNORE", reason

    if event:
        etype = event.get("type", "")
        if etype == "agent.failed" and agent != "Watchdog":
            pass  # Watchdog handles failures
        dedupe_key = event.get("event_id")
        if dedupe_key and st.get("last_handled_event_id") == dedupe_key:
            reason = "event already handled"
            _audit_log(audit, {"agent": agent, "decision": "IGNORE", "reason": reason})
            return "IGNORE", reason

    reason = "checks passed"
    _audit_log(audit, {"agent": agent, "decision": "RUN", "reason": reason, "event_type": (event or {}).get("type")})
    return "RUN", reason


def gate_prompt_prefix(agent: str, decision: Decision, reason: str) -> str:
    """Opening block for every routine prompt."""
    if decision != "RUN":
        return (
            f"CAN-ACT GATE: {decision}\n"
            f"Reason: {reason}\n"
            f"Respond with NO_ACTION only — do not manufacture work.\n"
            f"Register scorpion_register_outcome with status skipped if useful.\n\n"
        )
    return (
        f"CAN-ACT GATE: RUN\n"
        f"Agent: {agent}\n"
        f"Proceed with your routine only if value > cost.\n\n"
    )


def self_test() -> int:
    cases = [
        ("Product GTM", None, {"lifecycle": "development"}, "WAIT_FOR_STATE"),
        ("Forge", None, {"lifecycle": "development", "owner_agent": "Forge", "agent_state": "WORKING"}, "RUN"),
        ("Lead Hunter", None, {"lifecycle": "idea"}, "WAIT_FOR_STATE"),
        ("Watchdog", {"type": "hive.heartbeat"}, {"lifecycle": "production"}, "RUN"),
    ]
    fails = 0
    for agent, ev, st, expected in cases:
        got, _ = should_run(agent, ev, st, audit_path=Path("/tmp/os-audit-selftest.jsonl"))
        if got != expected:
            print(f"FAIL {agent}: expected {expected} got {got}")
            fails += 1
    if fails:
        return 1
    print("should-run self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", help="Agent display name")
    ap.add_argument("--event", help="Event JSON string")
    ap.add_argument("--state", help="Project state JSON string")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--gate-prefix", action="store_true", help="Print routine gate prefix")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    if not args.agent:
        ap.print_help()
        return 1

    event = json.loads(args.event) if args.event else None
    state = json.loads(args.state) if args.state else None
    decision, reason = should_run(args.agent, event, state)
    if args.gate_prefix:
        print(gate_prompt_prefix(args.agent, decision, reason), end="")
        return 0
    print(json.dumps({"agent": args.agent, "decision": decision, "reason": reason}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
