"""The red-arrow pointer finishes its own turn; a one-hand result survives a silent follow-up."""
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from brain import pipeline as P

ARROW = "The Create button is top left; click it. The red arrow is on it."


class TerminalHands(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.hive = Path(self.tmp.name) / "hive"; (self.hive / "bus").mkdir(parents=True)
        env = mock.patch.dict(os.environ, {"JARVIS_ACTION_LOG": "off", "JARVIS_MODE_FILE": str(Path(self.tmp.name) / "m.json")})
        env.start(); self.addCleanup(env.stop)
        self.talked = []

    def talk(self, *a, **k):
        self.talked.append(a)
        return "I cannot see your screen."

    def test_pointer_line_is_spoken_and_no_second_model_pass(self):
        ph = P._pointer_hand()
        with mock.patch.object(ph, "run", return_value={"ok": True, "found": True, "drawn": True, "source": "vision", "spoken": ARROW}):
            out = list(P.apply_pipeline_iter("where do I click to create a new reel?", hive=self.hive,
                                             talk_fn=self.talk, converse_fn=self.talk))
        self.assertIn("red arrow is on it", out[-1]["spoken"])
        self.assertEqual(self.talked, [])

    def test_cursor_demo_is_terminal(self):
        ph = P._pointer_hand()
        with mock.patch.object(ph, "cursor_demo", return_value={"ok": True, "spoken": "That's my cursor."}):
            out = list(P.apply_pipeline_iter("show me your cursor", hive=self.hive, talk_fn=self.talk, converse_fn=self.talk))
        self.assertIn("my cursor", out[-1]["spoken"])
        self.assertEqual(self.talked, [])

    def test_one_hand_result_kept_when_model_adds_nothing(self):
        pick = {"tool": "status", "args": {}}
        ran = {"ok": True, "tool": "status", "spoken": "All systems up.", "wires": ["status"], "cites": []}
        with mock.patch.object(P, "online_talk", return_value=None):
            gen = P._continue_hand_loop(pick, ran, "status?", hive=self.hive, token=None, brain="", brief="")
            try:
                while True:
                    next(gen)
            except StopIteration as stop:
                out = stop.value
        self.assertTrue(out["ok"])
        self.assertEqual(out["spoken"], "All systems up.")
        self.assertNotIn("I stopped before another action", out["spoken"])


if __name__ == "__main__":
    unittest.main()
