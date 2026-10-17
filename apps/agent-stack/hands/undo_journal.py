"""Undo for Jarvis's own file changes (Mark-LV method 5, rebuilt from scratch; canvas markadoption).

Every write/edit Jarvis makes keeps the old bytes in the job folder. undo takes the newest changes back: restores the
old file, or moves a file Jarvis created to the Trash (never a hard delete). A file someone changed after Jarvis wrote
it is left alone, so undo can never wipe Evens's own edits.
"""
from __future__ import annotations
import hashlib
import json
import os
import shutil
import time
from pathlib import Path


def _sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else ""


def _journal(task_dir: Path) -> tuple[Path, list]:
    j = task_dir / "undo" / "journal.json"
    return j, (json.loads(j.read_text()) if j.is_file() else [])


def write(task_dir: Path, path: Path, text: str) -> None:
    """Write text to path, journaling what was there before."""
    path = Path(path).resolve()  # write through a symlink, as a plain write would, instead of replacing the link
    j, rows = _journal(task_dir)
    j.parent.mkdir(parents=True, exist_ok=True)
    n = len(rows) + 1
    existed = path.is_file()
    if existed:
        shutil.copy2(path, j.parent / f"{n}.bak")
    path.parent.mkdir(parents=True, exist_ok=True)
    # atomic: a crash mid-write leaves the old file or the new one, never half of each (canvas nativewrite)
    tmp = path.with_name(f".{path.name}.jarvis-tmp")
    tmp.write_text(text)
    if existed:
        shutil.copymode(j.parent / f"{n}.bak", tmp)  # keep his file's permissions
    os.replace(tmp, path)
    rows.append({"n": n, "path": str(path), "existed": existed, "after": _sha(path), "at": time.time(), "undone": False})
    j.write_text(json.dumps(rows, indent=1))


def undo(task_dir: Path, steps: int = 1, trash: Path | None = None) -> list:
    """Take back the newest `steps` changes; returns one plain line per change."""
    j, rows = _journal(task_dir)
    trash = trash or Path.home() / ".Trash"
    said = []
    for row in [r for r in reversed(rows) if not r["undone"]][:max(1, int(steps))]:
        p = Path(row["path"])
        if _sha(p) != row["after"]:
            said.append(f"left {p.name} alone: it changed after I wrote it")
            break  # older changes sit under that one; stop rather than undo out of order
        if row["existed"]:
            shutil.copy2(j.parent / f"{row['n']}.bak", p)
            said.append(f"put {p.name} back the way it was")
        else:
            trash.mkdir(parents=True, exist_ok=True)
            shutil.move(str(p), str(trash / f"{p.name}.jarvis-undo-{int(time.time())}"))
            said.append(f"moved {p.name}, which I had created, to the Trash")
        row["undone"] = True
    j.write_text(json.dumps(rows, indent=1)) if rows else None
    return said or ["nothing of mine to undo in this job"]
