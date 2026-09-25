#!/usr/bin/env python3
"""Contextual taste, desk privacy, and separate HITL action states.

Shared bus and briefs already exist. This module refuses to turn one
preference into doctrine, refuses to put raw finance or personal data on
unrelated desks, and refuses to collapse KILL / KEEP / SEND / PUBLISH
into one flag. The bus is the one shared boundary: only an allowlist of
minimum facts may be persisted. It does not open a privacy database.
"""
from __future__ import annotations

import argparse
import json
import re
import tempfile
import uuid
from pathlib import Path
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
SCOPED_RECEIPT_PATH = Path.home() / ".grokbot" / "os-receipts.jsonl"
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
_PERSONAL_LINE = re.compile(
    r"\b(home\s*address|date\s*of\s*birth|personal\s*phone|medical\s*record|diagnosis)\b",
    re.I,
)
_FLAG_TOKENS = frozenset({"true", "false", "1", "0", "yes", "no", "on", "off", "y", "n"})
_LIFECYCLE = frozenset(
    {
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
    }
)
_AGENT_STATES = frozenset(
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
_SENSITIVITY = frozenset({"internal", "public", "finance_raw", "personal_raw"})
_PRIORITY = frozenset({"P0", "P1", "P2", "P3"})
_DERIVED_STATUS: dict[str, frozenset[str]] = {
    "cash_buffer_status": frozenset({"low", "ok", "high", "unknown", "below", "within", "above"}),
    "classification": frozenset({"finance_raw", "personal_raw"}),
    "lifecycle": _LIFECYCLE,
    "agent_state": _AGENT_STATES,
}
_PAYLOAD_BOOL = frozenset({"ok", "action_ready"})
_PAYLOAD_SLUG = frozenset({"project_id", "packet_id", "entity_id"})
_PAYLOAD_NAME = frozenset({"requested_by"})
_PAYLOAD_DELTA = frozenset({"from", "to"})
_SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
_TOKEN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$")
_NAME = re.compile(r"^[A-Z][a-z]+(?: [A-Z][a-z]+){0,3}$")
_ISO_TS = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$")
_UUID = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)
_EVENT_TYPE = re.compile(r"^[a-z][a-z0-9._]{0,80}$")


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


def _identity(text: str) -> str:
    """One desk name, with case and extra space folded out."""
    return " ".join(str(text or "").split()).casefold()


def _context_identities(context: str) -> frozenset[str]:
    """Context names whole desks, separated by '/'. A piece of a name is not a desk."""
    return frozenset(
        name for part in str(context or "").split("/") if (name := _identity(part))
    )


def taste_for_desk(note: dict[str, Any], desk: str) -> dict[str, str] | None:
    ok, _ = validate_taste(note)
    if not ok:
        return None
    asked = _identity(desk)
    if not asked or asked not in _context_identities(str(note.get("context") or "")):
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


def _slug_ok(value: Any) -> str | None:
    if not isinstance(value, str) or not _SLUG.fullmatch(value) or value.isdigit():
        return None
    return value


def _token_ok(value: Any) -> str | None:
    if not isinstance(value, str) or not _TOKEN.fullmatch(value) or value.isdigit():
        return None
    return value


def _name_ok(value: Any) -> str | None:
    if isinstance(value, str) and _NAME.fullmatch(value):
        return value
    return _token_ok(value)


def _minimize_delta(value: Any) -> dict[str, str] | None:
    if not isinstance(value, dict):
        return None
    kept: dict[str, str] = {}
    lifecycle = value.get("lifecycle")
    if isinstance(lifecycle, str) and lifecycle in _LIFECYCLE:
        kept["lifecycle"] = lifecycle
    agent_state = value.get("agent_state")
    if isinstance(agent_state, str) and agent_state in _AGENT_STATES:
        kept["agent_state"] = agent_state
    return kept or None


def minimize_payload(payload: Any) -> dict[str, Any]:
    """Facts that may leave the shared bus. Every other key is dropped.

    Cash, amount_cents, prose, and a value beside redacted=true are not on
    this list. A redacted flag is not on it either. Derived facts such as
    cash_buffer_status may leave. Raw amounts stay in the caller.
    """
    if not isinstance(payload, dict):
        return {}
    kept: dict[str, Any] = {}
    for key, value in payload.items():
        if key in _PAYLOAD_BOOL and isinstance(value, bool):
            kept[key] = value
            continue
        allowed = _DERIVED_STATUS.get(key)
        if allowed is not None and isinstance(value, str) and value in allowed:
            kept[key] = value
            continue
        if key in _PAYLOAD_SLUG:
            slug = _slug_ok(value)
            if slug is not None:
                kept[key] = slug
            continue
        if key in _PAYLOAD_NAME:
            name = _name_ok(value)
            if name is not None:
                kept[key] = name
            continue
        if key in _PAYLOAD_DELTA:
            delta = _minimize_delta(value)
            if delta:
                kept[key] = delta
    return kept


def _project_shared_event(event: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    event_id = event.get("event_id")
    if isinstance(event_id, str) and _UUID.fullmatch(event_id):
        out["event_id"] = event_id
    event_type = event.get("type")
    if isinstance(event_type, str) and _EVENT_TYPE.fullmatch(event_type):
        out["type"] = event_type
    for key in ("source", "actor"):
        token = _token_ok(event.get(key))
        if token is not None:
            out[key] = token
    priority = event.get("priority")
    if isinstance(priority, str) and priority in _PRIORITY:
        out["priority"] = priority
    for key in ("project_id", "entity_id"):
        slug = _slug_ok(event.get(key))
        if slug is not None:
            out[key] = slug
    timestamp = event.get("timestamp")
    if isinstance(timestamp, str) and _ISO_TS.fullmatch(timestamp):
        out["timestamp"] = timestamp
    sensitivity = event.get("sensitivity")
    if isinstance(sensitivity, str) and sensitivity in _SENSITIVITY:
        out["sensitivity"] = sensitivity
    else:
        out["sensitivity"] = "internal"
    out["payload"] = minimize_payload(event.get("payload"))
    return out


def _scoped_receipt_exists(receipt_id: str, path: Path) -> bool:
    if not path.is_file():
        return False
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(row, dict) and row.get("receipt_id") == receipt_id:
            return True
    return False


def _commit_scoped_receipt(receipt: dict[str, Any], *, event_type: str, path: Path) -> str:
    """Keep one complete receipt, including its exact amount, off the shared bus."""
    path.parent.mkdir(parents=True, exist_ok=True)
    receipt_id = str(receipt.get("receipt_id") or "")
    if not _UUID.fullmatch(receipt_id):
        receipt_id = str(uuid.uuid4())
    if _scoped_receipt_exists(receipt_id, path):
        return receipt_id
    stored = dict(receipt)
    stored["receipt_id"] = receipt_id
    stored["event_type"] = event_type
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(stored, ensure_ascii=False) + "\n")
    return receipt_id


def prepare_shared_event(
    event: dict[str, Any],
    *,
    receipt_path: Path | None = None,
) -> tuple[dict[str, Any], str | None]:
    """Project one event onto the shared-bus allowlist before it is stored.

    A complete consequential receipt is committed to the scoped receipt store.
    The bus keeps a receipt id only. An incomplete receipt is not stored and
    does not count as done. Calling this twice does not drop a receipt that
    was already committed.
    """
    if not isinstance(event, dict):
        return {"sensitivity": "internal", "payload": {}}, "event must be a record"
    prepared = _project_shared_event(event)
    if prepared.get("type") not in CONSEQUENTIAL_EVENT_TYPES:
        return prepared, None
    store = receipt_path or SCOPED_RECEIPT_PATH
    receipt_id = event.get("receipt_id")
    if isinstance(receipt_id, str) and _UUID.fullmatch(receipt_id) and _scoped_receipt_exists(receipt_id, store):
        prepared["receipt_id"] = receipt_id
        return prepared, None
    receipt = event.get("receipt") if isinstance(event.get("receipt"), dict) else None
    ok, reason = consequential_receipt_ok(receipt)
    if not ok or receipt is None:
        return prepared, reason
    prepared["receipt_id"] = _commit_scoped_receipt(
        receipt,
        event_type=str(prepared.get("type") or ""),
        path=store,
    )
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
    invoice = {**taste, "context": "Creative Studio / invoice-plate landing"}
    check(taste_for_desk(invoice, "Studio") is None, "shorter desk is a different identity")
    check(taste_for_desk(invoice, "Creative Studio") is not None, "full desk identity matches")
    harbor = {**taste, "context": "Harbor Desk / quay note"}
    check(taste_for_desk(harbor, "Desk") is None, "other shorter desk is a different identity")
    check(taste_for_desk(harbor, "Harbor Desk") is not None, "other full desk identity matches")
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
    check(refuse is None and "999" not in json.dumps(redacted), "amount absent from shared event")
    check("bank_balance" not in redacted["payload"], "raw finance key dropped")
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
    leaks = (
        ("cash", {"cash": 636363}, "636363"),
        ("amount_cents", {"amount_cents": 747474}, "747474"),
        ("prose figure", {"note": "The prose figure was $818181"}, "818181"),
        ("currency word first", {"note": "USD forty-two"}, "forty-two"),
        ("currency word colon", {"memo": "dollars: forty-two"}, "forty-two"),
        ("redacted flag keeps amount", {"redacted": True, "amount": 919191, "note": "dollars: forty-two"}, "919191"),
    )
    for label, payload, marker in leaks:
        cleaned, refuse_leak = prepare_shared_event(
            {
                "type": "agent.heartbeat",
                "source": "cli",
                "actor": "operator",
                "sensitivity": "internal",
                "payload": payload,
            }
        )
        dumped = json.dumps(cleaned)
        check(refuse_leak is None and marker not in dumped and "redacted" not in cleaned["payload"], f"cli drops {label}")
    derived, _ = prepare_shared_event(
        {
            "type": "agent.heartbeat",
            "source": "cli",
            "actor": "operator",
            "payload": {"cash": 636363, "cash_buffer_status": "low", "note": "USD forty-two"},
        }
    )
    check(derived["payload"] == {"cash_buffer_status": "low"}, "derived fact kept, raw cash dropped")
    state_event, state_refuse = prepare_shared_event(
        {
            "type": "project.state_changed",
            "source": "product-state.py",
            "actor": "operator",
            "priority": "P3",
            "project_id": "hive-os",
            "sensitivity": "internal",
            "payload": {
                "project_id": "hive-os",
                "from": {"lifecycle": "development", "agent_state": "WORKING"},
                "to": {"lifecycle": "testing", "agent_state": "WORKING", "cash": 50},
            },
        }
    )
    check(state_refuse is None and state_event["payload"]["to"] == {"lifecycle": "testing", "agent_state": "WORKING"}, "state delta kept")
    check("50" not in json.dumps(state_event), "cash inside a delta dropped")
    receipt_dir = Path(tempfile.mkdtemp())
    receipt_store = receipt_dir / "os-receipts.jsonl"
    publish_event = {
        "type": "content.published",
        "source": "cli",
        "actor": "operator",
        "payload": {"ok": True, "amount": 919191},
        "receipt": {
            "authorized_by": "Evens",
            "executed_by": "operator",
            "target": "post-1",
            "timestamp": "2026-09-25T01:20:00Z",
            "result_evidence": "ledger row 919191",
        },
    }
    published, publish_ok = prepare_shared_event(publish_event, receipt_path=receipt_store)
    published_dump = json.dumps(published)
    check(publish_ok is None and "919191" not in published_dump, "receipt amount stays off the bus")
    check(published["payload"] == {"ok": True}, "publish bus keeps ok only")
    check("receipt" not in published and published.get("receipt_id"), "bus keeps receipt id only")
    stored = receipt_store.read_text(encoding="utf-8") if receipt_store.is_file() else ""
    check("919191" in stored and "ledger row 919191" in stored, "exact amount stays in scoped receipt store")
    again, again_ok = prepare_shared_event(published, receipt_path=receipt_store)
    check(again_ok is None and again.get("receipt_id") == published.get("receipt_id"), "second prepare keeps the committed receipt")
    check("919191" not in json.dumps(again), "second prepare still leaves the amount off the bus")
    check(stored.count("919191") == receipt_store.read_text(encoding="utf-8").count("919191"), "second prepare does not duplicate the receipt")
    incomplete_store = receipt_dir / "incomplete.jsonl"
    _, refuse_pub = prepare_shared_event(
        {"type": "content.published", "payload": {"ok": True}},
        receipt_path=incomplete_store,
    )
    check(refuse_pub is not None and not incomplete_store.exists(), "publish without receipt refused")
    _, refuse_done = prepare_shared_event(
        {
            "type": "content.published",
            "payload": {"ok": True},
            "receipt": {
                "authorized_by": "Evens",
                "executed_by": "Publishing Engine",
                "target": "post-1",
                "timestamp": "2026-09-25T01:20:00Z",
                "result_evidence": "done",
            },
        },
        receipt_path=incomplete_store,
    )
    check(refuse_done is not None and "not a receipt" in (refuse_done or ""), "publish done is not a receipt")
    check(not incomplete_store.exists(), "incomplete receipt is not stored")

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
