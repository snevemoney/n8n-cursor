#!/usr/bin/env python3
"""Voice pick tests. No billed TTS. No classify / ASK changes."""
from __future__ import annotations

import importlib.util
import os
import unittest
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"
SCRIPT = Path(__file__).resolve().parent / "turn.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_mouth_voice", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class VoicePickTest(unittest.TestCase):
    def test_never_hardcodes_samantha_or_french(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn('say", "-v", "Samantha"', text)
        self.assertNotIn("say -v Samantha", text)
        self.assertNotIn("Amélie", text)
        self.assertNotIn("Jacques", text)
        self.assertIn("Daniel", text)
        self.assertIn("Tarquin", text)
        self.assertIn("bm_lewis", text)

    def test_prefers_daniel_over_french_and_samantha(self) -> None:
        voices = [
            ("Amélie", "fr-CA"),
            ("Jacques", "fr-FR"),
            ("Samantha", "en-US"),
            ("Daniel", "en-GB"),
            ("Eddy (French (France))", "fr-FR"),
        ]
        self.assertEqual(MOD.pick_say_voice(voices), "Daniel")

    def test_skips_french_even_if_only_choice_named_eddy(self) -> None:
        voices = [
            ("Eddy (French (France))", "fr-FR"),
            ("Reed (English (US))", "en-US"),
        ]
        self.assertEqual(MOD.pick_say_voice(voices), "Reed (English (US))")

    def test_samantha_only_if_no_better_english(self) -> None:
        self.assertEqual(MOD.pick_say_voice([("Samantha", "en-US")]), "Samantha")
        self.assertEqual(MOD.pick_say_voice([("Fred", "en-US"), ("Samantha", "en-US")]), "Fred")

    def test_empty_list_falls_to_daniel(self) -> None:
        self.assertEqual(MOD.pick_say_voice([]), "Daniel")

    def test_parse_say_table(self) -> None:
        raw = (
            "Daniel              en_GB    # Hello! My name is Daniel.\n"
            "Amélie              fr_CA    # Bonjour! Je m’appelle Amélie.\n"
        )
        rows = MOD.parse_say_voices(raw)
        self.assertEqual(rows, [("Daniel", "en-GB"), ("Amélie", "fr-CA")])
        self.assertEqual(MOD.pick_say_voice(rows), "Daniel")

    def test_dry_tts_never_calls_cloud(self) -> None:
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        self.assertEqual(MOD.tts_bytes("Hello Evens"), b"")
        MOD.speak_local("Hello Evens")

    def test_voice_report_is_english(self) -> None:
        report = MOD.voice_report()
        self.assertTrue(report["ok"])
        self.assertEqual(report["lang"], "en-GB")
        self.assertIn(report["engine"], ("say", "elevenlabs"))
        name = str(report.get("voice") or "").lower()
        self.assertFalse(name.startswith("amélie") or name.startswith("amelie") or name.startswith("jacques"))
        if report["engine"] == "say":
            self.assertNotEqual(report["voice"], "Amélie")


if __name__ == "__main__":
    unittest.main()
