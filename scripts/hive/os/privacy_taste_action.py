#!/usr/bin/env python3
"""Contextual taste, desk privacy, and separate HITL action states.

Shared bus and briefs already exist. This module refuses to turn one
preference into doctrine, refuses to put raw finance or personal data on
unrelated desks, and refuses to collapse KILL / KEEP / SEND / PUBLISH
into one flag. It does not open a privacy database.
"""
from __future__ import annotations

import argparse
import json
import re
from typing import Any, Literal

VerbName = Literal["KILL", "KEEP", "SEND", "PUBLISH"]
Recommendation = Literal["propose", "decline"]
EvensDecision = Literal["pending", "yes", "no"]
Execution = Literal["not_executed", "executed"]

VERBS: frozenset[str] = frozenset({"KILL", "KEEP", "SEND", "PUBLISH"})
FINANCE_DESKS = frozenset({"Money Desk", "Personal CFO", "Wealth Manager"})
PERSONAL_DESKS = frozenset({"Personal CFO"})
TASTE_FIELDS = ("accepted_example", "rejected_example", "reason", "context")
RECEIPT_FIELDS = ("authorized_by", "executed_by", "target", "timestamp", "result_evidence")
CONSEQUENTIAL_EVENT_TYPES = frozenset(
    {"email.replied", "content.published", "calendar.event_created"}
)
_DONE_EVIDENCE = frozenset(
    {"done", "complete", "completed", "ok", "worker said done", "worker_done"}
)
_ONE_FLAG_KEYS = frozenset({"approved", "done", "execute", "active", "flag"})
_GLOBAL_PREF = re.compile(r"\bEvens\s+(likes|hates|loves|prefers|dislikes)\b", re.I)
_GLOBAL_CONTEXT = frozenset({"always", "global", "everywhere", "all", "all desks", "doctrine"})
_FINANCE_LINE = re.compile(
    r"\b(account\s*number|routing\s*number|bank\s*balance|savings\s*rate|runway|social\s*security|\bssn\b)\b",
    re.I,
)
_FINANCE_KEY = re.compile(
    r"(bank[_\s-]?balance|account[_\s-]?number|routing([_\s-]?number)?|savings[_\s-]?rate|^amount$|^balance$|invoice|transaction([_\s-]?amount)?)",
    re.I,
)
_PERSONAL_LINE = re.compile(
    r"\b(home\s*address|date\s*of\s*birth|personal\s*phone|medical\s*record|diagnosis)\b",
    re.I,
)
_PERSONAL_KEY = re.compile(
    r"(home[_\s-]?address|date[_\s-]?of[_\s-]?birth|^dob$|personal[_\s-]?phone|medical|diagnosis|^ssn$)",
    re.I,
)
_FLAG_TOKENS = frozenset({"true", "false", "1", "0", "yes", "no", "on", "off", "y", "n"})
_FINANCE_EVENT_TYPES = frozenset({"transaction.detected", "subscription.changed"})


class CollapseError(ValueError):
    """Recommendation and execution were forced into one flag."""


class VerbState:
    """Three independent fields. There is no flag that sets more than one."""

    def __init__(
        self,
        verb: VerbName,
        recommendation: Recommendation,
        evens_decision: EvensDecision,
        execution: Execution,
    ) -> None:
        self.verb = verb
        self.recommendation = recommendation
        self.evens_decision = evens_decision
        self.execution = execution

    def as_dict(self) -> dict[str, str]:
        return {
            "verb": self.verb,
            "recommendation": self.recommendation,
            "evens_decision": self.evens_decision,
            "execution": self.execution,
        }


def global_preference_sentence(text: str) -> bool:
    return bool(_GLOBAL_PREF.search(text or ""))


def validate_taste(note: dict[str, Any]) -> tuple[bool, str]:
    """Taste is an accepted example, a rejected example, a reason, and a context."""
    if not isinstance(note, dict):
        return False, "taste must be a record"
    missing = [key for key in TASTE_FIELDS if not str(note.get(key) or "").strip()]
    if missing:
        return False, "taste missing " + ", ".join(missing)
    context = str(note["context"]).strip().lower()
    if context in _GLOBAL_CONTEXT:
        return False, "taste context must stay local"
    blob = " ".join(str(note.get(key) or "") for key in TASTE_FIELDS)
    if global_preference_sentence(blob):
        return False, "Evens likes X is not a taste record"
    return True, "ok"


def promote_to_doctrine(note: dict[str, Any]) -> dict[str, Any]:
    """A taste note never becomes a rule for every desk."""
    ok, reason = validate_taste(note)
    return {
        "promoted": False,
        "valid_taste": ok,
        "reason": "a contextual taste example is not global doctrine",
        "detail": reason,
    }


def taste_for_desk(note: dict[str, Any], desk: str) -> dict[str, str] | None:
    ok, _ = validate_taste(note)
    if not ok:
        return None
    context = str(note["context"]).lower()
    if desk.lower() not in context:
        return None
    return {key: str(note[key]) for key in TASTE_FIELDS}


def desk_may_see(desk: str, classification: str) -> bool:
    kind = (classification or "").strip().lower()
    if kind in {"finance", "finance_raw"}:
        return desk in FINANCE_DESKS
    if kind in {"personal", "personal_raw"}:
        return desk in PERSONAL_DESKS
    return True


def project_for_desk(desk: str, classification: str, payload: dict[str, Any]) -> dict[str, Any]:
    if desk_may_see(desk, classification):
        return dict(payload)
    kind = "personal_raw" if "personal" in classification else "finance_raw"
    return {"redacted": True, "classification": kind}


def scrub_text_for_desk(text: str, desk: str) -> str:
    """Drop global preference lines. Withhold raw finance and personal lines."""
    kept: list[str] = []
    for line in (text or "").splitlines():
        if global_preference_sentence(line):
            continue
        if _PERSONAL_LINE.search(line) and not desk_may_see(desk, "personal_raw"):
            kept.append("[withheld personal]")
            continue
        if _FINANCE_LINE.search(line) and not desk_may_see(desk, "finance_raw"):
            kept.append("[withheld finance]")
            continue
        kept.append(line)
    return "\n".join(kept)


def _has_three(raw: dict[str, Any]) -> bool:
    return "recommendation" in raw and "evens_decision" in raw and "execution" in raw


def _is_flag_value(value: Any) -> bool:
    """A boolean, a number, or a flag-shaped string. Not a three-state word."""
    if isinstance(value, bool):
        return True
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return True
    if isinstance(value, str):
        return value.strip().lower() in _FLAG_TOKENS
    return False


def _collapsed_flag_keys(raw: dict[str, Any]) -> list[str]:
    found: list[str] = []
    for name in VERBS:
        for key in (name, name.lower()):
            if key in raw and _is_flag_value(raw.get(key)):
                found.append(key)
    for key in _ONE_FLAG_KEYS:
        if key in raw and _is_flag_value(raw.get(key)):
            found.append(key)
    return found


def parse_verb_state(raw: dict[str, Any]) -> VerbState:
    """Three fields. A boolean, number, or flag string is a collapse and is refused."""
    if not isinstance(raw, dict):
        raise CollapseError("recommendation and execution cannot collapse into one flag")
    if _collapsed_flag_keys(raw):
        raise CollapseError("recommendation and execution cannot collapse into one flag")
    verb = raw.get("verb")
    if verb not in VERBS:
        raise CollapseError("verb must be KILL, KEEP, SEND, or PUBLISH")
    if not _has_three(raw):
        raise CollapseError("recommendation, evens_decision, and execution are separate fields")
    recommendation = raw["recommendation"]
    evens_decision = raw["evens_decision"]
    execution = raw["execution"]
    if recommendation == execution and execution != "not_executed":
        raise CollapseError("recommendation and execution cannot collapse into one flag")
    if recommendation not in ("propose", "decline"):
        raise CollapseError("recommendation is propose or decline")
    if evens_decision not in ("pending", "yes", "no"):
        raise CollapseError("evens_decision is pending, yes, or no")
    if execution not in ("not_executed", "executed"):
        raise CollapseError("execution is not_executed or executed")
    if execution == "executed" and evens_decision != "yes":
        raise CollapseError("execution requires Evens decision yes")
    return VerbState(verb, recommendation, evens_decision, execution)


def with_recommendation(state: VerbState, recommendation: Recommendation) -> VerbState:
    """Changing the recommendation leaves Evens's decision and execution alone."""
    return VerbState(state.verb, recommendation, state.evens_decision, state.execution)


def worker_done_is_receipt(evidence: str) -> bool:
    return False


def consequential_receipt_ok(receipt: dict[str, Any] | None) -> tuple[bool, str]:
    body = receipt or {}
    missing = [key for key in RECEIPT_FIELDS if not str(body.get(key) or "").strip()]
    if missing:
        return False, "consequential action missing " + ", ".join(missing)
    evidence = str(body.get("result_evidence") or "").strip().lower()
    if evidence in _DONE_EVIDENCE or worker_done_is_receipt(evidence):
        return False, "a worker saying done is not a receipt"
    return True, "ok"


def kill_switch_decision(data: dict[str, Any] | None) -> tuple[str, str]:
    """IGNORE only when KILL was executed with a receipt.

    A one-flag file is not a decision. Callers must not treat it as RUN.
    A separate recommendation with execution still not_executed does not block.
    """
    if not data:
        return "", ""
    payload = data if data.get("verb") in VERBS else {**data, "verb": "KILL"}
    try:
        state = parse_verb_state(payload)
    except CollapseError as exc:
        return "WAIT_FOR_HUMAN", str(exc)
    if state.verb != "KILL" or state.execution != "executed" or state.evens_decision != "yes":
        return "", "KILL recommendation is not execution"
    receipt = data.get("receipt") if isinstance(data.get("receipt"), dict) else {}
    ok, reason = consequential_receipt_ok(receipt)
    if not ok:
        return "WAIT_FOR_HUMAN", reason
    return "IGNORE", "KILL executed with receipt"


def kill_switch_blocks(data: dict[str, Any] | None) -> tuple[bool, str]:
    """True only when KILL has actually executed. A collapsed flag does not."""
    decision, reason = kill_switch_decision(data)
    return decision == "IGNORE", reason


def _scan_mapping(obj: Any) -> str | None:
    if isinstance(obj, dict):
        for key, value in obj.items():
            key_text = str(key)
            if _PERSONAL_KEY.search(key_text):
                return "personal_raw"
            if _FINANCE_KEY.search(key_text):
                return "finance_raw"
            found = _scan_mapping(value)
            if found:
                return found
        return None
    if isinstance(obj, list):
        for item in obj:
            found = _scan_mapping(item)
            if found:
                return found
        return None
    if isinstance(obj, str):
        if _PERSONAL_LINE.search(obj):
            return "personal_raw"
        if _FINANCE_LINE.search(obj):
            return "finance_raw"
    return None


def shared_event_classification(event: dict[str, Any]) -> str | None:
    """Raw finance or personal data, including the default sensitivity and unlabeled payloads."""
    if isinstance(event.get("payload"), dict) and event["payload"].get("redacted") is True:
        return None
    sensitivity = str(event.get("sensitivity") or "internal").lower()
    if sensitivity in {"personal", "personal_raw"}:
        return "personal_raw"
    if sensitivity in {"finance", "finance_raw"}:
        return "finance_raw"
    payload = event.get("payload")
    if event.get("type") in _FINANCE_EVENT_TYPES and payload not in (None, {}, []):
        return "finance_raw"
    return _scan_mapping(payload)


def prepare_shared_event(event: dict[str, Any]) -> tuple[dict[str, Any], str | None]:
    """Shared jsonl is not a privacy store. Raw bodies stay off it.

    Consequential external types are not written without a receipt.
    Default sensitivity and the CLI emit path are included.
    """
    prepared = dict(event)
    kind = shared_event_classification(prepared)
    if kind:
        prepared["sensitivity"] = kind
        prepared["payload"] = {"redacted": True, "classification": kind}
    if prepared.get("type") in CONSEQUENTIAL_EVENT_TYPES:
        receipt = prepared.get("receipt") if isinstance(prepared.get("receipt"), dict) else {}
        ok, reason = consequential_receipt_ok(receipt)
        if not ok:
            return prepared, reason
    return prepared, None


def self_test() -> int:
    fails = 0

    def check(cond: bool, label: str) -> None:
        nonlocal fails
        if not cond:
            print(f"FAIL {label}")
            fails += 1

    taste = {
        "accepted_example": "orb scroll plate",
        "rejected_example": "generic gradient hero",
        "reason": "the plate felt premium on that landing",
        "context": "Creative Studio / orb-scroll landing",
    }
    ok, _ = validate_taste(taste)
    check(ok, "valid taste")
    check(promote_to_doctrine(taste)["promoted"] is False, "taste not doctrine")
    check(taste_for_desk(taste, "Forge") is None, "taste stays off Forge")
    check(taste_for_desk(taste, "Creative Studio") is not None, "taste stays in context")
    bad, reason = validate_taste({"accepted_example": "Evens likes dark type", "rejected_example": "x", "reason": "y", "context": "always"})
    check(not bad and "local" in reason, "global context refused")
    check(global_preference_sentence("Evens likes animation"), "preference sentence detected")
    scrubbed = scrub_text_for_desk("Evens likes animation\nbank balance 10\nhome address 1 Main", "Forge")
    check("Evens likes" not in scrubbed, "preference not injected")
    check("[withheld finance]" in scrubbed and "[withheld personal]" in scrubbed, "raw withheld from Forge")
    check("bank balance" in scrub_text_for_desk("bank balance 10", "Money Desk"), "finance desk keeps finance")
    check("[withheld personal]" in scrub_text_for_desk("home address 1 Main", "Money Desk"), "personal stays off Money Desk")
    check("home address" in scrub_text_for_desk("home address 1 Main", "Personal CFO"), "CFO keeps personal")

    try:
        parse_verb_state({"SEND": True})
        check(False, "SEND flag should collapse")
    except CollapseError:
        check(True, "SEND flag collapsed")
    try:
        parse_verb_state({"verb": "PUBLISH", "approved": True})
        check(False, "approved flag should collapse")
    except CollapseError:
        check(True, "approved flag collapsed")
    for raw in ({"SEND": "true"}, {"SEND": 1}, {"approved": "yes"}, {"active": 1}):
        try:
            parse_verb_state(raw)
            check(False, f"flag should collapse {raw}")
        except CollapseError:
            check(True, f"flag collapsed {raw}")
    send = parse_verb_state(
        {
            "verb": "SEND",
            "recommendation": "propose",
            "evens_decision": "pending",
            "execution": "not_executed",
        }
    )
    declined = with_recommendation(send, "decline")
    check(declined.recommendation == "decline", "recommendation changed")
    check(declined.execution == "not_executed", "execution unchanged")
    check(declined.evens_decision == "pending", "decision unchanged")
    check(send.execution != send.recommendation, "fields are not one value")

    done_ok, done_reason = consequential_receipt_ok(
        {
            "authorized_by": "Evens",
            "executed_by": "Evens",
            "target": "draft-1",
            "timestamp": "2026-09-25T01:20:00Z",
            "result_evidence": "done",
        }
    )
    check(not done_ok and "not a receipt" in done_reason, "done is not a receipt")
    check(worker_done_is_receipt("done") is False, "worker done helper")
    blocks, why = kill_switch_blocks({"active": True})
    check(blocks is False and "one flag" in why, "active flag does not execute KILL")
    for raw in ({"active": True}, {"active": "true"}, {"active": 1}):
        decision, _why = kill_switch_decision(raw)
        check(decision == "WAIT_FOR_HUMAN", f"active flag is not RUN {raw}")

    receipt = {
        "authorized_by": "Evens",
        "executed_by": "Evens",
        "target": "operator-kill",
        "timestamp": "2026-09-25T01:20:00Z",
        "result_evidence": "switch file written by Evens at the keyboard",
    }
    blocks, _ = kill_switch_blocks(
        {
            "verb": "KILL",
            "recommendation": "propose",
            "evens_decision": "yes",
            "execution": "executed",
            "receipt": receipt,
        }
    )
    check(blocks is True, "KILL with receipt blocks")

    redacted, refuse = prepare_shared_event(
        {"type": "transaction.detected", "sensitivity": "finance_raw", "payload": {"bank_balance": "999"}}
    )
    check(refuse is None and redacted["payload"].get("redacted") is True, "finance not written raw")
    check("999" not in json.dumps(redacted), "amount absent from shared event")
    default_event, default_refuse = prepare_shared_event(
        {"type": "agent.heartbeat", "sensitivity": "internal", "payload": {"amount": 424242}}
    )
    check(default_refuse is None and "424242" not in json.dumps(default_event), "default path drops amount")
    cli_event, cli_refuse = prepare_shared_event(
        {"type": "transaction.detected", "source": "cli", "actor": "operator", "payload": {"amount": 515151}}
    )
    check(cli_refuse is None and "515151" not in json.dumps(cli_event), "cli path drops amount")
    plain, _ = prepare_shared_event(
        {"type": "agent.heartbeat", "sensitivity": "internal", "payload": {"ok": True}}
    )
    check(plain["payload"] == {"ok": True}, "plain payload kept")
    _, refuse_pub = prepare_shared_event({"type": "content.published", "payload": {"status": "done"}})
    check(refuse_pub is not None, "publish without receipt refused")
    _, refuse_done = prepare_shared_event(
        {
            "type": "content.published",
            "receipt": {
                "authorized_by": "Evens",
                "executed_by": "Publishing Engine",
                "target": "post-1",
                "timestamp": "2026-09-25T01:20:00Z",
                "result_evidence": "done",
            },
        }
    )
    check(refuse_done is not None and "not a receipt" in (refuse_done or ""), "publish done is not a receipt")

    if fails:
        print(f"privacy-taste-action self-test: {fails} FAIL")
        return 1
    print("privacy-taste-action self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Taste, desk privacy, and HITL action semantics")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
