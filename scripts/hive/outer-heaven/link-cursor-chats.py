#!/usr/bin/env python3
"""Interconnect CURSOR_CHATS notes with wikilinks to PROJECTS and THEMES.

Usage:
  python3 scripts/hive/outer-heaven/link-cursor-chats.py
  python3 scripts/hive/outer-heaven/link-cursor-chats.py --dry-run
"""
from __future__ import annotations

import argparse
import importlib.util
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import library_root  # noqa: E402

_seed_spec = importlib.util.spec_from_file_location(
    "seed_project_notes", Path(__file__).resolve().parent / "seed-project-notes.py"
)
_seed_mod = importlib.util.module_from_spec(_seed_spec)
assert _seed_spec.loader is not None
_seed_spec.loader.exec_module(_seed_mod)
parse_registry = _seed_mod.parse_registry

TEMPLATE_THEMES = ROOT / "scripts/hive/obsidian-vault-template/00_Outer_Heaven/THEMES"
TEMPLATE_GRAPH_GUIDE = (
    ROOT / "scripts/hive/obsidian-vault-template/00_Outer_Heaven/CURSOR_CHATS/GRAPH_GUIDE.md"
)

MANAGED_START = "<!-- link-cursor-chats:managed -->"
MANAGED_END = "<!-- /link-cursor-chats:managed -->"

STOP_WORDS = frozenset(
    {
        "about",
        "after",
        "again",
        "being",
        "could",
        "every",
        "first",
        "index",
        "other",
        "should",
        "their",
        "there",
        "these",
        "think",
        "those",
        "which",
        "while",
        "would",
        "assistant",
        "composer",
        "cursor",
        "message",
        "messages",
        "workspace",
    }
)

# Workspace folder slug → project id (hive lane)
WORKSPACE_TO_PROJECT: dict[str, str] = {
    "n8n-cursor": "n8n-cursor",
    "client-engine": "client-engine",
    "client-engine-1": "client-engine",
    "philanthropic-ai-agent": "philanthropic-ai-agent",
    "outer-heaven-backups": "outer-heaven-backups",
    "shield-buddies": "shield-buddies",
    "proof-qc-assist": "proof-qc-assist",
    "autoflow-finance": "autoflow-finance",
    "clipengine": "clipengine",
    "trendspotter-ai": "trendspotter-ai",
    "book-reimagined": "book-reimagined",
    "quick-list-hub-42": "quick-list-hub-42",
    "clearfield-evidence-flow": "clearfield-evidence-flow",
    "insights-lm-private": "insights-lm-private",
    "lightningflow-monorepo": "lightningflow-monorepo",
    "lightningflow-gh": "lightningflow-gh",
    "lightning-ui": "lightning-ui",
}

PERSONAL_WORKSPACES = frozenset(
    {
        "hub-game-starter",
        "hub-game",
        "after-effects-bootcamp",
        "lucky-paradox",
        "harem",
    }
)

THEME_RULES: list[tuple[str, list[str]]] = [
    ("hive-mind", ["openclaw", "telegram", "philanthropy", "outer heaven", "council", "agent", "grok", "hive"]),
    ("n8n-ops", ["n8n", "workflow", "webhook", "evenslouis", "caddy", "docker compose"]),
    ("scorpion-ops", ["scorpion", "golden path", "smoke", "cockpit", "observatory", "ops panel"]),
    ("client-engine-money", ["client engine", "/pro", "lead", "deal", "stripe", "treasury", "crm"]),
    ("after-effects", ["after effects", "aftereffects", " ae ", "motion graphics", "premiere"]),
    ("gaming-mac", ["unity", "godot", "game dev", "hub-game", "gaming", "mod ", " macos "]),
    ("creative-personal", ["creative", "personal", "video edit", "lucky paradox", "harem"]),
]

HIVE_ENTITIES: list[tuple[str, str]] = [
    ("scorpion", "n8n-cursor"),
    ("client engine", "client-engine"),
    ("openclaw", "philanthropic-ai-agent"),
    ("philanthropy", "philanthropic-ai-agent"),
    ("outer heaven", "philanthropic-ai-agent"),
    ("n8n", "n8n-cursor"),
    ("telegram", "philanthropic-ai-agent"),
    ("golden path", "n8n-cursor"),
    ("evenslouis", "n8n-cursor"),
    ("caddy", "n8n-cursor"),
    ("lightningflow", "lightningflow-monorepo"),
    ("proofcheck", "proof-qc-assist"),
    ("autoflow", "autoflow-finance"),
    ("shield buddies", "shield-buddies"),
    ("sentinel", "shield-buddies"),
]

PERSONAL_KEYWORDS = frozenset(
    {
        "after effects",
        "aftereffects",
        "game",
        "gaming",
        "unity",
        "godot",
        "macos",
        "mod",
        "harem",
        "lucky paradox",
        "video edit",
        "premiere",
    }
)


@dataclass
class ChatRecord:
    path: Path
    rel_path: str
    basename: str
    workspace: str
    title: str
    body: str
    text_lower: str
    tokens: set[str] = field(default_factory=set)
    projects: list[str] = field(default_factory=list)
    themes: list[str] = field(default_factory=list)
    is_hive: bool = False
    is_personal: bool = False
    wikilink: str = ""


def tokenize(text: str) -> set[str]:
    words = set(re.findall(r"[a-z0-9]{4,}", text.lower()))
    bigrams = set()
    raw = re.findall(r"[a-z0-9]+", text.lower())
    for i in range(len(raw) - 1):
        bigrams.add(f"{raw[i]} {raw[i+1]}")
    return {w for w in words if w not in STOP_WORDS} | {
        b for b in bigrams if not any(w in STOP_WORDS for w in b.split())
    }


def strip_for_analysis(text: str) -> str:
    text = re.sub(
        rf"{re.escape(MANAGED_START)}.*?{re.escape(MANAGED_END)}",
        "",
        text,
        flags=re.DOTALL,
    )
    text = re.sub(r"\[\[[^\]|]+(?:\|[^\]]+)?\]\]", " ", text)
    return text.lower()


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end < 0:
        return {}, text
    fm_raw = text[3:end].strip()
    body = text[end + 4 :].lstrip("\n")
    fm: dict[str, str] = {}
    for line in fm_raw.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    return fm, body


def build_entity_aliases() -> dict[str, str]:
    aliases: dict[str, str] = {}
    for entry in parse_registry():
        pid = entry["id"]
        aliases[entry["id"].lower()] = pid
        aliases[entry["name"].lower()] = pid
        for topic in entry.get("topics", []):
            aliases[topic.lower()] = pid
    for phrase, pid in HIVE_ENTITIES:
        aliases[phrase] = pid
    return aliases


def match_projects(record: ChatRecord, aliases: dict[str, str]) -> list[str]:
    found: set[str] = set()
    ws_project = WORKSPACE_TO_PROJECT.get(record.workspace)
    if ws_project:
        found.add(ws_project)
    for phrase, pid in sorted(aliases.items(), key=lambda x: -len(x[0])):
        if phrase in record.text_lower:
            found.add(pid)
    hive_hits = sum(1 for phrase, _ in HIVE_ENTITIES if phrase in record.text_lower)
    if hive_hits >= 2:
        for phrase, pid in HIVE_ENTITIES:
            if phrase in record.text_lower:
                found.add(pid)
    return sorted(found)


def match_themes(record: ChatRecord) -> list[str]:
    scores: Counter[str] = Counter()
    for theme_id, keywords in THEME_RULES:
        for kw in keywords:
            if kw in record.text_lower:
                scores[theme_id] += 1
    if record.is_personal and not record.is_hive:
        scores["creative-personal"] += 2
    if record.workspace in PERSONAL_WORKSPACES:
        scores["creative-personal"] += 3
        scores["gaming-mac"] += 1
    themes = [t for t, n in scores.most_common() if n > 0]
    if not themes:
        themes = ["unclassified"]
    return themes[:4]


def classify_lane(record: ChatRecord, project_ids: list[str]) -> None:
    personal_hits = sum(1 for kw in PERSONAL_KEYWORDS if kw in record.text_lower)
    hive_hits = sum(1 for phrase, _ in HIVE_ENTITIES if phrase in record.text_lower)
    ws_hive = record.workspace in WORKSPACE_TO_PROJECT
    ws_personal = record.workspace in PERSONAL_WORKSPACES

    if ws_personal or (personal_hits >= 2 and hive_hits < 2):
        record.is_personal = True
        record.is_hive = False
        record.projects = []
        return

    record.is_hive = ws_hive or hive_hits >= 2 or len(project_ids) > 0
    record.is_personal = False


def chat_wikilink(record: ChatRecord, title_by_basename: dict[str, list[str]]) -> str:
    short = record.title[:50] if record.title else record.basename
    if len(title_by_basename.get(record.basename, [])) == 1:
        return f"[[{record.basename}|{short}]]"
    folder = record.path.parent.name
    return f"[[CURSOR_CHATS/{folder}/{record.basename}|{short}]]"


def overlap_score(a: set[str], b: set[str]) -> int:
    if not a or not b:
        return 0
    return len(a & b)


def related_chats(record: ChatRecord, all_records: list[ChatRecord], limit: int = 5) -> list[ChatRecord]:
    scored: list[tuple[int, ChatRecord]] = []
    record_themes = set(record.themes)
    record_projects = set(record.projects)
    for other in all_records:
        if other.path == record.path:
            continue
        score = overlap_score(record.tokens, other.tokens)
        if record_projects & set(other.projects):
            score += 5
        if record_themes & set(other.themes):
            score += 3
        if record.workspace == other.workspace and record.workspace != "unknown-workspace":
            score += 2
        if score > 0:
            scored.append((score, other))
    scored.sort(key=lambda x: (-x[0], x[1].basename))
    return [r for _, r in scored[:limit]]


def managed_block(sections: list[str]) -> str:
    inner = "\n\n".join(sections)
    return f"{MANAGED_START}\n{inner}\n{MANAGED_END}"


def strip_managed(body: str) -> str:
    return re.sub(
        rf"\n?{re.escape(MANAGED_START)}.*?{re.escape(MANAGED_END)}\n?",
        "\n",
        body,
        flags=re.DOTALL,
    ).rstrip() + "\n"


def build_frontmatter(fm: dict[str, str], record: ChatRecord) -> str:
    tags = ["hive"] if record.is_hive else ["theme/creative"]
    if "unclassified" in record.themes:
        tags.append("needs-review")
    projects_yaml = ", ".join(f'"[[PROJECTS/{p}]]"' for p in record.projects)
    themes_yaml = ", ".join(f'"[[THEMES/{t}]]"' for t in record.themes)
    lines = ["---"]
    for key in ("chatId", "workspace", "source", "title", "updated", "messageCount", "archived"):
        if key in fm:
            lines.append(f"{key}: {fm[key]}")
    lines.append(f"projects: [{projects_yaml}]" if record.projects else "projects: []")
    lines.append(f"themes: [{themes_yaml}]")
    lines.append(f"tags: [{', '.join(tags)}]")
    lines.append("---")
    return "\n".join(lines)


def rewrite_chat_note(record: ChatRecord, related: list[ChatRecord], dry_run: bool) -> None:
    raw = record.path.read_text(encoding="utf-8", errors="replace")
    fm, body = parse_frontmatter(raw)
    body = strip_managed(body)

    project_links = [f"- [[PROJECTS/{p}]]" for p in record.projects]
    theme_links = [f"- [[THEMES/{t}]]" for t in record.themes]
    related_links = [f"- {r.wikilink}" for r in related]
    canon = ["- [[OUTER_HEAVEN_LIBRARY]]"]
    if record.is_hive:
        canon.append("- [[HIVEMIND_DNA]]")

    sections = []
    if project_links:
        sections.append("## Related projects\n\n" + "\n".join(project_links))
    if theme_links:
        sections.append("## Related themes\n\n" + "\n".join(theme_links))
    if related_links:
        sections.append("## Related chats\n\n" + "\n".join(related_links))
    sections.append("## Canon\n\n" + "\n".join(canon))

    new_text = build_frontmatter(fm, record) + "\n\n" + body.rstrip() + "\n\n" + managed_block(sections) + "\n"
    if not dry_run:
        record.path.write_text(new_text, encoding="utf-8")


def ensure_theme_templates(themes_dir: Path, dry_run: bool) -> None:
    themes_dir.mkdir(parents=True, exist_ok=True)
    if TEMPLATE_THEMES.is_dir():
        for src in TEMPLATE_THEMES.glob("*.md"):
            dest = themes_dir / src.name
            if not dest.is_file() and not dry_run:
                dest.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
    graph_dest = library_root() / "CURSOR_CHATS" / "GRAPH_GUIDE.md"
    if TEMPLATE_GRAPH_GUIDE.is_file() and not graph_dest.is_file() and not dry_run:
        graph_dest.parent.mkdir(parents=True, exist_ok=True)
        graph_dest.write_text(TEMPLATE_GRAPH_GUIDE.read_text(encoding="utf-8"), encoding="utf-8")


THEME_DESCRIPTIONS = {
    "hive-mind": "Cross-repo orchestration, Telegram, agents, OpenClaw.",
    "n8n-ops": "Workflows, webhooks, evenslouis.ca automation.",
    "scorpion-ops": "Smokes, golden paths, Scorpion cockpit.",
    "client-engine-money": "/pro, leads, deals, Client Engine.",
    "creative-personal": "Non-hive personal and creative work.",
    "after-effects": "After Effects, motion, video.",
    "gaming-mac": "Games, Unity, Mac modding.",
    "unclassified": "Chats pending operator review.",
}


def update_theme_hubs(
    theme_chats: dict[str, list[ChatRecord]],
    theme_keywords: dict[str, Counter[str]],
    dry_run: bool,
) -> None:
    themes_dir = library_root() / "THEMES"
    themes_dir.mkdir(parents=True, exist_ok=True)
    for theme_id, chats in sorted(theme_chats.items()):
        desc = THEME_DESCRIPTIONS.get(theme_id, theme_id)
        chat_lines = [f"- {c.wikilink}" for c in sorted(chats, key=lambda x: x.basename, reverse=True)]
        kw_lines = [f"- {w} ({n})" for w, n in theme_keywords.get(theme_id, Counter()).most_common(12)]
        body = f"""---
theme_id: {theme_id}
tags: [theme-hub]
---

# {theme_id}

{desc}

## Linked chats

{chr(10).join(chat_lines) if chat_lines else "_No chats linked yet._"}

## Top keywords

{chr(10).join(kw_lines) if kw_lines else "_Pending pattern extraction._"}

## See also

- [[THEMES/README]]
- [[OUTER_HEAVEN_LIBRARY]]
"""
        path = themes_dir / f"{theme_id}.md"
        if not dry_run:
            path.write_text(body, encoding="utf-8")


def update_project_backlinks(project_chats: dict[str, list[ChatRecord]], dry_run: bool) -> None:
    projects_dir = library_root() / "PROJECTS"
    if not projects_dir.is_dir():
        return
    for project_id, chats in project_chats.items():
        path = projects_dir / f"{project_id}.md"
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        lines = [f"- {c.wikilink}" for c in sorted(chats, key=lambda x: x.basename, reverse=True)]
        block = "## Cursor chat links\n\n" + ("\n".join(lines) if lines else "_None yet._") + "\n"
        if "## Cursor chat links" in text:
            text = re.sub(r"## Cursor chat links\n\n.*?(?=\n## |\Z)", block.rstrip() + "\n", text, flags=re.DOTALL)
        else:
            text = re.sub(
                r"## Chronicle links\n\n_\([^)]+\)_\n",
                "## Chronicle links\n\n_(wikilink entries as sessions touch this project)_\n\n" + block,
                text,
            )
            if "## Cursor chat links" not in text:
                text = text.rstrip() + "\n\n" + block
        if not dry_run:
            path.write_text(text, encoding="utf-8")


def load_chats(chats_root: Path) -> list[ChatRecord]:
    records: list[ChatRecord] = []
    for path in sorted(chats_root.glob("**/*.md")):
        if path.name in ("README.md", "GRAPH_GUIDE.md"):
            continue
        raw = path.read_text(encoding="utf-8", errors="replace")
        fm, body = parse_frontmatter(raw)
        analysis_text = strip_for_analysis(raw)
        lib = library_root()
        try:
            rel = str(path.relative_to(lib))
        except ValueError:
            rel = path.name
        records.append(
            ChatRecord(
                path=path,
                rel_path=rel,
                basename=path.stem,
                workspace=fm.get("workspace", path.parent.name),
                title=fm.get("title", "").strip('"'),
                body=body,
                text_lower=analysis_text,
            )
        )
    return records


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    lib = library_root()
    chats_root = lib / "CURSOR_CHATS"
    if not chats_root.is_dir():
        print(f"No CURSOR_CHATS at {chats_root}")
        return 1

    ensure_theme_templates(lib / "THEMES", args.dry_run)
    aliases = build_entity_aliases()
    records = load_chats(chats_root)
    if not records:
        print("No chat notes found")
        return 0

    basenames: dict[str, list[str]] = defaultdict(list)
    for r in records:
        basenames[r.basename].append(r.rel_path)

    for r in records:
        r.tokens = tokenize(r.text_lower)
        r.projects = match_projects(r, aliases)
        classify_lane(r, r.projects)
        r.themes = match_themes(r)
        r.wikilink = chat_wikilink(r, basenames)

    theme_chats: dict[str, list[ChatRecord]] = defaultdict(list)
    theme_keywords: dict[str, Counter[str]] = defaultdict(Counter)
    project_chats: dict[str, list[ChatRecord]] = defaultdict(list)

    for r in records:
        for t in r.themes:
            theme_chats[t].append(r)
            for tok in r.tokens:
                if len(tok) >= 4:
                    theme_keywords[t][tok] += 1
        for p in r.projects:
            project_chats[p].append(r)

    linked = 0
    for r in records:
        related = related_chats(r, records)
        rewrite_chat_note(r, related, args.dry_run)
        linked += 1

    update_theme_hubs(theme_chats, theme_keywords, args.dry_run)
    update_project_backlinks(project_chats, args.dry_run)

    hive_count = sum(1 for r in records if r.is_hive)
    personal_count = sum(1 for r in records if r.is_personal and not r.is_hive)
    print(f"link-cursor-chats: {linked} notes")
    print(f"  hive lane: {hive_count} · personal/creative: {personal_count}")
    print(f"  project backlinks: {sum(len(v) for v in project_chats.values())} edges")
    print(f"  theme hubs: {len(theme_chats)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
