#!/usr/bin/env python3
"""Project state machine v2 — lifecycle + agent states + can-act gate."""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
STATE_DIR = Path(__file__).resolve().parent / "product-state"
OPERATOR_FOCUS_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/OPERATOR_FOCUS.json"
# Live hunt is OPERATOR_FOCUS.icp_id on the operator project — not a second lane.
_EMPTY_ICP = frozenset({"", "none", "(none)", "null", "parked"})

LIFECYCLE_ORDER = [
    "idea",
    "specification",
    "planning",
    "development",
    "testing",
    "beta",
    "launch_ready",
    "production",
    "maintenance",
    "deprecated",
]

AGENT_STATES = frozenset(
    {
        "IDLE",
        "READY",
        "CLAIMED",
        "KNOWLEDGE_GAP",
        "RESEARCHING",
        "KNOWLEDGE_READY",
        "WORKING",
        "BLOCKED",
        "WAITING",
        "NEEDS_REVIEW",
        "NEEDS_HUMAN",
        "COMPLETED",
        "FAILED",
    }
)


def _load_should_run():
    spec = importlib.util.spec_from_file_location(
        "should_run", Path(__file__).resolve().parent / "os" / "should-run.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod.should_run, mod.gate_prompt_prefix


def _load_event_bus():
    spec = importlib.util.spec_from_file_location(
        "event_bus", Path(__file__).resolve().parent / "os" / "event-bus.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod.emit


def list_projects() -> list[str]:
    return sorted(p.stem for p in STATE_DIR.glob("*.json"))


def load_state(project_id: str) -> dict[str, Any]:
    path = STATE_DIR / f"{project_id}.json"
    if not path.is_file():
        raise SystemExit(f"Unknown project: {project_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def save_state(project_id: str, state: dict[str, Any]) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    path = STATE_DIR / f"{project_id}.json"
    path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def validate_state(state: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if state.get("lifecycle") not in LIFECYCLE_ORDER:
        errors.append(f"invalid lifecycle: {state.get('lifecycle')}")
    if state.get("agent_state") not in AGENT_STATES:
        errors.append(f"invalid agent_state: {state.get('agent_state')}")
    for key in ("allowed_agents", "suppressed_agents"):
        if key in state and not isinstance(state[key], list):
            errors.append(f"{key} must be list")
    return errors


def transition(project_id: str, lifecycle: str | None, agent_state: str | None, actor: str) -> dict[str, Any]:
    state = load_state(project_id)
    old = {"lifecycle": state.get("lifecycle"), "agent_state": state.get("agent_state")}
    if lifecycle:
        if lifecycle not in LIFECYCLE_ORDER:
            raise SystemExit(f"Invalid lifecycle: {lifecycle}")
        state["lifecycle"] = lifecycle
    if agent_state:
        if agent_state not in AGENT_STATES:
            raise SystemExit(f"Invalid agent_state: {agent_state}")
        state["agent_state"] = agent_state
    state["last_action"] = f"transition by {actor} at {datetime.now(timezone.utc).isoformat()}"
    save_state(project_id, state)
    emit = _load_event_bus()
    payload = {"project_id": project_id, "from": old, "to": {"lifecycle": state.get("lifecycle"), "agent_state": state.get("agent_state")}}
    event_type = "project.state_changed"
    if agent_state in ("KNOWLEDGE_GAP", "RESEARCHING", "KNOWLEDGE_READY"):
        event_type = "agent.knowledge_gap" if agent_state == "KNOWLEDGE_GAP" else "research.requested"
    emit(
        event_type,
        "product-state.py",
        actor,
        {"project_id": project_id, "from": old, "to": {"lifecycle": state.get("lifecycle"), "agent_state": state.get("agent_state")}},
        project_id=project_id,
    )
    return state


def load_operator_focus_icp(path: Path | None = None) -> str:
    """Return OPERATOR_FOCUS.icp_id, or empty if unset / missing."""
    p = path or OPERATOR_FOCUS_PATH
    if not p.is_file():
        return ""
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return ""
    return str(data.get("icp_id") or "").strip()


def can_act(agent: str, project_id: str | None) -> dict[str, Any]:
    should_run, gate_prefix = _load_should_run()
    state = load_state(project_id) if project_id else {}
    # Lead Hunter hunts the focused ICP on operator. clipengine allowlist unchanged.
    if agent == "Lead Hunter" and project_id == "operator":
        icp = load_operator_focus_icp()
        if not icp or icp.lower() in _EMPTY_ICP:
            decision: str = "IGNORE"
            reason = (
                "OPERATOR_FOCUS.icp_id empty — Lead Hunter NO_ACTION "
                "(do not hunt random ICP)"
            )
            return {
                "agent": agent,
                "project_id": project_id,
                "decision": decision,
                "reason": reason,
                "gate_prefix": gate_prefix(agent, decision, reason),
            }
        allowed = list(state.get("allowed_agents") or [])
        if "Lead Hunter" not in allowed:
            state = {**state, "allowed_agents": [*allowed, "Lead Hunter"]}
    decision, reason = should_run(agent, None, state)
    return {
        "agent": agent,
        "project_id": project_id,
        "decision": decision,
        "reason": reason,
        "gate_prefix": gate_prefix(agent, decision, reason),
    }


def validate_all() -> int:
    fails = 0
    for pid in list_projects():
        state = load_state(pid)
        errs = validate_state(state)
        if errs:
            print(f"FAIL {pid}: {errs}")
            fails += 1
    if fails:
        return 1
    print(f"product-state validate: OK ({len(list_projects())} projects)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--validate", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--show", metavar="PROJECT")
    ap.add_argument("--can-act", nargs=2, metavar=("AGENT", "PROJECT"))
    ap.add_argument("--transition", metavar="PROJECT")
    ap.add_argument("--lifecycle")
    ap.add_argument("--agent-state")
    ap.add_argument("--actor", default="operator")
    args = ap.parse_args()

    if args.validate:
        return validate_all()
    if args.list:
        for p in list_projects():
            print(p)
        return 0
    if args.show:
        print(json.dumps(load_state(args.show), indent=2))
        return 0
    if args.can_act:
        print(json.dumps(can_act(args.can_act[0], args.can_act[1]), indent=2))
        return 0
    if args.transition:
        state = transition(args.transition, args.lifecycle, args.agent_state, args.actor)
        print(json.dumps(state, indent=2))
        return 0

    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
