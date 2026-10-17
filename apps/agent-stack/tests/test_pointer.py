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
        self.assertEqual(drawn, [(1200.5, 365.0, "Routines button")]); self.assertIn("click it to open Routines", got["spoken"]); self.assertEqual(hovered, [(1200.5, 365.0)])
        self.assertEqual(got["source"], "ax"); self.assertIn("red arrow", got["spoken"])
        self.assertNotIn("screenshot", got["spoken"].lower()); self.assertNotIn("confirm", got["spoken"].lower())

    def test_demo_label_and_line(self):  # storyboards/Z02 2:09: "Create button" tag; place + next step spoken
        ask = "Hey Jarvis, can you show me where is the button to click on and create a new Instagram reel?"
        got = PT.run(ask, locate_fn=lambda k: {"found": True, "x": 20, "y": 600, "label": "+", "role": "AXButton", "source": "ax"},
                     draw_fn=lambda *a: True, where_fn=lambda x, y: "left")
        self.assertEqual(got["label"], "Create button")
        self.assertIn("on the left of your screen", got["spoken"]); self.assertIn("click it to create a new Instagram reel", got["spoken"])

    def test_not_found_is_honest(self):
        got = PT.run("where do I click to zzz", locate_fn=lambda k: {"found": False, "why": "no on-screen match"},
                     draw_fn=lambda *a: self.fail("no draw"), hover_fn=lambda *a: self.fail("no hover"))
        self.assertFalse(got["found"]); self.assertIn("couldn't find", got["spoken"])


    def test_vision_box_maps_to_cursor_display(self):  # r3: icon "+" on the second display, global points
        disp = {"index": 2, "x": 1920.0, "y": 0.0, "w": 1512.0, "h": 982.0}
        got = PT.locate_vision("create a new Instagram reel", disp=disp, call_fn=lambda u, p: '{"found": true, "box_2d": [600, 10, 640, 30], '
                               '"label": "Create button", "where": "left sidebar", "app_visible": true, "confidence": 0.9}')
        self.assertTrue(got["found"]); self.assertTrue(1920 <= got["x"] <= 1920 + 1512); self.assertTrue(0 <= got["y"] <= 982)
        self.assertEqual(got["label"], "Create button")

    def test_vision_not_visible_never_points(self):
        got = PT.locate_vision("create a new Instagram reel", disp={"index": 1, "x": 0, "y": 0, "w": 100, "h": 100},
                               call_fn=lambda u, p: '{"found": true, "box_2d": [1,1,2,2], "label": "October calendar", "app_visible": false, "confidence": 0.8}')
        self.assertFalse(got["found"])


    def test_refine_maps_crop_box_and_rejects_miss(self):  # second, tighter look before any arrow/click
        import tempfile
        f = tempfile.NamedTemporaryFile(suffix=".png", delete=False); f.write(b"x"); f.close()
        r = PT.refine_box({"label": "Create button"}, f.name, (100.0, 200.0), 240.0, "create",
                          lambda u, p: '{"found": true, "box_2d": [500, 250, 600, 350]}')
        self.assertTrue(r["on_control"]); self.assertAlmostEqual(r["x"], 100 + 0.3 * 240); self.assertAlmostEqual(r["y"], 200 + 0.55 * 240)
        self.assertFalse(PT.refine_box({}, f.name, (0, 0), 240, "x", lambda u, p: '{"found": false}')["on_control"])


if __name__ == "__main__":
    unittest.main()
