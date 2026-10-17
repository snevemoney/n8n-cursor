"""Living artifacts, slice 3 (Evens 10-16/17: "updates as we build"): an artifact folder may hold refresh.json
{"command": "<shell that prints the page>"}; every signal-queue run (30 min) re-renders it when the output changed,
keeping the previous page in history/. No model call, no cost."""
from __future__ import annotations

import json
import subprocess
import time
from pathlib import Path

ARTIFACTS = Path.home() / "ArtCraft Studio/00 Private/Projects/Jarvis/ARTIFACTS"
TIMEOUT_S = 90


def refresh_all(root: Path = ARTIFACTS) -> dict:
    out = {"refreshed": [], "unchanged": [], "failed": []}
    for spec in sorted(root.glob("*/*/refresh.json")) if root.is_dir() else []:
        folder = spec.parent
        try:
            cmd = str(json.loads(spec.read_text()).get("command") or "")
            pages = [p for p in folder.iterdir() if p.is_file() and p.stem == folder.name and p.suffix[1:] in ("html", "md", "csv", "json", "svg")]
            if not cmd or not pages:
                out["failed"].append(f"{folder.name}: no command or page"); continue
            page = pages[0]
            cp = subprocess.run(["/bin/zsh", "-lc", cmd], capture_output=True, text=True, timeout=TIMEOUT_S, cwd=str(folder))
            body = cp.stdout
            if cp.returncode != 0 or not body.strip():
                out["failed"].append(f"{folder.name}: exit {cp.returncode} {cp.stderr.strip()[:120]}"); continue
            if body == page.read_text():
                out["unchanged"].append(folder.name); continue
            (folder / "history").mkdir(exist_ok=True)
            page.rename(folder / "history" / f"{time.strftime('%Y%m%d-%H%M%S')}{page.suffix}")
            page.write_text(body)
            _touch_index(root, page)
            out["refreshed"].append(folder.name)
        except Exception as exc:  # noqa: BLE001 - one artifact never stops the others
            out["failed"].append(f"{folder.name}: {exc}")
    return out


def _touch_index(root: Path, page: Path) -> None:
    index = root / "INDEX.md"
    if not index.exists():
        return
    rel = str(page.relative_to(root))
    lines = index.read_text().splitlines()
    for i, line in enumerate(lines):
        if f"]({rel})" in line:
            lines[i] = line.split(" — ")[0] + f" — {page.suffix[1:]}, refreshed {time.strftime('%Y-%m-%d %H:%M')}"
    index.write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    print(json.dumps(refresh_all()))
