"""JSONL helpers used by adapters, harness, and storage."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterable, Iterator

from learning_engine.errors import JsonlError


def read_jsonl(path: Path) -> Iterator[dict[str, Any]]:
    try:
        handle = path.open("rb")
    except FileNotFoundError as exc:
        raise JsonlError(f"JSONL not found: {path}", path=str(path)) from exc
    except OSError as exc:
        raise JsonlError(f"cannot read JSONL {path}: {exc}", path=str(path)) from exc
    try:
        for line_no, raw in enumerate(handle, start=1):
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError as exc:
                raise JsonlError(
                    f"{path}:{line_no}: invalid UTF-8",
                    path=str(path),
                    line=line_no,
                ) from exc
            line = text.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as exc:
                raise JsonlError(
                    f"{path}:{line_no}: invalid JSON: {exc.msg}",
                    path=str(path),
                    line=line_no,
                ) from exc
            if not isinstance(obj, dict):
                raise JsonlError(
                    f"{path}:{line_no}: JSONL line must be an object",
                    path=str(path),
                    line=line_no,
                )
            yield obj
    finally:
        handle.close()


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
            n += 1
    return n


def write_json(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
