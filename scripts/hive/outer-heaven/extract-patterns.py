#!/usr/bin/env python3
"""Weekly pattern extraction from chronicle → PATTERNS/SURVIVORS.md DRAFT section.

Usage:
  python3 scripts/hive/outer-heaven/extract-patterns.py
  python3 scripts/hive/outer-heaven/extract-patterns.py --days 7
"""
from __future__ import annotations

import argparse
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import library_root  # noqa: E402


def read_recent_chronicle(days: int) -> str:
    root = library_root() / "CHRONICLE"
    if not root.is_dir():
        return ""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    chunks: list[str] = []
    for path in sorted(root.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="replace")
        chunks.append(text)
    return "\n".join(chunks)


def extract_tags_and_projects(text: str) -> tuple[Counter[str], Counter[str]]:
    tags: Counter[str] = Counter()
    projects: Counter[str] = Counter()
    for block in re.findall(r"```yaml\n(.*?)```", text, re.DOTALL):
        for tag in re.findall(r"tags:\s*\[(.*?)\]", block):
            for t in tag.split(","):
                t = t.strip()
                if t:
                    tags[t] += 1
        for proj in re.findall(r"projects:\s*\[(.*?)\]", block):
            for p in proj.split(","):
                p = p.strip()
                if p:
                    projects[p] += 1
    return tags, projects


def extract_summary_bullets(text: str) -> list[str]:
    bullets = []
    for m in re.finditer(r"## Summary\n\n(.*?)(?=\n## |\n---|\Z)", text, re.DOTALL):
        body = m.group(1).strip()
        for line in body.splitlines():
            line = line.strip().lstrip("- ")
            if len(line) > 40:
                bullets.append(line[:200])
    return bullets


def read_cursor_chats() -> str:
    root = library_root() / "CURSOR_CHATS"
    if not root.is_dir():
        return ""
    chunks: list[str] = []
    for path in sorted(root.glob("**/*.md")):
        if path.name in ("README.md", "GRAPH_GUIDE.md"):
            continue
        chunks.append(path.read_text(encoding="utf-8", errors="replace"))
    return "\n".join(chunks)


def extract_chat_frontmatter_tags(text: str) -> tuple[Counter[str], Counter[str], Counter[str]]:
    """tags, themes, projects from chat YAML frontmatter."""
    tags: Counter[str] = Counter()
    themes: Counter[str] = Counter()
    projects: Counter[str] = Counter()
    for block in re.findall(r"^---\n(.*?)\n---", text, re.DOTALL | re.MULTILINE):
        for tag in re.findall(r"tags:\s*\[(.*?)\]", block):
            for t in tag.split(","):
                t = t.strip()
                if t:
                    tags[t] += 1
        for theme in re.findall(r"themes:\s*\[(.*?)\]", block):
            for m in re.findall(r"THEMES/([^\]|]+)", theme):
                themes[m.strip()] += 1
        for proj in re.findall(r"projects:\s*\[(.*?)\]", block):
            for m in re.findall(r"PROJECTS/([^\]|]+)", proj):
                projects[m.strip()] += 1
    return tags, themes, projects


def chat_keyword_counts(chat_text: str) -> Counter[str]:
    counts: Counter[str] = Counter()
    for w in re.findall(r"[a-zA-Z]{5,}", chat_text.lower()):
        if w not in {
            "which",
            "there",
            "their",
            "would",
            "should",
            "could",
            "about",
            "assistant",
            "composer",
            "cursor",
            "workspace",
            "message",
        }:
            counts[w] += 1
    return counts


def update_theme_keyword_summaries(theme_counts: dict[str, Counter[str]]) -> None:
    themes_dir = library_root() / "THEMES"
    if not themes_dir.is_dir():
        return
    for theme_id, words in theme_counts.items():
        path = themes_dir / f"{theme_id}.md"
        if not path.is_file():
            continue
        body = path.read_text(encoding="utf-8")
        kw_lines = [f"- {w} ({n})" for w, n in words.most_common(12) if n >= 2]
        if not kw_lines:
            continue
        section = "## Top keywords\n\n" + "\n".join(kw_lines) + "\n"
        if "## Top keywords" in body:
            body = re.sub(r"## Top keywords\n\n.*?(?=\n## |\Z)", section.rstrip() + "\n", body, flags=re.DOTALL)
        else:
            body = body.rstrip() + "\n\n" + section
        path.write_text(body, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7)
    args = ap.parse_args()

    text = read_recent_chronicle(args.days)
    chat_text = read_cursor_chats()
    combined = text + "\n" + chat_text
    if not combined.strip():
        print("No chronicle or chat content found")
        return 0

    tags, projects = extract_tags_and_projects(text)
    chat_tags, chat_themes, chat_projects = extract_chat_frontmatter_tags(chat_text)
    tags.update(chat_tags)
    for proj, n in chat_projects.items():
        projects[proj] += n

    bullets = extract_summary_bullets(text)
    # Chat titles as decision signals
    for m in re.finditer(r"^title:\s*(.+)$", chat_text, re.MULTILINE):
        title = m.group(1).strip().strip('"')
        if len(title) > 20:
            bullets.append(title[:200])

    # Simple clustering: recurring keywords in summaries + chats
    word_counts: Counter[str] = Counter()
    for b in bullets:
        for w in re.findall(r"[a-zA-Z]{5,}", b.lower()):
            if w not in {"which", "there", "their", "would", "should", "could", "about"}:
                word_counts[w] += 1
    word_counts.update(chat_keyword_counts(chat_text))

    theme_word_counts: dict[str, Counter[str]] = defaultdict(Counter)
    chats_root = library_root() / "CURSOR_CHATS"
    if chats_root.is_dir():
        for path in chats_root.glob("**/*.md"):
            if path.name in ("README.md", "GRAPH_GUIDE.md"):
                continue
            note = path.read_text(encoding="utf-8", errors="replace")
            _, themes, _ = extract_chat_frontmatter_tags(note)
            tokens = chat_keyword_counts(note)
            for theme_id in themes:
                theme_word_counts[theme_id].update(tokens)
    update_theme_keyword_summaries(theme_word_counts)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    draft = f"""
## DRAFT_PENDING_REVIEW — week of {now}

_Auto-generated from last {args.days} days of chronicle. Operator: approve, edit, or delete before agents treat as canon._

### Hot projects

"""
    for proj, n in projects.most_common(8):
        draft += f"- **{proj}** — {n} chronicle entries\n"

    draft += "\n### Hot tags\n\n"
    for tag, n in tags.most_common(10):
        if tag != "auto-mined":
            draft += f"- `{tag}` — {n}\n"

    draft += "\n### Hot themes (from CURSOR_CHATS)\n\n"
    for theme, n in chat_themes.most_common(8):
        draft += f"- **{theme}** — {n} chats\n"

    draft += "\n### Recurring themes (keyword frequency)\n\n"
    for word, n in word_counts.most_common(12):
        if n >= 2:
            draft += f"- {word} ({n})\n"

    draft += "\n### Sample decisions / summaries\n\n"
    for b in bullets[:8]:
        draft += f"- {b}\n"

    draft += "\n### Proposed survivability rules (review required)\n\n"
    if projects:
        top = projects.most_common(1)[0][0]
        draft += f"- Continued investment in `{top}` correlates with active ops — consider golden-path smoke before claiming done.\n"
    draft += "- Execute + verify on live evenslouis.ca surfaces — docs alone ≠ finished.\n"
    draft += "- n8n canon: evenslouis.ca only; never n8ncloud.tech.\n"

    survivors = library_root() / "PATTERNS" / "SURVIVORS.md"
    survivors.parent.mkdir(parents=True, exist_ok=True)
    if not survivors.is_file():
        survivors.write_text("# Survivors\n\n", encoding="utf-8")

    body = survivors.read_text(encoding="utf-8")
    # Remove previous draft section if present
    body = re.sub(r"\n## DRAFT_PENDING_REVIEW — week of.*?(?=\n## Approved|\Z)", "\n", body, flags=re.DOTALL)
    marker = "## Draft queue"
    if marker in body:
        body = body.replace(marker, draft.strip() + "\n\n" + marker)
    else:
        body += draft

    survivors.write_text(body, encoding="utf-8")
    print(f"Wrote draft to {survivors}")

    update_weekly_scoreboard(args.days, text, tags, projects, now)
    return 0


def count_entries(text: str) -> int:
    return len(re.findall(r"correlationId:", text))


def update_weekly_scoreboard(
    days: int,
    text: str,
    tags: Counter[str],
    projects: Counter[str],
    week_label: str,
) -> None:
    board = library_root() / "WEEKLY_SCOREBOARD.md"
    board.parent.mkdir(parents=True, exist_ok=True)
    entries = count_entries(text)
    business = tags.get("business-hours", 0)
    # Heuristic: each business-hours entry ≈ 1 hr signal (operator can refine)
    est_hours = business
    target_met = "yes" if est_hours >= 20 else "no"

    hot = ", ".join(p for p, _ in projects.most_common(3)) or "—"
    section = f"""## Week of {week_label}

| Metric | Value |
|--------|-------|
| Chronicle entries ({days}d) | {entries} |
| `business-hours` tagged entries | {business} |
| Estimated business signal (entries≈hrs) | {est_hours} |
| 20hr target met? | **{target_met}** |
| Hot projects | {hot} |
| Pattern drafts pending | see PATTERNS/SURVIVORS.md |

"""

    if board.is_file():
        body = board.read_text(encoding="utf-8")
        body = re.sub(
            r"## Week of .*?(?=\n## Week of |\n## History|\Z)",
            "",
            body,
            count=1,
            flags=re.DOTALL,
        )
        insert_at = body.find("## History")
        if insert_at >= 0:
            body = body[:insert_at] + section + "\n" + body[insert_at:]
        else:
            body = body.rstrip() + "\n\n" + section
    else:
        body = f"# Weekly scoreboard\n\n{section}\n## History\n\n"

    board.write_text(body, encoding="utf-8")
    print(f"Updated {board}")


if __name__ == "__main__":
    raise SystemExit(main())
