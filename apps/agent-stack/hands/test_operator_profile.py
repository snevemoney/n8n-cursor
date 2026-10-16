"""Evens 2026-10-16: everything he wants and cares about reaches Jarvis every job (Operator Profile)."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("op_prof_test", Path(__file__).with_name("operator.py"))
O = importlib.util.module_from_spec(spec)
spec.loader.exec_module(O)


class OperatorProfile(unittest.TestCase):
    def setUp(self):
        self.d = Path(tempfile.mkdtemp())
        (self.d / "EVENS-PROFILE.md").write_text("---\nversion: 1.0\n---\n# Evens\n## 1. North star\nAn AI company that runs itself.\n")
        (self.d / "COMMUNICATION-PROTOCOL.md").write_text("# Protocol\n## A. Evens → agent\n| do it for me | do it |\n## C. Agent → agent\nreceipts\n")
        (self.d / "GLOSSARY.md").write_text("# Glossary\n## Voice transcription\n| club code | Claude Code |\n## His systems\nx\n")

    def test_profile_protocol_and_mishearings_are_in_the_system_prompt(self):
        with mock.patch.object(O, "OPERATOR_PROFILE", self.d):
            p = O.system_prompt()
        self.assertIn("An AI company that runs itself", p)
        self.assertIn("do it for me", p)
        self.assertIn("club code", p)
        self.assertIn("PROPOSALS-INBOX.md", p)   # Jarvis logs new preferences the same turn

    def test_missing_folder_is_not_an_error(self):
        with mock.patch.object(O, "OPERATOR_PROFILE", self.d / "nope"):
            self.assertNotIn("Operator Profile", O.operator_profile())

    def test_secrets_never_reach_the_prompt(self):
        (self.d / "EVENS-PROFILE.md").write_text("key sk-or-v1-" + "a" * 40)
        with mock.patch.object(O, "OPERATOR_PROFILE", self.d):
            self.assertNotIn("sk-or-v1-aaaa", O.operator_profile())


if __name__ == "__main__":
    unittest.main()
