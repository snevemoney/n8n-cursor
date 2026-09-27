#!/usr/bin/env python3
"""Face tests. Localhost only. No headed mic proof."""
from __future__ import annotations

import importlib.util
import json
import os
import tempfile
import threading
import unittest
import urllib.request
from pathlib import Path

os.environ.pop("VOICE_OS_BIND", None)
SCRIPT = Path(__file__).resolve().parent / "serve.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_face", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class FaceServeTest(unittest.TestCase):
    def test_face_speaks_local_change_once(self) -> None:
        prev_hive = MOD.HIVE
        prev_event = os.environ.get("WATCH_EVENT_PATH")
        prev_dry = os.environ.get("AGENT_STACK_CURSOR_DRY")
        os.environ["AGENT_STACK_CURSOR_DRY"] = "1"
        tmp = tempfile.TemporaryDirectory(prefix="face-watch-http-")
        hive = Path(tmp.name)
        (hive / "bus").mkdir(parents=True)
        events = hive / "bus" / "events.jsonl"
        os.environ["WATCH_EVENT_PATH"] = str(events)
        MOD.HIVE = hive
        httpd = MOD.ThreadingHTTPServer((MOD.HOST, 0), MOD.Handler)
        port = int(httpd.server_address[1])
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()

        def post(path: str, payload: dict) -> dict:
            req = urllib.request.Request(
                f"http://{MOD.HOST}:{port}{path}",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=8) as res:
                return json.loads(res.read().decode("utf-8"))

        def get(path: str) -> dict:
            with urllib.request.urlopen(f"http://{MOD.HOST}:{port}{path}", timeout=8) as res:
                return json.loads(res.read().decode("utf-8"))

        try:
            made = post("/api/turn", {"utterance": "Watch the local test value and tell me when it changes."})
            self.assertEqual(made["verb"], "watch")
            self.assertIn("Watching", made["spoken"])
            status = get("/api/watch/status")
            self.assertTrue(status["active"])
            self.assertEqual(status["current_state"], "A")
            self.assertEqual(status["source"], "local_test_value")
            chat = post("/api/turn", {"utterance": "Hey Jarvis."})
            self.assertNotEqual(chat["verb"], "watch")
            self.assertEqual(get("/api/watch/status")["watch_id"], status["watch_id"])
            posted = post("/api/watch/source", {"value": "B"})
            self.assertEqual(posted["value"], "B")
            self.assertEqual(get("/api/watch/status")["current_state"], "A")
            bus = get("/api/bus")
            self.assertEqual(bus["spoken"], "B")
            self.assertEqual(bus["watch_notice"]["spoken"], "B")
            self.assertEqual(bus["watch"]["notify_count"], 1)
            again = post("/api/watch/tick", {})
            self.assertFalse(again["notified"])
            self.assertEqual(again["spoken"], "")
            self.assertEqual(len([line for line in events.read_text(encoding="utf-8").splitlines() if line.strip()]), 1)
            stopped = post("/api/turn", {"utterance": "cancel the watch"})
            self.assertIn("Stopped", stopped["spoken"])
            final = get("/api/watch/status")
            self.assertFalse(final["active"])
            self.assertEqual(final["spoken"], "The watch is stopped.")
        finally:
            httpd.shutdown()
            httpd.server_close()
            MOD.HIVE = prev_hive
            if prev_event is None:
                os.environ.pop("WATCH_EVENT_PATH", None)
            else:
                os.environ["WATCH_EVENT_PATH"] = prev_event
            if prev_dry is None:
                os.environ.pop("AGENT_STACK_CURSOR_DRY", None)
            else:
                os.environ["AGENT_STACK_CURSOR_DRY"] = prev_dry
            tmp.cleanup()

    def test_bind_is_localhost(self) -> None:
        self.assertEqual(MOD.HOST, "127.0.0.1")

    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)
        self.assertEqual(out.get("bind"), "127.0.0.1")
        self.assertEqual(out.get("home"), 200)

    def test_pane_is_tape_visualizer(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertIn("<canvas", html)
        self.assertIn("J.A.R.V.I.S.", html)
        self.assertIn("TAP SPACE", html)
        self.assertIn("LISTENING FOR", html)
        self.assertNotIn("Desk · Face", html)
        self.assertNotIn("<h2>Observe</h2>", html)
        self.assertNotIn("<h2>Mouth</h2>", html)
        self.assertNotIn("Hold Home", html)
        self.assertNotIn("Hold Talk", html)

    def test_pane_hears_without_ptt_or_observe(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertIn("getUserMedia", html)
        self.assertIn("holdMic", html)
        self.assertIn("streamLive", html)
        self.assertIn("RESTART_MIN", html)
        self.assertIn("scheduleRestart", html)
        self.assertIn("rec.onerror", html)
        self.assertIn("rec.onend", html)
        self.assertIn("LISTENING", html)
        self.assertIn("pickEnglishVoice", html)
        self.assertIn("speakCloud", html)
        self.assertIn("/api/tts", html)
        self.assertIn("/api/voice", html)
        self.assertIn("bm_lewis", html)
        self.assertIn("en-GB", html)
        self.assertNotIn('TTS_PREF = ["samantha"', html)
        self.assertNotIn("Use Chrome", html)
        self.assertNotIn("Safari speech is flaky", html)
        self.assertIn("state.armed", html)
        self.assertIn("/api/wires", html)
        self.assertIn("CURSOR", html)
        self.assertIn("MODE - AGENT", html)
        self.assertIn("STOP_RE", html)
        self.assertIn("AbortController", html)
        self.assertIn("text/event-stream", html)
        self.assertIn("spoken_delta", html)
        self.assertIn("enqueueSpeak", html)
        self.assertIn("ttsQueue", html)
        self.assertIn("heardDelta", html)
        self.assertIn("turnGen", html)
        self.assertIn("if (last.spoken_delta)", html)
        self.assertIn("enqueueSpeak(last.spoken_delta)", html)
        self.assertIn("productMouth", html)
        self.assertIn("voiceEngine", html)
        self.assertIn("speakCloud(next, gen)", html)
        self.assertIn("if (!ok && gen === ttsGen && !productMouth()) speakLocal(next)", html)
        self.assertNotIn("if (last.done) enqueueSpeak", html)
        self.assertNotIn("ollama", html.lower())
        self.assertNotIn("if (state.live && !state.turning)", html)
        self.assertNotIn("bootMic()", html)
        self.assertNotIn("Hold Home", html)
        self.assertNotIn("<h2>Mouth</h2>", html)
        self.assertNotIn("getTracks().forEach((t) => t.stop())", html)
        self.assertNotIn("scheduleRestart(180)", html)
        self.assertNotIn("scheduleRestart(120)", html)
        self.assertIn("stopListen", html)
        self.assertIn("lastSpoken", html)
        self.assertIn("ECHO_RE", html)
        self.assertIn("isMouthEcho", html)
        self.assertIn("if (ttsSpeaking() || state.turning) return", html)
        self.assertNotIn("if (bus.spoken && !state.turning && !state.listening", html)

    def test_stale_mouth_reloads_and_never_generates_desk_ask(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("_MOUTH_MTIME", text)
        self.assertIn("st_mtime", text)
        self.assertIn("pipeline.py", text)
        self.assertIn("load_existing_env", text)
        self.assertNotIn('bus.get("permission_ask") or bus.get("utterance")', text)
        self.assertNotIn("May I hand this to the grok desk", text)


if __name__ == "__main__":
    unittest.main()
