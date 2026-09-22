#!/usr/bin/env python3
"""Forge rejects illegal transitions. Slack is not runtime proof."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CLI = Path(__file__).resolve().parent / "forge-transition.py"


def write_job(tmp: Path, state: str, evidence: dict | None = None, **extra: object) -> Path:
    job = {
        "id": "JOB-TX",
        "title": "transition fixture",
        "state": state,
        "builder": "cursor",
        "verifier": "grok",
        "operator_ask": {
            "original": "Put Jev in Jarvis for browser use and computer use.",
            "authority": "EVENS",
            "may_rewrite": False,
        },
        "acceptance": ["observable"],
        "non_goals": [],
        "runtime": {"expected_face": "127.0.0.1:4018"},
        "evidence": {"required": ["live_request"]},
    }
    job.update(extra)
    tmp.mkdir(parents=True, exist_ok=True)
    (tmp / "job.json").write_text(json.dumps(job), encoding="utf-8")
    if evidence is not None:
        (tmp / "evidence").mkdir(exist_ok=True)
        (tmp / "evidence" / "runtime.json").write_text(json.dumps(evidence), encoding="utf-8")
    return tmp


def request(tmp: Path, target: str, actor: str, role: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            str(CLI),
            "request",
            "--job-dir",
            str(tmp),
            "--to",
            target,
            "--actor",
            actor,
            "--role",
            role,
        ],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )


class ForgeTransitionTest(unittest.TestCase):
    def test_skip_to_verified_is_illegal(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(Path(raw), "IMPLEMENTED_UNVERIFIED")
            proc = request(tmp, "VERIFIED", "grok", "verifier")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("illegal transition", proc.stdout)

    def test_slack_cannot_prove_live(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(
                Path(raw),
                "WIRED",
                {"kind": "slack", "live_request": {"channel": "#hive"}, "surface": "127.0.0.1:4018"},
            )
            proc = request(tmp, "LIVE", "grok", "verifier")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("truth order", proc.stdout)

    def test_wrong_surface_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(
                Path(raw),
                "WIRED",
                {"kind": "live_face", "live_request": {"path": "/"}, "surface": "evenslouis.ca"},
            )
            proc = request(tmp, "LIVE", "grok", "verifier")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("wrong surface", proc.stdout)

    def test_builder_cannot_request_verified(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(
                Path(raw),
                "LIVE",
                {"kind": "live_face", "live_request": {"path": "/api/turn"}, "surface": "127.0.0.1:4018"},
            )
            proc = request(tmp, "VERIFIED", "cursor", "verifier")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("builder cannot certify", proc.stdout)

    def test_research_cannot_mutate(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(
                Path(raw),
                "WIRED",
                {
                    "kind": "live_face",
                    "live_request": {"path": "/api/watch"},
                    "surface": "127.0.0.1:4018",
                    "authority": "EXTERNAL_RESEARCH",
                    "may_change_goal": True,
                },
            )
            proc = request(tmp, "LIVE", "grok", "verifier")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("external research", proc.stdout)

    def test_missing_operator_ask_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(Path(raw), "READY", operator_ask={})
            proc = request(tmp, "IMPLEMENTING", "cursor", "builder")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("operator_ask", proc.stdout)

    def test_verifier_live_on_matching_surface_accepted(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp = write_job(
                Path(raw),
                "WIRED",
                {
                    "kind": "live_face",
                    "live_request": {"path": "/api/watch"},
                    "live_response": {"ok": True},
                    "surface": "127.0.0.1:4018",
                },
            )
            proc = request(tmp, "LIVE", "grok", "verifier")
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            self.assertIn("TRANSITION_ACCEPTED", proc.stdout)
            self.assertIn('"applied": false', proc.stdout)

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
