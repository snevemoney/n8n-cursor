"""desk_dispatch must reach the whole 17-desk roster (plus Big Boss), not 4 desks."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent


def _load():
    spec = importlib.util.spec_from_file_location("desk_dispatch_roster", HERE / "desk_dispatch.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ROSTER = ["consultant", "money-desk", "forge", "personal-cfo", "researcher", "wealth-manager", "librarian",
          "hitl-operator", "disk-saver", "lead-hunter", "communications-manager", "watchdog", "creative-studio",
          "day-planner", "publishing-engine", "product-gtm", "career-strategist"]


class RosterTest(unittest.TestCase):
    def setUp(self) -> None:
        self.D = _load()

    def test_all_seventeen_desks_and_big_boss_are_valid_targets(self) -> None:
        for slug in ROSTER + ["big-boss"]:
            self.assertIn(slug, self.D.DESKS, slug)
        self.assertEqual(len(self.D.GROK_DESKS), 17)

    def test_existing_platform_targets_still_work(self) -> None:
        for slug in ("jev", "claude", "codex", "capex", "scout"):
            self.assertIn(slug, self.D.DESKS)

    def test_multi_word_desk_names_parse_from_speech(self) -> None:
        cases = {
            "Ask the Creative Studio desk to storyboard the ProofCheck launch": "creative-studio",
            "hand this to money desk: what did ArtCraft cost us": "money-desk",
            "Dispatch to the HITL operator: list approvals waiting": "hitl-operator",
            "ask personal CFO about this month's budget": "personal-cfo",
            "Ask Big Boss to rank today's priorities": "big-boss",
            "ask the communications manager to draft a reply": "communications-manager",
        }
        for utt, slug in cases.items():
            got = self.D.args_from_utterance(utt)
            self.assertEqual(got.get("desk"), slug, utt)
            self.assertTrue(got.get("ask"), utt)

    def test_card_is_written_with_desk_state_and_never_sent(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            fleet = Path(tmp) / "FLEET_STATUS.md"
            fleet.write_text("| Desk | State |\n|---|---|\n| Watchdog | STOPPED | Oct 8 |\n"
                             "| Creative Studio | RUNNING (DOC_ONLY) | Oct 10 |\n", encoding="utf-8")
            import os
            os.environ["JARVIS_FLEET_STATUS"] = str(fleet)
            try:
                got = self.D.run({"desk": "Watchdog", "ask": "verify the wake word branch"}, hive=Path(tmp))
                run2 = self.D.run({"desk": "creative studio", "ask": "make a 10 s teaser"}, hive=Path(tmp))
            finally:
                os.environ.pop("JARVIS_FLEET_STATUS", None)
            self.assertTrue(got["ok"])
            self.assertFalse(got["sent"])
            self.assertEqual(got["card"]["desk"], "watchdog")
            self.assertEqual(got["card"]["desk_state"], "STOPPED")
            self.assertIn("stopped", got["spoken"].lower())
            self.assertEqual(run2["card"]["desk"], "creative-studio")
            self.assertTrue(run2["card"]["desk_state"].startswith("RUNNING"))
            cards = list((Path(tmp) / ".hive" / "bus" / "desk_cards").glob("*.json"))
            self.assertEqual(len(cards), 2)
            self.assertFalse(json.loads(cards[0].read_text())["sent"])

    def test_unknown_desk_is_refused_honestly(self) -> None:
        got = self.D.run({"desk": "marketing wizard", "ask": "x"})
        self.assertFalse(got["ok"])
        self.assertIn("Nothing was sent", got["spoken"])


if __name__ == "__main__":
    unittest.main()
