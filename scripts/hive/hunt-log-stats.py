#!/usr/bin/env python3
"""Parse HUNT_LOG.md and emit pipeline stats JSON."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LOG = ROOT / "docs/hive/outer-heaven/CONTENT/icp-runbooks/HUNT_LOG.md"
# Path B list-only uses — / - as empty url. Count the row; do not drop it.
_EMPTY_URL = frozenset({"", "url", "—", "-", "–", "−"})
FIXTURE_EMPTY_URL = (
    Path(__file__).resolve().parent / "tests" / "fixtures" / "hunt-log-empty-url.md"
)


def parse_hunt_log(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    rows: list[dict] = []
    headers: list[str] = []

    # Prefer rows after "## Rows" section
    section = text
    if "## Rows" in text:
        section = text.split("## Rows", 1)[1]

    in_rows = False
    for line in section.splitlines():
        if line.startswith("| date |"):
            headers = [h.strip() for h in line.split("|")[1:-1]]
            in_rows = False
            continue
        if line.startswith("|------"):
            in_rows = True
            continue
        if not in_rows or not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.split("|")[1:-1]]
        if len(cells) != len(headers):
            continue
        if cells[0] in ("date", "") or not re.match(r"\d{4}-\d{2}-\d{2}", cells[0]):
            continue
        row = dict(zip(headers, cells))
        if "url" in row and row["url"] in _EMPTY_URL:
            row["url"] = ""
        rows.append(row)

    by_stage: dict[str, int] = {}
    by_icp: dict[str, int] = {}
    for r in rows:
        stage = r.get("stage") or "unknown"
        by_stage[stage] = by_stage.get(stage, 0) + 1
        icp = r.get("icp_id") or "unknown"
        by_icp[icp] = by_icp.get(icp, 0) + 1

    ready = by_stage.get("ready", 0)
    delivering = by_stage.get("delivering", 0)
    qualified = by_stage.get("qualified", 0)
    parked = by_stage.get("parked", 0)
    return {
        "path": str(path),
        "total_rows": len(rows),
        "by_stage": by_stage,
        "by_icp_id": by_icp,
        "ready_count": ready,
        "delivering_count": delivering,
        "qualified_count": qualified,
        "parked_count": parked,
        "pipeline_active": ready + delivering + qualified,
        "last_row": rows[-1] if rows else None,
    }


def self_test(path: Path | None = None) -> int:
    """Fixture: url=— and url=- still count. Do not write live HUNT_LOG."""
    fixture = path or FIXTURE_EMPTY_URL
    stats = parse_hunt_log(fixture)
    # Require Normand URL row + Path B url=— / url=- (do not write live HUNT_LOG).
    if stats["total_rows"] < 3:
        print(f"FAIL hunt-log-stats self-test: total_rows={stats['total_rows']} (expected >=3)")
        return 1
    by_icp = stats.get("by_icp_id") or {}
    if by_icp.get("local-pro", 0) < 1:
        print("FAIL hunt-log-stats self-test: Normand/local-pro row dropped")
        return 1
    if by_icp.get("industrial-smb", 0) < 1:
        print("FAIL hunt-log-stats self-test: url=— Path B row dropped")
        return 1
    if by_icp.get("mktg-software", 0) < 1:
        print("FAIL hunt-log-stats self-test: url=- Path B row dropped")
        return 1
    print(
        f"hunt-log-stats self-test: OK (rows={stats['total_rows']} "
        f"local-pro={by_icp.get('local-pro')} "
        f"industrial-smb={by_icp.get('industrial-smb')} "
        f"mktg-software={by_icp.get('mktg-software')})"
    )
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--path", type=Path, default=DEFAULT_LOG)
    ap.add_argument("--format", choices=["json", "text"], default="json")
    ap.add_argument(
        "--self-test",
        action="store_true",
        help="Parse tests/fixtures/hunt-log-empty-url.md (url=— not dropped)",
    )
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    stats = parse_hunt_log(args.path)
    if args.format == "json":
        print(json.dumps(stats, indent=2))
    else:
        print(f"rows={stats['total_rows']} ready={stats['ready_count']}")
        for k, v in sorted(stats["by_stage"].items()):
            print(f"  {k}: {v}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
