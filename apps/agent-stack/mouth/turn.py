#!/usr/bin/env python3
"""Mouth sitting: utterance → file bus → local brain, or ASK a desk job.

Questions think here (vault retrieve + ollama/extractive). Desk queue is
only for named actions after spoken yes. Hard steps refuse. Hands parked.
Face owns the mic (LIVE/MUTE via set_listen). Do not strip the hear-loop.
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
QUESTION_RE = re.compile(
    r"\b("
    r"what(?:'s|s|'re| are| is| does| do| did| should| was| were)|"
    r"where(?:'s| is| are)|who(?:'s| is| am| are)|when(?:'s| is| are)|"
    r"why\b|how (?:do|does|is|are|did|can)|"
    r"remind|remember|vault|north[\s-]?stars?|(?:the|my|our) plan|"
    r"operator memory|tell me|do i (?:have|believe)|did i|believe|"
    r"who am i|what's in"
    r")\b",
    re.I,
)
LEADING_Q_RE = re.compile(
    r"^(?:(?:hey|ok|okay|please)\s+)*(?:jarvis[,.]?\s+)?(?:"
    r"what|what's|whats|who|where|when|why|how|"
    r"remember|remind|tell|do i|did i"
    r")\b",
    re.I,
)
DESK_RE = re.compile(
    r"\b("
    r"do this|look at|browse|write code|implement|"
    r"research|spawn|queue|"
    r"open (?:the )?(?:page|url|site)|"
    r"watch (?:this|the)|"
    r"draft (?:an? |the )|"
    r"build (?:a |the |this )|"
    r"create (?:a |the )|"
    r"fix (?:this|the|my)"
    r")\b",
    re.I,
)
HELLO_RE = re.compile(
    r"^(?:hey|hi|hello|yo|sup|good (?:morning|afternoon|evening))"
    r"(?:\s+jarvis)?[.!]?\s*$",
    re.I,
)


def _load_brain():
    path = Path(__file__).resolve().parent / "brain.py"
    spec = importlib.util.spec_from_file_location("agent_stack_brain", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


BRAIN = _load_brain()


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
    if HELLO_RE.match(text):
        return {"verb": "greet", "needs_ask": False, "args": {}, "host": "local"}
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
    desk_hit = DESK_RE.search(text) or re.search(r"\bcursor-\b", text, re.I)
    question = bool(QUESTION_RE.search(text) or LEADING_Q_RE.search(text))
    if desk_hit and not question:
        host = "cursor" if re.search(r"\b(browse|open (the )?(page|url|site)|watch|cursor-)\b", text, re.I) else "grok"
        return {"verb": "desk", "needs_ask": True, "args": {"text": text}, "host": host}
    return {"verb": "memory", "needs_ask": False, "args": {"text": text}, "host": "local"}


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
    engine = "local"
    if verb == "idle":
        narration = "Holding. Say Jarvis, or tap Space."
    elif verb == "greet":
        narration = "Hello Evens. Ask what's in the vault, or name a job."
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
        thought = BRAIN.answer(spoken, retrieve_roots)
        cites = thought.get("cites") or []
        narration = thought.get("spoken") or "I don't have that in the vault. UNKNOWN."
        engine = thought.get("engine") or "extractive"
        plan = {**plan, "host": "local", "engine": engine}
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
        "engine": engine if verb == "memory" else "local",
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
            "# Operator Memory\n\nFour north stars start with maximum leverage, minimum noise.\n"
            "Evens is the operator. The plan is vault Q&A on the face, desks only for jobs.\n",
            encoding="utf-8",
        )
        (hive / "bus").mkdir(parents=True)
        os.environ["AGENT_STACK_NO_OLLAMA"] = "1"
        refused = apply_turn("send this email", hive=hive)
        if refused.get("verb") != "refuse":
            return {"ok": False, "errors": ["hard-step not refused"]}
        asked = apply_turn("look at the inbound pipeline", hive=hive)
        if not asked.get("ask"):
            return {"ok": False, "errors": ["desk turn must ASK"]}
        yes = apply_turn("yes", hive=hive)
        if yes.get("ask") or not (hive / "bus" / "jobs.jsonl").is_file():
            return {"ok": False, "errors": ["spoken yes did not queue a desk job"]}
        jobs_before = (hive / "bus" / "jobs.jsonl").read_text(encoding="utf-8")
        mem = apply_turn("what are the north stars", hive=hive, retrieve_roots=[vault])
        jobs_after = (hive / "bus" / "jobs.jsonl").read_text(encoding="utf-8")
        if mem.get("verb") != "memory" or mem.get("ask") or mem.get("host") != "local" or not mem.get("cites"):
            return {"ok": False, "errors": ["vault Q&A missed fixture"], "got": mem}
        if "Queued" in (mem.get("spoken") or "") or "Grok" in (mem.get("spoken") or ""):
            return {"ok": False, "errors": ["brain leaked a Grok queue"], "got": mem}
        if jobs_after != jobs_before:
            return {"ok": False, "errors": ["vault question queued a desk-turn"]}
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
