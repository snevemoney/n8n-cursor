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

    def test_alive_wall_returns_the_committed_model_line(self) -> None:
        """The plain 25s wall must hand the client the sentence already on the bus."""
        asked = "How long should I boil an egg if I want a jammy yolk?"
        line = (
            "Sir. For a jammy yolk, boil the egg for approximately 6 to 7 minutes. "
            "This provides a good balance between a runny and fully set yolk."
        )
        old = MOD.HIVE
        with tempfile.TemporaryDirectory(prefix="serve-alive-wall-") as tmp:
            hive = Path(tmp)
            MOD.HIVE = hive
            try:
                pipe = MOD.MOUTH.PIPELINE
                pipe.begin_turn(hive)
                gen = int(pipe.peek_gen(hive) or 0)

                def publish(bus: dict) -> dict:
                    bus["utterance"] = asked
                    bus["spoken"] = line
                    bus["tool"] = "converse"
                    bus["brain"] = "openrouter"
                    bus["wires"] = ["converse", "store"]
                    return bus

                pipe.mutate_bus(hive, publish)
                handler = MOD.Handler.__new__(MOD.Handler)
                handler._abort_inflight = lambda: (_ for _ in ()).throw(AssertionError("abort"))
                kept = handler._alive_wall_body(pipe, asked, gen, gen)
                bus = pipe.load_json(hive / "bus" / "state.json")
            finally:
                MOD.HIVE = old
        self.assertEqual(kept.get("spoken"), line)
        self.assertEqual(kept.get("outcome"), "MODEL_TALK")
        self.assertNotEqual(kept.get("spoken"), MOD.TALK_DARK)
        self.assertEqual(bus.get("spoken"), line)
        self.assertFalse(int(bus.get("cancel_gen") or 0) >= gen)
        self.assertEqual(MOD.TURN_WALL_SEC, 25.0)

    def test_alive_wall_returns_line_when_generation_was_not_opened(self) -> None:
        """Predicted gen is arrival+1. This turn path does not bump turn_gen."""
        asked = "How long should I boil an egg if I want a jammy yolk?"
        line = (
            "Sir. For a jammy yolk, boil the egg for approximately 6 to 7 minutes. "
            "This provides a good balance between a runny and fully set yolk."
        )
        old = MOD.HIVE
        with tempfile.TemporaryDirectory(prefix="serve-wall-nogen-") as tmp:
            hive = Path(tmp)
            MOD.HIVE = hive
            try:
                pipe = MOD.MOUTH.PIPELINE
                (hive / "bus").mkdir(parents=True)
                (hive / "bus" / "state.json").write_text(
                    json.dumps(
                        {
                            "turn_gen": 3878,
                            "utterance": asked,
                            "spoken": line,
                            "tool": "converse",
                            "brain": "openrouter",
                        }
                    ),
                    encoding="utf-8",
                )
                handler = MOD.Handler.__new__(MOD.Handler)
                handler._abort_inflight = lambda: (_ for _ in ()).throw(AssertionError("abort"))
                kept = handler._alive_wall_body(pipe, asked, 3879, 3878)
                bus = pipe.load_json(hive / "bus" / "state.json")
            finally:
                MOD.HIVE = old
        self.assertEqual(kept.get("spoken"), line)
        self.assertEqual(kept.get("outcome"), "MODEL_TALK")
        self.assertEqual(bus.get("spoken"), line)
        self.assertNotIn("cancel_gen", bus)

    def test_alive_wall_stays_dark_when_nothing_is_published(self) -> None:
        """Turn 3887: 25s and no sentence. The client stays dark."""
        asked = "How long should I boil an egg if I want a jammy yolk?"
        old = MOD.HIVE
        with tempfile.TemporaryDirectory(prefix="serve-wall-empty-") as tmp:
            hive = Path(tmp)
            MOD.HIVE = hive
            try:
                pipe = MOD.MOUTH.PIPELINE
                pipe.begin_turn(hive)
                gen = int(pipe.peek_gen(hive) or 0)
                pipe.mutate_bus(
                    hive,
                    lambda bus: {**bus, "utterance": asked, "spoken": "", "phase": "think", "job_status": "working"},
                )
                handler = MOD.Handler.__new__(MOD.Handler)
                handler._abort_inflight = lambda: None
                body = handler._alive_wall_body(pipe, asked, gen, gen)
                bus = pipe.load_json(hive / "bus" / "state.json")
            finally:
                MOD.HIVE = old
        self.assertEqual(body.get("spoken"), MOD.TALK_DARK)
        self.assertEqual(bus.get("spoken"), MOD.TALK_DARK)
        self.assertEqual(MOD.TURN_WALL_SEC, 25.0)

    def test_plain_turn_returns_remembered_line_while_worker_is_alive(self) -> None:
        """POST /api/turn, no stream. Sentence remembered, bus spoken not written, worker still in archive."""
        asked = "How long should I boil an egg if I want a jammy yolk?"
        line = (
            "Sir. For a jammy yolk, boil the egg for approximately 6 to 7 minutes. "
            "This provides a good balance between a runny and fully set yolk."
        )
        old_hive = MOD.HIVE
        old_wall = MOD.TURN_WALL_SEC
        live = MOD.mouth()
        orig = live.apply_turn
        release = threading.Event()
        started = threading.Event()

        def stalled(utterance, **_kwargs):
            started.set()
            release.wait(3)
            return {"ok": True, "verb": "converse", "spoken": "WORKER_FINISHED", "ask": False}

        live.apply_turn = stalled
        MOD.TURN_WALL_SEC = 0.3
        tmp = tempfile.TemporaryDirectory(prefix="serve-plain-wall-")
        hive = Path(tmp.name)
        (hive / "bus").mkdir(parents=True)
        MOD.HIVE = hive
        live.PIPELINE.remember_published_line(hive, asked, line)
        httpd = MOD.ThreadingHTTPServer((MOD.HOST, 0), MOD.Handler)
        port = int(httpd.server_address[1])
        self.assertNotEqual(port, 4018)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            req = urllib.request.Request(
                f"http://{MOD.HOST}:{port}/api/turn",
                data=json.dumps({"utterance": asked}).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=3) as res:
                body = json.loads(res.read().decode("utf-8"))
            self.assertTrue(started.is_set())
            bus_path = hive / "bus" / "state.json"
            raw = bus_path.read_text(encoding="utf-8") if bus_path.is_file() else ""
        finally:
            release.set()
            httpd.shutdown()
            httpd.server_close()
            live.apply_turn = orig
            MOD.HIVE = old_hive
            MOD.TURN_WALL_SEC = old_wall
            tmp.cleanup()
        self.assertEqual(body.get("spoken"), line)
        self.assertNotEqual(body.get("spoken"), MOD.TALK_DARK)
        self.assertNotIn(MOD.TALK_DARK, raw)
        self.assertEqual(MOD.TURN_WALL_SEC, 25.0)

    def test_stream_error_after_remember_emits_the_line(self) -> None:
        """Stream path: archive raises after the sentence is stored. Do not hide it."""
        asked = "How long should I boil an egg if I want a jammy yolk?"
        line = (
            "Sir. For a jammy yolk, boil the egg for approximately 6 to 7 minutes. "
            "This provides a good balance between a runny and fully set yolk."
        )
        old_hive = MOD.HIVE
        live = MOD.mouth()
        orig = live.apply_turn_iter

        def boom(utterance, **_kwargs):
            live.PIPELINE.remember_published_line(MOD.HIVE, utterance, line)
            raise RuntimeError("multi-root archive still in flight")

        live.apply_turn_iter = boom
        tmp = tempfile.TemporaryDirectory(prefix="serve-stream-wall-")
        hive = Path(tmp.name)
        (hive / "bus").mkdir(parents=True)
        MOD.HIVE = hive
        httpd = MOD.ThreadingHTTPServer((MOD.HOST, 0), MOD.Handler)
        port = int(httpd.server_address[1])
        self.assertNotEqual(port, 4018)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            req = urllib.request.Request(
                f"http://{MOD.HOST}:{port}/api/turn",
                data=json.dumps({"utterance": asked, "stream": True}).encode("utf-8"),
                headers={"Content-Type": "application/json", "Accept": "text/event-stream"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=3) as res:
                payload = res.read().decode("utf-8")
            bus_path = hive / "bus" / "state.json"
            raw = bus_path.read_text(encoding="utf-8") if bus_path.is_file() else ""
        finally:
            httpd.shutdown()
            httpd.server_close()
            live.apply_turn_iter = orig
            MOD.HIVE = old_hive
            tmp.cleanup()
        self.assertIn(line, payload)
        self.assertNotIn(MOD.TALK_DARK, payload)
        self.assertNotIn("That turn failed before it could speak.", payload)
        self.assertNotIn(MOD.TALK_DARK, raw)


if __name__ == "__main__":
    unittest.main()
