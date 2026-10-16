"""Harness layers (Evens 2026-10-16 "focus on the whole harness"): lean context, cache marks, cost meter, procedures."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

H = Path(__file__).parent
spec = importlib.util.spec_from_file_location("hx_test", H / "harness.py"); HX = importlib.util.module_from_spec(spec); spec.loader.exec_module(HX)
spec = importlib.util.spec_from_file_location("op_hx_test", H / "operator.py"); O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)


def img():
    return {"role": "user", "content": [{"type": "text", "text": "The screen now:"},
                                        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,AA"}}]}


class ContextView(unittest.TestCase):
    def test_only_newest_screenshots_ride_along_and_history_is_untouched(self):
        msgs = [{"role": "system", "content": "sys"}] + [img() for _ in range(13)]
        view = HX.context_view(msgs)
        self.assertEqual(sum(isinstance(m["content"], list) and m["role"] == "user" for m in view), 3)
        self.assertEqual(view[0]["content"][0]["cache_control"], {"type": "ephemeral"})
        self.assertEqual(sum(isinstance(m["content"], list) for m in msgs), 13)  # disk copy unchanged

    def test_old_long_tool_output_is_clipped_recent_kept(self):
        msgs = [{"role": "system", "content": "s"}] + [{"role": "tool", "tool_call_id": str(i), "content": "x" * 5000} for i in range(20)]
        view = HX.context_view(msgs)
        self.assertLess(len(view[1]["content"]), 1600)
        self.assertEqual(len(view[-1]["content"]), 5000)


class Meter(unittest.TestCase):
    def test_cost_adds_up_and_caps(self):
        st = HX.add_usage({}, {"cost": 0.9, "prompt_tokens": 10, "completion_tokens": 2})
        st = HX.add_usage(st, {"cost": 0.7})
        self.assertAlmostEqual(st["cost_usd"], 1.6); self.assertTrue(HX.over_cap(st, 1.5))

    def test_the_loop_pauses_at_the_ceiling(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "mid", "conf": 0.9}):
            t = O.Task.create(hive, "big job")
        fn = lambda m, tools: {"ok": True, "calls": [{"tool": "say", "args": {"text": "hi"}, "call_id": "a"}], "usage": {"cost": 2.0}}
        st = O.run(t.path, model_fn=fn)
        self.assertEqual(st["status"], "WAITING_OWNER")


class Procedures(unittest.TestCase):
    def test_a_done_job_teaches_the_next_similar_one(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "mid", "conf": 0.9}):
            t = O.Task.create(hive, "Open Spotify and play Today's Top Hits")
        rounds = iter([
            {"ok": True, "calls": [{"tool": "open", "args": {"target": "Spotify"}, "call_id": "a"}]},
            {"ok": True, "calls": [{"tool": "done", "args": {"summary": "Playing in the Spotify app; the web page wanted a login.", "evidence": "player state: playing"}, "call_id": "b"}]}])
        with mock.patch.object(O.Tools, "open", return_value={"text": "exit 0"}):
            O.run(t.path, model_fn=lambda m, tools: next(rounds))
        # fixed model_fn = test mode: write the note the way a live run would
        rows = [json.loads(l) for l in (t.path / "trace.jsonl").read_text().splitlines()]
        HX.remember(hive, "Open Spotify and play Today's Top Hits", "Playing in the Spotify app; the web page wanted a login.", rows)
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "mid", "conf": 0.9}):
            t2 = O.Task.create(hive, "play some Drake on spotify")
        system = t2.read("messages.json")[0]["content"]
        self.assertIn("web page wanted a login", system); self.assertIn("open Spotify", system)
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "mid", "conf": 0.9}):
            t3 = O.Task.create(hive, "what is the weather")
        self.assertNotIn("similar jobs", t3.read("messages.json")[0]["content"])


if __name__ == "__main__":
    unittest.main()
