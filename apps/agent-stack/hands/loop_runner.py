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
STALE_DAYS = 14
COULD_NOT_RE = re.compile(r"\b(?:couldn't|could not|can't|cannot|unable to|failed to|add credits)\b", re.I)
TASKS = Path(__file__).resolve().parents[3] / "docs/hive/outer-heaven/.hive/operator-tasks"
_VAULT = next((v for v in (Path.home() / "Vaults/My_Billion_Dollar_Vault", Path.home() / "Documents/My_Billion_Dollar_Vault") if v.is_dir()),
              Path.home() / "Vaults/My_Billion_Dollar_Vault")
DAILY = _VAULT / "00_Outer_Heaven/JARVIS-INBOX/daily"


def _lines(path: Path, n: int, pat: str = r"^\s*[-*] ") -> list[str]:
    try:
        rows = [l.strip(" -*\t") for l in path.read_text(encoding="utf-8").splitlines() if re.match(pat, l)]
    except OSError:
        return []
    return rows[-n:]


def _ops_rows(path: Path) -> list[tuple[str, str, str]]:
    """Ops Watch STATUS.md table rows as (level, item, owner)."""
    out = []
    try:
        for l in path.read_text(encoding="utf-8").splitlines():
            cells = [c.strip() for c in l.strip().strip("|").split("|")]
            if len(cells) >= 5 and re.search(r"\b(RED|AMBER|GREEN|INFO)\b", cells[0]):
                out.append((re.search(r"\b(RED|AMBER|GREEN|INFO)\b", cells[0]).group(1), cells[1], cells[-1]))
    except OSError:
        pass
    return out


def _cut(text: str, n: int) -> str:
    """Spoken text is cut at a word, never mid-word, and says it was cut."""
    text = text.strip()
    if len(text) <= n:
        return text if text.endswith((".", "!", "?")) else text + "."
    return text[:n].rsplit(" ", 1)[0].rstrip(",;:(") + "…"


def _brief(_m) -> tuple[bool, str]:
    """Z20 / X36 morning brief, built from his own files with no model call: what is red, what needs him."""
    parts = []
    rows = _ops_rows(PRIVATE / "Ops Watch" / "STATUS.md")
    red = [r for r in rows if r[0] == "RED"]
    amber = [r for r in rows if r[0] == "AMBER"]
    if red:
        parts.append(f"{len(red)} red: " + "; ".join(r[1] for r in red) + ".")
    if amber:
        parts.append(f"{len(amber)} amber, " + str(sum(1 for r in amber if "Evens" in r[2])) + " of them yours.")
    asks = _lines(PRIVATE / "Decisions Needed.md", 50)
    if asks:
        parts.append(f"{len(asks)} decisions wait for you; newest: "
                     + _cut(re.split(r"(?<=[.!?])\s", re.sub(r"^\d{4}-\d\d-\d\d \d\d:\d\d \([^)]*\):\s*", "", asks[-1]))[0], 160))
    # X13 daily compilation: shared fleet notes nobody has refreshed in two weeks are named (contradictions: not covered)
    old = sorted((p for p in SHARED.glob("*.md") if time.time() - p.stat().st_mtime > STALE_DAYS * 86400),
                 key=lambda p: p.stat().st_mtime)
    if old:
        parts.append(f"{len(old)} shared notes are over {STALE_DAYS} days old: " + ", ".join(p.stem for p in old[:4]) + ".")
    u = shutil.disk_usage(str(Path.home()))
    parts.append(f"Disk {u.free / 1e9:.0f} GB free.")
    return True, " ".join(parts)[:900]


def _daily_summary(_m, now: float | None = None) -> tuple[bool, str]:
    """X33 / Z58: one note a day of what Jarvis did (jobs, how they ended, billed cost), from the job files, no model.
    The day's first note is kept; later runs that day only report it."""
    import datetime as _dt
    now = now or time.time()
    day = _dt.date.fromtimestamp(now)
    start = time.mktime(day.timetuple())
    jobs = []
    for d in TASKS.iterdir() if TASKS.is_dir() else []:
        try:
            st = json.loads((d / "state.json").read_text())
        except (OSError, ValueError):
            continue
        if start <= float(st.get("started") or 0) < start + 86400:
            jobs.append(st)
    jobs.sort(key=lambda st: float(st.get("started") or 0))
    cost = sum(float(st.get("cost_usd") or 0) for st in jobs)
    import collections as _c
    ends = ", ".join(f"{n} {str(k or 'unknown').lower().replace('_', ' ')}" for k, n in _c.Counter(st.get("status") for st in jobs).most_common())
    # a closed conversation is DONE even when its last words were "I couldn't"; count those from what it said
    short = sum(1 for st in jobs if COULD_NOT_RE.search(str(st.get("summary") or "")))
    line = (f"Today Jarvis ran {len(jobs)} jobs" + (f" ({ends})" if ends else "")
            + (f"; {short} of them ended saying it could not finish" if short else "") + f", ${cost:.2f} billed.")
    note = DAILY / f"{day.isoformat()}.md"
    if os.environ.get("JARVIS_LOOP_SAMPLE") == "1":
        return True, line + " (sample run: today's note is written at the scheduled time)"
    if note.exists():
        return True, line + " Today's note was already written."
    rows = [f"- {time.strftime('%H:%M', time.localtime(float(st.get('started') or 0)))} · {st.get('status')} · "
            f"${float(st.get('cost_usd') or 0):.4f} · {_cut(' '.join(str(st.get('summary') or '(no summary)').split()), 160)}" for st in jobs]
    try:
        DAILY.mkdir(parents=True, exist_ok=True)
        note.write_text(f"---\ntype: daily-summary\nupdated-by: jarvis\ndate: {day.isoformat()}\n---\n# Jarvis, {day.isoformat()}\n\n{line}\n\n" + "\n".join(rows) + "\n")
    except OSError as exc:
        return False, f"{line} Could not save today's note: {exc}."
    return True, line + " Saved today's note in the Jarvis inbox."


def _readiness(_m) -> tuple[bool, str]:
    import importlib.util
    spec = importlib.util.spec_from_file_location("readiness_loop", Path(__file__).with_name("readiness.py"))
    rd = importlib.util.module_from_spec(spec); spec.loader.exec_module(rd)
    got = rd.report()
    return got["state"] == "GREEN", got["spoken"]


def _vault_lint(_m) -> tuple[bool, str]:
    """X12 weekly vault lint from the link graph: orphans, dead ends, missing link targets (read-only)."""
    import importlib.util
    spec = importlib.util.spec_from_file_location("vault_graph_lint", Path(__file__).with_name("vault_graph.py"))
    vg = importlib.util.module_from_spec(spec); spec.loader.exec_module(vg)
    g = vg.build()
    n = len(g["notes"])
    orphans = sum(1 for k in g["notes"] if not g["in"].get(k) and not g["out"].get(k))
    dead = sum(1 for k in g["notes"] if g["in"].get(k) and not g["out"].get(k))
    top = ", ".join(f"{t} ({c})" for t, c in g["unresolved"].most_common(3))
    return True, f"Vault lint: {n} notes, {orphans} with no links, {dead} dead ends, {len(g['unresolved'])} missing link targets (most linked: {top})."


CHECKS = (
    (re.compile(r"\b(?:daily\s+summary|work\s+recap)\b", re.I), _daily_summary),
    (re.compile(r"\breadiness\b", re.I), _readiness),
    (re.compile(r"\bvault\b", re.I), _vault_lint),
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
            if r.get("weekday") and now.strftime("%a").lower()[:3] != r["weekday"]:
                continue  # X12 weekly: only on its day
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
