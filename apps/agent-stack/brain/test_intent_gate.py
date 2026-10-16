"""Intent first (Evens 2026-10-16: "it doesn't understand the intent of the prompts ... that's why it responds random
false positives"). A phrase pattern only proposes a hand; a model that reads the line decides. Cases are his real lines
from ~/jarvis-proof/intent/corpus-20261016.json. No network: the classifier is injected."""
import importlib.util
import unittest
import unittest.mock
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_intent_gate_test", Path(__file__).with_name("intent_gate.py"))
G = importlib.util.module_from_spec(spec); spec.loader.exec_module(G)


def says(match: bool, intent: str = "command"):
    calls = []

    def classify(utterance, pick, prior):
        calls.append((utterance, pick, prior))
        return {"intent": intent, "meant": "x", "pick_matches": match}
    return classify, calls


class Gate(unittest.TestCase):
    def test_a_pick_he_did_not_mean_is_dropped(self):
        fn, calls = says(False, "chat")
        pick = {"tool": "screen_see", "args": {}, "speak": ""}
        self.assertIsNone(G.gate("I don't care about your Margot", pick, [], classify=fn))
        self.assertEqual(calls[0][1]["tool"], "screen_see")

    def test_a_pick_he_meant_runs_unchanged(self):
        fn, _ = says(True)
        pick = {"tool": "apps", "args": {}, "speak": ""}
        self.assertIs(G.gate("open Notes", pick, [], classify=fn), pick)

    def test_safety_and_stop_never_wait_on_a_model(self):
        fn, calls = says(False)
        for tool in ("refuse_hard_step", "stop", "hush"):
            pick = {"tool": tool, "args": {}, "speak": ""}
            self.assertIs(G.gate("send the invoice to Bob", pick, [], classify=fn), pick)
        confirmed = {"tool": "apps", "args": {"_confirmed": True}, "speak": ""}
        self.assertIs(G.gate("confirm", confirmed, [], classify=fn), confirmed)
        self.assertEqual(calls, [])

    def test_no_pick_no_call(self):
        fn, calls = says(True)
        self.assertIsNone(G.gate("hello", None, [], classify=fn)); self.assertEqual(calls, [])

    def test_model_unavailable_keeps_todays_behaviour(self):
        pick = {"tool": "apps", "args": {}, "speak": ""}
        for broken in (lambda *a: None, lambda *a: {"intent": "command"}, lambda *a: (_ for _ in ()).throw(TimeoutError())):
            self.assertIs(G.gate("open Notes", pick, [], classify=broken), pick)

    def test_prior_turns_reach_the_classifier(self):
        fn, calls = says(True)
        prior = [{"user": "find the epub books", "jarvis": "Downloads has 465 items"}] * 5
        G.gate("not that", {"tool": "workspace_read", "args": {}, "speak": ""}, prior, classify=fn)
        self.assertEqual(len(calls[0][2]), G.PRIOR_TURNS)

    def test_off_switch(self):
        fn, calls = says(False)
        pick = {"tool": "apps", "args": {}, "speak": ""}
        with unittest.mock.patch.dict("os.environ", {"JARVIS_INTENT_GATE": "0"}):
            self.assertIs(G.gate("open Notes", pick, [], classify=fn), pick)
        self.assertEqual(calls, [])


class Prompt(unittest.TestCase):
    def test_prompt_names_the_line_the_hand_and_the_recent_turns(self):
        text = G.render("not that", {"tool": "workspace_read", "args": {"op": "list"}}, [{"user": "find epub books", "jarvis": "Downloads has 465 items"}])
        for part in ("not that", "workspace_read", "find epub books", "Downloads has 465 items"):
            self.assertIn(part, text)



class InTheTurn(unittest.TestCase):
    """The real pipeline: a pattern pick the gate rejects never runs its hand; an accepted one runs as before."""

    def _turn(self, utterance, match):
        import tempfile
        spec = importlib.util.spec_from_file_location("agent_stack_pipeline_intent_test", Path(__file__).with_name("pipeline.py"))
        P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)
        ran = []
        verdict = lambda *a: {"intent": "command", "meant": "x", "pick_matches": match}
        with tempfile.TemporaryDirectory() as tmp, \
                unittest.mock.patch.object(P.INTENT, "gate", lambda u, p, pr: G.gate(u, p, pr, classify=verdict)), \
                unittest.mock.patch.object(P, "_run_tool_heartbeat", side_effect=lambda pick, *a, **k: (ran.append(pick["tool"]), (yield from ()), {"ok": True, "spoken": "ran"})[2]):
            (Path(tmp) / "bus").mkdir()
            P.apply_pipeline(utterance, hive=Path(tmp), retrieve_roots=[], talk_fn=lambda *a, **k: {"tool": "say", "args": {}, "speak": "ok"})
        return ran

    def test_rejected_pattern_pick_does_not_run(self):
        self.assertNotIn("screen_see", self._turn("What do you see on my screen", False))

    def test_accepted_pattern_pick_runs(self):
        self.assertIn("screen_see", self._turn("What do you see on my screen", True))


if __name__ == "__main__":
    unittest.main()
