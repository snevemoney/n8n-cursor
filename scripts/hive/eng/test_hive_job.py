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
JOBS = ROOT / "docs/hive/outer-heaven/CONTENT/os/jobs"


def run_verify(directory: Path, *extra: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(CLI), "verify", "--job-dir", str(directory), *extra],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )


def write_job(tmp: Path, job: dict, evidence: dict | None = None, verifier: dict | None = None) -> Path:
    (tmp / "evidence").mkdir(parents=True, exist_ok=True)
    (tmp / "job.json").write_text(json.dumps(job, indent=2) + "\n", encoding="utf-8")
    if evidence is not None:
        (tmp / "evidence" / "runtime.json").write_text(
            json.dumps(evidence, indent=2) + "\n", encoding="utf-8"
        )
    if verifier is not None:
        (tmp / "evidence" / "VERIFIER.json").write_text(
            json.dumps(verifier, indent=2) + "\n", encoding="utf-8"
        )
    return tmp


class HiveJobGateTest(unittest.TestCase):
    def test_forbidden_done_is_fail(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hive-job-done-") as raw:
            tmp = Path(raw)
            write_job(
                tmp,
                {
                    "id": "JOB-FAKE-DONE",
                    "title": "I implemented Watch",
                    "state": "DONE",
                    "builder": "cursor",
                    "verifier": "grok",
                    "acceptance": ["Watch works"],
                    "non_goals": [],
                    "runtime": {"expected_face": "127.0.0.1:4018"},
                    "evidence": {"required": ["live_request"]},
                },
            )
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("forbidden state", proc.stdout)

    def test_notes_as_verified_is_fail(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hive-job-notes-") as raw:
            tmp = Path(raw)
            write_job(
                tmp,
                {
                    "id": "JOB-NOTES-AS-DONE",
                    "title": "Status says working",
                    "state": "VERIFIED",
                    "builder": "cursor",
                    "verifier": "grok",
                    "acceptance": ["Jarvis talks"],
                    "non_goals": [],
                    "runtime": {"entrypoint": "/api/turn", "expected_face": "127.0.0.1:4018"},
                    "evidence": {"required": ["live_request", "live_response"]},
                },
                evidence={"kind": "markdown", "note": "Everything is implemented! Start Face."},
            )
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("missing evidence.live_request", proc.stdout)
            self.assertIn("cannot advance LIVE+", proc.stdout)

    def test_builder_cannot_self_verify(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hive-job-self-") as raw:
            tmp = Path(raw)
            write_job(
                tmp,
                {
                    "id": "JOB-SELF",
                    "title": "Self stamp",
                    "state": "VERIFIED",
                    "builder": "cursor",
                    "verifier": "cursor",
                    "acceptance": ["path exists"],
                    "non_goals": [],
                    "runtime": {"expected_face": "127.0.0.1:4018"},
                    "evidence": {"required": ["live_request", "live_response"]},
                },
                evidence={
                    "live_request": {"path": "/api/watch"},
                    "live_response": {"ok": True},
                    "face_health": {"ok": True},
                },
                verifier={"verifier": "cursor", "verdict": "VERIFIED"},
            )
            proc = run_verify(tmp, "--offline")
            self.assertNotEqual(proc.returncode, 0, proc.stdout)
            self.assertIn("builder may not stamp VERIFIED", proc.stdout)

    def test_implemented_unverified_needs_no_runtime(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hive-job-iu-") as raw:
            tmp = Path(raw)
            write_job(
                tmp,
                {
                    "id": "JOB-IU",
                    "title": "Code exists",
                    "state": "IMPLEMENTED_UNVERIFIED",
                    "builder": "cursor",
                    "verifier": "grok",
                    "acceptance": ["unit exists"],
                    "non_goals": [],
                    "runtime": {"expected_face": "127.0.0.1:4018"},
                    "evidence": {"required": ["live_request"]},
                },
            )
            proc = run_verify(tmp, "--offline")
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)

    def test_repo_fake_done_fixture_fails(self) -> None:
        proc = run_verify(JOBS / "fixtures" / "JOB-FAKE-DONE", "--offline")
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("FAIL", proc.stderr)

    def test_repo_notes_fixture_fails(self) -> None:
        proc = run_verify(JOBS / "fixtures" / "JOB-NOTES-AS-DONE", "--offline")
        self.assertNotEqual(proc.returncode, 0)

    def test_jev_job_live_record_offline_pass(self) -> None:
        proc = run_verify(JOBS / "JOB-JEV-001", "--offline")
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertIn("LIVE", proc.stdout)


if __name__ == "__main__":
    unittest.main()
