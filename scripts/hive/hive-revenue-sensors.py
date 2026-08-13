#!/usr/bin/env python3
"""Revenue intelligence sensors — no n8n. Read-only HTTP + optional Scorpion register.

Usage:
  python3 scripts/hive/hive-revenue-sensors.py hourly [--register] [--dry-run]
  python3 scripts/hive/hive-revenue-sensors.py ingest-signal --source reddit --signal "..." [--register]
  python3 scripts/hive/hive-revenue-sensors.py rank-features --signals '[{"signal":"x","revenueScore":2,"easeScore":3}]' [--register]
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

GOLDEN_PATHS_URL = "https://evenslouis.ca/scorpion/api/hive/golden-paths"
CE_ACTIONS_URL = "https://evenslouis.ca/pro/api/actions?limit=50"
REPO = Path(__file__).resolve().parents[2]


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def register_outcome(agent: str, payload: dict, dry_run: bool) -> None:
    if dry_run:
        print(json.dumps({"wouldRegister": payload}, indent=2))
        return
    tool = REPO / "scripts/hive/grok-hive-tool.py"
    proc = subprocess.run(
        [
            sys.executable,
            str(tool),
            "--grok-agent",
            agent,
            "--tool",
            "scorpion_register_outcome",
            "--params",
            json.dumps(payload),
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if proc.returncode != 0:
        raise SystemExit(proc.stderr or proc.stdout or "register failed")
    print(proc.stdout.strip())


def cmd_hourly(args: argparse.Namespace) -> int:
    gp = fetch_json(GOLDEN_PATHS_URL)
    pass_count = gp.get("passCount", 0)
    total = gp.get("total", 0)
    stability = round((pass_count / total) * 100) if total else 0
    ce_open = 0
    try:
        ce = fetch_json(CE_ACTIONS_URL)
        ce_open = len(ce.get("actions", [])) if isinstance(ce.get("actions"), list) else ce.get("count", 0)
    except (urllib.error.URLError, json.JSONDecodeError):
        ce_open = -1

    cid = f"revenue-sensor-{datetime.now(timezone.utc).strftime('%Y%m%d-%H')}"
    summary = f"Revenue sensor: GP {pass_count}/{total} ({stability}%), CE open {ce_open}"
    body = {
        "correlationId": cid,
        "jobType": "product.hypothesis.proposed",
        "goal": "Hourly revenue sensor (read-only, no n8n)",
        "source": "hive-revenue-sensors.py",
        "status": "done",
        "summary": summary,
        "metadata": {
            "goldenPaths": {"pass": pass_count, "total": total, "stabilityPct": stability},
            "ceOpenActions": ce_open,
        },
    }
    print(json.dumps(body, indent=2))
    if args.register:
        register_outcome(args.agent, body, args.dry_run)
    return 0


def cmd_ingest_signal(args: argparse.Namespace) -> int:
    if not args.signal.strip():
        raise SystemExit("--signal required")
    cid = args.correlation_id or f"signal-{int(datetime.now(timezone.utc).timestamp())}"
    summary = f"Market signal [{args.source}]: {args.signal[:120]}"
    body = {
        "correlationId": cid,
        "jobType": "product.market_signal.ingested",
        "goal": "Market signal ingest (no n8n)",
        "source": "hive-revenue-sensors.py",
        "status": "done",
        "summary": summary,
        "metadata": {"source": args.source, "signal": args.signal, "url": args.url or ""},
    }
    print(json.dumps(body, indent=2))
    if args.register:
        register_outcome(args.agent, body, args.dry_run)
    return 0


def cmd_rank_features(args: argparse.Namespace) -> int:
    try:
        signals = json.loads(args.signals)
    except json.JSONDecodeError as e:
        raise SystemExit(f"Invalid --signals JSON: {e}") from e
    if not isinstance(signals, list):
        raise SystemExit("--signals must be a JSON array")

    ranked = sorted(
        (
            {
                **s,
                "score": float(s.get("revenueScore", 1)) * float(s.get("easeScore", 1)),
            }
            for s in signals
        ),
        key=lambda x: x["score"],
        reverse=True,
    )
    for i, row in enumerate(ranked, 1):
        row["rank"] = i

    top = ranked[0] if ranked else None
    cid = args.correlation_id or f"rank-{int(datetime.now(timezone.utc).timestamp())}"
    summary = (
        f"Top feature: {top.get('signal') or top.get('name', 'item')} (score {top['score']})"
        if top
        else "No signals to rank"
    )
    body = {
        "correlationId": cid,
        "jobType": "product.feature_rank.proposed",
        "goal": "Feature priority rank revenue x ease (no n8n)",
        "source": "hive-revenue-sensors.py",
        "status": "done",
        "summary": summary,
        "metadata": {"ranked": ranked, "top": top},
    }
    print(json.dumps(body, indent=2))
    if args.register:
        register_outcome(args.agent, body, args.dry_run)
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--register", action="store_true", help="Register via grok-hive-tool.py")
    ap.add_argument("--agent", default="Revenue Intel", help="Grok agent for --register")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_hourly = sub.add_parser("hourly", help="Read golden paths + CE queue snapshot")
    p_hourly.set_defaults(func=cmd_hourly)

    p_ingest = sub.add_parser("ingest-signal", help="Normalize + optional register a market signal")
    p_ingest.add_argument("--source", default="unknown")
    p_ingest.add_argument("--signal", required=True)
    p_ingest.add_argument("--url", default="")
    p_ingest.add_argument("--correlation-id", default="")
    p_ingest.set_defaults(func=cmd_ingest_signal)

    p_rank = sub.add_parser("rank-features", help="Rank signals by revenue x ease")
    p_rank.add_argument("--signals", required=True, help='JSON array, e.g. \'[{"signal":"x","revenueScore":2}]\'')
    p_rank.add_argument("--correlation-id", default="")
    p_rank.set_defaults(func=cmd_rank_features)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
