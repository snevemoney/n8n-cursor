#!/usr/bin/env python3
"""Replayable 17-probe eval (frontier loop 6). Offline: no model, no network, no hands run.

Replays each probe through brain.pipeline.model_free_route (the same pick the live turn uses) and
compares with eval/baseline.json. A baseline probe that stops passing = regression = exit 1 (fails the PR).
New passes are reported as improvements (update the baseline in the PR that earns them).
  python3 eval/eval_probes.py            # compare with baseline, exit 1 on regression
  python3 eval/eval_probes.py --json     # print the run as JSON
  python3 eval/eval_probes.py --write-baseline
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
PROBES = HERE / "probes17.json"
BASELINE = HERE / "baseline.json"


def _router():
    from brain import pipeline
    return pipeline.model_free_route


def run(router=None) -> dict:
    router = router or _router()
    probes = json.loads(PROBES.read_text())["probes"]
    results = []
    for p in probes:
        pick = router(p["ask"])
        got = (pick or {}).get("tool") or "model"
        results.append({"cap": p["cap"], "expect": p["expect"], "got": got, "pass": got == p["expect"]})
    return {"total": len(results), "passed": sum(r["pass"] for r in results), "results": results}


def compare(d: dict, baseline: dict | None = None) -> dict:
    base = set((baseline if baseline is not None else json.loads(BASELINE.read_text())).get("passing") or [])
    now = {r["cap"] for r in d["results"] if r["pass"]}
    return {"regressions": sorted(base - now), "improvements": sorted(now - base)}


def main(argv: list[str] | None = None, router=None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    d = run(router)
    if "--write-baseline" in argv:
        BASELINE.write_text(json.dumps({"passing": sorted(r["cap"] for r in d["results"] if r["pass"]),
                                        "passed": d["passed"], "total": d["total"]}, indent=2) + "\n")
    if "--json" in argv:
        print(json.dumps(d))
        return 0
    rep = compare(d)
    print(f"probe eval: {d['passed']}/{d['total']} pass; regressions={rep['regressions'] or 'none'}; "
          f"improvements={rep['improvements'] or 'none'}")
    for r in d["results"]:
        print(f"  {'PASS' if r['pass'] else 'gap '} {r['cap']:<10} expect={r['expect']:<15} got={r['got']}")
    return 1 if rep["regressions"] else 0


if __name__ == "__main__":
    sys.exit(main())
