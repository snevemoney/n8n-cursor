"""Z09 meeting pre-brief offer + prep."""
import json
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P  # noqa: E402

PB = P._prebrief_hand()
NOW = datetime(2026, 10, 13, 13, 40)
CAL = lambda: {"ok": True, "events": ["9:00:00 AM Standup", "2:00:00 PM Sync with Zubair", "4:30:00 PM Dentist"]}


class PrebriefTest(unittest.TestCase):
    def test_offer_once(self):
        hive = Path(tempfile.mkdtemp()); (hive / "bus").mkdir()
        (hive / "bus" / "state.json").write_text("{}")
        line = PB.tick(hive, cal_fn=CAL, mutate_fn=P.mutate_bus, now=NOW)
        self.assertIn("Sync with Zubair", line); self.assertIn("20 minutes", line)
        bus = json.loads((hive / "bus" / "state.json").read_text())
        self.assertEqual(bus["prebrief"]["gen"], 1)
        self.assertIsNone(PB.tick(hive, cal_fn=CAL, mutate_fn=P.mutate_bus, now=NOW))  # once per event
        self.assertIsNone(PB.tick(hive, cal_fn=CAL, mutate_fn=P.mutate_bus, now=datetime(2026, 10, 13, 11, 0)))

    def test_prep_and_route(self):
        got = PB.prep("prep me", cal_fn=CAL, now=NOW,
                      search_fn=lambda q: {"hits": [{"file": "notes/zubair-sync.md", "snippet": "Agreed: ship score30"}]} if "Zubair" in q else {})
        self.assertIn("zubair-sync.md", got["spoken"]); self.assertIn("ship score30", got["spoken"])
        self.assertEqual(P.model_free_route("prep me for my next meeting")["tool"], "prebrief")
        self.assertEqual(P.model_free_route("yes, prep me")["tool"], "prebrief")
        self.assertFalse(PB.prep("prep me", cal_fn=lambda: {"ok": False, "spoken": "Calendar denied."}, search_fn=dict)["ok"])

    def test_pane_hook(self):
        html = (Path(P.STACK) / "face" / "pane.html").read_text()
        self.assertIn("paintPrebrief(bus);", html)


if __name__ == "__main__":
    unittest.main()
