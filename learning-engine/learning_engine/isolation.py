"""Isolation guard: learning-engine PRs may only touch this tree plus two files."""

from __future__ import annotations

import posixpath
import sys
from typing import Iterable

ALLOWED_OUTSIDE = frozenset(
    {
        ".github/workflows/learning-engine.yml",
        ".github/workflows/ai-code-validation.yml",
    }
)


def _has_control_chars(raw: str) -> bool:
    return any(ord(ch) < 32 or ord(ch) == 127 for ch in raw)


def _rejected_raw_path(raw: str) -> bool:
    """Reject empty, padded, control, traversal, or absolute paths. No strip()."""
    if raw == "":
        return True
    if raw != raw.strip():
        return True
    if _has_control_chars(raw):
        return True
    if raw.startswith("/"):
        return True
    if ".." in raw.split("/") or ".." in raw.split("\\"):
        return True
    return False


def _normalize_repo_path(raw: str) -> str:
    path = raw.replace("\\", "/")
    while path.startswith("./"):
        path = path[2:]
    return path


def forbidden_outside_paths(paths: Iterable[str]) -> list[str]:
    """Return changed paths that are outside the allowlist."""
    bad: list[str] = []
    for raw in paths:
        if _rejected_raw_path(raw):
            bad.append(raw)
            continue
        path = _normalize_repo_path(raw)
        if path == "":
            bad.append(raw)
            continue
        normalized = posixpath.normpath(path)
        parts = path.split("/")
        norm_parts = normalized.split("/")
        if (
            ".." in parts
            or ".." in norm_parts
            or path.startswith("/")
            or normalized.startswith("/")
        ):
            bad.append(raw)
            continue
        if normalized == "learning-engine" or normalized.startswith("learning-engine/"):
            continue
        if normalized in ALLOWED_OUTSIDE:
            continue
        bad.append(raw)
    return bad


def main(argv: list[str] | None = None) -> int:
    if argv is None:
        flags = sys.argv[1:]
        allow_empty = "--allow-empty" in flags
        lines = [line.rstrip("\n") for line in sys.stdin]
    else:
        allow_empty = "--allow-empty" in argv
        lines = [item for item in argv if item != "--allow-empty"]
    if not lines or all(item == "" for item in lines):
        if allow_empty:
            return 0
        print("isolation guard: empty path list")
        return 1
    bad = forbidden_outside_paths(lines)
    if not bad:
        return 0
    print(
        "learning-engine CI may only change learning-engine/, "
        ".github/workflows/learning-engine.yml, and "
        ".github/workflows/ai-code-validation.yml"
    )
    for path in bad:
        print(path)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
