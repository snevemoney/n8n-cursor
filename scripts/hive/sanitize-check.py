#!/usr/bin/env python3
"""Sanitize-in / check-out. No AI. Pass ≠ send.

Inbound: redact before a model sees the text.
Outbound: fail-halt if secrets remain.
Stock secret-keys miss a password line — that row is a required fixture.

Usage:
  python3 scripts/hive/sanitize-check.py --text "..." --direction in
  python3 scripts/hive/sanitize-check.py --fixture
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = ROOT / "scripts/hive/fixtures/sanitize-in-check-out.jsonl"

KEY_SHAPED = re.compile(
    r"(sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|Bearer\s+[A-Za-z0-9._\-]{20,}"
    r"|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})",
    re.I,
)
PASSWORD_LINE = re.compile(
    r"\b(password|passwd|passphrase|pwd)\b\s*(is|=|:)?\s*\S+",
    re.I,
)
REDACT = "[REDACTED]"


def hits(text: str) -> list[str]:
    found: list[str] = []
    if KEY_SHAPED.search(text or ""):
        found.append("secret-key")
    if PASSWORD_LINE.search(text or ""):
        found.append("password")
    return found


def sanitize(text: str) -> str:
    out = KEY_SHAPED.sub(REDACT, text or "")
    return PASSWORD_LINE.sub(REDACT, out)


def check(text: str, direction: str) -> dict:
    found = hits(text)
    verdict = "fail" if found else "pass"
    return {
        "direction": direction,
        "verdict": verdict,
        "hits": found,
        "redacted": sanitize(text) if direction == "in" else None,
        "pass_neq_send": True,
        "next": "HITL" if verdict == "pass" else "halt",
    }


def run_fixture() -> int:
    if not FIXTURE.is_file():
        print(f"missing {FIXTURE}", file=sys.stderr)
        return 2
    failed = 0
    password_row = False
    for line in FIXTURE.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        got = check(row["text"], row["direction"])
        ok = got["verdict"] == row["expect"]
        if row["id"] == "bad-password-line":
            password_row = "password" in got["hits"]
        mark = "OK" if ok else "MISS"
        if not ok:
            failed += 1
        print(f"{mark} {row['id']} expect={row['expect']} got={got['verdict']} hits={got['hits']}")
    if not password_row:
        print("FAIL: password line must be a required catch (secret-keys ≠ password)", file=sys.stderr)
        return 1
    if failed:
        print(f"FAIL: {failed} fixture row(s)", file=sys.stderr)
        return 1
    print("OK: sanitize-in-check-out fixture (pass ≠ send)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--text")
    ap.add_argument("--direction", choices=("in", "out"), default="in")
    ap.add_argument("--fixture", action="store_true")
    args = ap.parse_args()
    if args.fixture:
        return run_fixture()
    if args.text is None:
        print("need --text or --fixture", file=sys.stderr)
        return 2
    print(json.dumps(check(args.text, args.direction), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
