#!/usr/bin/env python3
"""Typed hive state.json — filter one key into the model. Do not dump the store.

Usage:
  python3 scripts/hive/hive-state.py get --key last_run
  python3 scripts/hive/hive-state.py get --key jobs --status yellow
  python3 scripts/hive/hive-state.py get --key profile
  python3 scripts/hive/hive-state.py get --key product_factory
  python3 scripts/hive/hive-state.py set-job --id coverage-loop --name coverage-loop --status working --desk parent
  python3 scripts/hive/hive-state.py log-run --job coverage-loop --desk parent --done-check "..." --stop-kind metric
  python3 scripts/hive/hive-state.py receipt --tokens unknown --duration "12m" --correctness untested

IDs are monotonic: deleting a job row does not reset next_run_id.
Do not migrate this store to n8n Data tables.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATE = ROOT / "docs/hive/outer-heaven/.hive/state.json"
ALLOWED = ("schema_version", "ids", "profile", "jobs", "last_run", "product_factory")
JOB_STATUSES = ("working", "yellow", "done")
CORRECTNESS = ("pass", "fail", "untested")


def load() -> dict:
    if not STATE.is_file():
        raise SystemExit(f"missing {STATE}")
    data = json.loads(STATE.read_text(encoding="utf-8"))
    if not data.get("ids", {}).get("monotonic"):
        raise SystemExit("ids.monotonic must stay true (delete ≠ reset)")
    return data


def save(data: dict) -> None:
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def today() -> str:
    return date.today().isoformat()


def cmd_get(args: argparse.Namespace) -> int:
    if args.key not in ALLOWED:
        print(
            f"refuse: key must be one of {', '.join(ALLOWED)} — do not dump the store",
            file=sys.stderr,
        )
        return 2
    data = load()
    slice_ = data.get(args.key)
    if args.key == "jobs":
        rows = list(slice_ or [])
        if args.status:
            rows = [r for r in rows if r.get("status") == args.status]
        if args.job:
            rows = [r for r in rows if r.get("id") == args.job or r.get("name") == args.job]
        slice_ = rows
    print(json.dumps(slice_, indent=2))
    return 0


def cmd_set_job(args: argparse.Namespace) -> int:
    if args.status not in JOB_STATUSES:
        print(f"refuse: status must be {JOB_STATUSES}", file=sys.stderr)
        return 2
    data = load()
    jobs = list(data.get("jobs") or [])
    row = {
        "id": args.id,
        "name": args.name or args.id,
        "status": args.status,
        "desk": args.desk,
        "updated": today(),
    }
    if args.note:
        row["note"] = args.note
    replaced = False
    for i, existing in enumerate(jobs):
        if existing.get("id") == args.id:
            jobs[i] = row
            replaced = True
            break
    if not replaced:
        jobs.append(row)
    data["jobs"] = jobs
    save(data)
    print(json.dumps(row, indent=2))
    return 0


def cmd_log_run(args: argparse.Namespace) -> int:
    data = load()
    ids = data.setdefault("ids", {"monotonic": True, "next_run_id": 1})
    ids["monotonic"] = True
    run_id = int(ids.get("next_run_id") or 1)
    entry = {
        "id": run_id,
        "job": args.job,
        "desk": args.desk,
        "at": today(),
        "done_check": args.done_check,
        "stop_kind": args.stop_kind,
    }
    log = list(data.get("log") or [])
    log.append(entry)
    data["log"] = log
    last = {
        "id": run_id,
        "job": args.job,
        "desk": args.desk,
        "at": today(),
        "done_check": args.done_check,
        "stop_kind": args.stop_kind,
        "token_receipt": (data.get("last_run") or {}).get("token_receipt")
        or {"tokens": None, "duration": None, "correctness": "untested"},
    }
    data["last_run"] = last
    ids["next_run_id"] = run_id + 1
    save(data)
    print(json.dumps(last, indent=2))
    return 0


def cmd_receipt(args: argparse.Namespace) -> int:
    if args.correctness not in CORRECTNESS:
        print(f"refuse: correctness must be {CORRECTNESS}", file=sys.stderr)
        return 2
    data = load()
    last = data.setdefault("last_run", {})
    tokens: int | str | None = args.tokens
    if tokens is not None and str(tokens).isdigit():
        tokens = int(tokens)
    last["token_receipt"] = {
        "tokens": tokens,
        "duration": args.duration,
        "correctness": args.correctness,
    }
    data["last_run"] = last
    save(data)
    print(json.dumps(last["token_receipt"], indent=2))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Filter one hive-state key. Never dump.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("get", help="Print one typed key (not the whole store)")
    g.add_argument("--key", required=True, choices=ALLOWED)
    g.add_argument("--status", choices=JOB_STATUSES)
    g.add_argument("--job")

    s = sub.add_parser("set-job", help="Upsert one observe-pane job row")
    s.add_argument("--id", required=True)
    s.add_argument("--name")
    s.add_argument("--status", required=True, choices=JOB_STATUSES)
    s.add_argument("--desk", required=True)
    s.add_argument("--note")

    lg = sub.add_parser("log-run", help="Append last-run; bump monotonic id")
    lg.add_argument("--job", required=True)
    lg.add_argument("--desk", required=True)
    lg.add_argument("--done-check", required=True)
    lg.add_argument("--stop-kind", default="metric")

    r = sub.add_parser("receipt", help="Write token-receipt onto last_run")
    r.add_argument("--tokens", default="unknown")
    r.add_argument("--duration", required=True)
    r.add_argument("--correctness", required=True, choices=CORRECTNESS)

    args = ap.parse_args()
    if args.cmd == "get":
        return cmd_get(args)
    if args.cmd == "set-job":
        return cmd_set_job(args)
    if args.cmd == "log-run":
        return cmd_log_run(args)
    if args.cmd == "receipt":
        return cmd_receipt(args)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
