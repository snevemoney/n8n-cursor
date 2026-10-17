"""Live 2026-10-16: speech-to-text heard "club code", "the gate hug", "Kodex"."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_pipeline_heard_test", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)


class Heard(unittest.TestCase):
    def test_his_names(self):
        self.assertEqual(P.heard("Club code has been making changes can you see it on GitHub"),
                         "Claude Code has been making changes can you see it on GitHub")
        self.assertEqual(P.heard("Not just club code look on the gate hug"), "Not just Claude Code look on GitHub")
        self.assertIn("Codex", P.heard("compete with cloud-based code agents like Kodex"))

    def test_ordinary_words_untouched(self):
        for s in ("the code in the cloud", "open the gate", "a hug", "I code every day", "Codex is working"):
            self.assertEqual(P.heard(s), s)


if __name__ == "__main__":
    unittest.main()
