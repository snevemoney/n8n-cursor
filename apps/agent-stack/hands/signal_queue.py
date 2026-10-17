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

    def next(self):
        return self.db.execute("select * from videos where state='queued' order by priority, seconds limit 1").fetchone()

    def get(self, vid: str):
        return self.db.execute("select * from videos where id=?", (vid,)).fetchone()

    def counts(self) -> dict:
        out = {"queued": 0, "done": 0, "failed": 0}
        for st, n in self.db.execute("select state, count(*) from videos group by state"):
            out[st] = n
        out["hours_left"] = round((self.db.execute("select coalesce(sum(seconds),0) from videos where state='queued'")
                                   .fetchone()[0]) / 3600, 1)
        return out

    def _set(self, vid: str, **kw) -> None:
        cols = ", ".join(f"{k}=?" for k in kw)
        self.db.execute(f"update videos set {cols}, updated=? where id=?", (*kw.values(), time.time(), vid))
        self.db.commit()

    def run(self, ingest, budget_wait=Exception, max_videos: int = 20) -> dict:
        learned, stopped = [], ""
        for _ in range(max_videos):
            v = self.next()
            if not v:
                stopped = "queue empty"
                break
            try:
                r = ingest(v["url"], force=False, lens=v["lens"], fps=v["fps"])
            except budget_wait as exc:
                stopped = f"budget/free tier: {exc}"
                break
            except Exception as exc:  # noqa: BLE001 - one bad video never stops the queue
                r = {"status": "FAILED", "text": f"{type(exc).__name__}: {exc}"}
            if r.get("status") in ("DONE", "ALREADY"):
                self._set(v["id"], state="done", methods=int(r.get("methods") or 0), error="")
                learned.append(v["id"])
            else:
                n = v["attempts"] + 1
                self._set(v["id"], attempts=n, error=str(r.get("text") or "")[:300],
                          state="failed" if n >= MAX_ATTEMPTS else "queued")
                if "BudgetWait" in str(r.get("text")) or "budget" in str(r.get("text")).lower():
                    stopped = "budget/free tier"
                    break
        return {"learned": learned, "stopped": stopped or f"batch of {max_videos} done", **self.counts()}


def main(argv: list) -> int:
    sys.path.insert(0, str(Path(__file__).parent))
    import signals as S
    import signal_triage as T
    q = Queue(S.CACHE / "queue.db")
    idx = S.worktree() / S.INDEX
    if not (idx / "triage.csv").exists():
        T.run(S.CACHE / "watch-later.json", S.known_ids(), idx)
    added = q.sync(idx / "triage.csv", S.known_ids())
    if argv and argv[0] == "run":
        n = int(argv[argv.index("--max") + 1]) if "--max" in argv else 20
        out = q.run(S.ingest, budget_wait=S.BudgetWait, max_videos=n)
        if out["learned"]:
            S.build_index()
        print(json.dumps({"added": added, **out, "free": S.G.status()}, default=str))
    else:
        print(json.dumps({"added": added, **q.counts(), "free": S.G.status()}, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
