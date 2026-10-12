#!/usr/bin/env python3
"""Repo voice tests. Dry TTS never bills. No macOS remap as the product."""
from __future__ import annotations

import importlib.util
import io
import os
import time
import unittest
import unittest.mock
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"
SCRIPT = Path(__file__).resolve().parent / "voice.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_voice_test", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class VoiceTest(unittest.TestCase):
    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_product_is_repo_british_butler(self) -> None:
        report = MOD.voice_report()
        self.assertEqual(report["lang"], "en-GB")
        self.assertEqual(report["repo"]["kokoro"], "bm_lewis")
        self.assertEqual(report["repo"]["elevenlabs"], "eleven_v3")
        self.assertEqual(report["repo"]["design"], "eleven_ttv_v3")
        self.assertEqual(report["model"], "eleven_v3")
        self.assertEqual(report["design_model"], "eleven_ttv_v3")
        self.assertNotIn(report["voice"], {"Samantha", "Daniel"})
        self.assertNotEqual(report["engine"], "say")

    def test_dry_tts_is_silent(self) -> None:
        audio, mime = MOD.tts_audio("Hello Evens")
        self.assertEqual(audio, b"")
        self.assertEqual(mime, "")
        self.assertEqual(MOD.tts_bytes("Hello Evens"), b"")

    def test_kokoro_retries_once_after_dead_pipe(self) -> None:
        os.environ.pop("AGENT_STACK_DRY_TTS", None)
        calls = {"n": 0}

        def fake_ask(text: str) -> bytes:
            calls["n"] += 1
            if calls["n"] == 1:
                return b""
            return b"RIFF" + b"\x00" * 12

        with unittest.mock.patch.object(MOD, "kokoro_ready", return_value=True):
            with unittest.mock.patch.object(MOD, "voice_python", return_value=Path("/bin/true")):
                with unittest.mock.patch.object(MOD, "_ask_worker", side_effect=fake_ask):
                    audio = MOD._kokoro_bytes("Hello Evens")
        self.assertEqual(calls["n"], 2)
        self.assertTrue(audio.startswith(b"RIFF"))
        os.environ["AGENT_STACK_DRY_TTS"] = "1"

    def test_elevenlabs_keychain_is_cached(self) -> None:
        MOD._ELEVEN_LOOKED = False
        MOD._ELEVEN_KEY = None
        calls = {"n": 0}

        def fake_run(*args, **kwargs):
            _ = (args, kwargs)
            calls["n"] += 1
            out = unittest.mock.Mock()
            out.returncode = 1
            out.stdout = ""
            return out

        with unittest.mock.patch.dict(os.environ, {"ELEVENLABS_API_KEY": "", "ELEVEN_LABS_API_KEY": ""}, clear=False):
            os.environ.pop("ELEVENLABS_API_KEY", None)
            os.environ.pop("ELEVEN_LABS_API_KEY", None)
            with unittest.mock.patch.object(MOD.subprocess, "run", side_effect=fake_run):
                self.assertEqual(MOD.elevenlabs_key(), "")
                self.assertEqual(MOD.elevenlabs_key(), "")
        self.assertEqual(calls["n"], 1)
        MOD._ELEVEN_LOOKED = False
        MOD._ELEVEN_KEY = None

    def test_no_macos_say_remap(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn('["say", "-v"', text)
        self.assertNotIn("say -v Samantha", text)
        self.assertNotIn("say -v Daniel", text)
        self.assertIn("bm_lewis", text)
        self.assertIn("7cOBG34AiHrAzs842Rdi", text)
        self.assertIn("eleven_v3", text)
        self.assertIn("eleven_ttv_v3", text)
        self.assertNotIn("eleven_multilingual_v2", text)
        self.assertNotIn("OPENAI_API_KEY", text)
        self.assertIn("_drain_stderr", text)
        self.assertIn("_readline_deadline", text)
        self.assertIn("tts_audio_bounded", text)
        self.assertIn("WORKER_ASK_SEC", text)

    def test_ask_worker_times_out_and_recovers(self) -> None:
        os.environ.pop("AGENT_STACK_DRY_TTS", None)
        killed = {"n": 0}

        class FakeStdin:
            def write(self, data):
                return len(data)

            def flush(self):
                return None

            def close(self):
                return None

        class FakeStdout:
            def readline(self):
                time.sleep(8)
                return ""

            def close(self):
                return None

        class FakeProc:
            def __init__(self):
                self.stdin = FakeStdin()
                self.stdout = FakeStdout()
                self.stderr = FakeStdin()

            def poll(self):
                return None

            def kill(self):
                killed["n"] += 1

            def wait(self, timeout=None):
                _ = timeout
                return 0

        fake = FakeProc()
        MOD._WORKER = fake
        MOD._WORKER_READY = True
        old_ask = MOD.WORKER_ASK_SEC
        MOD.WORKER_ASK_SEC = 0.2
        try:
            started = time.time()
            audio = MOD._ask_worker("Ready, sir.")
            elapsed = time.time() - started
        finally:
            MOD.WORKER_ASK_SEC = old_ask
            MOD._WORKER = None
            MOD._WORKER_READY = False
            os.environ["AGENT_STACK_DRY_TTS"] = "1"
        self.assertEqual(audio, b"")
        self.assertLess(elapsed, 2.5)
        self.assertGreaterEqual(killed["n"], 1)
        self.assertIsNone(MOD._WORKER)

    def test_close_worker_returns_while_reader_blocks(self) -> None:
        """Teardown must kill+reap before closing streams a reader holds."""
        import subprocess
        import sys
        import threading

        proc = subprocess.Popen(
            [sys.executable, "-c", "import time; time.sleep(10)"],
            stdout=subprocess.PIPE,
            stdin=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        reader = threading.Thread(target=proc.stdout.readline, daemon=True)
        reader.start()
        time.sleep(0.05)
        started = time.monotonic()
        closer = threading.Thread(target=lambda: MOD._close_worker(proc), daemon=True)
        closer.start()
        closer.join(1.5)
        alive = closer.is_alive()
        if proc.poll() is None:
            proc.kill()
            proc.wait()
        self.assertFalse(alive, "close_worker blocked on a held stream lock")
        self.assertLess(time.monotonic() - started, 2.0)

    def test_old_cleanup_preserves_new_worker_readiness(self) -> None:
        old_worker, old_ready = MOD._WORKER, MOD._WORKER_READY
        expired, replacement = object(), object()
        def close(proc):
            self.assertIs(proc, expired)
            MOD._WORKER = replacement
            MOD._WORKER_READY = True
        try:
            MOD._WORKER = expired
            MOD._WORKER_READY = True
            with unittest.mock.patch.object(MOD, "_close_worker", side_effect=close):
                MOD._kill_worker(expired)
            self.assertIs(MOD._WORKER, replacement)
            self.assertTrue(MOD._WORKER_READY)
        finally:
            MOD._WORKER, MOD._WORKER_READY = old_worker, old_ready

    def test_cancel_reaps_worker_and_closes_streams(self) -> None:
        import subprocess, sys
        old = MOD._WORKER
        proc = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(30)"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            MOD._WORKER = proc
            MOD._WORKER_READY = True
            MOD.cancel_tts()
            self.assertIsNotNone(proc.returncode, "Stop must reap its worker")
            self.assertTrue(all(stream.closed for stream in (proc.stdin, proc.stdout, proc.stderr)))
            self.assertIsNone(MOD._WORKER)
        finally:
            MOD._close_worker(proc)
            MOD._WORKER = old

    def test_warm_uses_canonical_request_startup(self) -> None:
        old = MOD._WORKER
        try:
            MOD._WORKER = None
            with unittest.mock.patch.object(MOD, "dry", return_value=False), unittest.mock.patch.object(MOD, "elevenlabs_key"), unittest.mock.patch.object(MOD, "_start_worker", return_value=None) as start, unittest.mock.patch.object(MOD, "_kokoro_bytes", return_value=b"") as request:
                MOD.warm()
                start.assert_not_called()
                request.assert_called_once_with("Ready.")
        finally:
            MOD._WORKER = old

    def test_dry_warm_does_not_spawn_native_worker(self) -> None:
        old = MOD._WORKER
        try:
            MOD._WORKER = None
            with unittest.mock.patch.dict(os.environ, {"AGENT_STACK_DRY_TTS": "1"}):
                with unittest.mock.patch.object(MOD, "_start_worker", return_value=None) as start:
                    MOD.warm()
                    start.assert_not_called()
        finally:
            MOD._WORKER = old

    def test_inprocess_kokoro_discards_cancelled_audio_and_recovers(self) -> None:
        old_worker = MOD._WORKER
        def generate(text):
            if text == "old":
                MOD.cancel_tts()
            return b"audio"
        try:
            MOD._WORKER = None
            with unittest.mock.patch.object(MOD, "kokoro_ready", return_value=True), unittest.mock.patch.object(MOD, "voice_python", return_value=None), unittest.mock.patch.object(MOD, "_kokoro_once", side_effect=generate):
                self.assertEqual(MOD._kokoro_bytes("old"), b"")
                self.assertEqual(MOD._kokoro_bytes("new"), b"audio")
        finally:
            MOD._WORKER = old_worker

    def test_worker_reply_after_stop_is_discarded(self) -> None:
        old_worker = MOD._WORKER
        proc = unittest.mock.Mock()
        proc.poll.return_value = None
        reads = []
        def read(*args, **kw):
            reads.append(True)
            if len(reads) == 1:
                MOD.cancel_tts()
            return '{"ok":true,"b64":"YXVkaW8="}'
        try:
            MOD._WORKER = proc
            MOD._WORKER_READY = True
            with unittest.mock.patch.object(MOD, "_start_worker", return_value=proc), unittest.mock.patch.object(MOD, "_readline_deadline", side_effect=read):
                self.assertEqual(MOD._ask_worker("old"), b"")
                self.assertFalse(MOD._WORKER_READY)
                self.assertEqual(MOD._ask_worker("new"), b"audio")
                self.assertTrue(MOD._WORKER_READY)
        finally:
            MOD._WORKER = old_worker

    def test_cancel_during_worker_start_closes_late_process(self) -> None:
        old_worker = MOD._WORKER
        proc = unittest.mock.Mock()
        proc.poll.return_value = None
        starts = []
        def start():
            starts.append(True)
            if len(starts) == 1:
                MOD.cancel_tts()
            return proc
        try:
            MOD._WORKER = None
            with unittest.mock.patch.object(MOD, "_start_worker", side_effect=start), unittest.mock.patch.object(MOD, "_close_worker") as close, unittest.mock.patch.object(MOD, "_readline_deadline", return_value='{"ok":true,"b64":"YXVkaW8="}'):
                self.assertEqual(MOD._ask_worker("old"), b"")
                proc.stdin.write.assert_not_called()
                close.assert_called_once_with(proc)
                self.assertIsNone(MOD._WORKER)
                self.assertEqual(MOD._ask_worker("new"), b"audio")
                proc.stdin.write.assert_called_once()
        finally:
            MOD._WORKER = old_worker

    def test_cancelled_primary_does_not_start_fallback(self) -> None:
        def primary(text):
            if text == "old":
                MOD.cancel_tts()
            return b""
        old_worker = MOD._WORKER
        try:
            MOD._WORKER = None
            with unittest.mock.patch.object(MOD, "dry", return_value=False), unittest.mock.patch.object(MOD, "_elevenlabs_bytes", side_effect=primary), unittest.mock.patch.object(MOD, "_kokoro_bytes", return_value=b"audio") as fallback:
                self.assertEqual(MOD.tts_audio("old"), (b"", ""))
                fallback.assert_not_called()
                self.assertEqual(MOD.tts_audio("new"), (b"audio", "audio/wav"))
                fallback.assert_called_once_with("new")
        finally:
            MOD._WORKER = old_worker

    def test_queued_request_cancelled_before_lock_never_starts(self) -> None:
        class CancelBeforeAcquire:
            first = True
            def __enter__(self):
                if self.first:
                    self.first = False
                    MOD.cancel_tts()
            def __exit__(self, *args):
                pass
        old_worker = MOD._WORKER
        try:
            MOD._WORKER = None
            with unittest.mock.patch.object(MOD, "kokoro_ready", return_value=True), unittest.mock.patch.object(MOD, "voice_python", return_value=Path("/bin/true")), unittest.mock.patch.object(MOD, "_WORKER_LOCK", CancelBeforeAcquire()), unittest.mock.patch.object(MOD, "_ask_worker", return_value=b"audio") as ask:
                self.assertEqual(MOD._kokoro_bytes("old"), b"")
                ask.assert_not_called()
                self.assertEqual(MOD._kokoro_bytes("new"), b"audio")
                ask.assert_called_once_with("new")
        finally:
            MOD._WORKER = old_worker

    def test_cancel_does_not_restart_worker_without_new_request(self) -> None:
        old = MOD._WORKER
        class FakeProc:
            def kill(self):
                pass
            def poll(self):
                return None
        class ImmediateThread:
            def __init__(self, target, **kw):
                self.target = target
            def start(self):
                self.target()
        try:
            MOD._WORKER = FakeProc()
            with unittest.mock.patch.object(MOD, "dry", return_value=False), unittest.mock.patch.object(MOD, "_start_worker", return_value=FakeProc()) as start, unittest.mock.patch.object(MOD.threading, "Thread", ImmediateThread):
                MOD.cancel_tts()
                self.assertIsNone(MOD._WORKER)
                start.assert_not_called()
        finally:
            MOD._WORKER = old

    def test_cancel_tts_kills_worker(self) -> None:
        killed = {"n": 0}

        class FakeProc:
            def kill(self):
                killed["n"] += 1

        fake = FakeProc()
        MOD._WORKER = fake
        MOD._WORKER_READY = True
        MOD.cancel_tts()
        self.assertEqual(killed["n"], 1)
        self.assertIsNone(MOD._WORKER)
        self.assertFalse(MOD._WORKER_READY)
        MOD.cancel_tts()
        self.assertEqual(killed["n"], 1)

    def test_tts_audio_bounded_kills_hung_request(self) -> None:
        os.environ.pop("AGENT_STACK_DRY_TTS", None)

        def hang(text: str):
            _ = text
            time.sleep(8)
            return b"RIFF", "audio/wav"

        old_req = MOD.TTS_REQUEST_SEC
        MOD.TTS_REQUEST_SEC = 0.2
        try:
            with unittest.mock.patch.object(MOD, "tts_audio", side_effect=hang):
                started = time.time()
                audio, mime = MOD.tts_audio_bounded("Ready, sir.")
                elapsed = time.time() - started
        finally:
            MOD.TTS_REQUEST_SEC = old_req
            os.environ["AGENT_STACK_DRY_TTS"] = "1"
        self.assertEqual(audio, b"")
        self.assertEqual(mime, "")
        self.assertLess(elapsed, 2.5)

    def test_cancel_tts_aborts_bounded_before_timeout(self) -> None:
        os.environ.pop("AGENT_STACK_DRY_TTS", None)
        started = {"go": False}

        def hang(text: str, **kw):
            _ = (text, kw)
            started["go"] = True
            time.sleep(8)
            return b"RIFF", "audio/wav"

        old_req = MOD.TTS_REQUEST_SEC
        MOD.TTS_REQUEST_SEC = 12
        box: dict = {}

        def run() -> None:
            box["out"] = MOD.tts_audio_bounded("Ready, sir.")
            box["elapsed"] = time.time() - box["t0"]

        try:
            with unittest.mock.patch.object(MOD, "tts_audio", side_effect=hang):
                box["t0"] = time.time()
                worker = __import__("threading").Thread(target=run)
                worker.start()
                deadline = time.time() + 2
                while not started["go"] and time.time() < deadline:
                    time.sleep(0.05)
                MOD.cancel_tts()
                worker.join(3)
        finally:
            MOD.TTS_REQUEST_SEC = old_req
            os.environ["AGENT_STACK_DRY_TTS"] = "1"
        self.assertFalse(worker.is_alive())
        self.assertEqual(box.get("out"), (b"", ""))
        self.assertLess(box.get("elapsed") or 99, 2.5)

    def test_wav_duration_reads_header(self) -> None:
        import wave

        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(24000)
            wf.writeframes(b"\x00\x00" * 12000)
        audio = buf.getvalue()
        self.assertAlmostEqual(MOD.wav_duration_sec(audio), 0.5, places=3)
        self.assertEqual(MOD.wav_duration_sec(b""), 0.0)
        self.assertEqual(MOD.wav_duration_sec(b"ID3fake"), 0.0)

    def test_kokoro_session_is_reused(self) -> None:
        import sys
        import types

        calls = {"n": 0}

        class Fake:
            def __init__(self, *args, **kwargs):
                calls["n"] += 1

            def create(self, *args, **kwargs):
                return [0.1, -0.1], 24000

        fake = types.SimpleNamespace(Kokoro=Fake)
        old_engine = MOD._ENGINE
        old_uses = MOD._ENGINE_USES
        try:
            MOD._ENGINE = None
            MOD._ENGINE_USES = 0
            with unittest.mock.patch.dict(sys.modules, {"kokoro_onnx": fake}):
                with unittest.mock.patch.object(MOD, "_wav_bytes", return_value=b"RIFFWAV"):
                    first = MOD._kokoro_once("one")
                    second = MOD._kokoro_once("two")
            self.assertEqual(calls["n"], 1)
            self.assertEqual(MOD._ENGINE_USES, 2)
            self.assertTrue(first and second)
        finally:
            MOD._ENGINE = old_engine
            MOD._ENGINE_USES = old_uses


if __name__ == "__main__":
    unittest.main()
