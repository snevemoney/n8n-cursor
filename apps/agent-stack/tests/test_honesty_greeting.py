import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "brain"))
import online  # noqa: E402


class StatusClaimTests(unittest.TestCase):
    LIVE = ("Sir. Good evening, sir. I'm functioning well within operational parameters - the Orb is stable, "
            "OpenRouter connectivity is reliable, and all tools are ready for your commands. \n\nHow may I assist you this evening?")

    def test_live_greeting_boast_dropped(self):
        out = online.unbacked_status_claim(self.LIVE, backed=False)
        self.assertNotRegex(out.lower(), r"orb is stable|tools are ready|connectivity is reliable|operational parameters")
        self.assertIn("How may I assist you this evening?", out)
        self.assertIn("Good evening", out)

    def test_backed_kept(self):
        self.assertEqual(online.unbacked_status_claim(self.LIVE, backed=True), self.LIVE)

    def test_only_boast_gets_honest_line(self):
        out = online.unbacked_status_claim("Sir. All systems are go.", backed=False)
        self.assertIn("not run a live status check", out)

    def test_status_question_boasts_dropped(self):
        live = ("Sir. Yes, all my core tools are ready and operational:\n\n- **Talk**: OpenRouter connection active\n"
                "- **Vault**: Obsidian vault accessible for read-memory operations\n- **Safari**: Browser adapter available")
        out = online.unbacked_status_claim(live, backed=False)
        self.assertNotRegex(out.lower(), r"ready and operational|accessible|adapter available")
        self.assertIn("not run a live status check", out)
        out2 = online.unbacked_status_claim("Sir. Yes, everything appears to be working normally on my end.", backed=False)
        self.assertIn("not run a live status check", out2)

    def test_non_status_bullets_kept(self):
        t = "Sir. Options:\n- GridCraft is available for sheets\n- DeckCraft is ready for slides"
        self.assertEqual(online.unbacked_status_claim(t, backed=False), t)

    def test_plain_reply_untouched(self):
        t = "Sir. Good evening. I'm ready to help; what are we working on?"
        self.assertEqual(online.unbacked_status_claim(t, backed=False), t)


class AsBeforeTests(unittest.TestCase):
    def test_as_before_variants_dropped(self):
        for t in ("I'm running on deepseek via OpenRouter, as before.",
                  "Same as before, I'm on deepseek.",
                  "As I said earlier, saves go to ~/Documents.",
                  "I'm on deepseek, just as last time."):
            out = online.unbacked_memory_claim(t, backed=False)
            self.assertNotRegex(out.lower(), r"as before|as i said|as last time", t)
            self.assertRegex(out.lower(), r"deepseek|documents")

    def test_backed_keeps_as_before(self):
        t = "I'm on deepseek, as before."
        self.assertEqual(online.unbacked_memory_claim(t, backed=True), t)


if __name__ == "__main__":
    unittest.main()
