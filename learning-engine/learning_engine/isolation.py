"""Isolation guard: learning-engine PRs may only touch this tree plus two files."""

from __future__ import annotations

import sys
from typing import Iterable

ALLOWED_OUTSIDE = frozenset(
    {
        ".github/workflows/learning-engine.yml",
        ".github/workflows/ai-code-validation.yml",
    }
)


def forbidden_outside_paths(paths: Iterable[str]) -> list[str]:
    """Return changed paths that are outside the allowlist."""
    bad: list[str] = []
    for raw in paths:
        path = raw.strip()
        while path.startswith("./"):
            path = path[2:]
        if not path:
            continue
        if path == "learning-engine" or path.startswith("learning-engine/"):
            continue
        if path in ALLOWED_OUTSIDE:
            continue
        bad.append(path)
    return bad


def main(argv: list[str] | None = None) -> int:
    lines = argv if argv is not None else [line.rstrip("\n") for line in sys.stdin]
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
