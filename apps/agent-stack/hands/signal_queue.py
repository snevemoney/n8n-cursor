"""Durable queue for learning Evens's Watch Later (Evens 2026-10-16: the whole Watch Later for $0-20, engineered).

States: queued → done | failed (after 3 attempts). One video at a time (the free tier and the ingest lock), highest
priority first, shortest first within a priority. Stops cleanly when the free tier is full for the day and the paid budget
is used (signals.BudgetWait) and resumes on the next run. Survives restarts: state lives in SQLite.

Run by the LaunchAgent com.evens.signal-queue (every 30 min): sync from triage.csv, learn until the day's free time or
the batch size is used, rebuild the indexes, push the packets.
CLI: signal_queue.py run [--max N] · status
"""
from __future__ import annotations

import csv
import json
import sqlite3
import sys
import time
from pathlib import Path

WATCH_TIERS = {"deep", "studio", "biz", "light"}
MAX_ATTEMPTS = 3


class Queue:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path))
        self.db.row_factory = sqlite3.Row
        self.db.execute("""create table if not exists videos (id text primary key, url text, title text, channel text,
            seconds integer, tier text, priority integer, lens text, fps real, state text default 'queued',
            attempts integer default 0, error text default '', methods integer default 0, updated real)""")
        self.db.commit()

    def sync(self, triage_csv: Path, done: set) -> int:
        added = 0
        for r in csv.DictReader(triage_csv.open()):
            tier = (r.get("evens_override") or "").strip().lower() or r.get("tier")
            if tier not in WATCH_TIERS or r["id"] in done:
                continue
            fps = {"deep": 1.0, "biz": 1.0, "studio": 5.0, "light": 0.2}.get(tier, float(r.get("fps") or 1))
            cur = self.db.execute("insert or ignore into videos (id,url,title,channel,seconds,tier,priority,lens,fps,updated) "
                                  "values (?,?,?,?,?,?,?,?,?,?)",
                                  (r["id"], r["link"], r["title"], r["channel"], int(r.get("seconds") or 0), tier,
                                   int(r.get("priority") or 5), "studio" if tier == "studio" else "learn", fps, time.time()))
            added += cur.rowcount
        self.db.commit()
        return added

    def next(self, exclude=()):
        skip = list(exclude)
        marks = ",".join("?" * len(skip))
        where = f" and id not in ({marks})" if skip else ""
        return self.db.execute(f"select * from videos where state='queued'{where} order by priority, seconds limit 1",
                               skip).fetchone()

    def get(self, vid: str):
        return self.db.execute("select * from videos where id=?", (vid,)).fetchone()

    def counts(self) -> dict:
        out = {"queued": 0, "done": 0, "failed": 0}
        for st, n in self.db.execute("select state, count(*) from videos group by state"):
            out[st] = n
        out["hours_left"] = round((self.db.execute("select coalesce(sum(seconds),0) from videos where state='queued'")
                                   .fetchone()[0]) / 3600, 1)
        return out

    UPDATABLE = ("state", "attempts", "error", "methods")

    def _set(self, vid: str, **kw) -> None:
        bad = set(kw) - set(self.UPDATABLE)
        if bad:  # column names are never taken from outside input; values always go through ? placeholders
            raise ValueError(f"not an updatable column: {sorted(bad)}")
        cols = ", ".join(f"{k}=?" for k in kw)
        self.db.execute(f"update videos set {cols}, updated=? where id=?", (*kw.values(), time.time(), vid))
        self.db.commit()

    def run(self, ingest, budget_wait=Exception, max_videos: int = 20, claim=None, report=None) -> dict:
        """claim(id) -> True when the shared list lets Jarvis take it (False: another agent has it or it is done);
        report(id, state, info) writes the outcome back to the shared list."""
        learned, stopped, passed = [], "", set()
        for _ in range(max_videos):
            v = self.next(exclude=passed)
            if not v:
                stopped = "queue empty"
                break
            if claim and not claim(v["id"]):
                passed.add(v["id"])
                continue
            try:
                r = ingest(v["url"], force=False, lens=v["lens"], fps=v["fps"])
            except budget_wait as exc:
                stopped = f"budget/free tier: {exc}"
                if report:
                    report(v["id"], "released", "")
                break
            except Exception as exc:  # noqa: BLE001 - one bad video never stops the queue
                r = {"status": "FAILED", "text": f"{type(exc).__name__}: {exc}"}
            if r.get("status") in ("DONE", "ALREADY"):
                self._set(v["id"], state="done", methods=int(r.get("methods") or 0), error="")
                learned.append(v["id"])
                if report:
                    report(v["id"], "learned", "")
            else:
                n = v["attempts"] + 1
                self._set(v["id"], attempts=n, error=str(r.get("text") or "")[:300],
                          state="failed" if n >= MAX_ATTEMPTS else "queued")
                if report:
                    report(v["id"], "failed", str(r.get("text") or ""))
                if "BudgetWait" in str(r.get("text")) or "budget" in str(r.get("text")).lower():
                    stopped = "budget/free tier"
                    break
        return {"learned": learned, "stopped": stopped or f"batch of {max_videos} done", **self.counts()}


REFRESH_S = 24 * 3600


def _refresh_saved(S) -> tuple:
    """Once a day, re-read his Watch Later and X bookmarks from his signed-in Safari (audit 10-16: nothing refreshed
    watch-later.json, so new saves never reached the queue). Returns True when the list changed."""
    wl = S.CACHE / "watch-later.json"
    if wl.exists() and time.time() - wl.stat().st_mtime < REFRESH_S:
        return False, []
    try:
        before = wl.read_text() if wl.exists() else ""
        got = S.scan("all")
        print(json.dumps({"refresh": got.get("notes"), "new": len(got.get("new") or [])}))
        return (wl.exists() and wl.read_text() != before), list(got.get("new") or [])
    except Exception as exc:  # noqa: BLE001 - Safari may be busy or signed out; the queue still runs on the old list
        print(json.dumps({"refresh": "skipped", "why": str(exc)[:200]}))
        return False, []


def _shared_list(S, idx: Path) -> dict:
    """SIGNALS.csv (signal_ledger.py), the list every agent shares: refreshed from Watch Later, triage and the packets
    each run; Jarvis claims a video there before learning it and writes the outcome back. A push that fails (offline)
    keeps the local commit and the queue goes on."""
    import signal_ledger as L
    root = S.worktree()

    def change(fn, msg):
        try:
            return L.shared(root, fn, msg)
        except Exception as exc:  # noqa: BLE001 - the shared list never stops the learning
            print(json.dumps({"shared_list": "not pushed", "why": str(exc)[:200]}))
            return L.shared(root, fn, msg, push=False)

    wl = json.loads((S.CACHE / "watch-later.json").read_text()) if (S.CACHE / "watch-later.json").exists() else []
    triage = list(csv.DictReader((idx / "triage.csv").open())) if (idx / "triage.csv").exists() else []
    learned = {i: f"{S.PACKETS}/{i}" for i in S.known_ids()}
    change(lambda rows: L.sync(rows, wl, triage, learned), "signals list: refresh from Watch Later, triage and packets")

    def claim(vid: str) -> bool:
        return change(lambda rows: L.take(rows, "jarvis", only=vid).get("id") == vid, f"signals list: jarvis took {vid}")

    def report(vid: str, state: str, info: str) -> None:
        if state == "released":
            change(lambda rows: L.release(rows, vid, "jarvis"), f"signals list: jarvis released {vid}")
        else:
            change(lambda rows: L.finish(rows, vid, "jarvis", state, result=f"{S.PACKETS}/{vid}" if state == "learned" else "",
                                         error=info), f"signals list: jarvis {state} {vid}")
    def add_many(urls: list) -> None:
        change(lambda rows: [L.add(rows, u, source=S.classify(u)["kind"], added="saved") for u in urls],
               f"signals list: {len(urls)} new saves from his Safari")

    return {"claim": claim, "report": report, "add_many": add_many}


def main(argv: list) -> int:
    sys.path.insert(0, str(Path(__file__).parent))
    import signals as S
    import signal_triage as T
    q = Queue(S.CACHE / "queue.db")
    idx = S.worktree() / S.INDEX
    refreshed, new_urls = _refresh_saved(S)
    if refreshed or not (idx / "triage.csv").exists():
        T.run(S.CACHE / "watch-later.json", S.known_ids(), idx)
    added = q.sync(idx / "triage.csv", S.known_ids())
    shared = _shared_list(S, idx)
    if new_urls:
        shared["add_many"](new_urls)   # X bookmarks and other saves that are not in watch-later.json
    if argv and argv[0] == "run":
        n = int(argv[argv.index("--max") + 1]) if "--max" in argv else 20
        out = q.run(S.ingest, budget_wait=S.BudgetWait, max_videos=n, claim=shared["claim"], report=shared["report"])
        if out["learned"]:
            S.build_index()
        try:  # living artifacts refresh on the same 30-minute beat (artifact_refresh.py); never stops the queue
            import artifact_refresh
            print(json.dumps({"artifacts": artifact_refresh.refresh_all()}))
        except Exception as exc:  # noqa: BLE001
            print(json.dumps({"artifacts": "skipped", "why": str(exc)[:160]}))
        print(json.dumps({"added": added, **out, "free": S.G.status()}, default=str))
    else:
        print(json.dumps({"added": added, **q.counts(), "free": S.G.status()}, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
