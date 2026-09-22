#!/usr/bin/env python3
"""hive-gate applies transitions. Forge the agent is only a builder when the claim says so."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CLI = Path(__file__).resolve().parent / "hive-gate.py"


def live_evidence(tmp: Path) -> dict:
    return {
        "kind": "live_face",
        "surface": "127.0.0.1:4018",
        "entrypoint": "/api/watch",
        "expected_listen": "4018",
        "environment": "local",
        "address": "127.0.0.1:4018",
        "git_sha": "fixture-sha",
        "worktree": str(tmp),
        "process": "test",
        "timestamp": "2026-09-22T20:00:00Z",
        "trace_id": "trace-1",
        "input": {"path": "/api/watch"},
        "observed": {"op": "OPEN_NOTES", "did_not_book": True},
    }


def write_claim(tmp: Path, state: str, evidence: dict | None = None, **extra: object) -> Path:
    claim = {
        "id": "JOB-TX",
        "title": "transition fixture",
        "state": state,
        "revision": 0 if state == "SCOPED" else 1,
        "ask_verbs": ["keep"],
        "close_type": "",
        "release_status": "NOT_DEPLOYED",
        "builder": {"platform": "cursor", "actor": "cursor-agent", "run_id": "builder-run"},
        "verifier": {"platform": "grok", "actor": "watchdog", "run_id": "verifier-run"},
        "reviewer": {"platform": "grok", "actor": "consultant", "run_id": "reviewer-run"},
        "g2_checklist_path": "g2.json",
        "blocked": False,
        "unlock": "",
        "proof_status": "NOT_RUN",
        "bite_id": "TX-1",
        "freeze": False,
        "operator_ask": {
            "original": "Put Jev in Jarvis for browser use and computer use.",
            "authority": "EVENS",
            "may_rewrite": False,
        },
        "acceptance": [
            {"id": "a", "requirement": "observable", "mandatory": True, "result": "NOT_RUN", "evidence_refs": []}
        ],
        "runtime": {
            "surface": "127.0.0.1:4018",
            "entrypoint": "/api/watch",
            "expected_listen": "4018",
            "environment": "local",
            "address": "127.0.0.1:4018",
            "git_sha": "fixture-sha",
            "worktree": str(tmp),
        },
        "decisions_owed": [],
    }
    claim.update(extra)
    tmp.mkdir(parents=True, exist_ok=True)
    (tmp / "claim.json").write_text(json.dumps(claim), encoding="utf-8")
    if state != "SCOPED":
        (tmp / "transitions.jsonl").write_text(
            json.dumps(
                {
                    "from": "SCOPED",
                    "to": state,
                    "revision": claim["revision"],
                    "actor": "cursor",
                    "role": "builder",
                    "ran_by": "hive-gate",
                }
            )
            + "\n",
            encoding="utf-8",
        )
    if evidence is not None:
        (tmp / "evidence").mkdir(exist_ok=True)
        (tmp / "evidence" / "runtime.json").write_text(json.dumps(evidence), encoding="utf-8")
    return tmp


def request(tmp: Path, target: str, actor: str, role: str, **extra: str) -> subprocess.CompletedProcess[str]:
    claim = json.loads((tmp / "claim.json").read_text(encoding="utf-8"))
    platform = {"cursor-agent": "cursor", "forge": "grok", "watchdog": "grok", "consultant": "grok"}[actor]
    cmd = [
        sys.executable,
        str(CLI),
        "request",
        "--claim-dir",
        str(tmp),
        "--to",
        target,
        "--platform",
        extra.pop("platform", platform),
        "--actor",
        actor,
        "--role",
        role,
        "--run-id",
        extra.pop("run_id", f"{role}-run"),
        "--expected",
        str(claim["state"]),
        "--expected-revision",
        str(claim["revision"]),
    ]
    for key, value in extra.items():
        cmd.extend([f"--{key.replace('_', '-')}", value])
    return subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT))


class HiveGateTest(unittest.TestCase):
    def test_skip_to_verified_is_illegal(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_claim(Path(raw), "IMPLEMENTED_UNVERIFIED")
            proc = request(tmp, "VERIFIED", "watchdog", "verifier", run_id="verifier-run")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("illegal transition", proc.stdout)
            self.assertIn('"applied": false', proc.stdout)

    def test_slack_cannot_prove_live(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            tmp = write_claim(tmp, "WIRED", {"kind": "slack", "surface": "127.0.0.1:4018"})
            proc = request(tmp, "LIVE", "watchdog", "verifier")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("cannot advance LIVE+", proc.stdout)

    def test_wrong_surface_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            evidence = live_evidence(tmp)
            evidence["surface"] = "evenslouis.ca"
            tmp = write_claim(tmp, "WIRED", evidence)
            proc = request(tmp, "LIVE", "watchdog", "verifier")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("wrong surface", proc.stdout)

    def test_builder_cannot_request_verified(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            tmp = write_claim(tmp, "LIVE", live_evidence(tmp))
            proc = request(tmp, "VERIFIED", "cursor-agent", "verifier", run_id="builder-run")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("builder cannot certify", proc.stdout)

    def test_research_cannot_mutate(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            evidence = live_evidence(tmp)
            evidence["authority"] = "EXTERNAL_RESEARCH"
            evidence["may_change_goal"] = True
            tmp = write_claim(tmp, "WIRED", evidence)
            proc = request(tmp, "LIVE", "watchdog", "verifier")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("external research", proc.stdout)

    def test_missing_operator_ask_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_claim(Path(raw), "READY", operator_ask={})
            proc = request(tmp, "IMPLEMENTING", "cursor-agent", "builder")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("operator_ask", proc.stdout)

    def test_ready_without_g2_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_claim(Path(raw), "ARCHITECTED")
            proc = request(tmp, "READY", "cursor-agent", "builder")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("G2 checklist missing", proc.stdout)

    def test_reviewed_without_l4_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            tmp = write_claim(
                tmp,
                "VERIFIED",
                live_evidence(tmp),
                close_type="receipt",
            )
            proc = request(tmp, "REVIEWED", "consultant", "reviewer", l4_log=str(tmp / "missing.jsonl"))
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("L4", proc.stdout)

    def test_cas_rejects_stale_expected_state(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_claim(Path(raw), "SCOPED")
            proc = subprocess.run(
                [
                    sys.executable,
                    str(CLI),
                    "request",
                    "--claim-dir",
                    str(tmp),
                    "--to",
                    "ARCHITECTED",
                    "--platform",
                    "cursor",
                    "--actor",
                    "cursor-agent",
                    "--role",
                    "builder",
                    "--run-id",
                    "builder-run",
                    "--expected",
                    "READY",
                    "--expected-revision",
                    "0",
                ],
                capture_output=True,
                text=True,
                cwd=str(ROOT),
            )
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("CAS failed", proc.stdout)

    def test_verifier_live_applies_state(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            tmp = write_claim(tmp, "WIRED", live_evidence(tmp))
            proc = request(tmp, "LIVE", "watchdog", "verifier")
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            self.assertIn('"applied": true', proc.stdout)
            claim = json.loads((tmp / "claim.json").read_text(encoding="utf-8"))
            self.assertEqual(claim["state"], "LIVE")
            self.assertEqual(claim["revision"], 2)
            self.assertTrue((tmp / "transitions.jsonl").is_file())

    def test_healthz_alone_is_not_capability_proof(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            evidence = live_evidence(tmp)
            evidence["observed"] = {"healthz": {"ok": True}}
            tmp = write_claim(tmp, "WIRED", evidence)
            proc = request(tmp, "LIVE", "watchdog", "verifier")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("healthz is not capability proof", proc.stdout)

    def test_forge_cannot_build_a_cursor_claim(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_claim(Path(raw), "SCOPED")
            proc = request(tmp, "ARCHITECTED", "forge", "builder")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("assigns builder to cursor/cursor-agent", proc.stdout)

    def test_forge_can_build_when_the_claim_names_forge(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_claim(
                Path(raw),
                "SCOPED",
                builder={"platform": "grok", "actor": "forge", "run_id": "builder-run"},
                verifier={"platform": "cursor", "actor": "cursor-verifier", "run_id": "verifier-run"},
            )
            proc = request(tmp, "ARCHITECTED", "forge", "builder")
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            claim = json.loads((tmp / "claim.json").read_text(encoding="utf-8"))
            self.assertEqual(claim["state"], "ARCHITECTED")
            self.assertEqual(claim["builder"]["actor"], "forge")

    def test_tracked_env_backups_are_not_in_git(self) -> None:
        listed = subprocess.check_output(["git", "ls-files"], cwd=str(ROOT), text=True)
        for banned in (
            ".env.backup",
            ".env.dev",
            ".env.monitoring.backup",
            "apps/scorpion/.env.local.backup",
        ):
            self.assertNotIn(banned + "\n", listed + "\n", banned)


if __name__ == "__main__":
    unittest.main()
