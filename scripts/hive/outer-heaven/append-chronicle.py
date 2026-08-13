#!/usr/bin/env python3
"""CLI append for Outer Heaven chronicle."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import append_chronicle_entry  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="manual")
    ap.add_argument("--workspace", default="manual")
    ap.add_argument("--project", default="")
    ap.add_argument("--tags", default="")
    ap.add_argument("--survivability", default="ops")
    ap.add_argument("--summary", required=True)
    args = ap.parse_args()

    projects = [p.strip() for p in args.project.split(",") if p.strip()]
    tags = [t.strip() for t in args.tags.split(",") if t.strip()]

    path = append_chronicle_entry(
        source=args.source,
        workspace=args.workspace,
        summary=args.summary,
        projects=projects,
        tags=tags,
        survivability=args.survivability,
    )
    print(str(path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
