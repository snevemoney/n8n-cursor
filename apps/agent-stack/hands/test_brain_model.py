"""Evens 2026-10-16: keep deepseek and Jev, but "ask Jarvis to change model whenever we want, by prompt or by voice",
super fast, with every Claude model. No network: the OpenRouter catalog is injected."""
import importlib.util
import json
import os
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock

STACK = Path(__file__).resolve().parents[1]


def _load(name, rel):
    spec = importlib.util.spec_from_file_location(name, STACK / rel)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod


CATALOG = {"anthropic/claude-haiku-5.5": {"in": 0.0000001, "out": 0.0000005}, "anthropic/claude-sonnet-5.5": {"in": 0.000002, "out": 0.00001},
           "anthropic/claude-opus-5.5": {"in": 0.000004, "out": 0.00002}, "anthropic/claude-fable-5.1": {"in": 0.00001, "out": 0.00005},
           "deepseek/deepseek-chat-v3.1": {"in": 0.00000025, "out": 0.00000095}, "openai/gpt-6": {"in": 0.000001, "out": 0.000004}}


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        env = mock.patch.dict(os.environ, {"JARVIS_BRAIN_FILE": str(Path(self.tmp) / "brain.json"),
                                           "OPENROUTER_MODEL": "deepseek/deepseek-chat-v3.1"})
        env.start(); self.addCleanup(env.stop)
        self.B = _load("agent_stack_brain_model_test", "hands/brain_model.py")
        cat = mock.patch.object(self.B, "catalog", return_value=CATALOG); cat.start(); self.addCleanup(cat.stop)
        self.O = _load("agent_stack_online_brain_test", "brain/online.py")


class Switch(Base):
    def test_owner_switches_by_name_and_the_next_call_uses_it(self):
        got = self.B.run("switch to Sonnet")
        self.assertTrue(got["ok"]); self.assertIn("Claude Sonnet 5.5", got["spoken"]); self.assertIn("$2", got["spoken"])
        self.assertEqual(self.O.openrouter_model(), "anthropic/claude-sonnet-5.5")
        self.B.run("use opus for this")
        self.assertEqual(self.O.openrouter_model(), "anthropic/claude-opus-5.5")

    def test_back_to_default(self):
        self.B.run("switch to haiku")
        got = self.B.run("go back to deepseek")
        self.assertTrue(got["ok"]); self.assertEqual(self.O.openrouter_model(), "deepseek/deepseek-chat-v3.1")
        self.B.run("use opus"); self.B.run("back to your normal model")
        self.assertEqual(self.O.openrouter_model(), "deepseek/deepseek-chat-v3.1")

    def test_any_listed_model_by_full_id_and_unknown_is_refused(self):
        self.assertTrue(self.B.run("switch your model to openai/gpt-6")["ok"])
        self.assertEqual(self.O.openrouter_model(), "openai/gpt-6")
        bad = self.B.run("switch to anthropic/claude-nope-9")
        self.assertFalse(bad["ok"]); self.assertEqual(self.O.openrouter_model(), "openai/gpt-6")

    def test_which_model(self):
        self.B.run("switch to sonnet")
        self.assertIn("Claude Sonnet 5.5", self.B.run("which model are you using?")["spoken"])

    def test_self_switch_expires(self):
        got = self.B.set_model("opus", by="jarvis", reason="ambiguous multi-step request")
        self.assertTrue(got["ok"]); self.assertEqual(self.O.openrouter_model(), "anthropic/claude-opus-5.5")
        with mock.patch.object(self.B.time, "time", return_value=time.time() + self.B.SELF_SWITCH_S + 5):
            self.assertEqual(self.B.current(), "")
        data = json.loads(Path(os.environ["JARVIS_BRAIN_FILE"]).read_text())
        self.assertEqual(data["by"], "jarvis")

    def test_broken_file_falls_back_to_default(self):
        Path(os.environ["JARVIS_BRAIN_FILE"]).write_text("{not json")
        self.assertEqual(self.O.openrouter_model(), "deepseek/deepseek-chat-v3.1")


class Wants(Base):
    def test_commands_and_not_talk(self):
        for u in ("switch to sonnet", "Jarvis, use Opus", "change your model to haiku", "use claude opus for this task",
                  "go back to deepseek", "back to your normal model", "what model are you on?", "which model are you using",
                  "switch your brain to fable"):
            self.assertTrue(self.B.wants(u), u)
        for u in ("use the pointer", "switch to Safari", "open Notes", "I use opus in my music app sometimes",
                  "don't switch to opus", "how do I change the model in Cursor?", "what is a language model?"):
            self.assertFalse(self.B.wants(u), u)


if __name__ == "__main__":
    unittest.main()
