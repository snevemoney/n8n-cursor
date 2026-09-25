#!/usr/bin/env python3
"""Typed hive state.json — filter one key into the model. Do not dump the store.

Usage:
  python3 scripts/hive/hive-state.py get --key last_run
  python3 scripts/hive/hive-state.py get --key jobs --status yellow
  python3 scripts/hive/hive-state.py get --key profile
  python3 scripts/hive/hive-state.py get --key product_factory
  python3 scripts/hive/hive-state.py set-job --id coverage-loop --name coverage-loop --status working --desk parent
  python3 scripts/hive/hive-state.py log-run --job coverage-loop --desk parent --done-check "..." --stop-kind metric
  python3 scripts/hive/hive-state.py receipt --tokens unknown --duration "12m" --correctness untested

IDs are monotonic: deleting a job row does not reset next_run_id.
Do not migrate this store to n8n Data tables.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
STATE = ROOT / "docs/hive/outer-heaven/.hive/state.json"
ALLOWED = (
    "schema_version",
    "ids",
    "profile",
    "jobs",
    "last_run",
    "product_factory",
    "post_fix_cohort",
)
# Historical observe-pane rows use lowercase "done". New terminal writes are uppercase
# and only land through transition_job. Do not treat the lowercase rows as a cohort.
JOB_STATUSES = (
    "working",
    "yellow",
    "done",
    "IMPLEMENTED",
    "BEHAVIOR_PASS",
    "RECEIPT_UNPROVEN",
    "VERIFYING",
    "BLOCKED",
    "PARTIAL",
    "DONE",
    "PASS",
    "VERIFIED",
    "LIVE",
    "SHIPPED",
    "CLOSED",
)
CORRECTNESS = ("pass", "fail", "untested")
EVIDENCE_CLASSES = (
    "PRESENCE",
    "DIFF",
    "STATIC",
    "TEST",
    "INTEGRATION",
    "RUNTIME",
    "SURFACE",
    "EXTERNAL_RECEIPT",
    "OUTCOME",
)
TERMINAL_WORDS = frozenset({"DONE", "PASS", "VERIFIED", "LIVE", "SHIPPED", "CLOSED"})
NON_TERMINAL_STATES = frozenset(
    {
        "IMPLEMENTED",
        "BEHAVIOR_PASS",
        "RECEIPT_UNPROVEN",
        "VERIFYING",
        "BLOCKED",
        "PARTIAL",
        "working",
        "yellow",
    }
)
_NOT_A_SURFACE = frozenset({"archive", "replay", "mock"})
_BEHAVIOR = frozenset({"TEST", "RUNTIME", "INTEGRATION"})
# Immutable floors. Do not add these together. Do not compare them to cohort counters.
HISTORICAL_FLOORS = {
    "unsupported_completion_sessions": 39,
    "artifact_only_rows": 34,
    "divergence_instances": 18,
}
COHORT_METRICS = (
    "unsupported_terminal_escape_rate",
    "missing_receipt_rate",
    "unresolvable_receipt_rate",
    "stale_apply_rate",
    "duplicate_apply_rate",
    "conflict_rate",
    "propagation_latency",
    "manual_Evens_bus_count",
)


def load(path: Path | None = None) -> dict:
    target = path or STATE
    if not target.is_file():
        raise SystemExit(f"missing {target}")
    data = json.loads(target.read_text(encoding="utf-8"))
    if not data.get("ids", {}).get("monotonic"):
        raise SystemExit("ids.monotonic must stay true (delete ≠ reset)")
    return data


def _terminal_token(status: str) -> str | None:
    """The terminal word a label would write, including a non-closing PASS."""
    raw = str(status or "").strip()
    if not raw:
        return None
    upper = raw.upper()
    if upper in TERMINAL_WORDS:
        return upper
    if raw.lower() == "done":
        return "DONE"
    return None


def _closes_work_flag(value: object) -> bool:
    """Only an explicit false keeps PASS from being a close. The string "false" counts."""
    if isinstance(value, str):
        return value.strip().lower() not in {"false", "0", "no"}
    return bool(value)


def _is_terminal_word(status: str, *, closes_work: bool = True) -> str | None:
    token = _terminal_token(status)
    if token == "PASS" and not _closes_work_flag(closes_work):
        return None
    return token


def _floors(floors: dict | None = None) -> dict:
    raw = dict(floors or HISTORICAL_FLOORS)
    if "total" in raw or "sum" in raw:
        raise SystemExit("historical floors stay immutable and must not be summed")
    return raw


def _zero_counter(metric: str) -> dict:
    if metric == "propagation_latency":
        return {"samples": 0, "total_ms": 0}
    if metric == "manual_Evens_bus_count":
        return {"count": 0}
    if metric == "unsupported_terminal_escape_rate":
        return {"escapes": 0, "attempts": 0}
    if metric == "missing_receipt_rate":
        return {"missing": 0, "active_closes": 0}
    if metric == "unresolvable_receipt_rate":
        return {"unresolvable": 0, "receipts": 0}
    if metric == "stale_apply_rate":
        return {"stale": 0, "applies": 0}
    if metric == "duplicate_apply_rate":
        return {"duplicates": 0, "applies": 0}
    if metric == "conflict_rate":
        return {"conflicts": 0, "applies": 0}
    raise SystemExit(f"unknown cohort metric: {metric}")


def arm_cohort(data: dict) -> dict:
    """Post-fix counters only. Historical floors are stored beside them and never added."""
    floors = _floors()
    counters = {metric: _zero_counter(metric) for metric in COHORT_METRICS}
    existing = data.get("post_fix_cohort")
    if isinstance(existing, dict) and isinstance(existing.get("counters"), dict):
        for metric in COHORT_METRICS:
            found = existing["counters"].get(metric)
            if isinstance(found, dict):
                base = _zero_counter(metric)
                base.update({k: found.get(k, base[k]) for k in base})
                counters[metric] = base
    data["post_fix_cohort"] = {
        "armed": True,
        "adopted": False,
        "compare_to_historical_floors": False,
        "historical_floors": floors,
        "counters": counters,
    }
    return data["post_fix_cohort"]


def bump_cohort(data: dict, metric: str, **fields: int) -> None:
    if metric not in COHORT_METRICS:
        raise SystemExit(f"unknown cohort metric: {metric}")
    arm_cohort(data)
    row = data["post_fix_cohort"]["counters"][metric]
    for key, amount in fields.items():
        if key not in row:
            raise SystemExit(f"{metric} has no counter {key}")
        row[key] = int(row.get(key) or 0) + int(amount)


def _evidence_class(item: dict) -> str:
    raw = str(item.get("class") or item.get("evidence_class") or "").upper()
    if raw == "PASS_DIFF":
        return "DIFF"
    return raw


def _fresh(item: dict, environment: dict | None) -> bool:
    """Bound evidence matches the environment. An empty environment does not vouch for it."""
    if item.get("stale") is True:
        return False
    if environment is None:
        return True
    if not isinstance(environment, dict) or not any(key in environment for key in ("runtime", "config", "version")):
        return False
    for key in ("runtime", "config", "version"):
        if key not in environment:
            continue
        if key not in item or item.get(key) != environment.get(key):
            return False
    return True


def _real_surface(item: dict) -> bool:
    kind = str(item.get("kind") or item.get("mode") or item.get("source") or "").lower()
    return kind not in _NOT_A_SURFACE


def present_evidence(evidence: list | None, environment: dict | None) -> tuple[set[str], bool]:
    present: set[str] = set()
    stale = False
    for item in evidence or []:
        if not isinstance(item, dict):
            continue
        cls = _evidence_class(item)
        if cls not in EVIDENCE_CLASSES:
            continue
        if not _fresh(item, environment):
            stale = True
            continue
        if cls == "SURFACE" and not _real_surface(item):
            continue
        present.add(cls)
    return present, stale


def required_classes(target: str, declared: list | None) -> tuple[str, ...]:
    """Caller-declared classes are the requirement. The default pair is not added on top."""
    if declared:
        return tuple(str(item).upper() for item in declared)
    if target in TERMINAL_WORDS:
        return ("RUNTIME", "SURFACE")
    return ("RUNTIME", "SURFACE")


def _effective_required(declared: list | None, stored: list | None) -> list | None:
    """A later call cannot drop a class the job already declared. It also cannot invent one."""

    def norm(items: list | None) -> list[str]:
        if not items:
            return []
        return [str(item).upper() for item in items]

    declared_norm = norm(declared)
    stored_norm = norm(stored)
    if declared_norm and stored_norm:
        merged: list[str] = []
        for item in [*stored_norm, *declared_norm]:
            if item not in merged:
                merged.append(item)
        return merged
    if declared_norm:
        return declared_norm
    if stored_norm:
        return stored_norm
    return None


def independent_verifier(builder: str, verifier: dict | None) -> bool:
    if not isinstance(verifier, dict):
        return False
    actor = str(verifier.get("actor") or "").strip()
    if not actor or actor.upper() == "UNKNOWN":
        return False
    if actor.casefold() == str(builder or "").strip().casefold():
        return False
    if str(verifier.get("role") or "").lower() == "builder":
        return False
    return True


def _materially_active(session: dict | None) -> bool:
    if not isinstance(session, dict):
        return False
    if session.get("materially_active") is True:
        return True
    return bool(session.get("tools") or session.get("actions") or session.get("artifacts"))


def _receipt_ok(receipt: dict | None) -> bool:
    if not isinstance(receipt, dict):
        return False
    if receipt.get("completeness") not in ("FULL", "PARTIAL", "UNAVAILABLE"):
        return False
    if not receipt.get("receipt_id"):
        return False
    errors = receipt.get("validation_errors") or []
    return not errors


def hold_state(
    present: set[str],
    required: tuple[str, ...],
    *,
    stale: bool,
    self_verify: bool,
    active_without_receipt: bool,
) -> str:
    req = set(required)
    if not present and not stale and not self_verify:
        return "IMPLEMENTED"
    if active_without_receipt and req <= present and not stale and not self_verify:
        return "RECEIPT_UNPROVEN"
    if stale or self_verify:
        return "VERIFYING"
    behavior = present & _BEHAVIOR
    if behavior and "SURFACE" in req and "SURFACE" not in present:
        return "BEHAVIOR_PASS"
    if "EXTERNAL_RECEIPT" in req and "EXTERNAL_RECEIPT" not in present and (behavior or "SURFACE" in present):
        return "RECEIPT_UNPROVEN"
    if present & req and not req <= present:
        return "PARTIAL"
    if not present:
        return "IMPLEMENTED"
    return "PARTIAL"


def _permit(job_id: str, target: str, evidence: list | None, verifier: dict | None) -> str:
    blob = json.dumps(
        {"job_id": job_id, "target": target, "evidence": evidence or [], "verifier": verifier or {}},
        sort_keys=True,
        default=str,
    )
    return hashlib.sha256(blob.encode()).hexdigest()[:32]


def decide_terminal(
    target: str,
    *,
    builder: str,
    verifier: dict | None = None,
    evidence: list | None = None,
    environment: dict | None = None,
    required: list | None = None,
    closes_work: bool = True,
    session: dict | None = None,
    receipt: dict | None = None,
    job_id: str = "",
) -> dict[str, Any]:
    """Pure guard. A builder cannot verify its own job. DIFF does not prove a surface."""
    word = _is_terminal_word(target, closes_work=closes_work)
    if word is None:
        state = target if target in NON_TERMINAL_STATES else "BLOCKED"
        return {"permitted": False, "state": state, "reason": "not a closing terminal", "permit": None, "stale": False}
    needed = required_classes(word, required)
    present, stale = present_evidence(evidence, environment)
    verifier_ok = independent_verifier(builder, verifier)
    named_self = isinstance(verifier, dict) and bool(str(verifier.get("actor") or "")) and not verifier_ok
    classes_ok = set(needed) <= present and not (word == "LIVE" and "SURFACE" not in present)
    self_verify = named_self or (classes_ok and not verifier_ok and not stale)
    active = _materially_active(session)
    receipt_ok = _receipt_ok(receipt)
    active_without_receipt = active and not receipt_ok
    permitted = classes_ok and verifier_ok and not stale and not active_without_receipt
    if permitted:
        return {
            "permitted": True,
            "state": word,
            "reason": "evidence and independent verifier",
            "permit": _permit(job_id, word, evidence, verifier),
            "stale": False,
        }
    state = hold_state(
        present,
        needed,
        stale=stale,
        self_verify=self_verify,
        active_without_receipt=active_without_receipt,
    )
    if state not in NON_TERMINAL_STATES:
        state = "BLOCKED"
    reason = "missing proof"
    if self_verify and classes_ok and not stale:
        reason = "builder cannot verify its own job"
    elif stale:
        reason = "evidence stale"
    elif active_without_receipt and classes_ok:
        reason = "materially active session has no receipt"
    elif "SURFACE" in needed and "SURFACE" not in present and "DIFF" in present:
        reason = "diff does not satisfy runtime and surface"
    return {"permitted": False, "state": state, "reason": reason, "permit": None, "stale": stale}


def _terminal_change_allowed(job: dict, previous: str | None) -> bool:
    status = str(job.get("status") or "")
    # Exact text only. A historical "done" label is not proof of "DONE".
    if previous == status:
        return True
    token = _terminal_token(status)
    if token is None:
        return True
    closes = _closes_work_flag(job.get("closes_work", True))
    word = _is_terminal_word(status, closes_work=closes)
    # save() is not a second writer. A non-closing PASS is still the word PASS.
    if word is None:
        return False
    decision = decide_terminal(
        word,
        builder=str(job.get("builder") or ""),
        verifier=job.get("verifier") if isinstance(job.get("verifier"), dict) else None,
        evidence=job.get("evidence") if isinstance(job.get("evidence"), list) else None,
        environment=job.get("environment") if isinstance(job.get("environment"), dict) else None,
        required=job.get("required_evidence") if isinstance(job.get("required_evidence"), list) else None,
        closes_work=closes,
        session=job.get("session") if isinstance(job.get("session"), dict) else None,
        receipt=job.get("receipt") if isinstance(job.get("receipt"), dict) else None,
        job_id=str(job.get("id") or ""),
    )
    return bool(decision["permitted"] and job.get("proofPermit") == decision["permit"])


def save(data: dict, path: Path | None = None) -> None:
    target = path or STATE
    previous: dict[str, dict] = {}
    if target.is_file():
        try:
            old = json.loads(target.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            old = {}
        for row in old.get("jobs") or []:
            if isinstance(row, dict) and row.get("id"):
                previous[str(row["id"])] = row
    blocked: list[str] = []
    for row in data.get("jobs") or []:
        if not isinstance(row, dict):
            continue
        job_id = str(row.get("id") or "")
        prior = previous.get(job_id)
        _demote_invalid_close(row, prior if isinstance(prior, dict) else None)
        prior_status = str(prior.get("status") or "") if isinstance(prior, dict) else None
        if not _terminal_change_allowed(row, prior_status):
            blocked.append(job_id or "?")
    if blocked:
        raise SystemExit(f"terminal status without canonical proof: {', '.join(blocked)}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def today() -> str:
    return date.today().isoformat()


def cmd_get(args: argparse.Namespace) -> int:
    if args.key not in ALLOWED:
        print(
            f"refuse: key must be one of {', '.join(ALLOWED)} — do not dump the store",
            file=sys.stderr,
        )
        return 2
    data = load()
    slice_ = data.get(args.key)
    if args.key == "jobs":
        rows = list(slice_ or [])
        if args.status:
            rows = [r for r in rows if r.get("status") == args.status]
        if args.job:
            rows = [r for r in rows if r.get("id") == args.job or r.get("name") == args.job]
        slice_ = rows
    print(json.dumps(slice_, indent=2))
    return 0


def _upsert_job(data: dict, row: dict) -> dict:
    jobs = list(data.get("jobs") or [])
    for i, existing in enumerate(jobs):
        if existing.get("id") == row.get("id"):
            merged = dict(existing)
            merged.update(row)
            jobs[i] = merged
            data["jobs"] = jobs
            return merged
    jobs.append(row)
    data["jobs"] = jobs
    return row


def transition_job(
    job_id: str,
    target: str,
    *,
    actor: str = "builder",
    builder: str | None = None,
    verifier: dict | None = None,
    evidence: list | None = None,
    environment: dict | None = None,
    required: list | None = None,
    closes_work: bool = True,
    session: dict | None = None,
    receipt: dict | None = None,
    name: str | None = None,
    desk: str | None = None,
    note: str | None = None,
    state_path: Path | None = None,
) -> dict[str, Any]:
    """Canonical job terminal writer. Desk labels call this; they do not set status themselves."""
    data = load(state_path)
    who = builder if builder is not None else actor
    existing = next((row for row in data.get("jobs") or [] if isinstance(row, dict) and row.get("id") == job_id), None)
    stored_required = (
        existing.get("required_evidence")
        if isinstance(existing, dict) and isinstance(existing.get("required_evidence"), list)
        else None
    )
    effective_required = _effective_required(required, stored_required)
    decision = decide_terminal(
        target,
        builder=who,
        verifier=verifier,
        evidence=evidence,
        environment=environment,
        required=effective_required,
        closes_work=closes_work,
        session=session,
        receipt=receipt,
        job_id=job_id,
    )
    word = _is_terminal_word(target, closes_work=closes_work)
    token = _terminal_token(target)
    if not decision["permitted"] and _close_still_proven(existing):
        kept = existing if isinstance(existing, dict) else {}
        return {
            "permitted": False,
            "state": kept.get("status"),
            "reason": decision.get("reason") or "narrower declaration does not replace a proven close",
            "permit": kept.get("proofPermit"),
            "stale": False,
            "job": kept,
        }
    bump_cohort(
        data,
        "unsupported_terminal_escape_rate",
        attempts=1,
        escapes=0 if decision["permitted"] or token is None else 1,
    )
    if _materially_active(session):
        bump_cohort(
            data,
            "missing_receipt_rate",
            active_closes=1,
            missing=0 if _receipt_ok(receipt) else 1,
        )
    if isinstance(receipt, dict) and (receipt.get("validation_errors") or []):
        bump_cohort(data, "unresolvable_receipt_rate", receipts=1, unresolvable=1)
    row: dict[str, Any] = {
        "id": job_id,
        "name": name or job_id,
        "status": _persisted_status(target, decision, word),
        "desk": desk or actor,
        "updated": today(),
        "builder": who,
        "closes_work": closes_work,
    }
    if word and decision["permitted"]:
        row["status"] = decision["state"]
        row["proofPermit"] = decision["permit"]
        row["evidence"] = evidence or []
        row["verifier"] = verifier or {}
        if environment is not None:
            row["environment"] = environment
        if session is not None:
            row["session"] = session
        if receipt is not None:
            row["receipt"] = receipt
    justified = list(effective_required) if effective_required is not None else None
    if word and decision["permitted"] and justified is None:
        justified = list(required_classes(word, None))
    if justified is not None:
        row["required_evidence"] = justified
    if note:
        row["note"] = note
    if not decision["permitted"] and word:
        row["terminal_rejected"] = decision["reason"]
    saved = _upsert_job(data, row)
    if not decision["permitted"]:
        saved.pop("proofPermit", None)
    save(data, state_path)
    stored = str(saved.get("status") or "")
    if stored != decision.get("state") or (decision.get("permitted") and not saved.get("proofPermit")):
        decision = {
            "permitted": False,
            "state": stored if stored in NON_TERMINAL_STATES else "BLOCKED",
            "reason": saved.get("terminal_rejected") or decision.get("reason") or "evidence stale",
            "permit": None,
            "stale": True,
        }
    return {**decision, "job": saved}


def apply_desk_label(job_id: str, label: str, **kwargs: Any) -> dict[str, Any]:
    """Legacy desk labels are not a writer. They enter transition_job."""
    return transition_job(job_id, label, **kwargs)


def note_environment(job_id: str, environment: dict, *, state_path: Path | None = None) -> dict[str, Any]:
    """A runtime, config, or version change after verification makes that evidence stale."""
    data = load(state_path)
    job = next((row for row in data.get("jobs") or [] if row.get("id") == job_id), None)
    if not isinstance(job, dict):
        raise SystemExit(f"unknown job: {job_id}")
    evidence = []
    for item in job.get("evidence") or []:
        if not isinstance(item, dict):
            continue
        cloned = dict(item)
        if not _fresh(cloned, environment):
            cloned["stale"] = True
        evidence.append(cloned)
    job["evidence"] = evidence
    job["environment"] = environment
    _present, stale = present_evidence(evidence, environment)
    marked_stale = any(isinstance(item, dict) and item.get("stale") is True for item in evidence)
    unbound = _unbound_dimension(evidence, environment)
    token = _terminal_token(str(job.get("status") or ""))
    if (stale or unbound or marked_stale) and token:
        job["status"] = "VERIFYING"
        job.pop("proofPermit", None)
        job["terminal_rejected"] = "evidence stale"
        stale = True
    _upsert_job(data, job)
    save(data, state_path)
    return {"job": job, "stale": stale}


def _demote_invalid_close(job: dict, previous_job: dict | None) -> None:
    """An existing close drops when closes_work turns off or a runtime is attached unbound."""
    if not isinstance(previous_job, dict):
        return
    if _terminal_token(str(job.get("status") or "")) is None:
        return
    if not _closes_work_flag(job.get("closes_work", True)):
        job["status"] = "BLOCKED"
        job.pop("proofPermit", None)
        job["terminal_rejected"] = "not a closing terminal"
        return
    if _added_unbound_dimension(job, previous_job):
        job["status"] = "VERIFYING"
        job.pop("proofPermit", None)
        job["terminal_rejected"] = "evidence stale"
        return
    # Normalize first. "Done", "done", and "PASS " are the same close as the canonical token.
    status = str(job.get("status") or "")
    previous_status = str(previous_job.get("status") or "")
    token = _terminal_token(status)
    if not token or _terminal_token(previous_status) != token:
        return
    if status != previous_status and status == token and not previous_job.get("proofPermit"):
        return
    if status == previous_status and status != token and _untouched_historical(job, previous_job):
        return
    decision = _decision_for_job(job)
    if decision["permitted"] and job.get("proofPermit") == decision["permit"]:
        return
    hold = decision["state"] if decision["state"] in NON_TERMINAL_STATES else "BLOCKED"
    job["status"] = hold
    job.pop("proofPermit", None)
    job["terminal_rejected"] = decision["reason"]


def _untouched_historical(job: dict, previous_job: dict) -> bool:
    """A frozen observe-pane label with no proof and no evidence change is not a new close."""
    if previous_job.get("proofPermit") or job.get("proofPermit"):
        return False
    prev_ev = previous_job.get("evidence") if isinstance(previous_job.get("evidence"), list) else []
    cur_ev = job.get("evidence") if isinstance(job.get("evidence"), list) else []
    return prev_ev == cur_ev


def _close_still_proven(job: dict | None) -> bool:
    """A stored close still matches the classes and permit on the row."""
    if not isinstance(job, dict) or not job.get("proofPermit"):
        return False
    if _terminal_token(str(job.get("status") or "")) is None:
        return False
    decision = _decision_for_job(job)
    return bool(decision["permitted"] and job.get("proofPermit") == decision["permit"])


def _decision_for_job(job: dict) -> dict:
    status = str(job.get("status") or "")
    closes = _closes_work_flag(job.get("closes_work", True))
    word = _is_terminal_word(status, closes_work=closes) or status
    required = job.get("required_evidence") if isinstance(job.get("required_evidence"), list) else None
    return decide_terminal(
        word,
        builder=str(job.get("builder") or ""),
        verifier=job.get("verifier") if isinstance(job.get("verifier"), dict) else None,
        evidence=job.get("evidence") if isinstance(job.get("evidence"), list) else None,
        environment=job.get("environment") if isinstance(job.get("environment"), dict) else None,
        required=required,
        closes_work=closes,
        session=job.get("session") if isinstance(job.get("session"), dict) else None,
        receipt=job.get("receipt") if isinstance(job.get("receipt"), dict) else None,
        job_id=str(job.get("id") or ""),
    )


def _dimension_bound(item: dict, key: str, value: object) -> bool:
    """A catalog class with the same value is a binding. A note that mentions it is not."""
    if not isinstance(item, dict) or item.get("stale") is True:
        return False
    if key not in item or item.get(key) != value:
        return False
    return _evidence_class(item) in EVIDENCE_CLASSES


def _added_unbound_dimension(job: dict, previous_job: dict) -> bool:
    env = job.get("environment") if isinstance(job.get("environment"), dict) else None
    if not env:
        return False
    prev_env = previous_job.get("environment") if isinstance(previous_job.get("environment"), dict) else {}
    added = [key for key in ("runtime", "config", "version") if key in env and env.get(key) != prev_env.get(key)]
    if not added:
        return False
    evidence = job.get("evidence") if isinstance(job.get("evidence"), list) else []
    items = [item for item in evidence if isinstance(item, dict)]
    for key in added:
        if not any(_dimension_bound(item, key, env.get(key)) for item in items):
            return True
    return False


def _unbound_dimension(evidence: list, environment: dict | None) -> bool:
    """A new runtime, config, or version with nothing bound to it cannot keep a close."""
    if not isinstance(environment, dict):
        return False
    dims = [key for key in ("runtime", "config", "version") if key in environment]
    if not dims:
        return False
    items = [item for item in evidence if isinstance(item, dict)]
    if not items:
        return True
    return any(not any(_dimension_bound(item, key, environment.get(key)) for item in items) for key in dims)


def _persisted_status(target: str, decision: dict, word: str | None) -> str:
    """A terminal token is stored only when the close itself was permitted."""
    if word and decision.get("permitted"):
        return str(decision["state"])
    if _terminal_token(target):
        hold = decision.get("state")
        if hold in NON_TERMINAL_STATES:
            return str(hold)
        return "BLOCKED"
    if target in NON_TERMINAL_STATES:
        return target
    hold = decision.get("state")
    if hold in NON_TERMINAL_STATES:
        return str(hold)
    return "BLOCKED"


def guard_outcome_payload(payload: dict, *, state_path: Path | None = None) -> dict:
    """Register callers cannot stamp done ahead of the canonical writer."""
    out = dict(payload)
    target = str(out.get("status") or "")
    closes = _closes_work_flag(out.get("closes_work", True))
    word = _is_terminal_word(target, closes_work=closes)
    if _terminal_token(target) and word is None:
        out["status"] = "BLOCKED"
        out.pop("proofPermit", None)
        out["terminal_rejected"] = "not a closing terminal"
        out["guard"] = "hive-state.transition_job"
        return out
    if word is None:
        return out
    evidence = out.get("evidence") if isinstance(out.get("evidence"), list) else []
    verifier = out.get("verifier") if isinstance(out.get("verifier"), dict) else None
    decision = transition_job(
        str(out.get("job_id") or out.get("correlationId") or out.get("jobType") or "outcome"),
        word,
        actor=str(out.get("source") or "register"),
        builder=str(out.get("builder") or out.get("source") or "builder"),
        verifier=verifier,
        evidence=evidence,
        environment=out.get("environment") if isinstance(out.get("environment"), dict) else None,
        required=out.get("required_evidence") if isinstance(out.get("required_evidence"), list) else None,
        closes_work=closes,
        session=out.get("session") if isinstance(out.get("session"), dict) else None,
        receipt=out.get("receipt") if isinstance(out.get("receipt"), dict) else None,
        state_path=state_path,
    )
    out["status"] = str(decision["job"].get("status") or decision["state"]) if isinstance(decision.get("job"), dict) else decision["state"]
    stored_permit = decision["job"].get("proofPermit") if isinstance(decision.get("job"), dict) else None
    if decision["permitted"] or stored_permit:
        if stored_permit or decision.get("permit"):
            out["proofPermit"] = stored_permit or decision.get("permit")
        out.pop("terminal_rejected", None)
        out["guard"] = "hive-state.transition_job"
    else:
        out.pop("proofPermit", None)
        out["terminal_rejected"] = decision["reason"]
        out["guard"] = "hive-state.transition_job"
    return out


def record_owed(
    job_id: str,
    *,
    owner: str,
    expected_artifact: str,
    wake_condition: str,
    stall_timeout: str,
    note: str,
    desk: str = "forge",
    state_path: Path | None = None,
) -> dict:
    """Owed artifact rides the job row. It is not a reminder left for Evens."""
    data = load(state_path)
    row = {
        "id": job_id,
        "name": job_id,
        "status": "BLOCKED",
        "desk": desk,
        "updated": today(),
        "owner": owner,
        "expected_artifact": expected_artifact,
        "wake_condition": wake_condition,
        "stall_timeout": stall_timeout,
        "note": note,
    }
    saved = _upsert_job(data, row)
    save(data, state_path)
    return saved


def cmd_set_job(args: argparse.Namespace) -> int:
    if args.status not in JOB_STATUSES:
        print(f"refuse: status must be {JOB_STATUSES}", file=sys.stderr)
        return 2
    word = _is_terminal_word(args.status, closes_work=True)
    if word or str(args.status).lower() == "done":
        evidence = json.loads(args.evidence) if args.evidence else []
        verifier = json.loads(args.verifier) if args.verifier else None
        environment = json.loads(args.environment) if args.environment else None
        receipt = json.loads(args.receipt) if args.receipt else None
        session = json.loads(args.session) if args.session else None
        required = json.loads(args.required) if args.required else None
        decision = transition_job(
            args.id,
            word or args.status,
            actor=args.desk,
            builder=args.builder or args.desk,
            verifier=verifier,
            evidence=evidence,
            environment=environment,
            required=required,
            session=session,
            receipt=receipt,
            name=args.name,
            desk=args.desk,
            note=args.note,
        )
        print(json.dumps({k: v for k, v in decision.items() if k != "job"}, indent=2))
        print(json.dumps(decision["job"], indent=2))
        return 0 if decision["permitted"] else 2
    data = load()
    row = {
        "id": args.id,
        "name": args.name or args.id,
        "status": args.status,
        "desk": args.desk,
        "updated": today(),
    }
    if args.note:
        row["note"] = args.note
    saved = _upsert_job(data, row)
    save(data)
    print(json.dumps(saved, indent=2))
    return 0


def cmd_log_run(args: argparse.Namespace) -> int:
    data = load()
    ids = data.setdefault("ids", {"monotonic": True, "next_run_id": 1})
    ids["monotonic"] = True
    run_id = int(ids.get("next_run_id") or 1)
    entry = {
        "id": run_id,
        "job": args.job,
        "desk": args.desk,
        "at": today(),
        "done_check": args.done_check,
        "stop_kind": args.stop_kind,
    }
    log = list(data.get("log") or [])
    log.append(entry)
    data["log"] = log
    last = {
        "id": run_id,
        "job": args.job,
        "desk": args.desk,
        "at": today(),
        "done_check": args.done_check,
        "stop_kind": args.stop_kind,
        "token_receipt": (data.get("last_run") or {}).get("token_receipt")
        or {"tokens": None, "duration": None, "correctness": "untested"},
    }
    data["last_run"] = last
    ids["next_run_id"] = run_id + 1
    save(data)
    print(json.dumps(last, indent=2))
    return 0


def cmd_receipt(args: argparse.Namespace) -> int:
    if args.correctness not in CORRECTNESS:
        print(f"refuse: correctness must be {CORRECTNESS}", file=sys.stderr)
        return 2
    data = load()
    last = data.setdefault("last_run", {})
    tokens: int | str | None = args.tokens
    if tokens is not None and str(tokens).isdigit():
        tokens = int(tokens)
    last["token_receipt"] = {
        "tokens": tokens,
        "duration": args.duration,
        "correctness": args.correctness,
    }
    data["last_run"] = last
    save(data)
    print(json.dumps(last["token_receipt"], indent=2))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Filter one hive-state key. Never dump.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("get", help="Print one typed key (not the whole store)")
    g.add_argument("--key", required=True, choices=ALLOWED)
    g.add_argument("--status", choices=JOB_STATUSES)
    g.add_argument("--job")

    s = sub.add_parser("set-job", help="Upsert one observe-pane job row")
    s.add_argument("--id", required=True)
    s.add_argument("--name")
    s.add_argument("--status", required=True, choices=JOB_STATUSES)
    s.add_argument("--desk", required=True)
    s.add_argument("--note")
    s.add_argument("--builder", help="Desk that built the job. Cannot also be the verifier.")
    s.add_argument("--evidence", help="JSON list of evidence records")
    s.add_argument("--verifier", help="JSON verifier {actor, role}")
    s.add_argument("--environment", help="JSON runtime/config/version binding")
    s.add_argument("--required", help="JSON list of required evidence classes")
    s.add_argument("--session", help="JSON session activity")
    s.add_argument("--receipt", help="JSON session receipt")

    lg = sub.add_parser("log-run", help="Append last-run; bump monotonic id")
    lg.add_argument("--job", required=True)
    lg.add_argument("--desk", required=True)
    lg.add_argument("--done-check", required=True)
    lg.add_argument("--stop-kind", default="metric")

    r = sub.add_parser("receipt", help="Write token-receipt onto last_run")
    r.add_argument("--tokens", default="unknown")
    r.add_argument("--duration", required=True)
    r.add_argument("--correctness", required=True, choices=CORRECTNESS)

    args = ap.parse_args()
    if args.cmd == "get":
        return cmd_get(args)
    if args.cmd == "set-job":
        return cmd_set_job(args)
    if args.cmd == "log-run":
        return cmd_log_run(args)
    if args.cmd == "receipt":
        return cmd_receipt(args)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
