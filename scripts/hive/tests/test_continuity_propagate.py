#!/usr/bin/env python3
"""Harmless-fact propagation on the existing session-matrix sync path."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SCRIPT = ROOT / "scripts/hive/os/session-matrix.py"
FIXTURE = HERE / "fixtures" / "session-matrix-heads.json"
OS_DIR = ROOT / "scripts/hive/os"
if str(OS_DIR) not in sys.path:
    sys.path.insert(0, str(OS_DIR))

import continuity_propagate as prop  # noqa: E402

CODEWORD = "blue-kettle-37"
STALE_CODEWORD = "red-kettle-01"
KEY = "harmless-codeword"


def _fact(version: int, value: str, learned_at: str, **extra: object) -> dict:
    body = {
        "schema": prop.SCHEMA,
        "kind": "fact",
        "fact_id": "harmless-fact-1",
        "key": KEY,
        "value": value,
        "platform": "cursor",
        "learned_at": learned_at,
        "version": version,
        "audience": ["librarian"],
    }
    body.update(extra)
    return body


def _capability() -> dict:
    return {
        "schema": prop.SCHEMA,
        "kind": "capability",
        "fact_id": "cap-continuity-propagate",
        "key": "capability.continuity.propagate",
        "value": "session-store fact projection",
        "platform": "cursor",
        "learned_at": "2026-09-25T01:20:00Z",
        "version": 1,
        "audience": ["librarian"],
        "adapters": {
            "cursor": "IMPLEMENTED_UNVERIFIED",
            "grok": "NEEDS_WORK",
            "claude-code": "NEEDS_WORK",
            "codex": "NEEDS_WORK",
            "chatgpt": "NEEDS_WORK",
            "jarvis": "NEEDS_WORK",
        },
    }


class HarmlessFactPropagationTest(unittest.TestCase):
    def test_sync_projects_current_fact_without_evens(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "os"
            first = self._learn(root, _fact(1, CODEWORD, "2026-09-25T01:00:00Z"))
            self.assertTrue(first["ok"])
            self.assertFalse(first["evens_paste"])
            self.assertFalse(first["duplicated"])
            self.assertEqual(first["delivered_to"], ["jarvis", "librarian"])

            second = self._learn(root, _fact(2, "blue-kettle-38", "2026-09-25T01:05:00Z"))
            self.assertEqual(second["current"]["value"], "blue-kettle-38")
            self.assertEqual(second["current"]["version"], 2)

            stale = self._learn(
                root,
                _fact(1, STALE_CODEWORD, "2026-09-25T00:50:00Z", fact_id="harmless-fact-stale"),
            )
            self.assertTrue(stale["ok"])
            self.assertEqual(stale["current"]["value"], "blue-kettle-38")
            outcomes = [row["outcome"] for row in stale["conflicts"]]
            self.assertIn("rejected_stale", outcomes)
            self.assertNotIn(STALE_CODEWORD, [stale["current"]["value"]])

            again = self._learn(root, _fact(2, "blue-kettle-38", "2026-09-25T01:05:00Z"))
            self.assertTrue(again["duplicated"])
            self.assertFalse(again["appended"])
            self.assertEqual(again["log_count"], 3)

            jarvis = prop.read_projection(root, "jarvis")
            librarian = prop.read_projection(root, "librarian")
            forge = prop.read_projection(root, "forge")
            self.assertIsNotNone(jarvis)
            self.assertIsNotNone(librarian)
            assert jarvis is not None and librarian is not None
            self.assertEqual(jarvis["facts"][KEY]["current"]["value"], "blue-kettle-38")
            self.assertEqual(librarian["facts"][KEY]["current"]["value"], "blue-kettle-38")
            self.assertFalse(jarvis["evens_paste"])
            self.assertFalse(librarian["evens_paste"])
            self.assertEqual(len(jarvis["facts"][KEY]["history"]), 1)
            self.assertIsNone(forge)
            names = sorted(p.name for p in (root / "sessions" / "projections").glob("*.json"))
            self.assertEqual(names, ["jarvis.json", "librarian.json"])

            log = (root / "sessions" / "continuity-facts.jsonl").read_text(encoding="utf-8")
            self.assertEqual(log.count("\n"), 3)
            self.assertNotIn("PASTE", log)
            paste = root / "PASTE-PACK.md"
            self.assertFalse(paste.exists())

            rebuilt = prop.propagate_root(root)
            self.assertFalse(rebuilt["evens_paste"])
            self.assertEqual(rebuilt["log_count"], 3)
            self.assertEqual(
                prop.read_projection(root, "jarvis")["facts"][KEY]["current"]["value"],
                "blue-kettle-38",
            )

    def test_capability_names_adapters_and_refuses_a_gap(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "os"
            missing = dict(_capability())
            missing["adapters"] = {"cursor": "IMPLEMENTED_UNVERIFIED"}
            refused = prop.learn_fact(root, missing)
            self.assertFalse(refused["ok"])
            self.assertEqual(refused["error"], "capability_missing_adapters")
            self.assertIn("grok", refused["missing"])
            self.assertFalse((root / "sessions" / "continuity-facts.jsonl").exists())

            live = _capability()
            live["adapters"] = dict(live["adapters"])
            live["adapters"]["jarvis"] = "LIVE"
            certified = prop.learn_fact(root, live)
            self.assertFalse(certified["ok"])
            self.assertEqual(certified["error"], "self_certification_refused")

            recorded = prop.learn_fact(root, _capability())
            self.assertTrue(recorded["ok"])
            self.assertEqual(
                recorded["adapters_needing_work"],
                ["grok", "claude-code", "codex", "chatgpt", "jarvis"],
            )
            jarvis = prop.read_projection(root, "jarvis")
            assert jarvis is not None
            current = jarvis["facts"]["capability.continuity.propagate"]["current"]
            self.assertEqual(current["adapters"]["cursor"], "IMPLEMENTED_UNVERIFIED")
            self.assertNotIn("VERIFIED", current["adapters"].values())
            self.assertNotIn("LIVE", current["adapters"].values())

    def test_evens_and_broadcast_are_refused(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "os"
            evens = _fact(1, CODEWORD, "2026-09-25T01:00:00Z", platform="evens")
            self.assertEqual(prop.learn_fact(root, evens)["error"], "evens_is_not_the_bus")
            broadcast = _fact(1, CODEWORD, "2026-09-25T01:00:00Z", audience=["all"])
            self.assertEqual(prop.learn_fact(root, broadcast)["error"], "broadcast_refused")

    def test_existing_sync_hook_does_not_put_the_fact_in_the_paste_pack(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "os"
            fact_path = Path(tmp) / "fact.json"
            fact_path.write_text(
                json.dumps(_fact(1, CODEWORD, "2026-09-25T01:00:00Z")),
                encoding="utf-8",
            )
            learned = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--out-root",
                    str(root),
                    "--no-vault",
                    "--no-slack",
                    "learn-fact",
                    "--fact-json",
                    str(fact_path),
                ],
                cwd=str(ROOT),
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(learned.returncode, 0, learned.stderr)
            payload = json.loads(learned.stdout)
            self.assertFalse(payload["evens_paste"])
            self.assertEqual(payload["current"]["value"], CODEWORD)

            synced = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--heads-json",
                    str(FIXTURE),
                    "--out-root",
                    str(root),
                    "--no-vault",
                    "--no-slack",
                    "sync",
                ],
                cwd=str(ROOT),
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(synced.returncode, 0, synced.stderr)
            report = json.loads(synced.stdout)
            self.assertFalse(report["wrote"][0]["continuity"]["evens_paste"])
            paste = (root / "PASTE-PACK.md").read_text(encoding="utf-8")
            self.assertNotIn(CODEWORD, paste)
            self.assertNotIn(STALE_CODEWORD, paste)
            current = prop.read_projection(root, "jarvis")
            assert current is not None
            self.assertEqual(current["facts"][KEY]["current"]["value"], CODEWORD)
            self.assertIsNone(prop.read_projection(root, "forge"))

    def _learn(self, root: Path, fact: dict) -> dict:
        return prop.learn_fact(root, fact)


if __name__ == "__main__":
    unittest.main()
