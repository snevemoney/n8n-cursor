"""Isolation guard: learning-engine PRs may only touch this tree plus two files."""

from __future__ import annotations

import posixpath
import sys
from dataclasses import dataclass
from typing import Iterable

ALLOWED_OUTSIDE = frozenset(
    {
        ".github/workflows/learning-engine.yml",
        ".github/workflows/ai-code-validation.yml",
    }
)
SYMLINK_MODE = "120000"
_STATUS_ADD_OR_MODIFY = frozenset({"A", "M", "T", "C", "R"})


@dataclass(frozen=True)
class DiffEntry:
    path: str
    status: str = ""
    old_mode: str = ""
    new_mode: str = ""


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


def _path_forbidden(raw: str) -> bool:
    if _rejected_raw_path(raw):
        return True
    path = _normalize_repo_path(raw)
    if path == "":
        return True
    normalized = posixpath.normpath(path)
    parts = path.split("/")
    norm_parts = normalized.split("/")
    if (
        ".." in parts
        or ".." in norm_parts
        or path.startswith("/")
        or normalized.startswith("/")
    ):
        return True
    if normalized == "learning-engine" or normalized.startswith("learning-engine/"):
        return False
    if normalized in ALLOWED_OUTSIDE:
        return False
    return True


def _status_letter(status: str) -> str:
    return status[:1] if status else ""


def _is_symlink_add_or_modify(entry: DiffEntry) -> bool:
    if entry.new_mode != SYMLINK_MODE:
        return False
    letter = _status_letter(entry.status)
    return letter in _STATUS_ADD_OR_MODIFY or letter == ""


def forbidden_outside_paths(paths: Iterable[str]) -> list[str]:
    """Return changed paths that are outside the allowlist."""
    return forbidden_diff_entries(DiffEntry(path=raw) for raw in paths)


def forbidden_diff_entries(entries: Iterable[DiffEntry]) -> list[str]:
    """Reject outside paths, deletions of outside paths, and symlink adds/edits."""
    bad: list[str] = []
    seen: set[str] = set()
    for entry in entries:
        labels: list[str] = []
        if _is_symlink_add_or_modify(entry):
            labels.append(entry.path)
        if _path_forbidden(entry.path):
            labels.append(entry.path)
        for label in labels:
            if label not in seen:
                seen.add(label)
                bad.append(label)
    return bad


def parse_git_z(data: str) -> list[DiffEntry]:
    """Parse `git diff --raw -z` or `--name-status -z` NUL-separated records."""
    parts = data.split("\0")
    entries: list[DiffEntry] = []
    i = 0
    n = len(parts)
    while i < n:
        part = parts[i]
        if part == "":
            i += 1
            continue
        if part.startswith(":"):
            fields = part[1:].split()
            if len(fields) < 5:
                i += 1
                continue
            path = parts[i + 1] if i + 1 < n else ""
            entries.append(
                DiffEntry(
                    path=path,
                    status=fields[4],
                    old_mode=fields[0],
                    new_mode=fields[1],
                )
            )
            i += 2
            continue
        status = part
        letter = status[:1]
        rest = status[1:]
        if letter in "AMDCTRU" and (
            len(status) == 1 or rest.isdigit() or (rest[:1].isdigit())
        ):
            path = parts[i + 1] if i + 1 < n else ""
            entries.append(DiffEntry(path=path, status=status))
            i += 2
            continue
        entries.append(DiffEntry(path=part))
        i += 1
    return entries


def _entries_from_lines(lines: Iterable[str]) -> list[DiffEntry]:
    entries: list[DiffEntry] = []
    for raw in lines:
        if raw.startswith(":") and " " in raw:
            fields = raw[1:].split()
            if len(fields) >= 6:
                entries.append(
                    DiffEntry(
                        path=fields[-1],
                        status=fields[4],
                        old_mode=fields[0],
                        new_mode=fields[1],
                    )
                )
                continue
        if "\t" in raw:
            status, path = raw.split("\t", 1)
            entries.append(DiffEntry(path=path, status=status))
            continue
        entries.append(DiffEntry(path=raw))
    return entries


def main(argv: list[str] | None = None) -> int:
    if argv is None:
        flags = sys.argv[1:]
        allow_empty = "--allow-empty" in flags
        data = sys.stdin.read()
        if "\0" in data or data.startswith(":"):
            entries = parse_git_z(data)
        else:
            lines = [line.rstrip("\n") for line in data.splitlines()]
            entries = _entries_from_lines(lines)
    else:
        allow_empty = "--allow-empty" in argv
        lines = [item for item in argv if item != "--allow-empty"]
        entries = _entries_from_lines(lines)
    paths = [entry.path for entry in entries]
    if not entries or all(item == "" for item in paths):
        if allow_empty:
            return 0
        print("isolation guard: empty path list")
        return 1
    bad = forbidden_diff_entries(entries)
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
