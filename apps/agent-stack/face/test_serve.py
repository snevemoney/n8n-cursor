#!/usr/bin/env python3
"""Face tests. Localhost only. No headed mic proof."""
from __future__ import annotations

import importlib.util
import io
import os
import tempfile
import threading
import time
import unittest
from unittest.mock import patch
from pathlib import Path
from types import SimpleNamespace

os.environ.pop("VOICE_OS_BIND", None)
os.environ["AGENT_STACK_CURSOR_DRY"] = "1"
os.environ["AGENT_STACK_DRY_TTS"] = "1"
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
    def test_voice_reload_cancels_old_runtime_before_replacement(self) -> None:
        calls = []
        old = SimpleNamespace(cancel_tts=lambda: calls.append("cancel-old"))
        replacement = object()
        def load():
            calls.append("load-new")
            return replacement
        with patch.object(MOD, "_VOICE", old), patch.object(MOD, "_VOICE_MTIME", -1), patch.object(MOD, "_load_voice", side_effect=load):
            self.assertIs(MOD.voice(), replacement)
            self.assertIs(MOD.voice(), replacement)
            self.assertEqual(calls, ["cancel-old", "load-new"])

    def test_watch_frame_edit_invalidates_loaded_mouth(self) -> None:
        before = MOD._mouth_stamp()
        original_stat = Path.stat
        def changed_stat(path, *args, **kwargs):
            value = original_stat(path, *args, **kwargs)
            if path == SCRIPT.parent.parent / "hands" / "watch_frame.py":
                return SimpleNamespace(st_mtime=value.st_mtime + 1)
            return value
        with patch.object(Path, "stat", changed_stat):
            changed = MOD._mouth_stamp()
            self.assertNotEqual(before, changed)
            replacement = object()
            with patch.object(MOD, "_MOUTH", object()), patch.object(MOD, "_MOUTH_MTIME", before), patch.object(MOD, "_load_mouth", return_value=replacement) as loader:
                self.assertIs(MOD.mouth(), replacement)
                self.assertIs(MOD.mouth(), replacement)
                loader.assert_called_once_with()

    def test_recovered_watch_failure_keeps_scoped_receipt(self) -> None:
        receipt = {"ok": False, "stroke": {"why": "verification_failed"}}
        bus = {"turn_gen": 7, "terminal_response_gen": 7, "utterance": "click next", "spoken": "Postcondition failed.", "execution_gen": 7, "execution": receipt}
        event = MOD.committed_model_event(bus, "click next", 7)
        self.assertFalse(event["ok"])
        self.assertEqual(event["execution"], receipt)
        self.assertNotEqual(event["outcome"], "MODEL_TALK")
        event = MOD.committed_model_event({**bus, "execution_gen": 6}, "click next", 7)
        self.assertTrue(event["ok"])
        self.assertNotIn("execution", event)

    def test_replayed_transition_does_not_restore_task_success(self) -> None:
        receipt = {"ok": True, "stroke": {"ok": True, "verification": {"scope": "observed_transition", "task_verified": False}}}
        bus = {"turn_gen": 7, "terminal_response_gen": 7, "utterance": "save file", "spoken": "Task not verified.", "execution_gen": 7, "execution": receipt}
        event = MOD.committed_model_event(bus, "save file", 7)
        self.assertFalse(event["ok"])
        self.assertFalse(event["task_verified"])
        self.assertEqual(event["execution"], receipt)

    def test_recovered_pipeline_status_matches_committed_generation(self) -> None:
        pipe = MOD.MOUTH.PIPELINE
        for ok in (False, True):
            with self.subTest(ok=ok), tempfile.TemporaryDirectory() as tmp:
                hive = Path(tmp)
                gen = pipe.begin_turn(hive)
                receipt = {"ok": ok, "verification": {"scope": "navigation_url", "passed": ok}}
                with patch.object(pipe, "dress", side_effect=lambda raw, **kw: raw):
                    pipe._commit_spoken(hive, spoken_in="open requested URL", prior_turns=[], tool="safari_see", raw="Navigation requested, but not verified.", wires=["safari_see"], cites=[], ok=ok, pack=None, gen=gen, see=receipt)
                bus = pipe.load_json(hive / "bus/state.json")
                event = MOD.committed_model_event(bus, "open requested URL", gen)
                self.assertEqual(event["ok"], ok)
                self.assertEqual(event["see"], receipt)
                self.assertNotIn("see", MOD.committed_model_event({**bus, "response_see_gen": gen - 1}, "open requested URL", gen))
                stale = {**bus, "response_ok_gen": gen - 1, "response_ok": False}
                self.assertTrue(MOD.committed_model_event(stale, "open requested URL", gen)["ok"])
                next_gen = pipe.begin_turn(hive)
                next_bus = pipe.write_bus(hive, phase="speak", job_status="done", utterance="next local turn", spoken="Standing by.", gen=next_gen)
                self.assertNotIn("response_ok", next_bus)
                self.assertNotIn("response_ok_gen", next_bus)
                self.assertNotIn("response_see", next_bus)
                self.assertNotIn("response_see_gen", next_bus)

    def test_bind_is_localhost(self) -> None:
        self.assertEqual(MOD.HOST, "127.0.0.1")

    def test_turn_wall_never_silent(self) -> None:
        self.assertGreaterEqual(MOD.TURN_WALL_SEC, 10)
        dark = MOD.wire_dark_event("hello")
        self.assertEqual(dark["outcome"], "WIRE_FAILURE")
        self.assertIn("dark", dark["spoken"].lower())
        beat = MOD.think_heartbeat("hello")
        self.assertEqual(beat["verb"], "think")
        src = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("macos_read.py", src)
        self.assertIn("think_heartbeat", src)

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
        self.assertIn("SCRAMBLE", html)
        self.assertIn("productLine", html)
        self.assertIn("isStatusLine", html)
        self.assertIn("looking", html)
        self.assertIn("pickEnglishVoice", html)
        self.assertIn("speakCloud", html)
        self.assertIn("/api/tts", html)
        self.assertIn("/api/voice", html)
        self.assertNotIn("designBtn", html)
        self.assertNotIn("id=\"designPrompt\"", html)
        self.assertNotIn(">DESIGN<", html)
        self.assertIn("en-GB", html)
        self.assertNotIn('TTS_PREF = ["samantha"', html)
        self.assertNotIn("Use Chrome", html)
        self.assertNotIn("Safari speech is flaky", html)
        self.assertIn("state.armed", html)
        self.assertIn("/api/wires", html)
        self.assertIn("MODE - CHECKING", html)
        self.assertIn("STOP_RE", html)
        self.assertIn("AbortController", html)
        self.assertIn("text/event-stream", html)
        self.assertIn("spoken_delta", html)
        self.assertIn("enqueueSpeak", html)
        self.assertIn("ttsQueue", html)
        self.assertIn("heardDelta", html)
        self.assertIn("turnGen", html)
        self.assertIn("last.spoken_delta", html)
        self.assertIn("enqueueSpeak(delta)", html)
        self.assertIn("busGen = last.turn_gen", html)
        self.assertIn("busGen = last.gen", html)
        self.assertIn("productMouth", html)
        self.assertIn("voiceEngine", html)
        self.assertIn("speakCloud", html)
        self.assertIn("prefetchCloud", html)
        self.assertIn("takeReadyCloud", html)
        self.assertIn("abortTtsFetches", html)
        self.assertIn("TTS_FETCH_MS", html)
        self.assertIn("reconcilePhase", html)
        self.assertIn("fetchTtsBuf", html)
        self.assertIn("playCloudBuf", html)
        self.assertIn("ok = await speakCloud(next, gen)", html)
        self.assertIn("if (!ok && gen === ttsGen && productMouth())", html)
        self.assertIn("if (!ok && gen === ttsGen) ok = await speakLocal(next, gen)", html)
        self.assertIn("unlockAudio", html)
        self.assertIn("async function turn(utterance, approved, voice = false)", html)
        self.assertIn('turn($("typed").value.trim(), false, false)', html)
        self.assertIn("if (state.armed) enqueueSpeak(line)", html.split("watch_notice", 1)[1][:800])
        self.assertIn("else if (!WIDGET)", html)
        self.assertIn('document.addEventListener("pointerdown", unlockAudio, true)', html)
        self.assertIn("const FINISH_MS = 1400", html)
        self.assertIn("function queueHeard", html)
        self.assertIn("clearHeardBuffer()", html)
        self.assertIn("queueHeard(t)", html)
        self.assertIn("focusBtn", html)
        self.assertIn("clickFocus", html)
        self.assertIn("paintFocus(bus)", html)
        self.assertIn("/api/focus", html)
        self.assertIn("focusline", html)
        self.assertIn("BOOT_LINES", html)
        self.assertIn("bootLine()", html)
        self.assertIn("notes_indexed", html)
        self.assertIn("timeOfDay()", html)
        self.assertIn("pumpPresence", html)
        self.assertIn("api(\"/api/eyes\", { motion })", html)
        self.assertNotIn("api(\"/api/eyes\", { present })", html)
        self.assertIn("pendingNudge", html)
        self.assertIn("function deliverNudge", html)
        self.assertIn("reliefActive", html)
        self.assertIn('pendingNudge = ""', html)
        self.assertIn('ASK "WHY"', html)
        self.assertIn("revealSpoken", html)
        self.assertIn("const keep = lastSpoken && lastSpoken.length > line.length && lastSpoken.indexOf(line) >= 0", html)
        self.assertIn('self._refuse_gen("watch")', Path(__file__).resolve().parent.joinpath("serve.py").read_text(encoding="utf-8"))
        self.assertNotIn("start = live.peek_gen", Path(__file__).resolve().parent.joinpath("serve.py").read_text(encoding="utf-8"))
        self.assertIn("playViaContext", html)
        self.assertIn("playViaContext(buf, gen, text)", html)
        self.assertIn("function isWireMissLine", html)
        self.assertIn("http 429", html)
        self.assertIn("item.local", html)
        via = html.split("async function playViaContext", 1)[1].split("async function fetchTtsBuf", 1)[0]
        self.assertLess(via.find("src.start()"), via.find("revealSpoken(text, gen)"))
        stream = html.split("const lineText = productLine(last.spoken)", 1)[1].split("if (voice && last.done && !heardDelta", 1)[0]
        self.assertIn('$("spoken").textContent = lineText', stream)
        self.assertIn("decodeAudioData", html)
        self.assertIn("body.speak #wave", html)
        self.assertIn("thinkGlow", html)
        self.assertIn("await speakLocal(next, gen)", html)
        self.assertIn("tts_audio_bounded", Path(__file__).resolve().parent.joinpath("serve.py").read_text(encoding="utf-8"))
        serve = Path(__file__).resolve().parent.joinpath("serve.py").read_text(encoding="utf-8")
        self.assertIn("def _abort_inflight", serve)
        self.assertIn("def _client_gone", serve)
        self.assertIn("pending.get(timeout=0.2)", serve)
        self.assertIn("self.close_connection = True", serve)
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
        self.assertIn("if (STOP_RE.test(text)) return false", html)
        self.assertIn("if (ttsSpeaking() || state.turning) return", html)
        self.assertIn("stopBtn", html)
        self.assertIn('id="stopBtn"', html)
        self.assertIn("Face is dark on 127.0.0.1:4018. Start the Face, then type again.", html)
        self.assertIn("Turn failed. Type and enter, or tap the board.", html)
        self.assertIn("reader.cancel", html)
        self.assertIn("html.widget #typed", html)
        self.assertIn("display: block !important", html)
        self.assertNotIn("html.widget #typed { display: none; }", html)
        self.assertIn("html.widget .chip .line", html)
        self.assertIn("html.widget body.speak .chip", html)
        self.assertIn("ui-monospace, SFMono-Regular, Menlo, Monaco, monospace", html)
        self.assertIn("overflow-y: auto", html)
        self.assertIn("max-height: min(34vh, 220px)", html)  # was 64px; Evens 17:18 saw replies cut mid-line
        self.assertIn("transform: translateX(-50%)", html)
        self.assertIn("html.widget #dock #stopBtn", html)
        self.assertIn("html.widget #dock #stopBtn .btn-label", html)
        self.assertIn("bottom: 70px", html)
        turn_fn = html.split("async function turn(utterance, approved, voice = false)", 1)[1]
        self.assertLess(turn_fn.find("stopSpeech()"), turn_fn.find("snapEyes()"))
        self.assertIn("if (!isStop && eyesStream)", turn_fn)
        self.assertIn("if (turnGen !== gen)", turn_fn)
        self.assertIn("ForceGraph3D", html)
        self.assertIn("/api/graph", html)
        self.assertIn("/api/eyes", html)
        self.assertIn("{ active: false }", html)
        self.assertIn("set_eyes_active", Path(__file__).resolve().parent.joinpath("serve.py").read_text(encoding="utf-8"))
        self.assertIn("/api/watch", html)
        click_watch = html.split("async function clickWatch()", 1)[1].split("function toggleChrome", 1)[0]
        self.assertNotIn('turn("Watch"', click_watch)
        self.assertIn("arm: next", click_watch)
        self.assertIn("eyesBtn", html)
        self.assertIn("watchBtn", html)
        self.assertIn("micBtn", html)
        self.assertIn("hideBtn", html)
        self.assertIn("toggleChrome", html)
        self.assertIn("/api/drop", html)
        self.assertIn("toggleMic", html)
        self.assertIn("disarmMic", html)
        self.assertIn("async function armMic()", html)
        self.assertIn("async function holdMic()", html)
        self.assertIn("enablePointerInteraction", html)
        self.assertIn("aria-pressed", html)
        self.assertIn("Allow the microphone, then tap the board.", html)
        self.assertIn("Speech recognition blocked. Type instead.", html)
        self.assertIn("PLAY_SPEED", html)
        self.assertIn("const PLAY_SPEED = 1.1", html)
        self.assertNotIn("const PLAY_SPEED = 1.2", html)
        self.assertNotIn("const PLAY_SPEED = 1.5", html)
        self.assertIn("playbackRate", html)
        self.assertIn("/orb.js", html)
        self.assertIn("JarvisOrb", html)
        self.assertIn("body.has-graph:not(.widget) #orb3d", html)
        self.assertIn("if (WIDGET) mountOrb()", html)
        self.assertIn("voiceEnergy", html)
        self.assertIn("actionEnergy", html)
        self.assertIn("voiceSmooth", html)
        self.assertIn("actionSmooth", html)
        self.assertIn("mouthOpen", html)
        self.assertIn("rise ? 0.22 : 0.07", html)
        self.assertIn("rise ? 0.18 : 0.08", html)
        self.assertNotIn("talking && voiceSmooth < 0.22", html)
        self.assertIn("html.widget", html)
        self.assertIn('document.body.classList.add("widget")', html)
        self.assertIn("html.widget #dock", html)
        self.assertIn("html.widget .sense .ico {", html)
        self.assertIn("display: block; pointer-events: none;", html)
        self.assertNotIn("telegram", html.lower())
        self.assertNotIn("0.0.0.0", html)
        self.assertNotIn("if (bus.spoken && !state.turning && !state.listening", html)

    def test_overlay_paints_warehouse_not_stubs(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertNotIn("90 NODES", html)
        self.assertNotIn('|| "eleven_v3"', html)
        self.assertNotIn('|| "agent"', html)
        self.assertNotIn("MODE - AGENT", html)
        self.assertNotIn("CURSOR DARK", html)
        self.assertIn("paintLights", html)
        self.assertIn("paintMode", html)
        self.assertIn("paintGraphLine", html)
        self.assertIn("speak_engine", html)
        self.assertIn("speak_voice_id", html)
        self.assertIn("speak_model", html)
        self.assertIn("talk_model", html)
        self.assertIn("dotOnline", html)
        self.assertIn("dotLive", html)
        self.assertIn("dotConnected", html)
        self.assertIn("/healthz", html)
        self.assertIn(".dots span.on i", html)
        self.assertIn("nodeCount", html)

    def test_orb_app_does_not_rebind_face(self) -> None:
        here = Path(__file__).resolve().parent
        install = (here / "install-orb-app.sh").read_text(encoding="utf-8")
        swift = (here / "widget.swift").read_text(encoding="utf-8")
        self.assertIn("This app does not bind a port", install)
        self.assertIn("4018", install)
        self.assertNotIn("ThreadingHTTPServer", swift)
        self.assertNotIn("0.0.0.0", swift)
        self.assertNotIn("telegram", swift.lower())

    def test_native_drop_without_gen_reaches_bus(self) -> None:
        """widget.swift posts only {paths}. The face stamps the current gen."""
        serve_src = (Path(__file__).resolve().parent / "serve.py").read_text(encoding="utf-8")
        self.assertIn("sends only {paths}", serve_src)
        swift = (Path(__file__).resolve().parent / "widget.swift").read_text(encoding="utf-8")
        self.assertIn('JSONSerialization.data(withJSONObject: ["paths": paths])', swift)
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        dropped = html.split("window.jarvisDropped", 1)[1].split("};", 1)[0]
        self.assertIn("enqueueSpeak(line)", dropped)

    def test_stale_sse_wall_does_not_cancel_newer_turn(self) -> None:
        """Codex repro: old gen stalls, new gen begins, old watchdog fires.
        The named dark event goes to the OLD client; the NEW turn survives."""
        import importlib.util
        import io
        import tempfile as tf
        import threading
        from types import SimpleNamespace

        import_serve = importlib.util.spec_from_file_location(
            "serve_scope_test", Path(__file__).resolve().parent / "serve.py"
        )
        serve = importlib.util.module_from_spec(import_serve)
        import_serve.loader.exec_module(serve)
        pipe = serve.MOUTH.PIPELINE
        old_hive, old_wall = serve.HIVE, serve.TURN_WALL_SEC
        with tf.TemporaryDirectory(prefix="serve-scope-") as tmp:
            serve.HIVE = Path(tmp)
            serve.TURN_WALL_SEC = 0.1
            try:
                pipe.begin_turn(serve.HIVE)
                entered = threading.Event()
                finish = threading.Event()

                def blocked(*args, **kwargs):
                    pipe.begin_turn(serve.HIVE)
                    entered.set()
                    finish.wait(2)
                    yield {"spoken": "late", "done": True}

                mouth = SimpleNamespace(PIPELINE=pipe, apply_turn_iter=blocked)
                handler = serve.Handler.__new__(serve.Handler)
                handler.wfile = io.BytesIO()
                handler.send_response = lambda *a: None
                handler.send_header = lambda *a: None
                handler.end_headers = lambda: None
                handler._abort_inflight = lambda: None
                handler._client_gone = lambda: False
                thread = threading.Thread(
                    target=lambda: handler._sse_turn(mouth, "old question", False)
                )
                thread.start()
                entered.wait(1)
                new_gen = pipe.begin_turn(serve.HIVE)
                thread.join(3)
                cancelled = pipe.turn_cancelled(serve.HIVE, new_gen)
                dark_sent = b"The talk wire is dark" in handler.wfile.getvalue()
                finish.set()
            finally:
                serve.HIVE = old_hive
                serve.TURN_WALL_SEC = old_wall
        self.assertFalse(cancelled, "stale watchdog cancelled the newer turn")
        self.assertTrue(dark_sent, "old client must still hear the named failure")

    def test_owning_wall_speaks_dark_not_stop(self) -> None:
        """A producer that ends with no sentence is a dark wire, not a user stop."""
        import importlib.util
        import io
        import tempfile as tf
        import threading
        from types import SimpleNamespace

        import_serve = importlib.util.spec_from_file_location(
            "serve_wall_spoken_test", Path(__file__).resolve().parent / "serve.py"
        )
        serve = importlib.util.module_from_spec(import_serve)
        import_serve.loader.exec_module(serve)
        pipe = serve.MOUTH.PIPELINE
        old_hive, old_wall = serve.HIVE, serve.TURN_WALL_SEC
        with tf.TemporaryDirectory(prefix="serve-wall-spoken-") as tmp:
            serve.HIVE = Path(tmp)
            serve.TURN_WALL_SEC = 0.1
            try:
                pipe.begin_turn(serve.HIVE)
                entered = threading.Event()
                finish = threading.Event()

                def ended(*args, **kwargs):
                    pipe.begin_turn(serve.HIVE)
                    entered.set()
                    if False:
                        yield None

                mouth = SimpleNamespace(PIPELINE=pipe, apply_turn_iter=ended)
                handler = serve.Handler.__new__(serve.Handler)
                handler.wfile = io.BytesIO()
                handler.send_response = lambda *a: None
                handler.send_header = lambda *a: None
                handler.end_headers = lambda: None
                handler._abort_inflight = lambda: None
                handler._client_gone = lambda: False
                thread = threading.Thread(
                    target=lambda: handler._sse_turn(mouth, "mark it shipped", False)
                )
                thread.start()
                entered.wait(1)
                thread.join(3)
                bus = pipe.load_json(serve.HIVE / "bus" / "state.json")
                spoken = str(bus.get("spoken") or "")
                finish.set()
            finally:
                serve.HIVE = old_hive
                serve.TURN_WALL_SEC = old_wall
        self.assertEqual(spoken, serve.TALK_DARK)
        self.assertNotIn("Stopped", spoken)

    def test_prior_wall_cancel_does_not_abort_the_next_arrival(self) -> None:
        """The fence on the generation we arrived on is not an abort of the next turn."""
        old = MOD.HIVE
        with tempfile.TemporaryDirectory(prefix="serve-next-arrival-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            MOD.HIVE = hive
            try:
                (hive / "bus" / "state.json").write_text(
                    '{"turn_gen": 5, "cancel_gen": 4, "phase": "think", "job_status": "working"}\n',
                    encoding="utf-8",
                )
                handler = MOD.Handler.__new__(MOD.Handler)
                self.assertFalse(handler._turn_aborted(4))
                (hive / "bus" / "state.json").write_text(
                    '{"turn_gen": 5, "cancel_gen": 5, "phase": "idle", "job_status": "done"}\n',
                    encoding="utf-8",
                )
                self.assertTrue(handler._turn_aborted(4))
            finally:
                MOD.HIVE = old

    def test_wall_keeps_provider_text_after_empty_partial(self) -> None:
        """The standing line does not replace a provider sentence already on the way."""
        import importlib.util
        import io
        import tempfile as tf
        import threading
        import time as time_mod
        from types import SimpleNamespace

        import_serve = importlib.util.spec_from_file_location(
            "serve_wall_text_test", Path(__file__).resolve().parent / "serve.py"
        )
        serve = importlib.util.module_from_spec(import_serve)
        import_serve.loader.exec_module(serve)
        old_hive, old_wall = serve.HIVE, serve.TURN_WALL_SEC
        sentence = "You did not name an amount."
        with tf.TemporaryDirectory(prefix="serve-wall-text-") as tmp:
            serve.HIVE = Path(tmp)
            (serve.HIVE / "bus").mkdir(parents=True)
            (serve.HIVE / "bus" / "state.json").write_text(
                '{"schema_version": 1, "phase": "idle", "turn_gen": 1}\n',
                encoding="utf-8",
            )
            serve.TURN_WALL_SEC = 0.05
            try:
                def paced(*args, **kwargs):
                    serve.MOUTH.PIPELINE.begin_turn(serve.HIVE)
                    yield {
                        "verb": "converse",
                        "spoken": "",
                        "partial": True,
                        "host": "pipeline",
                        "done": False,
                        "wires": ["store"],
                        "gen": 2,
                    }
                    time_mod.sleep(0.35)
                    yield {
                        "verb": "converse",
                        "spoken": sentence,
                        "done": True,
                        "host": "pipeline",
                        "brain": "openrouter",
                        "outcome": "MODEL_TALK",
                        "gen": 2,
                    }

                mouth = SimpleNamespace(PIPELINE=serve.MOUTH.PIPELINE, apply_turn_iter=paced)
                handler = serve.Handler.__new__(serve.Handler)
                handler.wfile = io.BytesIO()
                handler.connection = None
                handler.send_response = lambda *a: None
                handler.send_header = lambda *a: None
                handler.end_headers = lambda: None
                handler._abort_inflight = lambda: None
                handler._client_gone = lambda: False
                thread = threading.Thread(
                    target=lambda: handler._sse_turn(mouth, "What amount did I say I spent on lunch if I never said one?", False)
                )
                thread.start()
                thread.join(3)
                raw = handler.wfile.getvalue()
            finally:
                serve.HIVE = old_hive
                serve.TURN_WALL_SEC = old_wall
        self.assertIn(sentence.encode(), raw)
        self.assertNotIn(serve.TALK_DARK.encode(), raw)

    def test_wall_clocks_stay_put(self) -> None:
        """The outstanding-hand hold is not a longer global wall."""
        self.assertEqual(MOD.TURN_WALL_SEC, 25.0)
        self.assertEqual(MOD.PROVIDER_TEXT_GRACE_SEC, 10.0)

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

    def test_wall_holds_while_vault_read_is_outstanding(self) -> None:
        """Past the wall and the grace, an in-flight vault_read is not replaced."""
        import_serve = importlib.util.spec_from_file_location(
            "serve_wall_vault_test", Path(__file__).resolve().parent / "serve.py"
        )
        serve = importlib.util.module_from_spec(import_serve)
        import_serve.loader.exec_module(serve)
        old_hive, old_wall, old_grace = serve.HIVE, serve.TURN_WALL_SEC, serve.PROVIDER_TEXT_GRACE_SEC
        sentence = "The note tagged sample-shelf was left uncreated."
        with tempfile.TemporaryDirectory(prefix="serve-wall-vault-") as tmp:
            serve.HIVE = Path(tmp)
            (serve.HIVE / "bus").mkdir(parents=True)
            (serve.HIVE / "bus" / "state.json").write_text(
                '{"schema_version": 1, "phase": "idle", "turn_gen": 1}\n',
                encoding="utf-8",
            )
            serve.TURN_WALL_SEC = 0.05
            serve.PROVIDER_TEXT_GRACE_SEC = 0.05
            started = threading.Event()
            released = threading.Event()
            # Deterministic clock: serve's deadline math reads time.monotonic(). It stays at 0 until the
            # vault_read is open, then jumps far past wall + grace, so the hold is judged by the state of
            # the turn, not by how fast a loaded machine runs the producer thread.
            real_time = time
            jumped = threading.Event()
            polls_after_jump = []

            class FakeTime:
                def monotonic(self):
                    if not started.is_set():
                        return 0.0
                    jumped.set()
                    polls_after_jump.append(1)
                    return 1000.0

                def __getattr__(self, name):
                    return getattr(real_time, name)

            serve.time = FakeTime()
            try:
                def paced(*args, **kwargs):
                    serve.MOUTH.PIPELINE.begin_turn(serve.HIVE)
                    yield {
                        "verb": "converse",
                        "spoken": "",
                        "partial": True,
                        "host": "pipeline",
                        "done": False,
                        "wires": ["store"],
                        "gen": 2,
                    }
                    yield {
                        "verb": "vault_read",
                        "tool": "vault_read",
                        "spoken": "",
                        "partial": True,
                        "done": False,
                        "host": "pipeline",
                        "wires": ["vault_read"],
                        "gen": 2,
                    }
                    started.set()
                    released.wait(2)
                    yield {
                        "verb": "vault_read",
                        "spoken": sentence,
                        "done": True,
                        "host": "pipeline",
                        "brain": "openrouter",
                        "outcome": "TOOL_LOOP",
                        "gen": 2,
                    }

                mouth = SimpleNamespace(PIPELINE=serve.MOUTH.PIPELINE, apply_turn_iter=paced)
                handler = serve.Handler.__new__(serve.Handler)
                handler.wfile = io.BytesIO()
                handler.connection = None
                handler.send_response = lambda *a: None
                handler.send_header = lambda *a: None
                handler.end_headers = lambda: None
                handler._abort_inflight = lambda: None
                handler._client_gone = lambda: False
                thread = threading.Thread(
                    target=lambda: handler._sse_turn(mouth, "Read the shelf index.", False)
                )
                thread.start()
                self.assertTrue(started.wait(1), "vault_read open signal did not arrive")
                # Wait until the loop has judged the (jumped) deadline at least three times while the
                # vault_read is outstanding, instead of sleeping wall-clock time.
                deadline_real = real_time.monotonic() + 5
                while len(polls_after_jump) < 3 and real_time.monotonic() < deadline_real:
                    real_time.sleep(0.01)
                self.assertGreaterEqual(len(polls_after_jump), 3, "loop never judged the deadline")
                mid = handler.wfile.getvalue()
                released.set()
                thread.join(3)
                raw = handler.wfile.getvalue()
            finally:
                released.set()
                serve.time = real_time
                serve.HIVE = old_hive
                serve.TURN_WALL_SEC = old_wall
                serve.PROVIDER_TEXT_GRACE_SEC = old_grace
        self.assertNotIn(serve.TALK_DARK.encode(), mid)
        self.assertIn(sentence.encode(), raw)
        self.assertNotIn(serve.TALK_DARK.encode(), raw)

    def test_live_owner_closes_after_grace(self) -> None:
        """A live talk producer cannot bypass the user-selected hard ceiling."""
        import_serve = importlib.util.spec_from_file_location(
            "serve_wall_idle_test", Path(__file__).resolve().parent / "serve.py"
        )
        serve = importlib.util.module_from_spec(import_serve)
        import_serve.loader.exec_module(serve)
        old_hive, old_wall, old_grace = serve.HIVE, serve.TURN_WALL_SEC, serve.PROVIDER_TEXT_GRACE_SEC
        late = "This sentence arrived after the idle wall."
        with tempfile.TemporaryDirectory(prefix="serve-wall-idle-") as tmp:
            serve.HIVE = Path(tmp)
            (serve.HIVE / "bus").mkdir(parents=True)
            (serve.HIVE / "bus" / "state.json").write_text(
                '{"schema_version": 1, "phase": "idle", "turn_gen": 1}\n',
                encoding="utf-8",
            )
            serve.TURN_WALL_SEC = 0.05
            serve.PROVIDER_TEXT_GRACE_SEC = 0.05
            try:
                def paced(*args, **kwargs):
                    serve.MOUTH.PIPELINE.begin_turn(serve.HIVE)
                    yield {
                        "verb": "converse",
                        "spoken": "",
                        "partial": True,
                        "host": "pipeline",
                        "done": False,
                        "wires": ["store"],
                        "gen": 2,
                    }
                    time.sleep(0.35)
                    yield {
                        "verb": "converse",
                        "spoken": late,
                        "done": True,
                        "host": "pipeline",
                        "brain": "openrouter",
                        "outcome": "MODEL_TALK",
                        "gen": 2,
                    }

                mouth = SimpleNamespace(PIPELINE=serve.MOUTH.PIPELINE, apply_turn_iter=paced)
                handler = serve.Handler.__new__(serve.Handler)
                handler.wfile = io.BytesIO()
                handler.connection = None
                handler.send_response = lambda *a: None
                handler.send_header = lambda *a: None
                handler.end_headers = lambda: None
                handler._abort_inflight = lambda: None
                handler._client_gone = lambda: False
                thread = threading.Thread(
                    target=lambda: handler._sse_turn(mouth, "Read the shelf index.", False)
                )
                thread.start()
                thread.join(3)
                raw = handler.wfile.getvalue()
            finally:
                serve.HIVE = old_hive
                serve.TURN_WALL_SEC = old_wall
                serve.PROVIDER_TEXT_GRACE_SEC = old_grace
        self.assertNotIn(late.encode(), raw)
        self.assertIn(serve.TALK_DARK.encode(), raw)

    def test_stale_mouth_reloads_and_never_generates_desk_ask(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("_MOUTH_MTIME", text)
        self.assertIn("st_mtime", text)
        self.assertIn("pipeline.py", text)
        self.assertIn("load_existing_env", text)
        self.assertNotIn('bus.get("permission_ask") or bus.get("utterance")', text)
        self.assertNotIn("May I hand this to the grok desk", text)

    def test_pane_script_boundary_has_no_leaked_js(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertTrue(html.rstrip().endswith("</html>"))
        after = html.split("</html>", 1)[-1]
        self.assertNotIn("paintPhase(", after)
        self.assertNotIn('TAP BOARD OR SPACE TO TALK";', after)
        self.assertNotIn("})();", after)
        self.assertIn("</script>\n</body>\n</html>", html[-80:])

    def test_mic_sept5_arm_path_no_latch(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertIn("async function armMic()", html)
        self.assertIn("async function holdMic()", html)
        self.assertIn("getUserMedia({ audio: true })", html)
        self.assertIn("if (granted && !WIDGET) armMic()", html)
        self.assertIn("if (state.listening)", html.split("async function toggleMic()", 1)[1].split("async function armMic()", 1)[0])
        self.assertIn("Allow the microphone, then tap the board.", html)
        self.assertIn('$("chip").addEventListener("click", onArmGesture)', html)
        self.assertIn('$("board").addEventListener("click", onArmGesture)', html)
        self.assertIn('$("micBtn").addEventListener("click"', html)
        space = html.split('document.addEventListener("keydown"', 1)[1].split("});", 1)[0]
        self.assertIn("Space", space)
        self.assertIn("armMic()", space)
        arm = html.split("async function armMic()", 1)[1].split("// --- living circuit board", 1)[0]
        self.assertIn("await holdMic()", arm)
        self.assertLess(arm.find("startListen()"), arm.find("await holdMic()"))
        self.assertIn('if (!(state.listening || state.starting || state.rec))', arm)
        self.assertIn("if (state.arming) return", arm)
        self.assertIn("Speech recognition unsupported here. Type instead.", arm)
        self.assertIn("Speech recognition blocked. Type instead.", html)
        self.assertNotIn("state.armed = true;\n        return", arm)
        hold = html.split("async function holdMic()", 1)[1].split("function startListen", 1)[0]
        self.assertIn("getUserMedia({ audio: true })", hold)
        self.assertNotIn("if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;", hold)
        refresh = html.split("function reconcilePhase(bus)", 1)[1].split("function onArmGesture", 1)[0]
        self.assertIn("bus.job_status !== \"working\"", refresh)
        self.assertIn('state.phase === "think"', refresh)
        self.assertIn("state.listening || state.armed", refresh)
        self.assertIn("productLine(bus.spoken)", refresh)
        self.assertIn("function isFallbackLine", html)
        self.assertIn('paintPhase("speak")', html)
        fallback = html.split("function showTypeFallback", 1)[1].split("async function holdMic", 1)[0]
        self.assertIn("isStatusLine(now)", fallback)
        self.assertNotIn('$("spoken").textContent = line;\n      $("typed")', fallback)
        self.assertIn('replace(/\\*\\*/g, "")', html)
        self.assertIn("setInterval(refresh, 800)", html)
        self.assertIn("font-size: 16px", html)
        self.assertNotIn("staleTurn", html)
        self.assertIn("postStop", html)
        self.assertIn("if (gen !== undefined && gen !== ttsGen) return false", html)
        self.assertNotIn("row.gen !== undefined ? row.gen : ttsGen", html)
        self.assertIn('bus.phase !== "speak"', refresh)
        self.assertIn('bus.phase !== "listen"', refresh)
        self.assertIn("fallback_reason", html)
        chip_css = html.split(".chip {", 1)[1].split("}", 1)[0]
        self.assertIn("pointer-events: auto", chip_css)
        self.assertNotIn("function micDenied()", html)
        self.assertNotIn("function maybeAutoArm()", html)
        self.assertNotIn("function paintMicLock()", html)
        self.assertNotIn("function clearMicLatch()", html)
        self.assertNotIn("FACE_LOCK", html)
        self.assertNotIn("function takeOwner()", html)
        self.assertNotIn("canAutoListen", html)
        self.assertNotIn("micHard", html)
        self.assertNotIn("needMic", html)
        self.assertNotIn("Reset Microphone for", html)
        self.assertNotIn("bootMic()", html)
        self.assertNotIn("TAP MIC TO TRY AGAIN", html)
        self.assertNotIn("Microphone is blocked", html)

    def test_voice_fallback_reason_token_on_pane(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertIn("fallback_reason", html)
        self.assertIn("engine !== \"elevenlabs\" && reason", html)

    def test_graph_motion_stays_alive(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertIn("cooldownTime(Infinity)", html)
        self.assertIn("cooldownTicks(Infinity)", html)
        self.assertIn("controlType: \"orbit\"", html)
        self.assertIn("autoRotate", html)
        self.assertIn("resumeAnimation", html)
        self.assertIn("enablePointerInteraction(true)", html)
        self.assertNotIn("enablePointerInteraction(false)", html)
        graph_css = html.split("#graph {", 1)[1].split("}", 1)[0]
        self.assertIn("pointer-events: auto", graph_css)
        self.assertNotIn("pointer-events: none", graph_css)
        dock_css = html.split(".sense, #dock {", 1)[1].split("}", 1)[0]
        self.assertIn("pointer-events: auto", dock_css)
        self.assertIn("z-index: 8", dock_css)
        self.assertIn("connection-probe query", html)
        self.assertNotIn("pauseAnimation", html)
        self.assertNotIn("cooldownTime(0)", html)
        self.assertNotIn("cooldownTicks(0)", html)
        refresh = html.split("async function refresh()", 1)[1].split("function onArmGesture", 1)[0]
        self.assertNotIn("pauseAnimation", refresh)
        self.assertNotIn("vaultGraph.pause", refresh)
        self.assertIn("paintGraphLine", refresh)
        self.assertNotIn("nographblock) return", html)
        self.assertNotIn("nographblock &&", html)


if __name__ == "__main__":
    unittest.main()
