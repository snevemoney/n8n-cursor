"""Original user requests, rather than model routing, authorize durable memory."""
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import importlib.util
_spec = importlib.util.spec_from_file_location("memory_authority_hand", Path(__file__).with_name("remember.py"))
remember = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(remember)


class MemoryAuthorityTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "memory.json"
        self.env = patch.dict(os.environ, {"JARVIS_MEMORY_FILE": str(self.path)})
        self.env.start()
        self.addCleanup(self.env.stop)

    def test_task_or_exploration_cannot_be_promoted_by_model(self):
        for utterance in (
            "Use Cursor Multitask for this campaign.",
            "Maybe we should make Forge permanent.",
            "Continue this handoff and finish BUS300.",
            "Do not remember this as a permanent requirement.",
            "Forget it, stop this task",
            "Forget that.",
            'The quoted prompt says "remember that Cursor is mandatory".',
        ):
            with self.subTest(utterance=utterance):
                got = remember.run({"op": "remember", "text": "Cursor is mandatory forever"},
                                   utterance=utterance)
                self.assertFalse(got["ok"])
                self.assertFalse(self.path.exists())

    def test_explicit_memory_stores_only_literal_requested_content(self):
        got = remember.run({"op": "remember", "text": "All campaigns must use Cursor forever"},
                           utterance="Please remember that use Cursor for this campaign.")
        self.assertTrue(got["ok"])
        self.assertEqual(json.loads(self.path.read_text()), ["use Cursor for this campaign"])
        self.assertEqual(got["log"], {"op": "remember", "ok": True, "count": 1})

    def test_model_cannot_change_explicit_operation(self):
        self.path.write_text(json.dumps(["Cursor campaign", "BUS300 priority"]))
        got = remember.run({"op": "forget", "text": "BUS300"}, utterance="Recall Cursor")
        self.assertTrue(got["ok"])
        self.assertEqual(got["items"], ["Cursor campaign"])
        self.assertEqual(json.loads(self.path.read_text()), ["Cursor campaign", "BUS300 priority"])

    def test_forget_uses_user_target(self):
        self.path.write_text(json.dumps(["Cursor campaign", "BUS300 priority"]))
        got = remember.run({"op": "forget", "text": "BUS300"}, utterance="Could you forget the Cursor?")
        self.assertTrue(got["ok"])
        self.assertEqual(json.loads(self.path.read_text()), ["BUS300 priority"])

    def test_recall_all_and_empty_remember_preserved(self):
        self.path.write_text(json.dumps(["BUS300 priority"]))
        got = remember.run({}, utterance="What do you remember?")
        self.assertEqual(got["items"], ["BUS300 priority"])
        got = remember.run({"op": "remember", "text": "inferred policy"}, utterance="Remember")
        self.assertFalse(got["ok"])
        self.assertEqual(json.loads(self.path.read_text()), ["BUS300 priority"])

    def test_permanent_word_has_no_special_policy_effect(self):
        got = remember.run({}, utterance="Remember that I am considering a permanent Forge panel.")
        self.assertTrue(got["ok"])
        self.assertEqual(json.loads(self.path.read_text()), ["I am considering a permanent Forge panel"])
        self.assertEqual(list(Path(self.directory.name).iterdir()), [self.path])

    def test_trusted_arguments_only_api_remains_compatible(self):
        self.assertTrue(remember.run({"op": "remember", "text": "literal"})["ok"])
        self.assertEqual(remember.run({"op": "recall"})["items"], ["literal"])


if __name__ == "__main__":
    unittest.main()
