#!/usr/bin/env python3
"""Mouth sitting: listen → CONVERSE → speak.

Local: face + mic + TTS on 127.0.0.1:4018 only. Brain is online Grok.
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
    r"\b(send|pay|deploy|book|publish|dial|twilio|retell|vapi|"
    r"claude code|fable|cowork|auto-?approve|take over (my )?(mouse|computer)|"
    r"ollama)\b",
    re.I,
)
YES_RE = re.compile(
    r"^(yes|yeah|yep|yup|do it|approve|go ahead|ok|okay)\s*[.!]?\s*$",
    re.I,
)
NO_RE = re.compile(
    r"^(no|nope|cancel|never mind|stop|don't|do not)\s*[.!]?\s*$",
    re.I,
)
SKILL_RE = re.compile(
    r"\b(?:use|load|run)\s+(?:skill\s+)?([a-z0-9][a-z0-9-]{2,60})\b",
    re.I,
)
STATUS_RE = re.compile(
    r"\b("
    r"status|bus|what are you doing|phase|"
    r"vps|hostinger|server|servers|hive|golden(?: paths)?|"
    r"scorpion|uptime|disk|cursor(?: cli| agent)?|"
    r"what's (?:live|online|running)|whats (?:live|online|running)"
    r")\b",
    re.I,
)
HELLO_RE = re.compile(
    r"^(?:hey|hi|hello|yo|sup|good (?:morning|afternoon|evening))"
    r"(?:\s+jarvis)?[.!]?\s*$",
    re.I,
)
ASK_LEAK = re.compile(
    r"say yes to (approve|send)|send this to the grok desk|"
    r"hand this to the \w+ desk|do you want me to send this",
    re.I,
)
DARK_GROK = "I can't reach Grok (missing XAI_API_KEY or GROK_API_KEY)."


def _load_mod(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


RETRIEVE = _load_mod("agent_stack_retrieve", Path(__file__).resolve().parent.parent / "memory" / "retrieve.py")

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
    write_json(path, bus)
    return bus


def set_listen(hive: Path, live: bool) -> dict:
    """Face owns the mic. LIVE writes listen; MUTE returns to idle unless yellow ASK."""
    path = hive / "bus" / "state.json"
    bus = load_json(path)
    yellow = bus.get("job_status") == "yellow"
    bus.update(
        {
            "schema_version": 1,
            "phase": "listen" if live else ("speak" if yellow else "idle"),
            "job_status": bus.get("job_status") or "done",
            "utterance": bus.get("utterance") or "",
            "permission_ask": bus.get("permission_ask"),
            "mic": "live" if live else "mute",
            "updated_at": now_iso(),
        }
    )
    write_json(path, bus)
    return bus


def classify(utterance: str) -> dict:
    text = (utterance or "").strip()
    if not text or YES_RE.match(text) or NO_RE.match(text):
        return {"verb": "idle", "needs_ask": False, "args": {}, "host": "local"}
    if HARD_REFUSE.search(text):
        return {
            "verb": "refuse",
            "needs_ask": False,
            "args": {"reason": "hard-step or operate-never"},
            "host": "local",
        }
    if HELLO_RE.match(text):
        return {"verb": "hello", "needs_ask": False, "args": {}, "host": "local"}
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
        subprocess.run(["say", "-v", "Samantha", text[:400]], check=False, timeout=20)
    except (OSError, subprocess.TimeoutExpired):
        return


def _vault_extract(utterance: str, retrieve_roots: list[Path] | None) -> tuple[str, list]:
    found = RETRIEVE.search(utterance, retrieve_roots)
    cites = found.get("hits") or []
    if found.get("unknown") or not cites:
        return "", cites
    spoken = str(found.get("spoken") or "").strip()
    if ASK_LEAK.search(spoken):
        return "", cites
    return spoken, cites


def _dark_grok() -> dict:
    if ONLINE is not None:
        got = ONLINE.unknown_grok()
        spoken = str(got.get("spoken") or "").strip()
        if spoken and not ASK_LEAK.search(spoken):
            # Keep the short product line; name the missing wire.
            if "XAI_API_KEY" in spoken or "GROK_API_KEY" in spoken:
                return {**got, "spoken": DARK_GROK}
            return {**got, "spoken": DARK_GROK}
    return {"ok": False, "unknown": True, "wire": "grok", "spoken": DARK_GROK}


def _call_grok(utterance: str, context: str, grok) -> dict:
    if grok is not None:
        return grok(utterance, context)
    if ONLINE is not None:
        return ONLINE.think(utterance, context=context)
    return _dark_grok()


def apply_turn(
    utterance: str,
    *,
    approved: bool = False,
    hive: Path = HIVE,
    speak: bool = False,
    retrieve_roots: list[Path] | None = None,
    grok=None,
    status_fn=None,
) -> dict:
    spoken = (utterance or "").strip()
    bus_now = load_json(hive / "bus" / "state.json")
    prior = str(bus_now.get("utterance") or "").strip()
    if YES_RE.match(spoken) and bus_now.get("permission_ask") and prior:
        return apply_turn(
            prior,
            approved=True,
            hive=hive,
            speak=speak,
            retrieve_roots=retrieve_roots,
            grok=grok,
            status_fn=status_fn,
        )
    if NO_RE.match(spoken) and bus_now.get("permission_ask"):
        bus_write(hive, phase="speak", job_status="done", utterance=spoken, permission_ask=None, spoken="Okay, cancelled.")
        out = {"ok": True, "verb": "cancel", "ask": False, "spoken": "Okay, cancelled.", "host": "local", "cites": [], "wires": []}
        if speak:
            speak_local(out["spoken"])
        return out

    plan = classify(spoken)
    verb = plan["verb"]
    if verb == "refuse":
        narration = "I will not do that. Send, pay, deploy, book, and publish stay with you."
        bus_write(hive, phase="speak", job_status="done", utterance=spoken, permission_ask=None, spoken=narration)
        if speak:
            speak_local(narration)
        return {"ok": True, "verb": verb, "ask": False, "spoken": narration, "host": "local", "cites": [], "wires": []}

    cites: list = []
    wires: list = []
    if verb == "idle":
        narration = "Holding. Say Jarvis, or tap Space."
    elif verb == "hello":
        narration = "Online. Face is local. Brain calls Grok. What are we working on?"
    elif verb == "skills":
        narration = "Hive skills: " + ", ".join(list_skills()) + "."
    elif verb == "skill":
        slug = plan["args"]["slug"]
        path = SKILLS_DIR / f"{slug}.md"
        narration = f"Loaded {slug}." if path.is_file() else f"No skill named {slug}."
    elif verb == "status":
        bus_write(hive, phase="think", job_status="working", utterance=spoken, permission_ask=None)
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
    elif verb == "converse":
        bus_write(hive, phase="think", job_status="working", utterance=spoken, permission_ask=None)
        vault_spoken, cites = _vault_extract(spoken, retrieve_roots)
        context = ""
        if cites:
            bits = [f"{hit.get('path')}: {hit.get('snippet')}" for hit in cites[:3]]
            context = "Vault snippets (one memory among live state):\n" + "\n".join(bits)
        got = _call_grok(spoken, context, grok)
        reply = str(got.get("spoken") or "").strip()
        if got.get("ok") and reply and not ASK_LEAK.search(reply):
            narration = reply
            wires = [got.get("wire") or "grok"]
        elif vault_spoken:
            narration = vault_spoken
            wires = ["vault"]
        else:
            dark = _dark_grok()
            narration = dark.get("spoken") or DARK_GROK
            wires = [dark.get("wire") or "grok"]
    else:
        narration = "Holding. Say Jarvis, or tap Space."

    if ASK_LEAK.search(narration or ""):
        narration = DARK_GROK

    bus_write(
        hive,
        phase="speak",
        job_status="done",
        utterance=spoken,
        permission_ask=None,
        spoken=narration,
        cites=cites,
        wires=wires,
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
        for line in ("what's my north star", "hey how are you", "remember this"):
            out = apply_turn(line, hive=hive, retrieve_roots=[vault], grok=fake_grok)
            jobs = hive / "bus" / "jobs.jsonl"
            if out.get("ask") or not _no_ask(out) or jobs.is_file():
                return {"ok": False, "errors": [f"{line!r} must converse with no ask and no queue"], "got": out}
            if classify(line)["needs_ask"] or classify(line)["verb"] == "desk":
                return {"ok": False, "errors": [f"{line!r} classified as desk/ask"], "got": classify(line)}
        thought = apply_turn("what's my north star", hive=hive, retrieve_roots=[vault], grok=fake_grok)
        if thought.get("verb") != "converse" or "Grok live" not in (thought.get("spoken") or ""):
            return {"ok": False, "errors": ["converse must CALL Grok and speak the reply"], "got": thought}
        dark = apply_turn(
            "what should I work on",
            hive=hive,
            grok=lambda prompt, context="": {"ok": False, "unknown": True, "spoken": ""},
        )
        if "I can't reach Grok" not in (dark.get("spoken") or "") or not _no_ask(dark):
            return {"ok": False, "errors": ["missing Grok must name the wire, never ask"], "got": dark}
        vaulted = apply_turn(
            "what's my north star",
            hive=hive,
            retrieve_roots=[vault],
            grok=lambda prompt, context="": {"ok": False, "unknown": True, "spoken": ""},
        )
        if vaulted.get("ask") or "leverage" not in (vaulted.get("spoken") or "").lower():
            return {"ok": False, "errors": ["dark Grok with vault must speak extractive"], "got": vaulted}
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
