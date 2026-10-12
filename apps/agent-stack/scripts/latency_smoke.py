#!/usr/bin/env python3
"""Latency smoke: send the Orb's POST /api/turn (stream) prompts; fail on any turn over the limit.

  python3 scripts/latency_smoke.py --port 4019 [--limit 20] [--craft] [--json out.json]
Exit 0 all answered under the limit, 1 a turn was slow/empty, 2 the Face is down.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request

PROMPTS = [
    "What model are you running on right now?",
    "Who is allowed to issue a PASS?",
    "After you finish work in an ArtCraft app like PhotoCraft, where should the project be saved and how do I see it?",
    "Good evening Jarvis, how are you doing tonight?",
]
CRAFT = "In GridCraft, make a new blank workbook, put Smoke in A1, save it as jarvis-latency-smoke.xlsx."


def ask(port: int, text: str, timeout: float) -> dict:
    body = json.dumps({"utterance": text, "approved": False, "stream": True}).encode()
    req = urllib.request.Request(f"http://127.0.0.1:{port}/api/turn", data=body,
                                 headers={"Content-Type": "application/json", "Accept": "text/event-stream"})
    began, last = time.monotonic(), {}
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        for raw in resp:
            line = raw.decode("utf-8", "ignore").strip()
            if line.startswith("data:"):
                try:
                    ev = json.loads(line[5:])
                except ValueError:
                    continue
                if not ev.get("partial") and ev.get("spoken"):
                    last = ev
    return {"ask": text, "ms": int((time.monotonic() - began) * 1000), "verb": last.get("verb"),
            "answered": bool(last.get("spoken")), "chars": len(str(last.get("spoken") or ""))}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=4019)
    ap.add_argument("--limit", type=float, default=20.0, help="seconds per turn")
    ap.add_argument("--craft", action="store_true", help="also run one GridCraft save (writes a file in ~/Documents/Craft)")
    ap.add_argument("--json")
    a = ap.parse_args(argv)
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{a.port}/healthz", timeout=5).read()
    except (urllib.error.URLError, OSError) as exc:
        print(f"FAIL face :{a.port} down: {type(exc).__name__}")
        return 2
    rows, bad = [], 0
    for text in PROMPTS + ([CRAFT] if a.craft else []):
        try:
            row = ask(a.port, text, a.limit + 40)
        except (urllib.error.URLError, OSError, TimeoutError) as exc:
            row = {"ask": text, "ms": -1, "answered": False, "error": type(exc).__name__}
        row["ok"] = row["answered"] and 0 <= row["ms"] <= a.limit * 1000
        bad += not row["ok"]
        rows.append(row)
        print(f"{'PASS' if row['ok'] else 'FAIL'} {row['ms']:>6} ms  {row.get('verb') or '-':8} {text[:60]}")
    if a.json:
        with open(a.json, "w") as fh:
            json.dump({"port": a.port, "limit_s": a.limit, "rows": rows}, fh, indent=1)
    print(f"{len(rows) - bad}/{len(rows)} under {a.limit:.0f} s")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
