#!/usr/bin/env python3
"""Local audit → Watchdog / event-bus. audits → Watchdog, not Scorpion, not Telegram."""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


def _load_event_bus():
    spec = importlib.util.spec_from_file_location(
        "event_bus", Path(__file__).resolve().parent / "event-bus.py"
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load scripts/hive/os/event-bus.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


BUS = _load_event_bus()


def post_log(
    *,
    workflow: str,
    status: str,
    error: str | None,
    correlation_id: str,
    execution_id: str,
    bus_path: Path | None = None,
) -> dict[str, Any]:
    payload = {
        "workflow": workflow,
        "status": status,
        "error": error,
        "correlationId": correlation_id,
        "executionId": execution_id,
        "sink": "grok-watchdog",
        "leftoverScorpion": "NOT the audit sink",
    }
    emit_kwargs: dict[str, Any] = {
        "priority": "P2",
        "entity_id": correlation_id or None,
    }
    if bus_path is not None:
        emit_kwargs["path"] = bus_path
    event_id = BUS.emit(
        "hive.watchdog.run",
        source="post-log",
        actor="local",
        payload=payload,
        **emit_kwargs,
    )

    url = (os.environ.get("GROK_WATCHDOG_WEBHOOK_URL") or "").strip()
    http: dict[str, Any] = {
        "posted": False,
        "reason": "GROK_WATCHDOG_WEBHOOK_URL empty — event-bus only",
    }
    if url:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                http = {"posted": True, "statusCode": getattr(resp, "status", 200)}
        except (urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
            http = {"posted": False, "reason": str(exc), "softFail": True}

    return {"event_id": event_id, "payload": payload, "http": http}


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Local Watchdog audit (event-bus + optional GROK_WATCHDOG_WEBHOOK_URL)"
    )
    ap.add_argument("--workflow", required=True)
    ap.add_argument("--status", default="audit")
    ap.add_argument("--error", default="")
    ap.add_argument("--correlation-id", default="")
    ap.add_argument("--execution-id", default="local")
    ap.add_argument("--bus-path", type=Path, default=None)
    args = ap.parse_args()
    result = post_log(
        workflow=args.workflow,
        status=args.status,
        error=args.error or None,
        correlation_id=args.correlation_id,
        execution_id=args.execution_id,
        bus_path=args.bus_path,
    )
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
