#!/usr/bin/env python3
"""Forge owns state. An LLM may request a transition. This process accepts or rejects it.

  python3 scripts/hive/eng/forge-transition.py request --job JOB-JEV-001 --to LIVE --actor grok --role verifier
  python3 scripts/hive/eng/forge-transition.py capabilities

Does not apply the new state. Acceptance is a decision. The job file stays until a later apply.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
_spec = importlib.util.spec_from_file_location("hive_job", HERE / "hive-job.py")
assert _spec and _spec.loader
hive_job = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(hive_job)

TRUTH = ("runtime", "git", "capex", "architecture", "context", "slack")
NOT_RUNTIME = frozenset({"slack", "chat", "markdown", "unit_test", "status_message", "commit", "doc"})
EDGES = {
    "DISCOVERED": {"SCOPED", "PARKED"},
    "SCOPED": {"ARCHITECTED", "DECISION_OWED", "PARKED"},
    "DECISION_OWED": {"ARCHITECTED", "PARKED"},
    "ARCHITECTED": {"READY", "DECISION_OWED", "PARKED"},
    "READY": {"IMPLEMENTING", "PARKED"},
    "IMPLEMENTING": {"IMPLEMENTED_UNVERIFIED", "PARKED"},
    "IMPLEMENTED_UNVERIFIED": {"WIRED", "VERIFICATION_UNAVAILABLE", "PARKED"},
    "WIRED": {"LIVE", "WIRE_FAILURE", "VERIFICATION_UNAVAILABLE", "PARKED"},
    "LIVE": {"VERIFIED", "REGRESSION", "PARKED"},
    "VERIFIED": {"REVIEWED", "REGRESSION", "PARKED"},
    "REVIEWED": {"SHIPPED", "PARKED"},
    "REGRESSION": {"IMPLEMENTING", "PARKED"},
    "WIRE_FAILURE": {"IMPLEMENTING", "PARKED"},
    "VERIFICATION_UNAVAILABLE": {"WIRED", "LIVE", "PARKED"},
    "PARKED": set(),
}
ROLE_FOR = {
    "LIVE": "verifier",
    "VERIFIED": "verifier",
    "REVIEWED": "reviewer",
    "SHIPPED": "reviewer",
}


def emit(payload: dict, ok: bool) -> int:
    print(json.dumps(payload, indent=2))
    print("TRANSITION_ACCEPTED" if ok else "TRANSITION_REJECTED", file=sys.stdout if ok else sys.stderr)
    return 0 if ok else 1


def load_permissions() -> dict:
    path = ROOT / "roles" / "permissions.json"
    return json.loads(path.read_text(encoding="utf-8"))


def request_transition(directory: Path, target: str, actor: str, role: str) -> int:
    job = hive_job.load_job(directory)
    current = str(job.get("state") or "")
    reasons: list[str] = []
    ask = job.get("operator_ask") if isinstance(job.get("operator_ask"), dict) else {}
    if target not in {"DISCOVERED", "PARKED"} and not str(ask.get("original") or "").strip():
        reasons.append("immutable operator_ask.original missing")
    if ask.get("may_rewrite") is True:
        reasons.append("operator_ask.may_rewrite must stay false")
    allowed = EDGES.get(current, set())
    if target not in allowed:
        reasons.append(f"illegal transition {current or 'missing'} -> {target}")
    need = ROLE_FOR.get(target)
    perms = load_permissions()
    if need and role != need:
        reasons.append(f"{target} requires role {need}, got {role or 'missing'}")
    if role in perms and f"request_{target}" not in perms[role].get("may", []) and need:
        reasons.append(f"role {role} may not request {target}")
    builder = str(job.get("builder") or "").strip().lower()
    if target in hive_job.VERIFIED_PLUS and actor.strip().lower() == builder:
        reasons.append("builder cannot certify this transition")
    if target in hive_job.LIVE_PLUS:
        ev = hive_job.load_evidence(directory)
        kind = str(ev.get("kind") or "").lower()
        if not ev:
            reasons.append("missing evidence/runtime.json")
        if kind in NOT_RUNTIME:
            reasons.append(f"evidence.kind={kind} is below runtime in the truth order")
        surface = str(ev.get("surface") or "")
        face = str((job.get("runtime") or {}).get("expected_face") or "")
        if face and surface and surface != face:
            reasons.append(f"wrong surface {surface!r} != {face!r}")
        authority = str(ev.get("authority") or "")
        if authority in {"UNTRUSTED_DATA", "EXTERNAL_RESEARCH"} or ev.get("may_change_goal") is True:
            reasons.append("external research cannot mutate state")
    payload = {
        "id": job.get("id"),
        "current": current,
        "to": target,
        "actor": actor,
        "role": role,
        "truth": list(TRUTH),
        "ok": not reasons,
        "reasons": reasons,
        "applied": False,
    }
    return emit(payload, not reasons)


def capabilities() -> int:
    path = hive_job.JOBS / "REGISTRY.json"
    data = json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {"capabilities": []}
    print(json.dumps({"truth": list(TRUTH), "capabilities": data.get("capabilities") or []}, indent=2))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Forge transition policy")
    sub = ap.add_subparsers(dest="cmd", required=True)
    req = sub.add_parser("request")
    req.add_argument("--job")
    req.add_argument("--job-dir")
    req.add_argument("--to", required=True)
    req.add_argument("--actor", required=True)
    req.add_argument("--role", required=True)
    sub.add_parser("capabilities")
    args = ap.parse_args()
    if args.cmd == "capabilities":
        return capabilities()
    directory = Path(args.job_dir) if args.job_dir else hive_job.job_dir_for(str(args.job or ""))
    return request_transition(directory, args.to, args.actor, args.role)


if __name__ == "__main__":
    raise SystemExit(main())
