#!/usr/bin/env python3
"""hive-gate is the machine. Forge is a Grok builder, not this file.

  python3 scripts/hive/eng/hive-gate.py request \\
    --claim-dir <path> --to ARCHITECTED --platform cursor --actor cursor-agent --role builder \\
    --expected SCOPED --expected-revision 0

Cursor or Forge may hold Builder on a claim. This process applies the state.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
_spec = importlib.util.spec_from_file_location("hive_job", HERE / "hive-job.py")
assert _spec and _spec.loader
hive_job = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(hive_job)

EDGES = {
    "SCOPED": {"ARCHITECTED", "DECISION_OWED", "PARKED"},
    "DECISION_OWED": {"ARCHITECTED", "PARKED"},
    "ARCHITECTED": {"READY", "DECISION_OWED", "PARKED"},
    "READY": {"IMPLEMENTING", "PARKED"},
    "IMPLEMENTING": {"IMPLEMENTED_UNVERIFIED", "PARKED"},
    "IMPLEMENTED_UNVERIFIED": {"WIRED", "VERIFICATION_UNAVAILABLE", "PARKED"},
    "WIRED": {"LIVE", "WIRE_FAILURE", "VERIFICATION_UNAVAILABLE", "PARKED"},
    "LIVE": {"VERIFIED", "REGRESSION", "PARKED"},
    "VERIFIED": {"REVIEWED", "REGRESSION", "PARKED"},
    "REGRESSION": {"IMPLEMENTING", "PARKED"},
    "WIRE_FAILURE": {"IMPLEMENTING", "PARKED"},
    "VERIFICATION_UNAVAILABLE": {"WIRED", "LIVE", "PARKED"},
    "PARKED": set(),
}
ROLE_FOR = {
    "LIVE": "verifier",
    "VERIFIED": "verifier",
    "REVIEWED": "reviewer",
}
BUILDER_TARGETS = {"ARCHITECTED", "READY", "IMPLEMENTING", "IMPLEMENTED_UNVERIFIED", "WIRED"}


def emit(payload: dict, ok: bool) -> int:
    print(json.dumps(payload, indent=2))
    print("TRANSITION_ACCEPTED" if ok else "TRANSITION_REJECTED", file=sys.stdout if ok else sys.stderr)
    return 0 if ok else 1


def load_permissions() -> dict:
    path = ROOT / "roles" / "permissions.json"
    return json.loads(path.read_text(encoding="utf-8"))


def eligible(perms: dict, role_name: str, platform: str, actor: str) -> bool:
    rows = perms.get("eligible", {}).get(role_name, [])
    want_platform = platform.strip().lower()
    want_actor = actor.strip().lower()
    return any(
        str(row.get("platform") or "").lower() == want_platform
        and str(row.get("actor") or "").lower() == want_actor
        for row in rows
        if isinstance(row, dict)
    )


def assignment_reason(claim: dict, role_name: str, platform: str, actor: str, run_id: str) -> str:
    assigned = hive_job.party(claim.get(role_name))
    if assigned is None:
        return f"{role_name} must be {{platform, actor, run_id}}"
    if platform.strip().lower() != assigned["platform"] or actor.strip().lower() != assigned["actor"]:
        return (
            f"this claim assigns {role_name} to {assigned['platform']}/{assigned['actor']}"
        )
    if assigned["run_id"] and run_id and assigned["run_id"] != run_id:
        return "run_id does not match the claim assignment"
    return ""


def request_transition(
    directory: Path,
    target: str,
    actor: str,
    role: str,
    expected: str,
    expected_revision: int,
    platform: str,
    run_id: str,
    l4_log: str,
) -> int:
    claim = hive_job.load_claim(directory)
    current = str(claim.get("state") or "")
    revision = claim.get("revision")
    reasons: list[str] = []
    reasons.extend(hive_job.ownership_reasons(claim, hive_job.load_receipts(directory)))
    if current != expected or revision != expected_revision:
        reasons.append(
            f"CAS failed: claim is {current}@{revision}, expected {expected}@{expected_revision}"
        )
    if target in hive_job.REMOVED_STATES or target not in hive_job.STATES:
        reasons.append(f"unknown state {target!r}")
    ask = claim.get("operator_ask") if isinstance(claim.get("operator_ask"), dict) else {}
    if target != "PARKED" and not str(ask.get("original") or "").strip():
        reasons.append("immutable operator_ask.original missing")
    if ask.get("may_rewrite") is True:
        reasons.append("operator_ask.may_rewrite must stay false")
    if target not in EDGES.get(current, set()):
        reasons.append(f"illegal transition {current or 'missing'} -> {target}")
    need = ROLE_FOR.get(target)
    perms = load_permissions()
    if need and role != need:
        reasons.append(f"{target} requires role {need}, got {role or 'missing'}")
    if role in perms and need and f"request_{target}" not in perms[role].get("may", []):
        reasons.append(f"role {role} may not request {target}")
    builder = hive_job.party(claim.get("builder"))
    if builder and target in hive_job.VERIFIED_PLUS and actor.strip().lower() == builder["actor"]:
        reasons.append("builder cannot certify this transition")
    if target in BUILDER_TARGETS:
        if role != "builder":
            reasons.append("implementation requires the claim builder")
        else:
            why = assignment_reason(claim, "builder", platform, actor, run_id)
            if why:
                reasons.append(why)
            elif not eligible(perms, "builder", platform, actor):
                reasons.append("actor is not an eligible builder")
    if need in {"verifier", "reviewer"}:
        why = assignment_reason(claim, need, platform, actor, run_id)
        if why:
            reasons.append(why)
        elif not eligible(perms, need, platform, actor):
            reasons.append(f"actor is not an eligible {need}")
        assigned_builder = builder or {"actor": ""}
        if need == "reviewer" and actor.strip().lower() == assigned_builder["actor"]:
            reasons.append("reviewer must differ from the builder")
    if target == "READY":
        reasons.extend(hive_job.g2_reasons(claim, directory))
    if target in hive_job.LIVE_PLUS:
        reasons.extend(hive_job.evidence_reasons(claim, directory, hive_job.load_evidence(directory)))
    if target == "REVIEWED":
        reasons.extend(hive_job.close_reasons(claim))
        log = Path(l4_log) if l4_log else hive_job._default_l4(claim, directory)
        reasons.extend(hive_job.l4_reasons(claim, log))
    ran: dict = {}
    if target == "VERIFIED" and not reasons:
        if not platform.strip() or not run_id.strip():
            reasons.append("VERIFIED requires --platform and --run-id from the verifier execution")
        else:
            regression = claim.get("regression") if isinstance(claim.get("regression"), dict) else {}
            argv = regression.get("argv")
            cwd = regression.get("cwd")
            if not isinstance(argv, list) or not argv or not cwd or not Path(str(cwd)).is_dir():
                reasons.append("VERIFIED requires a regression argv and cwd hive-gate can execute")
            else:
                proc = subprocess.run([str(x) for x in argv], cwd=str(cwd), capture_output=True, text=True)
                ran = {
                    "executed_argv": argv,
                    "executed_cwd": str(cwd),
                    "executed_returncode": proc.returncode,
                }
                if proc.returncode != 0:
                    reasons.append("verifier regression failed")
    if reasons:
        return emit(
            {
                "id": claim.get("id"),
                "current": current,
                "to": target,
                "applied": False,
                "reasons": reasons,
            },
            False,
        )
    new_revision = int(revision) + 1
    row = {
        "actor": actor,
        "at": hive_job.utc_now(),
        "from": current,
        "platform": platform,
        "ran_by": "hive-gate",
        "revision": new_revision,
        "role": role,
        "run_id": run_id,
        "to": target,
        **ran,
    }
    row["receipt_sha"] = hive_job.receipt_sha(row)
    claim["state"] = target
    claim["revision"] = new_revision
    if target in hive_job.VERIFIED_PLUS:
        claim["proof_status"] = "PASS" if target == "VERIFIED" else claim.get("proof_status")
    hive_job.write_claim(directory, claim)
    hive_job.append_receipt(directory, row)
    if target == "VERIFIED":
        evidence = directory / "evidence"
        evidence.mkdir(parents=True, exist_ok=True)
        (evidence / "VERIFIER.json").write_text(
            json.dumps(
                {
                    "verifier": actor,
                    "platform": platform,
                    "run_id": run_id,
                    "verdict": "PASS",
                    "receipt_sha": row["receipt_sha"],
                    "ran_by": "hive-gate",
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
    return emit(
        {
            "id": claim.get("id"),
            "current": current,
            "to": target,
            "revision": new_revision,
            "receipt_sha": row["receipt_sha"],
            "applied": True,
            "reasons": [],
        },
        True,
    )


def main() -> int:
    ap = argparse.ArgumentParser(description="hive-gate applies CapEx transitions")
    sub = ap.add_subparsers(dest="cmd", required=True)
    req = sub.add_parser("request")
    req.add_argument("--claim")
    req.add_argument("--claim-dir")
    req.add_argument("--to", required=True)
    req.add_argument("--actor", required=True)
    req.add_argument("--role", required=True)
    req.add_argument("--expected", required=True)
    req.add_argument("--expected-revision", required=True, type=int)
    req.add_argument("--platform", default="")
    req.add_argument("--run-id", default="")
    req.add_argument("--l4-log", default="")
    args = ap.parse_args()
    directory = Path(args.claim_dir) if args.claim_dir else hive_job.claim_dir_for(str(args.claim or ""))
    return request_transition(
        directory,
        args.to,
        args.actor,
        args.role,
        args.expected,
        args.expected_revision,
        args.platform,
        args.run_id,
        args.l4_log,
    )


if __name__ == "__main__":
    raise SystemExit(main())
