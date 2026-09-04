#!/usr/bin/env python3
"""Online brain unit tests. No live billed Grok. No Ollama."""
from __future__ import annotations

import importlib.util
import os
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "online.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_online", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class OnlineBrainTest(unittest.TestCase):
    def test_refuses_ollama(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("No Ollama", text)
        self.assertNotIn("11434", text)
        self.assertNotIn("import ollama", text)
        self.assertEqual(MOD.wire_report()["ollama"], "refused")

    def test_unknown_grok_is_not_the_brain(self) -> None:
        out = MOD.unknown_grok()
        self.assertTrue(out["unknown"])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("not the store", out["spoken"])
        self.assertNotIn("XAI_API_KEY", out["spoken"])

    def test_call_grok_uses_xai_when_key_set(self) -> None:
        def fake_xai(prompt: str, context: str = "") -> dict:
            return {"ok": True, "wire": "grok", "engine": "xai", "spoken": "hello from grok"}

        with mock.patch.object(MOD, "grok_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "call_xai", side_effect=fake_xai):
                out = MOD.call_grok("ping")
        self.assertEqual(out["spoken"], "hello from grok")
        self.assertEqual(out["engine"], "xai")

    def test_wire_report_lists_need(self) -> None:
        env = {k: v for k, v in os.environ.items() if k not in {"XAI_API_KEY", "GROK_API_KEY", "GROKBOT_BASE_URL", "GROKBOT_TOKEN"}}
        with mock.patch.dict(os.environ, env, clear=True):
            with mock.patch.object(MOD, "grokbot_gateway", return_value=None):
                with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
                    report = MOD.wire_report()
        self.assertEqual(report["ollama"], "refused")
        self.assertEqual(report["wires"]["brain"], "store")
        self.assertEqual(report["wires"]["store"], "vault+repo+sessions+hive")
        self.assertEqual(report["wires"]["cursor"], "harness")
        self.assertEqual(report["need"], [])

    def test_call_cursor_turn_prints_text(self) -> None:
        proc = mock.Mock(stdout="The site CSS is in pane.html.\n", stderr="", returncode=0)
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD.subprocess, "run", return_value=proc) as run:
                out = MOD.call_cursor_turn("look at the code for the face", mode="ask", resume="chat-1")
        self.assertTrue(out["ok"])
        self.assertEqual(out["wire"], "cursor")
        self.assertIn("pane.html", out["spoken"])
        argv = run.call_args[0][0]
        self.assertIn("-p", argv)
        self.assertIn("ask", argv)
        self.assertIn("--resume", argv)
        self.assertIn("chat-1", argv)
        self.assertNotIn("--force", argv)
        self.assertNotIn("--yolo", argv)

    def test_call_cursor_turn_agent_omits_mode_flag(self) -> None:
        proc = mock.Mock(stdout="Using tools.\n", stderr="", returncode=0)
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD.subprocess, "run", return_value=proc) as run:
                out = MOD.call_cursor_turn("open the hive skill", mode="agent")
        self.assertTrue(out["ok"])
        argv = run.call_args[0][0]
        self.assertIn("-p", argv)
        self.assertNotIn("--mode", argv)
        self.assertNotIn("--force", argv)
        self.assertNotIn("--yolo", argv)

    def test_call_cursor_turn_auth_names_login_not_xai(self) -> None:
        proc = mock.Mock(stdout="", stderr="Error: Authentication required. Please run 'agent login' first.", returncode=1)
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD.subprocess, "run", return_value=proc):
                out = MOD.call_cursor_turn("hey")
        self.assertTrue(out["unknown"])
        self.assertIn("agent login", out["spoken"])
        self.assertNotIn("XAI_API_KEY", out["spoken"])

    def test_call_cursor_turn_dry(self) -> None:
        with mock.patch.dict(os.environ, {"AGENT_STACK_CURSOR_DRY": "1"}):
            out = MOD.call_cursor_turn("look at the repo")
        self.assertTrue(out["unknown"])
        self.assertIn("dry", out["spoken"])

    def test_ensure_jarvis_chat_dry_stays_none(self) -> None:
        with mock.patch.dict(os.environ, {"AGENT_STACK_CURSOR_DRY": "1"}):
            self.assertIsNone(MOD.ensure_jarvis_chat(None))
            self.assertEqual(MOD.ensure_jarvis_chat("keep-me"), "keep-me")


if __name__ == "__main__":
    unittest.main()
