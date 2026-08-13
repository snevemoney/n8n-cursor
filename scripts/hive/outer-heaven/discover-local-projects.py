#!/usr/bin/env python3
"""Discover local PC project folders not yet in repo-registry.

Emits PROJECTS/_discovered.md for manual promotion.

Usage:
  python3 scripts/hive/outer-heaven/discover-local-projects.py
  python3 scripts/hive/outer-heaven/discover-local-projects.py --vps  # read-only SSH
"""
from __future__ import annotations

import argparse
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import library_root  # noqa: E402

SCAN_ROOTS = [
    Path.home() / "Projects",
    Path.home() / "Developer",
    Path.home() / "n8n-cursor",
    Path.home() / "client-engine-1",
    Path.home() / "client-engine",
]

EXCLUDE_NAMES = {
    "node_modules",
    ".git",
    "hub-game-starter",
    "Library",
    "Applications",
}

MARKERS = {"package.json", "pyproject.toml", "Cargo.toml", "go.mod", "pnpm-workspace.yaml", ".git"}


def looks_like_project(path: Path) -> bool:
    if not path.is_dir():
        return False
    name = path.name
    if name in EXCLUDE_NAMES or name.startswith("."):
        return False
    return any((path / m).exists() for m in MARKERS)


def scan_local() -> list[Path]:
    found: list[Path] = []
    seen: set[str] = set()
    for root in SCAN_ROOTS:
        if not root.is_dir():
            continue
        candidates = [root] if looks_like_project(root) else list(root.iterdir())
        for p in candidates:
            if not looks_like_project(p):
                continue
            key = str(p.resolve())
            if key in seen:
                continue
            seen.add(key)
            found.append(p.resolve())
    return sorted(found, key=lambda x: x.name.lower())


def scan_vps() -> list[str]:
    try:
        out = subprocess.run(
            [
                "ssh",
                "-o",
                "BatchMode=yes",
                "-o",
                "ConnectTimeout=8",
                "root@69.62.66.78",
                "ls -1 /root/domain-paths 2>/dev/null; ls -1 /root 2>/dev/null | head -30",
            ],
            capture_output=True,
            text=True,
            timeout=15,
        )
        if out.returncode != 0:
            return []
        lines = [ln.strip() for ln in out.stdout.splitlines() if ln.strip()]
        return list(dict.fromkeys(lines))
    except (subprocess.TimeoutExpired, OSError):
        return []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--vps", action="store_true")
    args = ap.parse_args()

    local = scan_local()
    vps_lines = scan_vps() if args.vps else []

    out_path = library_root() / "PROJECTS" / "_discovered.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    now = datetime.now(timezone.utc).isoformat()
    lines = [
        "# Discovered projects (manual promotion)",
        "",
        f"_Generated {now} by discover-local-projects.py_",
        "",
        "Promote entries to full `PROJECTS/<id>.md` notes after review.",
        "",
        "## Mac / local",
        "",
        "| Path | Name |",
        "|------|------|",
    ]
    for p in local:
        lines.append(f"| `{p}` | {p.name} |")

    if vps_lines:
        lines.extend(["", "## VPS (/root)", "", "| Name |", "|------|"])
        for name in vps_lines:
            lines.append(f"| `{name}` |")

    lines.extend(
        [
            "",
            "## Excluded by policy",
            "",
            "- hub-game-starter (creative/AE — not hive product)",
            "",
        ]
    )

    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out_path} ({len(local)} local, {len(vps_lines)} vps names)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
