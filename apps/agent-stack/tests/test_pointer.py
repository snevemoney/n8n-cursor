"""Z02 pointer pill: route, confirm-gated, parse, draw without clicking."""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P  # noqa: E402

PT = P._pointer_hand()


class PointerTest(unittest.TestCase):
    def test_route_and_gate(self):
        for u in ["Where do I click to turn on notifications?", "where is the share button", "point to the save icon"]:
            self.assertEqual(P.model_free_route(u)["tool"], "pointer", u)
        self.assertIn("pointer", P.CONFIRM_TOOLS)
        self.assertIn("confirm", P.CONFIRM_LINES["pointer"])
        self.assertNotEqual((P.model_free_route("what's the weather") or {}).get("tool"), "pointer")

    def test_parse(self):
        self.assertEqual(PT.parse('x {"found": true, "label": "Share", "x": 0.9, "y": 0.1}')["label"], "Share")
        self.assertFalse(PT.parse('{"found": false, "why": "not visible"}')["found"])
        self.assertIsNone(PT.parse('{"found": true, "x": 2, "y": 0.1}'))
        self.assertIsNone(PT.parse("no json"))

    def test_run_draws_and_never_clicks(self):
        hive = Path(tempfile.mkdtemp())
        shot = hive / "s.png"
        shot.write_bytes(b"\x89PNG fake")
        drawn = []
        got = PT.run("where do I click to share", hive=hive,
                     grab_fn=lambda h, bounds=None: {"ok": True, "path": str(shot)},
                     vision_fn=lambda prompt, images: '{"found": true, "label": "Share", "x": 0.92, "y": 0.08}',
                     spawn=drawn.append)
        self.assertTrue(got["ok"]) ; self.assertTrue(got["found"])
        self.assertIn("Share", got["spoken"]); self.assertIn("top right", got["spoken"])
        self.assertEqual(drawn[0][1:4], ["0.9200", "0.0800", "Share"])
        self.assertFalse(shot.exists())  # screenshot deleted


if __name__ == "__main__":
    unittest.main()
