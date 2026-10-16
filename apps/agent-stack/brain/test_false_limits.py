"""Live 2026-10-16: a past false refusal ("no browser control capabilities") was parroted on the next ask."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_pipeline_false_limits", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)


class FalseLimits(unittest.TestCase):
    def test_past_self_denials_leave_the_history(self):
        turns = [{"user": "Can you open Spotify on my browser",
                  "jarvis": "Safari says it cannot open Spotify directly - no browser control capabilities. You'll need to open your browser yourself."},
                 {"user": "open LinkedIn", "jarvis": "I opened LinkedIn in Safari."}]
        brief = P.sitting_brief(turns, {}, retrieve_roots=[], utterance="Open Spotify on my browser")
        self.assertNotIn("no browser control", brief); self.assertIn("I opened LinkedIn in Safari", brief)

    def test_real_answers_stay(self):
        for line in ("Found 272 EPUB/PDF documents.", "FilmCraft is open.", "17 times 23 is 391."):
            self.assertFalse(P.FALSE_LIMIT_RE.search(line), line)


if __name__ == "__main__":
    unittest.main()
