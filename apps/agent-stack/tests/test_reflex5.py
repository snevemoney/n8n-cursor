"""Z12 reflex gate: five decisions per utterance, numbers only."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from mouth import turn as T  # noqa: E402


class Reflex5Test(unittest.TestCase):
    def test_five_fields(self):
        r = T._reflex("Read my ACTIVE_TASKS.md and tell me who owns it.")
        self.assertEqual(set(r), {"lane", "lane_p", "finished", "addressed", "needs_tool", "stakes", "vault_hit", "vault_note"})
        self.assertEqual(r["lane"], "pickup")
        self.assertGreaterEqual(r["needs_tool"], 0.9)

    def test_finished_and_addressee(self):
        self.assertLess(T._reflex("so I was thinking we could and")["finished"], 0.3)
        self.assertGreater(T._reflex("what is on my calendar today?")["finished"], 0.9)
        self.assertLess(T._reflex("hey mom, dinner is ready")["addressed"], 0.3)
        self.assertGreater(T._reflex("Jarvis, hey mom is calling")["addressed"], 0.9)
        self.assertGreater(T._reflex("what is on my calendar today?")["vault_hit"], 0.8)

    def test_no_text_in_row(self):
        r = T._reflex("remember my secret word is ORCHID")
        self.assertNotIn("ORCHID", repr(r))


if __name__ == "__main__":
    unittest.main()
