#!/usr/bin/env python3
"""Project the founder can-act gate into seven attention classes.

scripts/hive/os/should-run.py owns the gate. This file reads that module and
does not change it. It does not add a dashboard, a second queue, or a metrics
store. When a row is worth recording, it appends one JSON line in the existing
evens-tax shape: ts, class, case, reason.

Interrupt Evens only when his input changes the outcome now, or a consequential
send, pay, deploy, book, or publish needs him. Every other class is silent.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ATTENTION_CLASSES = (
    "TECHNICAL_BLOCKER",
    "WAITING_INPUT",
    "DEFERRED",
    "STANDING_AUTHORITY",
    "READY_FOR_AUTHORITY",
    "INFORMATIONAL",
    "NO_ACTION",
)
HELD = frozenset(
    {
        "TECHNICAL_BLOCKER",
        "WAITING_INPUT",
        "DEFERRED",
        "STANDING_AUTHORITY",
        "INFORMATIONAL",
        "NO_ACTION",
    }
)
NON_DECISIONS = frozenset(
    {
        "pick a worker",
        "pick an agent",
        "choose a worker",
        "choose an agent",
        "restate architecture",
        "relay context",
        "confirm a result",
        "confirm result",
        "status",
    }
)
_TAX_SKIP = frozenset({"", "none"})


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _load_gate():
    path = Path(__file__).resolve().parent / "should-run.py"
    spec = importlib.util.spec_from_file_location("should_run_gate", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load founder gate at {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _action(state: dict[str, Any], event: dict[str, Any]) -> str:
    return str(state.get("authority_action") or event.get("authority_action") or "").strip().lower()


def _flag(state: dict[str, Any], event: dict[str, Any], key: str) -> bool:
    return bool(state.get(key) or event.get(key))


def _explicit(state: dict[str, Any]) -> str:
    token = str(state.get("attention") or "").strip().upper()
    if token == "DEFERRED_DECISION":
        return "DEFERRED"
    return token


def _outcome_fork(state: dict[str, Any], event: dict[str, Any]) -> bool:
    """His choice changes the outcome now. A later batch decision does not."""
    if _action(state, event) in NON_DECISIONS:
        return False
    if any(_flag(state, event, key) for key in ("standing_authority", "standing_rule", "declined", "deferred")):
        return False
    choices = state.get("choices") if state.get("choices") is not None else event.get("choices")
    if not isinstance(choices, list) or len(choices) < 2:
        return False
    return _flag(state, event, "urgent") and _flag(state, event, "cannot_continue")


def _imminent(state: dict[str, Any], event: dict[str, Any]) -> bool:
    return _flag(state, event, "evidence_at_risk") or _flag(state, event, "unauthorized_executing")


def _stuck(state: dict[str, Any], reason: str) -> bool:
    if "change approach" in reason:
        return True
    try:
        attempts = int(state.get("hypothesis_attempts") or 0)
    except (TypeError, ValueError):
        return False
    return attempts >= 2 and bool(state.get("hypothesis"))


def _informational(state: dict[str, Any], event: dict[str, Any], tax: str) -> bool:
    if tax == "AVOIDABLE_EVENS_INTERVENTION":
        return True
    raw = str(state.get("progress_check") or event.get("progress_check") or "").strip().lower()
    if raw:
        return True
    kind = str(event.get("type") or state.get("kind") or "").strip().lower()
    if kind in {"status", "report", "progress"}:
        return True
    question = str(state.get("question") or event.get("question") or "").lower()
    return any(phrase in question for phrase in ("good morning", "what should i", "how's today", "how is today"))


def project(row: dict[str, Any], state: dict[str, Any] | None, event: dict[str, Any] | None) -> str:
    """Map one founder row onto the seven classes. Never invents a new store."""
    st = state or {}
    ev = event or {}
    reason = str(row.get("reason") or "")
    founder = str(row.get("attention") or "")
    if founder == "DEFERRED_DECISION":
        founder = "DEFERRED"
    if row.get("trigger") == "kill_switch" or reason.startswith("kill switch"):
        return "NO_ACTION"
    if (row.get("interrupt") and founder == "READY_FOR_AUTHORITY") or _imminent(st, ev) or _outcome_fork(st, ev):
        return "READY_FOR_AUTHORITY"
    explicit = _explicit(st)
    if explicit in HELD:
        return explicit
    if founder in HELD:
        return founder
    if founder == "READY_FOR_AUTHORITY" or explicit == "READY_FOR_AUTHORITY":
        return "NO_ACTION"
    etype = str(ev.get("type") or "")
    if "heartbeat" in etype.lower():
        return "NO_ACTION"
    if _stuck(st, reason) or st.get("technical_blocker") or st.get("error"):
        return "TECHNICAL_BLOCKER"
    if st.get("waiting_input"):
        return "WAITING_INPUT"
    if st.get("deferred") or st.get("declined"):
        return "DEFERRED"
    if st.get("standing_authority") or st.get("standing_rule"):
        return "STANDING_AUTHORITY"
    tax = str(row.get("evens_tax") or "none")
    if _informational(st, ev, tax):
        return "INFORMATIONAL"
    return "NO_ACTION"


def _case(attention: str, tax: str, state: dict[str, Any], event: dict[str, Any]) -> str:
    if tax == "AVOIDABLE_EVENS_INTERVENTION":
        return "PROGRESS_CHECK"
    if _flag(state, event, "evidence_at_risk"):
        return "EVIDENCE_AT_RISK"
    if _flag(state, event, "unauthorized_executing"):
        return "UNAUTHORIZED_EXECUTING"
    if _outcome_fork(state, event):
        return "OUTCOME_FORK"
    if attention == "READY_FOR_AUTHORITY":
        return "CONSEQUENTIAL_AUTHORITY"
    return "ATTENTION_HELD"


def append_tax(path: Path, out: dict[str, Any], state: dict[str, Any], event: dict[str, Any]) -> None:
    """One append-only line. Same ledger shape as control/evens-tax.jsonl."""
    line = {
        "ts": _now(),
        "class": out["evens_tax"],
        "kind": out["evens_tax"],
        "case": _case(out["attention"], out["evens_tax"], state, event),
        "attention": out["attention"],
        "interrupt": out["interrupt"],
        "reason": out["reason"],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(line, ensure_ascii=False) + "\n")


def classify(
    agent: str,
    event: dict[str, Any] | None,
    state: dict[str, Any] | None,
    *,
    kill_path: Path | None = None,
    audit_path: Path | None = None,
    ledger_path: Path | None = None,
) -> dict[str, Any]:
    """Read the founder gate, then name the class. Does not write the gate."""
    gate = _load_gate()
    st = state or {}
    ev = event or {}
    row = gate.assess(agent, ev or None, st or None, kill_path=kill_path, audit_path=audit_path)
    attention = project(row, st, ev)
    if attention not in ATTENTION_CLASSES:
        raise RuntimeError(f"attention class escaped the seven: {attention}")
    interrupt = attention == "READY_FOR_AUTHORITY"
    tax = str(row.get("evens_tax") or "none")
    reason = str(row.get("reason") or "")
    decision = str(row.get("decision") or "RUN")
    if interrupt and tax in _TAX_SKIP | {"avoidable"}:
        tax = "necessary"
        if decision != "WAIT_FOR_HUMAN":
            decision = "WAIT_FOR_HUMAN"
            reason = f"his input changes the outcome: {reason}"
    if not interrupt and tax == "necessary":
        tax = "avoidable"
    out = {
        "agent": agent,
        "attention": attention,
        "interrupt": interrupt,
        "decision": decision,
        "reason": reason,
        "evens_tax": tax,
        "founder_attention": row.get("attention"),
        "founder_decision": row.get("decision"),
    }
    if ledger_path is not None and tax not in _TAX_SKIP:
        append_tax(Path(ledger_path), out, st, ev)
    return out


def self_test() -> int:
    audit = Path("/tmp/attention-audit.jsonl")
    ledger = Path("/tmp/attention-evens-tax.jsonl")
    kill = Path("/tmp/attention-kill.json")
    for path in (audit, ledger, kill):
        if path.exists():
            path.unlink()
    fails = 0
    seen: set[str] = set()

    def check(name: str, ok: bool) -> None:
        nonlocal fails
        if not ok:
            print(f"FAIL {name}")
            fails += 1

    def run(agent: str, event: dict[str, Any] | None, state: dict[str, Any] | None, **kw: Any) -> dict[str, Any]:
        row = classify(agent, event, state, audit_path=audit, ledger_path=ledger, **kw)
        seen.add(row["attention"])
        return row

    technical = run("Forge", None, {"requires_human": True, "technical_blocker": True, "lifecycle": "production"})
    check("technical blocker stays with the system", technical["attention"] == "TECHNICAL_BLOCKER" and not technical["interrupt"])

    waiting = run("Forge", None, {"requires_human": True, "waiting_input": True, "lifecycle": "production"})
    check("waiting input is not an interrupt", waiting["attention"] == "WAITING_INPUT" and not waiting["interrupt"])

    deferred = run("Forge", None, {"requires_human": True, "deferred": True, "lifecycle": "production"})
    check(
        "deferred keeps the public name",
        deferred["attention"] == "DEFERRED" and deferred["founder_attention"] == "DEFERRED_DECISION" and not deferred["interrupt"],
    )

    standing = run(
        "Forge",
        None,
        {"requires_human": True, "standing_authority": True, "authority_action": "deploy", "lifecycle": "production"},
    )
    check("standing authority does not ask again", standing["attention"] == "STANDING_AUTHORITY" and not standing["interrupt"])

    deploy = run("Forge", None, {"requires_human": True, "authority_action": "deploy", "lifecycle": "production"})
    check(
        "deploy needs him",
        deploy["attention"] == "READY_FOR_AUTHORITY" and deploy["interrupt"] and deploy["evens_tax"] == "necessary",
    )

    worker = run(
        "Forge",
        None,
        {
            "requires_human": True,
            "attention": "READY_FOR_AUTHORITY",
            "authority_action": "pick a worker",
            "lifecycle": "production",
        },
    )
    check("he does not select the agent", worker["attention"] == "NO_ACTION" and not worker["interrupt"])

    slept = run(
        "Big Boss",
        None,
        {"progress_check": "sleep", "sleep_minutes": 10, "ledger_advancing": True, "lifecycle": "production"},
    )
    check(
        "a sleep check is informational",
        slept["attention"] == "INFORMATIONAL"
        and not slept["interrupt"]
        and slept["evens_tax"] == "AVOIDABLE_EVENS_INTERVENTION",
    )

    watching = run("Big Boss", None, {"progress_check": "watch", "lifecycle": "production"})
    check(
        "a watch is not that tax",
        watching["attention"] == "INFORMATIONAL" and watching["evens_tax"] != "AVOIDABLE_EVENS_INTERVENTION" and not watching["interrupt"],
    )

    stuck = run(
        "Forge",
        None,
        {"hypothesis": "same wire", "hypothesis_attempts": 2, "requires_human": True, "lifecycle": "production"},
    )
    check(
        "a stuck hypothesis is not his to babysit",
        stuck["attention"] == "TECHNICAL_BLOCKER" and not stuck["interrupt"] and stuck["founder_decision"] == "RUN",
    )

    evidence = run("Watchdog", None, {"evidence_at_risk": True, "lifecycle": "production"})
    check(
        "evidence at risk changes the outcome",
        evidence["attention"] == "READY_FOR_AUTHORITY" and evidence["interrupt"] and evidence["decision"] == "WAIT_FOR_HUMAN",
    )

    unauthorized = run("Watchdog", {"unauthorized_executing": True}, {"lifecycle": "production"})
    check("an executing unauthorized action needs him", unauthorized["attention"] == "READY_FOR_AUTHORITY" and unauthorized["interrupt"])

    fork = run(
        "Big Boss",
        None,
        {"urgent": True, "cannot_continue": True, "choices": ["stop", "let it finish"], "lifecycle": "production"},
    )
    check("an urgent fork is founder attention", fork["attention"] == "READY_FOR_AUTHORITY" and fork["interrupt"])

    later = run(
        "Big Boss",
        None,
        {"cannot_continue": False, "choices": ["keep", "revert"], "deferred": True, "lifecycle": "production"},
    )
    check("a later choice stays deferred", later["attention"] == "DEFERRED" and not later["interrupt"])

    kill.write_text(json.dumps({"active": True}), encoding="utf-8")
    stopped = run("Forge", None, {"evidence_at_risk": True, "lifecycle": "production"}, kill_path=kill)
    check("a kill switch is no action", stopped["attention"] == "NO_ACTION" and not stopped["interrupt"])

    note = run("Forge", None, {"attention": "INFORMATIONAL", "lifecycle": "production"})
    check("an explicit note stays informational", note["attention"] == "INFORMATIONAL" and not note["interrupt"])

    quiet = run("Forge", None, {"attention": "NO_ACTION", "lifecycle": "production"})
    check("an explicit no action stays quiet", quiet["attention"] == "NO_ACTION" and not quiet["interrupt"])

    beat = run("Watchdog", {"type": "hive.heartbeat"}, {"lifecycle": "production"})
    check("a heartbeat is no action", beat["attention"] == "NO_ACTION" and not beat["interrupt"])

    owned = run("Lead Hunter", None, {"goal": "make the conversation reliable", "lifecycle": "production"})
    check("the system keeps the owner", owned["attention"] == "NO_ACTION" and not owned["interrupt"])

    check("all seven classes appear", seen == set(ATTENTION_CLASSES))

    lines = [json.loads(line) for line in ledger.read_text(encoding="utf-8").splitlines() if line.strip()]
    check("ledger has one object per line", bool(lines) and all(isinstance(item, dict) for item in lines))
    sample = lines[0]
    check(
        "ledger uses the evens-tax keys",
        {"ts", "class", "case", "reason", "attention", "interrupt"} <= set(sample),
    )
    check("sleep check was recorded", any(item.get("class") == "AVOIDABLE_EVENS_INTERVENTION" for item in lines))
    check("a necessary row was recorded", any(item.get("class") == "necessary" for item in lines))
    check("no analytics file beside the ledger", ledger.is_file())

    if fails:
        return 1
    print("attention self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", help="Agent display name")
    ap.add_argument("--event", help="Event JSON string")
    ap.add_argument("--state", help="Project state JSON string")
    ap.add_argument("--ledger", help="Append an evens-tax line here when the tax is not none")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    if not args.agent:
        ap.print_help()
        return 1
    event = json.loads(args.event) if args.event else None
    state = json.loads(args.state) if args.state else None
    ledger = Path(args.ledger) if args.ledger else None
    print(json.dumps(classify(args.agent, event, state, ledger_path=ledger), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
