#!/usr/bin/env python3
"""Replay owner phrasings against the live Orb (127.0.0.1:4018) and check the spoken reply. Read-only asks only.

    python3 apps/agent-stack/face/orb_probe.py            # all checks, default port 4018
    python3 apps/agent-stack/face/orb_probe.py --port 4019

Each row: the exact utterance, substrings the reply must contain (any one of a group) and must not contain.
Results go to stdout and ~/jarvis-proof/orb-probe-<UTC>.jsonl. Exit 0 only when every check passes.
Nothing here sends, installs, clicks, or edits: questions, a file search and a repo listing.
"""
from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

CHECKS = [
    # Grok bad-turns queue, PR 644, 2026-10-15
    {"say": "What repos do you have installed", "need": [["I looked in"], ["git repos", "no git repos"]],
     "never": ["Local repos: jarvis-main."]},
    {"say": "Don't you have a red arrow you can use", "need": [["Yes"], ["point to"]],
     "never": ["not a functional tool", "visual indicator"]},
    {"say": "Can you open a book on my Mac about AI", "need": [["Found", "found"]],
     "never": ["Artificial Intelligence A Modern Approach"]},
    {"say": "Could you change your code so you can give yourself access", "need": [["scratch repo"], ["lock it down"]],
     "never": ["outside the allowed folders", "1 h", "system design"]},
    {"say": "can you fix it now?", "need": [["coding worker"]], "never": ["system design", "I cannot change my own code"]},
]


def turn(port: int, utterance: str, timeout: float) -> tuple[str, dict]:
    req = urllib.request.Request(f"http://127.0.0.1:{port}/api/turn", data=json.dumps({"utterance": utterance}).encode(),
                                 headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as res:
        body = json.loads(res.read().decode("utf-8", "replace"))
    out = body.get("out") if isinstance(body.get("out"), dict) else body
    return str(out.get("spoken") or body.get("spoken") or ""), out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=4018)
    ap.add_argument("--timeout", type=float, default=90.0)
    a = ap.parse_args()
    proof = Path.home() / "jarvis-proof"; proof.mkdir(exist_ok=True)
    log = proof / f"orb-probe-{time.strftime('%Y%m%dT%H%M%SZ', time.gmtime())}.jsonl"
    failed = 0
    with log.open("w", encoding="utf-8") as fh:
        for c in CHECKS:
            try:
                spoken, out = turn(a.port, c["say"], a.timeout)
                miss = [g for g in c["need"] if not any(s in spoken for s in g)]
                bad = [s for s in c["never"] if s in spoken]
                ok = not miss and not bad
                row = {"say": c["say"], "ok": ok, "tool": out.get("tool"), "outcome": out.get("outcome"),
                       "spoken": spoken, "missing": miss, "forbidden": bad}
            except (urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
                ok, row = False, {"say": c["say"], "ok": False, "error": f"{type(exc).__name__}: {exc}"}
            failed += not ok
            fh.write(json.dumps(row) + "\n")
            print(("PASS " if ok else "FAIL ") + c["say"] + " -> " + (row.get("spoken") or row.get("error", ""))[:200])
    print(f"{len(CHECKS) - failed}/{len(CHECKS)} passed · {log}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
