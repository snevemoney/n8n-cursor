"""fanout — Jarvis fans one job out to up to 3 scratch-sandboxed workers and merges their reports (CANDIDATE).

Worker kinds (reusing the existing hands, nothing new that can reach out):
  code     agent_tools.op_code: the model plans, writes files and tests in its own scratch git repo, tests run inside
           sandbox-exec (no network, writes only in that repo), commit on a jarvis/* branch. Never main, never push.
  snippet  code_run: Python the user typed runs in the sandbox directly. Python a MODEL wrote (code_author) is armed only,
           and runs only when `approved` is true, the same confirm rule the single-snippet path already has.
Asks that need the network, a push/merge/deploy, a send, or secrets are not run: status "needs Evens".
A worker that crashes or overruns the wall clock is reported as such; the others still report. The merge says how many
workers verified, never just "done".
"""
from __future__ import annotations

import concurrent.futures as cf
import importlib.util
import os
import re
import time
import uuid
from pathlib import Path

MAX_WORKERS = 3
ASK_CAP = 300
WALL_S = float(os.environ.get("JARVIS_FANOUT_WALL") or 150)
HERE = Path(__file__).resolve().parent

_DENY = re.compile(
    r"(?i)\b(?:curl|wget|ssh|scp|rsync|https?://|download|upload|push|merge|deploy|publish|send|e-?mail|slack|tweet|post\s+to|"
    r"pay|purchase|buy|delete|rm\s+-rf|sudo|pip\s+install|npm\s+install|brew|api[_\s-]?key|token|password|credential|secret|"
    r"\.env|keychain|ssh|login|oauth)\b|https?://")
_SECRET = re.compile(r"(?i)(gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9\-_]{20,}|xox[abp]-[\w-]+|AKIA[0-9A-Z]{16}|"
                     r"(?:api[_-]?key|token|secret|password)\s*[:=]\s*\S+)")
_FAN = re.compile(r"^\s*(?:jarvis[,:]?\s*)?(?:fan\s*out|in\s+parallel|run\s+(?:up\s+to\s+)?(?:2|3|two|three)\s+(?:workers?|sub-?agents?))"
                  r"\b[^:\n]{0,40}:\s*(?P<t>.+)$", re.I | re.S)
_SPLIT = re.compile(r"\s*(?:;|\n|(?:^|\s)\d{1,2}[.)]\s+)\s*")


def _scrub(t: str) -> str:
    return _SECRET.sub("[redacted]", t or "")


def _load(name: str, file: str):
    spec = importlib.util.spec_from_file_location(f"agent_stack_{name}", HERE / file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def args_from_utterance(u: str) -> dict:
    m = _FAN.match(u or "")
    if not m:
        return {}
    asks = [a.strip(" .,") for a in _SPLIT.split(m.group("t")) if a and a.strip(" .,")]
    return {"tasks": [{"ask": a[:ASK_CAP]} for a in asks]} if len(asks) >= 2 else {}


def _status(got: dict) -> str:
    if got.get("verified"):
        return "verified"
    return "needs Evens" if got.get("gated") else "failed"


def _one(n: int, task: dict, *, run_id: str, approved: bool, code_worker, snippet_author, snippet_runner) -> dict:
    ask = " ".join(str(task.get("ask") or "").split())[:ASK_CAP]
    code, test = str(task.get("code") or ""), str(task.get("test") or "")
    kind = "snippet" if (code.strip() or task.get("kind") == "snippet") else "code"
    row = {"n": n, "kind": kind, "ask": ask or "(typed code)", "repo": ""}
    if ask and _DENY.search(ask):
        return {**row, "status": "needs Evens", "spoken": "That ask needs the network, a push/send/deploy, or secrets. Workers have none of those; not run."}
    try:
        if kind == "snippet":
            if not code.strip():
                au = (snippet_author or _load("code_author", "code_author.py").author)(ask)
                if not au.get("ok"):
                    return {**row, "status": "failed", "spoken": str(au.get("spoken") or "")[:200]}
                if not approved:
                    return {**row, "status": "armed", "spoken": "Code is written and reviewed but has not run. It needs a confirm first."}
                code, test = str(au.get("code") or ""), str(au.get("test") or "")
            got = (snippet_runner or _load("code_run", "code_run.py").run)({"code": code, "test": test})
            return {**row, "status": "verified" if got.get("passed") else "failed", "spoken": str(got.get("spoken") or "")[:200]}
        repo = f"fanout-{run_id}-{n}"
        got = code_worker(ask, repo)
        return {**row, "repo": repo, "status": _status(got), "spoken": str(got.get("spoken") or "")[:300]}
    except Exception as e:  # noqa: BLE001 — one worker must never take down the merge
        return {**row, "status": "crashed", "spoken": f"worker crashed ({type(e).__name__})"}


def run(args: dict | None = None, *, code_worker=None, snippet_author=None, snippet_runner=None) -> dict:
    args = args or {}
    tasks = [t for t in (args.get("tasks") or []) if isinstance(t, dict) and (str(t.get("ask") or "").strip() or str(t.get("code") or "").strip())]
    if not tasks:
        return {"ok": False, "verified": False, "workers": [], "dropped": 0,
                "spoken": "I need at least one task to fan out (up to three). Nothing ran."}
    dropped, tasks = max(0, len(tasks) - MAX_WORKERS), tasks[:MAX_WORKERS]
    wall = float(args.get("wall") or WALL_S)
    run_id = time.strftime("%H%M%S") + uuid.uuid4().hex[:3]
    pool = cf.ThreadPoolExecutor(max_workers=MAX_WORKERS, thread_name_prefix="jarvis-fanout")
    futs = {pool.submit(_one, i, t, run_id=run_id, approved=bool(args.get("approved")), code_worker=code_worker,
                        snippet_author=snippet_author, snippet_runner=snippet_runner): i for i, t in enumerate(tasks, 1)}
    done, _pending = cf.wait(futs, timeout=wall)
    pool.shutdown(wait=False, cancel_futures=True)
    rows = []
    for fut, n in sorted(futs.items(), key=lambda kv: kv[1]):
        if fut in done:
            rows.append(fut.result())
        else:
            t = tasks[n - 1]
            rows.append({"n": n, "kind": "code", "ask": " ".join(str(t.get("ask") or "(typed code)").split())[:ASK_CAP], "repo": "",
                         "status": "timed out", "spoken": "Did not finish inside the time limit; it may still be running in the background."})
    ok_n = sum(1 for r in rows if r["status"] == "verified")
    head = f"Fan-out: {ok_n} of {len(rows)} workers verified."
    if dropped:
        head += f" I only run three at a time, so {dropped} more {'was' if dropped == 1 else 'were'} not started."
    lines = " ".join(f"{r['n']}. [{r['status']}] {r['ask'][:70]}: {r['spoken'][:140]}" for r in rows)
    all_ok = ok_n == len(rows) and not dropped
    return {"ok": all_ok, "verified": all_ok, "workers": rows, "dropped": dropped, "verified_count": ok_n,
            "spoken": _scrub(head + " " + lines)}


def log_meta(got: dict) -> dict:
    g = got or {}
    return {"ok": bool(g.get("ok")), "workers": len(g.get("workers") or []), "verified": int(g.get("verified_count") or 0),
            "dropped": int(g.get("dropped") or 0)}
