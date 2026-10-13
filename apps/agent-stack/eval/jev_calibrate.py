#!/usr/bin/env python3
"""Calibrate Jev's deterministic picker on the labelled set (brain/jev_calibration_set.jsonl).

Brier = mean((confidence - correct)^2). ASSIST is allowed only when n >= 100, Brier <= 0.25 and the
'status' suggestions at/above the threshold are >= 95% precise. Writes eval/jev_calibration.json.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
SET = HERE.parent / "brain" / "jev_calibration_set.jsonl"
OUT = HERE / "jev_calibration.json"


def main() -> int:
    from brain import jev_router as j
    rows = [json.loads(l) for l in SET.read_text(encoding="utf-8").splitlines() if l.strip()]
    scored = []
    for r in rows:
        p = j.pick_skill(r["utterance"])
        scored.append((r["label"], p["handler"], float(p["confidence"])))
    n = len(scored)
    brier = sum((c - (1.0 if g == lab else 0.0)) ** 2 for lab, g, c in scored) / max(1, n)
    acc = sum(1 for lab, g, _ in scored if g == lab) / max(1, n)
    threshold, prec = 1.01, 0.0
    for t in (0.8, 0.85, 0.9, 0.95, 1.0):
        sel = [(lab, g) for lab, g, c in scored if g == "status" and c >= t]
        if sel:
            pr = sum(1 for lab, g in sel if lab == g) / len(sel)
            if pr >= 0.95:
                threshold, prec = t, pr
                break
    ok = n >= 100 and brier <= 0.25 and threshold <= 1.0
    out = {"n": n, "brier": round(brier, 4), "accuracy": round(acc, 4), "threshold": threshold,
           "status_precision": round(prec, 4), "assist_ok": ok, "assist_tools": sorted(j.ASSIST_TOOLS)}
    OUT.write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")
    print(json.dumps(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
