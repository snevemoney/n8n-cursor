#!/usr/bin/env python3
"""Local brain tests. Extractive by default. No Grok queue."""
from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

os.environ["AGENT_STACK_NO_OLLAMA"] = "1"
SCRIPT = Path(__file__).resolve().parent / "brain.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_brain", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class BrainTest(unittest.TestCase):
    def test_extractive_from_vault(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-brain-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            out = MOD.answer("what are the north stars", [vault])
            self.assertEqual(out["host"], "local")
            self.assertEqual(out["engine"], "extractive")
            self.assertFalse(out["unknown"])
            self.assertIn("leverage", (out["spoken"] or "").lower())
            self.assertTrue(out["cites"])
            self.assertNotIn("Grok", out["spoken"])
            self.assertNotIn("queued", (out["spoken"] or "").lower())

    def test_unknown_is_spoken_not_queued(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-brain-miss-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text("nothing matching\n", encoding="utf-8")
            out = MOD.answer("what is the purple zebra protocol", [vault])
            self.assertEqual(out["host"], "local")
            self.assertTrue(out["unknown"])
            self.assertIn("UNKNOWN", out["spoken"])
            self.assertEqual(out["cites"], [])

    def test_ollama_used_when_probe_hits(self) -> None:
        hits = [{"path": "OPERATOR_MEMORY.md", "snippet": "Maximum leverage, minimum noise.", "score": 2}]
        with mock.patch.object(MOD, "probe_ollama", return_value={"ok": True, "model": "llama3.2:1b"}):
            with mock.patch.object(
                MOD, "think_ollama", return_value="Maximum leverage, minimum noise. Cited OPERATOR_MEMORY.md."
            ):
                with mock.patch.object(
                    MOD.RETRIEVE, "search", return_value={"ok": True, "hits": hits, "unknown": False}
                ):
                    out = MOD.answer("what are the north stars")
        self.assertEqual(out["host"], "local")
        self.assertEqual(out["engine"], "ollama")
        self.assertIn("leverage", out["spoken"].lower())
        self.assertNotIn("Grok", out["spoken"])

    def test_grok_tell_falls_back_to_extractive(self) -> None:
        hits = [{"path": "OPERATOR_MEMORY.md", "snippet": "Maximum leverage, minimum noise.", "score": 2}]
        with mock.patch.object(MOD, "probe_ollama", return_value={"ok": True, "model": "llama3.2:1b"}):
            with mock.patch.object(MOD, "think_ollama", return_value="I'll send this to Grokbot."):
                with mock.patch.object(
                    MOD.RETRIEVE, "search", return_value={"ok": True, "hits": hits, "unknown": False}
                ):
                    out = MOD.answer("what are the north stars")
        self.assertEqual(out["engine"], "extractive")
        self.assertNotIn("Grokbot", out["spoken"])


if __name__ == "__main__":
    unittest.main()
