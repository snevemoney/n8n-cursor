#!/usr/bin/env python3
"""Bounded read-only web learning cycle for Outer Heaven library.

Reads AGENTS_LAB research queue, fetches public URLs (no auth scraping),
appends chronicle + drafts METHODS/draft-web-*.md.

Usage:
  python3 scripts/hive/outer-heaven/web-learning-cycle.py
  python3 scripts/hive/outer-heaven/web-learning-cycle.py --dry-run
  python3 scripts/hive/outer-heaven/web-learning-cycle.py --max-items 1
"""
from __future__ import annotations

import argparse
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import append_chronicle_entry, library_root, strip_secrets  # noqa: E402

MAX_BODY_CHARS = 8000
USER_AGENT = "OuterHeaven-WebLearning/1.0 (+https://evenslouis.ca)"


def parse_research_queue(lab_path: Path, max_items: int) -> list[dict[str, str]]:
    if not lab_path.is_file():
        return []
    text = lab_path.read_text(encoding="utf-8", errors="replace")
    items: list[dict[str, str]] = []

    # Markdown checklist under "## Research queue" or "## Web learning queue"
    in_queue = False
    for line in text.splitlines():
        if re.match(r"^##\s+(Research queue|Web learning queue)", line, re.I):
            in_queue = True
            continue
        if in_queue and line.startswith("## "):
            break
        if not in_queue:
            continue
        m = re.match(r"^-\s+\[[ x]\]\s+(.+)$", line.strip())
        if not m or m.group(1).startswith("<!--"):
            continue
        raw = m.group(1).strip()
        url_m = re.search(r"https?://\S+", raw)
        items.append({"title": raw.split("http")[0].strip(" -:") or raw, "url": url_m.group(0) if url_m else ""})
        if len(items) >= max_items:
            return items

    # Table rows with | research | status in AGENTS_LAB
    for line in text.splitlines():
        if not line.strip().startswith("|") or line.count("|") < 4:
            continue
        if re.search(r"\|\s*research\s*\|", line, re.I):
            cols = [c.strip() for c in line.strip("|").split("|")]
            if len(cols) < 2 or cols[0].startswith("-"):
                continue
            title = cols[0]
            if title.startswith("_(") or title.lower() in ("candidate", "agent"):
                continue
            items.append({"title": title, "url": ""})
            if len(items) >= max_items:
                break

    return items[:max_items]


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (s[:40] or "item")


def fetch_public(url: str, timeout: int = 20) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read(500_000)
    text = raw.decode("utf-8", errors="replace")
    text = re.sub(r"(?is)<script.*?>.*?</script>", " ", text)
    text = re.sub(r"(?is)<style.*?>.*?</style>", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return strip_secrets(text[:MAX_BODY_CHARS])


def write_draft(root: Path, slug: str, title: str, url: str, excerpt: str) -> Path:
    methods = root / "METHODS"
    methods.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    path = methods / f"draft-web-{stamp}-{slug}.md"
    if path.is_file():
        return path
    body = f"""---
status: DRAFT_PENDING_REVIEW
source: web-learning
url: {url or "none"}
created: {datetime.now(timezone.utc).isoformat()}
---

# Draft: {title}

## Source

{url or "_No URL in queue — manual research item_"}

## Excerpt (read-only fetch)

{excerpt[:4000] if excerpt else "_Fetch skipped or failed — add notes manually._"}

## Operator review

- [ ] Promote via `promote-to-method.sh`
- [ ] Reject — stays in chronicle only
"""
    path.write_text(body, encoding="utf-8")
    return path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--max-items", type=int, default=3)
    args = parser.parse_args()

    root = library_root()
    lab = root / "AGENTS_LAB.md"
    queue = parse_research_queue(lab, args.max_items)

    if not queue:
        print("web-learning: no unchecked research queue items (see AGENTS_LAB.md)")
        return 0

    processed = 0
    for item in queue:
        title = item["title"]
        url = item["url"]
        slug = slugify(title)
        excerpt = ""
        if url:
            try:
                excerpt = fetch_public(url)
                print(f"  fetched {url[:60]}… ({len(excerpt)} chars)")
            except (urllib.error.URLError, TimeoutError, ValueError) as e:
                print(f"  skip fetch {url}: {e}")
        else:
            print(f"  no URL for: {title}")

        if args.dry_run:
            print(f"  [dry-run] would draft: {title}")
            processed += 1
            continue

        draft_path = write_draft(root, slug, title, url, excerpt)
        append_chronicle_entry(
            source="web-learning",
            workspace="outer-heaven",
            summary=f"Web learning draft: {title}",
            projects=["n8n-cursor"],
            tags=["web-learning", "draft"],
            agents=["Scout Lead Gen"],
            survivability="research",
        )
        print(f"  draft → {draft_path.relative_to(root)}")
        processed += 1

    print(f"web-learning: processed {processed} item(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
