#!/usr/bin/env python3
"""One Jarvis pipeline. Input → full context file → one Cursor pick → one tool.

The model chooses vault_read / safari_see / cursor_ask / status / refuse_hard_step.
Hard steps stay a spoken proposal. No classify-as-brain. No truncated argv prompt.
Grok Bot is a desk, not the mouth. call_grokbot stays unused here.
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
STACK = HERE.parent
ROOT = HERE.parents[2]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
PACK_NAME = "pipeline-pack.md"
TOOLS = ("vault_read", "safari_see", "cursor_ask", "status", "refuse_hard_step")
HARD_TOOLS = frozenset({"send", "pay", "deploy", "book", "publish", "refuse_hard_step"})
HARD_STEP_RE = re.compile(
    r"\b("
    r"send (this|that|the|an?)\s+(email|message|invoice|payment|sms|text)|"
    r"send an? (email|invoice|payment|sms)|"
    r"pay (this|that|the|an?|him|her|them)\b|"
    r"deploy (this|that|it|to|now|prod)|"
    r"book (a|the|this|me)\b|"
    r"publish (this|that|the|it|now)"
    r")",
    re.I,
)
JSON_RE = re.compile(r"\{.*\}", re.S)
UNKNOWN = "UNKNOWN. Cursor harness returned no reply."
LOGIN_UNKNOWN = (
    "UNKNOWN. Cursor agent needs a one-time login. "
    "Run agent login in Terminal. Not an xAI key."
)
PROPOSAL = (
    "Proposal only. I will not send, pay, deploy, book, or publish. "
    "That hard step stays with you."
)
MAX_TURNS = 8


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


STORE = _load("agent_stack_store", STACK / "memory" / "store.py")
RETRIEVE = _load("agent_stack_retrieve", STACK / "memory" / "retrieve.py")
LAST_WIRE = _load("agent_stack_last_wire", STACK / "memory" / "last_wire.py")
PERSONA = _load("agent_stack_persona", STACK / "mouth" / "persona.py")
SEE = _load("agent_stack_see", STACK / "hands" / "see.py")
ONLINE = _load("agent_stack_online", HERE / "online.py")


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def is_hard_step(text: str) -> bool:
    return bool(HARD_STEP_RE.search(text or ""))


def load_turns(bus: dict) -> list[dict]:
    raw = bus.get("turns") if isinstance(bus, dict) else None
    if not isinstance(raw, list):
        return []
    out: list[dict] = []
    for row in raw:
        if not isinstance(row, dict):
            continue
        user = str(row.get("user") or "").strip()
        jarvis = str(row.get("jarvis") or "").strip()
        if user or jarvis:
            out.append({"user": user, "jarvis": jarvis})
    return out[-MAX_TURNS:]


def append_turn(turns: list[dict], user: str, jarvis: str) -> list[dict]:
    next_turns = list(turns)
    next_turns.append({"user": (user or "").strip(), "jarvis": (jarvis or "").strip()})
    return next_turns[-MAX_TURNS:]


def write_bus(
    hive: Path,
    *,
    phase: str,
    job_status: str,
    utterance: str,
    spoken: str | None,
    cites: list | None = None,
    wires: list | None = None,
    turns: list | None = None,
    tool: str | None = None,
) -> dict:
    path = hive / "bus" / "state.json"
    bus = load_json(path)
    bus.update(
        {
            "schema_version": 1,
            "phase": phase,
            "job_status": job_status,
            "utterance": utterance,
            "permission_ask": None,
            "spoken": spoken,
            "cites": cites or [],
            "wires": wires or [],
            "tool": tool,
            "updated_at": now_iso(),
        }
    )
    if turns is not None:
        bus["turns"] = turns
    elif "turns" not in bus:
        bus["turns"] = []
    write_json(path, bus)
    return bus


def pack_path_for(hive: Path) -> Path:
    return hive / "bus" / PACK_NAME


def assemble_pack(
    utterance: str,
    *,
    hive: Path,
    retrieve_roots: list[Path] | None,
    turns: list[dict],
) -> str:
    """Full context. Written to a file. Never stuffed into a truncated argv prompt."""
    lines = [
        "Jarvis pipeline pack. Read this file. Reply with one JSON tool pick.",
        f"Utterance: {(utterance or '').strip()}",
        "",
    ]
    if STORE is not None:
        lines.append(STORE.store_pack(hive, live_sessions=retrieve_roots is None))
        lines.append("")
    if RETRIEVE is not None:
        roots = retrieve_roots if retrieve_roots is not None else RETRIEVE.resolve_roots()
        files = RETRIEVE.candidate_files(roots)
        lines.append("Vault allow-list:")
        if files:
            for path in files[:24]:
                try:
                    rel = path.name
                    for root in roots:
                        try:
                            rel = str(path.relative_to(root))
                            break
                        except ValueError:
                            continue
                    lines.append(f"- {rel}")
                except (OSError, ValueError):
                    lines.append(f"- {path}")
        else:
            lines.append("- (none on disk)")
        lines.append("")
    if LAST_WIRE is not None:
        last = LAST_WIRE.read(hive)
        lines.append("Last wire:")
        lines.append(json.dumps(last or {}, ensure_ascii=True))
        lines.append("")
    bus = load_json(hive / "bus" / "state.json")
    lines.append("Bus:")
    lines.append(
        json.dumps(
            {
                "phase": bus.get("phase"),
                "job_status": bus.get("job_status"),
                "utterance": bus.get("utterance"),
            },
            ensure_ascii=True,
        )
    )
    lines.append("")
    if turns:
        lines.append("Recent conversation:")
        for row in turns:
            if row.get("user"):
                lines.append(f"Evens: {row['user']}")
            if row.get("jarvis"):
                lines.append(f"Jarvis: {row['jarvis']}")
        lines.append("")
    lines.append(
        "Pick exactly one tool. JSON only: "
        '{"tool":"vault_read"|"safari_see"|"cursor_ask"|"status"|"refuse_hard_step","args":{},"speak":""}'
    )
    return "\n".join(lines).rstrip() + "\n"


def write_pack(
    utterance: str,
    *,
    hive: Path,
    retrieve_roots: list[Path] | None,
    turns: list[dict],
) -> Path:
    dest = pack_path_for(hive)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(
        assemble_pack(utterance, hive=hive, retrieve_roots=retrieve_roots, turns=turns),
        encoding="utf-8",
    )
    return dest


def pick_prompt(pack_path: Path, utterance: str) -> str:
    return (
        "Read the full context pack at this path. Do not guess the file.\n"
        f"{pack_path}\n"
        "Use that pack, not a truncated prompt.\n"
        f"Utterance: {(utterance or '').strip()}\n"
        "Reply with JSON only, no markdown, no extra prose:\n"
        '{"tool":"vault_read"|"safari_see"|"cursor_ask"|"status"|"refuse_hard_step","args":{},"speak":""}\n'
    )


def extract_pick(raw) -> dict | None:
    if isinstance(raw, dict) and raw.get("tool") in TOOLS:
        args = raw.get("args") if isinstance(raw.get("args"), dict) else {}
        return {
            "tool": raw["tool"],
            "args": args,
            "speak": str(raw.get("speak") or ""),
        }
    text = raw if isinstance(raw, str) else str((raw or {}).get("spoken") or "")
    blob = (text or "").strip()
    if not blob:
        return None
    if blob.startswith("```"):
        blob = re.sub(r"^```(?:json)?\s*", "", blob)
        blob = re.sub(r"\s*```$", "", blob)
    match = JSON_RE.search(blob)
    if not match:
        return None
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict) or data.get("tool") not in TOOLS:
        return None
    args = data.get("args") if isinstance(data.get("args"), dict) else {}
    return {"tool": data["tool"], "args": args, "speak": str(data.get("speak") or "")}


def _invoke_cursor(fn, prompt: str):
    try:
        return fn(prompt, mode="ask")
    except TypeError:
        try:
            return fn(prompt)
        except TypeError:
            return fn(prompt, "")


def live_cursor(prompt: str) -> dict:
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return {"ok": False, "unknown": True, "spoken": UNKNOWN, "wire": "cursor"}
    if ONLINE is None or not hasattr(ONLINE, "call_cursor_turn"):
        return {"ok": False, "unknown": True, "spoken": UNKNOWN, "wire": "cursor"}
    return ONLINE.call_cursor_turn(prompt, mode="ask")


def as_cursor_event(raw) -> dict:
    if isinstance(raw, dict):
        return raw
    return {"spoken": str(raw or "")}


def is_dark_cursor(got) -> bool:
    """True when the harness already failed. Do not loop agent -p."""
    ev = as_cursor_event(got)
    if ev.get("unknown"):
        return True
    spoken = str(ev.get("spoken") or "")
    if ONLINE is not None and hasattr(ONLINE, "cursor_login_error") and ONLINE.cursor_login_error(spoken):
        return True
    return spoken.upper().startswith("UNKNOWN")


def miss_spoken(got) -> str:
    ev = as_cursor_event(got)
    spoken = str(ev.get("spoken") or "").strip()
    if spoken:
        return spoken
    if ev.get("unknown"):
        if ONLINE is not None and hasattr(ONLINE, "LOGIN_UNKNOWN"):
            return str(ONLINE.LOGIN_UNKNOWN)
        return LOGIN_UNKNOWN
    return UNKNOWN


def cursor_pick(pack_path: Path, utterance: str, cursor_fn) -> tuple[dict | None, dict]:
    prompt = pick_prompt(pack_path, utterance)
    fn = cursor_fn or live_cursor
    got = as_cursor_event(_invoke_cursor(fn, prompt))
    pick = extract_pick(got)
    if pick is not None:
        return pick, got
    if is_dark_cursor(got):
        return None, got
    got = as_cursor_event(_invoke_cursor(fn, prompt + "\nJSON only. Retry."))
    return extract_pick(got), got


def _evidence_line(speak: str, evidence: str) -> str:
    speak = (speak or "").strip()
    evidence = (evidence or "").strip()
    if speak and evidence and evidence not in speak:
        return f"{speak} {evidence}"
    return speak or evidence or UNKNOWN


def run_tool(
    pick: dict,
    utterance: str,
    *,
    hive: Path,
    retrieve_roots: list[Path] | None,
    see_fn=None,
    status_fn=None,
    cursor_ask_fn=None,
    sent: list | None = None,
) -> dict:
    tool = str(pick.get("tool") or "")
    args = pick.get("args") if isinstance(pick.get("args"), dict) else {}
    speak = str(pick.get("speak") or "")
    if tool in HARD_TOOLS or is_hard_step(utterance):
        return {
            "ok": True,
            "tool": "refuse_hard_step",
            "spoken": PROPOSAL,
            "wires": ["refuse_hard_step"],
            "cites": [],
            "sent": False,
        }
    if tool == "vault_read":
        query = str(args.get("query") or utterance or "").strip()
        found = {"spoken": "", "hits": [], "unknown": True}
        if RETRIEVE is not None:
            found = RETRIEVE.search(query, retrieve_roots)
        cites = found.get("hits") if isinstance(found.get("hits"), list) else []
        evidence = str(found.get("spoken") or "").strip()
        return {
            "ok": True,
            "tool": tool,
            "spoken": _evidence_line(speak, evidence),
            "wires": ["vault_read", "store"],
            "cites": cites,
            "sent": False,
        }
    if tool == "safari_see":
        got = None
        if see_fn is not None:
            try:
                got = see_fn(utterance)
            except TypeError:
                got = see_fn()
        elif SEE is not None:
            got = SEE.safari_act(utterance, hive=hive)
        got = got if isinstance(got, dict) else {}
        evidence = str(got.get("spoken") or "").strip()
        return {
            "ok": bool(got.get("ok", True)),
            "tool": tool,
            "spoken": _evidence_line(speak, evidence),
            "wires": [got.get("wire") or "safari_see"],
            "cites": [],
            "sent": False,
            "see": got,
        }
    if tool == "cursor_ask":
        query = str(args.get("query") or utterance or "").strip()
        ask = (
            "Ask mode. Repo only. Do not edit. Do not send, pay, deploy, book, or publish.\n"
            f"{query}"
        )
        fn = cursor_ask_fn or cursor_fn_ask_fallback()
        got = _invoke_cursor(fn, ask) if fn is not None else {"spoken": UNKNOWN}
        got = got if isinstance(got, dict) else {"spoken": str(got or "")}
        evidence = str(got.get("spoken") or "").strip()
        return {
            "ok": bool(got.get("ok", True)),
            "tool": tool,
            "spoken": _evidence_line(speak, evidence),
            "wires": [got.get("wire") or "cursor_ask"],
            "cites": [],
            "sent": False,
        }
    if tool == "status":
        which = str(args.get("which") or "all")
        fn = status_fn
        if fn is None and ONLINE is not None:
            fn = ONLINE.status
        got = fn(which) if fn is not None else {"spoken": UNKNOWN}
        got = got if isinstance(got, dict) else {"spoken": str(got or "")}
        evidence = str(got.get("spoken") or "").strip()
        wires = [p.get("wire") for p in (got.get("parts") or []) if isinstance(p, dict) and p.get("wire")]
        return {
            "ok": bool(got.get("ok", True)),
            "tool": tool,
            "spoken": _evidence_line(speak, evidence),
            "wires": wires or [got.get("wire") or "status"],
            "cites": [],
            "sent": False,
        }
    _ = sent
    return {
        "ok": False,
        "tool": "unknown",
        "spoken": UNKNOWN,
        "wires": ["pipeline"],
        "cites": [],
        "sent": False,
    }


def cursor_fn_ask_fallback():
    if ONLINE is not None and hasattr(ONLINE, "call_cursor_turn"):
        return lambda prompt, mode="ask", **kw: ONLINE.call_cursor_turn(prompt, mode=mode)
    return None


def dress(spoken: str, *, tool: str, utterance: str, turns: list[dict]) -> str:
    text = (spoken or "").strip() or UNKNOWN
    if PERSONA is None:
        return text
    return PERSONA.wrap(text, verb=tool, utterance=utterance, turns=turns)


def note_wire(
    hive: Path,
    tool: str,
    spoken: str,
    utterance: str,
    *,
    ok: bool,
    wire: dict | None = None,
) -> dict:
    if LAST_WIRE is None:
        return {}
    row = wire if isinstance(wire, dict) else {}
    path = str(row.get("path") or "pipeline")
    error = row.get("error")
    if not ok and error is None:
        error = spoken
    return LAST_WIRE.write(
        hive,
        verb=tool,
        ok=ok,
        human_line=spoken,
        wire={"path": path, "error": None if ok else error},
        utterance=utterance,
    )


def apply_pipeline(
    utterance: str,
    *,
    hive: Path = HIVE,
    retrieve_roots: list[Path] | None = None,
    cursor_fn=None,
    see_fn=None,
    status_fn=None,
    cursor_ask_fn=None,
) -> dict:
    spoken_in = (utterance or "").strip()
    bus_now = load_json(hive / "bus" / "state.json")
    prior_turns = load_turns(bus_now)
    if is_hard_step(spoken_in):
        text = dress(PROPOSAL, tool="refuse_hard_step", utterance=spoken_in, turns=prior_turns)
        next_turns = append_turn(prior_turns, spoken_in, text)
        write_bus(
            hive,
            phase="speak",
            job_status="done",
            utterance=spoken_in,
            spoken=text,
            wires=["refuse_hard_step"],
            turns=next_turns,
            tool="refuse_hard_step",
        )
        note_wire(hive, "refuse_hard_step", text, spoken_in, ok=True)
        return {
            "ok": True,
            "verb": "refuse_hard_step",
            "tool": "refuse_hard_step",
            "ask": False,
            "spoken": text,
            "host": "pipeline",
            "cites": [],
            "wires": ["refuse_hard_step"],
            "sent": False,
            "pack": None,
        }

    write_bus(
        hive,
        phase="think",
        job_status="working",
        utterance=spoken_in,
        spoken=None,
        turns=prior_turns,
    )
    pack = write_pack(spoken_in, hive=hive, retrieve_roots=retrieve_roots, turns=prior_turns)
    pick, got = cursor_pick(pack, spoken_in, cursor_fn)
    if pick is None:
        raw = miss_spoken(got)
        text = dress(raw, tool="pipeline", utterance=spoken_in, turns=prior_turns)
        next_turns = append_turn(prior_turns, spoken_in, text)
        write_bus(
            hive,
            phase="speak",
            job_status="done",
            utterance=spoken_in,
            spoken=text,
            wires=["cursor"],
            turns=next_turns,
            tool="unknown",
        )
        note_wire(
            hive,
            "pipeline",
            text,
            spoken_in,
            ok=False,
            wire={"path": "cursor", "error": raw},
        )
        return {
            "ok": False,
            "verb": "pipeline",
            "tool": "unknown",
            "ask": False,
            "spoken": text,
            "host": "pipeline",
            "cites": [],
            "wires": ["cursor"],
            "sent": False,
            "pack": str(pack),
            "unknown": True,
        }

    ran = run_tool(
        pick,
        spoken_in,
        hive=hive,
        retrieve_roots=retrieve_roots,
        see_fn=see_fn,
        status_fn=status_fn,
        cursor_ask_fn=cursor_ask_fn,
    )
    tool = str(ran.get("tool") or pick.get("tool") or "pipeline")
    text = dress(str(ran.get("spoken") or UNKNOWN), tool=tool, utterance=spoken_in, turns=prior_turns)
    next_turns = append_turn(prior_turns, spoken_in, text)
    wires = ran.get("wires") if isinstance(ran.get("wires"), list) else [tool]
    cites = ran.get("cites") if isinstance(ran.get("cites"), list) else []
    write_bus(
        hive,
        phase="speak",
        job_status="done",
        utterance=spoken_in,
        spoken=text,
        cites=cites,
        wires=wires,
        turns=next_turns,
        tool=tool,
    )
    note_wire(hive, tool, text, spoken_in, ok=bool(ran.get("ok")))
    return {
        "ok": bool(ran.get("ok")),
        "verb": tool,
        "tool": tool,
        "ask": False,
        "spoken": text,
        "host": "pipeline",
        "args": pick.get("args"),
        "cites": cites,
        "wires": wires,
        "sent": bool(ran.get("sent")),
        "pack": str(pack),
        "unknown": bool(ran.get("unknown")),
    }
