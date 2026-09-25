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
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
STOP_RE = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?(stop|cancel|never mind|forget it|shut up)\s*[.!]?\s*$",
    re.I,
)
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
# One path for these verbs. No button per verb.
HIGH_VERBS = ("work", "delegate", "remember", "research", "act", "create", "brief", "review", "continue")
GOAL_LEAD_RE = re.compile(
    r"^(?:please\s+)?(?:hey\s+)?(?:jarvis[,.\s]+)?("
    + "|".join(HIGH_VERBS)
    + r")\b[:\s,.-]*(.*)$",
    re.I,
)
OUTCOME_RE = re.compile(
    r"\b(?:i want|the outcome is|the goal is|until|finish|so that)\b[:\s]*(.+)$",
    re.I,
)
MORNING_RE = re.compile(
    r"\b(?:what should i work on|what do i work on)\b",
    re.I,
)
GREETING_RE = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?good morning\s*[.!]?\s*$",
    re.I,
)
CONTINUE_RE = re.compile(
    r"^(?:please\s+)?(?:keep going|carry on|go on|resume|continue(?:\s+that|\s+the goal)?)\s*[.!]?\s*$",
    re.I,
)
UNBOUNDED_RE = re.compile(
    r"\b(?:everything|whatever|the whole (?:company|os|system)|all of it|someday|in general|be better|improve things)\b",
    re.I,
)
AGENT_MENU_RE = re.compile(
    r"name the desk|which agent|which desk|pick (?:an?|the) (?:agent|worker|desk)|"
    r"choose (?:an?|the) (?:agent|worker|desk)|forge,\s*watchdog|"
    r"who should (?:do|take)|you wake it",
    re.I,
)
CONTROL_PLANE_RE = re.compile(
    r"\b(?:WAIT_EVENS|PARTIAL|READY_FOR_AUTHORITY|ROOT_CAUSE_FOUND|not on disk)\b",
    re.I,
)
_CONTEXT_STOP = {
    "that",
    "this",
    "with",
    "from",
    "into",
    "until",
    "about",
    "please",
    "jarvis",
    "goal",
    "work",
    "once",
    "says",
}


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
                "cites": cites or [],
                "wires": wires or [],
                "updated_at": now_iso(),
            }
        )
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
    verb: str,
    host: str,
    cites: list | None = None,
    wires: list | None = None,
    args=None,
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
) -> dict:
    ev = {
        "ok": True,
        "verb": verb,
        "ask": False,
        "spoken": spoken,
        "host": host,
        "args": args,
        "cites": cites or [],
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
    if gen is not None:
        ev["gen"] = int(gen)
        ev["turn_gen"] = int(gen)
    return ev


def _door_speak(
    hive: Path,
    utterance: str,
    spoken: str,
    verb: str,
    retrieve_roots: list[Path] | None = None,
    gen: int | None = None,
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
    bus_write(
        hive,
        phase="speak",
        job_status="done",
        utterance=utterance,
        permission_ask=None,
        spoken=text,
        wires=[verb],
        turns=next_turns,
        gen=gen,
    )
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
    return _turn_event(
        spoken=text, verb=verb, host="local", wires=[verb], spoken_delta=text, gen=gen
    )


def _content_tokens(text: str) -> set[str]:
    return {
        word
        for word in re.findall(r"[a-z0-9']{4,}", (text or "").lower())
        if word not in _CONTEXT_STOP
    }


def outcome_is_bounded(outcome: str) -> bool:
    """A finish you can keep going on. Open-ended wishes stay unbounded."""
    text = (outcome or "").strip()
    if len(text) < 8 or UNBOUNDED_RE.search(text):
        return False
    if re.search(r"\b(?:until|once|one sentence|the \w+)\b", text, re.I):
        return True
    return len(_content_tokens(text)) >= 2


def recover_context(bus: dict, outcome: str) -> list[str]:
    """Prior lines on this bus that share the outcome. Not a second memory."""
    want = _content_tokens(outcome)
    turns = bus.get("turns") if isinstance(bus.get("turns"), list) else []
    found: list[str] = []
    for row in reversed(turns):
        if not isinstance(row, dict):
            continue
        line = str(row.get("user") or "").strip()
        if line and want and (_content_tokens(line) & want) and line not in found:
            found.append(line)
        if len(found) >= 3:
            break
    goal = bus.get("active_goal") if isinstance(bus.get("active_goal"), dict) else {}
    prior = goal.get("context") if isinstance(goal.get("context"), list) else []
    for line in prior:
        text = str(line or "").strip()
        if text and text not in found:
            found.append(text)
        if len(found) >= 3:
            break
    return found[:3]


def classify_utterance(utterance: str, bus: dict | None = None) -> dict:
    """Ordinary talk stays ordinary. A goal names an outcome. Verbs share this path."""
    heard = (utterance or "").strip()
    goal = (bus or {}).get("active_goal") if isinstance((bus or {}).get("active_goal"), dict) else {}
    held = str(goal.get("outcome") or "").strip()
    bounded = bool(goal.get("bounded"))
    if GREETING_RE.match(heard) or MORNING_RE.search(heard):
        return {
            "kind": "morning",
            "verb": "brief",
            "outcome": held,
            "bounded": bounded,
            "attach_mission": False,
        }
    if CONTINUE_RE.match(heard):
        return {
            "kind": "continue",
            "verb": "continue",
            "outcome": held,
            "bounded": bounded,
            "attach_mission": False,
        }
    lead = GOAL_LEAD_RE.match(heard)
    if lead:
        verb = lead.group(1).lower()
        rest = (lead.group(2) or "").strip().rstrip(".")
        if verb == "continue":
            if rest and not held:
                return {
                    "kind": "goal",
                    "verb": "continue",
                    "outcome": rest,
                    "bounded": outcome_is_bounded(rest),
                    "attach_mission": True,
                }
            return {
                "kind": "continue",
                "verb": "continue",
                "outcome": held,
                "bounded": bounded,
                "attach_mission": False,
            }
        if verb == "brief":
            return {
                "kind": "brief",
                "verb": "brief",
                "outcome": held,
                "bounded": bounded,
                "attach_mission": False,
            }
        if verb == "remember":
            return {
                "kind": "remember",
                "verb": "remember",
                "outcome": held,
                "note": rest or heard,
                "bounded": bounded,
                "attach_mission": False,
            }
        if verb in HIGH_VERBS and rest:
            return {
                "kind": "goal",
                "verb": verb,
                "outcome": rest,
                "bounded": outcome_is_bounded(rest),
                "attach_mission": True,
            }
    found = OUTCOME_RE.search(heard)
    if found:
        rest = found.group(1).strip().rstrip(".")
        if rest:
            return {
                "kind": "goal",
                "verb": "work",
                "outcome": rest,
                "bounded": outcome_is_bounded(rest),
                "attach_mission": True,
            }
    return {
        "kind": "ordinary",
        "verb": "converse",
        "outcome": held,
        "bounded": bounded,
        "attach_mission": False,
    }


def _matrix_mission(decision: dict) -> dict:
    return {
        "kind": "matrix",
        "outcome": decision.get("outcome") or "",
        "verb": decision.get("verb") or "work",
        "bounded": bool(decision.get("bounded")),
        "owner": "native",
    }


def apply_intent(hive: Path, utterance: str) -> dict:
    """Keep one active goal on the bus. Attach a Matrix mission only for a goal."""
    bus = load_json(hive / "bus" / "state.json")
    decision = classify_utterance(utterance, bus)

    def apply(current: dict) -> dict:
        goal = current.get("active_goal") if isinstance(current.get("active_goal"), dict) else {}
        kind = decision["kind"]
        if kind == "ordinary" or kind == "morning":
            current["intent"] = {"kind": kind, "verb": decision["verb"], "mission": None}
            return current
        if kind == "remember":
            ctx = [str(line) for line in (goal.get("context") or []) if str(line).strip()]
            note = str(decision.get("note") or "").strip()
            if note and note not in ctx:
                ctx.append(note)
            kept = dict(goal)
            kept["context"] = ctx[-3:]
            kept["verb"] = "remember"
            kept["mission"] = goal.get("mission")
            current["active_goal"] = kept
            current["intent"] = {"kind": "remember", "verb": "remember", "mission": None}
            return current
        if kind == "brief":
            current["intent"] = {"kind": "brief", "verb": "brief", "mission": None}
            return current
        if kind == "continue":
            current["intent"] = {
                "kind": "continue",
                "verb": "continue",
                "mission": goal.get("mission"),
            }
            if goal:
                current["active_goal"] = goal
            return current
        if kind == "goal":
            ctx = recover_context(current, str(decision.get("outcome") or ""))
            mission = _matrix_mission(decision) if decision.get("attach_mission") else None
            current["active_goal"] = {
                "outcome": decision.get("outcome") or "",
                "bounded": bool(decision.get("bounded")),
                "verb": decision.get("verb") or "work",
                "context": ctx,
                "mission": mission,
            }
            current["intent"] = {"kind": "goal", "verb": decision.get("verb"), "mission": mission}
            return current
        return current

    PIPELINE.mutate_bus(hive, apply)
    return decision


def _continue_line(outcome: str, *, resumed: bool) -> str:
    text = (outcome or "").strip().rstrip(".")
    if resumed:
        return f"Still on it. The outcome is {text}."
    return f"Continuing. The outcome is {text}."


def _needs_human_line(text: str, decision: dict) -> bool:
    heard = text or ""
    if AGENT_MENU_RE.search(heard) or CONTROL_PLANE_RE.search(heard):
        return True
    if decision.get("kind") in {"goal", "continue"} and decision.get("bounded"):
        if not heard.strip() or heard.strip() == DARK_BRAIN or "UNKNOWN" in heard:
            return True
    return False


def _human_line(decision: dict) -> str:
    outcome = str(decision.get("outcome") or "").strip()
    kind = decision.get("kind")
    if kind in {"goal", "continue"} and decision.get("bounded") and outcome:
        return _continue_line(outcome, resumed=kind == "continue")
    if outcome:
        return f"The outcome is {outcome}."
    return "Nothing is waiting on you."


def _scrub_agent_choice(text: str, decision: dict) -> str:
    if _needs_human_line(text, decision):
        return _human_line(decision)
    return text


def _rewrite_spoken(hive: Path, text: str) -> None:
    def apply(bus: dict) -> dict:
        bus["spoken"] = text
        turns = bus.get("turns") if isinstance(bus.get("turns"), list) else None
        if turns and isinstance(turns[-1], dict):
            turns[-1]["jarvis"] = text
            bus["turns"] = turns
        return bus

    PIPELINE.mutate_bus(hive, apply)


def apply_turn_iter(
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
):
    _ = (approved, grok)
    spoken = (utterance or "").strip()
    PIPELINE.mutate_bus(hive, lambda bus: (scrub_bus_ask(bus) or True) and bus)

    if not spoken:
        yield _door_speak(hive, spoken, "Holding. Say Jarvis, or tap Space.", "idle", retrieve_roots)
        return
    if STOP_RE.match(spoken):
        if ONLINE is not None and hasattr(ONLINE, "cancel_cursor"):
            ONLINE.cancel_cursor()
        if VOICE is not None and hasattr(VOICE, "cancel_tts"):
            VOICE.cancel_tts()
        stop_gen = PIPELINE.cancel_turn(hive) if hasattr(PIPELINE, "cancel_turn") else None
        yield _door_speak(
            hive, spoken, "Stopped. Standing by.", "stop", retrieve_roots, gen=stop_gen
        )
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
    if PIPELINE.is_hard_step(spoken):
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
            yield _turn_event(
                spoken=text,
                verb="refuse_hard_step",
                host="pipeline",
                cites=out.get("cites") or [],
                wires=out.get("wires") or ["refuse_hard_step"],
                args=out.get("args"),
                done=bool(out.get("done", True)),
                spoken_delta=str(out.get("spoken_delta") or ""),
                partial=bool(out.get("partial")),
                gen=out.get("gen") or out.get("turn_gen") or token,
            )
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
    if verbal_watch and not watch_on:
        yield _door_speak(
            hive,
            spoken,
            "Watch is off. Tap Watch on the face.",
            "watch",
            retrieve_roots,
            gen=token,
        )
        return
    if verbal_watch and watch_on:
        yield _door_speak(
            hive,
            spoken,
            "Watch is on. Switch to the app you want me to use, then tell me.",
            "watch",
            retrieve_roots,
            gen=token,
        )
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
        yield _door_speak(hive, spoken, text, "watch", retrieve_roots, gen=token)
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

    decision = apply_intent(hive, spoken)
    if decision["kind"] == "morning" and GREETING_RE.match(spoken):
        yield _door_speak(hive, spoken, "Good morning.", "converse", retrieve_roots, gen=token)
        return
    if decision["kind"] == "morning":
        line = _human_line(decision)
        yield _door_speak(hive, spoken, line, "brief", retrieve_roots, gen=token)
        return
    if decision["kind"] == "brief":
        line = _human_line(decision)
        yield _door_speak(hive, spoken, line, "brief", retrieve_roots, gen=token)
        return
    if decision["kind"] == "remember":
        line = "I'll keep that with the outcome." if decision.get("outcome") else "I'll keep that."
        yield _door_speak(hive, spoken, line, "remember", retrieve_roots, gen=token)
        return
    if decision["kind"] == "continue" and not decision.get("outcome"):
        yield _door_speak(hive, spoken, "No outcome is active.", "continue", retrieve_roots, gen=token)
        return
    if decision["kind"] == "goal" and not decision.get("bounded"):
        yield _door_speak(
            hive,
            spoken,
            "What does finished look like?",
            str(decision.get("verb") or "work"),
            retrieve_roots,
            gen=token,
        )
        return
    if decision["kind"] == "continue" and not decision.get("bounded"):
        yield _door_speak(hive, spoken, "What does finished look like?", "continue", retrieve_roots, gen=token)
        return

    work = spoken
    if decision["kind"] in {"goal", "continue"} and decision.get("bounded") and decision.get("outcome"):
        work = (
            "Continue this outcome yourself. Do not ask which agent. Outcome: "
            + str(decision["outcome"])
        )
    for out in PIPELINE.apply_pipeline_iter(
        work,
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
        held = decision["kind"] in {"goal", "continue"} and bool(decision.get("bounded"))
        if held:
            text = _scrub_agent_choice(text, decision)
            if delta:
                delta = _scrub_agent_choice(delta, decision)
            if bool(out.get("done", True)):
                _rewrite_spoken(hive, text)
        verb = (
            str(decision.get("verb") or "work")
            if held
            else str(out.get("verb") or out.get("tool") or "pipeline")
        )
        wires = list(out.get("wires") or ["pipeline"])
        if held and verb not in wires:
            wires.append(verb)
        if held and decision.get("attach_mission") and "matrix" not in wires:
            wires.append("matrix")
        yield _turn_event(
            spoken=text,
            verb=verb,
            host="pipeline",
            cites=out.get("cites") or [],
            wires=wires,
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
    return {
        "ok": True,
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


def self_test() -> dict:
    import tempfile

    canned_can = "I run the hive catalog here, not Grok Bot"
    leak = ("say yes", "Grok desk", "send this to the Grok", "May I hand this")

    def _no_ask(out: dict) -> bool:
        text = out.get("spoken") or ""
        return not out.get("ask") and not any(bit.lower() in text.lower() for bit in leak)

    def fake_cursor(prompt: str, mode: str = "ask", **kw):
        _ = (mode, kw)
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
        refused = apply_turn("send this email", hive=hive)
        if refused.get("verb") != "refuse_hard_step" or refused.get("ask"):
            return {"ok": False, "errors": ["send this email must propose, not send"], "got": refused}
        if "Proposal only" not in (refused.get("spoken") or ""):
            return {"ok": False, "errors": ["hard step must speak a proposal"], "got": refused}
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

        def _seed(bus: dict) -> dict:
            bus["turns"] = [{"user": "the hero must say the offer", "jarvis": "Noted."}]
            return bus

        PIPELINE.mutate_bus(hive, _seed)

        def menu_talk(prompt: str, pack: str = "", **kw):
            _ = (prompt, pack, kw)
            return {
                "ok": True,
                "spoken": "Name the desk: Forge, Watchdog, Researcher, HITL, or Comms.",
                "wire": "xai",
                "engine": "xai",
            }

        goal = apply_turn(
            "Work until the hero says the offer in one sentence.",
            hive=hive,
            talk_fn=menu_talk,
        )
        bus = load_json(hive / "bus" / "state.json")
        active = bus.get("active_goal") if isinstance(bus.get("active_goal"), dict) else {}
        mission = active.get("mission") if isinstance(active.get("mission"), dict) else {}
        if mission.get("kind") != "matrix" or mission.get("owner") != "native":
            return {"ok": False, "errors": ["bounded goal must attach one native matrix mission"], "got": active}
        if "hero" not in str(active.get("outcome") or "").lower():
            return {"ok": False, "errors": ["bounded goal must keep the outcome"], "got": active}
        if not any("hero" in str(line).lower() for line in (active.get("context") or [])):
            return {"ok": False, "errors": ["bounded goal must recover context"], "got": active}
        if AGENT_MENU_RE.search(goal.get("spoken") or "") or goal.get("ask"):
            return {"ok": False, "errors": ["bounded goal must not ask Evens to choose an agent"], "got": goal}
        if goal.get("verb") != "work":
            return {"ok": False, "errors": ["work stays on the turn path"], "got": goal}
        morning = apply_turn("good morning", hive=hive)
        bus = load_json(hive / "bus" / "state.json")
        still = bus.get("active_goal") if isinstance(bus.get("active_goal"), dict) else {}
        if (still.get("mission") or {}).get("kind") != "matrix":
            return {"ok": False, "errors": ["ordinary greeting must leave the mission"], "got": still}
        if "mission" in (morning.get("wires") or []):
            return {"ok": False, "errors": ["ordinary greeting must not attach a mission"], "got": morning}
        again = apply_turn("continue", hive=hive, talk_fn=menu_talk)
        bus = load_json(hive / "bus" / "state.json")
        kept = bus.get("active_goal") if isinstance(bus.get("active_goal"), dict) else {}
        if kept.get("outcome") != active.get("outcome"):
            return {"ok": False, "errors": ["continue must keep the active goal"], "got": kept}
        if AGENT_MENU_RE.search(again.get("spoken") or ""):
            return {"ok": False, "errors": ["continue must not ask for an agent"], "got": again}
        if again.get("verb") != "continue":
            return {"ok": False, "errors": ["continue stays on the turn path"], "got": again}
        remembered = apply_turn("remember the offer is one sentence", hive=hive)
        bus = load_json(hive / "bus" / "state.json")
        noted = bus.get("active_goal") if isinstance(bus.get("active_goal"), dict) else {}
        if not any("one sentence" in str(line).lower() for line in (noted.get("context") or [])):
            return {"ok": False, "errors": ["remember keeps the note on the active goal"], "got": noted}
        if (noted.get("mission") or {}).get("outcome") != (kept.get("mission") or {}).get("outcome"):
            return {"ok": False, "errors": ["remember must not attach a new mission"], "got": noted}
        briefed = apply_turn("brief", hive=hive)
        if CONTROL_PLANE_RE.search(briefed.get("spoken") or ""):
            return {"ok": False, "errors": ["brief must not speak a control-plane label"], "got": briefed}
        asked = apply_turn("what should I work on this morning?", hive=hive)
        if CONTROL_PLANE_RE.search(asked.get("spoken") or "") or AGENT_MENU_RE.search(asked.get("spoken") or ""):
            return {"ok": False, "errors": ["a morning question stays a human sentence"], "got": asked}
        delegated = apply_turn("delegate the whole company", hive=hive)
        if AGENT_MENU_RE.search(delegated.get("spoken") or ""):
            return {"ok": False, "errors": ["delegate must not offer a desk menu"], "got": delegated}
        if "finished" not in (delegated.get("spoken") or "").lower():
            return {"ok": False, "errors": ["an unbounded goal asks for a finish"], "got": delegated}
        for verb in ("research", "act", "create", "review"):
            sample = classify_utterance(f"{verb} the hero sentence until it is one line", {})
            if sample.get("kind") != "goal" or sample.get("verb") != verb or not sample.get("attach_mission"):
                return {"ok": False, "errors": [f"{verb} must stay a goal on this path"], "got": sample}
            if not sample.get("bounded"):
                return {"ok": False, "errors": [f"{verb} with a finish must be bounded"], "got": sample}
        plain = classify_utterance("thanks", {"active_goal": active})
        if plain.get("kind") != "ordinary" or plain.get("attach_mission"):
            return {"ok": False, "errors": ["thanks stays ordinary conversation"], "got": plain}
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
