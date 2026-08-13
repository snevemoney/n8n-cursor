#!/usr/bin/env python3
"""Researcher video → chapter breakdown + system implementation scaffold.

Usage:
  python3 scripts/hive/researcher-video-implement.py --watch-json /tmp/watch.json --title "My Video"
  python3 scripts/hive/researcher-video-implement.py --youtube-url 'https://youtube.com/watch?v=...' --title "My Video"
  python3 scripts/hive/researcher-video-implement.py --watch-json /tmp/watch.json --title "T" --write
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HIVE = Path(__file__).resolve().parent
PACKETS = Path.home() / ".grokbot" / "research-packets"


def _load_analyze():
    spec = importlib.util.spec_from_file_location(
        "analyze_video_watch", HIVE / "os" / "analyze-video-watch.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def _slug(s: str, max_len: int = 48) -> str:
    out = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return out[:max_len] or "video"


def _parse_ts_seconds(ts: str) -> float:
    parts = str(ts).strip().split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    return float(ts)


def _format_ts(seconds: float) -> str:
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def _chapter_title_from_text(text: str, index: int) -> str:
    text = text.strip()
    if not text:
        return f"Segment {index}"
    m = re.match(r"^(?:#+\s*)?(?:chapter|part|step|tip|\d+[\).:\-])\s*(.{4,80})", text, re.I)
    if m:
        return m.group(1).strip().rstrip(".")[:80]
    sentence = re.split(r"[.!?]\s+", text)[0].strip()
    if len(sentence) > 12:
        return sentence[:80] + ("…" if len(sentence) > 80 else "")
    return f"Segment {index}"


def infer_chapters(
    analysis: dict[str, Any], *, min_gap_sec: float = 45.0, max_chapter_sec: float = 360.0
) -> list[dict[str, Any]]:
    """Group timeline beats into operator-facing chapters."""
    beats = analysis.get("timeline") or []
    if not beats:
        return []

    chapters: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    def flush() -> None:
        nonlocal current
        if current and current.get("spoken_parts"):
            current["text"] = " ".join(current["spoken_parts"]).strip()
            del current["spoken_parts"]
            chapters.append(current)
        current = None

    for beat in beats:
        start = _parse_ts_seconds(beat["timestamp"]["start"])
        end = _parse_ts_seconds(beat["timestamp"]["end"])
        spoken = (beat.get("spoken") or "").strip()
        on_screen = beat.get("on_screen") or []

        if current is None:
            current = {
                "index": len(chapters) + 1,
                "start_sec": start,
                "end_sec": end,
                "spoken_parts": [spoken] if spoken else [],
                "on_screen": list(on_screen),
            }
            continue

        gap = start - current["end_sec"]
        span = end - current["start_sec"]
        topic_shift = bool(
            spoken
            and re.match(r"^(?:so|now|next|chapter|part \d|#\d|tip \d|\d+[\).:\-])", spoken, re.I)
        )

        if gap > min_gap_sec or span > max_chapter_sec or topic_shift:
            flush()
            current = {
                "index": len(chapters) + 1,
                "start_sec": start,
                "end_sec": end,
                "spoken_parts": [spoken] if spoken else [],
                "on_screen": list(on_screen),
            }
        else:
            current["end_sec"] = end
            if spoken:
                current["spoken_parts"].append(spoken)
            if on_screen:
                current["on_screen"].extend(on_screen)

    flush()
    return chapters


def chapters_markdown(
    title: str,
    video_url: str,
    chapters: list[dict[str, Any]],
    analysis: dict[str, Any],
) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lines = [
        f"# Video: {title}",
        f"**URL:** {video_url or 'unknown'}",
        f"**Analyzed:** {today}",
        f"**Skill:** scripts/hive/grok-skills/researcher-video-to-system.md",
        "",
        "## Executive summary",
        "",
        "_Researcher: fill 3–5 bullets after review._",
        "",
        "## Chapters",
        "",
    ]
    for ch in chapters:
        ts = f"`[{_format_ts(ch['start_sec'])}–{_format_ts(ch['end_sec'])}]`"
        ch_title = _chapter_title_from_text(ch.get("text", ""), ch["index"])
        preview = (ch.get("text") or "")[:500]
        lines.extend(
            [
                f"### Ch {ch['index']} — {ch_title} {ts}",
                "",
                f"- **Says:** {preview or '_GAP: no transcript_'}",
                "- **Means for Evens:** _Researcher: portfolio/agent implication_",
                "- **Label:** INFERENCE",
                "",
            ]
        )

    obs = analysis.get("top_observations") or []
    lines.extend(["## Top 3 actionable takeaways", ""])
    for i, o in enumerate(obs[:3], 1):
        ts = ", ".join(o.get("timestamps") or [])
        lines.append(f"{i}. [{ts}] {o.get('observation', '')}")
    lines.append("")
    limits = analysis.get("sampling_limitations") or []
    if limits:
        lines.extend(["## Limitations", ""])
        for lim in limits:
            lines.append(f"- {lim}")
        lines.append("")
    return "\n".join(lines)


def implementation_map_md(title: str, slug: str) -> str:
    return f"""# Implementation map: {title}

**Packet:** ~/.grokbot/research-packets/video-{slug}/
**Skill:** scripts/hive/grok-skills/researcher-video-to-system.md

Researcher: complete this table, then edit repo files and reprovision agents.

| # | Takeaway (from chapter) | Hive target | Agent(s) | Status |
|---|-------------------------|-------------|----------|--------|
| 1 | | docs/hive/outer-heaven/OPERATOR_MEMORY.md (LESSONS) | Librarian | pending |
| 2 | | scripts/hive/agent-doctrine-lanes.py | all 17 | pending |
| 3 | | scripts/hive/grok-skills/{{new-skill}}.md | all | pending |
| 4 | Steal ICPs/machines | CONTENT/watch-later/STEAL_SHEET.md + steal-usecases | Researcher, GTM | pending |
| 5 | Whole-argument deep summary | CONTENT/watch-later/DEEP_SUMMARIES.md | Researcher | pending |

## Reprovision checklist

- [ ] Edit target files in repo
- [ ] `python3 scripts/hive/build-grok-agent-routines.py --write`
- [ ] `python3 scripts/hive/grokbot-setup-agents.py`
- [ ] `python3 scripts/hive/grokbot-setup-routines.py --core --force-update`
- [ ] Message @Librarian with DON'TS
- [ ] Message affected specialist agents
- [ ] `python3 scripts/hive/os/outer-heaven-brief.py --agent Librarian --publish`

## Agent adaptation notes

_Which of the 17 agents change behavior after this video? List each by name._
"""


def youtube_to_watch(url: str) -> dict[str, Any]:
    script = HIVE / "hive-web-research.py"
    proc = subprocess.run(
        [sys.executable, str(script), "youtube", "--url", url],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise SystemExit(f"youtube fetch failed: {proc.stderr or proc.stdout}")
    data = json.loads(proc.stdout)
    segments = []
    for seg in data.get("transcript") or data.get("segments") or []:
        segments.append(
            {
                "start": seg.get("start", "00:00"),
                "end": seg.get("end", seg.get("start", "00:00")),
                "text": seg.get("text") or seg.get("content") or "",
            }
        )
    vid = re.search(r"[?&]v=([^&]+)", url)
    return {
        "video_id": vid.group(1) if vid else "unknown",
        "video_url": url,
        "sampling_interval_sec": 30,
        "frames": [],
        "transcript": segments,
    }


def run(
    *,
    watch: dict[str, Any],
    title: str,
    write: bool,
    slug: str | None,
) -> dict[str, Any]:
    analyze_mod = _load_analyze()
    analysis = analyze_mod.analyze(watch)
    chapters = infer_chapters(analysis)
    video_url = watch.get("video_url") or ""
    slug = slug or _slug(title)
    packet_dir = PACKETS / f"video-{slug}"

    result: dict[str, Any] = {
        "ok": True,
        "title": title,
        "slug": slug,
        "packetDir": str(packet_dir),
        "chapterCount": len(chapters),
        "chapters": chapters,
        "analysis": analysis,
    }

    if not write:
        result["chaptersMarkdown"] = chapters_markdown(title, video_url, chapters, analysis)
        result["implementationMap"] = implementation_map_md(title, slug)
        return result

    packet_dir.mkdir(parents=True, exist_ok=True)
    (packet_dir / "watch.json").write_text(json.dumps(watch, indent=2) + "\n", encoding="utf-8")
    (packet_dir / "analysis.json").write_text(json.dumps(analysis, indent=2) + "\n", encoding="utf-8")
    (packet_dir / "CHAPTERS.md").write_text(
        chapters_markdown(title, video_url, chapters, analysis), encoding="utf-8"
    )
    (packet_dir / "IMPLEMENTATION_MAP.md").write_text(
        implementation_map_md(title, slug), encoding="utf-8"
    )
    meta = {
        "title": title,
        "video_url": video_url,
        "created": datetime.now(timezone.utc).isoformat(),
        "skill": "researcher-video-to-system",
        "chapter_count": len(chapters),
    }
    (packet_dir / "meta.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote packet: {packet_dir}")
    print(f"  CHAPTERS.md ({len(chapters)} chapters)")
    print("  IMPLEMENTATION_MAP.md")
    return result


def main() -> int:
    ap = argparse.ArgumentParser(description="Video → chapters + system implementation scaffold")
    ap.add_argument("--title", required=True, help="Video title for operator breakdown")
    ap.add_argument("--slug", help="Packet folder slug (default from title)")
    ap.add_argument("--watch-json", type=Path, help="Grok watch output JSON")
    ap.add_argument("--youtube-url", help="YouTube URL (transcript-only L2)")
    ap.add_argument("--write", action="store_true", help="Write packet to ~/.grokbot/research-packets/")
    ap.add_argument("--json", action="store_true", help="Print result JSON to stdout")
    args = ap.parse_args()

    if args.watch_json:
        watch = json.loads(args.watch_json.read_text(encoding="utf-8"))
    elif args.youtube_url:
        watch = youtube_to_watch(args.youtube_url)
    else:
        ap.error("Provide --watch-json or --youtube-url")

    result = run(watch=watch, title=args.title, write=args.write, slug=args.slug)
    if args.json:
        slim = {k: v for k, v in result.items() if k != "analysis"}
        slim["analysisPath"] = str(Path(result["packetDir"]) / "analysis.json") if args.write else None
        print(json.dumps(slim, indent=2))
    elif not args.write:
        print(result.get("chaptersMarkdown", ""))
        print("\n---\n")
        print(result.get("implementationMap", ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
