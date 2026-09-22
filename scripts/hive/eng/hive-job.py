#!/usr/bin/env python3
"""Hive engineering job gate. Code, not confidence, advances state.

Usage:
  python3 scripts/hive/eng/hive-job.py states
  python3 scripts/hive/eng/hive-job.py status --job JOB-JEV-001
  python3 scripts/hive/eng/hive-job.py verify --job JOB-JEV-001
  python3 scripts/hive/eng/hive-job.py verify --job-dir <path>

L4 Forge-done stays `docs/hive/outer-heaven/check-forge-done.py --slice-id`.
This gate is for runtime capability claims. File writes cannot pass LIVE+.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
JOBS = ROOT / "docs/hive/outer-heaven/CONTENT/os/jobs"
REGISTRY = JOBS / "REGISTRY.json"

STATES = (
    "DISCOVERED",
    "SCOPED",
    "DECISION_OWED",
    "ARCHITECTED",
    "READY",
    "IMPLEMENTING",
    "IMPLEMENTED_UNVERIFIED",
    "WIRED",
    "LIVE",
    "VERIFIED",
    "REVIEWED",
    "SHIPPED",
    "WIRE_FAILURE",
    "VERIFICATION_UNAVAILABLE",
    "VERIFICATION_PREREQUISITE_REQUIRED",
    "REGRESSION",
    "PARKED",
)
FORBIDDEN_STATES = frozenset({"DONE", "FINISHED", "WORKING", "COMPLETE", "READY_TO_SHIP"})
LIVE_PLUS = frozenset({"WIRED", "LIVE", "VERIFIED", "REVIEWED", "SHIPPED"})
VERIFIED_PLUS = frozenset({"VERIFIED", "REVIEWED", "SHIPPED"})
REQUIRED_JOB_KEYS = (
    "id",
    "title",
    "state",
    "builder",
    "verifier",
    "acceptance",
    "non_goals",
    "runtime",
    "evidence",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def job_dir_for(job_id: str) -> Path:
    direct = JOBS / job_id
    if (direct / "job.json").is_file():
        return direct
    raise SystemExit(f"FAIL: no job.json under {direct}")


def load_job(directory: Path) -> dict:
    path = directory / "job.json"
    if not path.is_file():
        raise SystemExit(f"FAIL: missing {path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"FAIL: job.json is not JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise SystemExit("FAIL: job.json must be an object")
    return data


def load_evidence(directory: Path) -> dict:
    path = directory / "evidence" / "runtime.json"
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def probe_face(host: str, timeout: float = 3.0) -> dict:
    url = f"http://{host}/healthz"
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            body = json.loads(resp.read().decode())
            return {"ok": bool(body.get("ok")), "url": url, "status": resp.status, "body": body}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
        return {"ok": False, "url": url, "error": str(exc)}


def reasons_for(job: dict, directory: Path, *, ping_runtime: bool) -> list[str]:
    reasons: list[str] = []
    for key in REQUIRED_JOB_KEYS:
        if key not in job:
            reasons.append(f"missing job field {key}")
    state = str(job.get("state") or "")
    if state in FORBIDDEN_STATES or state.lower() == "done":
        reasons.append(f"forbidden state {state!r} — Hive has no DONE")
    elif state and state not in STATES:
        reasons.append(f"unknown state {state!r}")
    acceptance = job.get("acceptance")
    if not isinstance(acceptance, list) or not acceptance:
        reasons.append("acceptance must be a non-empty list")
    runtime = job.get("runtime") if isinstance(job.get("runtime"), dict) else {}
    evidence_spec = job.get("evidence") if isinstance(job.get("evidence"), dict) else {}
    required = list(evidence_spec.get("required") or [])
    ev = load_evidence(directory)
    builder = str(job.get("builder") or "").strip().lower()
    verifier = str(job.get("verifier") or "").strip().lower()

    if state in LIVE_PLUS:
        if not ev:
            reasons.append("LIVE+ requires evidence/runtime.json — a file write is not proof")
        for key in required or ("live_request", "live_response"):
            if key not in ev or ev.get(key) in (None, "", {}, []):
                reasons.append(f"missing evidence.{key}")
        if ev.get("kind") in {"unit_test", "markdown", "status_message", "commit"}:
            reasons.append(f"evidence.kind={ev.get('kind')!r} cannot advance LIVE+")
        face = str(runtime.get("expected_face") or "").strip()
        if ping_runtime and face:
            health = probe_face(face)
            if not health.get("ok"):
                reasons.append(
                    f"Face {face} not reachable ({health.get('error') or health.get('status')}) "
                    "→ VERIFICATION_UNAVAILABLE; cannot hold LIVE+"
                )
            ev_health = ev.get("face_health") if isinstance(ev.get("face_health"), dict) else {}
            if ev_health and ev_health.get("ok") is not True:
                reasons.append("evidence.face_health.ok is not true")

    if state in VERIFIED_PLUS:
        if not builder or not verifier:
            reasons.append("VERIFIED+ requires builder and verifier identities")
        elif builder == verifier:
            reasons.append("builder may not stamp VERIFIED (builder == verifier)")
        stamp = directory / "evidence" / "VERIFIER.json"
        if not stamp.is_file():
            reasons.append("VERIFIED+ requires evidence/VERIFIER.json from the verifier")
        else:
            try:
                stamp_data = json.loads(stamp.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                stamp_data = {}
            who = str(stamp_data.get("verifier") or "").strip().lower()
            if who and who == builder:
                reasons.append("VERIFIER.json is signed by the builder")
            if str(stamp_data.get("verdict") or "").upper() not in {"PASS", "PASS_DIFF", "VERIFIED"}:
                reasons.append("VERIFIER.json missing verdict PASS|PASS_DIFF|VERIFIED")

    return reasons


def cmd_states() -> int:
    print(json.dumps({"states": list(STATES), "forbidden": sorted(FORBIDDEN_STATES)}, indent=2))
    return 0


def cmd_status(directory: Path) -> int:
    job = load_job(directory)
    print(
        json.dumps(
            {
                "id": job.get("id"),
                "title": job.get("title"),
                "state": job.get("state"),
                "builder": job.get("builder"),
                "verifier": job.get("verifier"),
                "dir": str(directory),
            },
            indent=2,
        )
    )
    return 0


def cmd_verify(directory: Path, *, ping_runtime: bool) -> int:
    job = load_job(directory)
    reasons = reasons_for(job, directory, ping_runtime=ping_runtime)
    payload = {
        "id": job.get("id"),
        "state": job.get("state"),
        "ok": not reasons,
        "checked_at": utc_now(),
        "dir": str(directory),
        "reasons": reasons,
    }
    print(json.dumps(payload, indent=2))
    if reasons:
        print("FAIL", file=sys.stderr)
        return 1
    print("PASS")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Hive engineering job gate")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("states")
    st = sub.add_parser("status")
    st.add_argument("--job")
    st.add_argument("--job-dir")
    vf = sub.add_parser("verify")
    vf.add_argument("--job")
    vf.add_argument("--job-dir")
    vf.add_argument("--offline", action="store_true", help="Do not ping expected_face")
    args = ap.parse_args()
    if args.cmd == "states":
        return cmd_states()
    directory = Path(args.job_dir) if args.job_dir else job_dir_for(str(args.job or ""))
    if args.cmd == "status":
        return cmd_status(directory)
    return cmd_verify(directory, ping_runtime=not args.offline)


if __name__ == "__main__":
    raise SystemExit(main())
