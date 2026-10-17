#!/usr/bin/env python3
"""Face sitting: localhost pane that reads the file bus.

Bind 127.0.0.1 only. Not evenslouis.ca. Not a second hive.
"""
from __future__ import annotations

import importlib.util
import hashlib
import subprocess
import json
import os
import queue
import select
import socket
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def _release_rev():
    """The commit this server runs (audit 10-16: drift between checkout and running code was invisible)."""
    try:
        spec = importlib.util.spec_from_file_location("agent_stack_turn_log_rev", ROOT / "apps/agent-stack/memory/turn_log.py")
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        return mod.release_rev()
    except Exception:  # noqa: BLE001 - health must answer even if the rev cannot be read
        return None
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
OS_DIR = ROOT / "docs/hive/outer-heaven/CONTENT/os"
HOST = "127.0.0.1"
PORT = int(os.environ.get("AGENT_STACK_FACE_PORT") or "4018")


def _watch_event_path() -> Path | None:
    """Ported from main. Tests can point the bus writer at a temp file."""
    raw = (os.environ.get("WATCH_EVENT_PATH") or "").strip()
    return Path(raw) if raw else None


def _controls():
    return getattr(mouth(), "CONTROLS", None)
TURN_WALL_SEC = float(os.environ.get("JARVIS_FACE_TURN_WALL_SEC") or 25.0)
# One provider attempt after the pre-talk partial. Not a longer campaign clock.
# The standing line waits this long only while that call is still open.
PROVIDER_TEXT_GRACE_SEC = 10.0
TALK_DARK = "The talk wire is dark this turn."


def butler_only(text: str) -> bool:
    """The wrap by itself. Not a sentence."""
    body = " ".join((text or "").split()).lower()
    return body in {"sir.", "sir", "sir,"}


def provider_sentence(ev: dict) -> str:
    """Speakable provider text. The standing dark line is not that text.

    A lone 'Sir.' is the butler wrap. It is not a sentence, so the wall
    must not treat it as the turn's product.
    """
    if not isinstance(ev, dict):
        return ""
    text = str(ev.get("spoken") or "").strip()
    if not text or text == TALK_DARK or butler_only(text):
        return ""
    if str(ev.get("verb") or "") == "think":
        return ""
    return text


def provider_call_open(ev: dict) -> bool:
    """True for the empty pre-talk partial. The provider has not spoken yet."""
    if not isinstance(ev, dict) or not ev.get("partial"):
        return False
    if str(ev.get("spoken") or "").strip():
        return False
    if str(ev.get("host") or "") != "pipeline":
        return False
    return str(ev.get("verb") or "") == "converse"


def vault_read_inflight(ev: dict) -> bool:
    """A vault_read or craft loop that has started and not finished. That is not an idle wire.

    craft bounds itself (hands/craft.py BUDGET_SEC); the wall only waits for it.
    """
    if not isinstance(ev, dict) or not ev.get("partial"):
        return False
    if ev.get("done"):
        return False
    if str(ev.get("spoken") or "").strip():
        return False
    verb = str(ev.get("verb") or ev.get("tool") or "")
    return verb in ("vault_read", "craft")


# Mac review 2026-10-16 (acceptance: "exceed four tool results, survive an Orb disconnect"): only vault_read/craft held
# the 25 s + 10 s wall, so a general hand loop (45 s budget) was cut to the dark line, and a disconnect cancelled work in
# flight. Any hand the pipeline has started now holds the wall up to HAND_HOLD_MAX_SEC, and a disconnect while a hand
# runs detaches the turn instead of cancelling it: the pipeline still commits its own result to the bus.
HAND_HOLD_MAX_SEC = float(os.environ.get("JARVIS_HAND_HOLD_MAX_SEC") or 240)
_NOT_HANDS = frozenset({"", "converse", "think", "say", "stop", "vault_read", "craft"})


def is_heartbeat(ev: dict) -> bool:
    return isinstance(ev, dict) and "heartbeat" in (ev.get("wires") or [])


def hand_inflight(ev: dict) -> bool:
    """A hand (not talk) that the pipeline has started and not finished: its open marker or its one heartbeat."""
    if not isinstance(ev, dict) or not ev.get("partial") or ev.get("done"):
        return False
    if str(ev.get("host") or "") != "pipeline":
        return False
    verb = str(ev.get("verb") or ev.get("tool") or "")
    if verb in _NOT_HANDS:
        return False
    return not str(ev.get("spoken") or "").strip() or is_heartbeat(ev)


def queued_hand(pending: queue.Queue) -> bool:
    try:
        with pending.mutex:
            rows = list(pending.queue)
    except (AttributeError, TypeError):
        return False
    return any(hand_inflight(ev) for ev in rows if isinstance(ev, dict))


def queued_vault_read(pending: queue.Queue) -> bool:
    """True when the open signal is already queued and not yet read."""
    try:
        with pending.mutex:
            rows = list(pending.queue)
    except (AttributeError, TypeError):
        return False
    return any(vault_read_inflight(ev) for ev in rows if isinstance(ev, dict))


def wire_dark_event(utterance: str = "") -> dict:
    return {
        "ok": False,
        "verb": "converse",
        "spoken": TALK_DARK,
        "spoken_delta": TALK_DARK,
        "outcome": "WIRE_FAILURE",
        "done": True,
        "job_status": "done",
        "phase": "speak",
        "utterance": utterance,
        "unknown": True,
    }


def committed_model_event(bus: dict, utterance: str, gen: int, wire: dict | None = None) -> dict | None:
    """The line this generation already published. A later wall must not replace it."""
    try:
        if int((bus or {}).get("turn_gen") or 0) != int(gen):
            return None
    except (TypeError, ValueError):
        return None
    asked = (utterance or "").strip()
    if str((bus or {}).get("utterance") or "").strip() != asked:
        return None
    spoken = str((bus or {}).get("spoken") or "").strip()
    if not provider_sentence({"spoken": spoken, "verb": str((bus or {}).get("tool") or "converse")}):
        return None
    outcome = "MODEL_TALK"
    row = wire if isinstance(wire, dict) else {}
    nested = row.get("wire") if isinstance(row.get("wire"), dict) else {}
    if str(row.get("utterance") or "").strip() == asked:
        got = str(nested.get("outcome") or "")
        if got and got != "WIRE_FAILURE":
            outcome = got
    event = {
        "ok": bool(bus.get("response_ok")) if bus.get("response_ok_gen") == int(gen) else True,
        "verb": str((bus or {}).get("tool") or "converse"),
        "tool": str((bus or {}).get("tool") or "converse"),
        "ask": False,
        "spoken": spoken,
        "spoken_delta": spoken,
        "outcome": outcome,
        "status": outcome,
        "done": True,
        "job_status": "done",
        "phase": "speak",
        "utterance": asked,
        "unknown": False,
        "brain": (bus or {}).get("brain"),
        "wires": (bus or {}).get("wires") or [],
        "cites": (bus or {}).get("cites") or [],
        "turn_gen": int(gen),
        "gen": int(gen),
    }
    if isinstance(bus.get("response_see"), dict) and bus.get("response_see_gen") == int(gen):
        event["see"] = bus["response_see"]
    receipt = bus.get("execution")
    if isinstance(receipt, dict) and bus.get("execution_gen") == int(gen):
        mouth().apply_execution_receipt(event, receipt)
        event["verb"] = "watch"
        event["tool"] = "watch"
        event["outcome"] = receipt.get("outcome") or "WATCH_RESULT"
        event["status"] = event["outcome"]
    return event


def think_heartbeat(utterance: str = "") -> dict:
    return {
        "ok": True,
        "verb": "think",
        "spoken": "",
        "spoken_delta": "",
        "done": False,
        "job_status": "working",
        "phase": "think",
        "utterance": utterance,
    }


_LOADED_SOURCE = {}
_PROCESS_STARTED = time.time()
_BOOT_SOURCE_SHA256 = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
try:
    _BOOT_CHECKOUT_REVISION=subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,capture_output=True,text=True,timeout=2).stdout.strip()
except (OSError,subprocess.TimeoutExpired):_BOOT_CHECKOUT_REVISION='unavailable'
def _source_manifest():
    stack=HERE.parent
    paths=[*stack.glob('brain/*.py'),*stack.glob('hands/*.py'),*stack.glob('mouth/*.py'),*stack.glob('memory/*.py'),HERE/'serve.py']
    return {str(p.relative_to(stack)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if not p.name.startswith('test_')}


def runtime_evidence():
    current=_source_manifest()
    pipeline=getattr(globals().get('_MOUTH'),'PIPELINE',None)
    online=getattr(pipeline,'ONLINE',None)
    loaded={}
    for name,module in list(sys.modules.items()):
        filename=getattr(module,'__file__',None)
        if filename:
            try:loaded[name]=str(Path(filename).resolve().relative_to(HERE.parent))
            except (ValueError,OSError):pass
    coding=sys.modules.get('agent_stack_agent_tools') or sys.modules.get('coding_agent_tools')
    pointer=sys.modules.get('agent_stack_pointer')
    models={'configured_chat':online.openrouter_model() if online else None,
            'last_observed_chat':(getattr(online,'LAST_TALK',{}) or {}).get('model') if online else None,
            'loaded_coding':getattr(coding,'CODE_MODEL',None),
            'loaded_pointer':getattr(pointer,'VISION_MODEL',None)}
    try:revision=subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,capture_output=True,text=True,timeout=2).stdout.strip()
    except (OSError,subprocess.TimeoutExpired):revision='unavailable'
    return {'pid':os.getpid(),'started_at':_PROCESS_STARTED,'checkout_revision':revision,'boot_checkout_revision':_BOOT_CHECKOUT_REVISION,
            'boot_source_sha256':_BOOT_SOURCE_SHA256,'loaded_modules':loaded,'model_roles':models,
            'model_scope':'configured or last observed role; worker processes have separate request/source receipts',
            'mouth_generation_id':hashlib.sha256(json.dumps(_LOADED_SOURCE,sort_keys=True).encode()).hexdigest(),
            'mouth_generation_manifest':dict(_LOADED_SOURCE),'disk_matches_generation':current==_LOADED_SOURCE,
            'revision_scope':'checkout revision and generation baseline; not proof that every lazy hand was imported'
}


def _load_mouth():
    for name in (
        "agent_stack_mouth",
        "agent_stack_pipeline",
        "agent_stack_retrieve",
        "agent_stack_store",
        "agent_stack_online",
        "agent_stack_voice",
        "agent_stack_browser_runtime",
    ):
        sys.modules.pop(name, None)
    path = HERE.parent / "mouth" / "turn.py"
    spec = importlib.util.spec_from_file_location("agent_stack_mouth", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    _LOADED_SOURCE.clear()
    _LOADED_SOURCE.update(_source_manifest())
    return mod


_MOUTH = None
_MOUTH_MTIME = None


def _mouth_stamp() -> tuple:
    """turn.py plus the thinker it imports. Pipeline-only edits used to stay stale."""
    stack = HERE.parent
    paths = (
        stack / "mouth" / "turn.py",
        stack / "brain" / "pipeline.py",
        stack / "brain" / "online.py",
        stack / "mouth" / "persona.py",
        stack / "hands" / "pro.py",
        stack / "hands" / "school_index.py",
        stack / "hands" / "see.py",
        stack / "hands" / "watch_frame.py",
        stack / "hands" / "browser_runtime.py",
        stack / "face" / "senses.py",
        stack / "memory" / "retrieve.py",
        stack / "memory" / "store.py",
        stack / "memory" / "chats.py",
        stack / "memory" / "bus_io.py",
        stack / "memory" / "last_wire.py",
        stack / "mouth" / "voice.py",
        stack / "hands" / "macos_read.py",
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
    spec = importlib.util.spec_from_file_location("agent_stack_online_face", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_ONLINE = None
_ONLINE_MTIME = None


def online():
    """Reload brain/online.py on mtime so a new key/model is not stuck on the boot copy."""
    global _ONLINE, _ONLINE_MTIME
    path = HERE.parent / "brain" / "online.py"
    mtime = path.stat().st_mtime
    if _ONLINE is None or _ONLINE_MTIME != mtime:
        _ONLINE = _load_online()
        _ONLINE_MTIME = mtime
    return _ONLINE


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
_VOICE_LOCK = threading.RLock()


def voice():
    """Reload voice.py when the file on disk changes."""
    global _VOICE, _VOICE_MTIME
    path = HERE.parent / "mouth" / "voice.py"
    with _VOICE_LOCK:
        mtime = path.stat().st_mtime
        if _VOICE is None or _VOICE_MTIME != mtime:
            previous = _VOICE
            if previous is not None and hasattr(previous, "cancel_tts"):
                previous.cancel_tts()
            _VOICE = _load_voice()
            _VOICE_MTIME = mtime
        return _VOICE


VOICE = voice()


def _load_graph():
    path = HERE / "graph.py"
    spec = importlib.util.spec_from_file_location("agent_stack_graph", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _load_senses():
    path = HERE / "senses.py"
    spec = importlib.util.spec_from_file_location("agent_stack_face_senses", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


GRAPH = _load_graph()
_SENSES = None
_SENSES_MTIME = None


def senses():
    global _SENSES, _SENSES_MTIME
    path = HERE / "senses.py"
    mtime = path.stat().st_mtime
    if _SENSES is None or _SENSES_MTIME != mtime:
        _SENSES = _load_senses()
        _SENSES_MTIME = mtime
    return _SENSES


SENSES = senses()


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
        chats = online().ensure_jarvis_chats(
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
            gen=int(bus.get("turn_gen") or 0) or None,
        )
    except Exception:
        return


_NOTES_CACHE = {"n": -1, "at": 0.0}
NOTES_CACHE_SEC = 300.0
FOCUS_PUMP_SEC = 5.0


def _notes_indexed() -> int:
    """Live vault note count for the boot greeting. Cached; never hardcoded."""
    now = time.time()
    if _NOTES_CACHE["n"] >= 0 and now - _NOTES_CACHE["at"] < NOTES_CACHE_SEC:
        return int(_NOTES_CACHE["n"])
    count = 0
    try:
        pipe = getattr(mouth(), "PIPELINE", None)
        ret = getattr(pipe, "RETRIEVE", None) if pipe is not None else None
        roots = ret.resolve_roots() if ret is not None and hasattr(ret, "resolve_roots") else []
        seen: set[str] = set()
        for root in roots:
            base = Path(root)
            if not base.is_dir():
                continue
            key = str(base.resolve())
            if key in seen:
                continue
            seen.add(key)
            for _ in base.rglob("*.md"):
                count += 1
    except OSError:
        count = 0
    _NOTES_CACHE["n"] = count
    _NOTES_CACHE["at"] = now
    return count


def _eyes_motion(live_mouth, moving: bool) -> dict:
    """Honest camera boolean: frame-diff motion only. Motion is not a person;
    stillness is not absence. Observability, never a nudge trigger."""
    pipe = getattr(live_mouth, "PIPELINE", None)
    if pipe is None or not hasattr(pipe, "mutate_bus"):
        return {"ok": False, "wire": "eyes", "spoken": "Eyes bus is not wired."}

    def apply(bus: dict) -> dict:
        eyes = bus.get("eyes") if isinstance(bus.get("eyes"), dict) else {}
        eyes["motion"] = bool(moving)
        eyes["motion_ts"] = time.time()
        eyes.pop("present", None)
        eyes.pop("present_ts", None)
        if hasattr(pipe, "now_iso"):
            eyes["updated_at"] = pipe.now_iso()
        bus["eyes"] = eyes
        return bus

    pipe.mutate_bus(HIVE, apply)
    return {"ok": True, "wire": "eyes", "motion": bool(moving)}


def _focus_pump() -> None:
    """Poll an armed focus session. Callouts ride the bus; the pane speaks them."""
    while True:
        time.sleep(FOCUS_PUMP_SEC)
        try:
            live = mouth()
            pipe = getattr(live, "PIPELINE", None)
            if pipe is None or not hasattr(pipe, "focus_tick"):
                continue
            bus = load_json(HIVE / "bus" / "state.json")
            focus = bus.get("focus") if isinstance(bus.get("focus"), dict) else {}
            if focus.get("armed"):
                pipe.focus_tick(HIVE)
        except Exception:  # noqa: BLE001 — the pump must survive a bad tick
            continue


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



def trusted_request(headers, port: int) -> bool:
    """POSTs only from this server's own page (Orb/pane) or local scripts (no Origin). A page on another site, or a
    DNS-rebinding host, must not be able to say "permission granted" (security review 2026-10-15, H4)."""
    host = str(headers.get("Host") or "").strip().lower()
    if host not in {f"127.0.0.1:{port}", f"localhost:{port}"}:
        return False
    origin = headers.get("Origin")
    return origin is None or str(origin).strip().lower() in {f"http://127.0.0.1:{port}", f"http://localhost:{port}"}

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

    def _trusted_request(self) -> bool:
        """Privacy audit 2026-10-16: any website could POST /api/turn ("permission granted ...", then "confirm") and a
        DNS-rebinding page could read /api/bus. Only this machine's own clients may talk to the Face: the Host header
        must name the loopback port, and a browser Origin / Sec-Fetch-Site must be this same origin. The native Orb,
        pane.html and orb_probe already send exactly that, so nothing they do changes."""
        port = self.server.server_address[1] if getattr(self, "server", None) else PORT
        hosts = {f"127.0.0.1:{port}", f"localhost:{port}", f"[::1]:{port}"}
        if (self.headers.get("Host") or "").strip().lower() not in hosts:
            return False
        origin = (self.headers.get("Origin") or "").strip().lower()
        if origin and origin not in {f"http://{h}" for h in hosts}:
            return False
        site = (self.headers.get("Sec-Fetch-Site") or "").strip().lower()
        return site in ("", "same-origin", "none")

    def _refuse_untrusted(self) -> None:
        self._json(403, {"ok": False, "error": "forbidden: only this Mac's Jarvis clients may call the Face"})

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/runtime":
            self._json(200,runtime_evidence())
            return
        if path == "/healthz":
            self._json(200, {"ok": True, "online": True, "bind": f"{HOST}:{PORT}", "kind": "agent-stack-face",
                             "rev": _release_rev()})
            return
        if not self._trusted_request():
            self._refuse_untrusted()
            return
        if path == "/api/bus":
            pipe = getattr(mouth(), "PIPELINE", None)
            if pipe is not None and hasattr(pipe, "deliver_browser_missions"):
                pipe.deliver_browser_missions(HIVE)
            ctl = _controls()
            if ctl is not None:
                try:
                    ctl.observe_once(HIVE, event_path=_watch_event_path())
                except Exception as exc:  # noqa: BLE001 - watch must not break /api/bus
                    sys.stderr.write(f"watch observe: {exc}\n")
            self._json(200, load_json(HIVE / "bus" / "state.json") or {"phase": "idle", "job_status": "done"})
            return
        if path == "/api/watch/status" and _controls() is not None:
            self._json(200, _controls().watch_status(HIVE))
            return
        if path == "/api/browser-mission":
            pipe = getattr(mouth(), "PIPELINE", None)
            try:
                mission_id = parse_qs(urlparse(self.path).query).get("id", [""])[0]
                state = pipe.browser_runtime().BrowserMissionHandle(HIVE).status(mission_id)
                self._json(200, state)
            except (ValueError, AttributeError) as exc:
                self._json(404, {"ok": False, "error": str(exc)})
            return
        if path == "/api/jobs":
            self._json(200, {"jobs": observe_jobs()})
            return
        if path == "/api/stack":
            stack = dict(load_json(HIVE / "agent-stack.json"))
            stack["notes_indexed"] = _notes_indexed()
            self._json(200, stack)
            return
        if path == "/api/wires":
            live = online()
            if hasattr(live, "load_existing_env"):
                live.load_existing_env()
            self._json(200, live.wire_report())
            return
        if path == "/api/voice":
            self._json(200, voice().voice_report())
            return
        if path == "/api/graph":
            self._json(200, GRAPH.force_graph())
            return
        target = HERE / ("pane.html" if path in ("/", "/face", "/pane.html", "/widget") else path.lstrip("/"))
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
        elif target.suffix == ".js":
            ctype = "application/javascript"
        self._send(200, target.read_bytes(), ctype)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            data = {}
        return data if isinstance(data, dict) else {}

    def _parse_gen(self, data: dict) -> int | None:
        raw = data.get("gen")
        if raw is None:
            return None
        try:
            return int(raw)
        except (TypeError, ValueError):
            return None

    def _refuse_gen(self, wire: str) -> None:
        self._json(200, {"ok": False, "wire": wire, "spoken": "Stopped. Standing by.", "cancelled": True})

    def _abort_inflight(self) -> None:
        """Stop must kill the same worker /api/tts is using, plus cursor."""
        live_voice = voice()
        if hasattr(live_voice, "cancel_tts"):
            live_voice.cancel_tts()
        if hasattr(online(), "cancel_cursor"):
            online().cancel_cursor()

    def _turn_aborted(self, arrival: int) -> bool:
        live_mouth = mouth()
        pipe = getattr(live_mouth, "PIPELINE", None)
        if pipe is None:
            return False
        bus = {}
        if hasattr(pipe, "load_json"):
            bus = pipe.load_json(HIVE / "bus" / "state.json")
        cancel = 0
        if hasattr(pipe, "bus_cancel_gen"):
            cancel = int(pipe.bus_cancel_gen(bus) or 0)
        else:
            try:
                cancel = int((bus or {}).get("cancel_gen") or 0)
            except (TypeError, ValueError):
                cancel = 0
        try:
            turn = int((bus or {}).get("turn_gen") or 0)
        except (TypeError, ValueError):
            turn = 0
        # A cancel of the generation we arrived on is that turn's fence.
        # It must not abort the next request the moment begin_turn advances.
        # That abort cleared the chip and left the next turn_gen with no archive.
        return cancel > arrival and turn > arrival

    def _client_gone(self) -> bool:
        sock = getattr(self, "connection", None)
        if sock is None:
            return True
        try:
            ready, _, _ = select.select([sock], [], [], 0)
            if not ready:
                return False
            return sock.recv(1, socket.MSG_PEEK) == b""
        except (OSError, ValueError):
            return True

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if not self._trusted_request():
            self._refuse_untrusted()
            return
        data = self._read_json()
        live_mouth = mouth()
        if path == "/api/browser-mission/ack":
            pipe = getattr(live_mouth, "PIPELINE", None)
            gen = self._parse_gen(data)
            mission_id = str(data.get("mission_id") or "")
            if gen is None or pipe is None:
                self._json(400, {"ok": False}); return
            pipe.BUS_IO.acknowledge_mission_response(HIVE, mission_id, gen)
            self._json(200, {"ok": True}); return
        if path == "/api/listen":
            gen = self._parse_gen(data)
            if gen is None:
                self._refuse_gen("listen")
                return
            bus = live_mouth.set_listen(HIVE, bool(data.get("live")), gen=gen)
            self._json(200, {"ok": True, **bus})
            return
        if path == "/api/barge":  # Evens 10-17: the Orb reports what the mic hears while Jarvis speaks (diagnosis, no audio)
            try:
                row = {k: data.get(k) for k in ("mic", "bleed", "ducked", "armed", "ctx", "speaking", "note")}
                row["at"] = time.time()
                with (HIVE / "barge.jsonl").open("a", encoding="utf-8") as fh:
                    fh.write(json.dumps(row) + "\n")
            except OSError:
                pass
            self._json(200, {"ok": True})
            return
        if path == "/api/stop" and hasattr(live_mouth, "cancel_scoped"):
            # Ported from main: scoped stop (speak / tool / job / mission / watch).
            out = live_mouth.cancel_scoped(
                str(data.get("scope") or "speak"),
                str(data.get("target") or ""),
                hive=HIVE,
            )
            self._json(200, out)
            return
        ctl = getattr(live_mouth, "CONTROLS", None)
        if path == "/api/watch/source" and ctl is not None:
            out = ctl.set_local_test_value(HIVE, str(data.get("value") or ""))
            self._json(200 if out.get("ok") else 400, out)
            return
        if path == "/api/watch/tick" and ctl is not None:
            self._json(200, ctl.observe_once(HIVE, event_path=_watch_event_path()))
            return
        if path == "/api/watch/ack" and ctl is not None:
            self._json(200, ctl.ack_notice(HIVE, str(data.get("event_id") or "")))
            return
        if path == "/api/tts":
            live_voice = voice()
            text = str(data.get("text") or "")
            gen = self._parse_gen(data)
            pipe = getattr(live_mouth, "PIPELINE", None)
            if gen is None or (
                pipe is not None
                and hasattr(pipe, "act_if_current")
                and pipe.act_if_current(HIVE, gen, lambda bus: bus) is None
            ):
                self.send_response(204)
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                return
            if hasattr(live_voice, "tts_audio_bounded"):
                audio, mime = live_voice.tts_audio_bounded(text, gen=gen, hive=HIVE)
            else:
                audio, mime = live_voice.tts_audio(text, gen=gen, hive=HIVE)
            if not audio:
                self.send_response(204)
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                return
            self._send(200, audio, mime or "audio/wav")
            return
        if path == "/api/voice/design":
            live_voice = voice()
            if hasattr(live_voice, "design_voice"):
                self._json(200, live_voice.design_voice(str(data.get("prompt") or data.get("text") or "")))
                return
            self._json(501, {"ok": False, "error": "design missing", "spent": False})
            return
        if path == "/api/eyes":
            gen = self._parse_gen(data)
            if gen is None:
                self._refuse_gen("eyes")
                return
            if data.get("active") is False or data.get("off") is True:
                self._json(200, senses().set_eyes_active(False, hive=HIVE, gen=gen))
                return
            if ("motion" in data or "present" in data) and not data.get("image"):
                moving = data.get("motion") if "motion" in data else data.get("present")
                self._json(200, _eyes_motion(live_mouth, bool(moving)))
                return
            self._json(200, senses().save_eyes(str(data.get("image") or ""), hive=HIVE, gen=gen))
            return
        if path == "/api/focus":
            gen = self._parse_gen(data)
            if gen is None:
                self._refuse_gen("focus")
                return
            pipe_f = getattr(live_mouth, "PIPELINE", None)
            if pipe_f is None or not hasattr(pipe_f, "focus_arm"):
                self._json(501, {"ok": False, "wire": "focus", "spoken": "Focus is not wired."})
                return
            if data.get("arm") is False:
                self._json(200, pipe_f.focus_stand_down(HIVE))
                return
            raw_min = data.get("minutes")
            try:
                minutes = int(raw_min) if raw_min else None
            except (TypeError, ValueError):
                minutes = None
            self._json(200, pipe_f.focus_arm(HIVE, minutes=minutes))
            return
        if path == "/api/watch":
            start = self._parse_gen(data)
            if start is None:
                self._refuse_gen("watch")
                return
            arm = data.get("arm")
            evens = arm is True
            self._json(
                200,
                senses().run_watch(
                    hive=HIVE,
                    grab=data.get("grab", True) is not False,
                    arm=None if arm is None else bool(arm),
                    gen=start,
                    evens=evens,
                ),
            )
            return
        if path == "/api/drop":
            gen = self._parse_gen(data)
            if gen is None:
                # A Finder drop is Evens's own physical act. The native Orb
                # sends only {paths}; stamp the current generation for it.
                pipe_d = getattr(live_mouth, "PIPELINE", None)
                if pipe_d is not None and hasattr(pipe_d, "peek_gen"):
                    gen = int(pipe_d.peek_gen(HIVE) or 0) or None
            if gen is None:
                self._refuse_gen("drop")
                return
            raw_paths = data.get("paths")
            paths = raw_paths if isinstance(raw_paths, list) else []
            self._json(200, senses().save_drop(paths, hive=HIVE, gen=gen))
            return
        if path != "/api/turn":
            self._json(404, {"ok": False, "error": "no such route"})
            return
        utterance = str(data.get("utterance") or "")
        stop_re = getattr(live_mouth, "STOP_RE", None)
        if stop_re is not None and stop_re.match(utterance.strip()):
            self._abort_inflight()
        accept = (self.headers.get("Accept") or "").lower()
        want_stream = bool(data.get("stream")) or "text/event-stream" in accept
        if want_stream and hasattr(live_mouth, "apply_turn_iter"):
            self._sse_turn(live_mouth, utterance, bool(data.get("approved")))
            return
        box: dict = {}

        def run_turn() -> None:
            try:
                box["out"] = live_mouth.apply_turn(
                    utterance,
                    approved=bool(data.get("approved")),
                    hive=HIVE,
                    speak=False,
                )
            except Exception as exc:  # noqa: BLE001 — named dark, do not hang the socket
                box["err"] = exc

        pipe_plain = getattr(live_mouth, "PIPELINE", None)
        arrival_plain = 0
        if pipe_plain is not None and hasattr(pipe_plain, "peek_gen"):
            arrival_plain = int(pipe_plain.peek_gen(HIVE) or 0)
        worker = threading.Thread(target=run_turn, daemon=True)
        worker.start()
        worker.join(TURN_WALL_SEC)
        if worker.is_alive():
            opened = (pipe_plain.BUS_IO.gen_for_thread(HIVE, worker.ident, arrival_plain)
                      if pipe_plain is not None and hasattr(getattr(pipe_plain, "BUS_IO", None), "gen_for_thread") else None)
            own_gen = opened or arrival_plain + 1  # the gen this request's own worker opened, not a guess
            current = (
                int(pipe_plain.peek_gen(HIVE) or 0)
                if pipe_plain is not None and hasattr(pipe_plain, "peek_gen")
                else 0
            )
            body = self._alive_wall_body(pipe_plain, utterance, own_gen, current)
            self._json(200, self._scrub_turn(live_mouth, body))
            return
        if "err" in box:
            raise box["err"]
        self._json(200, self._scrub_turn(live_mouth, box.get("out") or wire_dark_event(utterance)))

    def _alive_wall_body(self, pipe, utterance: str, own_gen: int, current: int) -> dict:
        """Worker still alive at the wall. A published model line is the client body."""
        if pipe is not None and current == own_gen:
            closed = False
            if hasattr(pipe, "cancel_turn_scoped"):
                closed = bool(
                    pipe.cancel_turn_scoped(HIVE, own_gen, spoken=TALK_DARK, request=utterance)
                )
            elif hasattr(pipe, "cancel_turn"):
                pipe.cancel_turn(HIVE)
                closed = True
            if closed:
                self._abort_inflight()
            else:
                kept = self._committed_model_event(utterance, own_gen)
                if kept:
                    return kept
        return wire_dark_event(utterance)

    def _committed_model_event(self, utterance: str, gen: int) -> dict | None:
        pipe = getattr(mouth(), "PIPELINE", None)
        bus: dict = {}
        if pipe is not None and hasattr(pipe, "load_json"):
            try:
                bus = pipe.load_json(HIVE / "bus" / "state.json") or {}
            except (OSError, TypeError):
                bus = {}
        else:
            bus = load_json(HIVE / "bus" / "state.json")
        wire: dict = {}
        if pipe is not None and hasattr(pipe, "LAST_WIRE") and pipe.LAST_WIRE is not None:
            try:
                wire = pipe.LAST_WIRE.read(HIVE) or {}
            except (OSError, TypeError):
                wire = {}
        return committed_model_event(bus if isinstance(bus, dict) else {}, utterance, gen, wire)

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
        pipe = getattr(live_mouth, "PIPELINE", None)
        arrival = 0
        if pipe is not None and hasattr(pipe, "peek_gen"):
            arrival = int(pipe.peek_gen(HIVE) or 0)
        stop_re = getattr(live_mouth, "STOP_RE", None)
        is_stop = bool(stop_re is not None and stop_re.match((utterance or "").strip()))
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "close")
        self.end_headers()
        pending: queue.Queue = queue.Queue()
        halt = threading.Event()
        deadline = time.monotonic() + TURN_WALL_SEC
        seen_gen = 0
        worker_box: dict = {}
        call_open = False
        heard_provider = False
        tool_open = False
        hand_open = False
        detached = False
        try:
            beat = think_heartbeat(utterance)
            self.wfile.write((f"data: {json.dumps(beat)}\n\n").encode("utf-8"))
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, OSError):
            return

        def produce() -> None:
            try:
                for ev in live_mouth.apply_turn_iter(
                    utterance,
                    approved=approved,
                    hive=HIVE,
                ):
                    if halt.is_set():
                        return
                    pending.put(ev)
            except Exception as exc:  # noqa: BLE001 — close the socket, do not write later
                pending.put(exc)
            finally:
                pending.put(None)

        def own_gen_now() -> int:
            if seen_gen:
                return seen_gen
            w = worker_box.get("t")
            opened = (pipe.BUS_IO.gen_for_thread(HIVE, w.ident, arrival)
                      if w is not None and pipe is not None and hasattr(getattr(pipe, "BUS_IO", None), "gen_for_thread") else None)
            return opened or (arrival + 1)

        def superseded() -> bool:
            """True when a newer generation owns the bus.

            Before this request opens its generation, the bus is still on the
            arrival gen. That is not a newer turn. A cancel of the arrival gen
            is not a newer turn either.
            """
            if pipe is None or not hasattr(pipe, "peek_gen"):
                return False
            current = int(pipe.peek_gen(HIVE) or 0)
            if seen_gen:
                return current > seen_gen
            return current > own_gen_now()

        def kill_own_turn(*, disconnected: bool = False) -> bool:
            """Close with the dark line only while this request still owns the bus.

            Returns True when the dark line replaced the turn. A model sentence
            already published for this utterance stays, and this returns False.
            A stale watchdog must not cancel a newer generation.
            """
            if is_stop or pipe is None:
                return False
            own_gen = own_gen_now()
            current = int(pipe.peek_gen(HIVE) or 0) if hasattr(pipe, "peek_gen") else 0
            if current != own_gen:
                return False
            closed = False
            if hasattr(pipe, "cancel_turn_scoped"):
                closed = bool(
                    pipe.cancel_turn_scoped(HIVE, own_gen, spoken=pipe.BUS_IO.CLIENT_DISCONNECTED if disconnected else TALK_DARK, request=utterance)
                )
            elif hasattr(pipe, "cancel_turn"):
                pipe.cancel_turn(HIVE)
                closed = True
            if closed:
                self._abort_inflight()
            return closed

        def emit_dark() -> None:
            dark = self._scrub_turn(live_mouth, wire_dark_event(utterance))
            try:
                self.wfile.write((f"data: {json.dumps(dark)}\n\n").encode("utf-8"))
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, OSError):
                pass

        def emit_wall() -> None:
            """Dark only when this generation has no model sentence yet."""
            if kill_own_turn():
                emit_dark()
                return
            kept = self._committed_model_event(utterance, own_gen_now())
            if kept:
                try:
                    self.wfile.write((f"data: {json.dumps(kept)}\n\n").encode("utf-8"))
                    self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, OSError):
                    pass
                return
            emit_dark()

        def detach() -> bool:
            """Client gone while a hand runs: let the producer finish on its own (its result lands on the bus) instead
            of cancelling the work. Bounded by HAND_HOLD_MAX_SEC; a newer turn or Stop still ends it."""
            nonlocal detached
            if is_stop or not worker.is_alive() or not (hand_open or tool_open or queued_hand(pending) or queued_vault_read(pending)):
                return False
            if superseded() or self._turn_aborted(arrival):
                return False
            detached = True
            limit = time.monotonic() + HAND_HOLD_MAX_SEC

            def drain() -> None:
                while True:
                    try:
                        ev = pending.get(timeout=0.5)
                    except queue.Empty:
                        ev = False
                    if ev is None:
                        return
                    if time.monotonic() > limit or superseded():
                        halt.set()
                        return
            threading.Thread(target=drain, daemon=True, name="turn-detached").start()
            if pipe is not None and hasattr(pipe, "mutate_bus"):
                gen_now = own_gen_now()
                try:
                    pipe.mutate_bus(HIVE, lambda bus: dict(bus, detached_gen=gen_now))
                except Exception:  # noqa: BLE001 — the marker is a courtesy for the Orb
                    pass
            return True

        worker = threading.Thread(target=produce, daemon=True)
        worker_box["t"] = worker
        worker.start()
        try:
            while True:
                # Supersession closes this socket quietly. Its watchdog no
                # longer owns either the bus response or a client wall.
                if not is_stop and seen_gen and superseded():
                    halt.set()
                    return
                now = time.monotonic()
                if now > deadline:
                    # Conversation has a hard 25s + 10s ceiling, including
                    # workers that are alive or have emitted only a partial.
                    # Vault reads retain their separate outstanding-hand hold.
                    producer_alive = worker.is_alive()
                    owns_turn = not superseded()
                    tool_holding = producer_alive and owns_turn and (
                        tool_open or queued_vault_read(pending)
                        or ((hand_open or queued_hand(pending)) and now < deadline + HAND_HOLD_MAX_SEC)
                    )
                    in_grace = (
                        producer_alive
                        and owns_turn
                        and now < deadline + PROVIDER_TEXT_GRACE_SEC
                    )
                    if not tool_holding and not in_grace:
                        halt.set()
                        emit_wall()
                        return
                client_gone = self._client_gone()
                if client_gone and detach():
                    return
                if (not is_stop and self._turn_aborted(arrival)) or client_gone:
                    halt.set()
                    kill_own_turn(disconnected=client_gone)
                    return
                try:
                    ev = pending.get(timeout=0.2)
                except queue.Empty:
                    continue
                if ev is None:
                    if not heard_provider and not is_stop:
                        already = ""
                        if pipe is not None and hasattr(pipe, "load_json"):
                            try:
                                bus = pipe.load_json(HIVE / "bus" / "state.json")
                            except (OSError, TypeError):
                                bus = {}
                            already = str((bus or {}).get("spoken") or "").strip()
                        # The pipeline may already have archived its own line.
                        # Do not cancel over that line. Empty and a lone Sir. are
                        # not a sentence, so the dark line is the receipt.
                        if already != TALK_DARK and not provider_sentence(
                            {"spoken": already, "verb": "converse"}
                        ):
                            halt.set()
                            emit_wall()
                    return
                if isinstance(ev, Exception):
                    halt.set()
                    if superseded():
                        return
                    if isinstance(ev, (BrokenPipeError, ConnectionResetError, ConnectionAbortedError)):
                        kill_own_turn()
                        return
                    # Reuse terminal recovery: a published result wins, otherwise
                    # this request closes with the existing named wire failure.
                    emit_wall()
                    return
                if isinstance(ev, dict):
                    ev_gen = ev.get("turn_gen") or ev.get("gen")
                    try:
                        if ev_gen and int(ev_gen) > 0:
                            seen_gen = int(ev_gen)
                    except (TypeError, ValueError):
                        pass
                # Generation identity is checked at delivery, not only at the
                # bus write. Another Face request can replace this generation
                # without cancelling it; queued old events must stay off-screen.
                stale_event = not is_stop and (
                    superseded()
                    or (seen_gen and pipe is not None
                        and hasattr(pipe, "turn_cancelled")
                        and pipe.turn_cancelled(HIVE, seen_gen))
                )
                if not is_stop and (self._turn_aborted(arrival) or stale_event):
                    halt.set()
                    return
                clean = self._scrub_turn(live_mouth, ev if isinstance(ev, dict) else {})
                if hand_inflight(clean):
                    hand_open = True  # a heartbeat is the hand still working, not the provider's answer
                elif provider_sentence(clean) and not is_heartbeat(clean):
                    heard_provider = True
                    call_open = False
                    tool_open = False
                    hand_open = False
                elif vault_read_inflight(clean):
                    tool_open = True
                elif provider_call_open(clean):
                    call_open = True
                if clean.get("done"):
                    tool_open = False
                    hand_open = False
                payload = (f"data: {json.dumps(clean)}\n\n").encode("utf-8")
                self.wfile.write(payload)
                self.wfile.flush()
                if clean.get("done") or str(clean.get("verb") or "") == "stop":
                    return
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            if detach():
                return
            halt.set()
            kill_own_turn(disconnected=True)
            return
        finally:
            if not detached:
                halt.set()
            self.close_connection = True


def _recover_operator_jobs() -> None:
    """A job cut off by a restart or reboot carries on by itself (best effort; never blocks the Face)."""
    try:
        import importlib.util as _u
        spec = _u.spec_from_file_location("agent_stack_operator_recover", ROOT / "apps/agent-stack/hands/operator.py")
        op = _u.module_from_spec(spec); spec.loader.exec_module(op)
        got = op.recover(HIVE)
        if got:
            print(json.dumps({"recovered_operator_jobs": got}))
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"recover_error": str(exc)[:200]}))


def serve(port: int = PORT) -> None:
    if os.environ.get("VOICE_OS_BIND") == "0.0.0.0":
        raise SystemExit("0.0.0.0 refused")
    if hasattr(online(), "load_existing_env"):
        online().load_existing_env()
    mark_pieces_wired()
    live_mouth = mouth()
    bus_path = HIVE / "bus" / "state.json"
    pipe = getattr(live_mouth, "PIPELINE", None)

    def _boot_scrub(bus: dict) -> dict:
        if hasattr(live_mouth, "scrub_bus_ask"):
            live_mouth.scrub_bus_ask(bus)
        if bus.get("job_status") == "working" and bus.get("phase") == "think":
            bus["phase"] = "idle"
            bus["job_status"] = "done"
            # Restart audit 2026-10-16: the interrupted turn vanished without a word, and its gen still read as live.
            if bus.get("turn_gen"):
                bus["cancel_gen"] = bus["turn_gen"]
            bus.pop("agent_task_progress", None)
            bus["spoken"] = "I restarted in the middle of your last request, so it did not finish. Say it again and I'll redo it."
            bus["response_ok"] = False
        return bus

    if pipe is not None and hasattr(pipe, "mutate_bus"):
        pipe.mutate_bus(HIVE, _boot_scrub)
    else:
        bus = load_json(bus_path)
        live_mouth.write_json(bus_path, _boot_scrub(bus))
    if hasattr(voice(), "warm"):
        voice().warm()
    threading.Thread(target=_warm_cursor_chats, daemon=True).start()
    threading.Thread(target=_focus_pump, daemon=True).start()
    threading.Thread(target=_recover_operator_jobs, daemon=True).start()
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

    global HIVE
    old_hive = HIVE
    tmp = tempfile.TemporaryDirectory(prefix="face-self-test-")
    HIVE = Path(tmp.name)
    (HIVE / "bus").mkdir(parents=True)
    (HIVE / "bus" / "state.json").write_text(
        json.dumps({"schema_version": 1, "phase": "idle", "job_status": "done", "turns": [], "turn_gen": 1}) + "\n",
        encoding="utf-8",
    )
    httpd = ThreadingHTTPServer((HOST, 0), Handler)
    port = int(httpd.server_address[1])
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    step = "boot"
    try:
        step = "healthz"
        with urllib.request.urlopen(f"http://{HOST}:{port}/healthz", timeout=2) as res:
            body = json.loads(res.read().decode("utf-8"))
        if not body.get("ok") or body.get("online") is not True:
            return {"ok": False, "errors": ["healthz not ok"], "body": {k: body.get(k) for k in ("ok", "online", "bind", "kind")}}
        step = "home"
        with urllib.request.urlopen(f"http://{HOST}:{port}/", timeout=2) as home:
            html = home.read().decode("utf-8")
            code = home.status
        banned = ("Desk · Face", "<h2>Observe</h2>", "<h2>Mouth</h2>", "Hold Home", "Hold Talk", "designBtn", ">DESIGN<")
        needed = (
            "<canvas",
            "J.A.R.V.I.S.",
            "TAP SPACE",
            "LISTENING FOR",
            "SCRAMBLE",
            "productLine",
            "getUserMedia",
            "holdMic",
            "RESTART_MIN",
            "pickEnglishVoice",
            "speakCloud",
            "speakLocal",
            "prefetchCloud",
            "takeReadyCloud",
            "abortTtsFetches",
            "reconcilePhase",
            "/api/tts",
            "/api/voice",
            "/healthz",
            "speak_engine",
            "speak_model",
            "speak_voice_id",
            "talk_model",
            "paintLights",
            "en-GB",
            "/api/wires",
            "MODE - CHECKING",
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
            "stopListen",
            "lastSpoken",
            "isMouthEcho",
            "ForceGraph3D",
            "/api/graph",
            "/api/eyes",
            "/api/watch",
            "eyesBtn",
            "watchBtn",
            "micBtn",
            "hideBtn",
            "toggleChrome",
            "/api/drop",
            "jarvisDropped",
            "toggleMic",
            "async function armMic()",
            "async function holdMic()",
            "getUserMedia({ audio: true })",
            "Allow the microphone, then tap the board.",
            "if (granted && !WIDGET) armMic()",
            'permissions.query({ name: "microphone" })',
            "fallback_reason",
            'bus.phase !== "speak"',
            "Speech recognition unsupported",
            "Speech recognition blocked. Type instead.",
            "pagehide",
            "enablePointerInteraction",
            "/orb.js",
            "PLAY_SPEED",
            "JarvisOrb",
            "html.widget",
            'document.body.classList.add("widget")',
            "body.has-graph:not(.widget) #orb3d",
            "cooldownTime(Infinity)",
            "autoRotate",
        )
        banned_chrome = ("Use Chrome", "Safari speech is flaky")
        if "telegram" in html.lower():
            return {"ok": False, "errors": ["pane grew a Telegram control"]}
        if code != 200 or any(token not in html for token in needed) or any(token in html for token in banned) or any(token in html for token in banned_chrome):
            return {"ok": False, "errors": ["GET / missing tape visualizer, repo TTS, or still tells him Chrome"], "status": code}
        if "say -v" in html:
            return {"ok": False, "errors": ["pane left a say -v path"]}
        if "90 NODES" in html or '|| "eleven_v3"' in html or '|| "agent"' in html or "MODE - AGENT" in html:
            return {"ok": False, "errors": ["pane HUD still paints stub labels"]}
        if "pauseAnimation" in html or "cooldownTime(0)" in html:
            return {"ok": False, "errors": ["pane freezes the 3d vault graph"]}
        after_html = html.split("</html>", 1)[-1] if "</html>" in html else ""
        if "paintPhase(" in after_html:
            return {"ok": False, "errors": ["served HTML leaked JS after </html>"]}
        step = "wires"
        with urllib.request.urlopen(f"http://{HOST}:{port}/api/wires", timeout=2) as wires_res:
            wires = json.loads(wires_res.read().decode("utf-8"))
        if not wires.get("ok") or wires.get("ollama") != "refused":
            return {"ok": False, "errors": ["/api/wires missing or still local-ollama"], "body": {k: wires.get(k) for k in ("ok", "ollama", "talk", "mode")}}
        if wires.get("talk") not in {"openrouter", "xai", "grokbot", "dark"}:
            return {"ok": False, "errors": ["/api/wires missing talk owner"], "body": {k: wires.get(k) for k in ("ok", "talk", "talk_model", "mode")}}
        if "sk-" in json.dumps(wires):
            return {"ok": False, "errors": ["/api/wires leaked a key"]}
        step = "voice"
        with urllib.request.urlopen(f"http://{HOST}:{port}/api/voice", timeout=4) as voice_res:
            voice_body = json.loads(voice_res.read().decode("utf-8"))
        if not voice_body.get("ok") or voice_body.get("lang") != "en-GB":
            return {"ok": False, "errors": ["/api/voice missing British repo voice"], "body": voice_body}
        if str(voice_body.get("voice") or "") in {"Samantha", "Daniel"}:
            return {"ok": False, "errors": ["/api/voice still a macOS remap"], "body": voice_body}
        if voice_body.get("repo", {}).get("kokoro") != "bm_lewis":
            return {"ok": False, "errors": ["/api/voice lost bm_lewis"], "body": voice_body}
        if voice_body.get("model") != "eleven_v3" or voice_body.get("design_model") != "eleven_ttv_v3":
            return {"ok": False, "errors": ["/api/voice missing official v3 slugs"], "body": voice_body}
        speak_engine = str(voice_body.get("speak_engine") or voice_body.get("engine") or "")
        speak_model = str(voice_body.get("speak_model") or "")
        if speak_engine != str(voice_body.get("engine") or ""):
            return {"ok": False, "errors": ["/api/voice speak_engine drifted from engine"], "body": voice_body}
        if speak_engine in {"kokoro", "kokoro-dark-python", "dark"} and speak_model == "eleven_v3":
            return {"ok": False, "errors": ["/api/voice still reports eleven_v3 as the live mouth"], "body": voice_body}
        if speak_engine == "elevenlabs" and speak_model != "eleven_v3":
            return {"ok": False, "errors": ["/api/voice elevenlabs must speak eleven_v3"], "body": voice_body}
        if not voice_body.get("speak_voice_id"):
            return {"ok": False, "errors": ["/api/voice missing speak_voice_id"], "body": voice_body}
        step = "tts"
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        req = urllib.request.Request(
            f"http://{HOST}:{port}/api/tts",
            data=json.dumps({"text": "hello", "gen": 1}).encode("utf-8"),
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
        step = "design"
        design_req = urllib.request.Request(
            f"http://{HOST}:{port}/api/voice/design",
            data=json.dumps({"prompt": "British butler coordinator for Jarvis."}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(design_req, timeout=2) as design_res:
            design_body = json.loads(design_res.read().decode("utf-8"))
        if design_body.get("ok") or design_body.get("spent"):
            return {"ok": False, "errors": ["dry /api/voice/design must not spend"], "body": design_body}
        step = "turn"
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
        step = "orb"
        with urllib.request.urlopen(f"http://{HOST}:{port}/orb.js", timeout=2) as orb_res:
            orb_js = orb_res.read().decode("utf-8")
        if "JarvisOrb" not in orb_js or "icosahedron" not in orb_js:
            return {"ok": False, "errors": ["/orb.js missing geodesic"]}
        step = "widget"
        with urllib.request.urlopen(f"http://{HOST}:{port}/widget", timeout=2) as widget_res:
            widget_html = widget_res.read().decode("utf-8")
        if "micBtn" not in widget_html or "PLAY_SPEED" not in widget_html:
            return {"ok": False, "errors": ["/widget missing dock or play speed"]}
        step = "graph"
        with urllib.request.urlopen(f"http://{HOST}:{port}/api/graph", timeout=8) as graph_res:
            graph_body = json.loads(graph_res.read().decode("utf-8"))
        if not graph_body.get("ok") or not graph_body.get("nodes"):
            return {"ok": False, "errors": ["/api/graph missing nodes"], "body": {k: graph_body.get(k) for k in ("ok", "nodeCount", "linkCount")}}
        step = "eyes"
        os.environ["AGENT_STACK_DRY_EYES"] = "1"
        os.environ["AGENT_STACK_DRY_WATCH"] = "1"
        with urllib.request.urlopen(f"http://{HOST}:{port}/api/bus", timeout=2) as bus_res:
            live_bus = json.loads(bus_res.read().decode("utf-8"))
        live_gen = int(live_bus.get("turn_gen") or 1)
        eyes_req = urllib.request.Request(
            f"http://{HOST}:{port}/api/eyes",
            data=json.dumps({"image": "", "gen": live_gen}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(eyes_req, timeout=2) as eyes_res:
            eyes_body = json.loads(eyes_res.read().decode("utf-8"))
        if not eyes_body.get("ok") or not eyes_body.get("dry"):
            return {"ok": False, "errors": ["dry /api/eyes must be ok"], "body": eyes_body}
        step = "watch"
        watch_req = urllib.request.Request(
            f"http://{HOST}:{port}/api/watch",
            data=json.dumps({"gen": live_gen}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(watch_req, timeout=2) as watch_res:
            watch_body = json.loads(watch_res.read().decode("utf-8"))
        if not watch_body.get("ok") or not watch_body.get("dry"):
            return {"ok": False, "errors": ["dry /api/watch must be ok"], "body": watch_body}
        step = "drop"
        drop_req = urllib.request.Request(
            f"http://{HOST}:{port}/api/drop",
            data=json.dumps({"paths": [], "gen": live_gen}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(drop_req, timeout=2) as drop_res:
            drop_body = json.loads(drop_res.read().decode("utf-8"))
        if drop_body.get("ok") or "drop" not in str(drop_body.get("wire") or "drop"):
            return {"ok": False, "errors": ["/api/drop empty must refuse"], "body": drop_body}
        step = "telegram"
        try:
            urllib.request.urlopen(f"http://{HOST}:{port}/api/telegram", timeout=2)
            return {"ok": False, "errors": ["/api/telegram must stay unbuilt"]}
        except urllib.error.HTTPError as exc:
            if int(exc.code) != 404:
                return {"ok": False, "errors": ["/api/telegram must 404"], "status": int(exc.code)}
        return {"ok": True, "errors": [], "port": port, "bind": HOST, "home": 200}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return {"ok": False, "errors": [f"{step}: {exc}"]}
    finally:
        httpd.shutdown()
        httpd.server_close()
        HIVE = old_hive
        os.environ.pop("AGENT_STACK_DRY_EYES", None)
        os.environ.pop("AGENT_STACK_DRY_WATCH", None)
        tmp.cleanup()


if __name__ == "__main__":
    if "--self-test" in sys.argv or os.environ.get("AGENT_STACK_FACE_SELF_TEST") == "1":
        out = self_test()
        print(json.dumps(out, indent=2))
        raise SystemExit(0 if out.get("ok") else 2)
    serve()
