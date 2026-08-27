#!/usr/bin/env python3
"""POST-LOG — append one JSON line. Always exit 0.

Operator rule 2026-08-27: POST cannot block (PostToolUse, Notification, SessionStart).
Log what actually ran. SessionStart cannot prevent the session.

Sink: event-bus.py if present, else ~/.grokbot/os-audit.jsonl.
Telegram / Scorpion are legacy — not the sink. Grok notify.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

OS_DIR = Path(__file__).resolve().parent
EVENT_BUS = OS_DIR / "event-bus.py"
FALLBACK_AUDIT = Path.home() / ".grokbot/os-audit.jsonl"


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _load_event_bus() -> Any | None:
    if not EVENT_BUS.is_file():
        return None
    try:
        spec = importlib.util.spec_from_file_location("event_bus", EVENT_BUS)
        if spec is None or spec.loader is None:
            return None
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    except Exception as exc:  # noqa: BLE001 — POST never blocks
        print(f"post-log: event-bus load failed: {exc}", file=sys.stderr)
        return None


def _row(agent: str, action: str, outcome: str, correlation_id: str) -> dict[str, Any]:
    return {
        "agent": agent,
        "action": action,
        "outcome": outcome,
        "correlationId": correlation_id,
        "timestamp": _now_iso(),
    }


def _append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def post_log(
    agent: str,
    action: str,
    outcome: str,
    correlation_id: str,
    *,
    path: Path | None = None,
) -> dict[str, Any]:
    """Write one line. Never raises. Returns sink metadata."""
    cid = correlation_id or str(uuid.uuid4())
    row = _row(agent, action, outcome, cid)
    bus = _load_event_bus()
    if bus is not None:
        try:
            event = {
                "type": "os.post_log",
                "source": "post-log.py",
                "actor": agent,
                "agent": agent,
                "action": action,
                "outcome": outcome,
                "correlationId": cid,
                "payload": row,
            }
            kwargs: dict[str, Any] = {}
            if path is not None:
                kwargs["path"] = path
            inserted, eid = bus.append_event(event, **kwargs)
            print(json.dumps({"ok": True, "sink": "event-bus", "event_id": eid, "inserted": inserted, **row}))
            return {"ok": True, "sink": "event-bus", "event_id": eid}
        except Exception as exc:  # noqa: BLE001
            print(f"post-log: event-bus write failed: {exc}", file=sys.stderr)

    dest = path or FALLBACK_AUDIT
    try:
        _append_jsonl(dest, row)
        print(json.dumps({"ok": True, "sink": "os-audit", "path": str(dest), **row}))
        return {"ok": True, "sink": "os-audit", "path": str(dest)}
    except Exception as exc:  # noqa: BLE001
        print(f"post-log: warning: log write failed: {exc}", file=sys.stderr)
        return {"ok": False, "sink": "none", "error": str(exc)}


def self_test() -> int:
    """Verify write + fail-open. Always exit 0 from main(); this returns 1 only as a test signal."""
    fails = 0
    tmp = Path("/tmp/os-post-log-selftest.jsonl")
    if tmp.exists():
        tmp.unlink()
    result = post_log("Watchdog", "self-test", "ok", "corr-selftest", path=tmp)
    if not result.get("ok"):
        print(f"FAIL write: {result}")
        fails += 1
    else:
        lines = [ln for ln in tmp.read_text(encoding="utf-8").splitlines() if ln.strip()]
        last = json.loads(lines[-1])
        payload = last.get("payload") if isinstance(last.get("payload"), dict) else last
        for key in ("agent", "action", "outcome", "correlationId"):
            src = last if key in last else payload
            if key not in src:
                print(f"FAIL missing {key} in {last}")
                fails += 1
        if last.get("correlationId") != "corr-selftest" and payload.get("correlationId") != "corr-selftest":
            print(f"FAIL correlationId: {last}")
            fails += 1

    blocked = Path("/proc/post-log-selftest-cannot-write.jsonl")
    fail_open = post_log("Watchdog", "self-test-fail", "blocked-write", "corr-fail", path=blocked)
    if fail_open.get("ok"):
        print(f"FAIL expected write failure: {fail_open}")
        fails += 1

    if fails:
        print(f"post-log self-test: FAIL ({fails})")
        return 1
    print("post-log self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="POST-LOG: append one JSON line; always exit 0")
    ap.add_argument("--agent", help="Desk / actor that ran")
    ap.add_argument("--action", help="What ran (tool, skill, workflow)")
    ap.add_argument("--outcome", help="What actually happened")
    ap.add_argument("--correlation-id", dest="correlation_id", help="Shared id across PRE + POST")
    ap.add_argument("--path", type=Path, help="Override sink path (tests)")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        # Self-test may return 1 to the runner; hook/log path below always returns 0.
        return self_test()

    agent = args.agent or "unknown"
    action = args.action or "unknown"
    outcome = args.outcome or "unknown"
    cid = args.correlation_id or str(uuid.uuid4())
    try:
        post_log(agent, action, outcome, cid, path=args.path)
    except Exception as exc:  # noqa: BLE001
        print(f"post-log: warning: {exc}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
