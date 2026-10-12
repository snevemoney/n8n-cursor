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

    def test_proven_string_without_experiment_receipt_cannot_adopt(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root=Path(raw); cand=root/'candidates'; cand.mkdir()
            path=cand/'CAND-FAKE.json'
            path.write_text(json.dumps({"id":"CAND-FAKE","authority":"LOCAL_EXPERIMENT","may_change_goal":False,"experiment":"EXP-MISSING","result":"PROVEN","status":"CANDIDATE"}))
            proc=run(root,"promote","--candidate","CAND-FAKE")
            self.assertNotEqual(proc.returncode,0,proc.stdout)
            self.assertEqual(json.loads(path.read_text())["status"],"CANDIDATE")
            self.assertIn("experiment",proc.stdout)

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


class SourceFreshnessPromotionTest(unittest.TestCase):
    """Synthetic receipts in temporary directories, never live capability proof."""

    def test_promotion_requires_current_bound_source(self) -> None:
        import hashlib
        import importlib.machinery
        import importlib.util
        import io
        from contextlib import redirect_stdout
        from unittest.mock import patch

        def load(name: str, path: Path):
            spec = importlib.util.spec_from_file_location(name, path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module

        owner = CLI.parent
        helper = load("freshness_transition_fixture", owner / "test_hive_gate.py")
        gate = load("freshness_transition_gate", owner / "hive-gate.py")
        signal = load("freshness_signal", CLI)
        job_path = owner / "hive-job.py"
        original_loader = importlib.machinery.SourceFileLoader.exec_module
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            capex = tmp / "capex"
            claim_dir = capex / "EXP-FIXTURE"
            implementation = tmp / "implementation.py"
            implementation.write_text("version=1\n", encoding="utf-8")
            evidence = helper.live_evidence(tmp)
            evidence.update(
                git_sha=gate.hive_job.head_sha(),
                source_hashes={"implementation.py": hashlib.sha256(implementation.read_bytes()).hexdigest()},
            )
            helper.write_claim(
                claim_dir, "LIVE", evidence,
                runtime={**evidence, "source_paths": ["implementation.py"]},
                acceptance=[{"id": "a", "requirement": "temporary fixture content", "mandatory": True,
                             "result": "PASS", "evidence_refs": ["evidence/runtime.json"]}],
                regression={"argv": [sys.executable, "-c",
                            'from pathlib import Path; assert Path("implementation.py").read_text()=="version=1\\n"'],
                            "cwd": str(tmp)},
            )
            with redirect_stdout(io.StringIO()):
                rc = gate.request_transition(claim_dir, "VERIFIED", "watchdog", "verifier",
                                             "LIVE", 1, "grok_bot", "verifier-run", "")
            self.assertEqual(rc, 0)
            base_claim = json.loads((claim_dir / "claim.json").read_text())
            corpus = tmp / "signals"
            (corpus / "candidates").mkdir(parents=True)
            candidate_path = corpus / "candidates/CAND-FIXTURE.json"
            document = {"id": "CAND-FIXTURE", "experiment": "EXP-FIXTURE", "result": "PROVEN",
                        "authority": "LOCAL_ENGINEERING", "may_change_goal": False}

            def loader(self, module):
                original_loader(self, module)
                if Path(self.path) == job_path:
                    module.CAPEX = capex

            for case in ("unchanged", "changed", "omitted_identity"):
                with self.subTest(case=case):
                    implementation.write_text("version=1\n" if case == "unchanged" else "version=2\n")
                    claim = json.loads(json.dumps(base_claim))
                    if case == "omitted_identity":
                        claim["runtime"].pop("source_paths")
                    (claim_dir / "claim.json").write_text(json.dumps(claim))
                    candidate_path.write_text(json.dumps(document))
                    with patch.object(importlib.machinery.SourceFileLoader, "exec_module", loader), redirect_stdout(io.StringIO()):
                        rc = signal.promote(corpus, "CAND-FIXTURE", False)
                    self.assertEqual(rc, 0 if case == "unchanged" else 1)
                    self.assertEqual(json.loads(candidate_path.read_text()).get("status") == "ADOPTED",
                                     case == "unchanged")


if __name__ == "__main__":
    unittest.main()
