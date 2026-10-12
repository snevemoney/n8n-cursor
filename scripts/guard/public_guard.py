#!/usr/bin/env python3
"""Block private shared files, absolute /Users|/home paths and secrets from a PUBLIC repo.

Checks only what a change ADDS, so old content does not fail every commit.
  --staged            pre-commit: the index vs HEAD
  --range BASE..HEAD  CI: a pushed range
  --files a b c       scan whole files (tests, ad hoc)
Exit 1 with one line per finding. Never prints a secret value, only its kind and location.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

# Private shared files live in ~/.grok-private, never in the repo.
PRIVATE_NAME_RE = re.compile(
    r"(^|/)(ACTIVE_TASKS|MAC_SHARED_MEMORY|SECURITY_TODO|CURRENT_STATE)\.md$"
    r"|(^|/)(PLATFORM_DIGEST|OBSIDIAN_HUB_CONTRACT)\.md$"
    r"|(^|/)(SHARED_MEMORY_TIMELINE|OBSIDIAN_STALE_CATCHUP)[^/]*\.md$"
    r"|(^|/)[^/]*\.grok-shared\.md$"
    r"|(^|/)gold_vault\.local\.json$"
    r"|(^|/)jarvis-turns\.jsonl$"
    r"|(^|/)\.grok-private/",
)
# Paths that already hold an OLD tracked copy (pre-existing, outside os/shared) are allowed.
PRIVATE_ALLOW_RE = re.compile(r"^docs/hive/outer-heaven/CURRENT_STATE\.md$")
ABS_PATH_RE = re.compile(r"(?<![\w.~])/(?:Users|home)/(?!runner\b|box\b|user\b|USER\b|\$|<|\{)[A-Za-z0-9._-]+/")
SECRET_RES = {
    "openrouter/openai key": re.compile(r"\bsk-(?:or-v1-|proj-|ant-)?[A-Za-z0-9_-]{24,}"),
    "github token": re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{40,}"),
    "slack token": re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}"),
    "aws key id": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "google api key": re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----"),
    "bearer literal": re.compile(r"Bearer\s+[A-Za-z0-9._-]{30,}"),
}
SKIP_CONTENT_RE = re.compile(r"\.(png|jpe?g|gif|webp|pdf|zip|gz|mp[34]|mov|woff2?|ttf|ico|min\.js)$|(^|/)vendor/", re.I)
ALLOW_MARK = "public-guard: allow"


def scan_text(path: str, lines: list[tuple[int, str]]) -> list[str]:
    out = []
    if SKIP_CONTENT_RE.search(path) or path.endswith("public_guard.py") or "/test_public_guard" in path:
        return out
    for no, line in lines:
        if ALLOW_MARK in line:
            continue
        if ABS_PATH_RE.search(line):
            out.append(f"{path}:{no}: absolute home path (use ~/ or $HOME)")
        for kind, rx in SECRET_RES.items():
            if rx.search(line):
                out.append(f"{path}:{no}: possible {kind} (value not shown)")
    return out


def check_names(paths: list[str]) -> list[str]:
    return [f"{p}: private shared file must live in ~/.grok-private, not the repo"
            for p in paths if PRIVATE_NAME_RE.search(p) and not PRIVATE_ALLOW_RE.search(p)]


def _git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


def added_lines(diff: str) -> dict[str, list[tuple[int, str]]]:
    files: dict[str, list[tuple[int, str]]] = {}
    cur, no = None, 0
    for raw in diff.splitlines():
        if raw.startswith("+++ "):
            cur = raw[6:] if raw.startswith("+++ b/") else None
            if cur:
                files.setdefault(cur, [])
        elif raw.startswith("@@"):
            m = re.search(r"\+(\d+)", raw)
            no = int(m.group(1)) if m else 0
        elif cur and raw.startswith("+") and not raw.startswith("+++"):
            files[cur].append((no, raw[1:]))
            no += 1
        elif cur and not raw.startswith("-"):
            no += 1
    return files


def run(diff_args: list[str], name_args: list[str]) -> list[str]:
    names = [n for n in _git("diff", "--name-only", "--diff-filter=AR", *name_args).splitlines() if n]
    found = check_names(names)
    for path, lines in added_lines(_git("diff", "-U0", "--no-color", *diff_args)).items():
        found += scan_text(path, lines)
    return found


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--staged", action="store_true")
    g.add_argument("--range")
    g.add_argument("--files", nargs="+")
    a = ap.parse_args(argv)
    if a.staged:
        found = run(["--cached"], ["--cached"])
    elif a.range:
        found = run([a.range], [a.range])
    else:
        found = check_names(a.files)
        for f in a.files:
            try:
                text = Path(f).read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            found += scan_text(f, list(enumerate(text.splitlines(), 1)))
    for line in found:
        print("public-guard:", line)
    if found:
        print(f"public-guard: {len(found)} finding(s). Fix them, or mark a reviewed line with '{ALLOW_MARK}'.")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main())
