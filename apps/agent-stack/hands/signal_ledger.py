"""SIGNALS.csv — the one shared list of every signal Evens saves (Watch Later + X bookmarks). Evens 2026-10-16.

Every agent (Jarvis, Grok, Cursor, Codex, Claude Code) reads it before touching a link, so nothing is done twice or missed.
One row per video/post id (signals.classify: every form of a link is the same row). Stages:
  new -> sorted | later | skipped -> taken (by an agent, expires after 6 h) -> learned (points to the packet) | failed (3 tries)
Lives on the jarvis/signals branch next to the packets: docs/hive/outer-heaven/CONTENT/watch-later/index/SIGNALS.csv

CLI (any agent; --push pulls first, commits and pushes so the others see it):
  signal_ledger.py add <url> [--title T] [--source x|youtube] [--by AGENT] [--push]
  signal_ledger.py take --by AGENT [--source x|youtube] [--push]      -> prints the claimed row (JSON) or {}
  signal_ledger.py learned <id> --by AGENT --result <packet path> [--push]
  signal_ledger.py failed <id> --by AGENT --error "why" [--push]
  signal_ledger.py status
"""
from __future__ import annotations

import csv
import importlib.util
import json
import os
import subprocess
import sys
import time
from pathlib import Path

FIELDS = ("id", "source", "status", "owner", "taken_at", "priority", "attempts", "title", "added", "result", "error", "url")
CLAIM_S = 6 * 3600       # a taken item nobody finished goes back to the pile
MAX_ATTEMPTS = 3
RANK = {"new": 0, "later": 1, "skipped": 1, "sorted": 1, "taken": 2, "failed": 3, "learned": 4}
WATCH_TIERS = {"deep", "studio", "biz", "light"}
REL = "docs/hive/outer-heaven/CONTENT/watch-later/index/SIGNALS.csv"


def _signals():
    spec = importlib.util.spec_from_file_location("signals_for_ledger", Path(__file__).with_name("signals.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_S = []


def canon(url: str) -> dict:
    if not _S:
        _S.append(_signals())
    return _S[0].classify(url)


def add(rows: dict, url: str, title: str = "", source: str = "", added: str = "") -> dict:
    """New row for an unseen id; an id already on the list is never overwritten."""
    c = canon(url)
    if c["id"] not in rows:
        rows[c["id"]] = {**dict.fromkeys(FIELDS, ""), "id": c["id"], "source": source or c["kind"], "status": "new",
                         "priority": "5", "attempts": "0", "title": title, "url": c["url"],
                         "added": added or time.strftime("%Y-%m-%d")}
    return rows[c["id"]]


def sort_into(rows: dict, vid: str, status: str, priority=None) -> None:
    """Triage result; never moves an item backwards (a taken or learned item stays where it is)."""
    r = rows.get(vid)
    if not r or RANK[r["status"]] >= RANK["taken"]:
        return
    r["status"] = status
    if priority is not None:
        r["priority"] = str(priority)


def _expire(rows: dict, now: float) -> None:
    for r in rows.values():
        if r["status"] == "taken" and now - float(r["taken_at"] or 0) > CLAIM_S:
            r.update(status="sorted", owner="", taken_at="")


def take(rows: dict, agent: str, now: float | None = None, source: str = "", only: str = "") -> dict:
    """Claim the next sorted item (highest priority first). Returns the row, or {} when nothing is waiting."""
    now = time.time() if now is None else now
    _expire(rows, now)
    pile = [r for r in rows.values() if r["status"] == "sorted" and (not source or r["source"] == source)
            and (not only or r["id"] == only)]
    if not pile:
        return {}
    r = min(pile, key=lambda x: (int(x["priority"] or 5), x["added"], x["id"]))
    r.update(status="taken", owner=agent, taken_at=str(int(now)))
    return r


def finish(rows: dict, vid: str, agent: str, status: str, result: str = "", error: str = "") -> dict:
    r = rows[vid]
    if r["status"] == "taken" and r["owner"] != agent:
        raise ValueError(f"{vid} is taken by {r['owner']}, not {agent}")
    if status == "learned":
        r.update(status="learned", result=result, error="", owner=agent, taken_at="")
    elif status == "failed":
        n = int(r["attempts"] or 0) + 1
        r.update(attempts=str(n), error=error[:300], owner="", taken_at="",
                 status="failed" if n >= MAX_ATTEMPTS else "sorted")
    else:
        raise ValueError(f"finish with learned or failed, not {status}")
    return r


def release(rows: dict, vid: str, agent: str) -> None:
    """Hand a claim back untouched (the agent paused, e.g. out of free quota)."""
    r = rows.get(vid)
    if r and r["status"] == "taken" and r["owner"] == agent:
        r.update(status="sorted", owner="", taken_at="")


def sync(rows: dict, watch_later: list, triage: list, learned: dict) -> dict:
    """Seed / refresh from what already exists: his Watch Later, the triage sort and the packets on disk."""
    for v in watch_later:
        add(rows, v.get("link") or f"https://www.youtube.com/watch?v={v['id']}", title=v.get("title") or "", source="youtube")
    for t in triage:
        tier = (t.get("evens_override") or "").strip().lower() or t.get("tier")
        status = "sorted" if tier in WATCH_TIERS else "skipped" if tier == "skip" else "later"
        sort_into(rows, t["id"], status, priority=t.get("priority") or 5)
    for vid, path in learned.items():
        if not (len(vid) == 11 or vid.startswith(("x-", "web-"))):
            continue  # other folders beside the packets (job-cards, social) are not signals
        if vid not in rows and (vid.startswith("x-") or len(vid) == 11):
            add(rows, f"https://x.com/i/status/{vid[2:]}" if vid.startswith("x-") else f"https://www.youtube.com/watch?v={vid}")
        if vid not in rows:  # web packets already carry their final id
            rows[vid] = {**dict.fromkeys(FIELDS, ""), "id": vid, "source": "web", "attempts": "0", "priority": "5",
                         "added": time.strftime("%Y-%m-%d")}
        if rows[vid]["status"] != "learned":
            rows[vid].update(status="learned", result=path, owner=rows[vid]["owner"] or "packet", taken_at="")
    return counts(rows)


def counts(rows: dict) -> dict:
    out: dict = {}
    for r in rows.values():
        s = out.setdefault(r["source"] or "?", {})
        s[r["status"]] = s.get(r["status"], 0) + 1
    return out


def load(path: Path) -> dict:
    if not path.exists():
        return {}
    with path.open(newline="") as fh:
        return {r["id"]: {**dict.fromkeys(FIELDS, ""), **r} for r in csv.DictReader(fh)}


def save(path: Path, rows: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows[k] for k in sorted(rows))   # sorted by id: two agents editing different rows never conflict
    tmp.replace(path)


# --- shared through git (the jarvis/signals branch every agent already reads) -------------------------------------

def _git(root: Path, *args, check=True) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True, timeout=300, check=check,
                          env={**os.environ, "EVENS_OK": "yes"})  # Evens 10-16: build the shared list for all agents


def shared(root: Path, change, message: str, push: bool = True, tries: int = 3):
    """Pull, apply `change(rows)`, commit only SIGNALS.csv, push. A rejected push means another agent changed the list:
    pull again and redo the change on their version (never force). Returns change's result."""
    path = root / REL
    for _ in range(tries):
        if push:
            _git(root, "pull", "-q", "--rebase", "--autostash", "origin", "jarvis/signals", check=False)
        rows = load(path)
        got = change(rows)
        save(path, rows)
        _git(root, "add", "--sparse", REL)
        if _git(root, "diff", "--cached", "--quiet", "--", REL, check=False).returncode == 0:
            return got  # nothing changed
        _git(root, "commit", "-q", "-m", message, "--", REL)
        if not push or _git(root, "push", "-q", "origin", "HEAD:jarvis/signals", check=False).returncode == 0:
            return got
        _git(root, "pull", "-q", "--rebase", "origin", "jarvis/signals", check=False)
        if _git(root, "status", "--porcelain", check=False).stdout.startswith(("UU", "AA")):
            _git(root, "rebase", "--abort", check=False)
            raise RuntimeError("another agent changed the same row at the same time; run the command again")
    raise RuntimeError("could not push the list after several tries")


def _root() -> Path:
    env = os.environ.get("JARVIS_SIGNAL_WORKTREE")
    if env:
        return Path(env)
    here = Path(__file__).resolve()
    for p in here.parents:  # run from any checkout of the repo (Grok on the box, Cursor, Codex)
        if (p / ".git").exists() and (p / "docs/hive").is_dir():
            if _git(p, "rev-parse", "--abbrev-ref", "HEAD", check=False).stdout.strip() == "jarvis/signals":
                return p
            break
    return Path.home() / "jarvis-cowork/jarvis-signals"


def _arg(argv: list, flag: str, default: str = "") -> str:
    return argv[argv.index(flag) + 1] if flag in argv else default


def main(argv: list) -> int:
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    cmd, root, push = argv[0], _root(), "--push" in argv
    by = _arg(argv, "--by")
    if cmd in ("take", "learned", "failed", "add") and not by:
        print("say who you are with --by (jarvis, grok, cursor, codex, claude)", file=sys.stderr)
        return 2
    if cmd == "status":
        print(json.dumps(counts(load(root / REL)), indent=1))
        return 0
    if cmd == "add":
        got = shared(root, lambda rows: add(rows, argv[1], title=_arg(argv, "--title"), source=_arg(argv, "--source")),
                     f"signals list: {by} added {argv[1][:80]}", push)
    elif cmd == "take":
        got = shared(root, lambda rows: dict(take(rows, by, source=_arg(argv, "--source"))), f"signals list: {by} took next", push)
    elif cmd in ("learned", "failed"):
        got = shared(root, lambda rows: dict(finish(rows, argv[1], by, cmd, result=_arg(argv, "--result"),
                                                    error=_arg(argv, "--error"))), f"signals list: {by} {cmd} {argv[1]}", push)
    else:
        print(f"unknown command {cmd}", file=sys.stderr)
        return 2
    print(json.dumps(got, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
