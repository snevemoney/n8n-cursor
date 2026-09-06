#!/usr/bin/env python3
"""One Jarvis pipeline. Input → full context file → converse, or one hand.

Conversation is the product. The model answers first. Hands
(vault_read / safari_see / cursor_ask / status / refuse_hard_step) only when needed.
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
HANDS = ("vault_read", "safari_see", "cursor_ask", "status", "refuse_hard_step")
TOOLS = HANDS
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
    "Run agent login in Terminal."
)
NEED_LOGIN = "You need `agent login` for a real talk."
NO_MODEL = "No model is available."
PROPOSAL = (
    "Proposal only. I will not send, pay, deploy, book, or publish. "
    "That hard step stays with you."
)
MAX_TURNS = 8
ECHO_STUB_RE = re.compile(
    r"("
    r"last you said|"
    r"you were at|"
    r"still on that|"
    r"^going\.|"
    r"\bi(?:'m| am) here\b|"
    r"\bstill here\b|"
    r"still need [`']?agent login"
    r")",
    re.I,
)
WHY_THINK_RE = re.compile(
    r"why can(?:'t|not| not) you think|"
    r"why (?:are you|is (?:it|cursor)) (?:dark|offline|dumb|silent)|"
    r"\bagent login\b|one-time login|not logged in",
    re.I,
)
SAFARI_WANT_RE = re.compile(
    r"\b("
    r"safari|"
    r"scroll|"
    r"screenshot|screen\s*shot|screen\s*grab|"
    r"watch later|"
    r"youtube|"
    r"open\s+https?://|"
    r"look at (?:this |the )?(?:page|tab|screen)|"
    r"grab (?:the |my )?(?:screen|safari|front tab)|"
    r"share (?:me )?(?:my )?screen"
    r")\b",
    re.I,
)


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
PRO = _load("agent_stack_pro", STACK / "hands" / "pro.py")
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
    cursor_login_said: bool | None = None,
    agent_login_tried: bool | None = None,
    brain: str | None = None,
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
    if cursor_login_said is True:
        bus["cursor_login_said"] = True
    elif cursor_login_said is False:
        bus.pop("cursor_login_said", None)
    if agent_login_tried is True:
        bus["agent_login_tried"] = True
    if brain:
        bus["brain"] = brain
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
        "Jarvis pipeline pack. Conversation is the product.",
        "You are the coordinator. Cursor CLI is one worker, not the brain.",
        "Three layers: face+voice, this coordinator, tool adapters.",
        "Adapters: Cursor CLI (coding/repo), Safari (browser), files on disk.",
        "Hear what he said. Answer that from the sitting. Then stop.",
        "Keep delegated work until it finishes or Evens is needed.",
        "Do not replay canned status or last-wire leftovers as the mouth.",
        "Do not dump a school skill because a word like marketing or funnel appeared.",
        "Only brief a course when he named the course (BUS203) or asked for the shelf.",
        "Pick a hand only when you need one. Otherwise converse.",
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
    if PRO is not None:
        lines.append(PRO.pack_block())
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
        "Default is conversation. Put the answer in speak. "
        "Hands: vault_read, safari_see, cursor_ask, status, refuse_hard_step. "
        'JSON: {"tool":"converse"|"vault_read"|"safari_see"|"cursor_ask"|"status"|"refuse_hard_step","args":{},"speak":""}'
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
        "You are the coordinator. Cursor CLI is one worker, not the brain.\n"
        "Use that pack, not a truncated prompt. Conversation is the product.\n"
        f"Utterance: {(utterance or '').strip()}\n"
        "Answer what he said. Follow-ups use the sitting turns in the pack.\n"
        "A hand only when you need one. Otherwise converse.\n"
        "JSON preferred, prose speak is also fine:\n"
        '{"tool":"converse"|"vault_read"|"safari_see"|"cursor_ask"|"status"|"refuse_hard_step","args":{},"speak":""}\n'
    )


def first_sentence(text: str) -> tuple[str, str]:
    """Split the first speakable sentence from the rest. TTS starts on the first.

    A lone 'Sir.' is the butler wrap, not a sentence. Keep it with the next beat.
    """
    body = (text or "").strip()
    if not body:
        return "", ""
    lead = re.match(r"^Sir\.\s+", body, re.I)
    start = lead.end() if lead else 0
    match = re.search(r"[.!?](?:\s+|$)", body[start:])
    if not match:
        return body, ""
    end = start + match.end()
    if end >= len(body):
        return body, ""
    return body[:end].strip(), body[end:].strip()


def is_login_unknown_text(text: str) -> bool:
    blob = (text or "").lower()
    return (
        "needs a one-time login" in blob
        or "please run 'agent login'" in blob
        or "not logged in" in blob
        or "agent login" in blob
        or "for a real talk" in blob
    )


def asked_for_course(utterance: str) -> bool:
    if PRO is not None and hasattr(PRO, "asked_for_course"):
        return bool(PRO.asked_for_course(utterance))
    return False


def login_already_said(hive: Path) -> bool:
    """Bus flag only. Last-wire leftovers are not a permanent dark lock.

    Live 4018 must not honor this flag when `agent status` is logged in —
    `should_skip_cursor` re-reads login and clears the flag.
    """
    bus = load_json(hive / "bus" / "state.json")
    return bool(bus.get("cursor_login_said"))


def live_cursor_ready() -> bool:
    """Fresh `agent status`. Do not trust a previous sitting's login flag."""
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return False
    if ONLINE is None or not hasattr(ONLINE, "cursor_logged_in"):
        return False
    try:
        return bool(ONLINE.cursor_logged_in())
    except (OSError, TypeError, AttributeError):
        return False


def clear_stale_login(hive: Path) -> None:
    """ChatGPT: login messages were stale after another runtime was already in."""
    if not live_cursor_ready():
        return
    path = hive / "bus" / "state.json"
    bus = load_json(path)
    if not bus.get("cursor_login_said"):
        return
    bus.pop("cursor_login_said", None)
    write_json(path, bus)


def should_skip_cursor(hive: Path, cursor_fn) -> bool:
    """After login UNKNOWN was spoken once, do not loop agent -p while still dark.

    Injected cursor_fn is the test door — do not let a live `agent status` unstick it.
    Live 4018 passes cursor_fn=None and re-checks login each turn.
    """
    if cursor_fn is None and live_cursor_ready():
        clear_stale_login(hive)
        return False
    if not login_already_said(hive):
        return False
    if cursor_fn is not None:
        return True
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return True
    return True


def wants_login_why(utterance: str) -> bool:
    """Honest login line when he asks why the brain is dark."""
    return bool(WHY_THINK_RE.search(utterance or ""))


def wants_safari(utterance: str) -> bool:
    """Only explicit Safari hands. Do not treat a greeting as safari_front."""
    return bool(SAFARI_WANT_RE.search(utterance or ""))


def is_lanes_default(text: str) -> bool:
    """True when the mouth is about to repeat the business-lanes greeting."""
    if RETRIEVE is not None and hasattr(RETRIEVE, "is_lanes_default"):
        return bool(RETRIEVE.is_lanes_default(text))
    return "on disk: website / ai partner" in (text or "").lower()


def _is_speak_leak(text: str) -> bool:
    if ECHO_STUB_RE.search(text or ""):
        return True
    if RETRIEVE is not None and hasattr(RETRIEVE, "is_speak_leak"):
        return bool(RETRIEVE.is_speak_leak(text))
    if PERSONA is not None and hasattr(PERSONA, "is_pack_leak"):
        return bool(PERSONA.is_pack_leak(text))
    return False


def online_talk(prompt: str, pack_text: str, talk_fn=None) -> dict | None:
    """Cursor-dark mouth: existing call_xai only when a key is already in the env.

    Do not print a missing key. Do not spawn Grok Bot. Tests that set
    AGENT_STACK_CURSOR_DRY skip the live HTTP call unless talk_fn is injected.
    """
    if talk_fn is not None:
        try:
            got = talk_fn(prompt, pack_text)
        except TypeError:
            try:
                got = talk_fn(prompt)
            except TypeError:
                got = talk_fn(prompt, "")
        if isinstance(got, dict):
            return got
        return {"ok": True, "spoken": str(got or ""), "wire": "xai", "engine": "xai"}
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return None
    if ONLINE is None or not hasattr(ONLINE, "call_xai"):
        return None
    key_fn = getattr(ONLINE, "has_xai_key", None) or getattr(ONLINE, "grok_api_key", None)
    try:
        present = bool(key_fn()) if key_fn is not None else False
    except (OSError, TypeError, AttributeError):
        present = False
    if not present:
        return None
    got = ONLINE.call_xai(prompt, pack_text)
    return got if isinstance(got, dict) else None


def try_login_once(hive: Path, login_fn=None) -> dict:
    """One `agent login` after keys were checked. Never the spoken product."""
    bus = load_json(hive / "bus" / "state.json")
    if bus.get("agent_login_tried"):
        return {"tried": True, "ok": False, "already": True}
    path = hive / "bus" / "state.json"
    bus["agent_login_tried"] = True
    write_json(path, bus)
    if login_fn is not None:
        try:
            got = login_fn()
        except TypeError:
            got = login_fn()
        return got if isinstance(got, dict) else {"tried": True, "ok": bool(got)}
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return {"tried": True, "ok": False, "dry": True}
    if os.environ.get("AGENT_STACK_TRY_LOGIN") != "1":
        return {"tried": True, "ok": False, "skipped": True}
    if ONLINE is not None and hasattr(ONLINE, "try_agent_login"):
        try:
            got = ONLINE.try_agent_login()
        except (OSError, TypeError, AttributeError):
            return {"tried": True, "ok": False}
        return got if isinstance(got, dict) else {"tried": True, "ok": False}
    return {"tried": True, "ok": False}


def no_model_reply(
    utterance: str,
    *,
    hive: Path,
    see_fn=None,
) -> dict:
    """Safari hands, or one honest line. Not echo, lanes, wiki, or a login kiosk."""
    heard = (utterance or "").strip()
    if wants_safari(heard) and (see_fn is not None or SEE is not None):
        if see_fn is not None:
            try:
                got = see_fn(heard)
            except TypeError:
                got = see_fn()
        else:
            got = SEE.safari_act(heard, hive=hive)
        got = got if isinstance(got, dict) else {}
        spoken = _speakable_line(str(got.get("spoken") or "")) or "I looked at the tab."
        return {
            "ok": bool(got.get("ok", True)),
            "tool": "safari_see",
            "spoken": spoken,
            "wires": [got.get("wire") or "safari_see"],
            "cites": [],
            "sent": False,
            "from_store": True,
            "brain": "safari",
            "see": got,
        }
    said = login_already_said(hive)
    spoken = NEED_LOGIN if wants_login_why(heard) or not said else NO_MODEL
    spoken = _speakable_line(spoken) or NO_MODEL
    return {
        "ok": False,
        "tool": "pipeline",
        "spoken": spoken,
        "wires": ["pipeline"],
        "cites": [],
        "sent": False,
        "from_store": True,
        "brain": None,
        "unknown": True,
        "model_available": False,
    }


def dark_cursor_reply(
    utterance: str,
    *,
    hive: Path,
    turns: list[dict],
    retrieve_roots: list[Path] | None,
    see_fn=None,
) -> dict:
    """Kept for tests. Dark Cursor is not a fake brain."""
    _ = (turns, retrieve_roots)
    return no_model_reply(utterance, hive=hive, see_fn=see_fn)


def _as_pick(tool: str, args: dict, speak: str) -> dict | None:
    name = (tool or "").strip().lower()
    if name in HANDS or name == "converse":
        return {"tool": name or "converse", "args": args, "speak": speak}
    if speak.strip() and not speak.upper().startswith("UNKNOWN"):
        return {"tool": "converse", "args": args, "speak": speak}
    return None


def _prose_converse(text: str) -> dict | None:
    blob = (text or "").strip()
    if not blob or blob.upper().startswith("UNKNOWN") or is_login_unknown_text(blob):
        return None
    if _is_speak_leak(blob) or is_lanes_default(blob):
        return None
    return {"tool": "converse", "args": {}, "speak": blob}


def extract_pick(raw) -> dict | None:
    if isinstance(raw, dict) and not raw.get("unknown"):
        args = raw.get("args") if isinstance(raw.get("args"), dict) else {}
        speak = str(raw.get("speak") or "")
        picked = _as_pick(str(raw.get("tool") or ""), args, speak)
        if picked is not None:
            return picked
        spoken = _prose_converse(str(raw.get("spoken") or ""))
        if spoken is not None:
            return spoken
    text = raw if isinstance(raw, str) else str((raw or {}).get("spoken") or "")
    blob = (text or "").strip()
    if not blob:
        return None
    if blob.startswith("```"):
        blob = re.sub(r"^```(?:json)?\s*", "", blob)
        blob = re.sub(r"\s*```$", "", blob)
    match = JSON_RE.search(blob)
    if match:
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError:
            data = None
        if isinstance(data, dict):
            args = data.get("args") if isinstance(data.get("args"), dict) else {}
            picked = _as_pick(str(data.get("tool") or ""), args, str(data.get("speak") or ""))
            if picked is not None:
                return picked
    return _prose_converse(blob)


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
    if is_dark_cursor(got) or is_login_unknown_text(spoken):
        return NEED_LOGIN
    if spoken:
        return spoken
    if ev.get("unknown"):
        return NEED_LOGIN
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


def _safari_see(args: dict, utterance: str, *, hive: Path, see_fn=None) -> dict:
    """Honor a clear safari_see act. Always land in hands/see.py. Not Chrome."""
    if see_fn is not None:
        try:
            got = see_fn(utterance)
        except TypeError:
            got = see_fn()
        return got if isinstance(got, dict) else {}
    if SEE is None:
        return {}
    act = str(args.get("act") or args.get("verb") or "").strip().lower()
    url = str(args.get("url") or "").strip()
    direction = str(args.get("direction") or "down").strip().lower()
    if act == "open" and url:
        return SEE.safari_open(url)
    if act == "scroll":
        return SEE.safari_scroll(direction)
    if act in {"grab", "screenshot", "share"}:
        return SEE.snapshot(hive=hive, grab=True)
    if act == "tabs":
        return SEE.safari_tabs()
    if act == "front":
        return SEE.safari_front()
    return SEE.safari_act(utterance, hive=hive)


def _speakable_line(text: str) -> str:
    """Mouth only. Pack / ASKS / video crumbs are for the model brief."""
    body = (text or "").strip()
    if not body or _is_speak_leak(body):
        return ""
    return body


def _evidence_line(speak: str, evidence: str) -> str:
    speak = _speakable_line(speak)
    evidence = _speakable_line(evidence)
    if speak and evidence and evidence not in speak:
        return f"{speak} {evidence}"
    return speak or evidence or ""


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
    if tool == "converse":
        return {
            "ok": True,
            "tool": "converse",
            "spoken": _speakable_line(speak),
            "wires": ["converse", "store"],
            "cites": [],
            "sent": False,
        }
    if tool == "vault_read":
        query = str(args.get("query") or utterance or "").strip()
        if PRO is not None and asked_for_course(query):
            school = PRO.brief(query)
            evidence = str(school.get("spoken") or "").strip()
            cites = school.get("cites") if isinstance(school.get("cites"), list) else []
            return {
                "ok": True,
                "tool": tool,
                "spoken": _evidence_line(speak, evidence),
                "wires": ["vault_read", "store", "school"],
                "cites": cites,
                "sent": False,
            }
        found = {"spoken": "", "hits": [], "unknown": True, "brief": ""}
        if RETRIEVE is not None:
            found = RETRIEVE.search(query, retrieve_roots)
        cites = found.get("hits") if isinstance(found.get("hits"), list) else []
        evidence = str(found.get("spoken") or "").strip()
        brief = str(found.get("brief") or "")
        return {
            "ok": True,
            "tool": tool,
            "spoken": _evidence_line(speak, evidence),
            "brief": brief,
            "wires": ["vault_read", "store"],
            "cites": cites,
            "sent": False,
        }
    if tool == "safari_see":
        got = _safari_see(args, utterance, hive=hive, see_fn=see_fn)
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
        which = str(args.get("which") or "").strip()
        if speak.strip() and not which:
            return {
                "ok": True,
                "tool": "converse",
                "spoken": _speakable_line(speak),
                "wires": ["converse", "store"],
                "cites": [],
                "sent": False,
            }
        which = which or "all"
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


def _pipeline_event(
    *,
    ok: bool,
    tool: str,
    spoken: str,
    spoken_delta: str,
    wires: list,
    cites: list,
    pack: str | None,
    args=None,
    unknown: bool = False,
    done: bool = True,
    partial: bool = False,
    brain: str | None = None,
    login_tried: bool = False,
    model_available: bool | None = None,
) -> dict:
    available = bool(brain) if model_available is None else bool(model_available)
    return {
        "ok": ok,
        "verb": tool,
        "tool": tool,
        "ask": False,
        "spoken": spoken,
        "spoken_delta": spoken_delta,
        "host": "pipeline",
        "args": args,
        "cites": cites,
        "wires": wires,
        "sent": False,
        "pack": pack,
        "unknown": unknown,
        "done": done,
        "partial": partial,
        "brain": brain,
        "login_tried": login_tried,
        "model_available": available,
    }


def _commit_spoken(
    hive: Path,
    *,
    spoken_in: str,
    prior_turns: list[dict],
    tool: str,
    raw: str,
    wires: list,
    cites: list,
    ok: bool,
    pack: str | None,
    args=None,
    unknown: bool = False,
    login_said: bool | None = None,
    wire: dict | None = None,
    brain: str | None = None,
    login_tried: bool = False,
):
    text = dress(raw, tool=tool, utterance=spoken_in, turns=prior_turns)
    if _is_speak_leak(text) or is_lanes_default(text):
        cleaned = ""
        if PERSONA is not None and hasattr(PERSONA, "sanitize_payload"):
            cleaned = str(PERSONA.sanitize_payload(raw) or "")
        fallback = cleaned if cleaned and not _is_speak_leak(cleaned) else (NO_MODEL if not brain else "")
        text = dress(
            fallback or NO_MODEL,
            tool="converse",
            utterance=spoken_in,
            turns=prior_turns,
        )
    next_turns = append_turn(prior_turns, spoken_in, text)
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
        cursor_login_said=login_said,
        agent_login_tried=True if login_tried else None,
        brain=brain,
    )
    note_wire(hive, tool, text, spoken_in, ok=ok, wire=wire)
    first, rest = first_sentence(text)
    return text, first, rest


def apply_pipeline_iter(
    utterance: str,
    *,
    hive: Path = HIVE,
    retrieve_roots: list[Path] | None = None,
    cursor_fn=None,
    see_fn=None,
    status_fn=None,
    cursor_ask_fn=None,
    talk_fn=None,
    login_fn=None,
):
    """Yield first speakable sentence, then the finished turn. Do not wait for done to speak."""
    spoken_in = (utterance or "").strip()
    bus_now = load_json(hive / "bus" / "state.json")
    prior_turns = load_turns(bus_now)
    if is_hard_step(spoken_in):
        text, first, rest = _commit_spoken(
            hive,
            spoken_in=spoken_in,
            prior_turns=prior_turns,
            tool="refuse_hard_step",
            raw=PROPOSAL,
            wires=["refuse_hard_step"],
            cites=[],
            ok=True,
            pack=None,
        )
        if first and rest:
            yield _pipeline_event(
                ok=True,
                tool="refuse_hard_step",
                spoken=first,
                spoken_delta=first,
                wires=["refuse_hard_step"],
                cites=[],
                pack=None,
                done=False,
                partial=True,
            )
        yield _pipeline_event(
            ok=True,
            tool="refuse_hard_step",
            spoken=text,
            spoken_delta=rest if first and rest else text,
            wires=["refuse_hard_step"],
            cites=[],
            pack=None,
        )
        return

    write_bus(
        hive,
        phase="think",
        job_status="working",
        utterance=spoken_in,
        spoken=None,
        turns=prior_turns,
    )
    pack = write_pack(spoken_in, hive=hive, retrieve_roots=retrieve_roots, turns=prior_turns)
    ran = None
    pick = None
    got = {}
    brain = None
    login_tried = False
    prompt = pick_prompt(pack, spoken_in)
    pack_text = pack.read_text(encoding="utf-8") if pack.is_file() else ""
    if ONLINE is not None and hasattr(ONLINE, "load_existing_env"):
        try:
            ONLINE.load_existing_env()
        except (OSError, TypeError, AttributeError):
            pass

    if not should_skip_cursor(hive, cursor_fn):
        pick, got = cursor_pick(pack, spoken_in, cursor_fn)
        if pick is not None:
            brain = "cursor"

    if pick is None:
        talked = online_talk(prompt, pack_text, talk_fn=talk_fn)
        pick = extract_pick(talked) if talked else None
        if pick is not None:
            brain = str((talked or {}).get("engine") or (talked or {}).get("wire") or "xai")
            got = talked or got

    if pick is None and wants_safari(spoken_in):
        ran = no_model_reply(spoken_in, hive=hive, see_fn=see_fn)
        pick = {
            "tool": str(ran.get("tool") or "safari_see"),
            "args": {},
            "speak": str(ran.get("spoken") or ""),
        }
        brain = str(ran.get("brain") or "safari")

    if pick is None:
        login_out = try_login_once(hive, login_fn=login_fn)
        login_tried = bool(login_out.get("tried"))
        if login_out.get("ok") and not should_skip_cursor(hive, cursor_fn):
            pick, got = cursor_pick(pack, spoken_in, cursor_fn)
            if pick is not None:
                brain = "cursor"
        if pick is None:
            ran = no_model_reply(spoken_in, hive=hive, see_fn=see_fn)
            pick = {
                "tool": str(ran.get("tool") or "pipeline"),
                "args": {},
                "speak": str(ran.get("spoken") or ""),
            }
            brain = ran.get("brain")

    early = ""
    speak_early = str((pick or {}).get("speak") or "").strip()
    if speak_early and ran is None and brain:
        early_raw, _ = first_sentence(speak_early)
        early = dress(
            early_raw or speak_early,
            tool=str((pick or {}).get("tool") or "converse"),
            utterance=spoken_in,
            turns=prior_turns,
        )
        if early and not _is_speak_leak(early) and not is_lanes_default(early):
            yield _pipeline_event(
                ok=True,
                tool=str((pick or {}).get("tool") or "converse"),
                spoken=early,
                spoken_delta=early,
                wires=[str((pick or {}).get("tool") or "converse")],
                cites=[],
                pack=str(pack),
                args=(pick or {}).get("args"),
                done=False,
                partial=True,
                brain=brain,
                login_tried=login_tried,
                model_available=True,
            )
        else:
            early = ""

    if ran is None:
        ran = run_tool(
            pick or {},
            spoken_in,
            hive=hive,
            retrieve_roots=retrieve_roots,
            see_fn=see_fn,
            status_fn=status_fn,
            cursor_ask_fn=cursor_ask_fn,
        )
        if not str(ran.get("spoken") or "").strip() and not brain:
            ran = no_model_reply(spoken_in, hive=hive, see_fn=see_fn)
    tool = str(ran.get("tool") or (pick or {}).get("tool") or "pipeline")
    wires = ran.get("wires") if isinstance(ran.get("wires"), list) else [tool]
    cites = ran.get("cites") if isinstance(ran.get("cites"), list) else []
    login_said = True if (
        not brain
        or brain == "xai"
        or ran.get("from_store")
        or is_dark_cursor(got)
    ) else False
    if live_cursor_ready():
        login_said = False
    raw_spoken = str(ran.get("spoken") or "")
    if not raw_spoken.strip():
        raw_spoken = NO_MODEL if not brain else UNKNOWN
    text, first, rest = _commit_spoken(
        hive,
        spoken_in=spoken_in,
        prior_turns=prior_turns,
        tool=tool,
        raw=raw_spoken,
        wires=wires,
        cites=cites,
        ok=bool(ran.get("ok")) if brain else False,
        pack=str(pack),
        args=(pick or {}).get("args"),
        login_said=login_said,
        brain=brain,
        login_tried=login_tried,
        unknown=not bool(brain),
        wire={"path": brain or ("cursor" if got else "pipeline"), "error": None if brain else raw_spoken},
    )
    extra = ""
    if early:
        extra = text[len(early) :].strip() if text.startswith(early) else rest
    elif first and rest:
        yield _pipeline_event(
            ok=bool(ran.get("ok")) if brain else False,
            tool=tool,
            spoken=first,
            spoken_delta=first,
            wires=wires,
            cites=cites,
            pack=str(pack),
            args=(pick or {}).get("args"),
            done=False,
            partial=True,
            brain=brain,
            login_tried=login_tried,
            model_available=bool(brain),
        )
        extra = rest
    else:
        extra = text
    yield _pipeline_event(
        ok=bool(ran.get("ok")) if brain else False,
        tool=tool,
        spoken=text,
        spoken_delta=extra,
        wires=wires,
        cites=cites,
        pack=str(pack),
        args=(pick or {}).get("args"),
        unknown=not bool(brain),
        brain=brain,
        login_tried=login_tried,
        model_available=bool(brain),
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
    talk_fn=None,
    login_fn=None,
) -> dict:
    last = {
        "ok": False,
        "verb": "pipeline",
        "tool": "unknown",
        "ask": False,
        "spoken": UNKNOWN,
        "host": "pipeline",
        "cites": [],
        "wires": ["pipeline"],
        "sent": False,
        "pack": None,
        "brain": None,
        "login_tried": False,
        "model_available": False,
    }
    for ev in apply_pipeline_iter(
        utterance,
        hive=hive,
        retrieve_roots=retrieve_roots,
        cursor_fn=cursor_fn,
        see_fn=see_fn,
        status_fn=status_fn,
        cursor_ask_fn=cursor_ask_fn,
        talk_fn=talk_fn,
        login_fn=login_fn,
    ):
        last = ev
    return last
