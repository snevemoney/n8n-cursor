"""Z56 (whIp1SOahOM 16:05-16:14): an unanswered Jarvis question times out -> ONE status line naming what is still
undone ("The calendar question lapsed, sir. The unnamed contact booking, 10 am, is not on your calendar yet.").
Open questions live on the bus (bus['open_q']); Evens's next turn answers/clears it; the face pump calls tick().
Nothing is sent off the Mac: the line lands as an Orb inbox card + a JARVIS-INBOX note."""
from __future__ import annotations

import os
import time
from pathlib import Path


def ttl() -> float:
    try:
        return max(10.0, float(os.environ.get("JARVIS_LAPSE_SEC") or 120))
    except ValueError:
        return 120.0


def open_q(bus: dict, *, topic: str, pending: str, ask: str, now: float | None = None) -> dict:
    now = now or time.time()
    bus["open_q"] = {"topic": topic, "pending": pending, "ask": ask[:200], "ts": now, "deadline": now + ttl(), "state": "open"}
    return bus


def answered(bus: dict) -> dict:
    q = bus.get("open_q")
    if isinstance(q, dict) and q.get("state") == "open":
        bus["open_q"] = dict(q, state="answered")
    return bus


def line(q: dict) -> str:
    return f"The {q.get('topic') or 'last'} question lapsed, sir. {q.get('pending') or 'Nothing was done on it.'}"


def tick(hive: Path, *, mutate_fn, inbox: Path | None = None, now: float | None = None) -> str | None:
    now = now or time.time()
    said: dict = {}

    def _m(bus: dict) -> dict:
        q = bus.get("open_q")
        if not (isinstance(q, dict) and q.get("state") == "open" and now >= float(q.get("deadline") or 0)):
            return bus
        text = line(q)
        said["text"] = text
        ib = bus.get("inbox") if isinstance(bus.get("inbox"), dict) else {}
        card = {"title": "\u23f3 Question lapsed", "fields": [f"Asked: {q.get('ask', '')[:90]}", f"Still undone: {q.get('pending', '')[:120]}"],
                "body": text, "ts": now, "turn_gen": None, "background": True}
        bus["inbox"] = {"gen": int(ib.get("gen") or 0) + 1, "items": [c for c in (ib.get("items") or []) if isinstance(c, dict)][-4:] + [card]}
        bus["open_q"] = dict(q, state="lapsed", lapsed_at=now)
        bus["say"] = {"text": text, "ts": now}
        return bus
    mutate_fn(Path(hive), _m)
    if said and inbox is not None:
        try:
            inbox.mkdir(parents=True, exist_ok=True)
            (inbox / f"{time.strftime('%Y-%m-%d %H%M', time.localtime(now))} question lapsed.md").write_text(
                f"---\ntype: question-lapsed\nstatus: open\nupdated-by: jarvis\ndate: {time.strftime('%Y-%m-%d', time.localtime(now))}\n"
                f"tags: [jarvis, lapse]\n---\n# Question lapsed\n\n{said['text']}\n", encoding="utf-8")
        except OSError:
            pass
    return said.get("text")


def op_tick(hive: Path, *, mutate_fn, inbox: Path | None = None, now: float | None = None) -> str | None:
    """Z56 for operator jobs: a question Jarvis asked and he never answered lapses ONCE into a status line."""
    import json
    now = now or time.time()
    tasks = Path(hive) / "operator-tasks"
    try:
        tid = json.loads((tasks / "latest.json").read_text())["task_id"]
        path = tasks / tid / "state.json"
        st = json.loads(path.read_text())
    except (OSError, ValueError, KeyError):
        return None
    if not st.get("asked_at") or st.get("lapse_said") or now - float(st["asked_at"]) < ttl():
        return None
    goal = ""
    try:
        goal = str(json.loads((tasks / tid / "request.json").read_text()).get("goal") or "")[:120]
    except (OSError, ValueError):
        pass
    path.write_text(json.dumps({**st, "lapse_said": True}))
    def _m(bus: dict) -> dict:
        return open_q(bus, topic="last", ask=str(st.get("asked") or ""), now=now - ttl(),
                      pending=(f"“{goal}” is waiting for your answer; nothing more was done." if goal else
                               "The job is waiting for your answer; nothing more was done."))
    mutate_fn(Path(hive), _m)
    return tick(hive, mutate_fn=mutate_fn, inbox=inbox, now=now)
