#!/usr/bin/env python3
"""Mouth sitting: listen → CONVERSE → speak.

Local: face + mic + TTS on 127.0.0.1:4018.
Talk harness: Cursor CLI (cloud). Modes ask / plan / agent. No yolo.
Memory: Obsidian vault + this repo + chat sessions + the hive.
No Ollama. No xAI key. Never ASK to send a sentence to a desk.
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
SKILLS_DIR = ROOT / "scripts/hive/grok-skills"
HARD_REFUSE = re.compile(
    r"\b("
    r"send (this|that|the)\s+(email|message|invoice|payment|sms|text)|"
    r"send an? (email|invoice|payment|sms)|"
    r"pay (this|that|the|an?|him|her|them)\b|"
    r"deploy (this|that|it|to|now|prod)|"
    r"book (a|the|this|me)\b|"
    r"publish (this|that|the|it|now)|"
    r"dial\b|twilio|retell|\bvapi\b|"
    r"claude code|fable|cowork|auto-?approve|"
    r"take over (my )?(mouse|computer)|"
    r"\bollama\b"
    r")",
    re.I,
)
HEAL_RE = re.compile(
    r"\b("
    r"fix (?:yourself|jarvis)|heal(?: yourself)?|self-?heal|"
    r"send an? (?:agent|fix)|"
    r"look at (?:the )?logs|"
    r"help jarvis|"
    r"never (?:do that|again)"
    r")\b",
    re.I,
)
TODAY_RE = re.compile(
    r"\bwhat should (?:we|i) (?:do|work on) today\b",
    re.I,
)
SKILL_RE = re.compile(
    r"\b(?:use|load|run)\s+(?:skill\s+)?([a-z0-9][a-z0-9-]{2,60})\b",
    re.I,
)
STATUS_RE = re.compile(
    r"\b("
    r"(?:what(?:'s|s| is) the )?vps status|"
    r"hostinger status|golden paths|"
    r"status of (?:the )?(?:vps|hive|server|hostinger|cursor)"
    r")\b",
    re.I,
)
MODE_RE = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?"
    r"(?:put(?:\s+yourself)?\s+(?:in|into)\s+|go(?:\s+to)?\s+|switch\s+to\s+|set\s+|use\s+|flip(?:\s+to)?\s+)?"
    r"(ask|plan|agent)\s+mode\b",
    re.I,
)
STOP_RE = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?(stop|cancel|never mind|forget it|shut up)\s*[.!]?\s*$",
    re.I,
)
GREET_RE = re.compile(
    r"^(?:hey|hi|hello|yo)(?:\s+jarvis)?\s*[.!]?\s*$",
    re.I,
)
CRUMB_RE = re.compile(r"^(it|uh|um|ah|hmm|mm|huh|what)\s*[.!]?\s*$", re.I)
SEE_RE = re.compile(
    r"\b("
    r"look at (?:my )?(?:screen|display|safari|browser)|"
    r"what am i looking at|"
    r"share (?:me )?(?:my )?screen|"
    r"see (?:my )?(?:screen|safari|browser)|"
    r"what(?:'s| is) on (?:my )?(?:screen|safari|browser)"
    r")\b",
    re.I,
)
CAL_RE = re.compile(
    r"\b("
    r"(?:what(?:'s|s| is)|anything) (?:on )?(?:my )?(?:calendar|schedule)|"
    r"(?:my )?(?:meetings?|calendar|schedule)(?:\s+(?:today|tomorrow))|"
    r"meetings? (?:today|tomorrow|this (?:week|morning))|"
    r"what(?:'s|s| do i have) (?:on )?(?:today|tomorrow)"
    r")\b",
    re.I,
)
MAIL_RE = re.compile(
    r"\b("
    r"(?:unread|new) (?:mail|e-?mails?)|"
    r"(?:how many|any) (?:unread )?(?:e-?mails?|messages)|"
    r"(?:my )?(?:inbox|unread mail)"
    r")\b",
    re.I,
)
INVOICE_RE = re.compile(r"\b(invoice|invoices)\b", re.I)
CAN_RE = re.compile(
    r"\b("
    r"what can you do|what are you able|"
    r"your (?:tools|skills|plugins|catalog)|"
    r"same as grok(?:\s*bot)?"
    r")\b",
    re.I,
)
LIFE_RE = re.compile(
    r"\b("
    r"who am i|what(?:'s|s| is) my name|how old(?: am i)?|my age|"
    r"who do i know|people i know|my businesses|"
    r"what do you know about me|remember (?:me|who i am)"
    r")\b",
    re.I,
)
FILE_RE = re.compile(
    r"\b("
    r"search (?:my )?(?:computer|mac|files|disk|documents|vault)|"
    r"find (?:the |my )?file|"
    r"look (?:on|in|through) my (?:computer|mac|files|documents|disk)"
    r")\b",
    re.I,
)
SEARCH_RE = re.compile(
    r"\b("
    r"search (?:the )?(?:web|internet|online)|"
    r"web search|"
    r"google\s+\S|"
    r"look up .+(?:online|on the web)|"
    r"search (?:for )?.+ on (?:the )?(?:web|internet)|"
    r"find (?:me )?(?:sources|references) (?:for|on)"
    r")\b",
    re.I,
)
WATCH_RE = re.compile(
    r"\b("
    r"(?:youtube )?(?:my )?watch later|"
    r"watch later (?:list|playlist|queue)|"
    r"what(?:'s|s| is) on (?:my )?watch later"
    r")\b",
    re.I,
)
NEWS_RE = re.compile(
    r"\b("
    r"what(?:'s|s| is)(?: the)? (?:latest )?(?:news|headlines)|"
    r"any (?:latest )?(?:news|headlines|signals)|"
    r"(?:hive |prescriptive )signals|"
    r"news (?:today|this (?:week|morning))"
    r")\b",
    re.I,
)
MAKE_RE = re.compile(
    r"\b(?:make|generate|create|render)\s+(?:me\s+)?(?:(?:a|an|new)\s+)*(image|video|remotion|presentation)\b",
    re.I,
)
SAFARI_ACT_RE = re.compile(
    r"\b("
    r"open https?://|"
    r"open .+\s+in safari|"
    r"(?:click|tap|press) (?:the )?.+|"
    r"(?:type|enter|fill) .+|"
    r"scroll (?:up|down|a bit)?|"
    r"(?:what )?(?:safari )?tabs?|"
    r"what(?:'s|s| is) open in safari"
    r")\b",
    re.I,
)
BUILD_RE = re.compile(
    r"\b(build|make|create|write|add)\s+(?:(?:a|an|new)\s+)*(skill|workflow|tool|plugin)\b",
    re.I,
)
REPO_RE = re.compile(
    r"\b("
    r"look at (?:the )?(?:code|file|repo|repository)|"
    r"open (?:this|the) file|"
    r"in the repo|"
    r"why (?:is|does) (?:this|the) (?:code|site|build|test|file)|"
    r"fix (?:this|the|that) (?:bug|code|site|file|test|lint)|"
    r"(?:edit|implement|typecheck|lint) (?:this|the|that)|"
    r"pull request|"
    r"change the code"
    r")\b",
    re.I,
)
MAX_TURNS = 8
_PACK_CACHE: dict = {"id_at": "", "store_at": "", "identity": "", "store": ""}
ASK_LEAK = re.compile(
    r"say yes to (approve|send)|send this to the grok desk|"
    r"hand this to the \w+ desk|do you want me to send this",
    re.I,
)
DARK_BRAIN = "UNKNOWN. Cursor harness returned no reply."
DARK_GROK = DARK_BRAIN


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


def _load_mod(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


RETRIEVE = _load_mod("agent_stack_retrieve", Path(__file__).resolve().parent.parent / "memory" / "retrieve.py")
STORE = _load_mod("agent_stack_store", Path(__file__).resolve().parent.parent / "memory" / "store.py")
VOICE = _load_mod("agent_stack_voice", Path(__file__).resolve().parent / "voice.py")

_ONLINE_PATH = Path(__file__).resolve().parent.parent / "brain" / "online.py"
ONLINE = _load_mod("agent_stack_online", _ONLINE_PATH) if _ONLINE_PATH.is_file() else None
_SEE_PATH = Path(__file__).resolve().parent.parent / "hands" / "see.py"
SEE = _load_mod("agent_stack_see", _SEE_PATH) if _SEE_PATH.is_file() else None
_INBOX_PATH = Path(__file__).resolve().parent.parent / "hands" / "inbox.py"
INBOX = _load_mod("agent_stack_inbox", _INBOX_PATH) if _INBOX_PATH.is_file() else None
_FILES_PATH = Path(__file__).resolve().parent.parent / "hands" / "files.py"
FILES = _load_mod("agent_stack_files", _FILES_PATH) if _FILES_PATH.is_file() else None
_NAMED_PATH = Path(__file__).resolve().parent.parent / "hands" / "named.py"
NAMED = _load_mod("agent_stack_named", _NAMED_PATH) if _NAMED_PATH.is_file() else None
_SCARS_PATH = Path(__file__).resolve().parent.parent / "memory" / "scars.py"
SCARS = _load_mod("agent_stack_scars", _SCARS_PATH) if _SCARS_PATH.is_file() else None


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


def skill_count() -> int:
    if not SKILLS_DIR.is_dir():
        return 0
    return sum(1 for p in SKILLS_DIR.glob("*.md") if p.name.upper() != "README.MD")


def catalog_block() -> str:
    n = skill_count()
    return (
        f"Catalog (this Mac, not Grok Bot): {n} hive skills at scripts/hive/grok-skills/. "
        "Cursor harness runs them. Safari uses Evens's logged-in session. "
        "Local files: vault + Documents + this repo. Never hive/desk dump."
    )


def capabilities_spoken() -> str:
    n = skill_count()
    return (
        f"I run the hive catalog here, not Grok Bot. {n} skills, Cursor harness. "
        "Already works: Safari open, tabs, scroll, grab; Calendar; Mail; local files; "
        "life, today, heal. "
        "This slice: web search in Safari with real links; YouTube Watch Later from the live tab; "
        "news and signals from disk; make image or video routes to an existing skill. "
        "Skill-routed or UNKNOWN: Higgsfield generate, Remotion pipeline, full watch.json, computer takeover. "
        "Say use skill, search the web, watch later, or search my computer. "
        "Send, pay, deploy, book, and publish stay with you."
    )


def _scars_live(hive: Path) -> Path:
    return hive / "bus" / "scars.jsonl"


def record_spoken_scar(spoken: str, hive: Path) -> dict | None:
    if SCARS is None or not (spoken or "").strip():
        return None
    return SCARS.record_from_spoken(spoken, live=_scars_live(hive))


def cursor_blocked(hive: Path) -> bool:
    if SCARS is not None and SCARS.blocks_cursor(_scars_live(hive)):
        return True
    if ONLINE is not None and hasattr(ONLINE, "cursor_logged_in"):
        try:
            if not ONLINE.cursor_logged_in() and SCARS is not None and SCARS.hits_for(
                "cursor-auth-dark", _scars_live(hive)
            ) >= 1:
                return True
        except Exception:
            return False
    return False


def today_spoken(retrieve_roots: list[Path] | None, hive: Path | None = None) -> str:
    if hasattr(RETRIEVE, "life_card"):
        life = RETRIEVE.life_card(retrieve_roots)
        biz = life.get("businesses") if isinstance(life, dict) else []
    else:
        biz = []
    found = RETRIEVE.search("what should I work on today hot north stars", retrieve_roots)
    cite = ""
    hits = found.get("hits") if isinstance(found, dict) else []
    if hits and isinstance(hits[0], dict):
        cite = str(hits[0].get("snippet") or "").strip()
    bits = ["From the store, not a dark Cursor call."]
    if biz:
        bits.append("Active lanes: " + ", ".join(str(x) for x in biz[:4]) + ".")
    if cite:
        bits.append(cite[:180])
    else:
        bits.append("North star is maximum leverage, minimum noise. Name one lane and we go.")
    if hive is not None and SCARS is not None and SCARS.blocks_cursor(_scars_live(hive)):
        bits.append("Cursor login scar is saved. Run agent login in Terminal when you want the harness back.")
    return " ".join(bits)


def heal_spoken(hive: Path, retrieve_roots: list[Path] | None, cursor_fn, grok) -> tuple[str, list, list]:
    """Apply never-again. Dispatch a fix agent only when Cursor is logged in."""
    bus = load_json(hive / "bus" / "state.json")
    found: list[dict] = []
    for row in load_turns(bus):
        spoken = str(row.get("jarvis") or "")
        scar = record_spoken_scar(spoken, hive)
        if scar and scar not in found:
            found.append(scar)
    if not found and SCARS is not None:
        found = [row for row in SCARS.load_bank() if row.get("id") in {"cursor-auth-dark", "send-an-agent-not-hard-step", "repeat-unknown"}]
    if SCARS is not None:
        for row in found:
            SCARS.record(
                scar_id=str(row.get("id") or "repeat-unknown"),
                symptom=str(row.get("symptom") or row.get("id")),
                cause="heal verb",
                live=_scars_live(hive),
            )
    names = ", ".join(str(r.get("id")) for r in found[:5]) or "none new"
    logged_in = bool(ONLINE is not None and hasattr(ONLINE, "cursor_logged_in") and ONLINE.cursor_logged_in())
    if logged_in and cursor_fn is None and grok is None and ONLINE is not None and SCARS is not None:
        packed = SCARS.heal_prompt(found)
        resume = str(bus.get("jarvis_agent_chat_id") or "").strip() or None
        if resume is None:
            resume = ONLINE.ensure_jarvis_chat(None)
        try:
            got = ONLINE.call_cursor_turn(packed, mode="agent", resume=resume)
        except TypeError:
            got = ONLINE.call_cursor_turn(packed, mode="agent")
        reply = str(got.get("spoken") or "").strip()
        if reply and not got.get("unknown"):
            return reply, ["cursor"], found
    narration = (
        f"I saved the scars ({names}). I will not repeat those errors. "
        "Cursor login stays you in Terminal if that scar is dark. "
        "The next converse uses the store until the harness is back."
    )
    return narration, ["heal"], found


def skills_spoken() -> str:
    n = skill_count()
    names = list_skills(6)
    examples = ", ".join(names) if names else "none listed"
    return (
        f"Same catalog Grok Bot mirrors. I run them on this Mac. {n} skills. "
        f"Examples: {examples}. Say use skill and the slug."
    )


def history_block(turns: list[dict]) -> str:
    if not turns:
        return ""
    lines: list[str] = []
    for row in turns:
        if row.get("user"):
            lines.append(f"Evens: {row['user']}")
        if row.get("jarvis"):
            lines.append(f"Jarvis: {row['jarvis']}")
    return "Recent conversation:\n" + "\n".join(lines)


def identity_block(retrieve_roots: list[Path] | None, hive: Path) -> str:
    stamp = now_iso()[:16]
    if retrieve_roots is None and _PACK_CACHE.get("identity") and _PACK_CACHE.get("id_at") == stamp:
        return str(_PACK_CACHE["identity"])
    stack = load_json(hive / "agent-stack.json")
    who = str(stack.get("operator") or "Evens").strip() or "Evens"
    lines = [
        "Identity (every turn):",
        f"You are Jarvis. The operator is {who} Louis. This is his hive OS on the 8GB Mac.",
        "You are Jarvis on a voice face. Think with the Cursor harness.",
        "Memory is the store: Obsidian vault, this repo, chat sessions, and the hive.",
        "Talk like a colleague. Two to four spoken sentences. Finish the last sentence. Under 70 words.",
        "Do not ask to send this to a desk. Do not spawn Grok Bot. Hard steps stay Evens.",
        catalog_block(),
    ]
    found = RETRIEVE.search("who am I north stars", retrieve_roots)
    for hit in (found.get("hits") or [])[:2]:
        snippet = str(hit.get("snippet") or "").strip()
        if snippet:
            lines.append(f"{hit.get('path') or 'vault'}: {snippet}")
    text = "\n".join(lines)
    if retrieve_roots is None:
        _PACK_CACHE["id_at"] = stamp
        _PACK_CACHE["identity"] = text
    return text


def converse_context(
    utterance: str, retrieve_roots: list[Path] | None, hive: Path, turns: list[dict]
) -> tuple[str, list, str]:
    parts = [identity_block(retrieve_roots, hive)]
    stamp = now_iso()[:16]
    pack = str(_PACK_CACHE.get("store") or "")
    live = retrieve_roots is None
    if live and pack and _PACK_CACHE.get("store_at") == stamp:
        parts.append(pack)
    else:
        pack = STORE.store_pack(hive, live_sessions=live)
        if live:
            _PACK_CACHE["store"] = pack
            _PACK_CACHE["store_at"] = stamp
        parts.append(pack)
    hist = history_block(turns)
    if hist:
        parts.append(hist)
    vault_spoken, cites = _vault_extract(utterance, retrieve_roots)
    if cites:
        bits = [f"{hit.get('path')}: {hit.get('snippet')}" for hit in cites[:3]]
        parts.append("Vault snippets (only if they match this turn):\n" + "\n".join(bits))
    if LIFE_RE.search(utterance or ""):
        life = RETRIEVE.life_card(retrieve_roots)
        parts.append("Life card (vault + lanes only):\n" + str(life.get("spoken") or ""))
    return "\n\n".join(parts), cites, vault_spoken


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


def classify(utterance: str) -> dict:
    text = (utterance or "").strip()
    if not text:
        return {"verb": "idle", "needs_ask": False, "args": {}, "host": "local"}
    if HARD_REFUSE.search(text):
        return {
            "verb": "refuse",
            "needs_ask": False,
            "args": {"reason": "hard-step or operate-never"},
            "host": "local",
        }
    if STOP_RE.match(text):
        return {"verb": "stop", "needs_ask": False, "args": {}, "host": "local"}
    if GREET_RE.match(text):
        return {"verb": "greet", "needs_ask": False, "args": {}, "host": "local"}
    if len(text) <= 2 or CRUMB_RE.match(text):
        return {"verb": "crumb", "needs_ask": False, "args": {}, "host": "local"}
    mode_hit = MODE_RE.search(text)
    if mode_hit:
        picked = (mode_hit.group(1) or "").lower()
        if picked in ("ask", "plan", "agent"):
            rest = text[mode_hit.end() :].strip()
            rest = re.sub(r"^[,.\s]+(?:and\s+)?", "", rest, flags=re.I).strip()
            return {
                "verb": "mode",
                "needs_ask": False,
                "args": {"mode": picked, "rest": rest},
                "host": "local",
            }
    if HEAL_RE.search(text):
        return {"verb": "heal", "needs_ask": False, "args": {"text": text}, "host": "local"}
    if TODAY_RE.search(text):
        return {"verb": "today", "needs_ask": False, "args": {}, "host": "local"}
    if CAN_RE.search(text):
        return {"verb": "can", "needs_ask": False, "args": {}, "host": "local"}
    if re.search(r"\b(list skills|hive skills)\b", text, re.I):
        return {"verb": "skills", "needs_ask": False, "args": {}, "host": "local"}
    skill_hit = SKILL_RE.search(text)
    if skill_hit:
        return {
            "verb": "skill",
            "needs_ask": False,
            "args": {"slug": skill_hit.group(1).lower(), "text": text},
            "host": "cursor",
        }
    build_hit = BUILD_RE.search(text)
    if build_hit:
        return {
            "verb": "build",
            "needs_ask": False,
            "args": {"kind": (build_hit.group(2) or "skill").lower(), "text": text},
            "host": "cursor",
        }
    if LIFE_RE.search(text):
        return {"verb": "life", "needs_ask": False, "args": {}, "host": "local"}
    if FILE_RE.search(text):
        return {"verb": "files", "needs_ask": False, "args": {"text": text}, "host": "local"}
    if SEARCH_RE.search(text):
        return {"verb": "search", "needs_ask": False, "args": {"text": text}, "host": "local"}
    if WATCH_RE.search(text):
        return {"verb": "watch_later", "needs_ask": False, "args": {"text": text}, "host": "local"}
    if NEWS_RE.search(text):
        return {"verb": "news", "needs_ask": False, "args": {"text": text}, "host": "local"}
    make_hit = MAKE_RE.search(text)
    if make_hit:
        return {
            "verb": "make",
            "needs_ask": False,
            "args": {"kind": (make_hit.group(1) or "").lower(), "text": text},
            "host": "local",
        }
    if SAFARI_ACT_RE.search(text) and not SEE_RE.search(text):
        return {"verb": "safari", "needs_ask": False, "args": {"text": text}, "host": "local"}
    if STATUS_RE.search(text):
        return {"verb": "status", "needs_ask": False, "args": {"text": text}, "host": "online"}
    if CAL_RE.search(text):
        when = "tomorrow" if re.search(r"tomorrow", text, re.I) else "today"
        return {"verb": "calendar", "needs_ask": False, "args": {"when": when}, "host": "local"}
    if MAIL_RE.search(text):
        return {"verb": "mail", "needs_ask": False, "args": {}, "host": "local"}
    if INVOICE_RE.search(text):
        return {"verb": "invoice", "needs_ask": False, "args": {"text": text}, "host": "local"}
    if REPO_RE.search(text):
        mode = "plan" if re.search(r"\b(fix|edit|implement|change the code)\b", text, re.I) else "ask"
        return {
            "verb": "cursor",
            "needs_ask": False,
            "args": {"text": text, "mode": mode},
            "host": "cursor",
        }
    return {"verb": "converse", "needs_ask": False, "args": {"text": text}, "host": "online"}


def list_skills(limit: int = 8) -> list[str]:
    if not SKILLS_DIR.is_dir():
        return []
    names = []
    for path in sorted(SKILLS_DIR.glob("*.md")):
        if path.name.upper() == "README.md":
            continue
        names.append(path.stem)
        if len(names) >= limit:
            break
    return names


def speak_local(text: str) -> None:
    VOICE.speak_local(text)


def _vault_extract(utterance: str, retrieve_roots: list[Path] | None) -> tuple[str, list]:
    words = RETRIEVE.tokens(utterance)
    if len(words) < 2:
        return "", []
    found = RETRIEVE.search(utterance, retrieve_roots)
    cites = found.get("hits") or []
    if found.get("unknown") or not cites:
        return "", []
    top = cites[0] if isinstance(cites[0], dict) else {}
    if int(top.get("score") or 0) < 4:
        return "", []
    spoken = str(found.get("spoken") or "").strip()
    if is_ask_leak(spoken):
        return "", cites
    return spoken, cites


def _dark_brain() -> dict:
    return {"ok": False, "unknown": True, "wire": "cursor", "spoken": DARK_BRAIN}


def current_mode(bus: dict) -> str:
    mode = str((bus or {}).get("harness_mode") or "agent").strip().lower()
    return mode if mode in ("ask", "plan", "agent") else "agent"


def talk_cursor_mode(harness_mode: str, utterance: str) -> str:
    """Talk is ask (faster, read-only). Full agent only when tools are actually needed."""
    mode = (harness_mode or "ask").strip().lower()
    if mode == "plan":
        return "plan"
    if mode == "ask":
        return "ask"
    if SKILL_RE.search(utterance or "") or REPO_RE.search(utterance or "") or BUILD_RE.search(utterance or ""):
        return "agent"
    if re.search(r"\b(edit the|implement|change the code|run (?:this )?skill|run (?:the )?workflow)\b", utterance or "", re.I):
        return "agent"
    return "ask"


def _pack_harness(
    utterance: str, context: str, *, mode: str, see: str = "", skill_slug: str = "", build_kind: str = ""
) -> str:
    lead = (
        "Speak as Jarvis to Evens on the local voice face. "
        "Two to four spoken sentences. Finish the last sentence. Under 70 words. "
        f"Cursor harness mode: {mode}. "
        "Skills SSOT: scripts/hive/grok-skills/ and .cursor/skills/ — read one SKILL.md when the job matches. "
        "Do not spawn Grok Bot. You already have the same catalog. "
        "Safari on this Mac is already logged in. Use that session. Not Chrome. "
        "Hard steps (send/pay/deploy/book/publish) stay Evens. No yolo.\n"
    )
    if mode == "ask":
        lead += "Ask mode: explain only. Do not edit files.\n"
    elif mode == "plan":
        lead += "Plan mode: propose a plan. Do not edit files.\n"
    else:
        lead += "Agent mode: use tools and skills. Do not send, pay, deploy, book, or publish.\n"
    body = (utterance or "").strip()
    extra = (context or "").strip()
    if skill_slug:
        path = SKILLS_DIR / f"{skill_slug}.md"
        extra = f"Load skill {skill_slug} from {path}. Run it here. Do not spawn Grok Bot.\n\n{extra}"
    if build_kind:
        dest = "scripts/hive/grok-skills/<slug>.md" if build_kind == "skill" else (
            "workflows/" if build_kind == "workflow" else "apps/agent-stack/"
        )
        extra = (
            f"Build a new {build_kind} in {dest}. Same catalog Grok Bot mirrors. "
            "Do not spawn Grok Bot. Do not send, pay, deploy, book, or publish.\n\n"
            f"{extra}"
        )
    if see:
        extra = f"{see}\n\n{extra}"
    if extra:
        body = f"{body}\n\n{extra[:4500]}"
    return lead + "\n" + body


def _call_cursor_harness(packed: str, cursor_fn, resume: str | None, mode: str) -> dict:
    fn = cursor_fn or (ONLINE.call_cursor_turn if ONLINE is not None else None)
    if fn is None:
        return _dark_brain()
    try:
        return fn(packed, mode=mode, resume=resume)
    except TypeError:
        try:
            return fn(packed, mode=mode)
        except TypeError:
            return fn(packed)


def _call_brain(
    utterance: str,
    context: str,
    grok,
    cursor_fn,
    resume: str | None,
    *,
    mode: str,
    see: str = "",
    skill_slug: str = "",
    build_kind: str = "",
) -> dict:
    packed = _pack_harness(
        utterance, context, mode=mode, see=see, skill_slug=skill_slug, build_kind=build_kind
    )
    if cursor_fn is not None:
        return _call_cursor_harness(packed, cursor_fn, resume, mode)
    if grok is not None:
        return grok(utterance, context)
    return _call_cursor_harness(packed, None, resume, mode)


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


def _split_sentences(text: str) -> list[str]:
    body = (text or "").strip()
    if not body:
        return []
    if ONLINE is not None and hasattr(ONLINE, "take_sentences"):
        sents, rest = ONLINE.take_sentences(body)
        if rest.strip():
            sents = list(sents) + [rest.strip()]
        return sents or [body]
    return [body]


def _inbox_apply(verb: str, utterance: str, retrieve_roots: list[Path] | None, when: str = "today") -> tuple[str, list, list]:
    if INBOX is None:
        return f"UNKNOWN. {verb} wire is not loaded.", [verb], []
    if verb == "calendar":
        got = INBOX.calendar_events(when)
    elif verb == "mail":
        got = INBOX.mail_unread()
    else:
        got = INBOX.invoice_lookup(utterance, retrieve_roots)
    cites = got.get("cites") if isinstance(got.get("cites"), list) else []
    return str(got.get("spoken") or f"UNKNOWN. {verb} wire returned nothing."), [got.get("wire") or verb], cites


def _pick_resume(bus: dict, cursor_mode: str, cursor_fn, grok) -> tuple[str | None, str]:
    if cursor_mode == "agent":
        chat = str((bus or {}).get("jarvis_agent_chat_id") or "").strip() or None
        field = "agent"
    else:
        chat = str((bus or {}).get("jarvis_chat_id") or "").strip() or None
        field = "talk"
    if chat is None and cursor_fn is None and grok is None and ONLINE is not None:
        chat = ONLINE.ensure_jarvis_chat(None)
    return chat, field


def _see_pack(utterance: str, hive: Path, see_fn) -> str:
    want_grab = bool(SEE_RE.search(utterance or ""))
    if see_fn is None and not want_grab:
        return ""
    fn = see_fn
    if fn is None and SEE is not None:
        def fn() -> dict:
            return SEE.snapshot(hive=hive, grab=want_grab)
    if fn is None:
        return ""
    try:
        snap = fn()
    except TypeError:
        snap = fn(hive)
    if not isinstance(snap, dict):
        return ""
    if SEE is not None:
        return SEE.see_block(snap)
    return str(snap.get("spoken") or "")


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
):
    spoken = (utterance or "").strip()
    bus_now = load_json(hive / "bus" / "state.json")
    if scrub_bus_ask(bus_now):
        write_json(hive / "bus" / "state.json", bus_now)

    plan = classify(spoken)
    if plan.get("needs_ask") or plan.get("verb") == "desk":
        plan = {"verb": "converse", "needs_ask": False, "args": {"text": spoken}, "host": "online"}
    verb = plan["verb"]
    prior_turns = load_turns(bus_now)
    cites: list = []
    wires: list = []
    resume_chat: str | None = None
    resume_field = "talk"
    harness_mode = current_mode(bus_now)

    def finish(narration: str, *, host: str | None = None, spoken_delta: str | None = None) -> dict:
        text = DARK_BRAIN if is_ask_leak(narration or "") else narration
        if text and str(text).upper().startswith("UNKNOWN"):
            record_spoken_scar(text, hive)
        next_turns = prior_turns if verb == "idle" else append_turn(prior_turns, spoken, text)
        bus_write(
            hive,
            phase="speak",
            job_status="done",
            utterance=spoken,
            permission_ask=None,
            spoken=text,
            cites=cites,
            wires=wires,
            turns=next_turns,
            jarvis_chat_id=resume_chat if resume_field == "talk" else None,
            jarvis_agent_chat_id=resume_chat if resume_field == "agent" else None,
            harness_mode=harness_mode,
        )
        delta = text if spoken_delta is None else spoken_delta
        return _turn_event(
            spoken=text,
            verb=verb,
            host=host or plan["host"],
            cites=cites,
            wires=wires,
            args=plan.get("args"),
            done=True,
            spoken_delta=delta,
            partial=False,
        )

    if verb == "stop":
        if ONLINE is not None and hasattr(ONLINE, "cancel_cursor"):
            ONLINE.cancel_cursor()
        yield finish("Stopped. Standing by.", host="local")
        return
    if verb == "refuse":
        yield finish("I will not do that. Send, pay, deploy, book, and publish stay with you.", host="local")
        return

    if verb == "idle":
        yield finish("Holding. Say Jarvis, or tap Space.")
        return
    if verb == "greet":
        yield finish("Hey Evens. Standing by.")
        return
    if verb == "crumb":
        yield finish("That cut off. Say the rest.")
        return
    if verb == "mode":
        harness_mode = str(plan.get("args", {}).get("mode") or "agent")
        rest = str(plan.get("args", {}).get("rest") or "").strip()
        if harness_mode == "ask":
            narration = "Ask mode. I explain. I do not edit."
        elif harness_mode == "plan":
            narration = "Plan mode. I propose. I do not edit."
        else:
            narration = "Agent mode. Tools, skills, Safari, and your screen are on the table."
        if rest:
            bus_write(
                hive,
                phase="think",
                job_status="working",
                utterance=spoken,
                permission_ask=None,
                spoken=narration,
                turns=prior_turns,
                harness_mode=harness_mode,
            )
            yield from apply_turn_iter(
                rest,
                approved=approved,
                hive=hive,
                retrieve_roots=retrieve_roots,
                grok=grok,
                status_fn=status_fn,
                cursor_fn=cursor_fn,
                see_fn=see_fn,
            )
            return
        yield finish(narration)
        return
    if verb == "heal":
        narration, wires, _scars = heal_spoken(hive, retrieve_roots, cursor_fn, grok)
        yield finish(narration, host="local")
        return
    if verb == "today":
        yield finish(today_spoken(retrieve_roots, hive), host="local")
        return
    if verb == "can":
        yield finish(capabilities_spoken())
        return
    if verb == "skills":
        yield finish(skills_spoken())
        return
    if verb == "life":
        got = RETRIEVE.life_card(retrieve_roots)
        cites = got.get("cites") if isinstance(got.get("cites"), list) else []
        wires = ["life"]
        yield finish(str(got.get("spoken") or "UNKNOWN. Life card is empty."), host="local")
        return
    if verb == "files":
        fn = FILES.search_files if FILES is not None else None
        if fn is None:
            narration = "UNKNOWN. Local file wire is not loaded."
            wires = ["files"]
        else:
            got = fn(spoken)
            narration = str(got.get("spoken") or "UNKNOWN. Local file search returned nothing.")
            wires = [got.get("wire") or "files"]
            cites = got.get("hits") if isinstance(got.get("hits"), list) else []
        yield finish(narration, host="local")
        return
    if verb == "search":
        if NAMED is None:
            narration = "UNKNOWN. Web search hand is not loaded."
            wires = ["search"]
        else:
            got = NAMED.web_search(spoken, hive=hive)
            narration = str(got.get("spoken") or "UNKNOWN. Search returned no real links.")
            wires = [got.get("wire") or "search"]
            cites = got.get("cites") if isinstance(got.get("cites"), list) else []
        yield finish(narration, host="local")
        return
    if verb == "watch_later":
        if NAMED is None:
            narration = "UNKNOWN. Watch Later hand is not loaded."
            wires = ["watch_later"]
        else:
            got = NAMED.watch_later(hive=hive)
            narration = str(got.get("spoken") or "UNKNOWN. Watch Later returned nothing.")
            wires = [got.get("wire") or "watch_later"]
            cites = [{"title": t} for t in (got.get("titles") or []) if t]
        yield finish(narration, host="local")
        return
    if verb == "news":
        if NAMED is None:
            narration = "UNKNOWN. News hand is not loaded. I will not invent headlines."
            wires = ["news"]
        else:
            got = NAMED.news_from_disk(spoken, retrieve_roots)
            narration = str(got.get("spoken") or "UNKNOWN. No news on disk.")
            wires = [got.get("wire") or "news"]
            cites = got.get("hits") if isinstance(got.get("hits"), list) else []
        yield finish(narration, host="local")
        return
    if verb == "make":
        if NAMED is None:
            narration = "UNKNOWN. Make hand is not loaded. I will not invent a vendor."
            wires = ["make"]
        else:
            got = NAMED.make_route(spoken)
            narration = str(got.get("spoken") or "UNKNOWN. No matching skill on disk.")
            wires = [got.get("wire") or "make"]
        yield finish(narration, host="local")
        return
    if verb == "safari":
        if SEE is None:
            narration = "UNKNOWN. Safari wire is not loaded."
            wires = ["safari"]
        else:
            got = SEE.safari_act(spoken)
            narration = str(got.get("spoken") or "UNKNOWN. Safari returned nothing.")
            wires = [got.get("wire") or "safari"]
        yield finish(narration, host="local")
        return
    if verb in {"calendar", "mail", "invoice"}:
        when = str(plan.get("args", {}).get("when") or "today")
        narration, wires, cites = _inbox_apply(verb, spoken, retrieve_roots, when)
        yield finish(narration, host="local")
        return
    if verb == "status":
        bus_write(hive, phase="think", job_status="working", utterance=spoken, permission_ask=None, turns=prior_turns)
        fn = status_fn or (ONLINE.status if ONLINE is not None else None)
        if fn is None:
            narration = f"Phase {bus_now.get('phase') or 'idle'}. Job {bus_now.get('job_status') or 'done'}."
            wires = []
        else:
            text = spoken.lower()
            which = "all"
            if "cursor" in text:
                which = "cursor"
            elif any(w in text for w in ("vps", "hostinger")):
                which = "vps"
            elif any(w in text for w in ("hive", "golden", "scorpion")):
                which = "hive"
            got = fn(which)
            narration = got.get("spoken") or "UNKNOWN. Status wires returned nothing."
            wires = [p.get("wire") for p in (got.get("parts") or []) if p.get("wire")] or ["status"]
        yield finish(narration)
        return
    if verb == "cursor":
        bus_write(hive, phase="think", job_status="working", utterance=spoken, permission_ask=None, turns=prior_turns)
        mode = str(plan.get("args", {}).get("mode") or "ask")
        resume_chat, resume_field = _pick_resume(bus_now, mode, cursor_fn, grok)
        fn = cursor_fn or (ONLINE.call_cursor_turn if ONLINE is not None else None)
        if fn is None:
            narration = "UNKNOWN. Cursor wire is not loaded."
            wires = ["cursor"]
        else:
            try:
                got = fn(spoken, mode=mode, resume=resume_chat)
            except TypeError:
                try:
                    got = fn(spoken, mode=mode)
                except TypeError:
                    got = fn(spoken)
            narration = str(got.get("spoken") or "").strip() or "UNKNOWN. Cursor returned no text."
            wires = [got.get("wire") or "cursor"]
            if got.get("chat_id"):
                resume_chat = str(got.get("chat_id") or resume_chat or "").strip() or resume_chat
        yield finish(narration)
        return
    if verb not in {"converse", "skill", "build"}:
        yield finish("Holding. Say Jarvis, or tap Space.")
        return

    bus_write(
        hive,
        phase="think",
        job_status="working",
        utterance=spoken,
        permission_ask=None,
        turns=prior_turns,
        harness_mode=harness_mode,
    )
    context, cites, _vault_spoken = converse_context(spoken, retrieve_roots, hive, prior_turns)
    skill_slug = str(plan.get("args", {}).get("slug") or "")
    if not skill_slug:
        skill_hit = SKILL_RE.search(spoken)
        skill_slug = skill_hit.group(1).lower() if skill_hit else ""
    build_kind = str(plan.get("args", {}).get("kind") or "") if verb == "build" else ""
    see = _see_pack(spoken, hive, see_fn)
    cursor_mode = "agent" if verb in {"skill", "build"} else talk_cursor_mode(harness_mode, spoken)
    resume_chat, resume_field = _pick_resume(bus_now, cursor_mode, cursor_fn, grok)
    last_jarvis = str(prior_turns[-1].get("jarvis") or "") if prior_turns else ""
    skip_cursor = cursor_fn is None and grok is None and (
        cursor_blocked(hive)
        or (
            last_jarvis.upper().startswith("UNKNOWN")
            and SCARS is not None
            and SCARS.lookup(last_jarvis) is not None
        )
    )
    if skip_cursor:
        wires = ["store"]
        if vault_spoken := _vault_spoken:
            narration = vault_spoken
        else:
            scar = SCARS.lookup(last_jarvis) if SCARS is not None and last_jarvis else None
            if scar is None and SCARS is not None:
                scar = SCARS.lookup("agent login")
            extra = SCARS.spoken_heal(scar) if scar and SCARS is not None else "I will not repeat that dark call."
            narration = extra + " " + today_spoken(retrieve_roots, hive)
        yield finish(narration)
        return
    use_stream = (
        cursor_fn is None
        and grok is None
        and ONLINE is not None
        and hasattr(ONLINE, "call_cursor_turn_iter")
    )
    if use_stream:
        packed = _pack_harness(
            spoken, context, mode=cursor_mode, see=see, skill_slug=skill_slug, build_kind=build_kind
        )
        buf = ""
        spoken_parts: list[str] = []
        got_done: dict | None = None
        for ev in ONLINE.call_cursor_turn_iter(packed, mode=cursor_mode, resume=resume_chat):
            if ev.get("cancelled"):
                narration = "Stopped. Standing by."
                wires = ["cursor"]
                yield finish(narration)
                return
            if ev.get("delta"):
                buf += str(ev.get("delta") or "")
                sents, buf = ONLINE.take_sentences(buf)
                for sent in sents:
                    spoken_parts.append(sent)
                    acc = " ".join(spoken_parts)
                    yield _turn_event(
                        spoken=acc,
                        verb=verb,
                        host=plan["host"],
                        cites=cites,
                        wires=["cursor"],
                        args=plan.get("args"),
                        done=False,
                        spoken_delta=sent,
                        partial=True,
                    )
            if ev.get("done") or ev.get("chat_id") or ev.get("unknown"):
                got_done = ev
                if ev.get("chat_id"):
                    resume_chat = str(ev.get("chat_id") or resume_chat or "").strip() or resume_chat
        remainder = buf.strip()
        if remainder:
            spoken_parts.append(remainder)
            acc = " ".join(spoken_parts)
            yield _turn_event(
                spoken=acc,
                verb=verb,
                host=plan["host"],
                cites=cites,
                wires=["cursor"],
                args=plan.get("args"),
                done=False,
                spoken_delta=remainder,
                partial=True,
            )
        acc = " ".join(spoken_parts).strip()
        reply = acc or str((got_done or {}).get("spoken") or "").strip()
        if reply and not is_ask_leak(reply):
            narration = reply
            wires = [(got_done or {}).get("wire") or "cursor"]
        else:
            dark = _dark_brain()
            narration = dark.get("spoken") or DARK_BRAIN
            wires = [dark.get("wire") or "cursor"]
        yield finish(narration, spoken_delta="")
        return

    got = _call_brain(
        spoken,
        context,
        grok,
        cursor_fn,
        resume_chat,
        mode=cursor_mode,
        see=see,
        skill_slug=skill_slug,
        build_kind=build_kind,
    )
    if got.get("cancelled"):
        narration = "Stopped. Standing by."
        wires = ["cursor"]
    else:
        if got.get("chat_id"):
            resume_chat = str(got.get("chat_id") or resume_chat or "").strip() or resume_chat
        reply = str(got.get("spoken") or "").strip()
        if reply and not is_ask_leak(reply):
            narration = reply
            wires = [got.get("wire") or "cursor"]
        else:
            dark = _dark_brain()
            narration = dark.get("spoken") or DARK_BRAIN
            wires = [dark.get("wire") or "cursor"]
    yield finish(narration)


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
    ):
        last = ev
    if speak:
        speak_local(str(last.get("spoken") or ""))
    return {
        "ok": True,
        "verb": last.get("verb") or "converse",
        "ask": False,
        "spoken": last.get("spoken") or "",
        "host": last.get("host") or "online",
        "args": last.get("args"),
        "cites": last.get("cites") or [],
        "wires": last.get("wires") or [],
    }


def self_test() -> dict:
    import tempfile

    def fake_grok(prompt: str, context: str = "") -> dict:
        extra = " with vault" if "Vault snippets" in (context or "") else ""
        return {
            "ok": True,
            "unknown": False,
            "wire": "grok",
            "engine": "xai",
            "spoken": f"Grok live{extra}: {prompt[:80]}",
        }

    def fake_status(which: str = "all") -> dict:
        return {
            "ok": True,
            "verb": "status",
            "wire": "status",
            "spoken": f"Hive golden paths 1/3. VPS srv765579 live. Cursor CLI present. slice={which}",
            "parts": [{"wire": "hive"}, {"wire": "vps"}, {"wire": "cursor"}],
        }

    leak = ("say yes", "Grok desk", "send this to the Grok", "May I hand this")

    def _no_ask(out: dict) -> bool:
        text = out.get("spoken") or ""
        return not out.get("ask") and not out.get("permission_ask") and not any(bit.lower() in text.lower() for bit in leak)

    with tempfile.TemporaryDirectory(prefix="agent-stack-mouth-") as tmp:
        hive = Path(tmp)
        vault = hive / "vault"
        vault.mkdir(parents=True)
        (vault / "OPERATOR_MEMORY.md").write_text(
            "# Operator Memory\n\nFour north stars start with maximum leverage, minimum noise.\n",
            encoding="utf-8",
        )
        (hive / "bus").mkdir(parents=True)
        refused = apply_turn("send this email", hive=hive)
        if refused.get("verb") != "refuse" or refused.get("ask"):
            return {"ok": False, "errors": ["send this email must refuse, not ask"], "got": refused}
        for line in ("what's my north star", "hey how are you", "what's going on", "remember this", "send me a joke", "tell me a joke"):
            out = apply_turn(line, hive=hive, retrieve_roots=[vault], grok=fake_grok)
            jobs = hive / "bus" / "jobs.jsonl"
            if out.get("ask") or not _no_ask(out) or jobs.is_file():
                return {"ok": False, "errors": [f"{line!r} must converse with no ask and no queue"], "got": out}
            if classify(line)["needs_ask"] or classify(line)["verb"] in {"desk", "hello", "idle", "refuse"}:
                return {"ok": False, "errors": [f"{line!r} classified as desk/ask/hello"], "got": classify(line)}
        hi = apply_turn("hey", hive=hive, retrieve_roots=[vault], grok=fake_grok)
        if hi.get("verb") != "greet" or hi.get("ask") or not _no_ask(hi):
            return {"ok": False, "errors": ["hey must greet locally"], "got": hi}
        leftover = hive / "bus" / "state.json"
        stale_ask = "May I " + "hand this to the " + "grok desk? Say yes to approve."
        leftover.write_text(
            json.dumps(
                {
                    "schema_version": 1,
                    "phase": "speak",
                    "job_status": "yellow",
                    "utterance": "Hello",
                    "permission_ask": stale_ask,
                    "spoken": stale_ask,
                    "turns": [],
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        for line in ("what's going on", "tell me a joke"):
            out = apply_turn(line, hive=hive, retrieve_roots=[vault], grok=fake_grok)
            if out.get("ask") or not _no_ask(out) or out.get("verb") != "converse":
                return {"ok": False, "errors": [f"leftover ASK must not speak on {line!r}"], "got": out}
            if load_json(leftover).get("permission_ask"):
                return {"ok": False, "errors": ["leftover permission_ask must be cleared"], "got": load_json(leftover)}
        seen: list[str] = []

        def rec_grok(prompt: str, context: str = "") -> dict:
            seen.append(context)
            return {"ok": True, "unknown": False, "wire": "grok", "engine": "xai", "spoken": f"Grok live: {prompt[:80]}"}

        apply_turn("tell me a joke about bitcoin", hive=hive, retrieve_roots=[vault], grok=rec_grok)
        follow = apply_turn("that was terrible", hive=hive, retrieve_roots=[vault], grok=rec_grok)
        if follow.get("verb") != "converse" or "tell me a joke about bitcoin" not in (seen[-1] if seen else ""):
            return {"ok": False, "errors": ["follow-up must send recent conversation to Grok"], "got": follow, "ctx": seen[-1] if seen else ""}
        if "Identity" not in (seen[-1] if seen else "") or "Evens" not in (seen[-1] if seen else ""):
            return {"ok": False, "errors": ["converse must attach identity every turn"], "got": seen[-1] if seen else ""}
        if "Store (this is the brain)" not in (seen[-1] if seen else ""):
            return {"ok": False, "errors": ["converse must attach the store pack"], "got": seen[-1] if seen else ""}
        thought = apply_turn("what's my north star", hive=hive, retrieve_roots=[vault], grok=fake_grok)
        if thought.get("verb") != "converse" or "Grok live" not in (thought.get("spoken") or ""):
            return {"ok": False, "errors": ["converse must CALL the talk host and speak the reply"], "got": thought}
        empty = hive / "empty"
        empty.mkdir()
        dark = apply_turn(
            "what should I work on",
            hive=hive,
            retrieve_roots=[empty],
            grok=lambda prompt, context="": {"ok": False, "unknown": True, "spoken": ""},
        )
        if DARK_BRAIN not in (dark.get("spoken") or "") or not _no_ask(dark):
            return {"ok": False, "errors": ["empty harness must name Cursor harness, never xAI keys"], "got": dark}
        if "XAI_API_KEY" in (dark.get("spoken") or "") or "GROK_API_KEY" in (dark.get("spoken") or ""):
            return {"ok": False, "errors": ["must not nag for xAI keys"], "got": dark}
        vaulted = apply_turn(
            "what's my north star",
            hive=hive,
            retrieve_roots=[vault],
            grok=lambda prompt, context="": {"ok": False, "unknown": True, "spoken": ""},
        )
        if vaulted.get("ask") or DARK_BRAIN not in (vaulted.get("spoken") or ""):
            return {"ok": False, "errors": ["empty harness must not fake a vault monologue"], "got": vaulted}
        st = apply_turn("what's the VPS status", hive=hive, status_fn=fake_status)
        if st.get("verb") != "status" or "VPS" not in (st.get("spoken") or "") or st.get("ask"):
            return {"ok": False, "errors": ["status must CALL live wires with no ask"], "got": st}
        live = set_listen(hive, True)
        if live.get("phase") != "listen" or live.get("mic") != "live":
            return {"ok": False, "errors": ["LIVE did not write listen"]}
        mute = set_listen(hive, False)
        if mute.get("mic") != "mute":
            return {"ok": False, "errors": ["MUTE did not write mute"]}
        if (hive / "bus" / "jobs.jsonl").is_file():
            return {"ok": False, "errors": ["jobs.jsonl must not be the converse path"]}
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
