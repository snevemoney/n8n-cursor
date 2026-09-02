#!/usr/bin/env python3
"""ARMED-TO-WORK score. Catalog-complete is a different stop."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("/Users/evenslouis/n8n-cursor")
CATALOG = ROOT / "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md"
FACTS = ROOT / "docs/hive/outer-heaven/CONTENT/topics/live-facts-card.md"
HIVE = ROOT / "docs/hive/outer-heaven/CONTENT/topics/live-facts-hive-os.md"
AGENCY = ROOT / "docs/hive/outer-heaven/CONTENT/topics/live-facts-agency.md"
REMAINING = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-remaining.md"
ARMED = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-armed.md"
MASTER = ROOT / "scripts/hive/grok-skills"


def _run(script: str) -> bool:
    p = subprocess.run(
        [sys.executable, str(ROOT / "scripts/hive/os" / script), "--self-test"],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    return p.returncode == 0


def _catalog_slugs() -> list[str]:
    out: list[str] = []
    if not CATALOG.is_file():
        return out
    for line in CATALOG.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| course") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) >= 2:
            slug = parts[1].strip("`")
            if slug and slug != "slug":
                out.append(slug)
    return out


def _open_remaining() -> int:
    if not REMAINING.is_file():
        return -1
    n = 0
    for line in REMAINING.read_text(encoding="utf-8").splitlines():
        if "| open |" in line or "| open\t|" in line:
            n += 1
        elif re.search(r"\| open \|", line):
            n += 1
    return n


def _proof_filled() -> bool:
    if not HIVE.is_file():
        return False
    text = HIVE.read_text(encoding="utf-8")
    m = re.search(r"Last verified proof:\s+\*\*(.+?)\*\*", text)
    if not m:
        return False
    val = m.group(1).strip()
    return val not in ("BLANK", "HOLD", "")


def score() -> dict:
    slugs = _catalog_slugs()
    missing = [s for s in slugs if not (MASTER / f"{s}.md").is_file()]
    checks = {
        "catalog_rows": len(slugs) >= 40,
        "skills_match_catalog": not missing,
        "facts_router": FACTS.is_file() and "LANE:" in FACTS.read_text(encoding="utf-8"),
        "facts_hive_os": HIVE.is_file(),
        "facts_agency": AGENCY.is_file(),
        "remaining_queue": REMAINING.is_file(),
        "armed_note": ARMED.is_file(),
        "fold_self_test": _run("saylor-fold.py"),
        "mentor_self_test": _run("saylor-mentor-pass.py"),
        "brief_self_test": _run("outer-heaven-brief.py"),
    }
    failed = [k for k, ok in checks.items() if not ok]
    open_n = _open_remaining()
    proof = _proof_filled()
    armed = not failed
    return {
        "armed_to_work": armed,
        "catalog_complete": open_n == 0,
        "master_surface": proof,
        "open_remaining": open_n,
        "catalog_slugs": len(slugs),
        "missing_skills": missing,
        "failed": failed,
        "checks": checks,
        "note": (
            "ARMED-TO-WORK means you can work professionally today; "
            "future courses fold. MASTER-SURFACE is one visitor-visible proof. "
            "CATALOG-COMPLETE is remaining 0. Do not claim mastery as a slogan."
        ),
    }


def main() -> int:
    out = score()
    print(json.dumps(out, indent=2))
    if out["failed"]:
        print("ARMED-TO-WORK: FAIL — " + ", ".join(out["failed"]), file=sys.stderr)
        return 1
    extra = []
    if not out["catalog_complete"]:
        extra.append(f"remaining open={out['open_remaining']} (fold as they close)")
    if not out["master_surface"]:
        extra.append("proof blank — fill when a visitor can see one build")
    print("ARMED-TO-WORK: PASS" + (f" · {'; '.join(extra)}" if extra else ""), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
