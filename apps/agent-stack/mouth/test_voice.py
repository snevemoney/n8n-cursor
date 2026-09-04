#!/usr/bin/env python3
"""Repo voice tests. Dry TTS never bills. No macOS remap as the product."""
from __future__ import annotations

import importlib.util
import os
import unittest
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"
SCRIPT = Path(__file__).resolve().parent / "voice.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_voice_test", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class VoiceTest(unittest.TestCase):
    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_product_is_repo_british_butler(self) -> None:
        report = MOD.voice_report()
        self.assertEqual(report["lang"], "en-GB")
        self.assertEqual(report["repo"]["kokoro"], "bm_lewis")
        self.assertEqual(report["repo"]["elevenlabs"], "Tarquin")
        self.assertNotIn(report["voice"], {"Samantha", "Daniel"})
        self.assertNotEqual(report["engine"], "say")

    def test_dry_tts_is_silent(self) -> None:
        audio, mime = MOD.tts_audio("Hello Evens")
        self.assertEqual(audio, b"")
        self.assertEqual(mime, "")
        self.assertEqual(MOD.tts_bytes("Hello Evens"), b"")

    def test_no_macos_say_remap(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn('["say", "-v"', text)
        self.assertNotIn("say -v Samantha", text)
        self.assertNotIn("say -v Daniel", text)
        self.assertIn("bm_lewis", text)
        self.assertIn("7cOBG34AiHrAzs842Rdi", text)


if __name__ == "__main__":
    unittest.main()
