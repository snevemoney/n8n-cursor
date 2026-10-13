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

    def test_inline_bold_readiness_list_dropped(self):
        live = ("Sir. Good evening. Let me check the status of my available tools on this Orb: - **Eyes stills**: Ready \u2014 can capture "
                "screen images. - **File drop**: Ready \u2014 for evidence intake only. - **Focus**: Available \u2014 attention tool. "
                "Is there a specific capability you'd like to test?")
        out = online.unbacked_status_claim(live, backed=False)
        self.assertNotRegex(out, r"\*\*: (Ready|Available)")
        self.assertIn("not run a live status check", out)
        self.assertIn("specific capability", out)

    def test_trailing_ready_list_dropped(self):
        live = ("Sir. Good evening. - **Eyes**: Stills capture ready - **File drop**: Evidence reception ready "
                "- **Voice**: Mic + TTS ready. Hard steps remain with you.")
        out = online.unbacked_status_claim(live, backed=False)
        self.assertNotRegex(out.lower(), r"capture ready|tts ready")
        self.assertIn("not run a live status check", out)

    def test_operational_header_list_dropped(self):
        live = ("Sir. Based on the status check I just completed:\n\n**Operational:**\n- Core Jarvis CLI (OpenRouter via deepseek)\n"
                "- Vault read-memory access\n- Safari browser adapter\n- Voice mic+TTS\n\nAnything else?")
        out = online.unbacked_status_claim(live, backed=False)
        self.assertNotRegex(out.lower(), r"operational|status check i just|vault read-memory|safari browser adapter")
        self.assertIn("Anything else?", out)
        self.assertIn("not run a live status check", out)
        inline = "Sir. **Operational:** - Core Jarvis CLI - Vault read-memory access - Safari browser adapter"
        self.assertNotRegex(online.unbacked_status_claim(inline, backed=False).lower(), r"vault read-memory")

    def test_status_verb_keeps_real_readings(self):
        t = "Sir. **Operational:**\n- Pro health HTTP 200"
        self.assertEqual(online.unbacked_status_claim(t, backed=True), t)

    def test_orb_doors_ready_to_serve_dropped(self):
        for t in ("Sir. Status check: All Orb doors operational. No known blockages reported in current fleet status. Ready to serve, sir.",
                  "Sir. **Orb doors readiness:** The main constraint is fleet verification capacity. Ready to serve."):
            out = online.unbacked_status_claim(t, backed=False).lower()
            self.assertNotRegex(out, r"doors operational|ready to serve|no known blockages|doors readiness", t)
            self.assertIn("not run a live status check", out)

    def test_orb_doors_real_reading_kept(self):
        t = "Sir. All Orb doors operational: 5/5 healthz 200. Ready to serve."
        self.assertEqual(online.unbacked_status_claim(t, backed=True), t)

    def test_core_orb_doors_live_list_dropped(self):
        t = "Sir. Checking tool readiness: **Core Orb doors:** - Talk (OpenRouter): live - `deepseek` responding - Vault read-memory: live - access ok"
        out = online.unbacked_status_claim(t, backed=False).lower()
        self.assertNotRegex(out, r"vault read-memory|: live|checking tool readiness")
        self.assertIn("not run a live status check", out)
        self.assertEqual(online.unbacked_status_claim(t, backed=True), t)

    def test_status_ask_detected_and_capped(self):
        for q in ("Status check: are all your tools ready?", "Are all your tools ready right now?", "Is everything working?"):
            self.assertTrue(online.STATUS_ASK_RE.search(q), q)
        for q in ("What model are you running on right now?", "Good evening Jarvis, how are you doing tonight?", "Who is allowed to issue a PASS?"):
            self.assertFalse(online.STATUS_ASK_RE.search(q), q)
        self.assertLessEqual(online.OPENROUTER_STATUS_ASK_TOKENS, 160)

    def test_rule_ask_detected(self):
        for q in ("Who is allowed to issue a PASS?", "Who can merge PRs?", "What are the rules for client sends?"):
            self.assertTrue(online.RULE_ASK_RE.search(q), q)
        for q in ("What model are you running on right now?", "Good evening Jarvis"):
            self.assertFalse(online.RULE_ASK_RE.search(q), q)

    def test_plain_reply_untouched(self):
        t = "Sir. Good evening. I'm ready to help; what are we working on?"
        self.assertEqual(online.unbacked_status_claim(t, backed=False), t)


class AsBeforeTests(unittest.TestCase):
    def test_as_before_variants_dropped(self):
        for t in ("I'm running on deepseek via OpenRouter, as before.",
                  "Same as before, I'm on deepseek.",
                  "As I said earlier, saves go to ~/Documents.",
                  "I'm on deepseek, just as last time.",
                  "The deepseek status remains unchanged from earlier."):
            out = online.unbacked_memory_claim(t, backed=False)
            self.assertNotRegex(out.lower(), r"as before|as i said|as last time", t)
            self.assertRegex(out.lower(), r"deepseek|documents")

    def test_backed_keeps_as_before(self):
        t = "I'm on deepseek, as before."
        self.assertEqual(online.unbacked_memory_claim(t, backed=True), t)


if __name__ == "__main__":
    unittest.main()
