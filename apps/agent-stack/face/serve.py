#!/usr/bin/env python3
"""Face sitting: localhost pane that reads the file bus.

Bind 127.0.0.1 only. Not evenslouis.ca. Not a second hive.
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
OS_DIR = ROOT / "docs/hive/outer-heaven/CONTENT/os"
HOST = "127.0.0.1"
PORT = int(os.environ.get("AGENT_STACK_FACE_PORT") or "4018")


def _load_mouth():
    path = HERE.parent / "mouth" / "turn.py"
    spec = importlib.util.spec_from_file_location("agent_stack_mouth", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_MOUTH = None
_MOUTH_MTIME = None


def _mouth_stamp() -> tuple:
    """turn.py plus the thinker it imports. Pipeline-only edits used to stay stale."""
    stack = HERE.parent
    paths = (
        stack / "mouth" / "turn.py",
        stack / "brain" / "pipeline.py",
        stack / "mouth" / "persona.py",
        stack / "hands" / "pro.py",
        stack / "hands" / "school_index.py",
        stack / "memory" / "retrieve.py",
        stack / "memory" / "store.py",
    )
    return tuple(p.stat().st_mtime for p in paths)


def mouth():
    """Reload the door when turn/pipeline/persona change. Stale 4018 was the ASK bug."""
    global _MOUTH, _MOUTH_MTIME
    stamp = _mouth_stamp()
    if _MOUTH is None or _MOUTH_MTIME != stamp:
        _MOUTH = _load_mouth()
        _MOUTH_MTIME = stamp
    return _MOUTH


MOUTH = mouth()


def _load_online():
    path = HERE.parent / "brain" / "online.py"
    spec = importlib.util.spec_from_file_location("agent_stack_online", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ONLINE = _load_online()


def _load_voice():
    path = HERE.parent / "mouth" / "voice.py"
    spec = importlib.util.spec_from_file_location("agent_stack_voice", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_VOICE = None
_VOICE_MTIME = None


def voice():
    """Reload voice.py when the file on disk changes."""
    global _VOICE, _VOICE_MTIME
    path = HERE.parent / "mouth" / "voice.py"
    mtime = path.stat().st_mtime
    if _VOICE is None or _VOICE_MTIME != mtime:
        _VOICE = _load_voice()
        _VOICE_MTIME = mtime
    return _VOICE


VOICE = voice()


def load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def observe_jobs() -> list[dict]:
    rows: list[dict] = []
    os_jobs = load_json(OS_DIR / "jobs.json")
    for job in os_jobs.get("jobs") or []:
        if isinstance(job, dict):
            rows.append(
                {
                    "id": job.get("name") or "job",
                    "status": job.get("state") or "done",
                    "note": job.get("last_line") or "",
                }
            )
    state = load_json(HIVE / "state.json")
    for job in state.get("jobs") or []:
        if isinstance(job, dict):
            rows.append(
                {
                    "id": job.get("id") or job.get("name") or "hive-job",
                    "status": job.get("status") or job.get("state") or "working",
                    "note": job.get("note") or "",
                }
            )
    bus = load_json(HIVE / "bus" / "state.json")
    if bus:
        spoken = str(bus.get("spoken") or "")
        leak = hasattr(mouth(), "is_ask_leak") and mouth().is_ask_leak(spoken)
        note = spoken if spoken and not leak else (bus.get("utterance") or "idle")
        rows.insert(
            0,
            {
                "id": "mouth",
                "status": bus.get("job_status") or "done",
                "note": note,
            },
        )
    return rows[:20]


def _warm_cursor_chats() -> None:
    """Pre-create talk + agent Cursor chats so the first spoken line resumes."""
    try:
        bus_path = HIVE / "bus" / "state.json"
        bus = load_json(bus_path)
        live = mouth()
        chats = ONLINE.ensure_jarvis_chats(
            str(bus.get("jarvis_chat_id") or "") or None,
            str(bus.get("jarvis_agent_chat_id") or "") or None,
        )
        talk = chats.get("talk")
        agent = chats.get("agent")
        if not (talk or agent):
            return
        live.bus_write(
            HIVE,
            phase=str(bus.get("phase") or "idle"),
            job_status=str(bus.get("job_status") or "done"),
            utterance=str(bus.get("utterance") or ""),
            permission_ask=None,
            spoken=bus.get("spoken"),
            cites=bus.get("cites") if isinstance(bus.get("cites"), list) else None,
            wires=bus.get("wires") if isinstance(bus.get("wires"), list) else None,
            turns=bus.get("turns") if isinstance(bus.get("turns"), list) else None,
            jarvis_chat_id=talk,
            jarvis_agent_chat_id=agent,
            harness_mode=bus.get("harness_mode") if bus.get("harness_mode") in ("ask", "plan", "agent") else None,
        )
    except Exception:
        return


def mark_pieces_wired() -> None:
    stack_path = HIVE / "agent-stack.json"
    stack = load_json(stack_path)
    pieces = stack.get("pieces") if isinstance(stack.get("pieces"), dict) else {}
    if not pieces:
        return
    pieces["mouth"] = "wired"
    pieces["face"] = "wired"
    pieces["hands"] = "parked"
    stack["pieces"] = pieces
    stack_path.write_text(json.dumps(stack, indent=2) + "\n", encoding="utf-8")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _send(self, code: int, body: bytes, ctype: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            return

    def _json(self, code: int, payload: dict) -> None:
        self._send(code, (json.dumps(payload, indent=2) + "\n").encode("utf-8"), "application/json")

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/healthz":
            self._json(200, {"ok": True, "bind": f"{HOST}:{PORT}", "kind": "agent-stack-face"})
            return
        if path == "/api/bus":
            self._json(200, load_json(HIVE / "bus" / "state.json") or {"phase": "idle", "job_status": "done"})
            return
        if path == "/api/jobs":
            self._json(200, {"jobs": observe_jobs()})
            return
        if path == "/api/stack":
            self._json(200, load_json(HIVE / "agent-stack.json"))
            return
        if path == "/api/wires":
            self._json(200, ONLINE.wire_report())
            return
        if path == "/api/voice":
            self._json(200, voice().voice_report())
            return
        target = HERE / ("pane.html" if path in ("/", "/face", "/pane.html") else path.lstrip("/"))
        try:
            target.resolve().relative_to(HERE.resolve())
        except ValueError:
            self._json(403, {"ok": False, "error": "outside face"})
            return
        if not target.is_file():
            self._json(404, {"ok": False, "error": "missing"})
            return
        ctype = "text/html; charset=utf-8"
        if target.suffix == ".css":
            ctype = "text/css"
        self._send(200, target.read_bytes(), ctype)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            data = {}
        return data if isinstance(data, dict) else {}

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        data = self._read_json()
        live_mouth = mouth()
        if path == "/api/listen":
            bus = live_mouth.set_listen(HIVE, bool(data.get("live")))
            self._json(200, {"ok": True, **bus})
            return
        if path == "/api/tts":
            audio, mime = voice().tts_audio(str(data.get("text") or ""))
            if not audio:
                self.send_response(204)
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                return
            self._send(200, audio, mime or "audio/wav")
            return
        if path != "/api/turn":
            self._json(404, {"ok": False, "error": "no such route"})
            return
        utterance = str(data.get("utterance") or "")
        accept = (self.headers.get("Accept") or "").lower()
        want_stream = bool(data.get("stream")) or "text/event-stream" in accept
        if want_stream and hasattr(live_mouth, "apply_turn_iter"):
            self._sse_turn(live_mouth, utterance, bool(data.get("approved")))
            return
        out = live_mouth.apply_turn(
            utterance,
            approved=bool(data.get("approved")),
            hive=HIVE,
            speak=False,
        )
        self._json(200, self._scrub_turn(live_mouth, out))

    def _scrub_turn(self, live_mouth, out: dict) -> dict:
        spoken = str(out.get("spoken") or "")
        if out.get("ask") or (hasattr(live_mouth, "is_ask_leak") and live_mouth.is_ask_leak(spoken)):
            dark = getattr(live_mouth, "DARK_BRAIN", None) or getattr(
                live_mouth, "DARK_GROK", "Online. I have your vault, repo, sessions, and hive. What are we working on?"
            )
            out = {**out, "ask": False, "spoken": dark, "verb": out.get("verb") if out.get("verb") != "desk" else "converse"}
            out.pop("permission_ask", None)
        return out

    def _sse_turn(self, live_mouth, utterance: str, approved: bool) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "close")
        self.end_headers()
        try:
            for ev in live_mouth.apply_turn_iter(
                utterance,
                approved=approved,
                hive=HIVE,
            ):
                clean = self._scrub_turn(live_mouth, ev)
                payload = (f"data: {json.dumps(clean)}\n\n").encode("utf-8")
                self.wfile.write(payload)
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            if hasattr(ONLINE, "cancel_cursor"):
                ONLINE.cancel_cursor()
            return
        except Exception:
            if hasattr(ONLINE, "cancel_cursor"):
                ONLINE.cancel_cursor()
            raise


def serve(port: int = PORT) -> None:
    if os.environ.get("VOICE_OS_BIND") == "0.0.0.0":
        raise SystemExit("0.0.0.0 refused")
    mark_pieces_wired()
    live_mouth = mouth()
    bus_path = HIVE / "bus" / "state.json"
    bus = load_json(bus_path)
    if bus and hasattr(live_mouth, "scrub_bus_ask") and live_mouth.scrub_bus_ask(bus):
        live_mouth.write_json(bus_path, bus)
    if bus.get("job_status") == "working" and bus.get("phase") == "think":
        bus["phase"] = "idle"
        bus["job_status"] = "done"
        live_mouth.write_json(bus_path, bus)
    if hasattr(voice(), "warm"):
        voice().warm()
    threading.Thread(target=_warm_cursor_chats, daemon=True).start()
    httpd = ThreadingHTTPServer((HOST, port), Handler)
    print(json.dumps({"ok": True, "url": f"http://{HOST}:{port}/", "bind": HOST}, indent=2))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()


def self_test() -> dict:
    if os.environ.get("VOICE_OS_BIND") == "0.0.0.0":
        return {"ok": False, "errors": ["0.0.0.0 refused"]}
    if HOST != "127.0.0.1":
        return {"ok": False, "errors": ["face must bind 127.0.0.1"]}
    if not (HERE / "pane.html").is_file():
        return {"ok": False, "errors": ["pane.html missing"]}
    import threading
    import urllib.error
    import urllib.request

    httpd = ThreadingHTTPServer((HOST, 0), Handler)
    port = int(httpd.server_address[1])
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        with urllib.request.urlopen(f"http://{HOST}:{port}/healthz", timeout=2) as res:
            body = json.loads(res.read().decode("utf-8"))
        if not body.get("ok"):
            return {"ok": False, "errors": ["healthz not ok"], "body": body}
        with urllib.request.urlopen(f"http://{HOST}:{port}/", timeout=2) as home:
            html = home.read().decode("utf-8")
            code = home.status
        banned = ("Desk · Face", "<h2>Observe</h2>", "<h2>Mouth</h2>", "Hold Home", "Hold Talk")
        needed = (
            "<canvas",
            "J.A.R.V.I.S.",
            "TAP SPACE",
            "LISTENING FOR",
            "getUserMedia",
            "holdMic",
            "RESTART_MIN",
            "pickEnglishVoice",
            "speakCloud",
            "/api/tts",
            "/api/voice",
            "bm_lewis",
            "en-GB",
            "/api/wires",
            "MODE - AGENT",
            "STOP_RE",
            "AbortController",
            "text/event-stream",
            "spoken_delta",
            "enqueueSpeak",
            "ttsQueue",
            "heardDelta",
            "productMouth",
            "voiceEngine",
            "turnGen",
        )
        banned_chrome = ("Use Chrome", "Safari speech is flaky")
        if code != 200 or any(token not in html for token in needed) or any(token in html for token in banned) or any(token in html for token in banned_chrome):
            return {"ok": False, "errors": ["GET / missing tape visualizer, repo TTS, or still tells him Chrome"], "status": code}
        if "say -v" in html:
            return {"ok": False, "errors": ["pane left a say -v path"]}
        with urllib.request.urlopen(f"http://{HOST}:{port}/api/wires", timeout=2) as wires_res:
            wires = json.loads(wires_res.read().decode("utf-8"))
        if not wires.get("ok") or wires.get("ollama") != "refused":
            return {"ok": False, "errors": ["/api/wires missing or still local-ollama"], "body": wires}
        with urllib.request.urlopen(f"http://{HOST}:{port}/api/voice", timeout=2) as voice_res:
            voice_body = json.loads(voice_res.read().decode("utf-8"))
        if not voice_body.get("ok") or voice_body.get("lang") != "en-GB":
            return {"ok": False, "errors": ["/api/voice missing British repo voice"], "body": voice_body}
        if str(voice_body.get("voice") or "") in {"Samantha", "Daniel"}:
            return {"ok": False, "errors": ["/api/voice still a macOS remap"], "body": voice_body}
        if voice_body.get("repo", {}).get("kokoro") != "bm_lewis":
            return {"ok": False, "errors": ["/api/voice lost bm_lewis"], "body": voice_body}
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        req = urllib.request.Request(
            f"http://{HOST}:{port}/api/tts",
            data=json.dumps({"text": "hello"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=2) as tts_res:
                tts_code = tts_res.status
        except urllib.error.HTTPError as exc:
            tts_code = int(exc.code)
        if tts_code != 204:
            return {"ok": False, "errors": ["dry /api/tts must be 204"], "status": tts_code}
        turn_req = urllib.request.Request(
            f"http://{HOST}:{port}/api/turn",
            data=json.dumps({"utterance": "stop", "stream": True}).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "text/event-stream"},
            method="POST",
        )
        with urllib.request.urlopen(turn_req, timeout=4) as turn_res:
            turn_body = turn_res.read().decode("utf-8")
            turn_type = str(turn_res.headers.get("Content-Type") or "")
        if "text/event-stream" not in turn_type and "spoken_delta" not in turn_body:
            return {"ok": False, "errors": ["stream /api/turn must be SSE"], "ctype": turn_type, "body": turn_body[:240]}
        if "Stopped" not in turn_body or "spoken_delta" not in turn_body:
            return {"ok": False, "errors": ["SSE stop missing spoken_delta"], "body": turn_body[:240]}
        return {"ok": True, "errors": [], "port": port, "bind": HOST, "home": 200}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return {"ok": False, "errors": [str(exc)]}
    finally:
        httpd.shutdown()
        httpd.server_close()


if __name__ == "__main__":
    if "--self-test" in sys.argv or os.environ.get("AGENT_STACK_FACE_SELF_TEST") == "1":
        out = self_test()
        print(json.dumps(out, indent=2))
        raise SystemExit(0 if out.get("ok") else 2)
    serve()
