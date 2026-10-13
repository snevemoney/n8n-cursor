"""Z02 pointer: on-device locate -> native arrow; no confirm, no screenshot leaves the Mac."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P  # noqa: E402

PT = P._pointer_hand()


class PointerTest(unittest.TestCase):
    def test_route_no_confirm(self):
        for u in ["Where do I click to turn on notifications?", "Hey Jarvis, can you show me where is the button to click on and create a new Instagram reel?",
                  "point to the save icon"]:
            self.assertEqual(P.model_free_route(u)["tool"], "pointer", u)
        self.assertNotIn("pointer", P.CONFIRM_TOOLS)
        self.assertNotIn("pointer", P.CONFIRM_LINES)

    def test_keywords(self):
        k = PT.keywords("can you show me where is the button to click on and create a new Instagram reel?")
        self.assertIn("create", k); self.assertIn("reel", k); self.assertNotIn("click", k)

    def test_run_draws_arrow_on_device(self):
        drawn, hovered = [], []
        got = PT.run("where do I click to open Routines", locate_fn=lambda k: {"found": True, "x": 1200.5, "y": 365, "label": "Routines", "source": "ax"},
                     draw_fn=lambda x, y, l: drawn.append((x, y, l)) or True, hover_fn=lambda x, y: hovered.append((x, y)) or True,
                     where_fn=lambda x, y: "right")
        self.assertEqual(drawn, [(1200.5, 365.0, "Routines")]); self.assertEqual(hovered, [(1200.5, 365.0)])
        self.assertEqual(got["source"], "ax"); self.assertIn("red arrow", got["spoken"])
        self.assertNotIn("screenshot", got["spoken"].lower()); self.assertNotIn("confirm", got["spoken"].lower())

    def test_not_found_is_honest(self):
        got = PT.run("where do I click to zzz", locate_fn=lambda k: {"found": False, "why": "no on-screen match"},
                     draw_fn=lambda *a: self.fail("no draw"), hover_fn=lambda *a: self.fail("no hover"))
        self.assertFalse(got["found"]); self.assertIn("can't find", got["spoken"])


if __name__ == "__main__":
    unittest.main()
