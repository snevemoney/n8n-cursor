"""Evens 2026-10-16: learn the whole Watch Later for $0-20 without lowering quality — triage decides depth first (free)."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("tri_test", Path(__file__).with_name("signal_triage.py"))
T = importlib.util.module_from_spec(spec); spec.loader.exec_module(T)


def v(title, channel="", length="15:00"):
    return {"id": "x", "title": title, "channel": channel, "length": length, "link": "u"}


class Tiers(unittest.TestCase):
    def test_jarvis_and_ai_agent_videos_are_first(self):
        r = T.classify(v("I Built JARVIS with Claude Code", "Zubair Trabzada | AI Workshop"))
        self.assertEqual((r["tier"], r["priority"]), ("deep", 1))
        self.assertEqual(T.classify(v("n8n AI agent workflow in 20 minutes", "Nate Herk | AI Automation"))["tier"], "deep")

    def test_motion_design_goes_to_the_studio_lens(self):
        r = T.classify(v("Kinetic typography in After Effects"))
        self.assertEqual((r["tier"], r["lens"]), ("studio", "studio"))

    def test_talking_heads_are_watched_with_fewer_frames(self):
        r = T.classify(v("Patrick Bet-David on building wealth", "Valuetainment", "1:45:00"))
        self.assertEqual(r["tier"], "light"); self.assertLess(r["fps"], 1)

    def test_entertainment_is_skipped_but_kept_listed(self):
        r = T.classify(v("Top 10 games of 2026", "gameranx"))
        self.assertEqual(r["tier"], "skip"); self.assertTrue(r["reason"])

    def test_length_parsing(self):
        self.assertEqual(T.seconds("1:02:03"), 3723); self.assertEqual(T.seconds("15:00"), 900); self.assertEqual(T.seconds(""), 0)


class Plan(unittest.TestCase):
    def test_plan_counts_hours_and_free_days(self):
        rows = [T.classify(v("Claude Code agent tutorial", "Cole Medin", "1:00:00")),
                T.classify(v("Valuetainment interview", "Valuetainment", "2:00:00")),
                T.classify(v("gameplay", "gameranx", "1:00:00"))]
        p = T.plan(rows)
        self.assertEqual(p["hours"]["deep"], 1.0); self.assertEqual(p["hours"]["skip"], 1.0)
        self.assertGreater(p["free_days"], 0)


class Tighter(unittest.TestCase):  # first real run: 1,184 'light' videos, entertainment in studio
    def test_entertainment_animation_is_not_studio(self):
        self.assertNotEqual(T.classify(v("Sus Bus!!! | Among Us Animation", "sWooZie"))["tier"], "studio")
        self.assertEqual(T.classify(v("How I made this COMMERCIAL with simple VFX", "Cinecom.net"))["tier"], "studio")

    def test_gossip_and_highlights_are_skipped(self):
        self.assertEqual(T.classify(v("Logan Paul Fan Calls In to Demand Apology", "H3 Podcast Highlights"))["tier"], "skip")

    def test_unrecognised_videos_wait_in_later(self):
        r = T.classify(v("A day at the lake", "Some Channel"))
        self.assertEqual(r["tier"], "later"); self.assertEqual(r["fps"], 0.0)


if __name__ == "__main__":
    unittest.main()
