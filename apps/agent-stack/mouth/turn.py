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


def _load_mod(name: str, path: Path):
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
) -> dict:
    path = hive / "bus" / "state.json"
    bus = load_json(path)
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
    write_json(path, bus)
    return bus


def set_listen(hive: Path, live: bool) -> dict:
    """Face owns the mic. LIVE writes listen; MUTE returns to idle."""
    path = hive / "bus" / "state.json"
    bus = load_json(path)
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
    write_json(path, bus)
    return bus


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
) -> dict:
    return {
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
    }


def _door_speak(hive: Path, utterance: str, spoken: str, verb: str) -> dict:
    bus = load_json(hive / "bus" / "state.json")
    prior = PIPELINE.load_turns(bus)
    next_turns = prior if verb == "idle" else PIPELINE.append_turn(prior, utterance, spoken)
    bus_write(
        hive,
        phase="speak",
        job_status="done",
        utterance=utterance,
        permission_ask=None,
        spoken=spoken,
        wires=[verb],
        turns=next_turns,
    )
    return _turn_event(spoken=spoken, verb=verb, host="local", wires=[verb], spoken_delta=spoken)


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
):
    _ = (approved, grok)
    spoken = (utterance or "").strip()
    bus_now = load_json(hive / "bus" / "state.json")
    if scrub_bus_ask(bus_now):
        write_json(hive / "bus" / "state.json", bus_now)

    if not spoken:
        yield _door_speak(hive, spoken, "Holding. Say Jarvis, or tap Space.", "idle")
        return
    if STOP_RE.match(spoken):
        if ONLINE is not None and hasattr(ONLINE, "cancel_cursor"):
            ONLINE.cancel_cursor()
        yield _door_speak(hive, spoken, "Stopped. Standing by.", "stop")
        return
    if PIPELINE.is_hard_step(spoken):
        out = PIPELINE.apply_pipeline(
            spoken,
            hive=hive,
            retrieve_roots=retrieve_roots,
            cursor_fn=cursor_fn,
            see_fn=see_fn,
            status_fn=status_fn,
            cursor_ask_fn=cursor_ask_fn,
        )
        text = str(out.get("spoken") or PIPELINE.PROPOSAL)
        yield _turn_event(
            spoken=text,
            verb="refuse_hard_step",
            host="pipeline",
            cites=out.get("cites") or [],
            wires=out.get("wires") or ["refuse_hard_step"],
            args=out.get("args"),
            spoken_delta=text,
        )
        return

    out = PIPELINE.apply_pipeline(
        spoken,
        hive=hive,
        retrieve_roots=retrieve_roots,
        cursor_fn=cursor_fn,
        see_fn=see_fn,
        status_fn=status_fn,
        cursor_ask_fn=cursor_ask_fn,
    )
    text = str(out.get("spoken") or DARK_BRAIN)
    if is_ask_leak(text):
        text = DARK_BRAIN
    yield _turn_event(
        spoken=text,
        verb=str(out.get("verb") or out.get("tool") or "pipeline"),
        host="pipeline",
        cites=out.get("cites") or [],
        wires=out.get("wires") or ["pipeline"],
        args=out.get("args"),
        spoken_delta=text,
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
        live = set_listen(hive, True)
        if live.get("phase") != "listen" or live.get("mic") != "live":
            return {"ok": False, "errors": ["LIVE did not write listen"]}
        mute = set_listen(hive, False)
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
