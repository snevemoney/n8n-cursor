#!/usr/bin/env python3
"""Online brain unit tests. No live billed Grok. No Ollama."""
from __future__ import annotations

import base64
import importlib.util
import io
import json
import os
import ssl
import tempfile
import threading
import time
import unittest
import urllib.error
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
    def setUp(self) -> None:
        # Other suites set dry mode globally; these tests mock the Cursor boundary.
        patcher = mock.patch.dict(os.environ, {"AGENT_STACK_CURSOR_DRY": "0"})
        patcher.start()
        self.addCleanup(patcher.stop)

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

    def test_talk_ssl_context_fills_empty_store_and_http_keeps_verify(self) -> None:
        """Framework Python with zero CAs must still verify, not skip TLS."""
        empty = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        empty.check_hostname = True
        empty.verify_mode = ssl.CERT_REQUIRED
        self.assertEqual(len(empty.get_ca_certs()), 0)
        seen: dict = {}

        class _Resp:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return b"{}"

        def _open(req, timeout=None, context=None):
            seen["context"] = context
            return _Resp()

        with mock.patch.object(MOD.ssl, "create_default_context", return_value=empty):
            ctx = MOD.talk_ssl_context()
            with mock.patch.object(MOD.urllib.request, "urlopen", side_effect=_open):
                MOD._http_json("https://openrouter.ai/api/v1/models", timeout=1)
        self.assertIs(ctx, empty)
        self.assertGreater(len(ctx.get_ca_certs()), 0)
        self.assertEqual(ctx.verify_mode, ssl.CERT_REQUIRED)
        self.assertTrue(ctx.check_hostname)
        self.assertNotEqual(ctx.verify_mode, ssl.CERT_NONE)
        self.assertIs(seen["context"], ctx)
        self.assertEqual(seen["context"].verify_mode, ssl.CERT_REQUIRED)

    def test_has_openrouter_key_is_boolean_only(self) -> None:
        with mock.patch.object(MOD, "openrouter_api_key", return_value=""):
            self.assertFalse(MOD.has_openrouter_key())
        with mock.patch.object(MOD, "openrouter_api_key", return_value="x"):
            self.assertTrue(MOD.has_openrouter_key())

    def test_call_grok_uses_openrouter_when_key_set(self) -> None:
        def fake_or(prompt: str, context: str = "") -> dict:
            return {"ok": True, "wire": "openrouter", "engine": "openrouter", "spoken": "hello from openrouter"}

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "call_openrouter", side_effect=fake_or):
                with mock.patch.object(MOD, "call_xai") as xai:
                    with mock.patch.object(MOD, "call_grokbot") as bot:
                        out = MOD.call_grok("ping")
        self.assertEqual(out["spoken"], "hello from openrouter")
        self.assertEqual(out["engine"], "openrouter")
        xai.assert_not_called()
        bot.assert_not_called()
        self.assertNotIn("test-key", json.dumps(out))

    def test_call_grok_keeps_openrouter_429(self) -> None:
        miss = {
            "ok": False,
            "unknown": True,
            "wire": "openrouter",
            "engine": "openrouter",
            "error": "http 429",
            "spoken": "UNKNOWN. OpenRouter returned no text. http 429.",
        }
        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "call_openrouter", return_value=miss):
                with mock.patch.object(MOD, "grok_api_key", return_value=""):
                    with mock.patch.object(MOD, "call_grokbot") as bot:
                        out = MOD.call_grok("Explain photosynthesis.")
        self.assertEqual(out.get("error"), "http 429")
        self.assertIn("429", out.get("spoken") or "")
        self.assertEqual(out.get("wire"), "openrouter")
        bot.assert_not_called()

    def test_call_grok_uses_xai_when_key_set(self) -> None:
        def fake_xai(prompt: str, context: str = "") -> dict:
            return {"ok": True, "wire": "grok", "engine": "xai", "spoken": "hello from grok"}

        with mock.patch.object(MOD, "openrouter_api_key", return_value=""):
            with mock.patch.object(MOD, "grok_api_key", return_value="test-key"):
                with mock.patch.object(MOD, "call_xai", side_effect=fake_xai):
                    with mock.patch.object(MOD, "call_grokbot") as bot:
                        out = MOD.call_grok("ping")
        self.assertEqual(out["spoken"], "hello from grok")
        self.assertEqual(out["engine"], "xai")
        bot.assert_not_called()

    def test_call_grok_uses_grokbot_when_no_key(self) -> None:
        def fake_bot(prompt: str, context: str = "") -> dict:
            return {"ok": True, "wire": "grokbot", "engine": "grokbot", "spoken": "from the gateway"}

        with mock.patch.object(MOD, "openrouter_api_key", return_value=""):
            with mock.patch.object(MOD, "grok_api_key", return_value=""):
                with mock.patch.object(MOD, "call_grokbot", side_effect=fake_bot):
                    out = MOD.call_grok("ping")
        self.assertEqual(out["spoken"], "from the gateway")
        self.assertEqual(out["engine"], "grokbot")

    def test_file_key_rejects_v10_blob(self) -> None:
        self.assertFalse(MOD._well_formed_file_key(""))
        self.assertFalse(MOD._well_formed_file_key("djEwnot-32-bytes"))
        good = base64.b64encode(b"a" * 32).decode("ascii")
        self.assertTrue(MOD._well_formed_file_key(good))

    def test_call_grokbot_returns_new_reply_not_stale(self) -> None:
        calls = {"n": 0}

        def fake_http(url: str, *, data: dict | None = None, headers: dict | None = None, timeout: float = 20.0):
            _ = (data, headers, timeout)
            if url.endswith("/api/listAgents"):
                return {"agents": [{"name": "Big Boss", "id": "boss-1"}]}
            if url.endswith("/api/sendPrompt"):
                return {"ok": True, "http": 200}
            if url.endswith("/api/getLastMessage"):
                calls["n"] += 1
                if calls["n"] == 1:
                    return {"text": "old desk line"}
                return {"text": "Evening. The sitting is quiet."}
            raise AssertionError(url)

        with mock.patch.object(MOD, "grokbot_gateway", return_value={"base": "http://127.0.0.1:9", "token": "t"}):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_http):
                with mock.patch.object(MOD.time, "sleep"):
                    out = MOD.call_grokbot("hello")
        self.assertTrue(out["ok"])
        self.assertFalse(out.get("unknown"))
        self.assertFalse(out.get("queued"))
        self.assertEqual(out["engine"], "grokbot")
        self.assertIn("sitting is quiet", out["spoken"])
        self.assertNotIn("old desk line", out["spoken"])

    def test_call_grokbot_queued_is_not_success(self) -> None:
        def fake_http(url: str, *, data: dict | None = None, headers: dict | None = None, timeout: float = 20.0):
            _ = (data, headers, timeout)
            if url.endswith("/api/listAgents"):
                return {"agents": [{"name": "Jarvis", "id": "j-1"}]}
            if url.endswith("/api/sendPrompt"):
                return {"ok": True, "http": 200}
            return {"text": "same leftover"}

        with mock.patch.object(MOD, "grokbot_gateway", return_value={"base": "http://127.0.0.1:9", "token": "t"}):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_http):
                with mock.patch.object(MOD.time, "sleep"):
                    out = MOD.call_grokbot("hello")
        self.assertFalse(out["ok"])
        self.assertTrue(out["unknown"])
        self.assertTrue(out["queued"])
        self.assertTrue(out["spoken"].startswith("UNKNOWN"))
        self.assertNotIn("same leftover", out["spoken"])

    def test_wire_report_lists_need(self) -> None:
        env = {k: v for k, v in os.environ.items() if k not in {"XAI_API_KEY", "GROK_API_KEY", "GROKBOT_BASE_URL", "GROKBOT_TOKEN"}}
        with mock.patch.dict(os.environ, env, clear=True):
            with mock.patch.object(MOD, "grokbot_gateway", return_value=None):
                with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
                    report = MOD.wire_report()
        self.assertEqual(report["ollama"], "refused")
        self.assertEqual(report["wires"]["brain"], "store")
        self.assertEqual(report["wires"]["store"], "live")
        self.assertEqual(report["wires"]["cursor"], "live")
        self.assertEqual(report["wires"]["calendar"], "unprobed")
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

    def test_clip_spoken_keeps_finished_conclusion(self) -> None:
        long = "One. " + ("Complete useful explanation about your story. " * 90) + "CONCLUSION_MUST_SURVIVE."
        out = MOD.clip_spoken(long, finished=True)
        self.assertEqual(out, long)
        self.assertIn("CONCLUSION_MUST_SURVIVE", out)
        self.assertGreater(len(out), 280)

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

    def test_call_cursor_converse_uses_text_not_stream(self) -> None:
        proc = mock.Mock()
        proc.stdout = "I am Jarvis on this Mac.\n"
        proc.stderr = ""
        proc.returncode = 0
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD, "cursor_logged_in", return_value=True):
                with mock.patch.object(MOD.subprocess, "run", return_value=proc) as run:
                    out = MOD.call_cursor_converse("Identify yourself in one short sentence.")
        self.assertTrue(out["ok"])
        self.assertEqual(out["engine"], "cursor-cli")
        self.assertIn("Jarvis", out["spoken"])
        argv = run.call_args[0][0]
        self.assertIn("-p", argv)
        self.assertIn("text", argv)
        self.assertIn("ask", argv)
        self.assertNotIn("--resume", argv)
        self.assertNotIn("stream-json", argv)
        self.assertNotIn("--force", argv)
        self.assertNotIn("--yolo", argv)
        self.assertNotIn("login", argv)
        kwargs = run.call_args.kwargs
        self.assertEqual(kwargs.get("timeout"), MOD.CONVERSE_TIMEOUT)
        self.assertEqual(kwargs.get("cwd"), str(MOD.ROOT))

    def test_call_cursor_converse_skips_p_when_dark(self) -> None:
        with mock.patch.object(MOD, "agent_cmd", return_value=["/usr/local/bin/agent"]):
            with mock.patch.object(MOD, "cursor_logged_in", return_value=False):
                with mock.patch.object(MOD.subprocess, "run") as run:
                    out = MOD.call_cursor_converse("hey")
        run.assert_not_called()
        self.assertTrue(out["unknown"])
        self.assertIn("agent login", out["spoken"])
        self.assertNotIn("XAI_API_KEY", out["spoken"])

    def test_call_cursor_converse_dry(self) -> None:
        with mock.patch.dict(os.environ, {"AGENT_STACK_CURSOR_DRY": "1"}):
            with mock.patch.object(MOD.subprocess, "run") as run:
                out = MOD.call_cursor_converse("hey")
        run.assert_not_called()
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

    def test_openrouter_stops_at_first_spoken_sentence(self) -> None:
        self.assertFalse(MOD._first_spoken_ready("Sir."))
        self.assertFalse(MOD._first_spoken_ready("Sir. Hi"))
        self.assertTrue(MOD._first_spoken_ready("Standing by."))
        self.assertTrue(MOD._first_spoken_ready("Sir. I am Jarvis on this Mac."))
        rows = [
            b'data: {"choices":[{"delta":{"content":"Sir. "}}]}\n',
            b'data: {"choices":[{"delta":{"content":"I am Jarvis on this Mac."}}]}\n',
            b'data: {"choices":[{"delta":{"content":" Hive-os is the lane."}}]}\n',
            b'data: {"choices":[{"delta":{"content":"\\nHere\'s a thinking process:\\n1. Analyze."}}]}\n',
            b"data: [DONE]\n",
        ]
        text, reason = MOD._read_openrouter_stream(rows)
        self.assertIn("I am Jarvis on this Mac.", text)
        self.assertIn("Hive-os is the lane.", text)
        self.assertNotIn("thinking process", text)
        self.assertNotIn("scratchpad", text.lower())
        self.assertEqual(reason, "")
        payload = MOD._openrouter_payload(MOD.DEFAULT_OPENROUTER_MODEL, "Hello", stream=True)
        self.assertTrue(payload["stream"])
        self.assertEqual(payload["max_tokens"], MOD.OPENROUTER_MAX_TOKENS)
        self.assertGreaterEqual(MOD.OPENROUTER_MAX_TOKENS, 384)
        self.assertLessEqual(MOD.OPENROUTER_MAX_TOKENS, 768)
        self.assertIn("scratchpad", MOD.SYS.lower())
        self.assertNotIn("one or two short sentences", MOD.SYS.lower())
        self.assertIn("depth he asked", MOD.SYS)
        self.assertTrue(MOD.DEFAULT_OPENROUTER_MODEL.endswith(":free"))
        self.assertNotIn("openai/", MOD.DEFAULT_OPENROUTER_MODEL)
        self.assertTrue(MOD.OPENROUTER_PAID_FALLBACKS)
        paid = " ".join(MOD.OPENROUTER_PAID_FALLBACKS).lower()
        self.assertNotIn("openai/", paid)
        self.assertNotIn("anthropic/", paid)
        self.assertNotIn("google/gemini", paid)
        self.assertFalse(any(mid.endswith(":free") for mid in MOD.OPENROUTER_PAID_FALLBACKS))
        self.assertNotIn("qwen/qwen3-8b", MOD.OPENROUTER_PAID_FALLBACKS)
        self.assertTrue(MOD.OPENROUTER_VISION_FALLBACKS)
        vision_paid = " ".join(MOD.OPENROUTER_VISION_FALLBACKS).lower()
        self.assertNotIn("openai/", vision_paid)
        self.assertNotIn("anthropic/", vision_paid)
        self.assertNotIn("google/gemini", vision_paid)
        self.assertIn("deepseek/deepseek-v4-flash-vision-exp", MOD.OPENROUTER_VISION_FALLBACKS)
        self.assertFalse(MOD._first_spoken_ready("Here's a thinking process:\n\n1. Analyze input."))
        self.assertFalse(MOD._looks_like_scratchpad("1. First, a calendar is a grid of days."))
        self.assertFalse(MOD._looks_like_scratchpad("Keep a scratchpad nearby while you plan."))
        self.assertTrue(MOD._looks_like_scratchpad("Here's a thinking process:\n1. Analyze."))
        self.assertTrue(MOD._first_spoken_ready("1. First, a calendar is a grid of days."))
        self.assertFalse(MOD._first_spoken_ready('{"tool":"mac_act","args":{"op":"click","x":0.5,"y":0.'))
        clipped = MOD.complete_spoken(
            "Sir. I don't have enough context to know which event you mean. Tell"
        )
        self.assertTrue(clipped.endswith("mean."))
        self.assertTrue(MOD.unfinished_clause("The vault map lists rooms but"))
        self.assertFalse(MOD.unfinished_clause("The vault map lists the rooms."))

    def test_openrouter_payload_tools_and_retrieve_tokens(self) -> None:
        bare = MOD._openrouter_payload("m", "hi", stream=True)
        self.assertEqual(bare["max_tokens"], MOD.OPENROUTER_MAX_TOKENS)
        self.assertNotIn("tools", bare)
        with_ctx = MOD._openrouter_payload(
            "m", "hi", stream=True, max_tokens=MOD.OPENROUTER_RETRIEVE_TOKENS
        )
        self.assertEqual(with_ctx["max_tokens"], MOD.OPENROUTER_RETRIEVE_TOKENS)
        tools = MOD._openrouter_payload("m", "hi", stream=False, with_tools=True)
        names = [row["function"]["name"] for row in tools["tools"]]
        self.assertIn("vault_read", names)
        self.assertIn("cursor_ask", names)
        self.assertNotIn("mac_act", names)
        vision = MOD._openrouter_payload(
            "m",
            "see this",
            stream=False,
            images=["data:image/jpeg;base64,qq"],
            extra_tools=list(MOD.OPENROUTER_MAC_ACT),
            with_tools=True,
        )
        user = vision["messages"][1]["content"]
        self.assertTrue(isinstance(user, list))
        self.assertEqual(user[0]["type"], "text")
        self.assertEqual(user[1]["type"], "image_url")
        extra_names = [row["function"]["name"] for row in vision["tools"]]
        self.assertIn("mac_act", extra_names)
        watch_only = MOD._openrouter_payload(
            "m",
            "see this",
            stream=False,
            images=["data:image/jpeg;base64,qq"],
            extra_tools=list(MOD.OPENROUTER_MAC_ACT),
            with_tools=True,
            hands=False,
        )
        watch_names = [row["function"]["name"] for row in watch_only["tools"]]
        self.assertEqual(watch_names, ["mac_act"])
        mac_props = vision["tools"][extra_names.index("mac_act")]["function"]["parameters"]["properties"]
        self.assertIn("label", mac_props)
        self.assertIn("OPENROUTER_VISION_MODEL", MOD.ALLOWED_ENV)
        self.assertTrue(MOD.VISION_DARK.startswith("UNKNOWN"))
        pick = MOD._tool_pick_from_message(
            {
                "content": "",
                "tool_calls": [
                    {
                        "function": {
                            "name": "vault_read",
                            "arguments": '{"query":"Evens Louis"}',
                        }
                    }
                ],
            }
        )
        self.assertEqual(pick["tool"], "vault_read")
        self.assertEqual(pick["args"]["query"], "Evens Louis")

    def test_call_openrouter_skips_scratchpad(self) -> None:
        rows = [
            {
                "ok": True,
                "choices": [{"message": {"content": "Here's a thinking process:\n1. Analyze."}}],
            },
            {
                "ok": True,
                "choices": [{"message": {"content": "You run hive-os."}}],
            },
        ]

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout)
            return rows.pop(0)

        # Two distinct models, independent of .env.local: when OPENROUTER_MODEL is the
        # paid fallback, the chain dedupes to one model and there is no "next" to skip to.
        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"), \
             mock.patch.object(MOD, "openrouter_model", return_value="primary/model:free"), \
             mock.patch.object(MOD, "OPENROUTER_FALLBACKS", ()):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                    out = MOD.call_openrouter("what can you say about me")
        self.assertTrue(out.get("ok"))
        self.assertEqual(out.get("spoken"), "You run hive-os.")
        self.assertNotIn("thinking process", out.get("spoken") or "")

    def test_call_openrouter_skips_free_after_429_then_paid(self) -> None:
        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout)
            mid = str((data or {}).get("model") or "")
            if mid.endswith(":free"):
                raise urllib.error.HTTPError(
                    url,
                    429,
                    "Too Many Requests",
                    None,
                    io.BytesIO(b'{"error":{"message":"free-models-per-day-high-balance"}}'),
                )
            return {"choices": [{"message": {"content": "Ready."}}]}

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "openrouter_model", return_value="nex-agi/nex-n2.5-mini:free"):
                with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                    with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                        out = MOD.call_openrouter("Reply ready.")
        self.assertTrue(out.get("ok"), out)
        self.assertEqual(out.get("spoken"), "Ready.")
        self.assertEqual(out.get("model"), MOD.OPENROUTER_PAID_FALLBACKS[0])
        self.assertFalse(str(out.get("model") or "").endswith(":free"))

    def test_call_openrouter_images_skip_free_429_then_vision_paid(self) -> None:
        seen: list[str] = []

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout)
            mid = str((data or {}).get("model") or "")
            seen.append(mid)
            if mid.endswith(":free"):
                raise urllib.error.HTTPError(
                    url,
                    429,
                    "Too Many Requests",
                    None,
                    io.BytesIO(b'{"error":{"message":"free-models-per-day-high-balance"}}'),
                )
            if mid == "deepseek/deepseek-v4-flash-vision-exp":
                return {"choices": [{"message": {"content": "Ready."}}]}
            raise urllib.error.HTTPError(url, 400, "no image", None, io.BytesIO(b"{}"))

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "openrouter_model", return_value="nex-agi/nex-n2.5-mini:free"):
                with mock.patch.object(MOD, "openrouter_vision_model", return_value=""):
                    with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                        with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                            out = MOD.call_openrouter(
                                "Reply ready.",
                                images=["data:image/jpeg;base64,qq"],
                            )
        self.assertTrue(out.get("ok"), out)
        self.assertEqual(out.get("spoken"), "Ready.")
        self.assertEqual(out.get("model"), "deepseek/deepseek-v4-flash-vision-exp")
        self.assertTrue(any(mid.endswith(":free") for mid in seen))
        self.assertIn("deepseek/deepseek-v4-flash-vision-exp", seen)

    def test_call_openrouter_keeps_healthy_stop_conclusion(self) -> None:
        long_reply = "One. " + ("Complete useful explanation about your story. " * 90) + "CONCLUSION_MUST_SURVIVE."

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout, data)
            return {
                "choices": [{"finish_reason": "stop", "message": {"content": long_reply}}]
            }

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "openrouter_model", return_value="mock/test"):
                with mock.patch.object(MOD, "OPENROUTER_FALLBACKS", ()):
                    with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                        with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                            out = MOD.call_openrouter("Explain fully and include your final conclusion.")
        self.assertTrue(out.get("ok"), out)
        self.assertEqual(out.get("finish_reason"), "stop")
        self.assertEqual(out.get("spoken"), long_reply)
        self.assertIn("CONCLUSION_MUST_SURVIVE", out.get("spoken") or "")
        self.assertGreater(len(out.get("spoken") or ""), 280)

    def test_call_openrouter_retries_length_then_speaks_complete(self) -> None:
        rows = [
            {
                "choices": [
                    {
                        "finish_reason": "length",
                        "message": {"content": "The vault map lists rooms but"},
                    }
                ]
            },
            {
                "choices": [
                    {
                        "finish_reason": "stop",
                        "message": {"content": "The vault map lists the rooms."},
                    }
                ]
            },
        ]

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout, data)
            return rows.pop(0)

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                    out = MOD.call_openrouter("summarize the vault")
        self.assertTrue(out.get("ok"), out)
        self.assertEqual(out.get("spoken"), "The vault map lists the rooms.")
        self.assertNotIn("rooms but", out.get("spoken") or "")
        self.assertEqual(rows, [])

    def test_call_openrouter_length_fragment_is_unknown(self) -> None:
        rows = [
            {
                "choices": [
                    {
                        "finish_reason": "length",
                        "message": {"content": "The vault map lists rooms but"},
                    }
                ]
            },
            {
                "choices": [
                    {
                        "finish_reason": "length",
                        "message": {"content": "still mid clause without"},
                    }
                ]
            },
        ]

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout, data)
            return rows.pop(0)

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                    out = MOD.call_openrouter("summarize the vault")
        self.assertFalse(out.get("ok"))
        self.assertTrue(out.get("unknown"))
        self.assertEqual(out.get("error"), "length")
        self.assertEqual(out.get("finish_reason"), "length")
        self.assertIn("ran out of room", (out.get("spoken") or "").lower())
        self.assertNotIn("finish_reason=length", out.get("spoken") or "")
        self.assertNotIn("mid clause", out.get("spoken") or "")
        self.assertNotIn("rooms but", out.get("spoken") or "")

    def test_call_openrouter_history_keeps_hands(self) -> None:
        payloads: list[dict] = []

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout)
            payloads.append(data or {})
            return {
                "choices": [
                    {
                        "finish_reason": "stop",
                        "message": {
                            "content": "",
                            "tool_calls": [
                                {
                                    "function": {
                                        "name": "vault_read",
                                        "arguments": '{"query":"Evens Louis"}',
                                    }
                                }
                            ],
                        },
                    }
                ]
            }

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("tools path")):
                    out = MOD.call_openrouter(
                        "Read operator memory",
                        "Recent conversation:\nEvens: the chosen project is hive-os\n",
                    )
        self.assertTrue(out.get("ok"), out)
        self.assertEqual(out.get("tool"), "vault_read")
        self.assertEqual((out.get("args") or {}).get("query"), "Evens Louis")
        self.assertIn("tools", payloads[0])
        names = [row["function"]["name"] for row in payloads[0]["tools"]]
        self.assertIn("vault_read", names)
        self.assertFalse(payloads[0].get("stream"))

    def test_call_grok_keeps_tool_only_vault_read(self) -> None:
        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout)
            self.assertIn("tools", data or {})
            return {
                "choices": [
                    {
                        "finish_reason": "stop",
                        "message": {
                            "content": "",
                            "tool_calls": [
                                {
                                    "function": {
                                        "name": "vault_read",
                                        "arguments": '{"query":"Evens Louis"}',
                                    }
                                }
                            ],
                        },
                    }
                ]
            }

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("tools path")):
                    with mock.patch.object(MOD, "call_xai") as xai:
                        with mock.patch.object(MOD, "call_grokbot") as bot:
                            out = MOD.call_grok(
                                "Read operator memory",
                                "Recent conversation:\nEvens: the chosen project is hive-os\n",
                            )
        self.assertTrue(out.get("ok"), out)
        self.assertEqual(out.get("tool"), "vault_read")
        self.assertEqual((out.get("args") or {}).get("query"), "Evens Louis")
        self.assertFalse(str(out.get("spoken") or "").strip())
        xai.assert_not_called()
        bot.assert_not_called()
        self.assertTrue(MOD.usable_openrouter(out))
        self.assertFalse(
            MOD.usable_openrouter(
                {"ok": True, "tool": "explode", "args": {}, "spoken": ""}
            )
        )

    def test_call_openrouter_empty_length_is_unknown(self) -> None:
        rows = [
            {"choices": [{"finish_reason": "length", "message": {"content": ""}}]},
            {"choices": [{"finish_reason": "length", "message": {"content": ""}}]},
        ]

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout, data)
            return rows.pop(0)

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                    out = MOD.call_openrouter("List twelve months.")
        self.assertFalse(out.get("ok"))
        self.assertTrue(out.get("unknown"))
        self.assertEqual(out.get("error"), "length")
        self.assertEqual(out.get("finish_reason"), "length")
        self.assertIn("ran out of room", (out.get("spoken") or "").lower())
        self.assertNotIn("finish_reason=length", out.get("spoken") or "")
        self.assertEqual(rows, [])

    def test_call_openrouter_length_keeps_first_finished_sentence(self) -> None:
        rows = [
            {
                "choices": [
                    {
                        "finish_reason": "length",
                        "message": {"content": "I can hear you. Standing by."},
                    }
                ]
            },
        ]

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout, data)
            return rows.pop(0)

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                    out = MOD.call_openrouter("I can't hear you talk")
        self.assertTrue(out.get("ok"), out)
        self.assertIn("I can hear you", out.get("spoken") or "")
        self.assertEqual(rows, [])

    def test_call_openrouter_length_retry_keeps_finished_sentence(self) -> None:
        rows = [
            {"choices": [{"finish_reason": "length", "message": {"content": ""}}]},
            {
                "choices": [
                    {
                        "finish_reason": "length",
                        "message": {"content": "I can hear you. Standing by."},
                    }
                ]
            },
        ]

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout, data)
            return rows.pop(0)

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                    out = MOD.call_openrouter("I can't hear you talk")
        self.assertTrue(out.get("ok"), out)
        self.assertIn("I can hear you", out.get("spoken") or "")
        self.assertNotIn("ran out of room", (out.get("spoken") or "").lower())
        self.assertEqual(rows, [])

    def test_call_openrouter_http_error_keeps_code(self) -> None:
        def boom(*_a, **_k):
            raise urllib.error.HTTPError(MOD.OPENROUTER_URL, 400, "bad", hdrs=None, fp=None)

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=boom):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                    out = MOD.call_openrouter("Identify yourself")
        self.assertFalse(out.get("ok"))
        self.assertTrue(out.get("unknown"))
        self.assertEqual(out.get("error"), "http 400")
        self.assertIn("http 400", out.get("spoken") or "")
        self.assertNotIn("HTTPError", out.get("spoken") or "")

    def test_call_openrouter_does_not_slice_history_for_status(self) -> None:
        history = "Evens: UNIQUE_HISTORY_TOKEN the chosen project is hive-os\nJarvis: Noted."
        status = "STATUSCARD " + ("x" * 2500)
        old = status + "\n" + history
        self.assertNotIn("UNIQUE_HISTORY_TOKEN", old[:2000])
        payloads: list[dict] = []

        def fake_json(url, data=None, headers=None, timeout=18.0):
            _ = (url, headers, timeout)
            payloads.append(data or {})
            return {
                "choices": [
                    {
                        "finish_reason": "stop",
                        "message": {"content": "You picked hive-os."},
                    }
                ]
            }

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
            with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                with mock.patch.object(MOD, "_http_open", side_effect=AssertionError("no stream")):
                    out = MOD.call_openrouter("what did I just pick", history + "\n\n" + status)
        user = str((payloads[0].get("messages") or [{}, {}])[1].get("content") or "")
        self.assertIn("UNIQUE_HISTORY_TOKEN", user)
        self.assertGreater(user.rfind("what did I just pick"), user.find("UNIQUE_HISTORY_TOKEN"))
        self.assertGreater(len(user), 2000)
        self.assertTrue(out.get("ok"))
        self.assertEqual(out.get("spoken"), "You picked hive-os.")

    def test_call_openrouter_wall_budget_is_named_dark(self) -> None:
        calls = {"n": 0}

        def fake_json(url, data=None, headers=None, timeout=10.0):
            calls["n"] += 1
            raise TimeoutError()

        with mock.patch.object(MOD, "OPENROUTER_WALL_SEC", 0.05):
            with mock.patch.object(MOD, "OPENROUTER_ATTEMPT_SEC", 10.0):
                with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"):
                    with mock.patch.object(MOD, "_http_json", side_effect=fake_json):
                        with mock.patch.object(MOD, "call_grokbot") as bot:
                            out = MOD.call_openrouter("What should we work on next?")
        self.assertFalse(out.get("ok"))
        self.assertIn("dark", (out.get("spoken") or "").lower())
        self.assertLessEqual(calls["n"], 2)
        self.assertTrue(MOD._named_openrouter_failure(out))
        bot.assert_not_called()

    def test_stalled_chunked_body_raises_before_the_face_wall(self) -> None:
        """A body read that ignores the socket timeout cannot sit until 25s."""
        released = threading.Event()

        class Stall:
            status = 200
            fp = None

            def __enter__(self):
                return self

            def __exit__(self, *args):
                self.close()
                return False

            def read(self):
                # Proven failure: ssl.read stays blocked after urlopen's timeout.
                if not released.wait(30):
                    return b""
                raise TimeoutError("aborted")

            def close(self):
                released.set()

        started = time.monotonic()
        with mock.patch.object(MOD.urllib.request, "urlopen", return_value=Stall()):
            with self.assertRaises(TimeoutError):
                MOD._http_json("https://openrouter.ai/api/v1/chat/completions", timeout=0.4)
        self.assertLess(time.monotonic() - started, 2.0)
        self.assertTrue(released.is_set())

    def test_slow_headers_and_body_share_one_timeout(self) -> None:
        released = threading.Event()

        class DelayedBody:
            status = 200
            fp = None

            def __enter__(self):
                return self

            def __exit__(self, *args):
                self.close()
                return False

            def read(self):
                if released.wait(0.15):
                    raise TimeoutError("aborted")
                return b"{}"

            def close(self):
                released.set()

        def slow_headers(*args, **kwargs):
            time.sleep(0.15)
            return DelayedBody()

        with mock.patch.object(MOD.urllib.request, "urlopen", side_effect=slow_headers):
            with self.assertRaises(TimeoutError):
                MOD._http_json("https://example.invalid/test", timeout=0.2)
        self.assertTrue(released.is_set())

    def test_stalled_provider_stream_is_closed_at_deadline(self) -> None:
        released = threading.Event()

        class Stream:
            fp = None

            def __iter__(self):
                released.wait(10)
                raise TimeoutError("aborted stream")
                yield b""

            def close(self):
                released.set()

        with self.assertRaises(TimeoutError):
            MOD._read_openrouter_stream(Stream(), timeout=0.05)
        self.assertTrue(released.is_set())

    def test_stream_headers_and_body_share_attempt_budget(self) -> None:
        released = threading.Event()

        class Stream:
            fp = None

            def __enter__(self):
                time.sleep(0.15)
                return self

            def __exit__(self, *args):
                self.close()
                return False

            def __iter__(self):
                if released.wait(0.15):
                    raise TimeoutError("aborted stream")
                yield b'data: {"choices":[{"delta":{"content":"Hello."},"finish_reason":"stop"}]}\n'
                yield b'data: [DONE]\n'

            def close(self):
                released.set()

        with mock.patch.object(MOD, "openrouter_api_key", return_value="test-key"), \
             mock.patch.object(MOD, "openrouter_model", return_value="test/model"), \
             mock.patch.object(MOD, "OPENROUTER_FALLBACKS", ()), \
             mock.patch.object(MOD, "OPENROUTER_PAID_FALLBACKS", ()), \
             mock.patch.object(MOD, "OPENROUTER_ATTEMPT_SEC", 0.2), \
             mock.patch.object(MOD, "OPENROUTER_WALL_SEC", 2.0), \
             mock.patch.object(MOD, "_http_open", return_value=Stream()):
            result = MOD.call_openrouter("Hello", hands=False)
        self.assertFalse(result["ok"])
        self.assertNotIn("Hello.", result["spoken"])
        self.assertTrue(released.is_set())

    def test_body_returned_only_after_deadline_close_is_rejected(self) -> None:
        released = threading.Event()
        class LateBody:
            status = 200
            fp = None
            def __enter__(self): return self
            def __exit__(self, *args): self.close(); return False
            def read(self):
                released.wait(2)
                return b'{"ok":true,"spoken":"late answer"}'
            def close(self): released.set()
        with mock.patch.object(MOD.urllib.request, "urlopen", return_value=LateBody()):
            with self.assertRaises(TimeoutError):
                MOD._http_json("https://example.invalid/test", timeout=0.05)
        self.assertTrue(released.is_set())
