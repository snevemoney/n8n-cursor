#!/usr/bin/env python3
"""The gate must reject unsupported completion. A green essay is not PASS."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CLI = Path(__file__).resolve().parent / "hive-job.py"
CAPEX = ROOT / "docs/hive/outer-heaven/CONTENT/os/capex"


def run_verify(directory: Path, *extra: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(CLI), "verify", "--claim-dir", str(directory), *extra],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )


def base_claim(state: str, **extra: object) -> dict:
    claim = {
        "id": "CLAIM-T",
        "title": "fixture",
        "state": state,
        "revision": 0 if state == "SCOPED" else 1,
        "ask_verbs": ["keep"],
        "close_type": "",
        "release_status": "NOT_DEPLOYED",
        "operator_ask": {"original": "Keep Jev in Jarvis.", "authority": "EVENS", "may_rewrite": False},
        "builder": {
            "platform": "cursor",
            "agent": "cursor_background_agent",
            "engineering_function": "develop",
            "run_id": "builder-run",
        },
        "verifier": {
            "platform": "grok_bot",
            "agent": "watchdog",
            "engineering_function": "verify",
            "run_id": "verifier-run",
        },
        "reviewer": {
            "platform": "grok_bot",
            "agent": "consultant",
            "engineering_function": "review",
            "run_id": "reviewer-run",
        },
        "g2_checklist_path": "g2.json",
        "blocked": False,
        "unlock": "",
        "proof_status": "NOT_RUN",
        "bite_id": "T-1",
        "freeze": False,
        "acceptance": [
            {
                "id": "a",
                "requirement": "observable",
                "mandatory": True,
                "result": "NOT_RUN",
                "evidence_refs": [],
            }
        ],
        "runtime": {
            "surface": "127.0.0.1:4018",
            "entrypoint": "/api/watch",
            "expected_listen": "4018",
            "environment": "local",
            "address": "127.0.0.1:4018",
        },
    }
    claim.update(extra)
    return claim


def write_claim(tmp: Path, claim: dict, evidence: dict | None = None) -> Path:
    tmp.mkdir(parents=True, exist_ok=True)
    (tmp / "claim.json").write_text(json.dumps(claim, indent=2) + "\n", encoding="utf-8")
    if claim.get("state") not in {"SCOPED", "DONE"} and claim.get("revision") == 1:
        row = {
            "from": "SCOPED",
            "to": claim["state"],
            "revision": 1,
            "agent": "cursor_background_agent",
            "role": "builder",
            "ran_by": "hive-gate",
        }
        (tmp / "transitions.jsonl").write_text(json.dumps(row) + "\n", encoding="utf-8")
    if evidence is not None:
        (tmp / "evidence").mkdir(exist_ok=True)
        (tmp / "evidence" / "runtime.json").write_text(json.dumps(evidence) + "\n", encoding="utf-8")
    return tmp


class HiveJobGateTest(unittest.TestCase):
    def test_forbidden_done_is_fail(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hive-job-done-") as raw:
            tmp = write_claim(Path(raw), {"id": "JOB-FAKE-DONE", "state": "DONE", "revision": 0})
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("forbidden state", proc.stdout)

    def test_removed_shipped_state_is_fail(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_claim(Path(raw), base_claim("SHIPPED"))
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("forbidden state", proc.stdout)

    def test_notes_as_verified_is_fail(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hive-job-notes-") as raw:
            tmp = write_claim(
                Path(raw),
                base_claim("VERIFIED"),
                evidence={"kind": "markdown", "note": "Everything is implemented! Start Face."},
            )
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("cannot advance LIVE+", proc.stdout)

    def test_handwritten_live_is_fail(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            claim = base_claim("LIVE", revision=0)
            tmp = Path(raw)
            (tmp / "claim.json").write_text(json.dumps(claim), encoding="utf-8")
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("state edited outside hive-gate", proc.stdout)

    def test_builder_cannot_self_verify(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hive-job-self-") as raw:
            tmp = write_claim(
                Path(raw),
                base_claim(
                    "VERIFIED",
                    verifier={
                        "platform": "cursor",
                        "agent": "cursor_background_agent",
                        "engineering_function": "verify",
                        "run_id": "builder-run",
                    },
                ),
            )
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("builder may not stamp VERIFIED", proc.stdout)

    def test_handwritten_verifier_json_is_fail(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_claim(Path(raw), base_claim("VERIFIED"))
            (tmp / "evidence").mkdir(exist_ok=True)
            (tmp / "evidence" / "VERIFIER.json").write_text(
                json.dumps({"verifier": "grok", "verdict": "PASS"}),
                encoding="utf-8",
            )
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("not produced by the hive-gate receipt", proc.stdout)

    def test_implemented_unverified_needs_no_runtime(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hive-job-iu-") as raw:
            tmp = write_claim(Path(raw), base_claim("IMPLEMENTED_UNVERIFIED"))
            proc = run_verify(tmp, "--offline")
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)

    def test_job_json_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            (tmp / "job.json").write_text("{}", encoding="utf-8")
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("parallel work unit", proc.stderr + proc.stdout)

    def test_repo_fake_done_fixture_fails(self) -> None:
        proc = run_verify(CAPEX / "fixtures" / "JOB-FAKE-DONE", "--offline")
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("FAIL", proc.stderr)

    def test_repo_notes_fixture_fails(self) -> None:
        proc = run_verify(CAPEX / "fixtures" / "JOB-NOTES-AS-DONE", "--offline")
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("cannot advance LIVE+", proc.stdout + proc.stderr)

    def test_jev_claim_is_scoped_not_a_handwritten_live(self) -> None:
        proc = run_verify(CAPEX / "JOB-JEV-001", "--offline")
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertIn("SCOPED", proc.stdout)

    def test_researcher_cannot_develop(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            claim = base_claim("SCOPED", revision=0)
            claim["builder"] = {
                "platform": "grok_bot",
                "agent": "researcher",
                "engineering_function": "develop",
                "run_id": "",
            }
            tmp = Path(raw)
            (tmp / "claim.json").write_text(json.dumps(claim), encoding="utf-8")
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("not authorized for develop", proc.stdout)
            self.assertIn("remains a Grok Bot agent", proc.stdout)

    def test_forge_is_not_a_verifier(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            claim = base_claim("SCOPED", revision=0)
            claim["verifier"] = {
                "platform": "grok_bot",
                "agent": "forge",
                "engineering_function": "verify",
                "run_id": "verifier-run",
            }
            tmp = Path(raw)
            (tmp / "claim.json").write_text(json.dumps(claim), encoding="utf-8")
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("forge performs develop on grok_bot and is not a verifier", proc.stdout)

    def test_registry_is_derived(self) -> None:
        proc = subprocess.run(
            [sys.executable, str(CLI), "registry"],
            capture_output=True,
            text=True,
            cwd=str(ROOT),
        )
        self.assertEqual(proc.returncode, 0, proc.stdout)
        data = json.loads(proc.stdout)
        self.assertTrue(data["derived"])
        states = {row["id"]: row["state"] for row in data["capabilities"]}
        self.assertEqual(states.get("JOB-JEV-001"), "SCOPED")


if __name__ == "__main__":
    unittest.main()
