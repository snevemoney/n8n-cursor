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
WEEKDAY = {"mon": "Monday", "tue": "Tuesday", "wed": "Wednesday", "thu": "Thursday", "fri": "Friday", "sat": "Saturday", "sun": "Sunday"}
MIN_EVERY = 5
DEFAULT_MAX_RUNS = 36
MAX_RUNS_CAP = 96
MAX_EVERY = 24 * 60
# Allowlist, not just a denylist: a loop must open with a read verb and name a known read-only subject.
ALLOW_RE = re.compile(
    r"^(?:checks?|watch(?:es)?|monitors?|reports?|looks?\s+at|tells?\s+me)\s+(?:on\s+|the\s+|my\s+|if\s+|whether\s+)*"
    r"(?:free\s+)?(?:vault\s+(?:lint|health|links?)|daily\s+summary|work\s+recap|readiness|morning\s+brief(?:ing)?|daily\s+brief(?:ing)?|brief(?:ing)?|disk\s+space|disk|storage|memory|ram|cpu|load|battery|uptime|healthz?|"
    r"(?:the\s+)?(?:face|jarvis|service|server|site|vps|ci|build|tests?|pr\s*#?\d+|pull\s+request\s*#?\d+|port\s+\d+)"
    r"(?:\s+(?:status|health|is\s+up|is\s+down|passing|green))?)\b[\w\s,.%#-]{0,120}$",
    re.I,
)


def _int(value, default: int, lo: int, hi: int) -> int:
    try:
        n = int(float(str(value).strip())) if value not in (None, "") else default
    except (TypeError, ValueError, OverflowError):
        n = default
    return max(lo, min(hi, n))


def _norm(text: str) -> str:
    return " ".join(re.sub(r"[^\w\s-]", " ", str(text or "").lower()).split())
ACT_RE = re.compile(r"\b(send|email|text|pay|delete|remove|rm|deploy|post|tweet|publish|write|edit|merge|push|buy|book|book|order|install|kill|restart|open|run|move|copy|upload|download|reply|submit|sign|transfer|commit|reboot|shutdown)(?:s|es|ed|ing)?\b", re.I)


def _path() -> Path:
    env = os.environ.get("JARVIS_LOOPS_FILE", "")
    return Path(env).expanduser() if env else Path.home() / ".grok-private" / "jarvis-loops.json"


def _load() -> list[dict]:
    try:
        data = json.loads(_path().read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (OSError, ValueError):
        return []


def load_checked() -> tuple[list[dict], bool]:
    """(rows, readable). A missing file is no loops; an unreadable or corrupt one is NOT "no loops" (silent-failure audit)."""
    p = _path()
    if not p.exists():
        return [], True
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return [], False
    return (data, True) if isinstance(data, list) else ([], False)


MAX_ROWS = 200


def _save(rows: list[dict]) -> None:
    """Atomic, unique temp name (concurrency audit 2026-10-16: a fixed .tmp lost 7 of 8 concurrent starts)."""
    import tempfile
    p = _path(); p.parent.mkdir(parents=True, exist_ok=True)
    keep = [r for r in rows if r.get("status") == "active"] + [r for r in rows if r.get("status") != "active"][-MAX_ROWS:]
    fd, tmp = tempfile.mkstemp(prefix=p.name + ".", dir=str(p.parent))
    with os.fdopen(fd, "w", encoding="utf-8") as fh:
        fh.write(json.dumps(keep, indent=1) + "\n"); fh.flush(); os.fsync(fh.fileno())
    os.chmod(tmp, 0o600)
    os.replace(tmp, p)


class _locked:
    """Process-wide flock on the loop file: start/cancel and the runner never interleave a read-modify-write."""
    def __enter__(self):
        import fcntl
        p = _path(); p.parent.mkdir(parents=True, exist_ok=True)
        self.fh = open(p.with_name(p.name + ".lock"), "a+")
        fcntl.flock(self.fh, fcntl.LOCK_EX)
        return self

    def __exit__(self, *exc):
        import fcntl
        fcntl.flock(self.fh, fcntl.LOCK_UN); self.fh.close()
        return False


def _runner_alive() -> bool:
    """True only when a loop runner has written a heartbeat in the last 5 minutes (loop_runner.py)."""
    beat = _path().with_name("jarvis-loops-runner.json")
    try:
        return time.time() - float(json.loads(beat.read_text(encoding="utf-8")).get("ts") or 0) < 300
    except (OSError, ValueError, AttributeError):
        return False


def run(args: dict | None = None) -> dict:
    with _locked():
        return _run(args)


def _run(args: dict | None = None) -> dict:
    args = args or {}
    op = str(args.get("op") or "list")
    rows = _load()
    if op == "list":
        now_s = datetime.now().isoformat(timespec="seconds")
        active = [r for r in rows if r.get("status") == "active" and str(r.get("expires") or "9999") > now_s
                  and int(r.get("runs") or 0) < int(r.get("max_runs") or 1 << 30)]
        sp = (f"{len(active)} active loop{'s' if len(active) != 1 else ''}: " + "; ".join(f"{r['what']} every {r['every_min']} min" for r in active[:6])) if active else "No active loops."
        return {"ok": True, "op": op, "loops": active, "spoken": sp}
    if op == "cancel":
        key = _norm(args.get("id"))
        key = re.sub(r"^(?:loop\s+)?(?:that\s+)?", "", key)
        # Exact only: the loop id, or the loop's whole "what". A substring like "disk" cancels nothing.
        # Also the whole subject without its leading verb ("checks disk space" -> "disk space"); never a fragment.
        subj = lambda w: re.sub(r"^(?:checks?|watch(?:es)?|monitors?|pings?|polls?)\s+", "", _norm(w))
        hit = [r for r in rows if r.get("status") == "active" and key and (str(r.get("id")) == key or _norm(r.get("what")) == key
                                                                           or subj(r.get("what")) == key)]
        if not hit:
            return {"ok": False, "op": op, "spoken": "I couldn't find an active loop like that. Nothing changed."}
        same = _norm(hit[0].get("what"))
        for r in [x for x in hit if _norm(x.get("what")) == same]:
            r["status"] = "cancelled"; r["cancelled"] = datetime.now().isoformat(timespec="seconds")
        _save(rows)
        return {"ok": True, "op": op, "loop": hit[0], "spoken": f"Cancelled the loop: {hit[0]['what']}."}
    if op == "start":
        what = " ".join(str(args.get("what") or "").split())[:200]
        if not what:
            return {"ok": False, "op": op, "spoken": "Tell me what the loop should check."}
        if ACT_RE.search(what) or not ALLOW_RE.match(what) or re.search(r"\bthen\b|;|&&", what, re.I):
            return {"ok": False, "op": op, "spoken": "Loops can only check things (read-only), like disk space, battery, "
                    "a service's health or a PR's CI. I won't loop that."}
        today = datetime.now().date().isoformat()
        if sum(1 for r in rows if str(r.get("created", "")).startswith(today)) >= DAILY_CAP:
            return {"ok": False, "op": op, "spoken": f"That would pass today's cap of {DAILY_CAP} loops. Cancel one or wait until tomorrow."}
        every = _int(args.get("every_min"), 15, MIN_EVERY, MAX_EVERY)
        now = datetime.now()
        at = str(args.get("at") or "").strip()
        if at and not re.fullmatch(r"(?:[01]?\d|2[0-3]):[0-5]\d", at):
            return {"ok": False, "op": op, "spoken": f"I need a time like 06:00 for a daily loop, not {at!r}."}
        weekday = str(args.get("weekday") or "").strip().lower()[:3]
        if weekday and weekday not in ("mon", "tue", "wed", "thu", "fri", "sat", "sun"):
            return {"ok": False, "op": op, "spoken": f"I need a weekday like monday, not {args.get('weekday')!r}."}
        daily = bool(at)  # Z20 morning brief: once a day at that time; a missed time (Mac asleep) runs at the next tick
        loop = {"id": uuid.uuid4().hex[:8], "what": what, "every_min": 1440 if daily else every, "read_only": True,
                "stop_when": str(args.get("stop_when") or "Evens cancels it, max_runs reached, or it expires"),
                "max_runs": _int(args.get("max_runs"), 31 if daily else DEFAULT_MAX_RUNS, 1, MAX_RUNS_CAP),
                "expires": (now + timedelta(days=31 if daily else 1)).isoformat(timespec="seconds"),
                "created": now.isoformat(timespec="seconds"), "runs": 0, "status": "active", **({"at": at} if daily else {}),
                **({"weekday": weekday} if daily and weekday else {})}
        rows.append(loop); _save(rows)
        return {"ok": True, "op": op, "loop": loop,
                "spoken": (f"Scheduled (read-only): {what}, every {WEEKDAY.get(weekday, 'day')} at {at}, for a month. " if daily else
                           f"Loop registered (read-only): {what}, every {every} minutes, up to {loop['max_runs']} runs, expires in 24 hours. ")
                          + ("The loop runner checks it on schedule." if _runner_alive() else
                             "No loop runner is active yet, so it is saved but not running.") + " Say cancel to stop it."}
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
        every = _int(m.group(2), 15, 1, MAX_EVERY)
        if m.group(3) and m.group(3).lower().startswith("h"):
            every = min(MAX_EVERY, every * 60)
        return {"op": "start", "what": m.group(1), "every_min": every}
    return {"op": "list"}


def log_meta(got: dict) -> dict:
    g = got or {}
    return {"ok": bool(g.get("ok")), "op": g.get("op"), "count": len(g.get("loops") or [])}
