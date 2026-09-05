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
STORE_LOGIN_ONCE = (
    "I already said Cursor needs a one-time login in Terminal. Not an xAI key."
)
WHY_THINK_RE = re.compile(
    r"why can(?:'t|not| not) you think|"
    r"why (?:are you|is (?:it|cursor)) (?:dark|offline|dumb|silent)|"
    r"\bagent login\b|one-time login|not logged in",
    re.I,
)
WORK_CHECK_RE = re.compile(
    r"\b("
    r"do you work|"
    r"are you (?:there|working|up|online|on)\b|"
    r"you work now|"
    r"does this work|"
    r"can you hear|"
    r"did(?:n't| not)? you hear"
    r")",
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
CAN_DO_RE = re.compile(
    r"\b("
    r"what can you do|"
    r"what do you do|"
    r"your capabilities|"
    r"what are you (?:able to do|good at)"
    r")\b",
    re.I,
)
GREET_STOP = {
    "hello",
    "hey",
    "hi",
    "yo",
    "jarvis",
    "hear",
    "heard",
    "didnt",
    "didn",
    "hes",
    "there",
    "you",
    "me",
    "sir",
}


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
        "If no hand is needed, pick status or vault_read and put a real answer from this pack in speak. "
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
    )


def login_already_said(hive: Path) -> bool:
    bus = load_json(hive / "bus" / "state.json")
    if bus.get("cursor_login_said"):
        return True
    if LAST_WIRE is None:
        return False
    last = LAST_WIRE.read(hive) or {}
    err = str((last.get("wire") or {}).get("error") or last.get("human_line") or "")
    return is_login_unknown_text(err)


def should_skip_cursor(hive: Path, cursor_fn) -> bool:
    """After the login UNKNOWN was spoken once, do not brick the next greetings."""
    if not login_already_said(hive):
        return False
    if cursor_fn is not None:
        return True
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return True
    if ONLINE is not None and hasattr(ONLINE, "cursor_logged_in"):
        try:
            return not bool(ONLINE.cursor_logged_in())
        except (OSError, TypeError, AttributeError):
            return True
    return True


def wants_login_why(utterance: str) -> bool:
    """Login lecture only on first UNKNOWN or when he asks why the brain is dark."""
    return bool(WHY_THINK_RE.search(utterance or ""))


def is_greet_or_empty(utterance: str) -> bool:
    raw = RETRIEVE.tokens(utterance) if RETRIEVE is not None else re.findall(
        r"[a-z0-9']{3,}", (utterance or "").lower()
    )
    words = [w.replace("'", "") for w in raw if w.replace("'", "") not in GREET_STOP]
    return not words


def is_work_check(utterance: str) -> bool:
    """Presence / 'do you work' is a status check, not a vault dump."""
    return bool(WORK_CHECK_RE.search(utterance or ""))


def wants_safari(utterance: str) -> bool:
    """Only explicit Safari hands. Do not treat a greeting as safari_front."""
    return bool(SAFARI_WANT_RE.search(utterance or ""))


def wants_capabilities(utterance: str) -> bool:
    """'What can you do' is the real toolbox, not business-lanes.json."""
    return bool(CAN_DO_RE.search(utterance or ""))


def is_lanes_default(text: str) -> bool:
    """True when the mouth is about to repeat the business-lanes greeting."""
    if RETRIEVE is not None and hasattr(RETRIEVE, "is_lanes_default"):
        return bool(RETRIEVE.is_lanes_default(text))
    return "on disk: website / ai partner" in (text or "").lower()


def _is_speak_leak(text: str) -> bool:
    if RETRIEVE is not None and hasattr(RETRIEVE, "is_speak_leak"):
        return bool(RETRIEVE.is_speak_leak(text))
    if PERSONA is not None and hasattr(PERSONA, "is_pack_leak"):
        return bool(PERSONA.is_pack_leak(text))
    return False


def clean_store_answer(
    utterance: str,
    *,
    hive: Path,
    retrieve_roots: list[Path] | None,
) -> str:
    """Short butler line. Never paste life/lanes/hot/ASKS."""
    _ = hive
    greet = is_greet_or_empty(utterance) or is_work_check(utterance)
    can_do = wants_capabilities(utterance)
    if RETRIEVE is not None and hasattr(RETRIEVE, "speak_store"):
        return RETRIEVE.speak_store(
            utterance, retrieve_roots, greet=greet, can_do=can_do
        )
    if greet:
        return "I'm here."
    if wants_capabilities(utterance):
        return (
            "I read the vault, look at the Safari tab, brief a school skill, "
            "or report status. Hard steps stay with you."
        )
    return "I'm here. The store is on disk."


def answer_from_store(
    utterance: str,
    *,
    retrieve_roots: list[Path] | None,
) -> str:
    """One speakable vault line, or a butler fallback. Never hot.md / ASKS."""
    if RETRIEVE is not None:
        found = RETRIEVE.search(utterance, retrieve_roots)
        evidence = str(found.get("spoken") or "").strip()
        if evidence and not found.get("unknown") and not _is_speak_leak(evidence):
            return evidence
        if hasattr(RETRIEVE, "speak_store"):
            return RETRIEVE.speak_store(utterance, retrieve_roots, greet=False)
    return "I'm here. The store is on disk."


def is_mouth_echo(utterance: str, hive: Path) -> bool:
    """True when the mic heard our last line (or pack crumbs), not a new ask."""
    heard = (utterance or "").strip()
    if not heard:
        return False
    if _is_speak_leak(heard):
        return True
    low = heard.lower()
    if STORE_LOGIN_ONCE.lower() in low or "i already said cursor needs" in low:
        return True
    bus = load_json(hive / "bus" / "state.json")
    last = str(bus.get("spoken") or "").strip()
    if last and len(last) >= 24 and last[:80].lower() in low:
        return True
    return False


def store_converse(
    utterance: str,
    *,
    hive: Path,
    turns: list[dict],
    retrieve_roots: list[Path] | None,
    see_fn=None,
) -> dict:
    """Talk from the clean store. Pack / last-wire / ASKS / hot.md stay off the mouth.

    Cursor dark still has hands: safari_see goes to see.py. Real asks search the store.
    """
    _ = turns
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
            "see": got,
        }
    tool = "status"
    if is_mouth_echo(heard, hive) or is_greet_or_empty(heard) or is_work_check(heard):
        spoken = clean_store_answer(heard, hive=hive, retrieve_roots=retrieve_roots)
    elif wants_login_why(heard):
        spoken = STORE_LOGIN_ONCE
    elif wants_capabilities(heard):
        if RETRIEVE is not None and hasattr(RETRIEVE, "speak_store"):
            spoken = RETRIEVE.speak_store(heard, retrieve_roots, can_do=True)
        else:
            spoken = clean_store_answer(heard, hive=hive, retrieve_roots=retrieve_roots)
    elif PRO is not None and PRO.is_school_query(heard):
        school = PRO.brief(heard)
        evidence = str(school.get("spoken") or "").strip()
        spoken = evidence if evidence and not _is_speak_leak(evidence) else ""
        if spoken:
            first, rest = first_sentence(spoken)
            if rest or len(spoken) > 180:
                spoken = first or spoken[:177].rsplit(" ", 1)[0] + "…"
        if not spoken:
            spoken = clean_store_answer(heard, hive=hive, retrieve_roots=retrieve_roots)
        tool = "pro"
    else:
        spoken = answer_from_store(heard, retrieve_roots=retrieve_roots)
    spoken = _speakable_line(spoken) or "I'm here."
    if is_lanes_default(spoken):
        spoken = "I'm here."
    return {
        "ok": True,
        "tool": tool,
        "spoken": spoken,
        "wires": ["store", tool] if tool != "status" else ["store"],
        "cites": [],
        "sent": False,
        "from_store": True,
    }


def _as_pick(tool: str, args: dict, speak: str) -> dict | None:
    if tool in TOOLS:
        return {"tool": tool, "args": args, "speak": speak}
    if speak.strip():
        return {"tool": "status", "args": args, "speak": speak}
    return None


def extract_pick(raw) -> dict | None:
    if isinstance(raw, dict) and not raw.get("unknown"):
        args = raw.get("args") if isinstance(raw.get("args"), dict) else {}
        speak = str(raw.get("speak") or "")
        picked = _as_pick(str(raw.get("tool") or ""), args, speak)
        if picked is not None:
            return picked
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
    if not isinstance(data, dict):
        return None
    args = data.get("args") if isinstance(data.get("args"), dict) else {}
    return _as_pick(str(data.get("tool") or ""), args, str(data.get("speak") or ""))


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
    return speak or evidence or "I'm here."


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
        if PRO is not None and PRO.is_school_query(query):
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
                "tool": tool,
                "spoken": _speakable_line(speak) or "I'm here.",
                "wires": ["store"],
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
) -> dict:
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
):
    text = dress(raw, tool=tool, utterance=spoken_in, turns=prior_turns)
    if _is_speak_leak(text) or is_lanes_default(text):
        text = dress(
            "I'm here.",
            tool=tool,
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
    login_fail = False
    if should_skip_cursor(hive, cursor_fn):
        ran = store_converse(
            spoken_in,
            hive=hive,
            turns=prior_turns,
            retrieve_roots=retrieve_roots,
            see_fn=see_fn,
        )
        pick = {
            "tool": str(ran.get("tool") or "status"),
            "args": {},
            "speak": str(ran.get("spoken") or ""),
        }
    else:
        pick, got = cursor_pick(pack, spoken_in, cursor_fn)
        if pick is None:
            if is_dark_cursor(got) and login_already_said(hive):
                ran = store_converse(
                    spoken_in,
                    hive=hive,
                    turns=prior_turns,
                    retrieve_roots=retrieve_roots,
                    see_fn=see_fn,
                )
                pick = {
                    "tool": str(ran.get("tool") or "status"),
                    "args": {},
                    "speak": str(ran.get("spoken") or ""),
                }
            else:
                login_fail = True

    if login_fail:
        raw = miss_spoken(got)
        login_said = True if is_login_unknown_text(raw) or is_dark_cursor(got) else None
        text, first, rest = _commit_spoken(
            hive,
            spoken_in=spoken_in,
            prior_turns=prior_turns,
            tool="pipeline",
            raw=raw,
            wires=["cursor"],
            cites=[],
            ok=False,
            pack=str(pack),
            unknown=True,
            login_said=login_said,
            wire={"path": "cursor", "error": raw},
        )
        if first and rest:
            yield _pipeline_event(
                ok=False,
                tool="pipeline",
                spoken=first,
                spoken_delta=first,
                wires=["cursor"],
                cites=[],
                pack=str(pack),
                unknown=True,
                done=False,
                partial=True,
            )
        yield _pipeline_event(
            ok=False,
            tool="pipeline",
            spoken=text,
            spoken_delta=rest if first and rest else text,
            wires=["cursor"],
            cites=[],
            pack=str(pack),
            unknown=True,
        )
        return

    early = ""
    speak_early = str((pick or {}).get("speak") or "").strip()
    if speak_early and ran is None:
        early_raw, _ = first_sentence(speak_early)
        early = dress(
            early_raw or speak_early,
            tool=str((pick or {}).get("tool") or "status"),
            utterance=spoken_in,
            turns=prior_turns,
        )
        if early:
            yield _pipeline_event(
                ok=True,
                tool=str((pick or {}).get("tool") or "status"),
                spoken=early,
                spoken_delta=early,
                wires=[str((pick or {}).get("tool") or "status")],
                cites=[],
                pack=str(pack),
                args=(pick or {}).get("args"),
                done=False,
                partial=True,
            )

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
    tool = str(ran.get("tool") or (pick or {}).get("tool") or "pipeline")
    wires = ran.get("wires") if isinstance(ran.get("wires"), list) else [tool]
    cites = ran.get("cites") if isinstance(ran.get("cites"), list) else []
    login_said = False if not ran.get("from_store") else True
    text, first, rest = _commit_spoken(
        hive,
        spoken_in=spoken_in,
        prior_turns=prior_turns,
        tool=tool,
        raw=str(ran.get("spoken") or UNKNOWN),
        wires=wires,
        cites=cites,
        ok=bool(ran.get("ok")),
        pack=str(pack),
        args=(pick or {}).get("args"),
        login_said=login_said,
    )
    extra = ""
    if early:
        extra = text[len(early) :].strip() if text.startswith(early) else rest
    elif first and rest:
        yield _pipeline_event(
            ok=bool(ran.get("ok")),
            tool=tool,
            spoken=first,
            spoken_delta=first,
            wires=wires,
            cites=cites,
            pack=str(pack),
            args=(pick or {}).get("args"),
            done=False,
            partial=True,
        )
        extra = rest
    else:
        extra = text
    yield _pipeline_event(
        ok=bool(ran.get("ok")),
        tool=tool,
        spoken=text,
        spoken_delta=extra,
        wires=wires,
        cites=cites,
        pack=str(pack),
        args=(pick or {}).get("args"),
        unknown=bool(ran.get("unknown")),
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
    }
    for ev in apply_pipeline_iter(
        utterance,
        hive=hive,
        retrieve_roots=retrieve_roots,
        cursor_fn=cursor_fn,
        see_fn=see_fn,
        status_fn=status_fn,
        cursor_ask_fn=cursor_ask_fn,
    ):
        last = ev
    return last
