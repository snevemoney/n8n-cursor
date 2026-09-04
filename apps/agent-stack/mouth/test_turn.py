#!/usr/bin/env python3
"""Mouth tests. Conversation is the default. No desk ASK. No Ollama."""
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


def _no_desk_ask(text: str) -> None:
    low = (text or "").lower()
    for leak in (
        "say yes to approve",
        "say yes to send",
        "send this to the grok desk",
        "do you want me to send this",
        "may i hand this",
        "queued for",
    ):
        if leak in low:
            raise AssertionError(f"desk ASK leaked: {text!r}")


class MouthTurnTest(unittest.TestCase):
    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_no_ollama_runtime(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn("import ollama", text)
        self.assertNotIn("11434", text)
        self.assertNotIn("mouth/brain.py", text)
        self.assertNotIn('parent / "brain.py"', text)
        brain = SCRIPT.parent.parent / "brain" / "online.py"
        if brain.is_file():
            brain_text = brain.read_text(encoding="utf-8")
            self.assertNotIn("11434", brain_text)
            self.assertNotIn("import ollama", brain_text)

    def test_deleted_desk_ask_classify(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn('return {"verb": "desk", "needs_ask": True', text)
        self.assertNotIn("May I hand this to the", text)

    def test_normal_sentences_converse_no_ask_no_queue(self) -> None:
        lines = ("what's my north star", "hey how are you", "remember this")
        with tempfile.TemporaryDirectory(prefix="agent-stack-converse-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            for line in lines:
                plan = MOD.classify(line)
                self.assertEqual(plan["verb"], "converse", line)
                self.assertFalse(plan["needs_ask"], line)
                self.assertEqual(plan["host"], "online", line)
                out = MOD.apply_turn(line, hive=hive, retrieve_roots=[vault], grok=_fake_grok)
                self.assertFalse(out["ask"], line)
                self.assertIsNone(out.get("permission_ask"))
                self.assertNotIn("Queued", out["spoken"])
                _no_desk_ask(out["spoken"])
                self.assertFalse((hive / "bus" / "jobs.jsonl").is_file())

    def test_send_this_email_refuses(self) -> None:
        self.assertEqual(MOD.classify("send this email")["verb"], "refuse")
        self.assertFalse(MOD.classify("send this email")["needs_ask"])
        with tempfile.TemporaryDirectory(prefix="agent-stack-send-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            out = MOD.apply_turn("send this email", hive=hive)
            self.assertEqual(out["verb"], "refuse")
            self.assertFalse(out["ask"])
            _no_desk_ask(out["spoken"])
            self.assertFalse((hive / "bus" / "jobs.jsonl").is_file())

    def test_missing_grok_vault_or_names_wire(self) -> None:
        def dark(_prompt: str, context: str = "") -> dict:
            return {"ok": False, "unknown": True, "spoken": ""}

        with tempfile.TemporaryDirectory(prefix="agent-stack-dark-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            vaulted = MOD.apply_turn(
                "what's my north star",
                hive=hive,
                retrieve_roots=[vault],
                grok=dark,
            )
            self.assertFalse(vaulted["ask"])
            self.assertIn("leverage", (vaulted["spoken"] or "").lower())
            _no_desk_ask(vaulted["spoken"])

            empty = hive / "empty"
            empty.mkdir()
            missing = MOD.apply_turn(
                "what should I work on",
                hive=hive,
                retrieve_roots=[empty],
                grok=dark,
            )
            self.assertFalse(missing["ask"])
            self.assertIn("I can't reach Grok", missing["spoken"])
            self.assertIn("XAI_API_KEY", missing["spoken"])
            _no_desk_ask(missing["spoken"])
            self.assertFalse((hive / "bus" / "jobs.jsonl").is_file())


if __name__ == "__main__":
    unittest.main()
