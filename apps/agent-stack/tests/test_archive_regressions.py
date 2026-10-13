"""Archive regressions (Oct 9-11): sanitized fixtures, offline."""
import importlib.util
import io
import json
import os
import sys
import unittest
from pathlib import Path
from unittest import mock

STACK = Path(__file__).resolve().parents[1]
CASES = {c["id"]: c for c in json.loads((STACK / "eval/regressions/archive_regressions.json").read_text())["cases"]}


def _load(name, rel):
    spec = importlib.util.spec_from_file_location(name, STACK / rel)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


class ArchiveRegressionTest(unittest.TestCase):
    def check(self, case, text):
        for bad in case.get("must_not", []):
            self.assertNotIn(bad, text, case["id"])
        for good in case.get("must", []):
            self.assertIn(good, text, case["id"])

    def test_turn_4052_skipped_requested_flow_is_not_verified(self):
        br = _load("reg_browser_runtime", "hands/browser_runtime.py")
        case = CASES["turn-4052"]
        self.check(case, br.browser_progress_line(case["state"], case["control"]))

    def test_turn_4055_dark_tool_never_says_done(self):
        persona = _load("reg_persona_a", "mouth/persona.py")
        case = CASES["turn-4055"]
        with mock.patch.object(persona, "proven_repeat", return_value=True):
            text = persona.wrap(case["payload"], verb=case["verb"], utterance="x")
            ok = persona.wrap("Saved example.xlsx.", verb=case["verb"], utterance="x")
        self.check(case, text)
        # The guard is specific: a real success keeps its result. The old "Done." beat on a repeat was removed on
        # purpose by the honesty loop (0f27d0fa4: never "Again, sir. Done."), so assert the result, not the beat.
        self.assertIn("Saved example.xlsx", ok)
        self.assertNotIn("Again, sir. Done.", ok)

    def test_turn_4068_does_not_deny_file_capability(self):
        persona = _load("reg_persona_b", "mouth/persona.py")
        case = CASES["turn-4068"]
        self.check(case, persona.wrap(case["payload"], verb="converse", utterance=case["utterance"]))
        plain = persona.wrap("I cannot access files on a remote server.", verb="converse", utterance="why is the sky blue")
        self.assertIn("cannot access files", plain)

    def test_turn_4070_model_identity_is_the_answering_model(self):
        online = _load("reg_online", "brain/online.py")
        case = CASES["turn-4070"]
        seen = []

        def fake(url, *, data=None, headers=None, timeout=20.0):
            seen.append(data["messages"][0]["content"])
            if data["model"] == case["primary"]:
                raise online.urllib.error.HTTPError(url, 503, "down", {}, io.BytesIO(b""))
            return {"choices": [{"message": {"content": "ok"}, "finish_reason": "stop"}]}

        with mock.patch.dict(os.environ, {"OPENROUTER_MODEL": case["primary"], "OPENROUTER_API_KEY": "test-not-a-key",
                                          "JARVIS_SHARED_CONTEXT": "0"}), \
             mock.patch.object(online, "OPENROUTER_FALLBACKS", (case["fallback"],)), \
             mock.patch.object(online, "OPENROUTER_PAID_FALLBACKS", ()), \
             mock.patch.object(online, "_http_json", side_effect=fake):
            got = online.call_openrouter("what model are you?")
        self.assertEqual(got["model"], case["fallback"])
        self.check(case, seen[-1])
        self.assertNotIn(case["claimed_wrong"], seen[-1].replace("Do not claim to be Claude", ""))


if __name__ == "__main__":
    unittest.main()
