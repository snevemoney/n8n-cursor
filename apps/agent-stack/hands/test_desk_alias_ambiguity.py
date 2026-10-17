"""Review 2026-10-15: common English words are not desk names; full names and unambiguous acronyms still are."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("desk_alias_amb", Path(__file__).with_name("desk_dispatch.py"))
D = importlib.util.module_from_spec(spec)
spec.loader.exec_module(D)


class Aliases(unittest.TestCase):
    def test_plain_words_are_not_desks(self):
        for u in ("ask the boss for a raise", "ask the planner what to do", "ask career advice",
                  "ask boss man", "ask creative people", "ask money questions", "ask wealth experts",
                  "ask publishing houses"):
            self.assertEqual(D.args_from_utterance(u), {}, u)

    def test_real_desks_still_resolve(self):
        cases = {"ask big boss about priorities": "big-boss", "ask the money desk about the budget": "money-desk",
                 "ask the day planner to plan Friday": "day-planner", "ask cfo about rent": "personal-cfo",
                 "ask the comms manager for a draft": "communications-manager",
                 "ask the creative studio desk to storyboard": "creative-studio"}
        for u, desk in cases.items():
            self.assertEqual(D.args_from_utterance(u).get("desk"), desk, u)


if __name__ == "__main__":
    unittest.main()
