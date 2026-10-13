"""loop hand (FINISH-LIST rank 13): read-only recurring checks. Registry only; cap 6 starts/day in code.

Each loop carries checkable stop fields: stop_when, max_runs, expires. Loops that would act
(send, pay, delete, deploy, post, write, ...) are refused. Registry: $JARVIS_LOOPS_FILE or
~/.grok-private/jarvis-loops.json (outside the repo, mode 0600).
"""
from __future__ import annotations

import json
import os
import re
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path

DAILY_CAP = 6
MIN_EVERY = 5
DEFAULT_MAX_RUNS = 36
ACT_RE = re.compile(r"\b(send|email|text|pay|delete|remove|rm|deploy|post|tweet|publish|write|edit|merge|push|buy|book|book|order|install|kill|restart)\b", re.I)


def _path() -> Path:
    env = os.environ.get("JARVIS_LOOPS_FILE", "")
    return Path(env).expanduser() if env else Path.home() / ".grok-private" / "jarvis-loops.json"


def _load() -> list[dict]:
    try:
        data = json.loads(_path().read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (OSError, ValueError):
        return []


def _save(rows: list[dict]) -> None:
    p = _path(); p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_name(p.name + ".tmp")
    tmp.write_text(json.dumps(rows, indent=1) + "\n", encoding="utf-8")
    os.chmod(tmp, 0o600)
    os.replace(tmp, p)


def run(args: dict | None = None) -> dict:
    args = args or {}
    op = str(args.get("op") or "list")
    rows = _load()
    if op == "list":
        active = [r for r in rows if r.get("status") == "active"]
        sp = (f"{len(active)} active loop{'s' if len(active) != 1 else ''}: " + "; ".join(f"{r['what']} every {r['every_min']} min" for r in active[:6])) if active else "No active loops."
        return {"ok": True, "op": op, "loops": active, "spoken": sp}
    if op == "cancel":
        key = str(args.get("id") or "").strip().lower()
        hit = [r for r in rows if r.get("status") == "active" and key and (r["id"] == key or key in r["what"].lower())]
        if not hit:
            return {"ok": False, "op": op, "spoken": "I couldn't find an active loop like that. Nothing changed."}
        for r in hit[:1]:
            r["status"] = "cancelled"; r["cancelled"] = datetime.now().isoformat(timespec="seconds")
        _save(rows)
        return {"ok": True, "op": op, "loop": hit[0], "spoken": f"Cancelled the loop: {hit[0]['what']}."}
    if op == "start":
        what = " ".join(str(args.get("what") or "").split())[:200]
        if not what:
            return {"ok": False, "op": op, "spoken": "Tell me what the loop should check."}
        if ACT_RE.search(what):
            return {"ok": False, "op": op, "spoken": "Loops can only check things (read-only). I won't loop an action like that."}
        today = datetime.now().date().isoformat()
        if sum(1 for r in rows if str(r.get("created", "")).startswith(today)) >= DAILY_CAP:
            return {"ok": False, "op": op, "spoken": f"That would pass today's cap of {DAILY_CAP} loops. Cancel one or wait until tomorrow."}
        every = max(MIN_EVERY, int(args.get("every_min") or 15))
        now = datetime.now()
        loop = {"id": uuid.uuid4().hex[:8], "what": what, "every_min": every, "read_only": True,
                "stop_when": str(args.get("stop_when") or "Evens cancels it, max_runs reached, or it expires"),
                "max_runs": int(args.get("max_runs") or DEFAULT_MAX_RUNS),
                "expires": (now + timedelta(hours=24)).isoformat(timespec="seconds"),
                "created": now.isoformat(timespec="seconds"), "runs": 0, "status": "active"}
        rows.append(loop); _save(rows)
        return {"ok": True, "op": op, "loop": loop,
                "spoken": f"Loop registered (read-only): {what}, every {every} minutes, up to {loop['max_runs']} runs, expires in 24 hours. Say cancel to stop it."}
    return {"ok": False, "op": op, "spoken": "Unknown loop op."}


_START = re.compile(r"\b(?:start|set\s+up|create|run)\s+(?:a\s+)?loop\s+(?:that\s+|to\s+)?(.+?)(?:\s+every\s+(\d+)\s*(min(?:ute)?s?|hours?|h))?\s*[.!?]?$", re.I)
_CANCEL = re.compile(r"\b(?:cancel|stop|kill)\s+(?:the\s+)?(.+?)\s+loop\b", re.I)


def args_from_utterance(u: str) -> dict:
    s = (u or "").strip()
    m = _CANCEL.search(s)
    if m:
        return {"op": "cancel", "id": m.group(1)}
    m = _START.search(s)
    if m:
        every = int(m.group(2) or 15)
        if m.group(3) and m.group(3).lower().startswith("h"):
            every *= 60
        return {"op": "start", "what": m.group(1), "every_min": every}
    return {"op": "list"}


def log_meta(got: dict) -> dict:
    g = got or {}
    return {"ok": bool(g.get("ok")), "op": g.get("op"), "count": len(g.get("loops") or [])}
