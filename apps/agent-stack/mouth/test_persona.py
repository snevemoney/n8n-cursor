#!/usr/bin/env python3
"""Persona wrap: Sir, no blame, no waiting-for, no invented again."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "persona.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_persona", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class PersonaWrapTest(unittest.TestCase):
    def test_wrap_addresses_sir_then_payload(self) -> None:
        out = MOD.wrap("Vault and hive are on the table.", verb="converse", utterance="what's going on")
        self.assertTrue(out.startswith("Sir."))
        self.assertIn("Vault and hive are on the table.", out)
        self.assertNotIn("waiting for", out.lower())

    def test_failure_never_takes_blame(self) -> None:
        out = MOD.wrap("UNKNOWN. Cursor harness returned no reply.", verb="converse")
        self.assertIn("Naturally, it isn't my fault, sir", out)
        self.assertIn("UNKNOWN. Cursor harness returned no reply.", out)
        self.assertNotRegex(out.lower(), r"\bmy fault\b")
        self.assertNotIn("waiting for", out.lower())

    def test_strips_waiting_for_and_blame(self) -> None:
        raw = "I am sorry. Waiting for the harness. The repo has three apps."
        out = MOD.wrap(raw, verb="cursor", utterance="check my repo")
        self.assertTrue(out.startswith("Sir."))
        self.assertIn("The repo has three apps.", out)
        self.assertNotIn("waiting for", out.lower())
        self.assertNotIn("I am sorry", out)
        self.assertNotIn("I'm sorry", out)

    def test_no_again_without_history(self) -> None:
        out = MOD.wrap("Clicked Login in Safari.", verb="safari", utterance="click Login")
        self.assertNotIn("again", out.lower())
        self.assertTrue(MOD.wrap("Found 1 local file.", verb="files", utterance="search my computer") )
        self.assertFalse(MOD.proven_repeat("click Login", turns=[], store_lines=[], scars=[]))

    def test_repeat_only_when_sitting_proves_it(self) -> None:
        turns = [{"user": "click Login", "jarvis": "Clicked Login in Safari."}]
        out = MOD.wrap(
            "Clicked Login in Safari.",
            verb="safari",
            utterance="click Login",
            turns=turns,
        )
        self.assertIn("again", out.lower())
        self.assertIn("Clicked Login in Safari.", out)
        fresh = MOD.wrap("Clicked Login in Safari.", verb="safari", utterance="click Login")
        self.assertNotIn("again", fresh.lower())

    def test_does_not_double_wrap(self) -> None:
        once = MOD.wrap("Standing by.", verb="greet")
        twice = MOD.wrap(once, verb="greet")
        self.assertEqual(once.count("Sir."), 1)
        self.assertEqual(twice, once)


if __name__ == "__main__":
    unittest.main()
