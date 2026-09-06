#!/usr/bin/env python3
"""Online brain unit tests. No live billed Grok. No Ollama."""
from __future__ import annotations

import importlib.util
import json
import os
import tempfile
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

    def test_has_xai_key_is_boolean_only(self) -> None:
        with mock.patch.object(MOD, "grok_api_key", return_value=""):
            self.assertFalse(MOD.has_xai_key())
        with mock.patch.object(MOD, "grok_api_key", return_value="x"):
            self.assertTrue(MOD.has_xai_key())

    def test_try_agent_login_reports_without_speaking_key(self) -> None:
        with mock.patch.object(MOD, "agent_cmd", return_value=None):
            out = MOD.try_agent_login()
        self.assertTrue(out["tried"])
        self.assertFalse(out["ok"])
        self.assertNotIn("XAI_API_KEY", json.dumps(out))

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

    def _proc(self, stdout: str, stderr: str = "", returncode: int = 0):
        proc = mock.Mock()
        proc.communicate.return_value = (stdout, stderr)
        proc.returncode = returncode
        proc.poll.return_value = returncode
        return proc

    def test_call_cursor_turn_prints_text(self) -> None:
        proc = self._proc("The site CSS is in pane.html.\n")
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD, "cursor_logged_in", return_value=True):
                with mock.patch.object(MOD.subprocess, "Popen", return_value=proc) as popen:
                    out = MOD.call_cursor_turn("look at the code for the face", mode="ask", resume="chat-1")
        self.assertTrue(out["ok"])
        self.assertEqual(out["wire"], "cursor")
        self.assertIn("pane.html", out["spoken"])
        argv = popen.call_args[0][0]
        self.assertIn("-p", argv)
        self.assertIn("ask", argv)
        self.assertIn("--resume", argv)
        self.assertIn("chat-1", argv)
        self.assertIn("stream-json", argv)
        self.assertIn("--stream-partial-output", argv)
        self.assertNotIn("--force", argv)
        self.assertNotIn("--yolo", argv)

    def test_call_cursor_turn_agent_resumes_agent_chat(self) -> None:
        proc = self._proc("Using tools.\n")
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD, "cursor_logged_in", return_value=True):
                with mock.patch.object(MOD.subprocess, "Popen", return_value=proc) as popen:
                    out = MOD.call_cursor_turn("open the hive skill", mode="agent", resume="agent-1")
        self.assertTrue(out["ok"])
        argv = popen.call_args[0][0]
        self.assertIn("-p", argv)
        self.assertNotIn("--mode", argv)
        self.assertIn("--resume", argv)
        self.assertIn("agent-1", argv)
        self.assertNotIn("--force", argv)
        self.assertNotIn("--yolo", argv)

    def test_call_cursor_turn_auth_names_login_not_xai(self) -> None:
        proc = self._proc("", "Error: Authentication required. Please run 'agent login' first.", 1)
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD, "cursor_logged_in", return_value=True):
                with mock.patch.object(MOD.subprocess, "Popen", return_value=proc):
                    out = MOD.call_cursor_turn("hey")
        self.assertTrue(out["unknown"])
        self.assertIn("agent login", out["spoken"])
        self.assertNotIn("XAI_API_KEY", out["spoken"])

    def test_call_cursor_turn_not_logged_in_skips_p(self) -> None:
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD, "cursor_logged_in", return_value=False):
                with mock.patch.object(MOD.subprocess, "Popen") as popen:
                    out = MOD.call_cursor_turn("hey")
        popen.assert_not_called()
        self.assertTrue(out["unknown"])
        self.assertEqual(out["wire"], "cursor")
        self.assertIn("agent login", out["spoken"])
        self.assertNotIn("returned no reply", out["spoken"])
        self.assertNotIn("XAI_API_KEY", out["spoken"])

    def test_cursor_logged_in_false_on_status(self) -> None:
        proc = mock.Mock()
        proc.stdout = "Not logged in\n"
        proc.stderr = ""
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD.subprocess, "run", return_value=proc):
                self.assertFalse(MOD.cursor_logged_in())
        self.assertTrue(MOD.cursor_login_error("Not logged in"))

    def test_cursor_logged_in_reads_json_flag(self) -> None:
        proc = mock.Mock()
        proc.stdout = json.dumps({"isAuthenticated": True, "status": "authenticated"})
        proc.stderr = ""
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD.subprocess, "run", return_value=proc) as run:
                self.assertTrue(MOD.cursor_logged_in())
        argv = run.call_args[0][0]
        self.assertIn("status", argv)
        self.assertIn("--format", argv)
        self.assertIn("json", argv)
        kwargs = run.call_args.kwargs
        self.assertEqual(kwargs.get("cwd"), str(MOD.ROOT))
        self.assertIn("HOME", kwargs.get("env") or {})
        proc.stdout = json.dumps({"isAuthenticated": False, "message": "Not logged in"})
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD.subprocess, "run", return_value=proc):
                self.assertFalse(MOD.cursor_logged_in())

    def test_load_existing_env_sets_missing_key_without_returning_value(self) -> None:
        with tempfile.TemporaryDirectory(prefix="online-env-") as tmp:
            path = Path(tmp) / ".env"
            path.write_text("XAI_API_KEY=test-from-file\nGROK_MODEL=grok-4\n", encoding="utf-8")
            env = {k: v for k, v in os.environ.items() if k not in {"XAI_API_KEY", "GROK_API_KEY"}}
            with mock.patch.dict(os.environ, env, clear=True):
                out = MOD.load_existing_env([path])
                self.assertTrue(MOD.has_xai_key())
                self.assertEqual(os.environ.get("GROK_MODEL"), "grok-4")
        blob = json.dumps(out)
        self.assertIn("XAI_API_KEY", out["found"])
        self.assertIn("XAI_API_KEY", out["loaded"])
        self.assertNotIn("test-from-file", blob)
        self.assertNotIn("test-from-file", json.dumps(out["found"]))

    def test_load_existing_env_does_not_overwrite(self) -> None:
        with tempfile.TemporaryDirectory(prefix="online-env-keep-") as tmp:
            path = Path(tmp) / ".env"
            path.write_text("XAI_API_KEY=from-file\n", encoding="utf-8")
            with mock.patch.dict(os.environ, {"XAI_API_KEY": "already-set"}):
                out = MOD.load_existing_env([path])
                self.assertEqual(os.environ.get("XAI_API_KEY"), "already-set")
        self.assertIn("XAI_API_KEY", out["found"])
        self.assertNotIn("XAI_API_KEY", out["loaded"])
        self.assertNotIn("from-file", json.dumps(out))
        self.assertNotIn("already-set", json.dumps(out))

    def test_clip_spoken_keeps_last_sentence(self) -> None:
        long = "First sentence is done. " + ("word " * 200)
        out = MOD.clip_spoken(long, 80)
        self.assertLessEqual(len(out), 80)
        self.assertIn("done.", out)
        self.assertFalse(out.endswith("…"))

    def test_cancel_cursor_kills_proc(self) -> None:
        proc = mock.Mock()
        proc.poll.return_value = None
        MOD._CURSOR_PROC = proc
        MOD._CURSOR_CANCELLED = False
        self.assertTrue(MOD.cancel_cursor())
        proc.kill.assert_called_once()
        self.assertTrue(MOD.was_cancelled())
        MOD._CURSOR_PROC = None
        MOD._CURSOR_CANCELLED = False

    def test_call_cursor_turn_dry(self) -> None:
        with mock.patch.dict(os.environ, {"AGENT_STACK_CURSOR_DRY": "1"}):
            out = MOD.call_cursor_turn("look at the repo")
        self.assertTrue(out["unknown"])
        self.assertIn("dry", out["spoken"])

    def test_ensure_jarvis_chat_dry_stays_none(self) -> None:
        with mock.patch.dict(os.environ, {"AGENT_STACK_CURSOR_DRY": "1"}):
            self.assertIsNone(MOD.ensure_jarvis_chat(None))
            self.assertEqual(MOD.ensure_jarvis_chat("keep-me"), "keep-me")
            chats = MOD.ensure_jarvis_chats("talk-1", None)
            self.assertEqual(chats["talk"], "talk-1")
            self.assertIsNone(chats["agent"])

    def test_parse_stream_json_line_shapes(self) -> None:
        delta = MOD.parse_stream_json_line('{"type":"text-delta","delta":"Hello Evens."}')
        self.assertEqual(delta["delta"], "Hello Evens.")
        msg = MOD.parse_stream_json_line(
            '{"type":"assistant","message":{"content":[{"type":"text","text":"Standing by."}]}}'
        )
        self.assertEqual(msg["delta"], "Standing by.")
        result = MOD.parse_stream_json_line('{"type":"result","result":"Hello Evens. Standing by."}')
        self.assertEqual(result["result"], "Hello Evens. Standing by.")
        plain = MOD.parse_stream_json_line("The site CSS is in pane.html.")
        self.assertEqual(plain["delta"], "The site CSS is in pane.html.")

    def test_agent_cmd_falls_back_to_home_local_bin(self) -> None:
        home = Path.home() / ".local" / "bin" / "agent"
        with mock.patch.object(MOD.shutil, "which", return_value=None):
            with mock.patch.object(MOD.os, "access", return_value=True):
                with mock.patch.object(Path, "is_file", return_value=True):
                    cmd = MOD.agent_cmd()
        self.assertEqual(cmd, [str(home)])

    def test_sys_prompt_is_coordinator_not_cursor_brain(self) -> None:
        self.assertIn("coordinator", MOD.SYS)
        self.assertIn("one worker", MOD.SYS)
        self.assertNotIn("Ollama", MOD.SYS.replace("Never invent Claude, ChatGPT, Gemini, or Ollama", ""))

    def test_take_sentences_splits_completed(self) -> None:
        sents, rest = MOD.take_sentences("Hello Evens. Standing by. More")
        self.assertEqual(sents, ["Hello Evens.", "Standing by."])
        self.assertEqual(rest, "More")

    def test_call_cursor_turn_iter_yields_deltas(self) -> None:
        lines = [
            '{"type":"text-delta","delta":"Hello Evens. "}\n',
            '{"type":"text-delta","delta":"Standing by."}\n',
            '{"type":"result","result":"Hello Evens. Standing by."}\n',
            "",
        ]
        proc = self._proc("")
        proc.stdout.readline.side_effect = lines
        proc.stderr.read.return_value = ""
        proc.poll.side_effect = [None, None, None, 0]
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD, "cursor_logged_in", return_value=True):
                with mock.patch.object(MOD.subprocess, "Popen", return_value=proc):
                    evs = list(MOD.call_cursor_turn_iter("hey", mode="ask", resume="chat-1"))
        deltas = [ev.get("delta") for ev in evs if ev.get("partial")]
        self.assertEqual(deltas, ["Hello Evens. ", "Standing by."])
        self.assertTrue(evs[-1]["done"])
        self.assertIn("Hello Evens.", evs[-1]["spoken"])


if __name__ == "__main__":
    unittest.main()
