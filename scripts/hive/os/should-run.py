#!/usr/bin/env python3
"""Suppression engine — should_run(agent, event, state) → RUN|QUEUE|IGNORE|WAIT_FOR_STATE|WAIT_FOR_HUMAN.

Used by product-state.py --can-act and routine prompts.

Founder mode lives here, on this gate. Evens states a goal and leaves.
The system owns state, path, owner, execution, stuck recovery, verification,
follow-through, and the outcome. WAIT_FOR_HUMAN interrupts him only for a
consequential send, pay, deploy, book, or publish.
"""
from __future__ import annotations

import argparse
import json
import re
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
ROUTERS = frozenset({"Big Boss", "Watchdog", "HITL Operator"})

# These labels are not an outcome. A later verifier must not treat them as done.
NOT_COMPLETE = frozenset({"PARTIAL", "FAIL", "ROOT_CAUSE_FOUND", "BATCH_STARTED"})
CONSEQUENTIAL = frozenset({"send", "pay", "deploy", "book", "publish"})
ATTENTION_HELD = frozenset(
    {
        "TECHNICAL_BLOCKER",
        "WAITING_INPUT",
        "DEFERRED_DECISION",
        "STANDING_AUTHORITY",
    }
)
WORK_ARTIFACTS = frozenset({"CREATE", "BUILD"})

HOLD_LINE = (
    "If decision ≠ RUN → do not ask Evens. "
    "Continue the owned path. Interrupt only when attention is READY_FOR_AUTHORITY "
    "for a send, pay, deploy, book, or publish."
)

_JARGON = re.compile(
    r"WAIT_EVENS|READY_FOR_AUTHORITY|TECHNICAL_BLOCKER|WAITING_INPUT|"
    r"DEFERRED_DECISION|STANDING_AUTHORITY|ROOT_CAUSE_FOUND|BATCH_STARTED|"
    r"CAN-ACT|control[- ]plane|not on disk|IMPLEMENTED_UNVERIFIED|\bPARTIAL\b",
    re.I,
)
_MORNING = (
    "good morning",
    "what should i",
    "what do i work",
    "how's today",
    "how is today",
    "how are we",
    "what's next",
    "whats next",
)
HUMAN_MORNING = (
    "Good morning. I'm still finishing the open outcome. "
    "You don't need to pick an agent or check a status. "
    "I'll come to you only for a send, a payment, a deploy, a booking, or a publish."
)


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


def is_complete(label: str | None) -> bool:
    """PARTIAL, FAIL, ROOT_CAUSE_FOUND, and BATCH_STARTED are not completion."""
    token = str(label or "").strip().upper()
    if not token or token in NOT_COMPLETE:
        return False
    return True


def consequential(state: dict[str, Any] | None, event: dict[str, Any] | None = None) -> bool:
    st = state or {}
    ev = event or {}
    if st.get("standing_authority") or st.get("standing_rule"):
        return False
    action = str(st.get("authority_action") or ev.get("authority_action") or "").strip().lower()
    return action in CONSEQUENTIAL


def classify_attention(
    state: dict[str, Any] | None, event: dict[str, Any] | None = None
) -> str | None:
    """Five classes. Only a consequential READY_FOR_AUTHORITY is founder attention."""
    st = state or {}
    ev = event or {}
    if consequential(st, ev):
        return "READY_FOR_AUTHORITY"
    explicit = str(st.get("attention") or "").strip().upper()
    if explicit == "READY_FOR_AUTHORITY":
        return None
    if explicit in ATTENTION_HELD:
        return explicit
    if st.get("technical_blocker") or st.get("error"):
        return "TECHNICAL_BLOCKER"
    if st.get("declined") or st.get("deferred"):
        return "DEFERRED_DECISION"
    if st.get("standing_authority") or st.get("standing_rule"):
        return "STANDING_AUTHORITY"
    if st.get("waiting_input"):
        return "WAITING_INPUT"
    return None


def interrupts_founder(attention: str | None, state: dict[str, Any] | None, event: dict[str, Any] | None) -> bool:
    return attention == "READY_FOR_AUTHORITY" and consequential(state, event)


def pick_owner(goal: str) -> str:
    text = goal.lower()
    if any(word in text for word in ("talk", "conversation", "jarvis", "morning", "voice")):
        return "Jarvis"
    if any(word in text for word in ("proof", "grade", "verify", "watchdog")):
        return "Watchdog"
    if any(word in text for word in ("page", "site", "copy", "video")):
        return "Creative Studio"
    if any(word in text for word in ("mail", "inbox", "calendar", "plan")):
        return "Day Planner"
    return "Forge"


def own_goal(state: dict[str, Any]) -> dict[str, Any]:
    """Evens left. These fields are the system's, not a question back to him."""
    goal = str(state.get("goal") or "").strip()
    owner = str(state.get("native_owner") or "").strip() or pick_owner(goal)
    return {
        "outcome": goal,
        "current_state": state.get("current_state") or "open",
        "critical_path": state.get("critical_path") or "finish the open outcome before starting another",
        "decomposition": state.get("decomposition")
        or [
            "current state",
            "critical path",
            "native owner",
            "execution",
            "stuck recovery",
            "independent verification",
            "follow-through",
        ],
        "native_owner": owner,
        "execution": "system",
        "stuck_recovery": "change approach after the same hypothesis twice",
        "verification": "independent",
        "follow_through": "system",
        "asks_evens_to_pick_owner": False,
    }


def _declined(state: dict[str, Any], event: dict[str, Any]) -> bool:
    asks = [str(item).strip().lower() for item in (state.get("declined") or []) if str(item).strip()]
    if not asks:
        return False
    current = str(event.get("ask") or state.get("ask") or "").strip().lower()
    if not current:
        return True
    return current in asks


def _same_hypothesis(state: dict[str, Any]) -> bool:
    try:
        attempts = int(state.get("hypothesis_attempts") or 0)
    except (TypeError, ValueError):
        return False
    return attempts >= 2 and bool(state.get("hypothesis"))


def _missing_work(state: dict[str, Any]) -> bool:
    kind = str(state.get("missing_artifact") or "").strip().upper()
    return kind in WORK_ARTIFACTS


def _false_done(state: dict[str, Any]) -> bool:
    claim = str(state.get("claim") or "").strip().upper()
    return claim in NOT_COMPLETE


def _another_partial(state: dict[str, Any]) -> bool:
    if not state.get("wants_new_partial"):
        return False
    try:
        partials = int(state.get("partial_count") or 0)
        finished = int(state.get("finished_outcomes") or 0)
    except (TypeError, ValueError):
        return False
    return partials >= 1 and finished < 1


def _is_morning(question: str) -> bool:
    text = question.lower()
    return any(phrase in text for phrase in _MORNING)


def spoken_answer(question: str, draft: str = "") -> str:
    """A human morning question gets a human sentence, not control-plane jargon."""
    blob = f"{question}\n{draft}"
    if _is_morning(question) or _JARGON.search(blob):
        return HUMAN_MORNING
    return (draft or question).strip()


def _finish(
    audit: Path,
    agent: str,
    decision: Decision,
    reason: str,
    *,
    attention: str | None,
    interrupt: bool,
    tax: str,
    event: dict[str, Any] | None,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    row: dict[str, Any] = {
        "agent": agent,
        "decision": decision,
        "reason": reason,
        "attention": attention,
        "interrupt": interrupt,
        "evens_tax": tax,
        "event_type": (event or {}).get("type"),
    }
    if extra:
        row.update(extra)
    _audit_log(audit, row)
    return row


def assess(
    agent: str,
    event: dict[str, Any] | None,
    state: dict[str, Any] | None,
    *,
    kill_path: Path | None = None,
    audit_path: Path | None = None,
) -> dict[str, Any]:
    """Same gate as should_run, plus attention class and whether Evens is interrupted."""
    audit = audit_path or Path.home() / ".grokbot/os-audit.jsonl"
    ev = event or {}
    st = state or {}
    owned = own_goal(st) if st.get("goal") else None
    extra = {"owned": owned} if owned else None

    if kill_switch_active(kill_path):
        return _finish(
            audit,
            agent,
            "IGNORE",
            "kill switch active — all agents NO_ACTION",
            attention=None,
            interrupt=False,
            tax="none",
            event=ev,
            extra={"trigger": "kill_switch"},
        )

    lifecycle = str(st.get("lifecycle", "idea")).lower()
    agent_state = str(st.get("agent_state", "IDLE")).upper()
    suppressed = set(st.get("suppressed_agents") or [])
    allowed = set(st.get("allowed_agents") or [])
    owner = st.get("owner_agent")
    blocked = bool(st.get("blocked"))
    requires_human = bool(st.get("requires_human"))
    attention = classify_attention(st, ev)
    interrupt = interrupts_founder(attention, st, ev)

    if agent in suppressed:
        return _finish(
            audit,
            agent,
            "IGNORE",
            f"agent in suppressed_agents for project {st.get('project_id', '?')}",
            attention=attention,
            interrupt=False,
            tax="none",
            event=ev,
        )

    if allowed and agent not in allowed:
        return _finish(
            audit,
            agent,
            "IGNORE",
            "agent not in allowed_agents for this project",
            attention=attention,
            interrupt=False,
            tax="none",
            event=ev,
        )

    if _declined(st, ev):
        return _finish(
            audit,
            agent,
            "IGNORE",
            "declined decision stays declined",
            attention="DEFERRED_DECISION",
            interrupt=False,
            tax="avoidable",
            event=ev,
            extra=extra,
        )

    if _same_hypothesis(st):
        return _finish(
            audit,
            agent,
            "RUN",
            "same hypothesis twice; change approach",
            attention=None,
            interrupt=False,
            tax="avoidable",
            event=ev,
            extra=extra,
        )

    if _missing_work(st) and agent not in AGENT_GTM:
        kind = str(st.get("missing_artifact") or "").upper()
        return _finish(
            audit,
            agent,
            "RUN",
            f"missing {kind} artifact is the work",
            attention=None,
            interrupt=False,
            tax="avoidable",
            event=ev,
            extra=extra,
        )

    if _false_done(st):
        return _finish(
            audit,
            agent,
            "RUN",
            "PARTIAL, FAIL, ROOT_CAUSE_FOUND, and BATCH_STARTED are not completion",
            attention=None,
            interrupt=False,
            tax="avoidable",
            event=ev,
            extra=extra,
        )

    if _another_partial(st):
        return _finish(
            audit,
            agent,
            "IGNORE",
            "finish the open outcome before another partial",
            attention=None,
            interrupt=False,
            tax="avoidable",
            event=ev,
            extra=extra,
        )

    if st.get("odd_case") and st.get("open_outcome"):
        return _finish(
            audit,
            agent,
            "RUN",
            "one odd case does not take the day; finish the open outcome",
            attention=None,
            interrupt=False,
            tax="avoidable",
            event=ev,
            extra=extra,
        )

    if owned and agent not in ROUTERS and agent != owned["native_owner"]:
        return _finish(
            audit,
            agent,
            "IGNORE",
            f"native owner is {owned['native_owner']}",
            attention=attention,
            interrupt=False,
            tax="avoidable",
            event=ev,
            extra=extra,
        )

    if requires_human and agent != "HITL Operator":
        if interrupt:
            action = str(st.get("authority_action") or ev.get("authority_action") or "authority")
            return _finish(
                audit,
                agent,
                "WAIT_FOR_HUMAN",
                f"consequential authority: {action}",
                attention="READY_FOR_AUTHORITY",
                interrupt=True,
                tax="necessary",
                event=ev,
                extra=extra,
            )
        if attention == "DEFERRED_DECISION":
            return _finish(
                audit,
                agent,
                "IGNORE",
                "deferred decision is not an interrupt",
                attention=attention,
                interrupt=False,
                tax="avoidable",
                event=ev,
                extra=extra,
            )
        if attention == "STANDING_AUTHORITY":
            return _finish(
                audit,
                agent,
                "RUN",
                "standing authority already covers this",
                attention=attention,
                interrupt=False,
                tax="avoidable",
                event=ev,
                extra=extra,
            )
        if attention == "TECHNICAL_BLOCKER":
            return _finish(
                audit,
                agent,
                "RUN",
                "technical blocker stays with the system",
                attention=attention,
                interrupt=False,
                tax="avoidable",
                event=ev,
                extra=extra,
            )
        if attention == "WAITING_INPUT":
            return _finish(
                audit,
                agent,
                "WAIT_FOR_STATE",
                "input can be recovered without Evens",
                attention=attention,
                interrupt=False,
                tax="avoidable",
                event=ev,
                extra=extra,
            )
        return _finish(
            audit,
            agent,
            "RUN",
            "requires_human is not founder attention",
            attention=None,
            interrupt=False,
            tax="avoidable",
            event=ev,
            extra=extra,
        )

    if blocked and agent not in ("Watchdog", "Big Boss", "HITL Operator"):
        return _finish(
            audit,
            agent,
            "WAIT_FOR_STATE",
            "project blocked",
            attention=attention,
            interrupt=False,
            tax="avoidable" if attention else "none",
            event=ev,
            extra=extra,
        )

    if agent in AGENT_GTM and lifecycle in GTM_SUPPRESSED_STATES:
        return _finish(
            audit,
            agent,
            "WAIT_FOR_STATE",
            f"GTM/Publishing suppressed while lifecycle={lifecycle}",
            attention=attention,
            interrupt=False,
            tax="none",
            event=ev,
            extra=extra,
        )

    if agent == "Publishing Engine" and lifecycle in PUBLISH_SUPPRESSED_STATES:
        return _finish(
            audit,
            agent,
            "WAIT_FOR_STATE",
            f"Publishing suppressed while lifecycle={lifecycle}",
            attention=attention,
            interrupt=False,
            tax="none",
            event=ev,
            extra=extra,
        )

    if agent in AGENT_LEAD and lifecycle in LEAD_HUNTER_WAIT_STATES and not st.get("offer_validated"):
        return _finish(
            audit,
            agent,
            "WAIT_FOR_STATE",
            "Lead Hunter waits until Product GTM validates offer",
            attention=attention,
            interrupt=False,
            tax="none",
            event=ev,
            extra=extra,
        )

    if owner and owner != agent and agent not in ROUTERS:
        if agent_state in ("CLAIMED", "WORKING"):
            return _finish(
                audit,
                agent,
                "IGNORE",
                f"owner_agent={owner} owns active work",
                attention=attention,
                interrupt=False,
                tax="none",
                event=ev,
                extra=extra,
            )

    if ev:
        dedupe_key = ev.get("event_id")
        if dedupe_key and st.get("last_handled_event_id") == dedupe_key:
            return _finish(
                audit,
                agent,
                "IGNORE",
                "event already handled",
                attention=attention,
                interrupt=False,
                tax="none",
                event=ev,
                extra=extra,
            )

    tax = "none"
    if owned:
        reason = f"goal owned by {owned['native_owner']}"
    else:
        reason = "checks passed"
    return _finish(
        audit,
        agent,
        "RUN",
        reason,
        attention=attention if interrupt else attention,
        interrupt=interrupt,
        tax=tax,
        event=ev,
        extra=extra,
    )


def should_run(
    agent: str,
    event: dict[str, Any] | None,
    state: dict[str, Any] | None,
    *,
    kill_path: Path | None = None,
    audit_path: Path | None = None,
) -> tuple[Decision, str]:
    """Evaluate spec §9 checklist. Returns (decision, reason)."""
    row = assess(agent, event, state, kill_path=kill_path, audit_path=audit_path)
    return row["decision"], row["reason"]


def gate_prompt_prefix(
    agent: str,
    decision: Decision,
    reason: str,
    attention: str | None = None,
    interrupt: bool = False,
) -> str:
    """Opening block for every routine prompt. Does not ask Evens a clarifying question.

    WAIT_FOR_HUMAN is only returned for a consequential send, pay, deploy, book,
    or publish. product-state.py calls this with three arguments, so that
    decision itself is the interrupt.
    """
    if decision == "WAIT_FOR_HUMAN" or interrupt:
        return (
            f"One decision for Evens: {reason}\n"
            "This is a send, payment, deploy, booking, or publish. "
            "Do not add a second question.\n\n"
        )
    if decision != "RUN":
        held = f"Attention: {attention}\n" if attention else ""
        return (
            f"CAN-ACT GATE: {decision}\n"
            f"Reason: {reason}\n"
            f"{held}"
            "Do not ask Evens. Continue the owned path or finish the open outcome.\n"
            "A missing build is the work. A repeated hypothesis means change approach.\n\n"
        )
    return (
        f"CAN-ACT GATE: RUN\n"
        f"Agent: {agent}\n"
        "Evens stated the goal and left. You own the path, the owner, and the outcome.\n"
        "Do not ask him to pick an agent or the next step.\n\n"
    )


def self_test() -> int:
    audit = Path("/tmp/os-audit-selftest.jsonl")
    cases = [
        ("Product GTM", None, {"lifecycle": "development"}, "WAIT_FOR_STATE"),
        ("Forge", None, {"lifecycle": "development", "owner_agent": "Forge", "agent_state": "WORKING"}, "RUN"),
        ("Lead Hunter", None, {"lifecycle": "idea"}, "WAIT_FOR_STATE"),
        ("Watchdog", {"type": "hive.heartbeat"}, {"lifecycle": "production"}, "RUN"),
    ]
    fails = 0
    for agent, ev, st, expected in cases:
        got, _ = should_run(agent, ev, st, audit_path=audit)
        if got != expected:
            print(f"FAIL {agent}: expected {expected} got {got}")
            fails += 1

    def check(name: str, ok: bool, detail: str = "") -> None:
        nonlocal fails
        if not ok:
            print(f"FAIL {name}{': ' + detail if detail else ''}")
            fails += 1

    bare = assess(
        "Forge",
        None,
        {"requires_human": True, "lifecycle": "production"},
        audit_path=audit,
    )
    check("bare requires_human does not interrupt", bare["decision"] != "WAIT_FOR_HUMAN" and not bare["interrupt"])
    prefix = gate_prompt_prefix("Forge", bare["decision"], bare["reason"], bare["attention"], bare["interrupt"])
    check("gate does not ask a clarifying question", "clarifying question" not in prefix.lower())

    deploy = assess(
        "Forge",
        None,
        {"requires_human": True, "authority_action": "deploy", "lifecycle": "production"},
        audit_path=audit,
    )
    check(
        "deploy is founder attention",
        deploy["decision"] == "WAIT_FOR_HUMAN"
        and deploy["attention"] == "READY_FOR_AUTHORITY"
        and deploy["interrupt"] is True
        and deploy["evens_tax"] == "necessary",
    )

    for label, key, value in (
        ("technical", "technical_blocker", True),
        ("waiting", "waiting_input", True),
        ("deferred", "deferred", True),
        ("standing", "standing_authority", True),
    ):
        row = assess(
            "Forge",
            None,
            {"requires_human": True, "lifecycle": "production", key: value},
            audit_path=audit,
        )
        check(f"{label} does not interrupt", row["interrupt"] is False and row["attention"] != "READY_FOR_AUTHORITY")

    work = assess(
        "Forge",
        None,
        {"missing_artifact": "BUILD", "blocked": True, "lifecycle": "development"},
        audit_path=audit,
    )
    check("missing build is the work", work["decision"] == "RUN" and "work" in work["reason"])

    stuck = assess(
        "Forge",
        None,
        {"hypothesis": "same wire", "hypothesis_attempts": 2, "requires_human": True, "lifecycle": "production"},
        audit_path=audit,
    )
    check("repeated hypothesis changes approach", stuck["decision"] == "RUN" and "change approach" in stuck["reason"])

    declined = assess(
        "Big Boss",
        {"ask": "vault capture"},
        {"declined": ["vault capture"], "lifecycle": "production"},
        audit_path=audit,
    )
    check("declined decision does not return", declined["decision"] == "IGNORE" and declined["interrupt"] is False)

    partials = assess(
        "Forge",
        None,
        {"wants_new_partial": True, "partial_count": 5, "finished_outcomes": 0, "lifecycle": "production"},
        audit_path=audit,
    )
    check("five partials lose to one finish", partials["decision"] == "IGNORE")

    for claim in ("PARTIAL", "FAIL", "ROOT_CAUSE_FOUND", "BATCH_STARTED"):
        check(f"{claim} is not complete", is_complete(claim) is False)
        row = assess("Forge", None, {"claim": claim, "lifecycle": "production"}, audit_path=audit)
        check(f"{claim} claim continues", row["decision"] == "RUN" and row["interrupt"] is False)

    goal = assess(
        "Lead Hunter",
        None,
        {"goal": "make the conversation reliable", "lifecycle": "production"},
        audit_path=audit,
    )
    check(
        "system names the owner",
        goal["decision"] == "IGNORE"
        and goal.get("owned", {}).get("native_owner") == "Jarvis"
        and goal.get("owned", {}).get("asks_evens_to_pick_owner") is False
        and goal.get("owned", {}).get("follow_through") == "system",
    )
    boss = assess(
        "Big Boss",
        None,
        {"goal": "make the conversation reliable", "lifecycle": "production"},
        audit_path=audit,
    )
    check("router keeps the goal", boss["decision"] == "RUN" and "Jarvis" in boss["reason"])

    odd = assess(
        "Forge",
        None,
        {"odd_case": True, "open_outcome": "conversation path", "lifecycle": "production"},
        audit_path=audit,
    )
    check("odd case does not take the day", odd["decision"] == "RUN" and "open outcome" in odd["reason"])

    morning = spoken_answer("what should I work on this morning?", "WAIT_EVENS PARTIAL. The file is not on disk.")
    check("morning answer is human", morning == HUMAN_MORNING and not _JARGON.search(morning))
    internals = spoken_answer("status?", "Sir. UNKNOWN. pipeline.py is not on disk. READY_FOR_AUTHORITY.")
    check("internals are not spoken", internals == HUMAN_MORNING)

    worker_pick = assess(
        "Forge",
        None,
        {"requires_human": True, "attention": "READY_FOR_AUTHORITY", "authority_action": "pick a worker", "lifecycle": "production"},
        audit_path=audit,
    )
    check("worker pick is not founder attention", worker_pick["interrupt"] is False)

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
    ap.add_argument("--morning", help="Answer a human morning question")
    ap.add_argument("--draft", default="", help="Draft answer to humanize with --morning")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    if args.morning is not None:
        print(spoken_answer(args.morning, args.draft))
        return 0

    if not args.agent:
        ap.print_help()
        return 1

    event = json.loads(args.event) if args.event else None
    state = json.loads(args.state) if args.state else None
    row = assess(args.agent, event, state)
    if args.gate_prefix:
        print(
            gate_prompt_prefix(
                args.agent,
                row["decision"],
                row["reason"],
                row.get("attention"),
                bool(row.get("interrupt")),
            ),
            end="",
        )
        return 0
    print(json.dumps(row, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
