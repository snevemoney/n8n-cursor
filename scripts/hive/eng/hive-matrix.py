#!/usr/bin/env python3
"""Hive engineering conductor. Lane A routes Lane B. Big Boss does not do every function.

Usage:
  python3 scripts/hive/eng/hive-matrix.py next --job JOB-JEV-001
  python3 scripts/hive/eng/hive-matrix.py develop --job JOB-JEV-001
  python3 scripts/hive/eng/hive-matrix.py document --job JOB-JEV-001
  python3 scripts/hive/eng/hive-matrix.py audit --job JOB-JEV-001
  python3 scripts/hive/eng/hive-matrix.py test --job JOB-JEV-001
  python3 scripts/hive/eng/hive-matrix.py debug --job JOB-JEV-001

Evidence law stays in hive-job.py verify. This file only decides which function may run.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("hive_job", HERE / "hive-job.py")
assert _spec and _spec.loader
hive_job = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(hive_job)

FUNCTIONS = (
    "scope",
    "architect",
    "audit",
    "develop",
    "verify",
    "test",
    "review",
    "document",
    "sync",
    "debug",
)

# state -> the one function Big Boss should run now
ROUTE: dict[str, dict] = {
    "SCOPED": {
        "now": "ARCHITECT",
        "allow": ["scope", "architect"],
        "say": "Architecture and value sources next. Development is not allowed.",
    },
    "DECISION_OWED": {
        "now": "ARCHITECT",
        "allow": ["architect"],
        "say": "An architecture decision is missing. Coding is forbidden.",
    },
    "ARCHITECTED": {
        "now": "AUDIT",
        "allow": ["audit"],
        "say": "Audit runtime reality before changing it.",
    },
    "READY": {
        "now": "DEVELOP",
        "allow": ["develop"],
        "say": "Implement the decided architecture. Reuse before create.",
    },
    "IMPLEMENTING": {
        "now": "DEVELOP",
        "allow": ["develop"],
        "say": "Still implementing. Do not document success.",
    },
    "IMPLEMENTED_UNVERIFIED": {
        "now": "VERIFY",
        "allow": ["verify", "audit"],
        "say": "Code exists. Send it to live verification. Do not document success.",
    },
    "WIRED": {
        "now": "VERIFY",
        "allow": ["verify", "audit"],
        "say": "Reachable is not observed. Run the real path.",
    },
    "LIVE": {
        "now": "TEST",
        "allow": ["test", "audit"],
        "say": "Lock a regression. Development is finished. Do not document success.",
    },
    "VERIFIED": {
        "now": "REVIEW",
        "allow": ["review", "audit"],
        "say": "Verifier stamped. A different reviewer reads the diff. Docs wait.",
    },
    "REVIEWED": {
        "now": "DOCUMENT",
        "allow": ["document", "sync", "audit"],
        "say": "Document from the diff and the evidence. Then sync context to the repo. Release status is separate.",
    },
    "REGRESSION": {
        "now": "DEBUG",
        "allow": ["debug"],
        "say": "Broken behavior. Reproduce, one hypothesis, one experiment. Do not develop a new feature.",
    },
    "WIRE_FAILURE": {
        "now": "DEBUG",
        "allow": ["debug", "audit"],
        "say": "Expected wire is missing. Debug, do not write a success doc.",
    },
    "VERIFICATION_UNAVAILABLE": {
        "now": "VERIFY",
        "allow": ["verify", "audit"],
        "say": "Proof cannot be acquired. That is not PASS.",
    },
    "PARKED": {
        "now": "PARKED",
        "allow": [],
        "say": "Parked is not complete.",
    },
}


def directory_from(args: argparse.Namespace) -> Path:
    if args.claim_dir:
        return Path(args.claim_dir)
    return hive_job.claim_dir_for(str(args.claim or ""))


def regression_locked(directory: Path, claim: dict) -> bool:
    path = directory / "evidence" / "test.json"
    if not path.is_file():
        return False
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    if not isinstance(data, dict) or data.get("ok") is not True:
        return False
    runtime = claim.get("runtime") if isinstance(claim.get("runtime"), dict) else {}
    sha = str(runtime.get("git_sha") or "")
    return bool(sha) and data.get("git_sha") == sha


def route_for(claim: dict, directory: Path) -> dict:
    state = str(claim.get("state") or "")
    if state not in ROUTE:
        return {
            "now": "UNKNOWN",
            "allow": [],
            "say": f"Unknown state {state!r}. Hive has no DONE.",
        }
    route = dict(ROUTE[state])
    route["allow"] = list(route["allow"])
    if state == "SCOPED":
        scope = claim.get("scope") if isinstance(claim.get("scope"), dict) else {}
        if not scope.get("goal") or not scope.get("v1"):
            route["now"] = "SCOPE"
            route["say"] = "Scope the observable outcome and the non-goals before architecture."
    if state == "LIVE" and regression_locked(directory, claim):
        route["now"] = "VERIFY"
        route["allow"] = ["verify", "audit"]
        route["say"] = "Regression is locked. Independent verify is next. Do not loop on test."
    return route


def emit(payload: dict, ok: bool) -> int:
    print(json.dumps(payload, indent=2))
    if ok:
        print("PASS")
        return 0
    print("FAIL", file=sys.stderr)
    return 1


def guard(job: dict, action: str, directory: Path) -> tuple[bool, dict]:
    state = str(job.get("state") or "")
    route = route_for(job, directory)
    allowed = action in route["allow"]
    payload = {
        "id": job.get("id"),
        "state": state,
        "conductor": "big-boss",
        "lane_a": route["now"],
        "lane_b": job.get("title"),
        "action": action,
        "allow": route["allow"],
        "say": route["say"],
        "ok": allowed,
    }
    if not allowed:
        payload["reason"] = f"{action} refused while state is {state or 'missing'}"
    return allowed, payload


def unchanged(directory: Path, before: str) -> None:
    after = hive_job.load_claim(directory)
    if str(after.get("state") or "") != before:
        raise SystemExit("FAIL: conductor wrote state; hive-gate is the only writer")


def cmd_next(directory: Path) -> int:
    job = hive_job.load_claim(directory)
    state = str(job.get("state") or "")
    route = route_for(job, directory)
    payload = {
        "id": job.get("id"),
        "state": state,
        "conductor": "big-boss",
        "lane_a": route["now"],
        "lane_b": job.get("title"),
        "action": "next",
        "allow": route["allow"],
        "say": route["say"],
        "ok": True,
        "builder": job.get("builder"),
        "eligible_builders": ["cursor-agent", "forge"],
        "machine": "hive-gate",
    }
    return emit(payload, True)


def cmd_bound(directory: Path, action: str) -> int:
    job = hive_job.load_claim(directory)
    before = str(job.get("state") or "")
    allowed, payload = guard(job, action, directory)
    payload["applies_state"] = False
    if not allowed:
        return emit(payload, False)
    if action == "scope":
        scope = job.get("scope") if isinstance(job.get("scope"), dict) else {}
        if not scope.get("goal") or not scope.get("v1"):
            payload["ok"] = False
            payload["reason"] = "scope.goal and scope.v1 required"
            return emit(payload, False)
    if action == "architect":
        if not isinstance(job.get("architecture"), dict) or not isinstance(job.get("reuse_check"), dict):
            payload["ok"] = False
            payload["reason"] = "architecture and reuse_check required"
            return emit(payload, False)
    if action == "review":
        reasons = hive_job.l4_reasons(job, hive_job._default_l4(job, directory))
        if reasons:
            payload["ok"] = False
            payload["reason"] = reasons[0]
            return emit(payload, False)
    if action == "sync":
        payload["synced_vault"] = False
        payload["reason"] = "sync does not write the Obsidian vault"
    unchanged(directory, before)
    return emit(payload, True)


def cmd_develop(directory: Path) -> int:
    job = hive_job.load_claim(directory)
    before = str(job.get("state") or "")
    allowed, payload = guard(job, "develop", directory)
    if not allowed:
        return emit(payload, False)
    reuse = job.get("reuse_check")
    if not isinstance(reuse, dict) or not reuse.get("existing") or not reuse.get("decision"):
        payload["ok"] = False
        payload["reason"] = "REUSE_CHECK required before develop (existing + decision)"
        return emit(payload, False)
    if reuse.get("decision") not in {"extend", "reuse"} and not reuse.get("rejected"):
        payload["ok"] = False
        payload["reason"] = "CREATE requires rejected alternatives on reuse_check"
        return emit(payload, False)
    payload["reuse_check"] = reuse.get("decision")
    payload["applies_state"] = False
    unchanged(directory, before)
    return emit(payload, True)


def cmd_document(directory: Path) -> int:
    job = hive_job.load_claim(directory)
    before = str(job.get("state") or "")
    allowed, payload = guard(job, "document", directory)
    if not allowed:
        payload["reason"] = payload.get("reason") or "do not document success"
        return emit(payload, False)
    payload["applies_state"] = False
    unchanged(directory, before)
    return emit(payload, True)


def cmd_debug(directory: Path) -> int:
    job = hive_job.load_claim(directory)
    before = str(job.get("state") or "")
    allowed, payload = guard(job, "debug", directory)
    if not allowed:
        return emit(payload, False)
    path = directory / "evidence" / "hypothesis.json"
    if not path.is_file():
        payload["ok"] = False
        payload["reason"] = "one falsifiable hypothesis required in evidence/hypothesis.json"
        return emit(payload, False)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        data = {}
    hypothesis = data.get("hypothesis") if isinstance(data, dict) else None
    if not isinstance(hypothesis, str) or not hypothesis.strip():
        payload["ok"] = False
        payload["reason"] = "hypothesis must be one string, not a pile of patches"
        return emit(payload, False)
    if isinstance(data.get("experiments"), list) and len(data["experiments"]) > 1:
        payload["ok"] = False
        payload["reason"] = "one experiment at a time"
        return emit(payload, False)
    payload["hypothesis"] = hypothesis.strip()[:240]
    payload["applies_state"] = False
    unchanged(directory, before)
    return emit(payload, True)


def cmd_audit(directory: Path) -> int:
    job = hive_job.load_claim(directory)
    runtime = job.get("runtime") if isinstance(job.get("runtime"), dict) else {}
    face = str(runtime.get("expected_face") or "").strip()
    contradictions: list[dict] = []
    health = hive_job.probe_face(face) if face else {"ok": False, "error": "no expected_face"}
    state = str(job.get("state") or "")
    if state in hive_job.LIVE_PLUS and not health.get("ok"):
        contradictions.append(
            {
                "code": "DOC_RUNTIME_CONTRADICTION",
                "doc": f"job state {state}",
                "runtime": f"Face {face} not reachable",
            }
        )
    plates = None
    if health.get("ok") and face:
        try:
            with urllib.request.urlopen(f"http://{face}/api/plates", timeout=4) as resp:
                plates = json.loads(resp.read().decode())
        except (OSError, json.JSONDecodeError, urllib.error.URLError) as exc:
            contradictions.append(
                {
                    "code": "DOC_RUNTIME_CONTRADICTION",
                    "doc": "plates armed",
                    "runtime": str(exc),
                }
            )
    if isinstance(plates, dict):
        if plates.get("merged") is True:
            contradictions.append(
                {
                    "code": "DOC_RUNTIME_CONTRADICTION",
                    "doc": "two plates, not merged",
                    "runtime": "merged true",
                }
            )
        families = runtime.get("families") or []
        p1 = plates.get("process_1_safari_indexed") or {}
        p2 = plates.get("process_2_voice_mac") or {}
        if "computer.next_op" in families and p1.get("family") != "computer.next_op":
            contradictions.append(
                {
                    "code": "DOC_RUNTIME_CONTRADICTION",
                    "doc": "computer.next_op",
                    "runtime": p1.get("family"),
                }
            )
        if "voice.mac_op" in families and p2.get("arc_missing") is True:
            contradictions.append(
                {
                    "code": "DOC_RUNTIME_CONTRADICTION",
                    "doc": "voice.mac_op arc present",
                    "runtime": "arc_missing",
                }
            )
    out = {
        "id": job.get("id"),
        "state": state,
        "face_health": {"ok": bool(health.get("ok")), "url": health.get("url"), "error": health.get("error")},
        "contradictions": contradictions,
        "ok": not contradictions,
    }
    evidence = directory / "evidence"
    if evidence.is_dir() and not str(directory).endswith("fixtures/JOB-FAKE-DONE"):
        (evidence / "audit.json").write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    return emit(out, not contradictions)


def cmd_test(directory: Path) -> int:
    job = hive_job.load_claim(directory)
    before = str(job.get("state") or "")
    allowed, payload = guard(job, "test", directory)
    if not allowed:
        return emit(payload, False)
    regression = job.get("regression") if isinstance(job.get("regression"), dict) else {}
    argv = regression.get("argv")
    cwd = regression.get("cwd")
    if not isinstance(argv, list) or not argv or not cwd:
        payload["ok"] = False
        payload["reason"] = "regression.argv and regression.cwd required — a green wish is not a test"
        return emit(payload, False)
    if not Path(str(cwd)).is_dir():
        payload["ok"] = False
        payload["reason"] = f"regression cwd missing: {cwd}"
        return emit(payload, False)
    proc = subprocess.run([str(x) for x in argv], cwd=str(cwd), capture_output=True, text=True)
    runtime = job.get("runtime") if isinstance(job.get("runtime"), dict) else {}
    record = {
        "argv": argv,
        "cwd": cwd,
        "returncode": proc.returncode,
        "ok": proc.returncode == 0,
        "git_sha": runtime.get("git_sha") or "",
    }
    (directory / "evidence").mkdir(parents=True, exist_ok=True)
    (directory / "evidence" / "test.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    payload["ok"] = proc.returncode == 0
    payload["test"] = record
    payload["stderr_tail"] = (proc.stderr or "")[-400:]
    if proc.returncode != 0:
        payload["reason"] = "regression command failed — state stays un-reviewed"
    payload["applies_state"] = False
    unchanged(directory, before)
    return emit(payload, proc.returncode == 0)


def main() -> int:
    ap = argparse.ArgumentParser(description="Hive engineering conductor")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("next", *FUNCTIONS):
        cmd = sub.add_parser(name)
        cmd.add_argument("--claim")
        cmd.add_argument("--claim-dir")
    args = ap.parse_args()
    directory = directory_from(args)
    dispatch = {
        "next": cmd_next,
        "develop": cmd_develop,
        "document": cmd_document,
        "debug": cmd_debug,
        "audit": cmd_audit,
        "test": cmd_test,
        "scope": lambda path: cmd_bound(path, "scope"),
        "architect": lambda path: cmd_bound(path, "architect"),
        "verify": lambda path: cmd_bound(path, "verify"),
        "review": lambda path: cmd_bound(path, "review"),
        "sync": lambda path: cmd_bound(path, "sync"),
    }
    return dispatch[args.cmd](directory)


if __name__ == "__main__":
    raise SystemExit(main())
