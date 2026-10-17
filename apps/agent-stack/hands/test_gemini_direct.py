"""Evens 2026-10-16: watch his Watch Later for $0-20 — Google AI Studio free tier, watch once, reuse it (stateful
interactions), 8 h of YouTube per day on the free tier, then paid only within his budget."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("gd_test", Path(__file__).with_name("gemini_direct.py"))
G = importlib.util.module_from_spec(spec); spec.loader.exec_module(G)


class Key(unittest.TestCase):
    def test_key_is_read_from_the_private_file_and_never_shown(self):
        d = Path(tempfile.mkdtemp()); f = d / "gemini.env"
        f.write_text("# comment\nGEMINI_API_KEY=AIzaTESTKEY1234567890123456789012345\n")
        with mock.patch.object(G, "KEY_FILE", f), mock.patch.dict(G.os.environ, {}, clear=True):
            self.assertTrue(G.has_key())
            self.assertNotIn("AIza", repr(G.status()))

    def test_empty_key_means_not_configured(self):
        d = Path(tempfile.mkdtemp()); f = d / "gemini.env"; f.write_text("GEMINI_API_KEY=\n")
        with mock.patch.object(G, "KEY_FILE", f), mock.patch.dict(G.os.environ, {}, clear=True):
            self.assertFalse(G.has_key())


class Session(unittest.TestCase):
    def setUp(self):
        self.state = Path(tempfile.mkdtemp()) / "free.json"
        p = mock.patch.object(G, "FREE_STATE", self.state); p.start(); self.addCleanup(p.stop)
        p = mock.patch.object(G, "_key", return_value="k"); p.start(); self.addCleanup(p.stop)

    def test_first_call_sends_the_video_and_follow_ups_reuse_it(self):
        bodies = []
        def post(body):
            bodies.append(body)
            return {"id": f"int-{len(bodies)}", "outputs": [{"type": "text", "text": f"answer {len(bodies)}"}],
                    "usage": {"total_input_tokens": 100, "total_cached_tokens": 90 if len(bodies) > 1 else 0}}
        with mock.patch.object(G, "_post", side_effect=post):
            s = G.VideoSession("https://www.youtube.com/watch?v=abcdefghijk", seconds=600, fps=1.0)
            self.assertEqual(s.ask("visual log"), "answer 1")
            self.assertEqual(s.ask("methods"), "answer 2")
        self.assertEqual(bodies[0]["input"][0]["type"], "video")
        self.assertEqual(bodies[0]["input"][0]["uri"], "https://www.youtube.com/watch?v=abcdefghijk")
        self.assertNotIn("video", json.dumps(bodies[1]["input"]))           # follow-up: no second upload
        self.assertEqual(bodies[1]["previous_interaction_id"], "int-1")
        self.assertEqual(s.cached_tokens, 90)

    def test_low_fps_is_sent_for_talking_heads(self):
        with mock.patch.object(G, "_post", return_value={"id": "i", "output_text": "ok"}) as p:
            G.VideoSession("u", seconds=600, fps=0.2).ask("x")
        self.assertEqual(p.call_args[0][0]["input"][0]["processing"]["fps"], 0.2)

    def test_free_tier_counts_eight_hours_a_day(self):
        with mock.patch.object(G, "_post", return_value={"id": "i", "output_text": "ok"}):
            G.VideoSession("u", seconds=7 * 3600, fps=1.0).ask("x")
            self.assertTrue(G.free_room(3600 - 60))
            self.assertFalse(G.free_room(2 * 3600))

    def test_a_long_answer_is_continued_on_the_same_interaction(self):
        replies = [{"id": "a", "outputs": [{"type": "text", "text": "part one "}], "status": "incomplete"},
                   {"id": "b", "outputs": [{"type": "text", "text": "part two"}], "status": "completed"}]
        with mock.patch.object(G, "_post", side_effect=replies) as p:
            got = G.VideoSession("u", seconds=60, fps=1.0).ask("long")
        self.assertEqual(got, "part one part two")
        self.assertEqual(p.call_args_list[1][0][0]["previous_interaction_id"], "a")


class Pacing(unittest.TestCase):  # live 10-16: free tier hit a per-minute limit on the 3rd video; minutes later it answered
    def test_429_waits_and_retries_then_succeeds(self):
        import urllib.error
        calls = []
        def urlopen(req, timeout=0):
            calls.append(1)
            if len(calls) < 3:
                raise urllib.error.HTTPError("u", 429, "Too Many Requests", {}, None)
            class R:
                def __enter__(s): return s
                def __exit__(s, *a): return False
                def read(s): return b'{"id": "i", "output_text": "ok"}'
            return R()
        sleeps = []
        with mock.patch.object(G.urllib.request, "urlopen", side_effect=urlopen), \
             mock.patch.object(G.time, "sleep", side_effect=sleeps.append), mock.patch.object(G, "_key", return_value="k"):
            self.assertEqual(G._post({"model": "m"})["output_text"], "ok")
        self.assertEqual([x for x in sleeps if x >= 30], [30, 60])   # pacing gaps aside

    def test_gives_up_after_the_last_wait(self):
        import urllib.error
        with mock.patch.object(G.urllib.request, "urlopen", side_effect=urllib.error.HTTPError("u", 429, "x", {}, None)), \
             mock.patch.object(G.time, "sleep"), mock.patch.object(G, "_key", return_value="k"):
            with self.assertRaises(urllib.error.HTTPError):
                G._post({"model": "m"})


if __name__ == "__main__":
    unittest.main()
