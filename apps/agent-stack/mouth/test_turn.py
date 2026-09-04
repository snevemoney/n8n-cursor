#!/usr/bin/env python3
"""Mouth tests. Always-on classify + vault Q&A. No mic. No billed TTS."""
from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"
SCRIPT = Path(__file__).resolve().parent / "turn.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_mouth", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class MouthTurnTest(unittest.TestCase):
    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_always_on_classify(self) -> None:
        self.assertEqual(MOD.classify("what does my vault say about north stars")["verb"], "memory")
        self.assertFalse(MOD.classify("what does my vault say about north stars")["needs_ask"])
        self.assertEqual(MOD.classify("what are the north stars")["verb"], "memory")
        self.assertEqual(MOD.classify("yes")["verb"], "idle")
        plan = MOD.classify("research the inbound leak")
        self.assertEqual(plan["verb"], "desk")
        self.assertTrue(plan["needs_ask"])

    def test_vault_qa(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-vault-") as tmp:
            hive = Path(tmp)
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            (hive / "bus").mkdir()
            hit = MOD.apply_turn("what are the north stars", hive=hive, retrieve_roots=[vault])
            self.assertEqual(hit["verb"], "memory")
            self.assertFalse(hit["ask"])
            self.assertTrue(hit["cites"])
            self.assertIn("leverage", (hit["spoken"] or "").lower())
            miss = MOD.apply_turn("what is the purple zebra protocol", hive=hive, retrieve_roots=[vault])
            self.assertEqual(miss["verb"], "memory")
            self.assertIn("UNKNOWN", miss["spoken"])

    def test_refuse_hard_steps(self) -> None:
        self.assertEqual(MOD.classify("please deploy live")["verb"], "refuse")
        self.assertEqual(MOD.classify("send this email")["verb"], "refuse")
        self.assertEqual(MOD.classify("pay the invoice")["verb"], "refuse")
        self.assertEqual(MOD.classify("book a call and publish it")["verb"], "refuse")
        with tempfile.TemporaryDirectory(prefix="agent-stack-refuse-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            refused = MOD.apply_turn("deploy to production", hive=hive)
            self.assertEqual(refused["verb"], "refuse")
            self.assertFalse(refused["ask"])

    def test_ask_before_desk_jobs(self) -> None:
        plan = MOD.classify("research the inbound leak")
        self.assertEqual(plan["verb"], "desk")
        self.assertTrue(plan["needs_ask"])
        self.assertEqual(plan["host"], "grok")
        with tempfile.TemporaryDirectory(prefix="agent-stack-ask-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            asked = MOD.apply_turn("look at the inbound pipeline", hive=hive)
            self.assertTrue(asked["ask"])
            self.assertEqual(asked["verb"], "desk")
            yes = MOD.apply_turn("yes", hive=hive)
            self.assertFalse(yes["ask"])
            self.assertTrue((hive / "bus" / "jobs.jsonl").is_file())


if __name__ == "__main__":
    unittest.main()
