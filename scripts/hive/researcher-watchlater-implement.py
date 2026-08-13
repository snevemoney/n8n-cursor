#!/usr/bin/env python3
"""Researcher Watch Later → themed findings + system implementation scaffold.

Usage:
  python3 scripts/hive/researcher-watchlater-implement.py --from-json PATH --write
  python3 scripts/hive/researcher-watchlater-implement.py --self-test
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HIVE = Path(__file__).resolve().parent
REPO = HIVE.parents[1]
PACKETS = Path.home() / ".grokbot" / "research-packets"
REPO_CONTENT = REPO / "docs/hive/outer-heaven/CONTENT/watch-later"
CACHE_CONTENT = Path.home() / ".grokbot/outer-heaven/CONTENT/watch-later"
FIXTURE = HIVE / "os" / "fixtures" / "watch-later-sample.json"

WATCH_THEMES: list[tuple[str, str, str]] = [
    ("claude-code-desktop", r"claude code|claude devs|fable|ios simulator|desktop app|codex", "Forge, Big Boss"),
    ("cinematic-websites", r"cinematic|\$50,?000|\bsol\b|landing page|website build|web design", "Forge, Creative Studio, Product GTM"),
    ("mcp-connectors", r"\bmcp\b|connector|artifact", "Forge, Researcher"),
    ("creative-pipeline", r"midjourney|runway|seedance|topaz|higgsfield|after effects|\bae\b|premiere", "Creative Studio"),
    ("knowledge-graph", r"obsidian|wiki|second brain|knowledge graph|llm wiki|karpathy", "Librarian"),
    ("agent-hype-gtm", r"agent swarm|marketing agent|\$20k|\$400|multi.?agent team|40 agent", "Product GTM, Consultant"),
    ("automation-workflows", r"\bn8n\b|zapier|make\.com|workflow automation", "Forge"),
    ("models-research", r"\bgpt\b|gemini|openai|anthropic|llm|transformer|fine-?tun|grok|\bxai\b", "Researcher, Forge"),
    ("grok-openclaw", r"openclaw|hermes|grok bot", "Forge, Researcher"),
    ("gaming-godot", r"godot|unity|unreal|game engine", "Creative Studio, Forge"),
    ("entertainment", r"spider-man|mcu|horror|recap|podcast|q\s*&\s*a", "—"),
]


def _load_scrape_mod():
    spec = importlib.util.spec_from_file_location(
        "scrape_youtube_watch_later", HIVE / "scrape-youtube-watch-later.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def load_scrape_from_path(path: Path | None) -> tuple[dict[str, Any], Path]:
    scrape_mod = _load_scrape_mod()
    resolved = scrape_mod.resolve_scrape_path(path)
    if not resolved:
        raise SystemExit(
            "No Watch Later JSON. Scrape the logged-in tab then pass --from-json."
        )
    return scrape_mod.load_scrape(resolved), resolved


def item_text(item: dict[str, Any]) -> str:
    return " ".join(
        str(item.get(k) or "") for k in ("title", "channel", "duration")
    )


def classify_item(item: dict[str, Any]) -> str:
    text = item_text(item)
    for theme_id, pattern, _agents in WATCH_THEMES:
        if re.search(pattern, text, re.I):
            return theme_id
    return "other"


def cluster_items(items: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    clusters: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in items:
        clusters[classify_item(item)].append(item)
    return dict(clusters)


def items_ledger_md(items: list[dict[str, Any]]) -> str:
    lines = [
        "# Items ledger (full read pass)",
        "",
        f"**Total items:** {len(items)} — Researcher must account for every row before reporting done.",
        "",
        "| # | Theme | Channel | Title | Duration | URL |",
        "|---|-------|---------|-------|----------|-----|",
    ]
    for it in items:
        theme = classify_item(it)
        title = (it.get("title") or "").replace("|", "\\|")
        channel = (it.get("channel") or "?").replace("|", "\\|")
        lines.append(
            f"| {it.get('index')} | {theme} | {channel} | {title} | {it.get('duration') or ''} | {it.get('url') or ''} |"
        )
    if not items:
        lines.append("| — | — | — | _none_ | | |")
    lines.append("")
    return "\n".join(lines)


def write_batch_files(
    packet_dir: Path, items: list[dict[str, Any]], *, batch_size: int = 25
) -> list[Path]:
    batch_dir = packet_dir / "batches"
    batch_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    total = len(items)
    if total == 0:
        path = batch_dir / "batch-000.md"
        path.write_text(
            "# Batch 0 — empty\n\n_No Watch Later items. Do not invent videos._\n",
            encoding="utf-8",
        )
        return [path]
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
        for it in chunk:
            theme = classify_item(it)
            lines.extend(
                [
                    f"## Item {it.get('index')} · `{theme}` · {it.get('channel') or '?'}",
                    "",
                    it.get("title") or "",
                    "",
                    f"**URL:** {it.get('url') or ''}",
                    f"**Duration:** {it.get('duration') or 'unknown'}",
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
    items: list[dict[str, Any]],
    batch_paths: list[Path],
    scrape: dict[str, Any],
    *,
    batch_size: int,
) -> dict[str, Any]:
    clusters: dict[str, int] = defaultdict(int)
    for it in items:
        clusters[classify_item(it)] += 1
    logged_in = bool(scrape.get("loggedIn"))
    return {
        "total_items": len(items),
        "items_in_ledger": len(items),
        "coverage_pct": 100 if items else 0,
        "loggedIn": logged_in,
        "blocker": None if logged_in else "signed_out",
        "batch_size": batch_size,
        "batch_count": len(batch_paths),
        "batch_files": [f"batches/{p.name}" for p in batch_paths],
        "themes": dict(clusters),
        "read_protocol": (
            "Researcher reads batches/batch-NNN.md in order; every item appears exactly once; "
            "report items_read == total_items before done. Never invent videos if signed_out."
        ),
    }


def implementation_map_md(title: str, slug: str) -> str:
    return f"""# Implementation map: {title}

**Type:** watchlater
**Packet:** ~/.grokbot/research-packets/watchlater-{slug}/
**Skill:** scripts/hive/grok-skills/researcher-research-to-system.md

Researcher: complete this table, then edit repo files and reprovision agents.

| # | Takeaway | Hive target | Agent(s) | Status |
|---|----------|-------------|----------|--------|
| 1 | | docs/hive/outer-heaven/OPERATOR_MEMORY.md (LESSONS/CONTENT) | Librarian | pending |
| 2 | | scripts/hive/agent-doctrine-lanes.py | Researcher | pending |
| 3 | | docs/hive/outer-heaven/CONTENT/watch-later/ | Researcher | pending |

## Reprovision checklist

- [ ] Edit target files in repo
- [ ] `python3 scripts/hive/build-grok-agent-routines.py --write`
- [ ] `python3 scripts/hive/grokbot-setup-agents.py`
- [ ] Message @Librarian + affected agents
"""


def findings_md(
    scrape: dict[str, Any],
    clusters: dict[str, list[dict[str, Any]]],
    coverage: dict[str, Any],
) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    items = scrape.get("items") or []
    logged_in = bool(scrape.get("loggedIn"))
    lines = [
        "# Research: YouTube Watch Later",
        "**Type:** watchlater",
        f"**Source:** `{scrape.get('source', '')}`",
        f"**URL:** {scrape.get('playlistUrl')}",
        f"**Logged in:** {logged_in}",
        f"**Items analyzed:** {len(items)}",
        f"**Coverage:** {coverage.get('items_in_ledger', len(items))}/{coverage.get('total_items', len(items))} items in ledger",
        f"**Analyzed:** {today}",
        "**Skill:** scripts/hive/grok-skills/researcher-research-to-system.md",
        "",
        "## Executive summary",
        "",
    ]
    if not logged_in:
        lines.extend(
            [
                "- **FACT:** Native browser opened `youtube.com/playlist?list=WL` but the session is **signed out**.",
                "- **FACT:** Item count is **0** — this is an auth miss, not proof the playlist is empty.",
                "- **DON'T:** Invent Watch Later videos, substitute subscriptions, or treat Gmail YouTube mail as the queue.",
                "- **P0:** Re-run scrape on the **operator-logged** YouTube tab (Grok computer / local Chrome), then this CLI with `--from-json`.",
                "",
            ]
        )
        notes = scrape.get("notes") or []
        if notes:
            lines.extend(["## Probe evidence", ""])
            for n in notes:
                lines.append(f"- {n}")
            lines.append("")
        lines.extend(
            [
                "## Themes / clusters",
                "",
                "_None — no items. Ledger is empty on purpose._",
                "",
                "## Actionable implementables (ranked)",
                "",
                "| Priority | Action | Owner agent(s) | Hive target |",
                "|----------|--------|----------------|-------------|",
                "| P0 | Re-scrape WL from a logged-in YouTube session | Researcher | CONTENT/watch-later/latest.json |",
                "| P1 | Keep watchlater as a first-class research type | Researcher | researcher-watchlater-implement.py |",
                "| P2 | Remember cloud Chrome ≠ operator Google session | Librarian | OPERATOR_MEMORY LESSONS |",
                "",
                "## Quarantine / ignore",
                "",
                "- Do not use Gmail YouTube memberships or live alerts as a Watch Later stand-in.",
                "",
            ]
        )
        return "\n".join(lines)

    for theme_id, group in sorted(clusters.items(), key=lambda x: -len(x[1])):
        lines.append(f"- **{theme_id.replace('-', ' ').title()}** — {len(group)} video(s)")
    lines.extend(["", "## Themes / clusters", ""])
    theme_agents = {tid: agents for tid, _, agents in WATCH_THEMES}
    theme_agents["other"] = "Researcher"
    for theme_id, group in sorted(clusters.items(), key=lambda x: -len(x[1])):
        title = theme_id.replace("-", " ").title()
        lines.append(f"### {title} ({len(group)} items)")
        lines.append("")
        lines.append(f"- **Owner agents:** {theme_agents.get(theme_id, 'Researcher')}")
        lines.append("- **Means for Evens / hive:** _Researcher: fill after review_")
        lines.append("- **Label:** INFERENCE (titles/channels only until L2 transcript)")
        lines.append("- **Top items:**")
        for it in group[:5]:
            lines.append(
                f"  - {it.get('channel') or '?'}: {it.get('title') or ''} ({it.get('url')})"
            )
        if len(group) > 5:
            lines.append(f"  - _See ITEMS_LEDGER.md + batches/ for all {len(group)} items_")
        lines.append("")
    lines.extend(
        [
            "## Full read pass (mandatory)",
            "",
            "- Every video appears in **ITEMS_LEDGER.md** and **batches/batch-NNN.md**.",
            "- Researcher cannot report done until `items_read == total_items`.",
            "",
            "## Actionable implementables (ranked)",
            "",
            "| Priority | Action | Owner agent(s) | Hive target |",
            "|----------|--------|----------------|-------------|",
            "| P0 | _Researcher fills from themes_ | | CONTENT/watch-later/learnings-implement.md |",
            "",
            "## Quarantine / ignore",
            "",
            "_Entertainment / off-brand rows stay in the ledger but do not drive hive doctrine._",
            "",
        ]
    )
    return "\n".join(lines)


def write_packet_dir(
    packet_dir: Path,
    *,
    scrape: dict[str, Any],
    findings: str,
    impl: str,
    ledger: str,
    coverage: dict[str, Any],
    extras: dict[str, str] | None = None,
) -> None:
    packet_dir.mkdir(parents=True, exist_ok=True)
    (packet_dir / "FINDINGS.md").write_text(findings, encoding="utf-8")
    (packet_dir / "IMPLEMENTATION_MAP.md").write_text(impl, encoding="utf-8")
    (packet_dir / "ITEMS_LEDGER.md").write_text(ledger, encoding="utf-8")
    (packet_dir / "watch-later.json").write_text(json.dumps(scrape, indent=2) + "\n", encoding="utf-8")
    (packet_dir / "coverage.json").write_text(json.dumps(coverage, indent=2) + "\n", encoding="utf-8")
    (packet_dir / "meta.json").write_text(
        json.dumps(
            {
                "title": "YouTube Watch Later",
                "type": "watchlater",
                "created": datetime.now(timezone.utc).isoformat(),
                "skill": "researcher-research-to-system",
                "loggedIn": scrape.get("loggedIn"),
                "item_count": len(scrape.get("items") or []),
                "coverage": coverage,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    if extras:
        for name, content in extras.items():
            (packet_dir / name).write_text(content, encoding="utf-8")
    print(f"Wrote packet: {packet_dir}")


def mirror_content(scrape: dict[str, Any], findings: str, coverage: dict[str, Any]) -> None:
    for dest in (REPO_CONTENT, CACHE_CONTENT):
        dest.mkdir(parents=True, exist_ok=True)
        (dest / "latest.json").write_text(json.dumps(scrape, indent=2) + "\n", encoding="utf-8")
        (dest / "coverage.json").write_text(json.dumps(coverage, indent=2) + "\n", encoding="utf-8")
        (dest / "FINDINGS.md").write_text(findings, encoding="utf-8")
        (dest / "README.md").write_text(
            "# Watch Later (Researcher)\n\n"
            "Private YouTube queue for @snevemoney. Refresh with:\n\n"
            "```bash\n"
            "python3 scripts/hive/scrape-youtube-watch-later.py --from-json PATH --write-dir docs/hive/outer-heaven/CONTENT/watch-later\n"
            "python3 scripts/hive/researcher-research-implement.py watchlater --from-json PATH --write --mirror-repo\n"
            "```\n\n"
            "Signed-out scrapes must keep `items: []` — never invent videos.\n",
            encoding="utf-8",
        )


def run(
    *,
    scrape: dict[str, Any],
    write: bool,
    slug: str | None,
    batch_size: int = 25,
    mirror_repo: bool = False,
) -> dict[str, Any]:
    items = list(scrape.get("items") or [])
    clusters = cluster_items(items)
    slug = slug or "youtube-watch-later"
    coverage = coverage_meta(items, [], scrape, batch_size=batch_size)
    findings = findings_md(scrape, clusters, coverage)
    impl = implementation_map_md("YouTube Watch Later", slug)
    ledger = items_ledger_md(items)
    result: dict[str, Any] = {
        "ok": bool(scrape.get("loggedIn")),
        "type": "watchlater",
        "slug": slug,
        "itemCount": len(items),
        "loggedIn": bool(scrape.get("loggedIn")),
        "blocker": None if scrape.get("loggedIn") else "signed_out",
        "themeCount": len(clusters),
        "clusters": {k: len(v) for k, v in clusters.items()},
    }
    if not write:
        result["findingsMarkdown"] = findings
        result["implementationMap"] = impl
        return result

    packet_dir = PACKETS / f"watchlater-{slug}"
    packet_dir.mkdir(parents=True, exist_ok=True)
    batch_paths = write_batch_files(packet_dir, items, batch_size=batch_size)
    coverage = coverage_meta(items, batch_paths, scrape, batch_size=batch_size)
    findings = findings_md(scrape, clusters, coverage)
    write_packet_dir(
        packet_dir,
        scrape=scrape,
        findings=findings,
        impl=impl,
        ledger=ledger,
        coverage=coverage,
    )
    if mirror_repo:
        mirror_content(scrape, findings, coverage)
        result["repoContent"] = str(REPO_CONTENT)
    result["packetDir"] = str(packet_dir)
    result["findingsMarkdown"] = findings
    return result


def self_test() -> int:
    scrape_mod = _load_scrape_mod()
    sample = json.loads(FIXTURE.read_text(encoding="utf-8"))
    scrape = scrape_mod.normalize_scrape(sample, source="fixture")
    result = run(scrape=scrape, write=False, slug="self-test")
    if result["itemCount"] != 4 or not result["ok"]:
        print("FAIL: fixture itemCount/ok", result)
        return 1
    if "claude-code-desktop" not in result["clusters"]:
        print("FAIL: expected claude-code-desktop cluster", result["clusters"])
        return 1
    if "cinematic-websites" not in result["clusters"]:
        print("FAIL: expected cinematic-websites", result["clusters"])
        return 1
    signed_out = scrape_mod.normalize_scrape(
        {"loggedIn": False, "items": [], "notes": ["self-test signed out"]},
        source="self-test",
    )
    blocked = run(scrape=signed_out, write=False, slug="self-test-out")
    if blocked["ok"] or blocked["blocker"] != "signed_out" or blocked["itemCount"] != 0:
        print("FAIL: signed-out result", blocked)
        return 1
    md = blocked["findingsMarkdown"]
    if "signed out" not in md.lower():
        print("FAIL: signed-out findings missing FACT")
        return 1
    if "invent" not in md.lower():
        print("FAIL: signed-out findings missing DON'T invent")
        return 1
    print("researcher-watchlater-implement self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Watch Later → findings + implementation scaffold")
    ap.add_argument("--from-json", type=Path)
    ap.add_argument("--slug")
    ap.add_argument("--batch-size", type=int, default=25)
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--mirror-repo", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    scrape_mod = _load_scrape_mod()
    path = scrape_mod.resolve_scrape_path(args.from_json)
    if not path:
        print(
            "No Watch Later JSON. Scrape the logged-in tab then pass --from-json.",
            file=sys.stderr,
        )
        return 2
    scrape = scrape_mod.load_scrape(path)
    result = run(
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


if __name__ == "__main__":
    raise SystemExit(main())
