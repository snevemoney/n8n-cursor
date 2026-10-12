#!/usr/bin/env python3
"""Wave A contracts. No Face. No live hive. No fence imports."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
STATUSES = frozenset({"PASS", "FAIL", "UNPROVEN", "DEGRADED", "UNAVAILABLE"})
LAYERS = frozenset({"experience", "interop", "session", "harness", "kpi"})
CONTINUATION = frozenset({"native_session", "new_handoff", "unavailable"})
FRESHNESS = frozenset({"fresh", "stale", "unknown"})
HANDOFF_CHAR_CAP = 4000
SCOREBOARD_STALE_SEC = 15 * 60

SESSION_IDS = (
    "conversation",
    "continuity",
    "stop",
    "voice",
    "memory_read",
    "memory_write",
    "eyes",
    "watch",
    "file_followup",
    "hard_step",
    "provider_failure",
    "cold_restart",
    "soak",
    "openclaw",
    "vault_lookup",
    "vault_research",
    "mac_computer",
    "vps_shell",
    "chatgpt_sessions",
    "chatgpt_job_start",
    "claude_sessions",
    "claude_code_worker",
    "codex_sessions",
    "codex_worker",
    "cursor_worker",
    "grok_worker",
)

HARNESS_ONLY = frozenset(
    {
        "chatgpt_job_start",
        "claude_code_worker",
        "codex_worker",
        "cursor_worker",
        "grok_worker",
    }
)
SESSION_ONLY = frozenset(
    {
        "chatgpt_sessions",
        "claude_sessions",
        "codex_sessions",
    }
)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(raw: str | None) -> datetime | None:
    text = (raw or "").strip()
    if not text:
        return None
    try:
        return datetime.strptime(text, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def fingerprint(text: str) -> str:
    return hashlib.sha256((text or "").encode("utf-8")).hexdigest()[:16]


def freshness_status(
    *,
    source_mtime: str | None,
    indexed_at: str | None,
    stale_after_sec: int | None = 86400,
    now: datetime | None = None,
) -> str:
    """Indexed copy older than the source, or past stale_after, is stale."""
    src = parse_iso(source_mtime)
    idx = parse_iso(indexed_at)
    if src is None or idx is None:
        return "unknown"
    clock = now or datetime.now(timezone.utc)
    if idx < src:
        return "stale"
    limit = 86400 if stale_after_sec is None else int(stale_after_sec)
    if (clock - src).total_seconds() > limit:
        return "stale"
    return "fresh"


def continuation_available(mode: str) -> bool:
    """True only when Jarvis knows an executable resume path."""
    return mode in {"native_session", "new_handoff"}


def continuation_honest(*, mode: str, available: bool, claimed_native: bool) -> bool:
    """Historical file is not a native resume."""
    if mode not in CONTINUATION:
        return False
    if claimed_native and mode != "native_session":
        return False
    if available != continuation_available(mode):
        return False
    if mode == "unavailable" and available:
        return False
    return True


def session_not_harness(row_id: str, layer: str, status: str) -> bool:
    """9A session-read must never mark a 9B worker PASS."""
    if row_id in SESSION_ONLY and layer == "harness":
        return False
    if row_id in HARNESS_ONLY and layer == "session" and status == "PASS":
        return False
    if row_id in SESSION_ONLY and status == "PASS" and layer == "harness":
        return False
    return True


def worker_pass_from_session_read(row_id: str, layer: str, status: str, probe: str) -> bool:
    """True when this row is an illegal 9A-as-9B PASS."""
    if status != "PASS":
        return False
    if row_id not in HARNESS_ONLY:
        return False
    probe_l = (probe or "").lower()
    return "session" in probe_l or "history" in probe_l or "read" in probe_l


def scoreboard_row_stale(checked_at: str | None, *, now: datetime | None = None, ttl_sec: int = SCOREBOARD_STALE_SEC) -> bool:
    when = parse_iso(checked_at)
    if when is None:
        return True
    clock = now or datetime.now(timezone.utc)
    return (clock - when).total_seconds() > ttl_sec


def decay_status(status: str, checked_at: str | None, **kw) -> str:
    if status in {"UNAVAILABLE", "UNPROVEN"}:
        return status
    if scoreboard_row_stale(checked_at, **kw):
        return "UNPROVEN"
    return status


AUTHORITY_RANK = {
    "live_vault": 40,
    "live_obsidian": 40,
    "cursor_live": 20,
    "repo_mirror": 10,
    "stale_session": 5,
    "cached_session": 5,
    "unknown": 0,
}


def resolve_authority(claims: list[dict]) -> dict:
    """Surface conflict. Prefer live vault. Never blend contradictions."""
    rows = [c for c in claims if isinstance(c, dict) and c.get("claim")]
    answers = {str(c.get("claim") or "") for c in rows}
    ranked = sorted(
        rows,
        key=lambda c: AUTHORITY_RANK.get(str(c.get("source") or ""), 0),
        reverse=True,
    )
    winner = ranked[0] if ranked else {}
    conflict = len(answers) > 1
    return {
        "conflict": conflict,
        "chosen": winner.get("claim"),
        "chosen_source": winner.get("source"),
        "surfaced": conflict,
        "blended": False,
        "ok": (not conflict) or (str(winner.get("source") or "") in {"live_vault", "live_obsidian"}),
    }


def handoff_efficient(*, selected: str, whole_transcript: str, required: list[str] | None = None) -> dict:
    """Next worker gets facts, not the whole sitting."""
    body = selected or ""
    dump = whole_transcript or ""
    need = [n for n in (required or []) if n]
    missing = [n for n in need if n not in body]
    bloated = bool(dump) and body.strip() == dump.strip()
    over = len(body) > HANDOFF_CHAR_CAP
    return {
        "ok": not missing and not bloated and not over,
        "chars": len(body),
        "cap": HANDOFF_CHAR_CAP,
        "missing": missing,
        "whole_transcript": bloated,
    }


def silent_state(*, job_status: str, phase: str, turning: bool, spoken: str) -> bool:
    """THINK forever / nothing happened while the job is done."""
    done = job_status != "working"
    if done and phase == "think" and turning:
        return True
    if done and not (spoken or "").strip() and phase == "think":
        return True
    return False


def require_keys(data: dict, keys: tuple[str, ...], label: str) -> list[str]:
    missing = [k for k in keys if k not in data]
    return [f"{label} missing {k}" for k in missing]


def validate_authority_chain(chain: dict | None) -> list[str]:
    need = ("requested_by", "routed_by", "executed_by", "evidence_from", "verified_by")
    if not isinstance(chain, dict):
        return ["authority_chain missing"]
    return require_keys(chain, need, "authority_chain")


def validate_external_session(row: dict) -> list[str]:
    errors: list[str] = []
    if not isinstance(row, dict):
        return ["session is not an object"]
    errors.extend(
        require_keys(
            row,
            (
                "platform",
                "surface",
                "native_session_id",
                "title",
                "source_path",
                "freshness_status",
                "continuation_available",
                "continuation_mode",
                "provenance",
            ),
            "ExternalSession",
        )
    )
    mode = str(row.get("continuation_mode") or "")
    if mode and mode not in CONTINUATION:
        errors.append(f"bad continuation_mode {mode}")
    fresh = str(row.get("freshness_status") or "")
    if fresh and fresh not in FRESHNESS:
        errors.append(f"bad freshness_status {fresh}")
    if not continuation_honest(
        mode=mode or "unavailable",
        available=bool(row.get("continuation_available")),
        claimed_native=mode == "native_session",
    ):
        if mode == "unavailable" and row.get("continuation_available"):
            errors.append("unavailable session cannot be continuable")
        elif row.get("continuation_available") != continuation_available(mode or "unavailable"):
            errors.append("continuation_available does not match continuation_mode")
    computed = freshness_status(
        source_mtime=row.get("source_mtime") if isinstance(row.get("source_mtime"), str) else None,
        indexed_at=row.get("indexed_at") if isinstance(row.get("indexed_at"), str) else None,
    )
    if row.get("source_mtime") and row.get("indexed_at") and row.get("freshness_status") not in {computed, "unknown"}:
        if computed == "stale" and row.get("freshness_status") == "fresh":
            errors.append("freshness_status lies; source is newer or expired")
    return errors


def validate_scoreboard(board: dict) -> list[str]:
    errors: list[str] = []
    if not isinstance(board, dict):
        return ["scoreboard is not an object"]
    errors.extend(require_keys(board, ("schema_version", "checked_at", "rows", "kpis", "defects"), "scoreboard"))
    if board.get("schema_version") != 1:
        errors.append("schema_version must be 1")
    kpis = board.get("kpis") if isinstance(board.get("kpis"), dict) else {}
    for key in ("manual_context_transfers", "handoff_context_efficiency"):
        if key not in kpis:
            errors.append(f"kpis missing {key}")
    rows = board.get("rows") if isinstance(board.get("rows"), list) else []
    seen: set[str] = set()
    for row in rows:
        if not isinstance(row, dict):
            errors.append("row is not an object")
            continue
        rid = str(row.get("id") or "")
        layer = str(row.get("layer") or "")
        status = str(row.get("status") or "")
        if rid in seen:
            errors.append(f"duplicate row {rid}")
        seen.add(rid)
        if status not in STATUSES:
            errors.append(f"{rid} bad status")
        if layer not in LAYERS:
            errors.append(f"{rid} bad layer")
        if worker_pass_from_session_read(rid, layer, status, str(row.get("probe") or "")):
            errors.append(f"{rid} harness PASS from session-read is illegal")
        if rid in SESSION_ONLY and layer != "session":
            errors.append(f"{rid} must be layer session")
        if rid in HARNESS_ONLY and layer != "harness":
            errors.append(f"{rid} must be layer harness")
    return errors


def empty_row(row_id: str, layer: str, *, status: str = "UNPROVEN", reason: str, probe: str) -> dict[str, Any]:
    return {
        "id": row_id,
        "layer": layer,
        "status": status,
        "checked_at": None,
        "n_runs": 0,
        "n_ok": 0,
        "p50_ms": None,
        "p95_ms": None,
        "max_ms": None,
        "reason": reason,
        "probe": probe,
    }


def draft_scoreboard() -> dict:
    """All live rows start UNPROVEN. Vendor job.start is UNAVAILABLE by stack law."""
    rows = [
        empty_row(
            "conversation",
            "experience",
            status="FAIL",
            reason="P0 conversation routed through store",
            probe="face/orb",
        ),
        empty_row("continuity", "experience", reason="50-turn soak not run", probe="face/orb"),
        empty_row("stop", "experience", reason="Bite 3 live prove gated", probe="eval/races.py"),
        empty_row("voice", "experience", reason="TTS live prove gated", probe="face/tts"),
        empty_row("memory_read", "experience", reason="Wave C gated", probe="live_vault"),
        empty_row("memory_write", "experience", reason="Bite 5 + restart gated", probe="live_vault"),
        empty_row("eyes", "experience", reason="Wave C gated", probe="api/eyes"),
        empty_row("watch", "experience", reason="Evens Watch arm HITL", probe="watch/pav"),
        empty_row("file_followup", "experience", reason="Wave C gated", probe="drop"),
        empty_row("hard_step", "experience", reason="Wave C gated", probe="refuse_hard_step"),
        empty_row("provider_failure", "experience", reason="Wave C gated", probe="fault-injection"),
        empty_row("cold_restart", "experience", reason="Evens terminate/start HITL", probe="start.sh"),
        empty_row("soak", "experience", reason="hours soak HITL", probe="bus/growth"),
        empty_row("openclaw", "experience", status="UNAVAILABLE", reason="gateway down until Evens start", probe="127.0.0.1:18789/health"),
        empty_row("vault_lookup", "interop", reason="Wave D not implemented", probe="retrieve.py"),
        empty_row("vault_research", "interop", reason="Wave D not implemented", probe="eval/vault"),
        empty_row("mac_computer", "interop", reason="Watch HITL", probe="mac_act"),
        empty_row("vps_shell", "interop", reason="job abstraction not built", probe="call_vps"),
        empty_row("chatgpt_sessions", "session", reason="9A index not built", probe="chats.py"),
        empty_row("claude_sessions", "session", reason="9A index not built", probe="chats.py"),
        empty_row("codex_sessions", "session", reason="9A index not built", probe="chats.py"),
        empty_row(
            "chatgpt_job_start",
            "harness",
            status="UNAVAILABLE",
            reason="stack law: no ChatGPT desktop/Work install",
            probe="absent",
        ),
        empty_row(
            "claude_code_worker",
            "harness",
            status="UNAVAILABLE",
            reason="stack law: no Claude Code CLI install",
            probe="absent",
        ),
        empty_row(
            "codex_worker",
            "harness",
            status="UNAVAILABLE",
            reason="stack law: no Codex CLI install",
            probe="absent",
        ),
        empty_row("cursor_worker", "harness", reason="9B live Task not certified this wave", probe="cursor Task"),
        empty_row("grok_worker", "harness", reason="9B fleet spawn not certified this wave", probe="hive-spawn-desks"),
    ]
    return {
        "schema_version": 1,
        "checked_at": now_iso(),
        "source": "apps/agent-stack/eval/contracts.py:draft_scoreboard",
        "rows": rows,
        "kpis": {
            "manual_context_transfers": {
                "id": "manual_context_transfers",
                "status": "UNPROVEN",
                "target": 0,
                "observed": None,
                "reason": "cross-surface journeys not run",
            },
            "handoff_context_efficiency": {
                "id": "handoff_context_efficiency",
                "status": "UNPROVEN",
                "target": f"<={HANDOFF_CHAR_CAP} selected chars; not whole transcript",
                "observed": None,
                "reason": "no live handoff measured",
            },
        },
        "defects": {"p0": 1, "p1": 0, "p2": 0, "p3": 0},
    }


def write_draft_scoreboard(path: Path | None = None) -> Path:
    dest = path or (HERE / "scoreboard.draft.json")
    dest.write_text(json.dumps(draft_scoreboard(), indent=2) + "\n", encoding="utf-8")
    return dest


def stamp_row(board: dict, row_id: str, **updates: Any) -> dict:
    """Update one scoreboard row in place. Does not invent worker PASS."""
    rows = board.get("rows") if isinstance(board.get("rows"), list) else []
    for row in rows:
        if isinstance(row, dict) and row.get("id") == row_id:
            row.update(updates)
            break
    return board


def apply_bite3_verifier_stamp(board: dict, *, checked_at: str | None = None) -> dict:
    """Stamp stop + voice from independent Face verifier OBSERVED. Watch stays UNPROVEN."""
    when = checked_at or now_iso()
    # This helper reprojects one historical receipt; refreshing the report
    # must never change the time when its Stop/voice evidence was observed.
    observed_at = "2026-09-13T02:11:19Z"
    status = decay_status("PASS", observed_at, now=parse_iso(when))
    board["checked_at"] = when
    board["source"] = "apps/agent-stack/eval/scoreboard.draft.json#bite3-verifier"
    stamp_row(
        board,
        "stop",
        status=status,
        checked_at=observed_at,
        n_runs=2,
        n_ok=2,
        p50_ms=9,
        p95_ms=9,
        max_ms=9,
        reason=(
            "independent Face verifier PASS 2026-09-13T02:11:19Z "
            "pid 6311 127.0.0.1:4018; mid-synth Stop discarded in-flight TTS "
            "in 8.8ms; cancelled SSE closed; recovery ping job_status=done; "
            "artifacts /tmp/jarvis-bite3-prod-verify/"
        ),
        probe="face/127.0.0.1:4018",
    )
    stamp_row(
        board,
        "voice",
        status=status,
        checked_at=observed_at,
        n_runs=2,
        n_ok=2,
        p50_ms=647,
        p95_ms=1060,
        max_ms=1060,
        reason=(
            "independent Face verifier PASS; current-gen WAV 33836 RIFF/WAVE "
            "(0.647s then recovery 1.060s); stale/missing gen 204; "
            "artifacts /tmp/jarvis-bite3-prod-verify/02-tts-wav.json "
            "+ 05-recovery.json"
        ),
        probe="face/tts",
    )
    stamp_row(
        board,
        "watch",
        status="UNPROVEN",
        checked_at=None,
        n_runs=0,
        n_ok=0,
        p50_ms=None,
        p95_ms=None,
        max_ms=None,
        reason="Evens Watch arm HITL; no live frame_id/ledger/HID stroke",
        probe="watch/pav",
    )
    stamp_row(
        board,
        "mac_computer",
        status="UNPROVEN",
        checked_at=None,
        n_runs=0,
        n_ok=0,
        p50_ms=None,
        p95_ms=None,
        max_ms=None,
        reason="Watch HITL; HID stroke not run",
        probe="mac_act",
    )
    return board


def apply_mac_computer_stamp(board: dict, last: dict | None = None, *, checked_at: str | None = None) -> dict:
    """PASS only when last.json is live 8/8. Dry 8/8 stays UNPROVEN."""
    when = checked_at or now_iso()
    row = last if isinstance(last, dict) else {}
    n_runs = int(row.get("n_runs") or 0)
    n_ok = int(row.get("n_ok") or 0)
    live = bool(row.get("live"))
    artifact = str(row.get("artifact") or "apps/agent-stack/eval/computer/last.json")
    blob = json.dumps(row)
    waiting = "needs-input" in blob
    passed = live and n_runs == 8 and n_ok == 8 and not waiting
    if passed:
        status = "PASS"
        reason = f"live computer plate 8/8; artifact {artifact}"
    elif live and n_runs == 8 and not waiting:
        status = "FAIL"
        reason = f"live computer plate {n_ok}/8; artifact {artifact}"
    else:
        status = "UNPROVEN"
        reason = "Watch HITL; live HID 8/8 not observed"
    board["checked_at"] = when
    board["source"] = "apps/agent-stack/eval/scoreboard.draft.json#mac-computer"
    stamp_row(
        board,
        "mac_computer",
        status=status,
        checked_at=when if status != "UNPROVEN" else None,
        n_runs=n_runs if live else 0,
        n_ok=n_ok if live else 0,
        p50_ms=None,
        p95_ms=None,
        max_ms=None,
        reason=reason,
        probe="eval/computer/last.json",
    )
    return board


def apply_conversation_p0_open(board: dict, *, checked_at: str | None = None) -> dict:
    """Mark conversation as the blocking P0 until live Orb prove. Watch stays UNPROVEN."""
    when = checked_at or now_iso()
    board["checked_at"] = when
    board["source"] = "apps/agent-stack/eval/scoreboard.draft.json#conversation-p0"
    defects = board.get("defects") if isinstance(board.get("defects"), dict) else {}
    defects["p0"] = max(1, int(defects.get("p0") or 0))
    board["defects"] = defects
    stamp_row(
        board,
        "conversation",
        status="FAIL",
        checked_at=when,
        n_runs=0,
        n_ok=0,
        p50_ms=None,
        p95_ms=None,
        max_ms=None,
        reason="P0 conversation routed through store",
        probe="face/orb",
    )
    return board


def apply_conversation_verifier_stamp(
    board: dict,
    *,
    checked_at: str | None = None,
    n_runs: int = 0,
    n_ok: int = 0,
    reason: str,
    p50_ms: int | None = None,
    p95_ms: int | None = None,
    max_ms: int | None = None,
) -> dict:
    """Stamp conversation from independent Orb OBSERVED only. Watch stays UNPROVEN."""
    when = checked_at or now_iso()
    board["checked_at"] = when
    board["source"] = "apps/agent-stack/eval/scoreboard.draft.json#conversation-verifier"
    passed = n_ok > 0 and n_ok == n_runs
    defects = board.get("defects") if isinstance(board.get("defects"), dict) else {}
    defects["p0"] = 0 if passed else max(1, int(defects.get("p0") or 0))
    board["defects"] = defects
    stamp_row(
        board,
        "conversation",
        status="PASS" if passed else "FAIL",
        checked_at=when,
        n_runs=n_runs,
        n_ok=n_ok,
        p50_ms=p50_ms,
        p95_ms=p95_ms,
        max_ms=max_ms,
        reason=reason,
        probe="face/127.0.0.1:4018",
    )
    return board
