"""Z01 narrated takeover + spoken handback."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P  # noqa: E402


class HandbackTest(unittest.TestCase):
    def setUp(self):
        self.hive = Path(tempfile.mkdtemp())
        (self.hive / "bus").mkdir()
        (self.hive / "bus" / "state.json").write_text(json.dumps({"turn_gen": 3, "watch": {"armed": True}}))

    def test_routes(self):
        for u in ["Stop, I'll take over.", "hands off", "okay, I'll take it from here", "let me drive"]:
            self.assertEqual(P.model_free_route(u)["tool"], "handback", u)
        for u in ["stop the music", "take over the meeting notes", "who takes over the desk"]:
            self.assertNotEqual((P.model_free_route(u) or {}).get("tool"), "handback", u)

    def test_narration_then_handback(self):
        P._narrate_step(self.hive, 3, 1, {"op": "click", "label": "Notifications"}, "Safari")
        P._narrate_step(self.hive, 3, 2, {"op": "type", "text": "hi"}, "Safari")
        w = json.loads((self.hive / "bus" / "state.json").read_text())["watch"]
        self.assertEqual(w["steps"], ["Step 1: Clicking Notifications in Safari.", 'Step 2: Typing "hi" in Safari.'])
        got = P.handback(self.hive, 3)
        self.assertTrue(got["ok"])
        self.assertFalse(got["task_verified"], "disarming Watch must not claim task proof")
        self.assertIn("wheel is yours", got["spoken"])
        self.assertIn("step 2", got["spoken"])
        w = json.loads((self.hive / "bus" / "state.json").read_text())["watch"]
        self.assertFalse(w["armed"])

    def test_handback_never_self_certifies_task(self):
        got = P.handback(self.hive, 3)
        self.assertTrue(got["ok"])
        self.assertFalse(got.get("task_verified"))
        self.assertFalse(got.get("sent"))


if __name__ == "__main__":
    unittest.main()
