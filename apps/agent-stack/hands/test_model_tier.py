"""Evens 2026-10-16: "use claude models only when necessary. make jev classify which model to use. just like the methods
shown in my signals" (match-model-to-task, cheap-read-expensive-decide, per-prompt best-value router, Jev preflight).
Jev picks the tier per job; the model is locked for the job; escalate one tier only on real failure or when a cheap
job needs to see the screen; no Jev opinion -> mid (never guess cheap); his own "switch to X" wins."""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("agent_stack_operator_tier_test", Path(__file__).with_name("operator.py"))
O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)


class Tier(unittest.TestCase):
    def setUp(self):
        env = mock.patch.dict(os.environ, {"JARVIS_BRAIN_FILE": str(Path(tempfile.mkdtemp()) / "b.json")})
        env.start(); self.addCleanup(env.stop)
        sc = mock.patch.object(O, "SCORES", Path(tempfile.mkdtemp()) / "scores.json"); sc.start(); self.addCleanup(sc.stop)

    def pick(self, jev):
        with mock.patch.object(O, "_jev_tier", return_value=jev):
            return O.choose_model("anything")

    def test_jev_tier_picks_the_model(self):
        self.assertEqual(self.pick({"tier": "cheap", "conf": 0.9})["model"], O.TIER_MODELS["cheap"])
        self.assertEqual(self.pick({"tier": "mid", "conf": 0.9})["model"], O.TIER_MODELS["mid"])
        self.assertEqual(self.pick({"tier": "frontier", "conf": 0.9})["model"], O.TIER_MODELS["frontier"])
        self.assertFalse(O.TIER_MODELS["cheap"].startswith("anthropic/"))  # Claude only when necessary

    def test_no_opinion_goes_up_not_down(self):
        self.assertEqual(self.pick(None)["tier"], "mid")
        self.assertEqual(self.pick({"tier": "cheap", "conf": 0.3})["tier"], "mid")

    def test_kind_picks_the_pool_across_providers(self):
        got = self.pick({"tier": "mid", "conf": 0.9, "kind": "code"})
        self.assertEqual(got["chain"], O.pool("mid", "code")); self.assertEqual(got["kind"], "code")
        providers = {m.split("/")[0] for t in O.POOLS.values() for ms in t.values() for m in ms}
        self.assertTrue({"x-ai", "google", "openai", "anthropic", "deepseek"} <= providers)

    def test_a_model_that_keeps_failing_drops_back(self):
        first = O.pool("mid", "research")[0]
        for _ in range(3):
            O.record_outcome("research", first, False)
        self.assertNotEqual(O.best_in_pool("mid", "research")[0], first)

    def test_his_switch_wins(self):
        Path(os.environ["JARVIS_BRAIN_FILE"]).write_text('{"model": "anthropic/claude-opus-5.5", "by": "evens"}')
        got = self.pick({"tier": "mid", "conf": 0.95})  # cheap questions skip the pin by his cost rule (10-17); real work takes it
        self.assertEqual(got["model"], "anthropic/claude-opus-5.5"); self.assertEqual(got["tier"], "owner")

    def test_escalation_is_one_step(self):
        self.assertEqual(O.next_tier("cheap"), "mid"); self.assertEqual(O.next_tier("mid"), "frontier")
        self.assertIsNone(O.next_tier("frontier"))

    def test_the_choice_is_recorded_on_the_job(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "cheap", "conf": 0.9}):
            t = O.Task.create(hive, "open LinkedIn")
        st = t.read("state.json")
        self.assertEqual(st["tier"], "cheap"); self.assertEqual(st["model"], O.TIER_MODELS["cheap"])

    def test_a_cheap_job_that_needs_eyes_moves_up(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "cheap", "conf": 0.9}):
            t = O.Task.create(hive, "press play")
        rounds = iter([{"ok": True, "calls": [{"tool": "screenshot", "args": {}, "call_id": "a"}]},
                       {"ok": True, "calls": [{"tool": "done", "args": {"summary": "played"}, "call_id": "b"}]}])
        with mock.patch.object(O.Tools, "screenshot", return_value={"text": "shot", "image": "data:image/png;base64,AA"}):
            O.run(t.path, model_fn=lambda m, tools: next(rounds, {"ok": True, "calls": [{"tool": "done", "args": {"summary": "played", "evidence": "screen shows playing"}, "call_id": "z"}]}))
        st = t.read("state.json")
        self.assertEqual(st["kind"], "screen"); self.assertNotIn(st["model"], O.VISION_FREE)

    def test_failure_escalates_once(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "cheap", "conf": 0.9}):
            t = O.Task.create(hive, "do a thing")
        used = []

        def model_for(tier, chain=None):
            used.append(tier)
            if tier == "cheap":
                return lambda m, tools: {"ok": False, "error": "no tool calls"}
            return lambda m, tools: {"ok": True, "calls": [{"tool": "done", "args": {"summary": "ok"}, "call_id": "z"}]}
        with mock.patch.object(O, "_model_fn", side_effect=model_for):
            state = O.run(t.path)
        self.assertEqual(state["status"], "DONE"); self.assertEqual(used, ["cheap", "mid"])


if __name__ == "__main__":
    unittest.main()
