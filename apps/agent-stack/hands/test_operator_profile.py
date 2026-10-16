"""Evens 2026-10-16: everything he wants and cares about reaches Jarvis every job (Operator Profile)."""
import importlib.util
import json
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


class OpsAlerts(unittest.TestCase):  # Evens 10-16: bring things to light, no pop-ups, once
    def setUp(self):
        self.d = Path(tempfile.mkdtemp())
        (self.d / "alerts.json").write_text(json.dumps([
            {"id": "credits", "level": "RED", "title": "OpenRouter is out of credits", "fix": "Top up", "owner": "Evens", "fresh": True},
            {"id": "prs", "level": "AMBER", "title": "PR backlog", "fix": "triage", "owner": "Forge", "fresh": True}]))
        self.seen = self.d / "mentioned.json"

    def test_new_alerts_reach_jarvis_once(self):
        with mock.patch.object(O, "OPS_WATCH", self.d), mock.patch.object(O, "OPS_MENTIONED", self.seen):
            first = O.ops_alerts()
            again = O.ops_alerts()
        self.assertIn("OpenRouter is out of credits", first)
        self.assertNotIn("PR backlog", first)          # agents' own items are not raised to him
        self.assertEqual(again, "")

    def test_no_alert_file_is_quiet(self):
        with mock.patch.object(O, "OPS_WATCH", self.d / "nope"), mock.patch.object(O, "OPS_MENTIONED", self.seen):
            self.assertEqual(O.ops_alerts(), "")


if __name__ == "__main__":
    unittest.main()
