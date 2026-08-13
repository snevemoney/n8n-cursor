#!/usr/bin/env python3
"""Ingest INBOX/*.md into Outer Heaven chronicle.

Usage:
  python3 scripts/hive/outer-heaven/ingest-inbox.py
  python3 scripts/hive/outer-heaven/ingest-inbox.py --dry-run
"""
from __future__ import annotations

import argparse
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import (  # noqa: E402
    SECRET_PATTERNS,
    append_chronicle_entry,
    file_hash,
    library_root,
    strip_secrets,
)

WORKFLOW_KEYWORDS = re.compile(
    r"\b(how to|workflow|step \d|process:|recipe:|run this|command:|bash |curl )",
    re.I,
)


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    meta: dict[str, str] = {}
    body = text
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            fm, body = parts[1], parts[2]
            for line in fm.splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    meta[k.strip().lower()] = v.strip().strip('"').strip("'")
    return meta, body.strip()


def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:40] or "note"


def maybe_draft_method(domain: str, title: str, body: str, cid: str) -> Path | None:
    if not WORKFLOW_KEYWORDS.search(body):
        return None
    methods = library_root() / "METHODS"
    methods.mkdir(parents=True, exist_ok=True)
    date = datetime.now(timezone.utc).strftime("%Y%m%d")
    path = methods / f"draft-{date}-{slugify(title)}.md"
    if path.is_file():
        return path
    content = f"""---
domain: {domain}
status: draft
correlationId: {cid}
survival_score: null
last_verified: null
apps_used: []
---

# {title} (draft from INBOX)

{strip_secrets(body[:4000])}

_Promote with promote-to-method.sh when verified._
"""
    path.write_text(content, encoding="utf-8")
    return path


def ingest_file(path: Path, dry_run: bool) -> bool:
    if path.name.startswith(".") or path.name == "README.md":
        return False
    text = path.read_text(encoding="utf-8", errors="replace")
    if any(p.search(text) for p in SECRET_PATTERNS):
        # Still strip but warn — reject if mostly secrets
        stripped = strip_secrets(text)
        if "[REDACTED]" in stripped and stripped.count("[REDACTED]") > 5:
            print(f"SKIP (too many secrets): {path}")
            return False

    meta, body = parse_frontmatter(text)
    source = meta.get("source", "manual")
    domain = meta.get("domain", "general")
    workspace = meta.get("workspace", source)
    business = meta.get("businesshours", meta.get("business_hours", "")).lower() in ("true", "yes", "1")
    tags = [t.strip() for t in meta.get("tags", "").strip("[]").split(",") if t.strip()]
    tags.append("inbox-ingest")
    if business:
        tags.append("business-hours")
    survivability = "business" if business else meta.get("survivability", "ops")
    projects = [p.strip() for p in meta.get("project", meta.get("projects", "")).split(",") if p.strip()]

    summary = strip_secrets(body)[:3000]
    if not summary:
        return False

    h = file_hash(path)
    cid = f"oh-inbox-{h}"

    if dry_run:
        print(f"Would ingest {path} → {source}/{domain} business={business}")
        return True

    append_chronicle_entry(
        source=source,
        workspace=workspace,
        summary=summary,
        projects=projects or ["n8n-cursor"],
        tags=tags,
        agents=[source],
        survivability=survivability,
        correlation_id=cid,
    )

    title = meta.get("title") or path.stem.replace("-", " ").title()
    draft = maybe_draft_method(domain, title, body, cid)
    if draft:
        print(f"  method draft: {draft}")

    processed = library_root() / "INBOX" / "processed"
    processed.mkdir(parents=True, exist_ok=True)
    dest = processed / f"{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{path.name}"
    shutil.move(str(path), str(dest))
    print(f"ingested {path.name} → {cid}")
    return True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    inbox = library_root() / "INBOX"
    inbox.mkdir(parents=True, exist_ok=True)
    (inbox / "processed").mkdir(parents=True, exist_ok=True)

    count = 0
    for path in sorted(inbox.glob("*.md")):
        if ingest_file(path, args.dry_run):
            count += 1
    print(f"done: {count} inbox files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
