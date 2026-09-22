#!/usr/bin/env python3
"""Scan tracked env and credential files. Print path and kind only. Never print values."""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PATTERNS = (
    ("sk-prefix", re.compile(r"sk-[A-Za-z0-9_\-]{12,}")),
    ("github-token", re.compile(r"ghp_[A-Za-z0-9]{20,}")),
    ("aws-access-key", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("private-key", re.compile(r"-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----")),
    ("password-assignment", re.compile(r"(?i)(?:password|secret|api_key)\s*=\s*\S{8,}")),
)
NAME = re.compile(r"(^|/)\.env($|\.)|(^|/)credentials?\.(json|env|txt)$|(^|/)secrets?\.(json|env|txt)$", re.I)


def interesting(rel: str) -> bool:
    if "node_modules/" in rel or rel.endswith(".example") or rel.endswith("env.example"):
        return False
    return NAME.search(rel) is not None


def main() -> int:
    listed = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=str(ROOT),
        capture_output=True,
        check=True,
    )
    hits: list[str] = []
    for raw in listed.stdout.split(b"\0"):
        if not raw:
            continue
        rel = raw.decode()
        if not interesting(rel):
            continue
        path = ROOT / rel
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        kinds = sorted({name for name, pattern in PATTERNS if pattern.search(text)})
        if kinds:
            hits.append(f"{rel}: {', '.join(kinds)}")
    if hits:
        print("secret-scan FAIL")
        for hit in hits:
            print(hit)
        return 1
    print("secret-scan PASS")
    print("credential rotation is still required for values that remain in git history")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
