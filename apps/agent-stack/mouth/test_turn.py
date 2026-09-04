#!/usr/bin/env python3
"""Mouth tests. Online wires. No mic. No billed TTS. No Ollama."""
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


def _fake_grok(prompt: str, context: str = "") -> dict:
    return {
        "ok": True,
        "unknown": False,
        "wire": "grok",
        "engine": "xai",
        "spoken": f"Grok says {prompt[:60]}",
    }


def _fake_status(which: str = "all") -> dict:
    return {
        "ok": True,
        "verb": "status",
        "spoken": f"Hive 1/3. VPS live. Cursor present. slice={which}",
        "parts": [{"wire": "hive"}, {"wire": "vps"}, {"wire": "cursor"}],
    }


class MouthTurnTest(unittest.TestCase):
    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_no_ollama_runtime(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn("import ollama", text)
        self.assertNotIn("11434", text)
        brain = SCRIPT.parent.parent / "brain" / "online.py"
        brain_text = brain.read_text(encoding="utf-8")
        self.assertNotIn("11434", brain_text)
        self.assertNotIn("import ollama", brain_text)
        self.assertIn("No Ollama", brain_text)

    def test_classify_online(self) -> None:
        self.assertEqual(MOD.classify("what are the north stars")["verb"], "think")
        self.assertFalse(MOD.classify("what are the north stars")["needs_ask"])
        self.assertEqual(MOD.classify("research the inbound leak")["verb"], "think")
        self.assertFalse(MOD.classify("research the inbound leak")["needs_ask"])
        self.assertEqual(MOD.classify("what's the VPS status")["verb"], "status")
        self.assertEqual(MOD.classify("send this email")["verb"], "hard-ask")
        self.assertTrue(MOD.classify("send this email")["needs_ask"])
        self.assertEqual(MOD.classify("install ollama")["verb"], "refuse")

    def test_think_calls_grok_not_queue(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-think-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            out = MOD.apply_turn("what are the north stars", hive=hive, grok=_fake_grok)
            self.assertEqual(out["verb"], "think")
            self.assertFalse(out["ask"])
            self.assertIn("Grok says", out["spoken"])
            self.assertNotIn("Queued", out["spoken"])
            jobs = (hive / "bus" / "jobs.jsonl").read_text(encoding="utf-8")
            self.assertIn("online-think", jobs)
            self.assertNotIn("desk-turn", jobs)

    def test_missing_grok_names_wire(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-dark-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            out = MOD.apply_turn(
                "what should I work on",
                hive=hive,
                grok=lambda prompt, context="": MOD.ONLINE.unknown_grok(),
            )
            self.assertIn("UNKNOWN", out["spoken"])
            self.assertIn("XAI_API_KEY", out["spoken"])

    def test_status_calls_wires(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-status-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            out = MOD.apply_turn("hive status", hive=hive, status_fn=_fake_status)
            self.assertEqual(out["verb"], "status")
            self.assertIn("Hive", out["spoken"])
            self.assertIn("hive", out["wires"])

    def test_hard_step_ask_not_execute(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-ask-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            asked = MOD.apply_turn("deploy to production", hive=hive)
            self.assertTrue(asked["ask"])
            yes = MOD.apply_turn("yes", hive=hive)
            self.assertFalse(yes["ask"])
            self.assertIn("Draft only", yes["spoken"])


if __name__ == "__main__":
    unittest.main()
