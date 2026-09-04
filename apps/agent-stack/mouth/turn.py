#!/usr/bin/env python3
"""Mouth sitting: utterance → file bus → local vault Q&A or Cursor/Grok job.

Always-on lives on the face (LIVE/MUTE). This module is the write path.
Auto-approve stays off. ElevenLabs is ASK. Hands stay parked.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
SKILLS_DIR = ROOT / "scripts/hive/grok-skills"
HARD_REFUSE = re.compile(
    r"\b(send|pay|deploy|book|publish|dial|twilio|retell|vapi|"
    r"claude code|fable|cowork|auto-?approve|take over (my )?(mouse|computer))\b",
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
MEMORY_RE = re.compile(
    r"\b(what(?:'s|s| is| are| does| do)|where(?:'s| is)|who(?:'s| is)|"
    r"when(?:'s| is)|why |how (?:do|does|is|are)|remind|remember|"
    r"vault|operator memory|in (?:my |the )?(?:vault|memory|wiki)|"
    r"tell me (?:about|what)|do i have|did i (?:say|write|decide)|"
    r"what(?:'s| is) in)\b",
    re.I,
)
ACTION_RE = re.compile(
    r"\b(build|write|research|look at|browse|open|watch|queue|spawn|"
    r"draft|fix|implement|make|create)\b",
    re.I,
)


def _load_retrieve():
    path = Path(__file__).resolve().parent.parent / "memory" / "retrieve.py"
    spec = importlib.util.spec_from_file_location("agent_stack_retrieve", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


RETRIEVE = _load_retrieve()


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


def append_job(hive: Path, row: dict) -> dict:
    path = hive / "bus" / "jobs.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    row = {**row, "id": row.get("id") or f"job-{now_iso()}", "ts": now_iso()}
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row) + "\n")
    return row


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
    if re.search(r"\b(status|bus|what are you doing|phase)\b", text, re.I):
        return {"verb": "status", "needs_ask": False, "args": {}, "host": "local"}
    if SKILL_RE.search(text) or re.search(r"\b(list skills|hive skills)\b", text, re.I):
        slug = SKILL_RE.search(text)
        return {
            "verb": "skill" if slug else "skills",
            "needs_ask": False,
            "args": {"slug": slug.group(1).lower()} if slug else {},
            "host": "local",
        }
    if MEMORY_RE.search(text) and not ACTION_RE.search(text):
        return {"verb": "memory", "needs_ask": False, "args": {"text": text}, "host": "local"}
    if re.search(r"\b(browse|open (the )?(page|url|site)|watch|cursor-)\b", text, re.I):
        return {"verb": "desk", "needs_ask": True, "args": {"text": text}, "host": "cursor"}
    return {"verb": "desk", "needs_ask": True, "args": {"text": text}, "host": "grok"}


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


def apply_turn(
    utterance: str,
    *,
    approved: bool = False,
    hive: Path = HIVE,
    speak: bool = False,
    retrieve_roots: list[Path] | None = None,
) -> dict:
    spoken = (utterance or "").strip()
    bus_now = load_json(hive / "bus" / "state.json")
    prior = str(bus_now.get("utterance") or "").strip()
    if YES_RE.match(spoken) and bus_now.get("permission_ask") and prior:
        return apply_turn(prior, approved=True, hive=hive, speak=speak, retrieve_roots=retrieve_roots)
    if NO_RE.match(spoken) and bus_now.get("permission_ask"):
        bus_write(hive, phase="speak", job_status="done", utterance=spoken, permission_ask=None, spoken="Okay, cancelled.")
        out = {"ok": True, "verb": "cancel", "ask": False, "spoken": "Okay, cancelled.", "host": "local", "cites": []}
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
        return {"ok": True, "verb": verb, "ask": False, "spoken": narration, "host": "local", "cites": []}

    if plan["needs_ask"] and not approved:
        ask = f"May I hand this to the {plan['host']} desk? Say yes to approve."
        bus_write(hive, phase="speak", job_status="yellow", utterance=spoken, permission_ask=ask, spoken=ask)
        if speak:
            speak_local(ask)
        return {"ok": True, "verb": verb, "ask": True, "spoken": ask, "host": plan["host"], "permission_ask": ask, "cites": []}

    cites: list = []
    if verb == "idle":
        narration = "Holding. Say Jarvis, or tap Space."
    elif verb == "status":
        narration = f"Phase {bus_now.get('phase') or 'idle'}. Job {bus_now.get('job_status') or 'done'}."
    elif verb == "skills":
        narration = "Hive skills: " + ", ".join(list_skills()) + "."
    elif verb == "skill":
        slug = plan["args"]["slug"]
        path = SKILLS_DIR / f"{slug}.md"
        narration = f"Loaded {slug}." if path.is_file() else f"No skill named {slug}."
    elif verb == "memory":
        bus_write(hive, phase="think", job_status="working", utterance=spoken, permission_ask=None)
        found = RETRIEVE.search(spoken, retrieve_roots)
        cites = found.get("hits") or []
        narration = found.get("spoken") or "I don't have that in the vault. UNKNOWN."
    else:
        job = append_job(
            hive,
            {
                "kind": "desk-turn",
                "host": plan["host"],
                "utterance": spoken,
                "status": "queued",
                "note": "Cursor SDK Agent.send or one Grok desk turn. Not Claude Code.",
            },
        )
        narration = f"Queued for the {plan['host']} desk. Auto-approve stays off."
        plan = {**plan, "job": job}

    bus_write(
        hive,
        phase="speak",
        job_status="done",
        utterance=spoken,
        permission_ask=None,
        spoken=narration,
        cites=cites,
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
    }


def self_test() -> dict:
    import tempfile

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
        if refused.get("verb") != "refuse":
            return {"ok": False, "errors": ["hard-step not refused"]}
        asked = apply_turn("look at the inbound pipeline", hive=hive)
        if not asked.get("ask"):
            return {"ok": False, "errors": ["desk turn must ASK"]}
        yes = apply_turn("yes", hive=hive)
        if yes.get("ask") or not (hive / "bus" / "jobs.jsonl").is_file():
            return {"ok": False, "errors": ["spoken yes did not queue a desk job"]}
        mem = apply_turn("what are the north stars", hive=hive, retrieve_roots=[vault])
        if mem.get("verb") != "memory" or mem.get("ask") or not mem.get("cites"):
            return {"ok": False, "errors": ["vault Q&A missed fixture"], "got": mem}
        unknown = apply_turn("what is the purple zebra protocol", hive=hive, retrieve_roots=[vault])
        if unknown.get("verb") != "memory" or "UNKNOWN" not in (unknown.get("spoken") or ""):
            return {"ok": False, "errors": ["miss should be UNKNOWN"], "got": unknown}
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
    args = ap.parse_args()
    if args.self_test or os.environ.get("AGENT_STACK_MOUTH_SELF_TEST") == "1":
        out = self_test()
        print(json.dumps(out, indent=2))
        return 0 if out.get("ok") else 2
    if not args.utterance:
        print(json.dumps({"ok": False, "error": "utterance required"}))
        return 2
    print(json.dumps(apply_turn(args.utterance, approved=args.approved, speak=args.speak), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
