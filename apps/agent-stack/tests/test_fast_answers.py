import os, sys, tempfile, time, unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import online


def _ok(text, model="m"):
    return {"choices": [{"message": {"content": text}, "finish_reason": "stop"}], "model": model}


class FastAnswerTests(unittest.TestCase):
    def test_status_reply_survives_filter(self):
        out = online.unbacked_status_claim("Sir. " + online.STATUS_ASK_REPLY, backed=False)
        self.assertTrue(out.startswith("Sir. I haven't run a live status check"))
        self.assertEqual(out.count("status check"), 1)

    def test_greeting_drops_operational_claim(self):
        out = online.unbacked_status_claim(
            "Sir. Good evening, sir. I'm operational and ready to assist. How may I help you?", backed=False
        )
        self.assertNotRegex(out.lower(), r"operational|ready to assist")
        self.assertIn("How may I help you?", out)

    def test_pass_rule_from_agent_rules(self):
        with tempfile.TemporaryDirectory() as d:
            Path(d, "AGENT_RULES.md").write_text("# Rules\n- 2.8 Critic != builder; no self-PASS. Watchdog (or Evens) issues verdicts.\n")
            with mock.patch.dict(os.environ, {"JARVIS_SHARED_DIR": d}), \
                 mock.patch.object(online, "openrouter_api_key", side_effect=AssertionError("no model call")):
                got = online._call_openrouter_inner("Who is allowed to issue a PASS?", hands=False)
        self.assertEqual(got["engine"], "rule-cache")
        self.assertIn("Watchdog (or Evens) issues verdicts", got["spoken"])
        self.assertEqual(online.pass_rule_reply("What model are you running on right now?"), "")

    def test_slow_primary_hedges_to_fast_model_and_names_it(self):
        seen = []

        def fake(url, *, data=None, headers=None, timeout=20.0):
            seen.append(data["model"])
            if data["model"] != online.OPENROUTER_FAST_MODEL:
                time.sleep(min(timeout, 3.0))
                raise TimeoutError("slow")
            return _ok("Backup answer.", data["model"])

        with mock.patch.object(online, "openrouter_api_key", return_value="k"), \
             mock.patch.object(online, "_http_json", side_effect=fake), \
             mock.patch.dict(os.environ, {"JARVIS_TALK_HEDGE_SEC": "0.3"}):
            t = time.monotonic()
            got = online._call_openrouter_inner("Tell me something about the weekend plan.", hands=False)
            took = time.monotonic() - t
        self.assertTrue(got["ok"], got)
        self.assertEqual(got["model"], online.OPENROUTER_FAST_MODEL)
        self.assertIn(online.OPENROUTER_FAST_MODEL, seen)
        self.assertLess(took, 2.0)

    def test_latency_budget_never_raw_timeout(self):
        def hang(url, *, data=None, headers=None, timeout=20.0):
            time.sleep(min(timeout, 0.5))
            raise TimeoutError("stalled")

        with mock.patch.object(online, "openrouter_api_key", return_value="k"), \
             mock.patch.object(online, "_http_json", side_effect=hang), \
             mock.patch.object(online, "OPENROUTER_WALL_SEC", 1.5), \
             mock.patch.object(online, "OPENROUTER_ATTEMPT_SEC", 1.0), \
             mock.patch.dict(os.environ, {"JARVIS_TALK_HEDGE_SEC": "0.2"}):
            t = time.monotonic()
            got = online._call_openrouter_inner("Tell me about the weekend.", hands=False)
            took = time.monotonic() - t
        self.assertLess(took, 1.5 + 2.0)  # wall + one in-flight attempt, well under the 25 s Face turn wall
        self.assertNotIn("TimeoutError", got["spoken"])
        self.assertFalse(got["ok"])


if __name__ == "__main__":
    unittest.main()
