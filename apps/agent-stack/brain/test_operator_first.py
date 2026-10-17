"""Operator-first turn (Evens 10-16: "too specific workflows"): one model decision, no phrase routes."""
import importlib.util
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

STACK = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("agent_stack_turn_operator_first_test", STACK / "mouth" / "turn.py")
M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)  # a private copy: other tests patch the shared one
P = M.PIPELINE


def run(utterance, model_reply):
    seen = []

    def fake(prompt, context="", **kw):
        seen.append({"prompt": prompt, "tools": [t["function"]["name"] for t in kw.get("extra_tools") or []]})
        return model_reply
    tmp = Path(tempfile.mkdtemp()); (tmp / "bus").mkdir()
    with mock.patch.object(P.ONLINE, "call_openrouter", side_effect=fake), \
            mock.patch.dict(os.environ, {"JARVIS_OPERATOR_FIRST": "1", "JARVIS_ONE_LOOP": "0", "JARVIS_SIM": "1", "AGENT_STACK_DRY_TTS": "1",
                                           "AGENT_STACK_CURSOR_DRY": "0"}):
        assert P.operator_first(), "operator-first flag not seen by the pipeline"
        out = M.apply_turn(utterance, hive=tmp, retrieve_roots=None)
    return out, seen


class OperatorFirst(unittest.TestCase):
    def test_an_action_goes_to_the_operator_whatever_the_phrasing(self):
        for u in ("Can you open another project instead", "look on the gate hug for what changed", "open my browser and open Gmail"):
            out, seen = run(u, {"ok": True, "tool": "operator", "args": {"action": "start", "goal": u}})
            self.assertEqual(out.get("verb"), "operator", u)
            self.assertEqual(sorted(seen[0]["tools"]), sorted(P.OPERATOR_FIRST_TOOLS))

    def test_talk_gets_the_models_answer_not_a_route(self):
        out, seen = run("I don't care about your Margot", {"ok": True, "spoken": "Fair enough, sir. Dropping it."})
        self.assertIn("Dropping it", out.get("spoken") or "")
        self.assertNotEqual(out.get("verb"), "screen_see")

    def test_kept_stops_and_model_switch_stay_fixed(self):
        out, seen = run("send an email to Bob saying the invoice is late", {"ok": True, "spoken": "x"})
        self.assertEqual(out.get("verb"), "refuse_hard_step"); self.assertEqual(seen, [])
        out, seen = run("switch to Sonnet", {"ok": True, "spoken": "x"})
        self.assertEqual(out.get("verb"), "brain_model"); self.assertEqual(seen, [])


class OneLoop(unittest.TestCase):
    def test_every_line_goes_to_the_one_loop_no_front_door_model(self):
        # live 10-16: the front door answered "using my Safari ... how many stars" from a stale web search, twice
        seen, started = [], []
        tmp = Path(tempfile.mkdtemp()); (tmp / "bus").mkdir()
        with mock.patch.object(P.ONLINE, "call_openrouter", side_effect=lambda *a, **k: seen.append(1) or {}), \
                mock.patch.object(P, "_operator_turn", side_effect=lambda args, u, hive, turns=None: started.append(u) or
                                  {"ok": True, "tool": "operator", "spoken": "Looking now.", "wires": ["operator"], "cites": []}), \
                mock.patch.dict(os.environ, {"JARVIS_OPERATOR_FIRST": "1", "JARVIS_ONE_LOOP": "1", "JARVIS_SIM": "1",
                                               "AGENT_STACK_DRY_TTS": "1", "AGENT_STACK_CURSOR_DRY": "0"}):
            for u in ("hi", "using my Safari, how many stars does playwright-mcp have"):
                out = M.apply_turn(u, hive=tmp, retrieve_roots=None)
                self.assertEqual(out.get("verb"), "operator", u)  # sim mode records the operator start
        self.assertEqual(seen, [])


if __name__ == "__main__":
    unittest.main()
