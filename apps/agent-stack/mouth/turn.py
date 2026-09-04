#!/usr/bin/env python3
"""Mouth sitting: listen → CONVERSE → speak.

Local: face + mic + TTS on 127.0.0.1:4018.
Brain is the store: Obsidian vault + this repo + chat sessions + the hive.
Cursor and Grok are hosts, not the skull.
A normal sentence is a conversation. Never ASK to send it to a desk.
Never queue jobs.jsonl as the answer. No Ollama.
Hard steps (send / pay / deploy / book / publish) refuse — they stay Evens.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
SKILLS_DIR = ROOT / "scripts/hive/grok-skills"
HARD_REFUSE = re.compile(
    r"\b("
    r"send (this|that|the|an?)\s+\w+|"
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
ASK_LEAK = re.compile(
    r"say yes to (approve|send)|send this to the grok desk|"
    r"hand this to the \w+ desk|do you want me to send this",
    re.I,
)
DARK_BRAIN = (
    "Online. I have your vault, repo, sessions, and hive. What are we working on?"
)
DARK_GROK = DARK_BRAIN  # leftover alias — do not mention xAI keys or Cursor-as-brain


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

_ONLINE_PATH = Path(__file__).resolve().parent.parent / "brain" / "online.py"
ONLINE = _load_mod("agent_stack_online", _ONLINE_PATH) if _ONLINE_PATH.is_file() else None


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
    stack = load_json(hive / "agent-stack.json")
    who = str(stack.get("operator") or "Evens").strip() or "Evens"
    lines = [
        "Identity (every turn):",
        f"You are Jarvis. The operator is {who} Louis. This is his hive OS on the 8GB Mac.",
        "The brain is the store: Obsidian vault, this repo, chat sessions, and the hive.",
        "Cursor and Grok are hosts, not the skull. Talk like a colleague.",
        "Resolve pronouns from Recent conversation. Do not ask to send this to a desk.",
        "Hard steps stay Evens.",
    ]
    found = RETRIEVE.search("who am I north stars", retrieve_roots)
    for hit in (found.get("hits") or [])[:2]:
        snippet = str(hit.get("snippet") or "").strip()
        if snippet:
            lines.append(f"{hit.get('path') or 'vault'}: {snippet}")
    return "\n".join(lines)


def converse_context(
    utterance: str, retrieve_roots: list[Path] | None, hive: Path, turns: list[dict]
) -> tuple[str, list, str]:
    parts = [identity_block(retrieve_roots, hive)]
    parts.append(STORE.store_pack(hive, live_sessions=retrieve_roots is None))
    hist = history_block(turns)
    if hist:
        parts.append(hist)
    vault_spoken, cites = _vault_extract(utterance, retrieve_roots)
    if cites:
        bits = [f"{hit.get('path')}: {hit.get('snippet')}" for hit in cites[:3]]
        parts.append("Vault snippets (only if they match this turn):\n" + "\n".join(bits))
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
    if SKILL_RE.search(text) or re.search(r"\b(list skills|hive skills)\b", text, re.I):
        slug = SKILL_RE.search(text)
        return {
            "verb": "skill" if slug else "skills",
            "needs_ask": False,
            "args": {"slug": slug.group(1).lower()} if slug else {},
            "host": "local",
        }
    if STATUS_RE.search(text):
        return {"verb": "status", "needs_ask": False, "args": {"text": text}, "host": "online"}
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
    if os.environ.get("AGENT_STACK_DRY_TTS") == "1" or not text:
        return
    try:
        subprocess.run(["say", "-v", "Daniel", text[:400]], check=False, timeout=20)
    except (OSError, subprocess.TimeoutExpired):
        return


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
    return {"ok": True, "unknown": False, "wire": "store", "spoken": DARK_BRAIN}


def _first_store_line(context: str) -> str:
    for line in (context or "").splitlines():
        text = line.strip()
        if not text or text.startswith("Evens:") or text.startswith("Jarvis:"):
            continue
        low = text.lower()
        if "operator_memory" in low or low.startswith("cited "):
            return text[:280]
    return ""


def _speak_from_store(vault_spoken: str, context: str) -> dict:
    if vault_spoken and not is_ask_leak(vault_spoken):
        return {"ok": True, "unknown": False, "wire": "store", "spoken": vault_spoken}
    cited = _first_store_line(context)
    if cited and not is_ask_leak(cited):
        return {"ok": True, "unknown": False, "wire": "store", "spoken": cited}
    return _dark_brain()


def _talk_host_live() -> bool:
    if ONLINE is None:
        return False
    if ONLINE.grok_api_key():
        return True
    gw = ONLINE.grokbot_gateway()
    return bool(gw and gw.get("base"))


def _call_brain(utterance: str, context: str, grok, vault_spoken: str) -> dict:
    """Talk host answers FROM the store. Cursor is not called on converse."""
    if grok is not None:
        return grok(utterance, context)
    if _talk_host_live():
        return ONLINE.call_grok(utterance, context)
    return _speak_from_store(vault_spoken, context)


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
) -> dict:
    spoken = (utterance or "").strip()
    bus_now = load_json(hive / "bus" / "state.json")
    if scrub_bus_ask(bus_now):
        write_json(hive / "bus" / "state.json", bus_now)

    plan = classify(spoken)
    if plan.get("needs_ask") or plan.get("verb") == "desk":
        plan = {"verb": "converse", "needs_ask": False, "args": {"text": spoken}, "host": "online"}
    verb = plan["verb"]
    prior_turns = load_turns(bus_now)
    if verb == "refuse":
        narration = "I will not do that. Send, pay, deploy, book, and publish stay with you."
        bus_write(
            hive,
            phase="speak",
            job_status="done",
            utterance=spoken,
            permission_ask=None,
            spoken=narration,
            turns=append_turn(prior_turns, spoken, narration),
        )
        if speak:
            speak_local(narration)
        return {"ok": True, "verb": verb, "ask": False, "spoken": narration, "host": "local", "cites": [], "wires": []}

    cites: list = []
    wires: list = []
    vault_spoken = ""
    if verb == "idle":
        narration = "Holding. Say Jarvis, or tap Space."
    elif verb == "skills":
        narration = "Hive skills: " + ", ".join(list_skills()) + "."
    elif verb == "skill":
        slug = plan["args"]["slug"]
        path = SKILLS_DIR / f"{slug}.md"
        narration = f"Loaded {slug}." if path.is_file() else f"No skill named {slug}."
    elif verb == "status":
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
    elif verb == "cursor":
        bus_write(hive, phase="think", job_status="working", utterance=spoken, permission_ask=None, turns=prior_turns)
        fn = cursor_fn or (ONLINE.call_cursor_turn if ONLINE is not None else None)
        mode = str(plan.get("args", {}).get("mode") or "ask")
        if fn is None:
            narration = "UNKNOWN. Cursor wire is not loaded."
            wires = ["cursor"]
        else:
            try:
                got = fn(spoken, mode=mode)
            except TypeError:
                got = fn(spoken)
            narration = str(got.get("spoken") or "").strip() or "UNKNOWN. Cursor returned no text."
            wires = [got.get("wire") or "cursor"]
    elif verb == "converse":
        bus_write(hive, phase="think", job_status="working", utterance=spoken, permission_ask=None, turns=prior_turns)
        context, cites, vault_spoken = converse_context(spoken, retrieve_roots, hive, prior_turns)
        got = _call_brain(spoken, context, grok, vault_spoken)
        reply = str(got.get("spoken") or "").strip()
        if reply and not is_ask_leak(reply):
            narration = reply
            wires = [got.get("wire") or "store"]
        else:
            dark = _speak_from_store(vault_spoken, context)
            narration = dark.get("spoken") or DARK_BRAIN
            wires = [dark.get("wire") or "store"]
    else:
        narration = "Holding. Say Jarvis, or tap Space."

    if is_ask_leak(narration or ""):
        narration = DARK_BRAIN

    next_turns = prior_turns if verb == "idle" else append_turn(prior_turns, spoken, narration)
    bus_write(
        hive,
        phase="speak",
        job_status="done",
        utterance=spoken,
        permission_ask=None,
        spoken=narration,
        cites=cites,
        wires=wires,
        turns=next_turns,
    )
    if speak:
        speak_local(narration)
    return {
        "ok": True,
        "verb": verb,
        "ask": False,
        "spoken": narration,
        "host": plan["host"],
        "args": plan.get("args"),
        "cites": cites,
        "wires": wires,
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
        for line in ("what's my north star", "hey how are you", "hey", "what's going on", "remember this", "send me a joke", "tell me a joke"):
            out = apply_turn(line, hive=hive, retrieve_roots=[vault], grok=fake_grok)
            jobs = hive / "bus" / "jobs.jsonl"
            if out.get("ask") or not _no_ask(out) or jobs.is_file():
                return {"ok": False, "errors": [f"{line!r} must converse with no ask and no queue"], "got": out}
            if classify(line)["needs_ask"] or classify(line)["verb"] in {"desk", "hello", "idle", "refuse"}:
                return {"ok": False, "errors": [f"{line!r} classified as desk/ask/hello"], "got": classify(line)}
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
        for line in ("hey", "what's going on", "tell me a joke"):
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
            return {"ok": False, "errors": ["dark talk host must speak from the store, never Cursor or xAI keys"], "got": dark}
        if "Cursor" in (dark.get("spoken") or "") or "XAI_API_KEY" in (dark.get("spoken") or "") or "GROK_API_KEY" in (dark.get("spoken") or ""):
            return {"ok": False, "errors": ["must not nag for Cursor-as-brain or xAI keys"], "got": dark}
        vaulted = apply_turn(
            "what's my north star",
            hive=hive,
            retrieve_roots=[vault],
            grok=lambda prompt, context="": {"ok": False, "unknown": True, "spoken": ""},
        )
        vault_txt = (vaulted.get("spoken") or "").lower()
        if vaulted.get("ask") or ("north star" not in vault_txt and "leverage" not in vault_txt):
            return {"ok": False, "errors": ["dark talk host must speak vault/store, not Cursor"], "got": vaulted}
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
