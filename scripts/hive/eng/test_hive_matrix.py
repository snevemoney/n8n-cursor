#!/usr/bin/env python3
"""Conductor refuses the wrong function. A success doc before review is FAIL."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CLI = Path(__file__).resolve().parent / "hive-matrix.py"
JOBS = ROOT / "docs/hive/outer-heaven/CONTENT/os/jobs"


def run(cmd: str, directory: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(CLI), cmd, "--job-dir", str(directory)],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )


def write_job(tmp: Path, state: str, **extra: object) -> Path:
    job = {
        "id": "JOB-ROUTE",
        "title": "route fixture",
        "state": state,
        "builder": "cursor",
        "verifier": "grok",
        "acceptance": ["observable"],
        "non_goals": ["new os"],
        "runtime": {"expected_face": "127.0.0.1:4018"},
        "evidence": {"required": ["live_request"]},
    }
    job.update(extra)
    tmp.mkdir(parents=True, exist_ok=True)
    (tmp / "job.json").write_text(json.dumps(job), encoding="utf-8")
    return tmp


class HiveMatrixRouteTest(unittest.TestCase):
    def test_live_refuses_develop_and_document(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(Path(raw), "LIVE")
            develop = run("develop", tmp)
            document = run("document", tmp)
            self.assertNotEqual(develop.returncode, 0, develop.stdout)
            self.assertIn("refused", develop.stdout)
            self.assertNotEqual(document.returncode, 0, document.stdout)
            nxt = run("next", tmp)
            self.assertEqual(nxt.returncode, 0, nxt.stdout)
            self.assertIn("TEST", nxt.stdout)
            self.assertIn("Do not document success", nxt.stdout)

    def test_decision_owed_refuses_develop(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(Path(raw), "DECISION_OWED")
            proc = run("develop", tmp)
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("refused", proc.stdout)

    def test_ready_develop_without_reuse_fails(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(Path(raw), "READY")
            proc = run("develop", tmp)
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("REUSE_CHECK", proc.stdout)

    def test_ready_develop_extend_passes_guard(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(
                Path(raw),
                "READY",
                reuse_check={
                    "need": "executor",
                    "existing": ["face/serve.py"],
                    "decision": "extend",
                    "rejected": ["second pipeline"],
                },
            )
            proc = run("develop", tmp)
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)

    def test_regression_without_hypothesis_fails(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(Path(raw), "REGRESSION")
            proc = run("debug", tmp)
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("hypothesis", proc.stdout)

    def test_regression_one_hypothesis_passes_guard(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(Path(raw), "REGRESSION")
            (tmp / "evidence").mkdir()
            (tmp / "evidence" / "hypothesis.json").write_text(
                json.dumps({"hypothesis": "900ms converse steals the voice-mac line", "experiments": ["guard queueHeard"]}),
                encoding="utf-8",
            )
            proc = run("debug", tmp)
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)

    def test_two_experiments_fail(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(Path(raw), "REGRESSION")
            (tmp / "evidence").mkdir()
            (tmp / "evidence" / "hypothesis.json").write_text(
                json.dumps({"hypothesis": "x", "experiments": ["a", "b"]}),
                encoding="utf-8",
            )
            proc = run("debug", tmp)
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("one experiment", proc.stdout)

    def test_jev_job_next_is_test(self) -> None:
        proc = run("next", JOBS / "JOB-JEV-001")
        self.assertEqual(proc.returncode, 0, proc.stdout)
        self.assertIn('"lane_a": "TEST"', proc.stdout)
        develop = run("develop", JOBS / "JOB-JEV-001")
        self.assertNotEqual(develop.returncode, 0)


if __name__ == "__main__":
    unittest.main()
