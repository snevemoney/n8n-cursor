#!/usr/bin/env python3
"""Derive packet LEARNED.md (A–K + stolen machines, no L) from a Researcher take."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path("/Users/evenslouis/n8n-cursor")
TAKES = ROOT / "docs/hive/outer-heaven/CONTENT/job-cards/takes"
PACKETS = ROOT / "docs/hive/outer-heaven/CONTENT/watch-later/packets"


def derive(vid: str) -> Path:
    src = TAKES / vid / "researcher.md"
    if not src.exists():
        raise SystemExit(f"missing take: {src}")
    text = src.read_text()
    # drop L
    text = re.split(r"\n## L\. Role-Specific Applications\n", text, maxsplit=1)[0].rstrip() + "\n"
    # drop operate-never bullet list after machines? keep Steal block; rename
    text = text.replace("## Steal / Operate-never", "## Stolen machines")
    # replace header
    body = re.sub(r"^# Researcher — .*\n(?:.*\n)*?(?=## A\. Source Map)", "", text, count=1)
    src_rel = (
        f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{vid}/full.txt"
        if (PACKETS / vid / "full.txt").exists()
        else f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{vid}/transcripts/full.txt"
    )
    header = (
        f"# LEARNED — {vid}\n"
        "Protocol: deep-video-learning\n"
        "Status: filled\n"
        f"**Source:** `{src_rel}`\n"
        "**Desks merged:** Researcher 2026-08-14. Librarian not yet. "
        "Keep later dissent as labeled rows. Do not flatten.\n"
        "**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.\n"
        "**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. "
        "Other desks add labeled rows; do not overwrite dissent.\n\n"
    )
    out = PACKETS / vid / "LEARNED.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(header + body.lstrip())
    return out


def main() -> None:
    ids = sys.argv[1:]
    if not ids:
        ids = [p.parent.name for p in TAKES.glob("*/researcher.md") if p.parent.name not in {"tests", "_prompts"}]
    for vid in ids:
        if vid in {"tests", "_prompts"}:
            continue
        has_txt = (PACKETS / vid / "full.txt").exists() or (
            PACKETS / vid / "transcripts" / "full.txt"
        ).exists()
        if not has_txt:
            continue
        if not (TAKES / vid / "researcher.md").exists():
            continue
        take = (TAKES / vid / "researcher.md").read_text()
        if "Protocol: deep-video-learning" not in take or "## A. Source Map" not in take:
            continue
        path = derive(vid)
        print(path)


if __name__ == "__main__":
    main()
