#!/usr/bin/env python3
"""Mouth tests. No mic. No billed TTS."""
from __future__ import annotations

import importlib.util
import os
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

    def test_refuse_and_ask(self) -> None:
        self.assertEqual(MOD.classify("please deploy live")["verb"], "refuse")
        plan = MOD.classify("research the inbound leak")
        self.assertEqual(plan["verb"], "desk")
        self.assertTrue(plan["needs_ask"])
        self.assertEqual(plan["host"], "grok")


if __name__ == "__main__":
    unittest.main()
