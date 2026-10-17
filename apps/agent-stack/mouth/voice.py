#!/usr/bin/env python3
"""Repo voice for the local face.

Kokoro `bm_lewis` is fallback only. Product TTS is ElevenLabs v3 (`eleven_v3`).
Voice Design v3 (`eleven_ttv_v3`) creates one character voice from a prompt.
Tarquin stays the library fallback id until a designed voice is persisted.
Neither is a macOS `say` remap. Samantha and Daniel are not the product.
speechSynthesis in the pane is last-resort only when this module returns no audio.
Design spends ElevenLabs credits — never on import, warm, or face boot.
"""
from __future__ import annotations

import base64
import importlib.util
import json
import re
import os
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
STACK = HERE.parent
ROOT = STACK.parents[1]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
BUS_PATH = HIVE / "bus" / "state.json"
VOICE_LOCAL = HIVE / "bus" / "voice-local.json"
SHARED_VOICE = Path.home() / ".jarvis-voice"  # one Kokoro install shared by every checkout of the Face


def _voice_path(env: str, intree: Path, shared: Path) -> Path:
    """Env wins; then the in-tree cache; then the shared ~/.jarvis-voice install."""
    if os.environ.get(env):
        return Path(os.environ[env])
    if intree.exists() and not os.environ.get("JARVIS_VOICE_NO_INTREE"):
        return intree
    return shared if shared.exists() else intree


CACHE = _voice_path("AGENT_STACK_KOKORO_DIR", STACK / ".kokoro", SHARED_VOICE / "kokoro")
VENV_PY = _voice_path("AGENT_STACK_VOICE_PYTHON", STACK / ".venv-voice" / "bin" / "python", SHARED_VOICE / "venv" / "bin" / "python")
KOKORO_MODEL = CACHE / "kokoro-v1.0.int8.onnx"
KOKORO_VOICES = CACHE / "voices-v1.0.bin"
KOKORO_VOICE = "bm_lewis"
VOICE_FILE = Path.home() / ".config/brain/voice.txt"  # Evens 10-17 "change Jarvis's voice for free": one line, e.g. bm_george


def _personality_voice() -> str:
    """The active personality's `voice:` line (hands/operator.py personality files); "" when none."""
    try:
        name = (Path.home() / ".config/brain/personality.txt").read_text().strip()
        folder = Path(os.environ.get("JARVIS_PERSONALITIES") or Path.home() / "ArtCraft Studio/00 Private/Context References/Personalities")
        m = re.search(r"(?m)^voice:\s*([abmf][fm]_[a-z]+)", (folder / f"{name}.md").read_text())
        return m.group(1) if m else ""
    except OSError:
        return ""


def kokoro_voice() -> str:
    """The Kokoro voice to speak with: env, then ~/.config/brain/voice.txt, then the default. No code change to switch."""
    for cand in (os.environ.get("AGENT_STACK_KOKORO_VOICE"), VOICE_FILE.read_text().strip() if VOICE_FILE.is_file() else "",
                 _personality_voice()):
        if cand and re.fullmatch(r"[abmf][fm]_[a-z]+", cand.strip()):
            return cand.strip()
    return KOKORO_VOICE
TARQUIN_VOICE_ID = "7cOBG34AiHrAzs842Rdi"
ELEVEN_V3 = "eleven_v3"
ELEVEN_TTV_V3 = "eleven_ttv_v3"
DEFAULT_VOICE_NAME = "Jarvis"
DEFAULT_DESIGN_PROMPT = (
    "A British butler coordinator: calm, precise, dry wit, adult male, "
    "Received Pronunciation, Jarvis house steward. Not theatrical. Not American."
)
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx"
VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"
TEXT_CAP = 400
WORKER_ASK_SEC = 12
WORKER_BOOT_SEC = 20
TTS_REQUEST_SEC = 22

_WORKER = None
_WORKER_LOCK = threading.Lock()
_WORKER_READY = False
_ELEVEN_KEY = None
_ELEVEN_LOOKED = False
_TTS_TOKEN = 0
_ENGINE = None
_ENGINE_USES = 0


def dry() -> bool:
    return os.environ.get("AGENT_STACK_DRY_TTS") == "1"


def elevenlabs_key() -> str:
    global _ELEVEN_KEY, _ELEVEN_LOOKED
    key = (os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("ELEVEN_LABS_API_KEY") or "").strip()
    if key:
        return key
    if _ELEVEN_LOOKED:
        return _ELEVEN_KEY or ""
    _ELEVEN_LOOKED = True
    found = ""
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
            found = (out.stdout or "").strip()
    except (OSError, subprocess.TimeoutExpired):
        found = ""
    _ELEVEN_KEY = found
    return found


def _load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def _write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(data, indent=2) + "\n"
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(payload)
        os.replace(tmp_name, path)
    except Exception:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise


def _stored_voice() -> dict:
    local = _load_json(VOICE_LOCAL)
    bus = _load_json(BUS_PATH)
    voice_id = (
        (os.environ.get("ELEVENLABS_VOICE_ID") or "").strip()
        or str(local.get("elevenlabs_voice_id") or "").strip()
        or str(bus.get("elevenlabs_voice_id") or "").strip()
    )
    name = (
        str(local.get("elevenlabs_voice_name") or "").strip()
        or str(bus.get("elevenlabs_voice_name") or "").strip()
        or (DEFAULT_VOICE_NAME if voice_id and voice_id != TARQUIN_VOICE_ID else "Tarquin")
    )
    return {"voice_id": voice_id, "name": name}


def persist_voice_id(voice_id: str, name: str) -> None:
    """Store designed voice_id on the hive bus + local sidecar. Not git."""
    vid = (voice_id or "").strip()
    label = (name or "").strip() or DEFAULT_VOICE_NAME
    if not vid:
        return
    os.environ["ELEVENLABS_VOICE_ID"] = vid
    row = {"elevenlabs_voice_id": vid, "elevenlabs_voice_name": label, "model": ELEVEN_V3}
    _write_json(VOICE_LOCAL, row)
    bus_io = None
    try:
        path = STACK / "memory" / "bus_io.py"
        spec = importlib.util.spec_from_file_location("agent_stack_bus_io_voice", path)
        if spec is not None and spec.loader is not None:
            bus_io = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(bus_io)
    except Exception:
        bus_io = None
    if bus_io is not None and hasattr(bus_io, "mutate_bus"):
        def apply(bus: dict) -> dict:
            bus.update(row)
            return bus

        bus_io.mutate_bus(HIVE, apply)
        return
    bus = _load_json(BUS_PATH)
    bus.update(row)
    _write_json(BUS_PATH, bus)


def elevenlabs_voice_id() -> str:
    return _stored_voice()["voice_id"] or TARQUIN_VOICE_ID


def elevenlabs_voice_name() -> str:
    return _stored_voice()["name"] or "Tarquin"


def kokoro_ready() -> bool:
    return KOKORO_MODEL.is_file() and KOKORO_MODEL.stat().st_size > 1_000_000 and KOKORO_VOICES.is_file()


def voice_python() -> Path | None:
    if VENV_PY.is_file() and os.access(VENV_PY, os.X_OK):
        return VENV_PY
    return None


def voice_report() -> dict:
    key_on = bool(elevenlabs_key())
    stored = _stored_voice()
    vid_on = bool(stored.get("voice_id"))
    if key_on:
        engine, voice = "elevenlabs", elevenlabs_voice_name()
        speak_voice_id = elevenlabs_voice_id()
        speak_model = ELEVEN_V3
    elif kokoro_ready() and voice_python() is not None:
        engine, voice = "kokoro", kokoro_voice()
        speak_voice_id = kokoro_voice()
        speak_model = "kokoro"
    elif kokoro_ready():
        engine, voice = "kokoro-dark-python", kokoro_voice()
        speak_voice_id = kokoro_voice()
        speak_model = "kokoro"
    else:
        engine, voice = "dark", kokoro_voice()
        speak_voice_id = kokoro_voice()
        speak_model = "dark"
    if key_on:
        fallback_reason = ""
    else:
        fallback_reason = "no ElevenLabs key · kokoro default"
    return {
        "ok": True,
        "engine": engine,
        "speak_engine": engine,
        "speak_voice_id": speak_voice_id,
        "speak_model": speak_model,
        "model": ELEVEN_V3,
        "design_model": ELEVEN_TTV_V3,
        "voice": voice,
        "key_present": key_on,
        "voice_id_present": bool(key_on and (vid_on or TARQUIN_VOICE_ID)),
        "lang": "en-GB",
        "repo": {"kokoro": kokoro_voice(), "elevenlabs": ELEVEN_V3, "design": ELEVEN_TTV_V3},
        "fallback": "speechSynthesis last-resort, never the product",
        "fallback_reason": fallback_reason,
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


def _eleven_request(url: str, payload: dict, key: str, accept: str, timeout: int) -> tuple[bytes, int]:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": accept,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.read() or b"", int(res.status)
    except urllib.error.HTTPError as exc:
        return b"", int(exc.code)
    except (urllib.error.URLError, TimeoutError, OSError):
        return b"", 0


def _elevenlabs_bytes(text: str) -> bytes:
    key = elevenlabs_key()
    if not key:
        return b""
    raw, status = _eleven_request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{elevenlabs_voice_id()}",
        {"text": text[:TEXT_CAP], "model_id": ELEVEN_V3},
        key,
        "audio/mpeg",
        20,
    )
    if status != 200:
        return b""
    return raw


def design_voice(prompt: str = "") -> dict:
    """Voice Design v3. Spends credits. Call only from an Evens click/submit."""
    if dry():
        return {"ok": False, "error": "dry", "spent": False, "model": ELEVEN_V3, "design_model": ELEVEN_TTV_V3}
    key = elevenlabs_key()
    if not key:
        return {"ok": False, "error": "elevenlabs key absent", "spent": False, "model": ELEVEN_V3, "design_model": ELEVEN_TTV_V3}
    description = (prompt or "").strip() or DEFAULT_DESIGN_PROMPT
    if len(description) < 20:
        description = DEFAULT_DESIGN_PROMPT
    raw, status = _eleven_request(
        "https://api.elevenlabs.io/v1/text-to-voice/design",
        {
            "voice_description": description[:1000],
            "model_id": ELEVEN_TTV_V3,
            "auto_generate_text": True,
        },
        key,
        "application/json",
        90,
    )
    if status != 200:
        return {"ok": False, "error": f"design http {status}", "spent": True, "model": ELEVEN_V3, "design_model": ELEVEN_TTV_V3}
    try:
        preview = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return {"ok": False, "error": "design bad json", "spent": True, "model": ELEVEN_V3, "design_model": ELEVEN_TTV_V3}
    previews = preview.get("previews") if isinstance(preview, dict) else None
    first = previews[0] if isinstance(previews, list) and previews and isinstance(previews[0], dict) else {}
    generated = str(first.get("generated_voice_id") or "").strip()
    if not generated:
        return {"ok": False, "error": "design missing generated_voice_id", "spent": True, "model": ELEVEN_V3, "design_model": ELEVEN_TTV_V3}
    created_raw, created_status = _eleven_request(
        "https://api.elevenlabs.io/v1/text-to-voice",
        {
            "voice_name": DEFAULT_VOICE_NAME,
            "voice_description": description[:1000],
            "generated_voice_id": generated,
        },
        key,
        "application/json",
        30,
    )
    if created_status != 200:
        return {"ok": False, "error": f"create http {created_status}", "spent": True, "model": ELEVEN_V3, "design_model": ELEVEN_TTV_V3}
    try:
        created = json.loads(created_raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        created = {}
    voice_id = str((created or {}).get("voice_id") or "").strip()
    if not voice_id:
        return {"ok": False, "error": "create missing voice_id", "spent": True, "model": ELEVEN_V3, "design_model": ELEVEN_TTV_V3}
    persist_voice_id(voice_id, DEFAULT_VOICE_NAME)
    return {
        "ok": True,
        "spent": True,
        "voice": DEFAULT_VOICE_NAME,
        "voice_id_present": True,
        "key_present": True,
        "model": ELEVEN_V3,
        "design_model": ELEVEN_TTV_V3,
        **voice_report(),
    }


def wav_duration_sec(audio: bytes) -> float:
    """PCM WAV duration from the header. Empty or non-WAV is 0."""
    import io
    import wave

    if not audio or len(audio) < 44 or audio[:4] != b"RIFF":
        return 0.0
    try:
        with wave.open(io.BytesIO(audio), "rb") as wf:
            rate = float(wf.getframerate() or 0)
            if not rate:
                return 0.0
            return wf.getnframes() / rate
    except (wave.Error, EOFError, OSError):
        return 0.0


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


def _kokoro_engine():
    """One in-process session. Reloading ONNX every line is the 11–26s hitch."""
    global _ENGINE, _ENGINE_USES
    if _ENGINE is None:
        from kokoro_onnx import Kokoro

        _ENGINE = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
    _ENGINE_USES += 1
    return _ENGINE


def _kokoro_once(text: str) -> bytes:
    engine = _kokoro_engine()
    samples, rate = engine.create(text[:TEXT_CAP], voice=kokoro_voice(), speed=1.0, lang="en-gb")
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
            samples, rate = engine.create(text[:TEXT_CAP], voice=kokoro_voice(), speed=1.0, lang="en-gb")
            audio = _wav_bytes(samples, rate)
            print(json.dumps({"ok": True, "mime": "audio/wav", "b64": base64.b64encode(audio).decode("ascii")}), flush=True)
        except Exception as exc:  # noqa: BLE001 — worker must stay up
            print(json.dumps({"ok": False, "error": str(exc)[:200]}), flush=True)


def warm() -> None:
    """Load Kokoro before the first spoken line. A background boot left the first TTS cold."""
    elevenlabs_key()
    if dry():
        return
    _kokoro_bytes("Ready.")


def _drain_stderr(proc: subprocess.Popen) -> None:
    err = proc.stderr
    if err is None:
        return
    try:
        while True:
            line = err.readline()
            if not line:
                break
    except (OSError, ValueError):
        return


def _close_worker(proc: subprocess.Popen | None) -> None:
    """Kill and reap FIRST. Closing a stream a blocked reader holds deadlocks on
    the TextIO lock until the child dies — so the child dies before any close."""
    if proc is None:
        return
    try:
        proc.kill()
    except OSError:
        pass
    try:
        proc.wait(timeout=2)
    except Exception:
        pass
    for stream in (getattr(proc, "stdin", None), getattr(proc, "stdout", None), getattr(proc, "stderr", None)):
        if stream is None:
            continue
        try:
            stream.close()
        except (OSError, ValueError):
            pass


def _kill_worker(proc: subprocess.Popen | None) -> None:
    global _WORKER, _WORKER_READY
    _close_worker(proc)
    if _WORKER is proc:
        _WORKER = None
        _WORKER_READY = False


def cancel_tts() -> None:
    """Spoken stop. Kill in-flight Kokoro so the next line is not the old one."""
    global _WORKER, _WORKER_READY, _TTS_TOKEN
    _TTS_TOKEN += 1
    proc = _WORKER
    if proc is None:
        _WORKER_READY = False
        return
    # Detach first so cleanup cannot clear a newer request's worker identity.
    _WORKER = None
    _WORKER_READY = False
    _close_worker(proc)
    # The next explicit request starts its worker through _ask_worker.


def _readline_deadline(stream, timeout: float, token: int | None = None) -> str | None:
    """Bounded stdout read. None means the worker did not finish a line in time."""
    box: dict = {"line": None, "err": None}

    def read() -> None:
        try:
            box["line"] = stream.readline()
        except Exception as exc:  # noqa: BLE001 — surface to the waiter
            box["err"] = exc

    waiter = threading.Thread(target=read, daemon=True)
    waiter.start()
    deadline = time.monotonic() + float(timeout)
    while waiter.is_alive() and time.monotonic() < deadline:
        waiter.join(0.2)
        if token is not None and token != _TTS_TOKEN:
            return None
    if waiter.is_alive():
        return None
    if box["err"] is not None:
        raise box["err"]
    line = box.get("line")
    return "" if line is None else line


def _start_worker() -> subprocess.Popen | None:
    global _WORKER_READY
    py = voice_python()
    if py is None or not kokoro_ready():
        return None
    proc = subprocess.Popen(
        [str(py), str(HERE / "voice.py"), "--worker"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        cwd=str(STACK),
    )
    threading.Thread(target=_drain_stderr, args=(proc,), daemon=True).start()
    _WORKER_READY = False
    return proc


def _ask_worker(text: str, timeout: float | None = None) -> bytes:
    """One Kokoro request. Bound the read. Kill a stuck worker so the next turn talks."""
    global _WORKER, _WORKER_READY
    token = _TTS_TOKEN
    if _WORKER is None or _WORKER.poll() is not None:
        started = _start_worker()
        if token != _TTS_TOKEN:
            _close_worker(started)
            return b""
        _WORKER = started
        _WORKER_READY = False
    proc = _WORKER
    if token != _TTS_TOKEN:
        return b""
    if proc is None or proc.stdin is None or proc.stdout is None:
        return b""
    limit = WORKER_BOOT_SEC if not _WORKER_READY else WORKER_ASK_SEC
    if timeout is not None:
        limit = timeout
    try:
        proc.stdin.write(json.dumps({"text": text[:TEXT_CAP]}) + "\n")
        proc.stdin.flush()
        line = _readline_deadline(proc.stdout, limit, token=token)
    except (OSError, BrokenPipeError, ConnectionResetError):
        _kill_worker(proc)
        return b""
    if token != _TTS_TOKEN:
        return b""
    if line is None:
        _kill_worker(proc)
        return b""
    if not line:
        _kill_worker(proc)
        return b""
    try:
        payload = json.loads(line)
    except json.JSONDecodeError:
        _kill_worker(proc)
        return b""
    if not payload.get("ok"):
        return b""
    try:
        audio = base64.b64decode(payload.get("b64") or "")
    except (ValueError, TypeError):
        return b""
    if audio:
        _WORKER_READY = True
    return audio


def _kokoro_bytes(text: str) -> bytes:
    start = _TTS_TOKEN
    if not kokoro_ready():
        return b""
    py = voice_python()
    if start != _TTS_TOKEN:
        return b""
    if py is None:
        try:
            audio = _kokoro_once(text)
        except Exception:
            return b""
        return audio if start == _TTS_TOKEN else b""
    with _WORKER_LOCK:
        if start != _TTS_TOKEN:
            return b""
        audio = _ask_worker(text)
        if audio:
            return audio
        if start != _TTS_TOKEN:
            return b""
        audio = _ask_worker(text)
        return audio


def _tts_stale(gen: int | None, hive: Path | None, token: int) -> bool:
    if token != _TTS_TOKEN:
        return True
    if hive is not None:
        if gen is None:
            return True
        path = STACK / "memory" / "bus_io.py"
        spec = importlib.util.spec_from_file_location("agent_stack_bus_io_tts", path)
        if spec is None or spec.loader is None:
            return True
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        if hasattr(mod, "act_if_current"):
            return mod.act_if_current(hive, gen, lambda bus: bus) is None
    return False


_MD_LINK = re.compile(r"\[([^\]]{1,200})\]\((?:https?://|/)[^)\s]{1,500}\)")
_URL = re.compile(r"https?://[^\s)>\]]+")
_SHOUT = re.compile(r"\b[A-Z][A-Z'-]{4,}\b")


def speakable(text: str) -> str:
    """Owner canvas Z61 (TTS cleanup): what the voice reads aloud, not what the card shows. Markdown marks, headings,
    bullets and raw URLs are not spoken; shouted ALL-CAPS words (5+ letters) are read as words; short acronyms stay."""
    t = str(text or "")
    t = _MD_LINK.sub(r"\1", t)
    t = _URL.sub("the link", t)
    t = re.sub(r"`{1,3}([^`]*)`{1,3}", r"\1", t)
    t = re.sub(r"(\*\*|__|~~)(.+?)\1", r"\2", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])", r"\1", t)
    t = re.sub(r"(?m)^\s{0,3}#{1,6}\s+", "", t)
    t = re.sub(r"(?m)^\s*(?:[-*\u2022]|\d+[.)])\s+", "", t)
    t = re.sub(r"(?m)^\s*\|.*\|\s*$", "", t)  # table rows are for the card
    t = _SHOUT.sub(lambda m: m.group(0).lower(), t)
    return re.sub(r"[ \t]+", " ", re.sub(r"\n{2,}", "\n", t)).strip()


def tts_audio(text: str, *, gen: int | None = None, hive: Path | None = None) -> tuple[bytes, str]:
    start = _TTS_TOKEN
    text = speakable(text)
    if dry() or not (text or "").strip():
        return b"", ""
    if _tts_stale(gen, hive, start):
        return b"", ""
    mp3 = _elevenlabs_bytes(text)
    if _tts_stale(gen, hive, start):
        return b"", ""
    if mp3:
        return mp3, "audio/mpeg"
    wav = _kokoro_bytes(text)
    if wav:
        if _tts_stale(gen, hive, start):
            return b"", ""
        return wav, "audio/wav"
    return b"", ""


def tts_audio_bounded(
    text: str,
    timeout: float | None = None,
    *,
    gen: int | None = None,
    hive: Path | None = None,
) -> tuple[bytes, str]:
    """Whole request cap. A hung worker cannot keep /api/tts open."""
    start = _TTS_TOKEN
    limit = TTS_REQUEST_SEC if timeout is None else float(timeout)
    box: dict = {}

    def run() -> None:
        try:
            box["out"] = tts_audio(text, gen=gen, hive=hive)
        except Exception:
            box["out"] = (b"", "")

    waiter = threading.Thread(target=run, daemon=True)
    waiter.start()
    deadline = time.monotonic() + limit
    while waiter.is_alive() and time.monotonic() < deadline:
        waiter.join(0.2)
        if _tts_stale(gen, hive, start):
            cancel_tts()
            return b"", ""
    if waiter.is_alive():
        cancel_tts()
        with _WORKER_LOCK:
            _kill_worker(_WORKER)
        return b"", ""
    if _tts_stale(gen, hive, start):
        return b"", ""
    return box.get("out") or (b"", "")


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
    if report.get("repo", {}).get("kokoro") != kokoro_voice():
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
    if 'model_id": ELEVEN_V3' not in src and "model_id\": \"eleven_v3\"" not in src:
        if ELEVEN_V3 not in src:
            return {"ok": False, "errors": ["TTS must use official eleven_v3"]}
    if report.get("model") != ELEVEN_V3 or report.get("design_model") != ELEVEN_TTV_V3:
        return {"ok": False, "errors": ["report must name official v3 slugs"], "report": report}
    designed = design_voice("British butler coordinator for Jarvis.")
    if designed.get("ok") or designed.get("spent"):
        return {"ok": False, "errors": ["dry design must not spend"], "designed": designed}
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
