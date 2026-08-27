#!/usr/bin/env python3
"""Validate hive notify JSON: Grok Watchdog is the sink; no Telegram fallback."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HIVE = ROOT / "workflows" / "hive"

NOTIFY_FILES = [
    "error-heal-notify.json",
    "ce-lead-notify.json",
    "outer-heaven-report-notify.json",
    "daily-operational-digest.json",
]

HARDCODED_SECRET_PATTERNS = (
    "123456789:",
    "xoxb-",
    "sk-",
    "ghp_",
)


def load(name: str) -> dict:
    path = HIVE / name
    return json.loads(path.read_text())


def nodes_by_name(wf: dict) -> dict[str, dict]:
    return {n["name"]: n for n in wf.get("nodes", [])}


def fail(msg: str) -> None:
    print(f"FAIL: {msg}")
    raise SystemExit(1)


def assert_watchdog(name: str, wf: dict) -> None:
    nodes = nodes_by_name(wf)
    alert = nodes.get("Alert Grok Watchdog")
    if not alert:
        fail(f"{name}: missing HTTP node 'Alert Grok Watchdog'")
    if alert.get("type") != "n8n-nodes-base.httpRequest":
        fail(f"{name}: Alert Grok Watchdog must be httpRequest")
    if alert.get("continueOnFail") is not True:
        fail(f"{name}: Alert Grok Watchdog must have continueOnFail true")
    params = alert.get("parameters") or {}
    if params.get("method") != "POST":
        fail(f"{name}: Alert Grok Watchdog must POST")
    url = params.get("url") or ""
    if "GROK_WATCHDOG_WEBHOOK_URL" not in url:
        fail(f"{name}: Alert Grok Watchdog URL must use $env.GROK_WATCHDOG_WEBHOOK_URL")
    if "http://" in url or "https://" in url:
        fail(f"{name}: invented Watchdog URL in repo")
    body = params.get("jsonBody") or ""
    for field in ("workflow", "status", "error", "correlationId", "executionId"):
        if field not in body:
            fail(f"{name}: Alert Grok Watchdog body missing {field}")


def assert_no_telegram_sink(name: str, wf: dict) -> None:
    for node in wf.get("nodes", []):
        params = node.get("parameters") or {}
        url = str(params.get("url") or "")
        is_telegram = "api.telegram.org" in url or "Telegram" in node.get("name", "")
        if not is_telegram:
            continue
        if node.get("disabled") is True:
            continue
        fail(f"{name}: active Telegram send '{node.get('name')}' — sink must be Grok Watchdog")


def assert_register_optional(name: str, wf: dict) -> None:
    reg = nodes_by_name(wf).get("Register Scorpion")
    if not reg:
        return
    if reg.get("continueOnFail") is not True:
        fail(f"{name}: Register Scorpion must be continueOnFail optional audit")


def assert_no_secrets(name: str, wf: dict) -> None:
    blob = json.dumps(wf)
    for needle in HARDCODED_SECRET_PATTERNS:
        if needle in blob:
            fail(f"{name}: possible hardcoded secret value in repo: {needle}")
    if "GROK_WATCHDOG_WEBHOOK_URL" not in blob:
        fail(f"{name}: missing GROK_WATCHDOG_WEBHOOK_URL env reference")


def main() -> None:
    for name in NOTIFY_FILES:
        wf = load(name)
        if wf.get("_stub") or not wf.get("nodes"):
            fail(f"{name}: still a stub/empty — notify JSON must be real and inactive")
        if wf.get("active") is True:
            fail(f"{name}: active must stay false in repo")
        assert_watchdog(name, wf)
        assert_no_telegram_sink(name, wf)
        assert_register_optional(name, wf)
        assert_no_secrets(name, wf)
        print(f"OK {name}: Grok Watchdog sink")

    digest = load("daily-operational-digest.json")
    merge = nodes_by_name(digest).get("Wait For Both Fetches")
    if not merge:
        fail("daily-operational-digest.json: missing Wait For Both Fetches")
    if (merge.get("parameters") or {}).get("mode") != "append":
        fail("daily-operational-digest.json: Wait For Both Fetches must use mode=append")
    print("OK daily-operational-digest.json: Wait For Both Fetches mode=append")
    print("PASS hive notify sink validation")


if __name__ == "__main__":
    main()
