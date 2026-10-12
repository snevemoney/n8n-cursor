"""Honest model self-report: the id actually answering lands in the system prompt."""
import importlib.util
import io
import json
import os
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ONLINE = _load("test_self_report_online", HERE / "online.py")
SC = _load("test_self_report_sc", HERE / "shared_context.py")


class SelfReportTest(unittest.TestCase):
    def setUp(self):
        self.env = mock.patch.dict(os.environ, {"JARVIS_SHARED_CONTEXT": "0", "OPENROUTER_API_KEY": "test-not-a-key"})
        self.env.start()

    def tearDown(self):
        self.env.stop()

    def test_line_names_model_and_fallback(self):
        line = SC.model_self_report("deepseek/deepseek-chat-v3.1", "nex-agi/nex-n2.5-mini:free")
        self.assertIn("`deepseek/deepseek-chat-v3.1`", line)
        self.assertIn("fallback", line)
        self.assertIn("Do not claim to be Claude", line)
        self.assertNotIn("fallback", SC.model_self_report("a/b", "a/b"))
        self.assertEqual(SC.model_self_report(""), "")

    def test_payload_carries_its_own_model(self):
        body = ONLINE._openrouter_payload("deepseek/deepseek-chat-v3.1", "what model are you?", stream=False)
        self.assertIn("`deepseek/deepseek-chat-v3.1` via OpenRouter", body["messages"][0]["content"])

    def test_fallback_attempt_reports_fallback_model(self):
        seen = []

        def fake_http_json(url, *, data=None, headers=None, timeout=20.0):
            seen.append(data["messages"][0]["content"])
            if data["model"] == "primary/one:free":
                raise ONLINE.urllib.error.HTTPError(url, 503, "down", {}, io.BytesIO(b""))
            return {"choices": [{"message": {"content": "I run on backup/two."}, "finish_reason": "stop"}]}

        with mock.patch.dict(os.environ, {"OPENROUTER_MODEL": "primary/one:free"}), \
             mock.patch.object(ONLINE, "OPENROUTER_FALLBACKS", ("backup/two",)), \
             mock.patch.object(ONLINE, "OPENROUTER_PAID_FALLBACKS", ()), \
             mock.patch.object(ONLINE, "_http_json", side_effect=fake_http_json):
            got = ONLINE.call_openrouter("what model are you?", hands=True)
        self.assertTrue(got["ok"])
        self.assertEqual(got["model"], "backup/two")
        self.assertIn("`primary/one:free` via OpenRouter", seen[0])
        self.assertIn("`backup/two` via OpenRouter", seen[-1])
        self.assertIn("fallback that fired", seen[-1])
        self.assertEqual(ONLINE.LAST_TALK["model"], "backup/two")
        self.assertTrue(ONLINE.LAST_TALK["fallback"])
        self.assertIn("latency_ms", ONLINE.LAST_TALK)


if __name__ == "__main__":
    unittest.main()
