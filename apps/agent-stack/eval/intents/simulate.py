#!/usr/bin/env python3
"""Run the labeled intents against a SIMULATING Jarvis (JARVIS_SIM=1, its own hive, its own port) and grade each reply.

Usage: simulate.py --port 4019 --hive <that copy's .hive dir> [--only intent,...] [--out results.jsonl]
Never point it at live :4018: it rewrites the target hive's conversation history between cases.
"""
from __future__ import annotations

import argparse
import collections
import json
import re
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
UNPLAIN = re.compile(r"\*\*|`|com~apple~CloudDocs|\b[0-9a-f]{24,}\b|\b20\d{6}-[a-z0-9]+-[a-z0-9-]+|\b(?:deepseek|anthropic)/[\w.-]+")
DARK = re.compile(r"talk wire is dark|returned no text in time|UNKNOWN\. ", re.I)


def turn(port: int, text: str, timeout: float = 150) -> dict:
    req = urllib.request.Request(f"http://127.0.0.1:{port}/api/turn", data=json.dumps({"utterance": text}).encode(),
                                 headers={"Content-Type": "application/json"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = json.loads(r.read() or b"{}")
    except Exception as exc:  # noqa: BLE001 - a transport failure is a graded failure, not a crash
        return {"tool": None, "spoken": f"ERROR {type(exc).__name__}: {exc}", "secs": round(time.time() - t0, 1)}
    return {"tool": body.get("tool") or body.get("verb"), "spoken": str(body.get("spoken") or ""),
            "sim_args": (body.get("execution") or {}).get("sim_args") or body.get("sim_args"), "secs": round(time.time() - t0, 1)}


def reset_history(hive: Path) -> None:
    f = hive / "bus" / "state.json"
    try:
        bus = json.loads(f.read_text())
    except (OSError, ValueError):
        return
    bus.update(turns=[], sitting_digest="")
    f.write_text(json.dumps(bus))


def grade(got: dict, tools: list, entity: dict, never: list) -> list[str]:
    why = []
    tool = got.get("tool")
    if tools and tool not in tools and not (tool in ("converse", "say") and None in tools):
        why.append(f"hand {tool!r} not in {tools}")
    said = got.get("spoken") or ""
    blob = (said + " " + json.dumps(got.get("sim_args") or {})).lower()
    for key, value in (entity or {}).items():
        if value and str(value).lower() not in blob:
            why.append(f"{key}={value!r} missing")
    for bad in never or []:
        if bad.lower() in said.lower():
            why.append(f"said {bad!r}")
    if UNPLAIN.search(said):
        why.append("not plain: " + UNPLAIN.search(said).group(0)[:40])
    if DARK.search(said) or said.startswith("ERROR"):
        why.append("dark/error")
    return why


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=4019)
    ap.add_argument("--hive", required=True)
    ap.add_argument("--only", default="")
    ap.add_argument("--out", default=str(HERE / "results.jsonl"))
    a = ap.parse_args()
    if a.port == 4018:
        raise SystemExit("refused: never simulate against live :4018")
    data = json.loads((HERE / "intents.json").read_text())
    only = {x for x in a.only.split(",") if x}
    hive, out = Path(a.hive), Path(a.out)
    rows, per = [], collections.defaultdict(lambda: [0, 0])
    with out.open("w") as fh:
        for name, spec in data["intents"].items():
            if only and name not in only:
                continue
            for text, entity in spec["lines"]:
                reset_history(hive)
                got = turn(a.port, text)
                why = grade(got, spec["tools"], entity, spec.get("never"))
                row = {"intent": name, "say": text, **got, "pass": not why, "why": why}
                fh.write(json.dumps(row) + "\n"); fh.flush(); rows.append(row)
                per[name][0] += not why; per[name][1] += 1
                print(("PASS " if not why else "FAIL ") + f"[{name}] {text[:60]} -> {got.get('tool')} {'; '.join(why)}", flush=True)
        for conv in data.get("conversations", []):
            if only and "conversations" not in only:
                continue
            reset_history(hive)
            for text, spec in conv["turns"]:
                got = turn(a.port, text)
                why = grade(got, spec.get("tools") or [], {}, spec.get("never"))
                why += [f"missing {m!r}" for m in spec.get("must", []) if m.lower() not in (got.get("spoken") or "").lower()]
                row = {"intent": "conv:" + conv["id"], "say": text, **got, "pass": not why, "why": why}
                fh.write(json.dumps(row) + "\n"); fh.flush(); rows.append(row)
                per["conv:" + conv["id"]][0] += not why; per["conv:" + conv["id"]][1] += 1
                print(("PASS " if not why else "FAIL ") + f"[conv:{conv['id']}] {text[:60]} -> {got.get('tool')} {'; '.join(why)}", flush=True)
    total = sum(p for p, _ in per.values()), sum(n for _, n in per.values())
    print("\n".join(f"{k:22s} {p}/{n}" for k, (p, n) in per.items()))
    print(f"TOTAL {total[0]}/{total[1]}")


if __name__ == "__main__":
    main()
