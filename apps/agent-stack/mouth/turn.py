#!/usr/bin/env python3
"""Mouth door: stop / empty / hard-step. Then the one pipeline.

Face still POST /api/turn. The thinker is brain/pipeline.py, not classify().
No canned can / today. Grok Bot is a desk, not the mouth.
Hard steps (send / pay / deploy / book / publish) refuse — they stay Evens.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
STOP_RE = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?(stop|cancel|never mind|forget it|shut up)\s*[.!]?\s*$",
    re.I,
)
_STOP_RAW = STOP_RE


class _StopGate:
    """Z40: a simulated call waiting at CONFIRM consumes a bare 'cancel' before the generic stop (face/serve.py uses STOP_RE)."""
    pattern = _STOP_RAW.pattern

    def match(self, text, *a):
        m = _STOP_RAW.match(text, *a)
        if m and m.group(1).lower() == "cancel":
            try:
                _f = Path.home() / ".jarvis" / "phone_sim.json"
                _st = json.loads(_f.read_text())
                if _st.get("state") == "CONFIRM":
                    return None
                if _st.pop("consumed", None) and time.time() - _f.stat().st_mtime < 5:
                    _f.write_text(json.dumps(_st, indent=1))  # one-shot: only the serve re-check of this same request is spared
                    return None  # serve re-checks STOP_RE after the turn; the card just consumed this 'cancel'
            except Exception:  # noqa: BLE001
                pass
        return m

    def search(self, text, *a):
        return self.match(text, *a)


STOP_RE = _StopGate()
ASK_LEAK = re.compile(
    r"say yes to (approve|send)|send this to the grok desk|"
    r"hand this to the \w+ desk|do you want me to send this",
    re.I,
)
DARK_BRAIN = "UNKNOWN. Cursor harness returned no reply."
DARK_GROK = DARK_BRAIN
QUIET_THINK_RE = re.compile(
    r"\b(?:stop|don'?t|do not|quit|enough).{0,60}\b(?:looking|thinking)\b"
    r"|\b(?:looking|thinking).{0,40}\b(?:thinking|looking)\b",
    re.I,
)


def _needs_source_evidence(text: str) -> bool:
    """A scoring panel has no file tools; source questions need the pipeline.

    This is routing only. The normal hand still resolves paths and enforces
    scope, freshness and permissions before reading anything.
    """
    if re.search(r"\b(?:files?|documents?|source|code|repository|repo|implementation)\b", text or "", re.I):
        return True
    try:
        reader = PIPELINE._workspace_read_hand()
        return bool(reader._FILE.search(text or "") or reader._SECRET_ASK.search(text or "")
                    or PIPELINE.wants_workspace_read(text or ""))
    except Exception:
        # With an unavailable detector, let the normal pipeline resolve intent.
        return True


def _safe_path(value: str) -> str:
    """HOME-relative or file-name-only: never an absolute machine path."""
    text = str(value or "")
    home = os.path.expanduser("~")
    if home and home != "/" and text.startswith(home + "/"):
        return "~/" + text[len(home) + 1 :]
    if text.startswith("/"):
        return text.rstrip("/").rsplit("/", 1)[-1]
    return text


def safe_cites(cites) -> list:
    """Citations as /api/turn sends them: no absolute paths, no 'abs' key."""
    out = []
    for c in cites or []:
        if isinstance(c, dict):
            row = {k: v for k, v in c.items() if k not in ("abs", "abspath", "absolute")}
            for k in ("path", "file", "source"):
                if isinstance(row.get(k), str):
                    row[k] = _safe_path(row[k])
            out.append(row)
        elif isinstance(c, str):
            out.append(_safe_path(c))
    return out


def _load_mod(name: str, path: Path):
    sys.modules.pop(name, None)
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


VOICE = _load_mod("agent_stack_voice", Path(__file__).resolve().parent / "voice.py")
PIPELINE = _load_mod("agent_stack_pipeline", Path(__file__).resolve().parent.parent / "brain" / "pipeline.py")
_ONLINE_PATH = Path(__file__).resolve().parent.parent / "brain" / "online.py"
ONLINE = _load_mod("agent_stack_online", _ONLINE_PATH) if _ONLINE_PATH.is_file() else None


def _load_face_controls():
    """Ported from main: Face Watch controls (face/controls.py). Optional."""
    path = Path(__file__).resolve().parent.parent / "face" / "controls.py"
    if not path.is_file():
        return None
    try:
        return _load_mod("agent_stack_face_controls", path)
    except Exception:  # noqa: BLE001 - optional door must not break the mouth
        return None


CONTROLS = _load_face_controls()


def _kill_owned_tool(tool_id: str) -> bool:
    """Ported from main: only the Cursor tool has a killer."""
    if tool_id != "cursor" or ONLINE is None or not hasattr(ONLINE, "cancel_cursor"):
        return False
    return bool(ONLINE.cancel_cursor())


def cancel_scoped(scope: str, target: str = "", *, hive: Path = HIVE) -> dict:
    """Ported from main: one scoped cancel. Speaking does not take the tool killer."""
    if CONTROLS is None:
        return {"ok": False, "spoken": "Stopped."}
    return CONTROLS.cancel_once(scope, target, hive=hive, killer=_kill_owned_tool)
_SENSES = None


def _load_senses():
    global _SENSES
    if _SENSES is None:
        _SENSES = _load_mod(
            "agent_stack_senses",
            Path(__file__).resolve().parent.parent / "face" / "senses.py",
        )
    return _SENSES


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_json(path: Path) -> dict:
    return PIPELINE.load_json(path)


def write_json(path: Path, data: dict) -> None:
    PIPELINE.write_json(path, data)


def is_ask_leak(text: str) -> bool:
    return bool(ASK_LEAK.search(text or ""))


def scrub_bus_ask(bus: dict) -> bool:
    """Drop leftover yellow desk-ASK so Safari cannot speak it again. True if dirty."""
    if not isinstance(bus, dict):
        return False
    ask = str(bus.get("permission_ask") or "").strip()
    spoken = str(bus.get("spoken") or "")
    if not (ask or is_ask_leak(spoken)):
        return False
    bus["permission_ask"] = None
    if is_ask_leak(spoken):
        bus["spoken"] = ""
    if bus.get("job_status") == "yellow":
        bus["job_status"] = "done"
    return True


def bus_write(
    hive: Path,
    *,
    phase: str,
    job_status: str,
    utterance: str,
    permission_ask: str | None,
    spoken: str | None = None,
    cites: list | None = None,
    wires: list | None = None,
    turns: list | None = None,
    jarvis_chat_id: str | None = None,
    jarvis_agent_chat_id: str | None = None,
    harness_mode: str | None = None,
    gen: int | None = None,
    execution: dict | None = None,
) -> dict:
    def apply(bus: dict) -> dict:
        bus.update(
            {
                "schema_version": 1,
                "phase": phase,
                "job_status": job_status,
                "utterance": utterance,
                "permission_ask": permission_ask,
                "spoken": spoken,
                "cites": safe_cites(cites),
                "wires": wires or [],
                "updated_at": now_iso(),
            }
        )
        if job_status == "done":
            bus.pop("response_see", None)
            bus.pop("response_see_gen", None)
            bus.pop("response_ok", None)
            bus.pop("response_ok_gen", None)
            if gen is not None:
                result = {"ok": True}
                if execution is not None:
                    apply_execution_receipt(result, execution)
                bus["response_ok"] = result["ok"]
                bus["response_ok_gen"] = int(gen)
        # Receipt belongs to the same atomic terminal claim as the spoken result.
        if execution is not None:
            summary=PIPELINE.execution_summary(execution)
            bus['tool']=summary['executor']
            bus['execution_summary']=summary
            bus['execution_summary_gen']=gen
            bus['task_verified']=summary['task_verified']
            bus['task_verified_gen']=gen
            bus["execution"] = execution
            bus["execution_gen"] = gen
        else:
            bus.pop("execution", None)
            bus.pop("execution_gen", None)
            for key in ('execution_summary','execution_summary_gen','task_verified','task_verified_gen'):
                bus.pop(key,None)
        if jarvis_chat_id == "":
            bus.pop("jarvis_chat_id", None)
        elif jarvis_chat_id:
            bus["jarvis_chat_id"] = jarvis_chat_id
        if jarvis_agent_chat_id == "":
            bus.pop("jarvis_agent_chat_id", None)
        elif jarvis_agent_chat_id:
            bus["jarvis_agent_chat_id"] = jarvis_agent_chat_id
        if harness_mode in ("ask", "plan", "agent"):
            bus["harness_mode"] = harness_mode
        if turns is not None:
            bus["turns"] = turns
        elif "turns" not in bus:
            bus["turns"] = []
        return bus

    act = getattr(PIPELINE, "act_if_current", None)
    if act is None:
        return PIPELINE.mutate_bus(hive, apply)
    bus_io = getattr(PIPELINE, "BUS_IO", None)
    if bus_io is not None and hasattr(bus_io, "commit_response"):
        out = bus_io.commit_response(hive, gen, apply, terminal=job_status == "done")
    else:
        out = act(hive, gen, apply)
    if out is None:
        return PIPELINE.load_json(hive / "bus" / "state.json")
    return out


def set_listen(hive: Path, live: bool, gen: int | None = None) -> dict:
    """Face owns the mic. LIVE writes listen; MUTE returns to idle."""

    def apply(bus: dict) -> dict:
        scrub_bus_ask(bus)
        bus.update(
            {
                "schema_version": 1,
                "phase": "listen" if live else "idle",
                "job_status": bus.get("job_status") or "done",
                "utterance": bus.get("utterance") or "",
                "permission_ask": None,
                "mic": "live" if live else "mute",
                "updated_at": now_iso(),
            }
        )
        return bus

    act = getattr(PIPELINE, "act_if_current", None)
    if act is None:
        return PIPELINE.mutate_bus(hive, apply)
    out = act(hive, gen, apply)
    if out is None:
        return PIPELINE.load_json(hive / "bus" / "state.json")
    return out


def speak_local(text: str) -> None:
    VOICE.speak_local(text)


def _turn_event(
    *,
    spoken: str,
    ok: bool = True,
    verb: str,
    host: str,
    cites: list | None = None,
    wires: list | None = None,
    args=None,
    see: dict | None = None,
    done: bool = True,
    spoken_delta: str = "",
    partial: bool = False,
    brain: str | None = None,
    login_tried: bool = False,
    model_available: bool | None = None,
    unknown: bool = False,
    outcome: str | None = None,
    source: str | None = None,
    gen: int | None = None,
    mission: dict | None = None,
) -> dict:
    ev = {
        "ok": ok,
        "verb": verb,
        "ask": False,
        "spoken": spoken,
        "host": host,
        "args": args,
        "cites": safe_cites(cites),
        "wires": wires or [],
        "done": done,
        "partial": partial,
        "spoken_delta": spoken_delta,
        "brain": brain,
        "login_tried": login_tried,
        "model_available": bool(brain) if model_available is None else bool(model_available),
        "unknown": unknown,
        "outcome": outcome,
        "source": source,
        "status": outcome,
    }
    if mission is not None:
        ev["mission_id"] = mission.get("mission_id")
        ev["task_verified"] = bool(mission.get("task_verified"))
    if isinstance(see, dict):
        ev["see"] = see
    if gen is not None:
        ev["gen"] = int(gen)
        ev["turn_gen"] = int(gen)
    return ev


def apply_execution_receipt(event: dict, receipt: dict) -> dict:
    """One terminal interpretation of operational and task evidence."""
    event["execution"] = receipt
    event["ok"] = bool(receipt.get("ok"))
    summary=PIPELINE.execution_summary(receipt)
    event['execution_summary']=summary
    event['task_verified']=summary['task_verified']
    if event.get('verb') != 'watch':
        event['outcome']=receipt.get('outcome') or summary['outcome']
        event['status']=event['outcome']
    # The current Watch executor proves transitions only. No independent
    # task-proof producer is wired here, so a receipt cannot self-certify.
    if "stroke" in receipt:
        event["ok"] = False
        event["task_verified"] = False
    return event


def _door_speak(
    hive: Path,
    utterance: str,
    spoken: str,
    verb: str,
    retrieve_roots: list[Path] | None = None,
    gen: int | None = None,
    execution: dict | None = None,
) -> dict:
    if gen is not None and hasattr(PIPELINE, "turn_cancelled") and PIPELINE.turn_cancelled(hive, gen):
        return _turn_event(
            spoken="Stopped. Standing by.",
            verb="stop",
            host="local",
            wires=["stop"],
            spoken_delta="",
            gen=gen,
        )
    text = spoken
    persona = getattr(PIPELINE, "PERSONA", None)
    if persona is not None and hasattr(persona, "wrap"):
        text = persona.wrap(spoken, verb=verb, utterance=utterance)
    bus = load_json(hive / "bus" / "state.json")
    prior = PIPELINE.load_turns(bus)
    next_turns = prior if verb == "idle" else PIPELINE.append_turn(prior, utterance, text)
    committed = bus_write(
        hive,
        phase="speak",
        job_status="done",
        utterance=utterance,
        permission_ask=None,
        spoken=text,
        wires=[verb],
        turns=next_turns,
        gen=gen,
        execution=execution,
    )
    text = str(committed.get("spoken") or text)
    if gen is not None and hasattr(PIPELINE, "turn_cancelled") and PIPELINE.turn_cancelled(hive, gen):
        return _turn_event(
            spoken="Stopped. Standing by.",
            verb="stop",
            host="local",
            wires=["stop"],
            spoken_delta="",
            gen=gen,
        )
    chats = getattr(PIPELINE, "CHATS", None)
    if chats is not None and hasattr(chats, "archive_turn"):
        try:
            chats.archive_turn(
                hive=hive,
                retrieve_roots=retrieve_roots,
                utterance=utterance,
                spoken=text,
                verb=verb,
                tool=verb,
                wires=[verb],
                gen=gen,
                turn_gen=gen,
                jarvis_chat_id=str(bus.get("jarvis_chat_id") or "") or None,
                outcome="STOPPED" if verb == "stop" else None,
            )
        except OSError:
            pass
    event = _turn_event(
        spoken=text, verb=verb, host="local", wires=[verb], spoken_delta=text, gen=gen
    )
    receipt = committed.get("execution")
    if isinstance(receipt, dict) and committed.get("execution_gen") == gen:
        apply_execution_receipt(event, receipt)
    return event


def _apply_turn_iter_inner(
    utterance: str,
    *,
    approved: bool = False,
    hive: Path = HIVE,
    retrieve_roots: list[Path] | None = None,
    grok=None,
    status_fn=None,
    cursor_fn=None,
    see_fn=None,
    cursor_ask_fn=None,
    talk_fn=None,
    login_fn=None,
    _sensitive=False,
):
    _ = (approved, grok)
    spoken = (utterance or "").strip()
    PIPELINE.mutate_bus(hive, lambda bus: (scrub_bus_ask(bus) or True) and bus)

    if not spoken:
        yield _door_speak(hive, spoken, "Holding. Say Jarvis, or tap Space.", "idle", retrieve_roots)
        return
    _methods_claimed = _sensitive
    try:  # Z99 + methods asks: a pasted secret is moved to .env.local and never echoed or sent to a model
        _mr = PIPELINE._load("agent_stack_methods_router", PIPELINE.STACK / "hands" / "methods_router.py")
        if _sensitive or _mr.wants(spoken):
            _methods_claimed = True
            _got = _mr.run(spoken)
            _tok_m = PIPELINE.begin_turn(hive) if hasattr(PIPELINE, "begin_turn") else None
            yield _door_speak(hive, "[secret withheld]" if _got.get("secret") else spoken, _got["spoken"], "methods_router", retrieve_roots, gen=_tok_m, execution=_got)
            return
    except Exception as _exc:  # Once intercepted, fail closed even if storage/receipt construction fails.
        _note_failure("methods_router", _exc)
        if _methods_claimed:
            yield _door_speak(hive, "[input withheld]", "I withheld that input because its handler failed. Nothing was sent to a model.", "methods_router", retrieve_roots,
                              execution={"ok": False, "tool": "methods_router", "sent": False, "task_verified": False, "secret": True, "wires": ["methods_handler_failed"]})
            return
    # Ported from main: "stop/cancel the watch" is a scoped Face Watch cancel.
    _scoped = CONTROLS.parse_stop(spoken) if CONTROLS is not None and hasattr(CONTROLS, "parse_stop") else None
    if _scoped and _scoped[1] == "watch":
        receipt = cancel_scoped("watch", _scoped[2], hive=hive)
        line = str(receipt.get("spoken") or "Stopped.")
        _tok = PIPELINE.begin_turn(hive) if hasattr(PIPELINE, "begin_turn") else None
        yield _door_speak(hive, spoken, line, "stop", retrieve_roots, gen=_tok)
        return
    try:  # Z40: 'cancel' while a simulated call waits at CONFIRM closes that card (otherwise it is a plain stop)
        _ph0 = PIPELINE._load("agent_stack_phone_sim", PIPELINE.STACK / "hands" / "phone_sim.py")
        if _ph0.CANCEL_RE.search(spoken or "") and _ph0._load().get("state") == "CONFIRM":
            got = _ph0.run(spoken)
            _tok0 = PIPELINE.begin_turn(hive) if hasattr(PIPELINE, "begin_turn") else None
            yield _door_speak(hive, spoken, got["spoken"], "phone_sim", retrieve_roots, gen=_tok0, execution=got)
            return
    except Exception:  # noqa: BLE001
        pass
    if STOP_RE.match(spoken):
        if ONLINE is not None and hasattr(ONLINE, "cancel_cursor"):
            ONLINE.cancel_cursor()
        if VOICE is not None and hasattr(VOICE, "cancel_tts"):
            VOICE.cancel_tts()
        stop_gen = PIPELINE.cancel_turn(hive) if hasattr(PIPELINE, "cancel_turn") else None
        if CONTROLS is not None and hasattr(CONTROLS, "stop_watch"):
            try:
                CONTROLS.stop_watch(hive)
            except (OSError, ValueError, TypeError):
                pass
        yield _door_speak(
            hive, spoken, "Stopped. Standing by.", "stop", retrieve_roots, gen=stop_gen
        )
        return
    # Ported from main: Face Watch ("Watch ... and tell me when it changes.") and its status.
    if CONTROLS is not None and CONTROLS.parse_watch_status(spoken):
        snap = CONTROLS.watch_status(hive)
        line = str(snap.get("spoken") or "No watch is active.")
        if hasattr(PIPELINE, "write_receipt"):
            PIPELINE.write_receipt(hive, turn_input=spoken, turn_output=line)
        _tok = PIPELINE.begin_turn(hive) if hasattr(PIPELINE, "begin_turn") else None
        yield _door_speak(hive, spoken, line, "watch_status", retrieve_roots, gen=_tok)
        return
    _watched = CONTROLS.parse_watch(spoken) if CONTROLS is not None else None
    if _watched:
        made = CONTROLS.create_watch(hive, target=_watched, utterance=spoken)
        line = str(made.get("spoken") or CONTROLS.WATCHING_LINE)
        if hasattr(PIPELINE, "write_receipt"):
            PIPELINE.write_receipt(hive, turn_input=spoken, turn_output=line)
        _tok = PIPELINE.begin_turn(hive) if hasattr(PIPELINE, "begin_turn") else None
        yield _door_speak(hive, spoken, line, "watch", retrieve_roots, gen=_tok)
        return
    if QUIET_THINK_RE.search(spoken):
        token = PIPELINE.begin_turn(hive) if hasattr(PIPELINE, "begin_turn") else None
        yield _door_speak(
            hive,
            spoken,
            "Noted. I stay quiet until I have the line.",
            "converse",
            retrieve_roots,
            gen=token,
        )
        return
    _ea_want = False
    try:  # Z76: a "create the invoice ... and send" ask is answered draft-only by entity_ack (it never sends)
        _ea_want = PIPELINE._load("agent_stack_entity_ack", PIPELINE.STACK / "hands" / "entity_ack.py").wants(spoken)
    except Exception:  # noqa: BLE001
        pass
    try:  # Z60: a conditional approval is read back + recorded (nothing books/sends), so it passes the refusal too
        _ap_m = PIPELINE._load("agent_stack_approval", PIPELINE.STACK / "hands" / "approval.py")
        _ea_want = _ea_want or (_ap_m.wants(spoken) and not re.search(r"\b(?:wire|pay|transfer)\b", spoken or "", re.I))
    except Exception:  # noqa: BLE001
        pass
    _project_hand, _project_want = None, False
    if re.match(r"^(?:hey\s+)?(?:jarvis[, .]+)?project\s+[a-z0-9-]+\s+", spoken, re.I):
        try:
            _project_hand = PIPELINE._load("agent_stack_project_methods", PIPELINE.STACK / "hands" / "project_methods.py")
            _project_want = _project_hand.wants(spoken)
        except (ImportError, OSError, RuntimeError):
            pass
    # Explicit local-artifact commands never execute sends or bookings. Their body
    # may quote those words; apply the external-action gate to actual actions.
    if PIPELINE.is_hard_step(spoken) and not (_ea_want or _project_want):
        token = PIPELINE.begin_turn(hive) if hasattr(PIPELINE, "begin_turn") else None
        for out in PIPELINE.apply_pipeline_iter(
            spoken,
            hive=hive,
            retrieve_roots=retrieve_roots,
            cursor_fn=cursor_fn,
            see_fn=see_fn,
            status_fn=status_fn,
            cursor_ask_fn=cursor_ask_fn,
            talk_fn=talk_fn,
            login_fn=login_fn,
            gen=token,
        ):
            text = str(out.get("spoken") or PIPELINE.PROPOSAL)
            event = _turn_event(
                spoken=text,
                ok=bool(out.get("ok", True)),
                verb="refuse_hard_step",
                host="pipeline",
                cites=out.get("cites") or [],
                wires=out.get("wires") or ["refuse_hard_step"],
                args=out.get("args"),
                done=bool(out.get("done", True)),
                spoken_delta=str(out.get("spoken_delta") or ""),
                partial=bool(out.get("partial")),
                outcome=out.get("outcome") or out.get("status"),
                source=out.get("source"),
                gen=out.get("gen") or out.get("turn_gen") or token,
            )
            for key in ("execution", "task_verified", "mission_id"):
                if key in out:
                    event[key] = out[key]
            yield event
        return
    bus_armed = load_json(hive / "bus" / "state.json")
    already_armed = isinstance(bus_armed.get("watch"), dict) and bool(bus_armed["watch"].get("armed"))
    verbal_watch = bool(hasattr(PIPELINE, "wants_watch") and PIPELINE.wants_watch(spoken))
    token = (
        PIPELINE.begin_turn(hive, arm_watch=already_armed or verbal_watch)
        if hasattr(PIPELINE, "begin_turn")
        else None
    )
    fresh = load_json(hive / "bus" / "state.json")
    watch_row = fresh.get("watch") if isinstance(fresh.get("watch"), dict) else {}
    watch_on = bool(watch_row.get("armed"))
    # Z75 (wJ3 5:26-5:29): after "be quiet, I'm talking to ...", speech not addressed to Jarvis gets no reply at all;
    # the next line that names Jarvis lifts the hush and is answered normally. Hush lapses after JARVIS_HUSH_SEC (600 s).
    _hush = fresh.get("hush") if isinstance(fresh.get("hush"), dict) else {}
    if _hush.get("on") and time.time() - float(_hush.get("ts") or 0) < float(os.environ.get("JARVIS_HUSH_SEC") or 600):
        if not re.search(r"\bjarvis\b", spoken or "", re.I):
            PIPELINE.mutate_bus(Path(hive), lambda b: dict(b, hush=dict(_hush, heard=int(_hush.get("heard") or 0) + 1)))
            yield _turn_event(spoken="", verb="hush", host="local", wires=["hush", "listening"], spoken_delta="", gen=token)
            return
        PIPELINE.mutate_bus(Path(hive), lambda b: dict(b, hush={"on": False, "ts": time.time(), "resumed_by": "addressed"}))
    if verbal_watch and not watch_on:
        yield _door_speak(
            hive,
            spoken,
            "The screen was not shared, sir. Watch is off. Tap Watch on the face to share it.",  # Z54 (U-LX 7:57)
            "watch",
            retrieve_roots,
            gen=token,
        )
        return
    if verbal_watch and watch_on:
        yield _door_speak(
            hive,
            spoken,
            "I can see your screen and I'm listening, sir. Just talk, and feel free to cut me off.",
            "watch",
            retrieve_roots,
            gen=token,
        )
        return
    # Clock: time/date asks are answered from the local clock in Evens's zone, never by the model (it guessed 10:07 PM at 15:58).
    if re.search(r"\b(?:what(?:'s| is)? the time|what time is it|what(?:'s| is) (?:the |today'?s )?date|what day is (?:it|today))\b", spoken or "", re.I) \
            and len((spoken or "").split()) <= 12:
        from zoneinfo import ZoneInfo
        _now = datetime.now(ZoneInfo(os.environ.get("JARVIS_TZ") or "America/Toronto"))
        _line = f"It's {_now.strftime('%-I:%M %p')} Eastern, {_now.strftime('%A, %B %-d')}."
        yield _door_speak(hive, spoken, _line, "clock", retrieve_roots, gen=token,
                          execution={"ok": True, "tool": "clock", "spoken": _line, "wires": ["local_clock"], "sent": False})
        return
    if _project_want:
        got = _project_hand.run(spoken, root=Path(os.environ.get("JARVIS_PROJECT_ROOT") or Path.home() / ".jarvis" / "projects"))
        if got.get("ok"):
            try:
                _pv = PIPELINE._load("agent_stack_project_view", PIPELINE.STACK / "hands" / "project_view.py")
                got["project_view"] = _pv.snapshot(_project_hand, Path(os.environ.get("JARVIS_PROJECT_ROOT") or Path.home() / ".jarvis" / "projects"), spoken)
            except Exception:
                # Presentation failure cannot replay an already committed draft through the model.
                got["spoken"] += " The review panel is unavailable; use project review queue to refresh it."
        yield _door_speak(hive, spoken, got["spoken"], "project_methods", retrieve_roots, gen=token, execution=got)
        return
    # Z82 (dCK 4:39): "find my note about X" -> name the title, ask, then fetch on "open it/yes". Z83 grounded writing.
    try:
        _fp = Path.home() / ".jarvis" / "find_pending.json"
        _fm = re.search(r"\bfind\s+(?:me\s+)?my\s+notes?\s+(?:about|on)\s+(.+?)[.?!]?$", spoken or "", re.I)
        if _fm and _REFLEX is not None:
            p_, nm = _REFLEX.vault_note(_fm.group(1))
            if p_ < 0.5:
                pm = _REFLEX.path_matches(_fm.group(1)); nm = pm[0]["stem"] if pm else ""
            if nm:
                _REFLEX._vault_index()  # path lookup needs the warm index right after a restart
                nb = _REFLEX.note_brief(nm)  # dCK 4:38-4:44: "Found it, sir. <title>. Let me pull the actual content for you." same turn
                _line = (f"Found it, sir: {nm}. Let me pull the actual content for you. {nb['gist']}" if nb.get("ok")
                         else f"Found {nm}, sir, but I can't open it from here.")
                _why = nb.get("why", "")
            else:
                _line = f"I found no note about {_fm.group(1)}, sir."
            yield _door_speak(hive, spoken, _line, "vault_find", retrieve_roots, gen=token,
                              execution={"ok": True, "tool": "vault_find", "spoken": _line, "wires": ["reflex"], "sent": False,
                                         "why": locals().get("_why", "")})
            return
        if _fp.exists() and re.match(r"^\W*(?:yes|yeah|open it|that one|read it)\W*$", spoken or "", re.I):
            _pend = json.loads(_fp.read_text()); _fp.unlink()
            if time.time() - float(_pend.get("ts") or 0) < 600:
                nb = _REFLEX.note_brief(_pend["name"])
                _line = f"Your {nb['name']} note is up. {nb['gist']}" if nb.get("ok") else "That note has moved, sir; I can't open it."
                yield _door_speak(hive, spoken, _line, "vault_read", retrieve_roots, gen=token,
                                  execution={"ok": True, "tool": "vault_read", "spoken": _line, "cites": [nb.get("path", "")], "sent": False})
                return
        _fr0 = PIPELINE._load("agent_stack_frontier", PIPELINE.STACK / "hands" / "frontier.py")
        if _REFLEX is not None and _fr0.GROUND_RE.search(spoken or ""):
            got = _fr0.grounded(spoken, reflex=_REFLEX)
            yield _door_speak(hive, spoken, got["spoken"], "grounded", retrieve_roots, gen=token, execution=got)
            return
    except Exception:  # noqa: BLE001
        pass
    # Z12 (demo D5v4UuvtUXc 0:09-0:30): "pull up my X" where the reflex names a vault note -> read that note, no model detour.
    try:
        _rx = _reflex(spoken) or {}
        if (_rx.get("vault_note") and float(_rx.get("vault_hit") or 0) >= 0.6 and _rx.get("lane") in ("converse", "other")
                and re.search(r"\b(?:pull|bring)\s+up\b|\b(?:show|open|find)\s+(?:me\s+)?my\b", spoken or "", re.I)):
            nb = _REFLEX.note_brief(_rx["vault_note"]) if _REFLEX is not None else {"ok": False}
            if nb.get("ok"):
                got = {"ok": True, "tool": "vault_read", "spoken": f"Your {nb['name']} note is up. {nb['gist']}",
                       "cites": [nb["path"]], "wires": ["vault_read", "reflex"], "sent": False, "task_verified": True}
                yield _door_speak(hive, spoken, got["spoken"], "vault_read", retrieve_roots, gen=token, execution=got)
                return
    except Exception:  # noqa: BLE001
        pass
    # Z70: a 'pull up my X' with no strong title hit -> match on folder path; read a full-cover hit, else name the closest three honestly.
    try:
        if _REFLEX is not None and re.search(r"\b(?:pull|bring)\s+up\b|\b(?:show|open|find)\s+(?:me\s+)?my\b", spoken or "", re.I) \
                and not re.search(r"\b(?:screen|window|calendar|email|inbox|mail|cost|meter|results?)\b", spoken or "", re.I):
            pm = _REFLEX.path_matches(spoken)
            if pm:
                if pm[0]["covers"]:
                    nb = _REFLEX.note_brief(pm[0]["stem"])
                    if nb.get("ok"):
                        _fold = Path(nb["path"]).parent.name
                        _line = f"Your {nb['name']} note is up, from {_fold}. {nb['gist']}"
                        got = {"ok": True, "tool": "vault_read", "spoken": _line, "cites": [nb["path"]], "wires": ["vault_read", "path_match"], "sent": False}
                        yield _door_speak(hive, spoken, _line, "vault_read", retrieve_roots, gen=token, execution=got)
                        return
                # No note covers the ask: step aside (live 10-16: "open my browser and open Gmail" got three note file
                # names read aloud). The normal turn decides what he meant.
    except Exception:  # noqa: BLE001
        pass
    # Round-2 frontier: Z86/Z87 automation contract+proof, Z89-91 enrich, Z93 preflight, Z95/Z97 panel, Z66 review->do.
    try:
        _fr = PIPELINE._load("agent_stack_frontier", PIPELINE.STACK / "hands" / "frontier.py")
        _tst = bool(os.environ.get("PYTEST_CURRENT_TEST"))
        got = None
        if _fr.AUTO_RE.search(spoken or ""):
            got = _fr.automation(spoken, out=Path("/tmp/jarvis-test-inbox") if _tst else None)
        elif _fr.ENRICH_RE.search(spoken or ""):
            got = _fr.enrich(spoken)
        elif _fr.REVIEW_DO_RE.search(spoken or ""):
            got = _fr.review_do(spoken, drafts=PIPELINE._drafts_hand().drafts_dir())
        elif _fr.PAID_RE.search(spoken or "") and not re.search(r"\b(?:write|draft|email)\b", spoken or "", re.I):
            _inv = PIPELINE._load("agent_stack_mcp_inventory", PIPELINE.STACK / "hands" / "mcp_inventory.py").inventory()[0]
            got = _fr.preflight(spoken, [str(x.get("name") or "") for x in _inv])
        elif _fr.PANEL_RE.match(re.sub(r"^\s*(?:hey\s+)?jarvis[,.]?\s*(?:please\s+)?", "", spoken or "", flags=re.I)) and not _needs_source_evidence(spoken):
            got = _fr.panel(spoken)
        if got is not None:
            yield _door_speak(hive, spoken, got["spoken"], got.get("tool") or "frontier", retrieve_roots, gen=token, execution=got)
            return
    except Exception:  # noqa: BLE001
        pass
    # Z75 (wJ3 5:26): "hold on / be quiet, I'm talking to ..." -> "Off you go, sir." and Jarvis stays quiet (mic stays on).
    if re.search(r"\b(?:be quiet|hush|quiet down|stop talking|i'?m talking to (?:my|the|someone))\b", spoken or "", re.I) and len(spoken.split()) <= 16:
        PIPELINE.mutate_bus(Path(hive), lambda b: dict(b, hush={"on": True, "ts": time.time()}))
        yield _door_speak(hive, spoken, "Off you go, sir.", "hush", retrieve_roots, gen=token,
                          execution={"ok": True, "tool": "hush", "spoken": "Off you go, sir.", "wires": ["hush"], "sent": False})
        return
    # Z76/Z71: create an invoice for a named lead -> name the matched record, request values win, local draft only.
    _spoke = False  # silent-failure audit 2026-10-16: once a reply is out, a later error must not fall through to a second one
    try:
        _ea = PIPELINE._load("agent_stack_entity_ack", PIPELINE.STACK / "hands" / "entity_ack.py")
        if _ea.wants(spoken):
            _notes = _REFLEX._vault_index() if _REFLEX is not None else []
            got = _ea.run(spoken, notes=_notes, drafts=None if os.environ.get("PYTEST_CURRENT_TEST") else PIPELINE._drafts_hand().drafts_dir())
            yield _door_speak(hive, spoken, got["spoken"], "entity_ack", retrieve_roots, gen=token, execution=got)
            _spoke = True
            if got["parsed"]["kind"] == "invoice":  # Z34 offer can lapse (Z56)
                _lp = PIPELINE._load("agent_stack_lapse", PIPELINE.STACK / "hands" / "lapse.py")
                PIPELINE.mutate_bus(Path(hive), lambda b: _lp.open_q(b, topic="payment reminder", ask="Shall I pop a reminder on your calendar?",
                                    pending=f"No payment reminder for {got['parsed']['who']} is on your calendar."))
            return
    except Exception as _exc:  # noqa: BLE001
        _note_failure("entity_ack", _exc)
        if _spoke:
            return
    # Z84 (dCK 10:49): an app with no tool -> "<App> isn't in your arsenal yet", nothing improvised.
    try:
        _tg = PIPELINE._load("agent_stack_toolgap", PIPELINE.STACK / "hands" / "toolgap.py")
        _inv = PIPELINE._load("agent_stack_mcp_inventory", PIPELINE.STACK / "hands" / "mcp_inventory.py").inventory()[0]
        _pt = PIPELINE._pointer_hand()
        _gap = None if (_pt.wants_pointer(spoken) or _pt.wants_click(spoken) or _ea_want) else _tg.gap(spoken, [str(x.get("name") or "") for x in _inv])
        if _gap:
            yield _door_speak(hive, spoken, _gap, "toolgap", retrieve_roots, gen=token,
                              execution={"ok": True, "tool": "toolgap", "spoken": _gap, "wires": ["mcp_inventory"], "sent": False})
            return
    except Exception:  # noqa: BLE001
        pass
    # Z52 (D5v4UuvtUXc 9:20): high stakes + vault miss + missing slots -> one compact question, nothing improvised.
    _spoke = False
    try:
        _sl = PIPELINE._load("agent_stack_slots", PIPELINE.STACK / "hands" / "slots.py").ask_for(spoken)
        _rx2 = _reflex(spoken) or {}
        if _sl and float(_rx2.get("stakes") or 0) >= 0.5 and float(_rx2.get("vault_hit") or 0) < 0.6:
            got = {"ok": True, "tool": "slots", "spoken": _sl["spoken"], "missing": _sl["missing"], "wires": ["reflex", "slots"],
                   "cites": [], "sent": False, "task_verified": False, "outcome": "ASK_NOTHING_IMPROVISED"}
            PIPELINE.mutate_bus(Path(hive), lambda bus: dict(bus, reflex=dict(bus.get("reflex") or {}, verdict="ASK \u00b7 NOTHING IMPROVISED")))
            yield _door_speak(hive, spoken, got["spoken"], "slots", retrieve_roots, gen=token, execution=got)
            _spoke = True
            _lp = PIPELINE._load("agent_stack_lapse", PIPELINE.STACK / "hands" / "lapse.py")
            PIPELINE.mutate_bus(Path(hive), lambda b: _lp.open_q(b, topic=_sl["noun"], ask=_sl["spoken"],
                                pending=f"The {_sl['noun']} is not started yet; I still need " + " and ".join("whom" if m == "who" else "what it covers" for m in _sl["missing"]) + "."))
            return
    except Exception as _exc:  # noqa: BLE001
        _note_failure("slots", _exc)
        if _spoke:
            return
    # Z06/Z07/Z40 simulated phone desk (telephony on HOLD): confirm card -> 'do it' -> ringing -> ended; nothing dials.
    try:
        _ph = PIPELINE._load("agent_stack_phone_sim", PIPELINE.STACK / "hands" / "phone_sim.py")
        if _ph.wants(spoken):
            got = _ph.run(spoken)

            def _pcard(bus: dict, c=got["card"]) -> dict:
                ib = bus.get("inbox") if isinstance(bus.get("inbox"), dict) else {}
                bus["inbox"] = {"gen": int(ib.get("gen") or 0) + 1, "items": [x for x in (ib.get("items") or []) if isinstance(x, dict)][-4:] + [dict(c, turn_gen=token)]}
                return bus
            PIPELINE.mutate_bus(Path(hive), _pcard)
            yield _door_speak(hive, spoken, got["spoken"], "phone_sim", retrieve_roots, gen=token, execution=got)
            return
    except Exception:  # noqa: BLE001
        pass
    # Z78 (dCK 14:30): "add a custom tool called X at <MCP URL>" -> registry entry, pending until approved; nothing connects by itself.
    _ct = re.search(r"\badd (?:a )?(?:custom )?(?:tool|mcp(?: server)?)\s+(?:called|named)\s+([\w .-]{2,40}?)\s+(?:at|with url|url)\s+(https?://\S+)", spoken or "", re.I)
    if _ct:
        _reg = Path.home() / ".jarvis" / "custom_tools.json"
        try:
            _cur = json.loads(_reg.read_text()) if _reg.exists() else []
        except Exception:  # noqa: BLE001
            _cur = []
        _cur = [x for x in _cur if x.get("name") != _ct.group(1).strip()] + [{"name": _ct.group(1).strip(), "url": _ct.group(2).rstrip(".,"), "state": "pending", "ts": time.time()}]
        _reg.parent.mkdir(parents=True, exist_ok=True)
        _reg.write_text(json.dumps(_cur, indent=1))
        _line = (f"{_ct.group(1).strip()} is on your tool list as a custom MCP at {_ct.group(2).rstrip('.,')}, sir, marked pending. "
                 "It isn't connected yet: approve it in settings and I'll check its tools before using them.")
        yield _door_speak(hive, spoken, _line, "custom_tool", retrieve_roots, gen=token,
                          execution={"ok": True, "tool": "custom_tool", "spoken": _line, "wires": ["custom_tools.json"], "sent": False})
        return
    # Z60 (zdnijkAbknA 3:31-3:42, 4:26): a spoken conditional approval -> read-back + written approval record + inbox card.
    _spoke = False
    try:
        _ap = PIPELINE._load("agent_stack_approval", PIPELINE.STACK / "hands" / "approval.py")
        if _ap.wants(spoken) and not re.search(r"\b(?:send|wire|pay|transfer)\b(?!\s+me\s+a\s+confirmation)", spoken, re.I):
            _rm = PIPELINE._results_mem()
            got = _ap.run(spoken, inbox=Path(_rm.VAULT_INBOX) if not os.environ.get("PYTEST_CURRENT_TEST") else None)
            card = {"title": "📝 Approval granted (pending check)", "fields": got["fields"] + [f"File: {c}" for c in got["cites"]][:1],
                    "body": got["spoken"][:220], "ts": time.time(), "turn_gen": token}

            def _inbox(bus: dict) -> dict:
                ib = bus.get("inbox") if isinstance(bus.get("inbox"), dict) else {}
                items = [c for c in (ib.get("items") or []) if isinstance(c, dict)][-4:] + [card]
                bus["inbox"] = {"gen": int(ib.get("gen") or 0) + 1, "items": items}
                return bus
            PIPELINE.mutate_bus(Path(hive), _inbox)
            yield _door_speak(hive, spoken, got["spoken"], "approval", retrieve_roots, gen=token, execution=got)
            _spoke = True
            _lp = PIPELINE._load("agent_stack_lapse", PIPELINE.STACK / "hands" / "lapse.py")
            _r = got["record"]
            PIPELINE.mutate_bus(Path(hive), lambda b: _lp.open_q(b, topic="calendar", ask="Did I get that right?",
                                pending=f"The {_r['what']} booking{(', ' + _r['when']) if _r['when'] else ''}, is not on your calendar yet."))
            return
    except Exception as _exc:  # noqa: BLE001
        _note_failure("approval", _exc)
        if _spoke:
            return
    # Z02: "where do I click to X" is tutor mode: on-device locate + native arrow, never a Watch click, never a screenshot.
    if hasattr(PIPELINE, "_pointer_hand") and (PIPELINE._pointer_request(spoken) or PIPELINE._pointer_hand().wants_pointer(spoken) or PIPELINE._pointer_followup(spoken,hive)) and not PIPELINE.is_hard_step(spoken):
        # demo 2:04.1: the ack is spoken at once, before the look (storyboards/Z02)
        yield _turn_event(spoken="Let me have a look, sir.", verb="pointer", host="local", wires=["pointer"],
                          spoken_delta="Let me have a look, sir.", done=False, partial=True, gen=token)
        got = PIPELINE.run_tool({"tool": "pointer", "args": {}}, spoken, hive=hive, retrieve_roots=retrieve_roots, gen=token)
        yield _door_speak(hive, spoken, str(got.get("spoken") or ""), "pointer", retrieve_roots, gen=token, execution=got)
        return
    # A disabled executor is a blocked action, not a conversational task.
    action_text = re.sub(r"^(?:hey\s+)?(?:jarvis[,.]?\s*)?(?:please\s+)?", "", spoken, flags=re.I)
    screen_action = bool(PIPELINE.SCREEN_ACT_RE.match(action_text))
    explicit_browser = bool(re.search(r"\b(?:safari|https?://)", spoken, re.I))
    _z02_click = PIPELINE._pointer_hand().wants_click(spoken)  # Z02: arrow + confirm click, not the Watch desktop
    if _z02_click and not watch_on and not PIPELINE.is_hard_step(spoken):
        # Desktop (Watch) off: a named click is the Z02 hand -> arrow + one-shot confirm (run_tool arms it); Watch keeps clicks when on.
        got = PIPELINE.run_tool({"tool": "pointer_click", "args": {}}, spoken, hive=hive, retrieve_roots=retrieve_roots, gen=token)
        yield _door_speak(hive, spoken, str(got.get("spoken") or ""), "pointer_click", retrieve_roots, gen=token, execution=got)
        return
    if not watch_on and screen_action and not explicit_browser and not _z02_click:
        receipt = {"ok": False, "reason": "desktop_not_armed", "action_issued": False,
                   "spoken": "Desktop is off. Enable Desktop in Orb so I can perform this action."}
        yield _door_speak(hive, spoken, receipt["spoken"], "watch", retrieve_roots,
                          gen=token, execution=receipt)
        return
    owns_watch = bool(
        watch_on
        and hasattr(PIPELINE, "watch_owns_turn")
        and PIPELINE.watch_owns_turn(spoken, watch_row)
    )
    if owns_watch and hasattr(PIPELINE, "run_watch_loop"):
        got = PIPELINE.run_watch_loop(
            spoken, hive=hive, talk_fn=talk_fn, see_fn=see_fn, gen=token
        )
        if (token is not None and hasattr(PIPELINE, "turn_cancelled") and PIPELINE.turn_cancelled(hive, token)) or (
            isinstance(got, dict) and got.get("cancelled")
        ):
            yield _turn_event(
                spoken="Stopped. Standing by.",
                verb="stop",
                host="local",
                wires=["stop"],
                spoken_delta="",
                gen=token,
            )
            return
        text = str(got.get("spoken") or "Watch is on.")
        yield _door_speak(hive, spoken, text, "watch", retrieve_roots, gen=token, execution=got)
        return
    if hasattr(PIPELINE, "wants_eyes") and PIPELINE.wants_eyes(spoken):
        bus = load_json(hive / "bus" / "state.json")
        eyes = bus.get("eyes") if isinstance(bus.get("eyes"), dict) else {}
        if eyes.get("path") and eyes.get("active") is not False:
            text = "Eyes still is on disk. I will use it as context."
        else:
            text = "Tap Eyes on the face to open the camera. I will not invent a frame."
        yield _door_speak(hive, spoken, text, "eyes", retrieve_roots, gen=token)
        return
    drop_bus = load_json(hive / "bus" / "state.json")
    drop = drop_bus.get("drop") if isinstance(drop_bus.get("drop"), dict) else {}
    drop_ask = re.search(
        r"\b(which file|what file|what did i (?:just )?drop)\b",
        spoken,
        re.I,
    )
    # A pin the ask already says is missing is not the file on the bus.
    pin_absent = bool(
        re.search(r"\bpin", spoken, re.I)
        and re.search(r"\b(?:did not|didn't|do not|don't|not)\s+pin\b", spoken, re.I)
        and not re.search(r"\bdrop", spoken, re.I)
    )
    if drop.get("name") and drop_ask and not pin_absent:
        text = f"You dropped {drop['name']}. It is on the bus. I did not run it."
        yield _door_speak(hive, spoken, text, "drop", retrieve_roots, gen=token)
        return

    if hasattr(PIPELINE, "wants_stand_down") and PIPELINE.wants_stand_down(spoken):
        got = PIPELINE.focus_stand_down(hive)
        yield _door_speak(hive, spoken, str(got.get("spoken") or ""), "focus", retrieve_roots, gen=token)
        return
    if hasattr(PIPELINE, "wants_relief") and PIPELINE.wants_relief(spoken):
        got = PIPELINE.focus_relief(hive)
        yield _door_speak(hive, spoken, str(got.get("spoken") or ""), "focus", retrieve_roots, gen=token)
        return
    focus_minutes = PIPELINE.wants_focus(spoken) if hasattr(PIPELINE, "wants_focus") else None
    if focus_minutes is not None:
        got = PIPELINE.focus_arm(hive, minutes=focus_minutes)
        yield _door_speak(hive, spoken, str(got.get("spoken") or ""), "focus", retrieve_roots, gen=token)
        return

    for out in PIPELINE.apply_pipeline_iter(
        spoken,
        hive=hive,
        retrieve_roots=retrieve_roots,
        cursor_fn=cursor_fn,
        see_fn=see_fn,
        status_fn=status_fn,
        cursor_ask_fn=cursor_ask_fn,
        talk_fn=talk_fn,
        login_fn=login_fn,
        gen=token,
    ):
        text = str(out.get("spoken") or "")
        if not text and not bool(out.get("partial")):
            text = DARK_BRAIN
        if is_ask_leak(text):
            text = DARK_BRAIN
        delta = str(out.get("spoken_delta") or "")
        if is_ask_leak(delta):
            delta = ""
        yield _turn_event(
            ok=bool(out.get("ok")),
            spoken=text,
            see=out.get("see"),
            mission=out if out.get("mission_id") else None,
            verb=str(out.get("verb") or out.get("tool") or "pipeline"),
            host="pipeline",
            cites=out.get("cites") or [],
            wires=out.get("wires") or ["pipeline"],
            args=out.get("args"),
            done=bool(out.get("done", True)),
            spoken_delta=delta,
            partial=bool(out.get("partial")),
            brain=out.get("brain"),
            login_tried=bool(out.get("login_tried")),
            model_available=out.get("model_available"),
            unknown=bool(out.get("unknown")),
            outcome=out.get("outcome") or out.get("status"),
            source=out.get("source"),
            gen=out.get("gen") or out.get("turn_gen") or token,
        )


_TURN_LOG = None


def _turn_log():
    global _TURN_LOG
    if _TURN_LOG is None:
        _TURN_LOG = _load_mod("agent_stack_turn_log", Path(__file__).resolve().parent.parent / "memory" / "turn_log.py")
    return _TURN_LOG


def _talk_records() -> tuple[dict, dict]:
    online = getattr(PIPELINE, "ONLINE", None) or ONLINE
    talk = getattr(online, "LAST_TALK", None) or {}
    inject = getattr(online, "LAST_INJECT", None) or {}
    return dict(talk), dict(inject)


_REFLEX = None


def _reflex(utterance: str) -> dict | None:
    """Z12: the five quick decisions for this utterance (numbers + lane name only, never text)."""
    global _REFLEX
    try:
        if _REFLEX is None:
            _REFLEX = _load_mod("agent_stack_reflex5", Path(__file__).resolve().parent.parent / "brain" / "reflex5.py")
        jevr = getattr(PIPELINE, "JEVR", None)
        return _REFLEX.decide(utterance, route=getattr(PIPELINE, "model_free_route", None),
                              lane_fn=getattr(jevr, "pick_skill", None))
    except Exception:  # noqa: BLE001
        return None


HEARTBEAT_SEC = float(os.environ.get("JARVIS_HEARTBEAT_SEC") or 8)
HEARTBEAT = "Still checking, sir; the wires are being fashionably slow."


def _placeholders(text: str, utterance: str) -> str:
    """Z67 (1ILap 5:14): in generated docs, a number Evens did not give becomes 'X', not an invented stat."""
    given = set(re.findall(r"\d[\d,.]*", utterance or ""))

    def sub(m):
        tok = m.group(0)
        if (m.start() and text[m.start() - 1] in "-_/") or re.match(r"[-_./]\w", text[m.end():m.end() + 2]):
            return tok  # part of a filename, path or id (20261013-153027-email.md)
        if tok.rstrip(".,") in {g.rstrip(".,") for g in given}:
            return tok
        if re.match(r"^\d{1,2}\.$", tok) and (m.start() == 0 or text[m.start() - 1] in "\n "):
            return tok  # list numbering
        if re.match(r"^(?:19|20)\d\d$", tok.rstrip(".,")):
            return tok  # years
        return ("$" if tok.startswith("$") else "") + "X" + ("%" if tok.endswith("%") else "")
    return re.sub(r"\$?\d[\d,.]*%?", sub, text)


def _redact(text: str) -> str:
    """The shared secret detector (brain/secret_patterns.py) for anything this module writes to disk or the bus."""
    try:
        return PIPELINE.hooks.redact(text) if hasattr(PIPELINE, "hooks") else text
    except Exception:  # noqa: BLE001
        return "[withheld]"


def _note_failure(where: str, exc: BaseException) -> None:
    """One metadata row for a swallowed error (where + type + redacted message), so a silent fallback is diagnosable."""
    try:
        d = PIPELINE.log_dir() if hasattr(PIPELINE, "log_dir") else Path(PIPELINE.ROOT) / "logs"
        d.mkdir(parents=True, exist_ok=True)
        with (d / "load-errors.jsonl").open("a", encoding="utf-8", errors="replace") as fh:
            fh.write(json.dumps({"ts": time.time(), "module": f"turn:{where}", "error": _redact(f"{type(exc).__name__}: {exc}")[:300],
                                 "swallowed": True}) + "\n")
    except Exception:  # noqa: BLE001
        pass


def _turn_crash_log(utterance: str, exc: BaseException) -> None:
    import hashlib
    import traceback
    try:
        p = (PIPELINE.log_dir() if hasattr(PIPELINE, "log_dir") else Path(PIPELINE.ROOT) / "logs") / "turn-errors.jsonl"
        p.parent.mkdir(parents=True, exist_ok=True)
        # Privacy audit 2026-10-16: the row kept the utterance and a traceback quoting document/JSON content; now a hash
        # of the utterance and a redacted error/trace.
        said = str(utterance or "")
        with p.open("a", encoding="utf-8", errors="replace") as fh:
            fh.write(json.dumps({"ts": time.time(), "utterance_sha256": hashlib.sha256(said.encode("utf-8", "replace")).hexdigest()[:16],
                                 "utterance_chars": len(said), "error": _redact(f"{type(exc).__name__}: {exc}")[:300],
                                 "trace": _redact("".join(traceback.format_exception(type(exc), exc, exc.__traceback__))[-2500:])}) + "\n")
    except Exception:  # noqa: BLE001
        pass


def _crash_fallback(utterance: str) -> dict | None:
    if os.environ.get("PYTEST_CURRENT_TEST") and not os.environ.get("JARVIS_TEST_CRASH_FALLBACK"):
        return None
    try:
        got = PIPELINE.online_talk(utterance, "Answer in one to three sentences. No tools, no files, no browser. "
                                   "If the request needs a tool you don't have, say so plainly.", talk_fn=None, hands=False)
        line = PIPELINE._speakable_line(PIPELINE._talk_speak(got))
    except Exception:  # noqa: BLE001
        return None
    if not line or line == getattr(PIPELINE, "TALK_DARK", ""):
        return None
    return _turn_event(spoken=line, verb="converse", host="pipeline", wires=["converse", "crash_fallback"], spoken_delta=line)


REPEAT_MIN_CHARS = 20
REPEAT_LINE = "Sorry, sir, I was about to repeat myself. Say that again and I will answer it properly."


def _is_honest_fixed_line(spoken: str) -> bool:
    return PIPELINE.TALK_DARK in spoken or bool(PIPELINE._only_honest_unknown(spoken))


def _is_repeat(spoken: str, previous: str, utterance: str, previous_utterance: str) -> bool:
    """True when a reply is Jarvis's last line word for word, given for a different ask."""
    norm = lambda t: re.sub(r"^sir\s+", "", re.sub(r"\s+", " ", re.sub(r"[^\w\s]", "", str(t or "").lower())).strip())
    a, b = norm(spoken), norm(previous)
    return len(a) >= REPEAT_MIN_CHARS and a == b and norm(utterance) != norm(previous_utterance)


def _previous_exchange(hive) -> tuple[str, str]:
    try:
        bus = PIPELINE.load_json(Path(hive) / "bus" / "state.json") or {}
    except (OSError, TypeError, ValueError):
        return "", ""
    return str(bus.get("spoken") or ""), str(bus.get("utterance") or "")


def apply_turn_iter(utterance: str, **kw):
    """The turn, then one JSONL log line when it finishes. Logging never breaks a turn."""
    import time as _time

    # Detect sensitive input before reflex cards, crash logs, or fallback calls.
    # Keep the original only for the dedicated local interceptor.
    _interceptor_input = utterance
    _secret_input = False
    try:
        _sc = PIPELINE._load("agent_stack_methods_config", PIPELINE.STACK / "hands" / "methods_config.py")
        _secret_input = _sc.find_secret(utterance or "") is not None
    except Exception as _exc:  # Mac load-errors 2026-10-16: this check failed open on every turn; fall back to the shared detector
        _note_failure("secret_precheck", _exc)
        try:
            _secret_input = PIPELINE.hooks._secret_patterns().has_secret(utterance or "")
        except Exception:  # noqa: BLE001 — both detectors load brain/secret_patterns.py; the hooks regex has no dependency
            try:
                _secret_input = bool(PIPELINE.hooks.SECRET_RE.search(utterance or ""))
            except Exception:  # noqa: BLE001
                _secret_input = True  # no detector at all: withhold rather than send
    if _secret_input:
        utterance = "[secret withheld]"
    started = _time.time()
    events: list[dict] = []
    first_ms = None
    reflex = None
    try:  # Z12: the five quick decisions are made BEFORE the answer and shown on the Orb with their ms (demo D5v4UuvtUXc 0:09)
        t0 = _time.perf_counter()
        reflex = _reflex(utterance)
        if isinstance(reflex, dict):
            reflex = dict(reflex, ms=round((_time.perf_counter() - t0) * 1000, 1))
            card = dict(reflex, ts=_time.time(), ask=_redact(str(utterance or ""))[:80])
            PIPELINE.mutate_bus(kw.get("hive") or HIVE, lambda bus: dict(bus, reflex=card))
        _lp = PIPELINE._load("agent_stack_lapse", PIPELINE.STACK / "hands" / "lapse.py")  # Z56: a new turn answers an open question
        PIPELINE.mutate_bus(kw.get("hive") or HIVE, _lp.answered)
    except Exception:  # noqa: BLE001
        pass
    gen_doc = bool(re.search(r"\b(?:write|draft|create|make|generate|rewrite)\b.{0,40}\b(?:bullets?|resume|summary|bio|post|doc(?:ument)?|proposal|landing page|copy|headline|email)\b", utterance or "", re.I))
    prev_line, prev_ask = _previous_exchange(kw.get("hive") or HIVE)

    def _inner():
        for val in _apply_turn_iter_inner(_interceptor_input, _sensitive=_secret_input, **kw):
            # The fixed honest lines (talk wire dark, nothing on disk) are correct for any ask; "say that again" would not help.
            if (isinstance(val, dict) and not val.get("partial") and val.get("verb") in ("converse", None)
                    and not _is_honest_fixed_line(str(val.get("spoken") or "")) and _is_repeat(str(val.get("spoken") or ""), prev_line, utterance, prev_ask)):
                val = dict(val, spoken=REPEAT_LINE, spoken_delta=REPEAT_LINE if val.get("spoken_delta") else val.get("spoken_delta"))
            if gen_doc and isinstance(val, dict) and not val.get("partial") and val.get("verb") in ("converse", "drafts", "think", None):
                val = dict(val, spoken=_placeholders(str(val.get("spoken") or ""), utterance))
            yield val
    try:
        try:
            for ev in _inner():
                if first_ms is None and isinstance(ev, dict) and str(ev.get("spoken_delta") or "").strip():
                    first_ms = int((_time.time() - started) * 1000)
                if isinstance(ev, dict) and not ev.get("partial"):
                    events.append(ev)
                yield ev
        except Exception as exc:  # noqa: BLE001
            # A crashed turn used to surface as "The talk wire is dark this turn." Log the real cause, then answer
            # through the plain talk wire (no tools; online_talk walks the primary + paid fallback models).
            _turn_crash_log(utterance, RuntimeError("Sensitive-input handler failed") if _secret_input else exc)
            if any(str(e.get("spoken") or "").strip() for e in events):
                raise
            fb = None if _secret_input else _crash_fallback(utterance)
            if not fb:
                raise
            events.append(fb)
            yield fb
    finally:
        try:
            log = _turn_log()
            if log.log_path() is not None:
                talk, inject = _talk_records()
                row = log.build_row(started=started, ended=_time.time(), events=events, talk=talk, inject=inject, first_ms=first_ms)
                rx = reflex if reflex is not None else _reflex(utterance)
                # Privacy (Mac review 2026-10-16): the matched vault note's title is note content; keep the score only.
                row["reflex"] = {k: v for k, v in rx.items() if k != "vault_note"} if isinstance(rx, dict) else rx
                log.append(row)
        except Exception:  # noqa: BLE001
            pass


def apply_turn(
    utterance: str,
    *,
    approved: bool = False,
    hive: Path = HIVE,
    speak: bool = False,
    retrieve_roots: list[Path] | None = None,
    grok=None,
    status_fn=None,
    cursor_fn=None,
    see_fn=None,
    cursor_ask_fn=None,
    talk_fn=None,
    login_fn=None,
) -> dict:
    last = _turn_event(spoken="", verb="idle", host="local")
    for ev in apply_turn_iter(
        utterance,
        approved=approved,
        hive=hive,
        retrieve_roots=retrieve_roots,
        grok=grok,
        status_fn=status_fn,
        cursor_fn=cursor_fn,
        see_fn=see_fn,
        cursor_ask_fn=cursor_ask_fn,
        talk_fn=talk_fn,
        login_fn=login_fn,
    ):
        last = ev
    if speak:
        speak_local(str(last.get("spoken") or ""))
    result = {
        "ok": bool(last.get("ok", True)),
        "verb": last.get("verb") or "pipeline",
        "ask": False,
        "spoken": last.get("spoken") or "",
        "host": last.get("host") or "pipeline",
        "args": last.get("args"),
        "cites": last.get("cites") or [],
        "wires": last.get("wires") or [],
        "brain": last.get("brain"),
        "login_tried": bool(last.get("login_tried")),
        "model_available": bool(last.get("model_available")),
        "unknown": bool(last.get("unknown")),
        "outcome": last.get("outcome"),
        "source": last.get("source"),
        "status": last.get("status") or last.get("outcome"),
    }
    for key in ("execution", "gen", "turn_gen", "mission_id", "task_verified"):
        if key in last:
            result[key] = last[key]
    return result


def self_test() -> dict:
    import tempfile

    canned_can = "I run the hive catalog here, not Grok Bot"
    leak = ("say yes", "Grok desk", "send this to the Grok", "May I hand this")

    def _no_ask(out: dict) -> bool:
        text = out.get("spoken") or ""
        return not out.get("ask") and not any(bit.lower() in text.lower() for bit in leak)

    def fake_cursor(prompt: str, mode: str = "ask", **kw):
        _ = (mode, kw)
        if prompt.strip().lower() == "send this email":
            return {
                "tool": "refuse_hard_step",
                "args": {},
                "speak": "I will send it now.",
            }
        return {
            "tool": "vault_read",
            "args": {"query": prompt[:80]},
            "speak": "From the store: I read the vault, look at Safari, ask the repo, or report status.",
        }

    with tempfile.TemporaryDirectory(prefix="agent-stack-mouth-") as tmp:
        hive = Path(tmp)
        vault = hive / "vault"
        vault.mkdir(parents=True)
        (vault / "OPERATOR_MEMORY.md").write_text(
            "# Operator Memory\n\nFour north stars start with maximum leverage, minimum noise.\n",
            encoding="utf-8",
        )
        (hive / "bus").mkdir(parents=True)
        empty = apply_turn("", hive=hive)
        if empty.get("verb") != "idle" or "Holding" not in (empty.get("spoken") or ""):
            return {"ok": False, "errors": ["empty must hold"], "got": empty}
        stopped = apply_turn("stop", hive=hive)
        if stopped.get("verb") != "stop" or "Stopped" not in (stopped.get("spoken") or ""):
            return {"ok": False, "errors": ["stop must stop"], "got": stopped}
        refused = apply_turn("send this email", hive=hive, cursor_fn=fake_cursor)
        if refused.get("verb") != "refuse_hard_step" or refused.get("ask"):
            return {"ok": False, "errors": ["send this email must propose, not send"], "got": refused}
        refused_spoken = refused.get("spoken") or ""
        if "your OK first" not in refused_spoken:  # Evens 10-15: kept stops ask for his OK in fixed words
            return {"ok": False, "errors": ["hard step must request the missing action details"], "got": refused}
        if "talk wire is dark" in refused_spoken.lower():
            return {"ok": False, "errors": ["hard step must not hide behind a provider failure"], "got": refused}
        can = apply_turn("What can you do?", hive=hive, retrieve_roots=[vault], cursor_fn=fake_cursor)
        if can.get("verb") == "can" or canned_can in (can.get("spoken") or ""):
            return {"ok": False, "errors": ["what can you do must not use canned can"], "got": can}
        if "store" not in (can.get("wires") or []) and "vault_read" not in (can.get("wires") or []):
            return {"ok": False, "errors": ["what can you do must hit store"], "got": can}
        if not _no_ask(can):
            return {"ok": False, "errors": ["pipeline leaked a desk ASK"], "got": can}
        if "XAI_API_KEY" in (can.get("spoken") or "") or "May I hand this" in (can.get("spoken") or ""):
            return {"ok": False, "errors": ["must not nag for xAI or hand to grok"], "got": can}
        token = PIPELINE.begin_turn(hive) if hasattr(PIPELINE, "begin_turn") else 1
        live = set_listen(hive, True, gen=token)
        if live.get("phase") != "listen" or live.get("mic") != "live":
            return {"ok": False, "errors": ["LIVE did not write listen"]}
        mute = set_listen(hive, False, gen=token)
        if mute.get("mic") != "mute":
            return {"ok": False, "errors": ["MUTE did not write mute"]}
        return {"ok": True, "errors": []}


def main() -> int:
    ap = argparse.ArgumentParser(description="Agent-stack mouth turn")
    ap.add_argument("utterance", nargs="?", default="")
    ap.add_argument("--approved", action="store_true")
    ap.add_argument("--speak", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--wires", action="store_true")
    args = ap.parse_args()
    if args.self_test or os.environ.get("AGENT_STACK_MOUTH_SELF_TEST") == "1":
        out = self_test()
        print(json.dumps(out, indent=2))
        return 0 if out.get("ok") else 2
    if args.wires:
        if ONLINE is None:
            print(json.dumps({"ok": False, "error": "online brain missing"}))
            return 2
        print(json.dumps(ONLINE.wire_report(), indent=2))
        return 0
    if not args.utterance:
        print(json.dumps({"ok": False, "error": "utterance required"}))
        return 2
    print(json.dumps(apply_turn(args.utterance, approved=args.approved, speak=args.speak), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


try:  # Z12: warm the vault note index at start so the first reflex can name a note
    import threading as _th
    _th.Thread(target=lambda: (_reflex("warm"), _REFLEX and _REFLEX._vault_index()), daemon=True).start()
except Exception:  # noqa: BLE001
    pass
