"""loop_runner — runs the read-only loops hands/loop.py registers (owner canvas "Scheduled loops", honesty audit 2026-10-16).

Before this, loops were saved but nothing ever ran them, while Jarvis said "Loop registered ... every 10 minutes".
Each tick: every active, unexpired loop that is due gets one read-only check from a fixed table (disk, memory, battery,
uptime/load, Face/site health, PR CI). Nothing is written but the loop file, the runner heartbeat, and an inbox card when
a check's answer changes. A loop whose subject has no checker is reported once and stops, instead of pretending.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import time
import urllib.request
from datetime import datetime
from pathlib import Path

CHECK_TIMEOUT_S = 15


def _disk(_m) -> tuple[bool, str]:
    u = shutil.disk_usage(str(Path.home()))
    return True, f"{u.free / 1e9:.0f} GB free of {u.total / 1e9:.0f} GB"


def _run(argv: list[str]) -> tuple[bool, str]:
    try:
        p = subprocess.run(argv, capture_output=True, text=True, timeout=CHECK_TIMEOUT_S, stdin=subprocess.DEVNULL)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return False, f"{argv[0]} unavailable ({type(exc).__name__})"
    out = " ".join((p.stdout or p.stderr or "").split())[:200]
    return p.returncode == 0, out or f"exit {p.returncode}"


def _health(m) -> tuple[bool, str]:
    url = "http://127.0.0.1:4018/healthz" if re.search(r"\b(?:face|jarvis)\b", m.string, re.I) else ""
    site = re.search(r"https?://\S+", m.string)
    url = site.group(0) if site else url
    if not url:
        return False, "no address to check: name the site URL"
    try:
        with urllib.request.urlopen(url, timeout=CHECK_TIMEOUT_S) as r:
            return True, f"{url} answered {r.status}"
    except Exception as exc:  # noqa: BLE001 — a down service is the answer, not a crash
        return False, f"{url} did not answer ({type(exc).__name__})"


PRIVATE = Path.home() / "ArtCraft Studio/00 Private/Studio Operations"
SHARED = Path.home() / ".grok-shared"


def _lines(path: Path, n: int, pat: str = r"^\s*[-*] ") -> list[str]:
    try:
        rows = [l.strip(" -*\t") for l in path.read_text(encoding="utf-8").splitlines() if re.match(pat, l)]
    except OSError:
        return []
    return rows[-n:]


def _brief(_m) -> tuple[bool, str]:
    """Z20 / X36 morning brief, built from his own files with no model call: what needs him, what is red, what is active."""
    parts = []
    asks = _lines(PRIVATE / "Decisions Needed.md", 50)
    if asks:
        parts.append(f"{len(asks)} decisions wait for you; newest: " + re.sub(r"^\d{4}-\d\d-\d\d \d\d:\d\d \([^)]*\):\s*", "", asks[-1])[:160])
    red = [l for l in _lines(PRIVATE / "Ops Watch" / "STATUS.md", 200) if re.search(r"\bRED\b|\bdown\b|\bfail", l, re.I)]
    if red:
        parts.append(f"{len(red)} red in Ops Watch: " + red[0][:140])
    active = _lines(SHARED / "ACTIVE_TASKS.md", 3)
    if active:
        parts.append("Active: " + "; ".join(a[:70] for a in active))
    u = shutil.disk_usage(str(Path.home()))
    parts.append(f"Disk {u.free / 1e9:.0f} GB free.")
    return True, " ".join(parts)[:900]


CHECKS = (
    (re.compile(r"\bbrief(?:ing)?\b", re.I), _brief),
    (re.compile(r"\b(?:disk\s+space|disk|storage)\b", re.I), _disk),
    (re.compile(r"\bbattery\b", re.I), lambda m: _run(["pmset", "-g", "batt"])),
    (re.compile(r"\b(?:uptime|load|cpu)\b", re.I), lambda m: _run(["uptime"])),
    (re.compile(r"\b(?:memory|ram)\b", re.I), lambda m: _run(["vm_stat"]) if shutil.which("vm_stat") else _run(["free", "-h"])),
    (re.compile(r"\b(?:pr|pull\s+request)\s*#?(\d+)\b", re.I), lambda m: _run(["gh", "pr", "checks", m.group(1)])),
    (re.compile(r"\b(?:health|healthz|face|jarvis|site|service|server)\b", re.I), _health),
)


def check(what: str) -> tuple[bool | None, str]:
    """(ok, summary) for one read-only subject; (None, why) when no checker covers it."""
    for rx, fn in CHECKS:
        m = rx.search(what or "")
        if m:
            return fn(m)
    return None, "no read-only checker covers that subject yet"


def _write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=path.name + ".", dir=str(path.parent))
    with os.fdopen(fd, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1)
        fh.flush(); os.fsync(fh.fileno())
    os.chmod(tmp, 0o600)
    os.replace(tmp, path)


def tick(loop_mod, *, now: datetime | None = None, notify=None, checker=check) -> list[dict]:
    """One pass. loop_mod is hands/loop.py (for its file and lock). Returns the rows that ran."""
    now = now or datetime.now()
    path = loop_mod._path()
    _write_json(path.with_name("jarvis-loops-runner.json"), {"ts": time.time(), "pid": os.getpid()})
    ran: list[dict] = []
    with loop_mod._locked():
        rows = loop_mod._load()
        changed = False
        for r in rows:
            if r.get("status") != "active":
                continue
            if str(r.get("expires") or "9999") <= now.isoformat(timespec="seconds"):
                r["status"] = "expired"; changed = True; continue
            if int(r.get("runs") or 0) >= int(r.get("max_runs") or 1):
                r["status"] = "done"; changed = True; continue
            last = r.get("last_run")
            if r.get("at"):
                hh, mm = (int(x) for x in str(r["at"]).split(":"))
                due_at = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
                if now < due_at or (last and datetime.fromisoformat(last) >= due_at):
                    continue  # daily: once after its time each day; a missed time runs at the first tick after it
            elif last and (now - datetime.fromisoformat(last)).total_seconds() < 60 * int(r.get("every_min") or 15):
                continue
            ok, summary = checker(str(r.get("what") or ""))
            prev = r.get("last_result")
            r.update(last_run=now.isoformat(timespec="seconds"), runs=int(r.get("runs") or 0) + 1,
                     last_ok=ok, last_result=summary)
            if ok is None:
                r["status"] = "unsupported"
            changed = True
            ran.append(dict(r))
            if notify is not None and (summary != prev or ok is None):
                try:
                    notify(r)
                except Exception:  # noqa: BLE001 — a card failure never stops the runner
                    pass
        if changed:
            loop_mod._save(rows)
    return ran
