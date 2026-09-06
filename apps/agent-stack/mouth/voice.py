#!/usr/bin/env python3
"""Repo voice for the local face.

Jared's backtalk default is Kokoro `bm_lewis` (British butler).
The video voice is ElevenLabs Voice Library "Tarquin".
Neither is a macOS `say` remap. Samantha and Daniel are not the product.
speechSynthesis in the pane is last-resort only when this module returns no audio.
"""
from __future__ import annotations

import base64
import json
import os
import subprocess
import sys
import threading
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
STACK = HERE.parent
CACHE = Path(os.environ.get("AGENT_STACK_KOKORO_DIR") or (STACK / ".kokoro"))
VENV_PY = Path(os.environ.get("AGENT_STACK_VOICE_PYTHON") or (STACK / ".venv-voice" / "bin" / "python"))
KOKORO_MODEL = CACHE / "kokoro-v1.0.int8.onnx"
KOKORO_VOICES = CACHE / "voices-v1.0.bin"
KOKORO_VOICE = "bm_lewis"
TARQUIN_VOICE_ID = "7cOBG34AiHrAzs842Rdi"
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx"
VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"
TEXT_CAP = 400

_WORKER = None
_WORKER_LOCK = threading.Lock()


def dry() -> bool:
    return os.environ.get("AGENT_STACK_DRY_TTS") == "1"


def elevenlabs_key() -> str:
    key = (os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("ELEVEN_LABS_API_KEY") or "").strip()
    if key:
        return key
    try:
        out = subprocess.run(
            [
                "security",
                "find-generic-password",
                "-a",
                os.environ.get("USER") or "",
                "-s",
                "backtalk-elevenlabs",
                "-w",
            ],
            capture_output=True,
            text=True,
            timeout=3,
        )
        if out.returncode == 0:
            return (out.stdout or "").strip()
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return ""


def elevenlabs_voice_id() -> str:
    return (os.environ.get("ELEVENLABS_VOICE_ID") or "").strip() or TARQUIN_VOICE_ID


def kokoro_ready() -> bool:
    return KOKORO_MODEL.is_file() and KOKORO_MODEL.stat().st_size > 1_000_000 and KOKORO_VOICES.is_file()


def voice_python() -> Path | None:
    if VENV_PY.is_file() and os.access(VENV_PY, os.X_OK):
        return VENV_PY
    return None


def voice_report() -> dict:
    key_on = bool(elevenlabs_key())
    if key_on:
        engine, voice = "elevenlabs", "Tarquin"
    elif kokoro_ready() and voice_python() is not None:
        engine, voice = "kokoro", KOKORO_VOICE
    elif kokoro_ready():
        engine, voice = "kokoro-dark-python", KOKORO_VOICE
    else:
        engine, voice = "dark", KOKORO_VOICE
    return {
        "ok": True,
        "engine": engine,
        "voice": voice,
        "voice_id": elevenlabs_voice_id() if key_on else None,
        "lang": "en-GB",
        "repo": {"kokoro": KOKORO_VOICE, "elevenlabs": "Tarquin"},
        "fallback": "speechSynthesis last-resort, never the product",
    }


def _fetch(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": "agent-stack-voice"})
    with urllib.request.urlopen(req, timeout=120) as res, tmp.open("wb") as fh:
        while True:
            chunk = res.read(1024 * 256)
            if not chunk:
                break
            fh.write(chunk)
    tmp.replace(dest)


def ensure_models() -> dict:
    if dry():
        return {"ok": False, "error": "dry"}
    CACHE.mkdir(parents=True, exist_ok=True)
    if not KOKORO_MODEL.is_file():
        _fetch(MODEL_URL, KOKORO_MODEL)
    if not KOKORO_VOICES.is_file():
        _fetch(VOICES_URL, KOKORO_VOICES)
    return {"ok": kokoro_ready(), "model": str(KOKORO_MODEL), "voices": str(KOKORO_VOICES)}


def _elevenlabs_bytes(text: str) -> bytes:
    key = elevenlabs_key()
    if not key:
        return b""
    payload = json.dumps({"text": text[:TEXT_CAP], "model_id": "eleven_multilingual_v2"}).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{elevenlabs_voice_id()}",
        data=payload,
        headers={
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return res.read() or b""
    except (urllib.error.URLError, TimeoutError, OSError):
        return b""


def _wav_bytes(samples, sample_rate: int) -> bytes:
    import io
    import wave

    import numpy as np

    arr = np.asarray(samples)
    if arr.dtype != np.int16:
        arr = (np.clip(arr, -1.0, 1.0) * 32767.0).astype(np.int16)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(int(sample_rate))
        wf.writeframes(arr.tobytes())
    return buf.getvalue()


def _kokoro_once(text: str) -> bytes:
    from kokoro_onnx import Kokoro

    engine = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
    samples, rate = engine.create(text[:TEXT_CAP], voice=KOKORO_VOICE, speed=1.0, lang="en-gb")
    return _wav_bytes(samples, rate)


def worker_loop() -> None:
    engine = None
    for raw in sys.stdin:
        line = raw.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError:
            print(json.dumps({"ok": False, "error": "bad json"}), flush=True)
            continue
        text = str(req.get("text") or "").strip()
        if not text:
            print(json.dumps({"ok": False, "error": "empty"}), flush=True)
            continue
        try:
            if engine is None:
                from kokoro_onnx import Kokoro

                engine = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
            samples, rate = engine.create(text[:TEXT_CAP], voice=KOKORO_VOICE, speed=1.0, lang="en-gb")
            audio = _wav_bytes(samples, rate)
            print(json.dumps({"ok": True, "mime": "audio/wav", "b64": base64.b64encode(audio).decode("ascii")}), flush=True)
        except Exception as exc:  # noqa: BLE001 — worker must stay up
            print(json.dumps({"ok": False, "error": str(exc)[:200]}), flush=True)


def warm() -> None:
    """Boot the Kokoro worker so the first spoken line is not a cold load."""
    if dry():
        return

    def _boot() -> None:
        global _WORKER
        with _WORKER_LOCK:
            if _WORKER is None or _WORKER.poll() is not None:
                _WORKER = _start_worker()
        _kokoro_bytes("Ready.")

    threading.Thread(target=_boot, daemon=True).start()


def _start_worker() -> subprocess.Popen | None:
    py = voice_python()
    if py is None or not kokoro_ready():
        return None
    return subprocess.Popen(
        [str(py), str(HERE / "voice.py"), "--worker"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=str(STACK),
    )


def _ask_worker(text: str) -> bytes:
    """One Kokoro request. Reset the worker on a dead pipe so the next turn talks."""
    global _WORKER
    if _WORKER is None or _WORKER.poll() is not None:
        _WORKER = _start_worker()
    proc = _WORKER
    if proc is None or proc.stdin is None or proc.stdout is None:
        return b""
    try:
        proc.stdin.write(json.dumps({"text": text[:TEXT_CAP]}) + "\n")
        proc.stdin.flush()
        line = proc.stdout.readline()
    except (OSError, BrokenPipeError, ConnectionResetError):
        _WORKER = None
        return b""
    if not line:
        _WORKER = None
        return b""
    try:
        payload = json.loads(line)
    except json.JSONDecodeError:
        return b""
    if not payload.get("ok"):
        return b""
    try:
        return base64.b64decode(payload.get("b64") or "")
    except (ValueError, TypeError):
        return b""


def _kokoro_bytes(text: str) -> bytes:
    global _WORKER
    if not kokoro_ready():
        return b""
    py = voice_python()
    if py is None:
        try:
            return _kokoro_once(text)
        except Exception:
            return b""
    with _WORKER_LOCK:
        audio = _ask_worker(text)
        if audio:
            return audio
        # ChatGPT: one request died (connection reset) and the next turn stayed mute.
        audio = _ask_worker(text)
        return audio


def tts_audio(text: str) -> tuple[bytes, str]:
    if dry() or not (text or "").strip():
        return b"", ""
    mp3 = _elevenlabs_bytes(text)
    if mp3:
        return mp3, "audio/mpeg"
    wav = _kokoro_bytes(text)
    if wav:
        return wav, "audio/wav"
    return b"", ""


def tts_bytes(text: str) -> bytes:
    audio, _mime = tts_audio(text)
    return audio


def speak_local(text: str) -> None:
    if dry() or not text:
        return
    audio, mime = tts_audio(text)
    if not audio:
        return
    suffix = ".mp3" if mime == "audio/mpeg" else ".wav"
    path = ""
    try:
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as fh:
            fh.write(audio)
            path = fh.name
        subprocess.run(["afplay", path], check=False, timeout=30)
    except (OSError, subprocess.TimeoutExpired):
        return
    finally:
        if path:
            try:
                os.unlink(path)
            except OSError:
                pass


def self_test() -> dict:
    os.environ["AGENT_STACK_DRY_TTS"] = "1"
    report = voice_report()
    if report.get("voice") in {"Samantha", "Daniel"}:
        return {"ok": False, "errors": ["product voice must not be a macOS remap"], "report": report}
    if report.get("repo", {}).get("kokoro") != KOKORO_VOICE:
        return {"ok": False, "errors": ["repo voice must stay bm_lewis"], "report": report}
    if report.get("lang") != "en-GB":
        return {"ok": False, "errors": ["repo voice is British"], "report": report}
    audio, mime = tts_audio("Hello Evens")
    if audio or mime:
        return {"ok": False, "errors": ["dry TTS must not synthesize"], "mime": mime}
    src = Path(__file__).read_text(encoding="utf-8")
    banned = ('["' + "say" + '", "-v"', "say -v " + "Samantha", "say -v " + "Daniel")
    if any(token in src for token in banned):
        return {"ok": False, "errors": ["voice.py must not call macOS say"]}
    return {"ok": True, "errors": [], "report": report}


def main() -> int:
    if "--worker" in sys.argv:
        worker_loop()
        return 0
    if "--ensure" in sys.argv:
        print(json.dumps(ensure_models(), indent=2))
        return 0
    if "--self-test" in sys.argv or os.environ.get("AGENT_STACK_VOICE_SELF_TEST") == "1":
        out = self_test()
        print(json.dumps(out, indent=2))
        return 0 if out.get("ok") else 2
    if "--report" in sys.argv:
        print(json.dumps(voice_report(), indent=2))
        return 0
    text = " ".join(a for a in sys.argv[1:] if not a.startswith("--")).strip()
    if not text:
        print(json.dumps({"ok": False, "error": "text required"}))
        return 2
    audio, mime = tts_audio(text)
    print(json.dumps({"ok": bool(audio), "mime": mime, "bytes": len(audio), **voice_report()}, indent=2))
    return 0 if audio else 2


if __name__ == "__main__":
    raise SystemExit(main())
