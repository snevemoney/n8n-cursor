#!/usr/bin/env python3
"""Researcher research → findings breakdown + system implementation (all types).

Usage:
  python3 scripts/hive/researcher-research-implement.py video --youtube-url URL --title "T" --write
  python3 scripts/hive/researcher-research-implement.py bookmarks --filter ai --write
  python3 scripts/hive/researcher-research-implement.py watchlater --from-json PATH --write
  python3 scripts/hive/researcher-research-implement.py dossier --question "TOPIC" --write
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HIVE = Path(__file__).resolve().parent
REPO = HIVE.parents[1]
PACKETS = Path.home() / ".grokbot" / "research-packets"

AI_FILTER_RE = re.compile(
    r"\b(ai|a\.i\.|llm|gpt|chatgpt|claude|anthropic|openai|gemini|grok|xai|agent|agents|"
    r"multi-?agent|autogen|langchain|langgraph|cursor|copilot|windsurf|devin|codex|n8n|"
    r"zapier|make\.com|automation|mcp|rag|vector|embedding|fine-?tun|prompt|transformer|"
    r"neural|machine learning|deep learning|midjourney|stable diffusion|sora|runway|"
    r"artificial intelligence|genai|generative)\b",
    re.I,
)

BOOKMARK_THEMES: list[tuple[str, str, str]] = [
    ("claude-code-desktop", r"claude code|claude devs|fable|ios simulator|desktop app|codex", "Forge, Big Boss"),
    ("cinematic-websites", r"cinematic|\$50,?000|\bsol\b|landing page|website build|web design", "Forge, Creative Studio, Product GTM"),
    ("mcp-connectors", r"\bmcp\b|connector|artifact", "Forge, Researcher"),
    ("creative-pipeline", r"midjourney|runway|seedance|topaz|higgsfield|after effects|\bae\b", "Creative Studio"),
    ("knowledge-graph", r"obsidian|wiki|second brain|knowledge graph|llm wiki|karpathy", "Librarian"),
    ("agent-hype-gtm", r"agent swarm|marketing agent|\$20k|\$400|multi.?agent team|40 agent", "Product GTM, Consultant"),
    ("automation-workflows", r"\bn8n\b|zapier|make\.com|workflow automation", "Forge"),
    ("models-research", r"\bgpt\b|gemini|openai|anthropic|llm|transformer|fine-?tun", "Researcher, Forge"),
]

QUARANTINE_RE = re.compile(
    r"jailbreak|god-?mode|nsfw|lora|unlock|watermark|prompt hack|salary leak",
    re.I,
)


def _slug(s: str, max_len: int = 48) -> str:
    out = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return out[:max_len] or "research"


def _load_video_module():
    spec = importlib.util.spec_from_file_location(
        "researcher_video_implement", HIVE / "researcher-video-implement.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def _load_hive_web_research():
    spec = importlib.util.spec_from_file_location(
        "hive_web_research", HIVE / "hive-web-research.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def _load_watchlater_module():
    spec = importlib.util.spec_from_file_location(
        "researcher_watchlater_implement", HIVE / "researcher-watchlater-implement.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def implementation_map_md(title: str, slug: str, research_type: str) -> str:
    return f"""# Implementation map: {title}

**Type:** {research_type}
**Packet:** ~/.grokbot/research-packets/{research_type}-{slug}/
**Skill:** scripts/hive/grok-skills/researcher-research-to-system.md

Researcher: complete this table, then edit repo files and reprovision agents.

| # | Takeaway | Hive target | Agent(s) | Status |
|---|----------|-------------|----------|--------|
| 1 | | docs/hive/outer-heaven/OPERATOR_MEMORY.md (LESSONS) | Librarian | pending |
| 2 | | scripts/hive/agent-doctrine-lanes.py | all 17 | pending |
| 3 | | scripts/hive/grok-skills/ or CONTENT/x-bookmarks/learnings-implement.md | varies | pending |
| 4 | Steal ICPs/machines (not thesis-only) | CONTENT/watch-later/STEAL_SHEET.md + business-types.json | Researcher, GTM, Consultant | pending |
| 5 | Whole-argument deep summary (not SKU-only) | CONTENT/watch-later/DEEP_SUMMARIES.md | Researcher | pending |

## Reprovision checklist

- [ ] Edit target files in repo
- [ ] `python3 scripts/hive/build-grok-agent-routines.py --write`
- [ ] `python3 scripts/hive/grokbot-setup-agents.py`
- [ ] `python3 scripts/hive/grokbot-setup-routines.py --core --force-update`
- [ ] Message @Librarian + affected agents
- [ ] `python3 scripts/hive/os/outer-heaven-brief.py --agent Librarian --publish`
"""


def write_packet_dir(
    packet_dir: Path,
    *,
    meta: dict[str, Any],
    findings_md: str,
    slug: str,
    title: str,
    research_type: str,
    extras: dict[str, Path | str] | None = None,
) -> None:
    packet_dir.mkdir(parents=True, exist_ok=True)
    (packet_dir / "FINDINGS.md").write_text(findings_md, encoding="utf-8")
    (packet_dir / "IMPLEMENTATION_MAP.md").write_text(
        implementation_map_md(title, slug, research_type), encoding="utf-8"
    )
    (packet_dir / "meta.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    if extras:
        for name, content in extras.items():
            dest = packet_dir / name
            if isinstance(content, Path):
                dest.write_text(content.read_text(encoding="utf-8"), encoding="utf-8")
            else:
                dest.write_text(content, encoding="utf-8")
    print(f"Wrote packet: {packet_dir}")
    print(f"  FINDINGS.md")
    print(f"  IMPLEMENTATION_MAP.md")


def resolve_bookmarks_path(*, filter_ai: bool) -> Path | None:
    if filter_ai:
        candidates = [
            Path.home() / ".grokbot/outer-heaven/CONTENT/x-bookmarks/ai-only.json",
            REPO / "docs/hive/outer-heaven/CONTENT/x-bookmarks/ai-only.json",
        ]
    else:
        candidates = [
            Path.home() / ".grokbot/x-bookmarks.json",
            REPO / "docs/hive/outer-heaven/CONTENT/x-bookmarks/latest.json",
            Path.home() / ".grokbot/outer-heaven/CONTENT/x-bookmarks/latest.json",
        ]
    for p in candidates:
        if p.is_file():
            return p
    return None


def load_bookmarks(*, filter_ai: bool) -> tuple[list[dict[str, Any]], dict[str, Any], Path]:
    path = resolve_bookmarks_path(filter_ai=filter_ai)
    if not path:
        raise SystemExit(
            "No bookmarks file found. Run: ~/.grokbot/scripts/x-bookmarks-sync.sh --max 100"
        )
    data = json.loads(path.read_text(encoding="utf-8"))
    items = list(data.get("items") or [])
    if filter_ai and "ai-only" not in path.name and not data.get("filter") == "ai_related":
        items = [it for it in items if AI_FILTER_RE.search(it.get("text") or "")]
    meta = {
        "source_path": str(path),
        "handle": data.get("handle", "snevemoney"),
        "parent_count": data.get("parent_count") or data.get("count"),
        "filtered_count": len(items),
    }
    return items, meta, path


def classify_item(item: dict[str, Any]) -> str:
    text = item.get("text") or ""
    if QUARANTINE_RE.search(text):
        return "quarantine"
    for theme_id, pattern, _agents in BOOKMARK_THEMES:
        if re.search(pattern, text, re.I):
            return theme_id
    return "other"


def cluster_bookmarks(items: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    clusters: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in items:
        clusters[classify_item(item)].append(item)
    return dict(clusters)


def items_ledger_md(items: list[dict[str, Any]]) -> str:
    """Full ledger — every bookmark gets a line (no skipping)."""
    lines = [
        "# Items ledger (full read pass)",
        "",
        f"**Total items:** {len(items)} — Researcher must account for every row before reporting done.",
        "",
        "| # | Theme | Author | Text (full) | URL |",
        "|---|-------|--------|-------------|-----|",
    ]
    for i, it in enumerate(items, 1):
        theme = classify_item(it)
        user = it.get("author_username") or it.get("author_name") or "?"
        text = (it.get("text") or "").replace("|", "\\|").replace("\n", " ")
        url = it.get("url") or ""
        lines.append(f"| {i} | {theme} | @{user} | {text} | {url} |")
    lines.append("")
    return "\n".join(lines)


def write_batch_files(
    packet_dir: Path, items: list[dict[str, Any]], *, batch_size: int = 25
) -> list[Path]:
    """Split ledger into batch files for Grok to read sequentially (large sets)."""
    batch_dir = packet_dir / "batches"
    batch_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    total = len(items)
    batch_num = 0
    for start in range(0, total, batch_size):
        batch_num += 1
        chunk = items[start : start + batch_size]
        end = start + len(chunk)
        lines = [
            f"# Batch {batch_num} — items {start + 1}–{end} of {total}",
            "",
            "_Researcher: read every row in this batch before moving to the next._",
            "",
        ]
        for i, it in enumerate(chunk, start + 1):
            theme = classify_item(it)
            user = it.get("author_username") or it.get("author_name") or "?"
            text = it.get("text") or ""
            url = it.get("url") or ""
            lines.extend(
                [
                    f"## Item {i} · `{theme}` · @{user}",
                    "",
                    text,
                    "",
                    f"**URL:** {url}",
                    "",
                    "---",
                    "",
                ]
            )
        path = batch_dir / f"batch-{batch_num:03d}.md"
        path.write_text("\n".join(lines), encoding="utf-8")
        written.append(path)
    return written


def coverage_meta(
    items: list[dict[str, Any]], batch_paths: list[Path], *, batch_size: int
) -> dict[str, Any]:
    clusters: dict[str, int] = defaultdict(int)
    for it in items:
        clusters[classify_item(it)] += 1
    return {
        "total_items": len(items),
        "items_in_ledger": len(items),
        "coverage_pct": 100 if items else 0,
        "batch_size": batch_size,
        "batch_count": len(batch_paths),
        "batch_files": [f"batches/{p.name}" for p in batch_paths],
        "themes": dict(clusters),
        "read_protocol": (
            "Researcher reads batches/batch-NNN.md in order; every item appears exactly once; "
            "report items_read == total_items before done."
        ),
    }


def bookmarks_findings_md(
    items: list[dict[str, Any]],
    clusters: dict[str, list[dict[str, Any]]],
    meta: dict[str, Any],
    coverage: dict[str, Any] | None = None,
) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lines = [
        "# Research: X bookmarks (@snevemoney)",
        f"**Type:** bookmarks",
        f"**Source:** `{meta.get('source_path', '')}`",
        f"**Items analyzed:** {len(items)} (AI filter: {meta.get('filter_ai', True)})",
        f"**Coverage:** {coverage.get('items_in_ledger', len(items)) if coverage else len(items)}/{coverage.get('total_items', len(items)) if coverage else len(items)} items in ledger (100% required)",
        f"**Read batches:** {(coverage or {}).get('batch_count', 1)} file(s) in `batches/` — read every batch in order",
        f"**Analyzed:** {today}",
        f"**Skill:** scripts/hive/grok-skills/researcher-research-to-system.md",
        "",
        "## Executive summary",
        "",
    ]
    for theme_id, group in sorted(clusters.items(), key=lambda x: -len(x[1])):
        if theme_id == "quarantine":
            continue
        lines.append(f"- **{theme_id.replace('-', ' ').title()}** — {len(group)} bookmark(s)")
    if clusters.get("quarantine"):
        lines.append(f"- **Quarantine/noise** — {len(clusters['quarantine'])} item(s) (ignore for product work)")
    lines.extend(["", "## Themes / clusters", ""])

    theme_agents = {tid: agents for tid, _, agents in BOOKMARK_THEMES}
    theme_agents["other"] = "Researcher"
    theme_agents["quarantine"] = "—"

    for theme_id, group in sorted(clusters.items(), key=lambda x: -len(x[1])):
        title = theme_id.replace("-", " ").title()
        lines.append(f"### {title} ({len(group)} items)")
        lines.append("")
        lines.append(f"- **Owner agents:** {theme_agents.get(theme_id, 'Researcher')}")
        lines.append("- **Means for Evens / hive:** _Researcher: fill after review_")
        lines.append("- **Label:** INFERENCE")
        lines.append("- **Top items:**")
        for it in group[:5]:
            text = (it.get("text") or "").replace("\n", " ")[:200]
            user = it.get("author_username") or it.get("author_name") or "unknown"
            url = it.get("url") or ""
            lines.append(f"  - @{user}: {text}… ({url})")
        if len(group) > 5:
            lines.append(f"  - _See ITEMS_LEDGER.md + batches/ for all {len(group)} items (full text)_")
        lines.append("")

    lines.extend(
        [
            "## Full read pass (mandatory)",
            "",
            "- Every bookmark appears in **ITEMS_LEDGER.md** (full text) and **batches/batch-NNN.md**.",
            "- Researcher reads batches sequentially; cannot report done until `items_read == total_items`.",
            "- FINDINGS above is the synthesis; ledger is the proof you did not glance.",
            "",
            "## Actionable implementables (ranked)",
            "",
            "| Priority | Action | Owner agent(s) | Hive target |",
            "|----------|--------|----------------|-------------|",
            "| P0 | _Researcher fills from themes_ | | CONTENT/x-bookmarks/learnings-implement.md |",
            "| P0 | Steal ICPs/machines into the **one** master sheet (not a second catalog) | Researcher, GTM, Consultant | CONTENT/watch-later/STEAL_SHEET.md |",
            "| P0 | Whole-argument deep summary (clusters, not one essay per tweet) | Researcher | CONTENT/watch-later/DEEP_SUMMARIES.md |",
            "",
            "## Quarantine / ignore",
            "",
        ]
    )
    if clusters.get("quarantine"):
        for it in clusters["quarantine"][:5]:
            lines.append(f"- {(it.get('text') or '')[:120]}…")
    else:
        lines.append("_None flagged._")
    lines.append("")
    return "\n".join(lines)


def run_bookmarks(
    *,
    filter_ai: bool,
    write: bool,
    slug: str | None,
    batch_size: int = 25,
) -> dict[str, Any]:
    items, meta, path = load_bookmarks(filter_ai=filter_ai)
    meta["filter_ai"] = filter_ai
    clusters = cluster_bookmarks(items)
    slug = slug or ("x-bookmarks-ai" if filter_ai else "x-bookmarks")
    title = "X bookmarks (AI-related)" if filter_ai else "X bookmarks (full)"

    coverage: dict[str, Any] = {
        "total_items": len(items),
        "items_in_ledger": len(items),
        "coverage_pct": 100 if items else 0,
        "batch_size": batch_size,
        "batch_count": max(1, (len(items) + batch_size - 1) // batch_size) if items else 0,
        "batch_files": [],
    }
    findings = bookmarks_findings_md(items, clusters, meta, coverage)

    result: dict[str, Any] = {
        "ok": True,
        "type": "bookmarks",
        "slug": slug,
        "itemCount": len(items),
        "themeCount": len(clusters),
        "clusters": {k: len(v) for k, v in clusters.items()},
    }

    if not write:
        result["findingsMarkdown"] = findings
        result["implementationMap"] = implementation_map_md(title, slug, "bookmarks")
        return result

    packet_dir = PACKETS / f"bookmarks-{slug}"
    batch_paths = write_batch_files(packet_dir, items, batch_size=batch_size)
    coverage = coverage_meta(items, batch_paths, batch_size=batch_size)
    findings = bookmarks_findings_md(items, clusters, meta, coverage)
    meta_out = {
        "title": title,
        "type": "bookmarks",
        "created": datetime.now(timezone.utc).isoformat(),
        "skill": "researcher-research-to-system",
        "source_path": str(path),
        "item_count": len(items),
        "clusters": {k: len(v) for k, v in clusters.items()},
        "coverage": coverage,
    }
    write_packet_dir(
        packet_dir,
        meta=meta_out,
        findings_md=findings,
        slug=slug,
        title=title,
        research_type="bookmarks",
        extras={
            "items.json": json.dumps(items, indent=2) + "\n",
            "ITEMS_LEDGER.md": items_ledger_md(items),
            "coverage.json": json.dumps(coverage, indent=2) + "\n",
        },
    )
    result["packetDir"] = str(packet_dir)
    return result


def dossier_findings_md(question: str, dossier: dict[str, Any]) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    artifacts = dossier.get("artifacts") or []
    lines = [
        f"# Research: {question}",
        "**Type:** dossier",
        f"**Sources tried:** {dossier.get('sourceCount', len(artifacts))}",
        f"**Successful:** {dossier.get('successCount', 0)}",
        f"**Analyzed:** {today}",
        "**Skill:** scripts/hive/grok-skills/researcher-research-to-system.md",
        "",
        "## Executive summary",
        "",
        "_Researcher: 3–7 bullets after reviewing sources._",
        "",
        "## Findings by source",
        "",
    ]
    for i, art in enumerate(artifacts, 1):
        if not art.get("ok", True) and art.get("error"):
            lines.append(f"### Source {i} — FAILED")
            lines.append(f"- **Error:** {art.get('error')}")
            lines.append("")
            continue
        title = art.get("title") or art.get("url") or "Untitled"
        url = art.get("url") or ""
        excerpt = (art.get("excerpt") or art.get("summaryHint") or "")[:400]
        label = "FACT" if art.get("type") == "paper" else "UNVERIFIED"
        lines.extend(
            [
                f"### Source {i} — {title}",
                f"- **URL:** {url}",
                f"- **Type:** {art.get('type', 'web')}",
                f"- **Says:** {excerpt or '_no excerpt_'}",
                "- **Means for Evens:** _Researcher fills_",
                f"- **Label:** {label}",
                "",
            ]
        )
    lines.extend(
        [
            "## Actionable implementables",
            "",
            "| Priority | Action | Owner agent(s) | Hive target |",
            "|----------|--------|----------------|-------------|",
            "| P0 | _Researcher fills_ | | |",
            "",
        ]
    )
    return "\n".join(lines)


def run_dossier(
    *,
    question: str,
    sources: str,
    write: bool,
    slug: str | None,
) -> dict[str, Any]:
    hwr = _load_hive_web_research()
    src_list = [s.strip() for s in sources.split(",") if s.strip()]
    dossier = hwr.build_dossier(question, src_list, max_web=6)
    findings = dossier_findings_md(question, dossier)
    slug = slug or _slug(question)
    title = question[:80]
    result: dict[str, Any] = {
        "ok": dossier.get("ok", True),
        "type": "dossier",
        "slug": slug,
        "successCount": dossier.get("successCount", 0),
    }

    if not write:
        result["findingsMarkdown"] = findings
        result["implementationMap"] = implementation_map_md(title, slug, "dossier")
        return result

    packet_dir = PACKETS / f"dossier-{slug}"
    meta_out = {
        "title": title,
        "type": "dossier",
        "question": question,
        "created": datetime.now(timezone.utc).isoformat(),
        "skill": "researcher-research-to-system",
        "success_count": dossier.get("successCount", 0),
    }
    write_packet_dir(
        packet_dir,
        meta=meta_out,
        findings_md=findings,
        slug=slug,
        title=title,
        research_type="dossier",
        extras={"dossier.json": json.dumps(dossier, indent=2) + "\n"},
    )
    result["packetDir"] = str(packet_dir)
    return result


def run_watchlater(args: argparse.Namespace) -> int:
    wl = _load_watchlater_module()
    if args.self_test:
        return wl.self_test()
    scrape, _path = wl.load_scrape_from_path(args.from_json)
    result = wl.run(
        scrape=scrape,
        write=args.write,
        slug=args.slug,
        batch_size=max(1, args.batch_size),
        mirror_repo=args.mirror_repo,
    )
    if args.json:
        slim = {k: v for k, v in result.items() if k != "findingsMarkdown"}
        print(json.dumps(slim, indent=2))
    elif not args.write:
        print(result.get("findingsMarkdown", ""))
        print("\n---\n")
        print(result.get("implementationMap", ""))
    return 0 if result.get("ok") else 3


def run_video(args: argparse.Namespace) -> int:
    video_mod = _load_video_module()
    if args.watch_json:
        watch = json.loads(args.watch_json.read_text(encoding="utf-8"))
    elif args.youtube_url:
        watch = video_mod.youtube_to_watch(args.youtube_url)
    else:
        raise SystemExit("video requires --watch-json or --youtube-url")

    result = video_mod.run(
        watch=watch,
        title=args.title,
        write=args.write,
        slug=args.slug,
    )
    if args.json:
        slim = {k: v for k, v in result.items() if k != "analysis"}
        print(json.dumps(slim, indent=2))
    elif not args.write:
        print(result.get("chaptersMarkdown", ""))
        print("\n---\n")
        print(result.get("implementationMap", ""))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Research → findings + system implementation")
    sub = ap.add_subparsers(dest="cmd", required=True)

    vp = sub.add_parser("video", help="Video → chapters (delegates to researcher-video-implement)")
    vp.add_argument("--title", required=True)
    vp.add_argument("--slug")
    vp.add_argument("--watch-json", type=Path)
    vp.add_argument("--youtube-url")
    vp.add_argument("--write", action="store_true")
    vp.add_argument("--json", action="store_true")

    bp = sub.add_parser("bookmarks", help="X bookmarks → themed findings")
    bp.add_argument("--filter", choices=["ai", "all"], default="ai")
    bp.add_argument("--slug")
    bp.add_argument("--batch-size", type=int, default=25, help="Items per batch file for full read pass")
    bp.add_argument("--write", action="store_true")
    bp.add_argument("--json", action="store_true")

    dp = sub.add_parser("dossier", help="Web dossier → findings by source")
    dp.add_argument("--question", required=True)
    dp.add_argument("--sources", default="web,youtube,papers")
    dp.add_argument("--slug")
    dp.add_argument("--write", action="store_true")
    dp.add_argument("--json", action="store_true")

    wp = sub.add_parser("watchlater", help="YouTube Watch Later → themed findings")
    wp.add_argument("--from-json", type=Path)
    wp.add_argument("--slug")
    wp.add_argument("--batch-size", type=int, default=25)
    wp.add_argument("--write", action="store_true")
    wp.add_argument("--mirror-repo", action="store_true")
    wp.add_argument("--json", action="store_true")
    wp.add_argument("--self-test", action="store_true")

    args = ap.parse_args()

    if args.cmd == "video":
        return run_video(args)

    if args.cmd == "bookmarks":
        result = run_bookmarks(
            filter_ai=args.filter == "ai",
            write=args.write,
            slug=args.slug,
            batch_size=max(1, args.batch_size),
        )
        if args.json:
            print(json.dumps(result, indent=2))
        elif not args.write:
            print(result.get("findingsMarkdown", ""))
            print("\n---\n")
            print(result.get("implementationMap", ""))
        return 0

    if args.cmd == "dossier":
        result = run_dossier(
            question=args.question,
            sources=args.sources,
            write=args.write,
            slug=args.slug,
        )
        if args.json:
            print(json.dumps(result, indent=2))
        elif not args.write:
            print(result.get("findingsMarkdown", ""))
            print("\n---\n")
            print(result.get("implementationMap", ""))
        return 0

    if args.cmd == "watchlater":
        return run_watchlater(args)

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
