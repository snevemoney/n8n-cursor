#!/usr/bin/env python3
"""A bookmark is not a rule. Promotion without a proven experiment fails."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CLI = Path(__file__).resolve().parent / "signal.py"
CORPUS = ROOT / "docs/hive/outer-heaven/CONTENT/os/signals"


def run(root: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(CLI), "--root", str(root), *args],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )


class SignalIntelligenceTest(unittest.TestCase):
    def test_raw_signal_is_immutable(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            first = run(root, "capture", "--id", "SIG-1", "--platform", "youtube", "--url", "https://youtu.be/abc", "--title", "One")
            self.assertEqual(first.returncode, 0, first.stdout)
            second = run(root, "capture", "--id", "SIG-1", "--platform", "x", "--url", "https://x.com/other", "--title", "Rewritten")
            self.assertNotEqual(second.returncode, 0, second.stdout)
            self.assertIn("immutable", second.stdout)

    def test_promote_without_experiment_fails(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            cand = root / "candidates"
            cand.mkdir(parents=True)
            (cand / "CAND-1.json").write_text(
                json.dumps({"id": "CAND-1", "kind": "CANDIDATE_RULE", "authority": "UNTRUSTED_DATA"}),
                encoding="utf-8",
            )
            proc = run(root, "promote", "--candidate", "CAND-1")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("candidate", proc.stdout)

    def test_write_rule_is_refused(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            proc = run(root, "promote", "--candidate", "CAND-X", "--write-rule")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("cannot write a Hive rule", proc.stdout)

    def test_untrusted_proven_cannot_promote_itself(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            cand = root / "candidates"
            cand.mkdir(parents=True)
            (cand / "CAND-2.json").write_text(
                json.dumps(
                    {
                        "id": "CAND-2",
                        "kind": "CANDIDATE_RULE",
                        "authority": "UNTRUSTED_DATA",
                        "may_change_goal": False,
                        "experiment": "EXP-1",
                        "result": "PROVEN",
                    }
                ),
                encoding="utf-8",
            )
            agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
            proc = run(root, "promote", "--candidate", "CAND-2")
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("untrusted", proc.stdout)
            self.assertEqual((ROOT / "AGENTS.md").read_text(encoding="utf-8"), agents)

    def test_pack_is_capped_claims(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            run(root, "capture", "--id", "SIG-1", "--platform", "youtube", "--url", "https://youtu.be/abc", "--title", "Eng")
            run(root, "claim", "--signal", "SIG-1", "--text", "Tests do not prove the user-facing feature exists.")
            run(root, "claim", "--signal", "SIG-1", "--text", "Unrelated cooking note about soup.")
            proc = run(root, "pack", "--query", "tests prove feature")
            self.assertEqual(proc.returncode, 0, proc.stdout)
            data = json.loads(proc.stdout.split("PASS")[0])
            self.assertEqual(len(data["claims"]), 1)
            self.assertIn("Tests do not prove", data["claims"][0]["text"])
            self.assertLessEqual(len(data["claims"]), data["cap"])

    def test_repo_video_pack_returns_claims_not_a_rule(self) -> None:
        proc = subprocess.run(
            [sys.executable, str(CLI), "pack", "--query", "runtime verification"],
            capture_output=True,
            text=True,
            cwd=str(ROOT),
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        data = json.loads(proc.stdout.split("PASS")[0])
        self.assertGreaterEqual(len(data["claims"]), 1)
        self.assertLessEqual(len(data["claims"]), 12)
        self.assertTrue((CORPUS / "raw").is_dir())
        self.assertFalse(data["complete"])
        raw = json.loads((CORPUS / "raw" / "SIG-20260922-VOK.json").read_text(encoding="utf-8"))
        self.assertFalse(raw["provenance"]["exact_source_preserved"])
        self.assertEqual(raw["provenance"]["preserved"], "url-and-title")
        refused = subprocess.run(
            [sys.executable, str(CLI), "promote", "--candidate", "CAND-20260922-VOK"],
            capture_output=True,
            text=True,
            cwd=str(ROOT),
        )
        self.assertNotEqual(refused.returncode, 0, refused.stdout)
        self.assertIn("candidate", refused.stdout)


if __name__ == "__main__":
    unittest.main()
