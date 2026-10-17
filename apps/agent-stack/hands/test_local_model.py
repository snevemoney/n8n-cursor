"""Evens 2026-10-16: a free local model keeps Jarvis working when OpenRouter has no credits; anything beyond it gets
"This free local model can't ___. Add credits to OpenRouter to continue with more capable models." """
import importlib.util
import json
import unittest
from pathlib import Path
from unittest import mock

H = Path(__file__).parent
spec = importlib.util.spec_from_file_location("lm_test", H / "local_model.py"); L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)
spec = importlib.util.spec_from_file_location("op_lm_test", H / "operator.py"); O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)

TOOLS = [{"type": "function", "function": {"name": n, "parameters": {}}} for n in
         ("say", "done", "open", "safari", "app", "computer", "shell", "delegate", "signal", "write_file", "read_file")]


def msgs(goal, image=False):
    m = [{"role": "system", "content": "sys"}, {"role": "user", "content": goal}]
    if image:
        m.append({"role": "user", "content": [{"type": "text", "text": "screen"}, {"type": "image_url", "image_url": {"url": "data:x"}}]})
    return m


class Gate(unittest.TestCase):
    def test_big_jobs_get_the_add_credits_sentence(self):
        for goal, what in (("fix the bug in operator.py and run the tests", "write or fix code"),
                           ("research the latest browser agents and compare them", "do deep research"),
                           ("learn this video https://youtube.com/watch?v=abc", "watch and learn videos"),
                           ("make a 30 second motion graphic in EffectCraft", "make ArtCraft content")):
            msg = L.cant(goal)
            self.assertIn(what, msg); self.assertIn("Add credits to OpenRouter to continue with more capable models", msg)

    def test_small_jobs_are_allowed(self):
        for goal in ("open Spotify", "what time is it", "open youtube in my browser", "pause the music"):
            self.assertEqual(L.cant(goal), "", goal)


class Call(unittest.TestCase):
    def test_only_text_tools_and_no_images_reach_the_local_model(self):
        sent = {}
        def post(url, data, headers=None, timeout=0):
            sent.update(data)
            return {"choices": [{"message": {"content": "Done."}, "finish_reason": "stop"}]}
        with mock.patch.object(L, "_post", side_effect=post):
            got = L.call(msgs("open spotify", image=True), TOOLS)
        names = {t["function"]["name"] for t in sent["tools"]}
        self.assertNotIn("computer", names); self.assertNotIn("shell", names); self.assertNotIn("write_file", names)
        self.assertIn("open", names)
        self.assertNotIn("image_url", str(sent["messages"]))
        self.assertTrue(got["ok"]); self.assertEqual(got["model"], "local:" + L.LOCAL_MODEL)

    def test_tool_calls_come_back_in_the_operator_shape(self):
        reply = {"choices": [{"message": {"tool_calls": [{"id": "c1", "function": {"name": "open", "arguments": "{\"target\": \"Spotify\"}"}}]},
                              "finish_reason": "tool_calls"}]}
        with mock.patch.object(L, "_post", return_value=reply):
            got = L.call(msgs("open spotify"), TOOLS)
        self.assertEqual(got["calls"], [{"tool": "open", "args": {"target": "Spotify"}, "call_id": "c1"}])

    def test_a_tool_outside_the_safe_set_is_refused(self):
        reply = {"choices": [{"message": {"tool_calls": [{"id": "c1", "function": {"name": "shell", "arguments": "{}"}}]}}]}
        with mock.patch.object(L, "_post", return_value=reply):
            got = L.call(msgs("open spotify"), TOOLS)
        self.assertIn("Add credits to OpenRouter", got["text"])


class Fallback(unittest.TestCase):
    def setUp(self):
        p = mock.patch.object(O, "_local", return_value=L); p.start(); self.addCleanup(p.stop)

    def test_no_credits_switches_to_the_local_model(self):
        paid = mock.Mock(return_value={"ok": False, "unknown": True, "error": "UNKNOWN. x: http 402."})
        with mock.patch.object(L, "ready", return_value=True), \
             mock.patch.object(L, "call", return_value={"ok": True, "text": "Opened.", "model": "local:qwen3:4b"}) as local:
            got = O._with_local_fallback(paid)(msgs("open spotify"), TOOLS)
        local.assert_called_once(); self.assertEqual(got["text"], "Opened.")

    def test_big_job_without_credits_says_add_credits(self):
        paid = mock.Mock(return_value={"ok": False, "unknown": True, "error": "UNKNOWN. x: http 402."})
        with mock.patch.object(L, "ready", return_value=True), mock.patch.object(L, "call") as local:
            got = O._with_local_fallback(paid)(msgs("fix the bug in operator.py"), TOOLS)
        local.assert_not_called()
        self.assertIn("can't write or fix code", got["text"]); self.assertIn("Add credits to OpenRouter", got["text"])

    def test_local_model_missing_is_said_plainly(self):
        paid = mock.Mock(return_value={"ok": False, "unknown": True, "error": "UNKNOWN. x: http 402."})
        with mock.patch.object(L, "ready", return_value=False):
            got = O._with_local_fallback(paid)(msgs("open spotify"), TOOLS)
        self.assertIn("OpenRouter has no credits", got["text"]); self.assertIn("local model", got["text"])

    def test_paid_answers_pass_through_untouched(self):
        paid = mock.Mock(return_value={"ok": True, "text": "hi", "model": "x"})
        with mock.patch.object(L, "call") as local:
            self.assertEqual(O._with_local_fallback(paid)(msgs("hi"), TOOLS)["text"], "hi")
        local.assert_not_called()


class Light(unittest.TestCase):  # live 10-16: qwen3:4b froze his 8 GB Mac — small context, short brief, unload when idle
    def test_request_is_small_and_unloads_when_idle(self):
        sent = {}
        def post(url, data, headers=None, timeout=0):
            sent["url"] = url; sent.update(data)
            return {"message": {"content": "ok"}}
        long_system = "x" * 30000
        m = [{"role": "system", "content": long_system}] + [{"role": "user", "content": f"turn {i}"} for i in range(30)]
        with mock.patch.object(L, "_post", side_effect=post):
            L.call(m, TOOLS)
        self.assertTrue(sent["url"].endswith("/api/chat"))
        self.assertEqual(sent["keep_alive"], L.KEEP_ALIVE)
        self.assertLessEqual(sent["options"]["num_ctx"], 4096)
        self.assertLess(len(json.dumps(sent["messages"])), 9000)      # short brief, recent turns only
        self.assertIn("turn 29", json.dumps(sent["messages"]))         # newest turn kept
        self.assertFalse(sent.get("think", True))

    def test_native_tool_calls_are_read(self):
        reply = {"message": {"tool_calls": [{"function": {"name": "open", "arguments": {"target": "Calculator"}}}]}}
        with mock.patch.object(L, "_post", return_value=reply):
            got = L.call(msgs("open calculator"), TOOLS)
        self.assertEqual(got["calls"][0]["tool"], "open"); self.assertEqual(got["calls"][0]["args"], {"target": "Calculator"})


if __name__ == "__main__":
    unittest.main()
