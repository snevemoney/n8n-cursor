#!/usr/bin/env python3
"""Batch-ingest Nate Herk public Videos + Shorts captions.

Catalog is not scrape. Writes PACKET.md + full.txt from yt-dlp English
captions (official, else auto). Does not invent transcripts. Does not
spawn 17 desks.

Usage:
  python3 scripts/hive/ingest-nate-herk-channel.py --merge-shorts /tmp/nate-herk-shorts.jsonl
  python3 scripts/hive/ingest-nate-herk-channel.py --ingest
  python3 scripts/hive/ingest-nate-herk-channel.py --ingest --limit 3
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[2]
CATALOG_PATH = (
    REPO
    / "docs/hive/outer-heaven/CONTENT/watch-later/channels/nate-herk/CATALOG.json"
)
INDEX_PATH = (
    REPO / "docs/hive/outer-heaven/CONTENT/watch-later/channels/nate-herk/INDEX.md"
)
SHORTLIST_PATH = (
    REPO
    / "docs/hive/outer-heaven/CONTENT/watch-later/channels/nate-herk/SHORTLIST-year-agents.md"
)
PACKET_ROOT = REPO / "docs/hive/outer-heaven/CONTENT/watch-later/packets"
YEAR_CUTOFF = "2025-08-14"
SKIP_TITLE_RE = re.compile(
    r"wordpress|elementor|\bseo\b|video edit|3d website|claude design|"
    r"openart|seedance|image api|higgsfield|faceless|viral shorts|"
    r"videography|virtual pets|april fools|ai clone|heygen \+ n8n full",
    re.I,
)
SALES_AUTOMATION_RE = re.compile(
    r"pricing ai automations|sign your first ai automation|"
    r"selling ai automations|204 ai automations|"
    r"you.re doing ai automation wrong|ai automations fail",
    re.I,
)
INCLUDE_PATTERNS: list[tuple[str, str]] = [
    (r"\bsubagents?\b", "subagent"),
    (r"\bagentic\b", "agentic"),
    (r"\bmulti[-\s]?agent", "multi-agent"),
    (r"\bbrowser agent", "browser agent"),
    (r"\bvoice agents?\b", "voice agent"),
    (r"\bmanaged agents?\b", "managed agents"),
    (r"\bagent (?:dashboard|teams?|loops?|formula|prompts?|actions|masterclass)", "agent+"),
    (r"\b(?:rag |inbox |email |calendar |sales |research |slack |personal assistant |outreach |onboarding |scraping |google scraping |technical analyst )ai agents?\b", "typed-agent"),
    (r"\bai agents?\b", "ai agent"),
    (r"\bagents?\b", "agent"),
    (r"\bmcp\b", "mcp"),
    (r"agent loops?|loops clearly explained", "loops"),
    (r"\bn8n\b.*\bai\b|\bai\b.*\bn8n\b", "n8n AI"),
]
LOG_PATH = (
    REPO
    / "docs/hive/outer-heaven/CONTENT/watch-later/channels/nate-herk/INGEST_LOG.jsonl"
)
CHANNEL_TITLE = "Nate Herk | AI Automation"
PROTECTED_IDS = {
    "EuzYhzB0vbI",
    "-zL_trhnQaI",
    "Ums8suyAG1A",
    "QIsJe-nZ5XE",
    "sboNwYmH3AY",
    "IVx8OSMbTss",
    "7WZ6XldxX0U",
    "CB5bG4mvnS0",
}
MIN_WORDS_VIDEO = 40
MIN_WORDS_SHORT = 12
RATE_LIMIT_RE = re.compile(
    r"429|too many requests|rate.?limit|not a bot|Sign in to confirm",
    re.I,
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def load_catalog() -> dict[str, Any]:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def save_catalog(cat: dict[str, Any]) -> None:
    CATALOG_PATH.write_text(
        json.dumps(cat, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def format_duration(seconds: int | None) -> str:
    if not seconds:
        return ""
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def parse_upload_date(raw: str | None) -> str:
    if not raw:
        return ""
    raw = str(raw).strip()
    if re.fullmatch(r"\d{8}", raw):
        return f"{raw[0:4]}-{raw[4:6]}-{raw[6:8]}"
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw):
        return raw
    return ""


def classify_agent_why(title: str) -> str | None:
    """Return why-in keyword, or None if not agent-related."""
    t = title or ""
    if SKIP_TITLE_RE.search(t):
        return None
    if SALES_AUTOMATION_RE.search(t) and not re.search(
        r"\b(?:agents?|agentic|subagents?|mcp)\b", t, re.I
    ):
        return None
    for pat, label in INCLUDE_PATTERNS:
        if re.search(pat, t, re.I):
            return label
    return None


def fetch_upload_meta(url: str) -> dict[str, Any]:
    cmd = [
        "yt-dlp",
        "--skip-download",
        "--no-warnings",
        "--no-playlist",
        "--print",
        "%(id)s\t%(upload_date)s\t%(duration)s",
        "--",
        url,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    out = (proc.stdout or "").strip()
    if proc.returncode != 0 or not out:
        err = (proc.stderr or "").strip()
        return {"ok": False, "error": err[:180]}
    parts = out.split("\t")
    vid = parts[0] if parts else ""
    upload = parse_upload_date(parts[1] if len(parts) > 1 else "")
    dur_raw = parts[2] if len(parts) > 2 else ""
    try:
        dur = int(float(dur_raw)) if dur_raw and dur_raw != "NA" else 0
    except ValueError:
        dur = 0
    return {"ok": True, "video_id": vid, "upload_date": upload, "duration_seconds": dur}


def word_count(text: str) -> int:
    return len(text.split())


def existing_full_txt(video_id: str) -> Path | None:
    packet = PACKET_ROOT / video_id
    for cand in (packet / "full.txt", packet / "transcripts" / "full.txt"):
        if cand.is_file() and word_count(cand.read_text(encoding="utf-8", errors="replace")) >= 8:
            return cand
    return None


def is_substantial(text: str, *, kind: str) -> bool:
    n = word_count(text)
    return n >= (MIN_WORDS_SHORT if kind == "short" else MIN_WORDS_VIDEO)


def parse_json3(raw: str) -> str:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return ""
    parts: list[str] = []
    last = ""
    for event in data.get("events") or []:
        if event.get("aAppend") == 1:
            continue
        segs = event.get("segs") or []
        text = "".join(s.get("utf8", "") for s in segs).replace("\n", " ").strip()
        if not text or text == last:
            continue
        last = text
        parts.append(text)
    return _paragraphize(" ".join(parts))


def parse_vtt(raw: str) -> str:
    lines: list[str] = []
    last = ""
    for line in raw.splitlines():
        if (
            line.startswith("WEBVTT")
            or "-->" in line
            or line.startswith("Kind:")
            or line.startswith("Language:")
            or line.startswith("NOTE")
            or not line.strip()
        ):
            continue
        cleaned = re.sub(r"<[^>]+>", "", line)
        cleaned = re.sub(r"&\w+;", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        if not cleaned or cleaned == last:
            continue
        last = cleaned
        lines.append(cleaned)
    # YouTube auto-VTT rolls; keep a line only if it is not a prefix of the next.
    kept: list[str] = []
    for i, line in enumerate(lines):
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        if nxt and (line == nxt or nxt.startswith(line) or line.startswith(nxt)):
            continue
        kept.append(line)
    return _paragraphize(" ".join(kept or lines))


def _paragraphize(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return ""
    chunks = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"'])", text)
    paras = [c.strip() for c in chunks if c.strip()]
    return "\n\n".join(paras) + ("\n" if paras else "")


def pick_caption_files(folder: Path, video_id: str) -> tuple[Path | None, str, str]:
    """Return (path, lang_label, fmt). Prefer official json3, then official vtt, then auto."""
    files = sorted(folder.glob(f"{video_id}.*"))
    ranked: list[tuple[int, Path, str, str]] = []
    for path in files:
        name = path.name
        if name.endswith(".info.json"):
            continue
        lang = ""
        fmt = ""
        if name.endswith(".json3"):
            fmt = "json3"
            lang = name[len(video_id) + 1 : -6]
        elif name.endswith(".vtt"):
            fmt = "vtt"
            lang = name[len(video_id) + 1 : -4]
        else:
            continue
        if not lang.startswith("en"):
            continue
        auto = 1 if "auto" in lang else 0
        official = 0 if auto else 0
        # official en / en-orig beat auto; json3 beats vtt
        score = 0
        if auto:
            score += 20
        if "orig" in lang:
            score -= 2
        if fmt == "vtt":
            score += 1
        if lang in {"en", "en-orig", "en-US", "en-GB"}:
            score -= 1
        ranked.append((score, path, lang, fmt))
    if not ranked:
        return None, "", ""
    ranked.sort(key=lambda x: (x[0], x[1].name))
    _score, path, lang, fmt = ranked[0]
    return path, lang, fmt


def captions_from_file(path: Path, fmt: str) -> str:
    raw = path.read_text(encoding="utf-8", errors="replace")
    if fmt == "json3":
        return parse_json3(raw)
    return parse_vtt(raw)


def write_packet(
    video: dict[str, Any],
    *,
    text: str,
    lang: str,
    fmt: str,
    vtt_name: str,
) -> Path:
    video_id = video["video_id"]
    packet = PACKET_ROOT / video_id
    transcripts = packet / "transcripts"
    transcripts.mkdir(parents=True, exist_ok=True)
    full = packet / "full.txt"
    mirror = transcripts / "full.txt"
    full.write_text(text, encoding="utf-8")
    if mirror.resolve() != full.resolve():
        shutil.copyfile(full, mirror)
    n = word_count(text)
    kind = video.get("kind") or "video"
    rel = f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{video_id}/"
    abs_full = str(full)
    packet_md = f"""# Ingest — Nate Herk {video.get("title") or video_id}

**Video id:** `{video_id}`  
**URL:** {video.get("url") or f"https://www.youtube.com/watch?v={video_id}"}  
**Title:** {video.get("title") or ""}  
**Channel:** {CHANNEL_TITLE}  
**Kind:** {kind}  
**Duration:** {video.get("duration") or ""}  
**Captions:** yt-dlp `{lang}` {fmt} — **{n} words**. Not invented.  
**Date:** {_today()}  
**Uploaded:** {video.get("upload_date") or ""}  
**ICP:** `us` only. Live hunt stays `local-pro` / Normand. No new `icp_id`.

## Load (17 desks)

```
{abs_full}
```

Mirror (same bytes): `{rel}transcripts/full.txt`  
VTT/json3: `{rel}transcripts/{vtt_name}`

## Transcript said (pointer — read full.txt)

Caption ingest only. Read `full.txt` ({n} words). No invented summary. 17 desks not spawned.

## Steal vs operate-never

| Steal (existing machines only) | Operate-never |
|--------------------------------|---------------|
| Catalog pointer + `full.txt` for later `channel-walk` / `coverage-loop` | Spawn 17 this scrape · dump take folders · treat Nate $ as FACT |
| `ask-principal` on send / pay / deploy / book / publish | Join Skool / install his sold n8n templates |
| Operate Cursor + Grok Bot | Unpark Normand / start a Path A client |

**17 desks:** not spawned.
"""
    (packet / "PACKET.md").write_text(packet_md, encoding="utf-8")
    return packet


def ytdlp_fetch(video_id: str, url: str, dest: Path) -> tuple[int, str]:
    dest.mkdir(parents=True, exist_ok=True)
    cmd = [
        "yt-dlp",
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs",
        "en.*,en",
        "--sub-format",
        "json3/vtt",
        "--write-info-json",
        "--no-playlist",
        "--retries",
        "8",
        "--retry-sleep",
        "5",
        "--sleep-requests",
        "1",
        "--socket-timeout",
        "45",
        "--no-warnings",
        "-o",
        str(dest / f"{video_id}/%(id)s"),
        "--",
        url,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=240)
    err = (proc.stderr or "") + "\n" + (proc.stdout or "")
    return proc.returncode, err


def apply_info_json(video: dict[str, Any], folder: Path, video_id: str) -> None:
    info = folder / f"{video_id}.info.json"
    if not info.is_file():
        return
    try:
        data = json.loads(info.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return
    if data.get("title") and not video.get("title"):
        video["title"] = data["title"]
    upload = parse_upload_date(str(data.get("upload_date") or data.get("release_date") or ""))
    if upload:
        video["upload_date"] = upload
    dur = data.get("duration")
    if dur:
        video["duration_seconds"] = int(dur)
        video["duration"] = format_duration(int(dur))


def merge_shorts(jsonl_path: Path) -> dict[str, Any]:
    cat = load_catalog()
    existing = {v["video_id"] for v in cat["videos"]}
    added = 0
    for line in jsonl_path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        vid = row.get("id")
        if not vid or vid in existing:
            continue
        title = (row.get("title") or "").strip()
        url = row.get("url") or f"https://www.youtube.com/shorts/{vid}"
        cat["videos"].append(
            {
                "video_id": vid,
                "title": title,
                "upload_date": parse_upload_date(str(row.get("upload_date") or "")),
                "duration": format_duration(row.get("duration")),
                "duration_seconds": int(row["duration"]) if row.get("duration") else 0,
                "url": url,
                "kind": "short",
                "ingested": "no",
                "packet_path": "",
                "take_folder": "",
                "notes": "shorts tab 2026-08-14",
                "word_count": 0,
            }
        )
        existing.add(vid)
        added += 1
    shorts = [v for v in cat["videos"] if v.get("kind") == "short"]
    videos = [v for v in cat["videos"] if v.get("kind") != "short"]
    for v in videos:
        v.setdefault("kind", "video")
        v.setdefault("word_count", 0)
    cat["shorts_tab_count"] = len(shorts)
    cat["shorts_in_this_catalog"] = True
    cat["public_video_count"] = len(videos)
    cat["public_short_count"] = len(shorts)
    cat["scope"] = (
        "public Videos tab + public Shorts tab; no members-only; no logged-in scrape"
    )
    cat["shorts_source"] = (
        "yt-dlp --flat-playlist --skip-download --extractor-args "
        "youtubetab:approximate_date --dump-json https://www.youtube.com/@nateherk/shorts"
    )
    refresh_counts(cat)
    save_catalog(cat)
    write_index(cat)
    print(f"merged shorts: added={added} shorts_total={len(shorts)} videos={len(videos)}")
    return cat


def refresh_counts(cat: dict[str, Any]) -> None:
    videos = cat["videos"]
    yes = [v for v in videos if v.get("ingested") == "yes"]
    failed = [v for v in videos if v.get("ingested") == "failed"]
    leftover = [v for v in videos if v.get("ingested") not in {"yes", "failed"}]
    cat["ingested_count"] = len(yes)
    cat["failed_count"] = len(failed)
    cat["uningested_count"] = len(leftover)
    cat["leftover_count"] = len(leftover)
    cat["already_ingested_ids"] = [v["video_id"] for v in yes]
    cat["failed_ids"] = [v["video_id"] for v in failed]
    if leftover:
        n = leftover[0]
        cat["next_uningested"] = {
            "video_id": n["video_id"],
            "title": n.get("title"),
            "url": n.get("url"),
            "upload_date": n.get("upload_date"),
            "duration": n.get("duration"),
        }
    else:
        cat["next_uningested"] = None
    cat["ingest_updated_at"] = _now_iso()


def write_shortlist_md(cat: dict[str, Any]) -> None:
    rows = [v for v in cat["videos"] if v.get("shortlist") == "yes"]
    rows.sort(key=lambda v: (v.get("upload_date") or "", v.get("video_id") or ""), reverse=True)
    yes = [v for v in rows if v.get("ingested") == "yes"]
    failed = [v for v in rows if v.get("ingested") == "failed"]
    leftover = [v for v in rows if v.get("ingested") not in {"yes", "failed"}]
    lines = [
        "# Nate Herk shortlist — past year + AI agents",
        "",
        f"**Cutoff:** on/after `{YEAR_CUTOFF}` (today 2026-08-14).  ",
        "**Filter:** title keywords `agent` / `agents` / `agentic` / `subagent` / `multi-agent` / `browser agent` / `voice agent` / `MCP` / `loops` / `n8n`+`AI`.  ",
        "Skip sales-only “AI automation”, WordPress/SEO, video-edit, image-gen, faceless/clone.  ",
        "17 desks not spawned. Clients parked.",
        "",
        f"**Count:** {len(rows)}  ·  ingested=yes **{len(yes)}**  ·  failed **{len(failed)}**  ·  leftover **{len(leftover)}**",
        "",
        "| video_id | date | title | why-in | ingested |",
        "|----------|------|-------|--------|----------|",
    ]
    for v in rows:
        title = (v.get("title") or "").replace("|", "/")
        lines.append(
            f"| `{v['video_id']}` | {v.get('upload_date') or ''} | {title} | "
            f"{v.get('shortlist_why') or ''} | {v.get('ingested') or 'no'} |"
        )
    lines.append("")
    SHORTLIST_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_shortlist(*, refresh_dates: bool, sleep_s: float) -> dict[str, Any]:
    cat = load_catalog()
    need_date: list[dict[str, Any]] = []
    for v in cat["videos"]:
        why = classify_agent_why(v.get("title") or "")
        v["shortlist_why"] = why or ""
        date = v.get("upload_date") or ""
        kind = v.get("kind") or "video"
        if not why:
            v["shortlist"] = "no"
            if v.get("ingested") not in {"yes", "failed"}:
                v["notes"] = (v.get("notes") or "") or "skipped: not agent-related"
            continue
        needs = (not date) or (date == "2025-08-15" and kind == "video") or (kind == "short")
        if refresh_dates and needs:
            need_date.append(v)
        elif date and date < YEAR_CUTOFF:
            v["shortlist"] = "no"
            v["shortlist_why"] = ""
            if v.get("ingested") not in {"yes", "failed"}:
                v["notes"] = f"skipped: before {YEAR_CUTOFF}"
        else:
            v["shortlist"] = "yes"

    print(f"date-refresh queue={len(need_date)}", flush=True)
    for i, v in enumerate(need_date, 1):
        url = v.get("url") or f"https://www.youtube.com/watch?v={v['video_id']}"
        meta = fetch_upload_meta(url)
        if meta.get("ok") and meta.get("upload_date"):
            v["upload_date"] = meta["upload_date"]
            if meta.get("duration_seconds"):
                v["duration_seconds"] = meta["duration_seconds"]
                v["duration"] = format_duration(meta["duration_seconds"])
            v["date_source"] = "yt-dlp upload_date"
        why = v.get("shortlist_why") or classify_agent_why(v.get("title") or "")
        date = v.get("upload_date") or ""
        if why and date and date >= YEAR_CUTOFF:
            v["shortlist"] = "yes"
            v["shortlist_why"] = why
        else:
            v["shortlist"] = "no"
            if not date:
                v["notes"] = "skipped: no upload_date after refresh"
            elif date < YEAR_CUTOFF:
                v["notes"] = f"skipped: {date} before {YEAR_CUTOFF}"
                v["shortlist_why"] = ""
        print(
            f"date {i}/{len(need_date)} {v['video_id']} {date or '?'} "
            f"shortlist={v.get('shortlist')} {(v.get('title') or '')[:50]}",
            flush=True,
        )
        time.sleep(sleep_s)

    # final pass
    for v in cat["videos"]:
        why = classify_agent_why(v.get("title") or "")
        date = v.get("upload_date") or ""
        if why and date and date >= YEAR_CUTOFF:
            v["shortlist"] = "yes"
            v["shortlist_why"] = why
        else:
            if v.get("shortlist") != "yes":
                v["shortlist"] = "no"
            if why and date and date < YEAR_CUTOFF:
                v["shortlist"] = "no"
                v["shortlist_why"] = ""

    sl = [v for v in cat["videos"] if v.get("shortlist") == "yes"]
    cat["scope"] = (
        f"shortlist only: past year (>= {YEAR_CUTOFF}) + agent-related title. "
        "Rest queued/skipped, not failed. 17 not spawned."
    )
    cat["shortlist_count"] = len(sl)
    cat["shortlist_cutoff"] = YEAR_CUTOFF
    refresh_counts(cat)
    save_catalog(cat)
    write_shortlist_md(cat)
    write_index(cat)
    print(f"shortlist={len(sl)}", flush=True)
    return cat


def write_index(cat: dict[str, Any]) -> None:
    videos = [v for v in cat["videos"] if v.get("kind") != "short"]
    shorts = [v for v in cat["videos"] if v.get("kind") == "short"]
    sl = [v for v in cat["videos"] if v.get("shortlist") == "yes"]
    rest = [v for v in cat["videos"] if v.get("shortlist") != "yes"]
    sl_yes = [v for v in sl if v.get("ingested") == "yes"]
    sl_fail = [v for v in sl if v.get("ingested") == "failed"]
    sl_left = [v for v in sl if v.get("ingested") not in {"yes", "failed"}]
    sl_v = [v for v in sl if v.get("kind") != "short"]
    sl_s = [v for v in sl if v.get("kind") == "short"]
    rest_yes = [v for v in rest if v.get("ingested") == "yes"]
    fail_rows = "\n".join(
        f"| `{v['video_id']}` | {v.get('title','')} | {v.get('notes','')} |"
        for v in sl_fail[:40]
    ) or "| — | — | none |"
    leftover_ids = ", ".join(f"`{v['video_id']}`" for v in sl_left[:40])
    if len(sl_left) > 40:
        leftover_ids += f" … +{len(sl_left) - 40} more"

    lines = f"""# Nate Herk channel catalog + year-agent shortlist

**Handle:** `@nateherk`  
**Channel:** https://www.youtube.com/@nateherk  
**Channel id:** `UC2ojq-nuP8ceeHqiroeKhBA`  
**Scope (2026-08-14):** past year (on/after `{YEAR_CUTOFF}`) **and** AI-agent titles. Full-channel dump **stopped**.  
**Shortlist:** [SHORTLIST-year-agents.md](SHORTLIST-year-agents.md)  
**Machine file:** [CATALOG.json](CATALOG.json)  
**Updated:** {cat.get("ingest_updated_at") or _now_iso()}

Do not invent rows. 17 desks not spawned. Clients parked. Rest of channel = **skipped**, not failed.

## Shortlist counts (checkable stop)

| | Videos | Shorts | Combined |
|--|--|--|--|
| Shortlist | {len(sl_v)} | {len(sl_s)} | **{len(sl)}** |
| ingested=yes | | | **{len(sl_yes)}** |
| ingested=failed | | | **{len(sl_fail)}** |
| leftover | | | **{len(sl_left)}** |

Checkable stop: every shortlist id is `ingested=yes` or `ingested=failed`.

## Rest of catalog (not the job)

| | |
|--|--|
| Public Videos tab | {len(videos)} |
| Public Shorts tab | {len(shorts)} |
| Combined catalog | {len(cat["videos"])} |
| Rest (not shortlist) | **{len(rest)}** — skipped / queued, not failed |
| Rest already had packets (left on disk) | {len(rest_yes)} |

## Failed shortlist (first 40)

| video_id | title | reason |
|----------|-------|--------|
{fail_rows}

## Shortlist leftover

{leftover_ids or "none"}

## Never (this folder)

- Dump the whole 307 / 166 channel
- Spawn 17 desks
- Treat Nate $ / student counts as FACT
- Unpark Normand / start a replacement client
- Join Skool / install his sold n8n templates without Evens
"""
    INDEX_PATH.write_text(lines, encoding="utf-8")


def log_event(event: dict[str, Any]) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, ensure_ascii=False) + "\n")


def ingest_one(video: dict[str, Any], *, tmp: Path) -> str:
    video_id = video["video_id"]
    kind = video.get("kind") or "video"
    url = video.get("url") or f"https://www.youtube.com/watch?v={video_id}"

    existing = existing_full_txt(video_id)
    if existing:
        text = existing.read_text(encoding="utf-8", errors="replace")
        if is_substantial(text, kind=kind) or video_id in PROTECTED_IDS:
            n = word_count(text)
            packet = PACKET_ROOT / video_id
            if not (packet / "PACKET.md").is_file():
                write_packet(video, text=text, lang="existing", fmt="full.txt", vtt_name="")
            video["ingested"] = "yes"
            video["packet_path"] = f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{video_id}/"
            video["word_count"] = n
            video["notes"] = f"existing full.txt ({n} words); 17 not spawned"
            return "already"

    if video_id in PROTECTED_IDS and video.get("ingested") == "yes":
        video["notes"] = video.get("notes") or "pre-scrape ingested; left untouched"
        return "protected"

    dest = tmp / video_id
    if dest.exists():
        shutil.rmtree(dest, ignore_errors=True)

    try:
        code, err = ytdlp_fetch(video_id, url, tmp)
    except subprocess.TimeoutExpired:
        video["ingested"] = "failed"
        video["notes"] = "yt-dlp timeout"
        video["packet_path"] = ""
        return "failed"
    except FileNotFoundError:
        raise

    if RATE_LIMIT_RE.search(err):
        return "rate_limited"

    folder = dest
    apply_info_json(video, folder, video_id)
    cap_path, lang, fmt = pick_caption_files(folder, video_id)
    if not cap_path:
        reason = "no English captions"
        if "Private video" in err or "private video" in err.lower():
            reason = "private"
        elif "members-only" in err.lower() or "Join this channel" in err:
            reason = "members-only"
        elif "Video unavailable" in err or "unavailable" in err.lower():
            reason = "unavailable"
        elif code != 0:
            snippet = re.sub(r"\s+", " ", err).strip()[:180]
            reason = f"yt-dlp captions missing ({snippet or code})"
        video["ingested"] = "failed"
        video["notes"] = reason
        video["packet_path"] = ""
        video["word_count"] = 0
        return "failed"

    text = captions_from_file(cap_path, fmt)
    if not is_substantial(text, kind=kind):
        video["ingested"] = "failed"
        video["notes"] = f"captions too short ({word_count(text)} words, lang={lang})"
        video["packet_path"] = ""
        video["word_count"] = word_count(text)
        return "failed"

    packet = write_packet(video, text=text, lang=lang, fmt=fmt, vtt_name=cap_path.name)
    transcripts = packet / "transcripts"
    for src in folder.glob(f"{video_id}.*"):
        if src.suffix in {".vtt", ".json3"} or src.name.endswith(".json3"):
            shutil.copy2(src, transcripts / src.name)
    n = word_count(text)
    video["ingested"] = "yes"
    video["packet_path"] = f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{video_id}/"
    video["word_count"] = n
    video["notes"] = f"channel scrape PACKET + full.txt ({n} words, {lang} {fmt}); 17 not spawned"
    return "ingested"


def run_ingest(*, limit: int | None, sleep_s: float, shortlist_only: bool = False) -> dict[str, int]:
    cat = load_catalog()
    stats = {"already": 0, "protected": 0, "ingested": 0, "failed": 0, "rate_limited_sleeps": 0}
    tmp = Path("/tmp/nate-herk-ingest")
    tmp.mkdir(parents=True, exist_ok=True)
    backoff = 45
    consecutive_rate = 0
    processed = 0

    queue = [v for v in cat["videos"] if v.get("ingested") not in {"yes", "failed"}]
    if shortlist_only:
        queue = [v for v in queue if v.get("shortlist") == "yes"]
    print(f"queue={len(queue)} limit={limit} shortlist_only={shortlist_only}", flush=True)

    for video in queue:
        if limit is not None and processed >= limit:
            break
        video_id = video["video_id"]
        status = ingest_one(video, tmp=tmp)
        if status == "rate_limited":
            consecutive_rate += 1
            stats["rate_limited_sleeps"] += 1
            sleep_for = min(300, backoff * consecutive_rate)
            print(
                f"RATE LIMIT on {video_id}; sleep {sleep_for}s "
                f"(consecutive={consecutive_rate})",
                flush=True,
            )
            log_event(
                {
                    "ts": _now_iso(),
                    "video_id": video_id,
                    "status": "rate_limited",
                    "sleep": sleep_for,
                }
            )
            if consecutive_rate >= 8:
                print("hard stop: 8 consecutive rate limits", flush=True)
                break
            time.sleep(sleep_for)
            status = ingest_one(video, tmp=tmp)
            if status == "rate_limited":
                print(f"still rate-limited on {video_id}; leaving leftover", flush=True)
                continue
        if status != "rate_limited":
            consecutive_rate = 0
        stats[status] = stats.get(status, 0) + 1
        processed += 1
        refresh_counts(cat)
        save_catalog(cat)
        if processed % 5 == 0 or status in {"failed", "ingested"}:
            write_index(cat)
            if shortlist_only:
                write_shortlist_md(cat)
        log_event(
            {
                "ts": _now_iso(),
                "video_id": video_id,
                "status": status,
                "ingested": video.get("ingested"),
                "word_count": video.get("word_count"),
                "notes": video.get("notes"),
            }
        )
        print(
            f"{processed}/{len(queue)} {status} {video_id} "
            f"{video.get('ingested')} words={video.get('word_count', 0)} "
            f"{(video.get('title') or '')[:60]}",
            flush=True,
        )
        time.sleep(sleep_s)

    refresh_counts(cat)
    save_catalog(cat)
    write_index(cat)
    if shortlist_only:
        write_shortlist_md(cat)
    return stats


def main() -> int:
    ap = argparse.ArgumentParser(description="Ingest Nate Herk channel captions")
    ap.add_argument("--merge-shorts", type=Path)
    ap.add_argument("--ingest", action="store_true")
    ap.add_argument("--shortlist-only", action="store_true")
    ap.add_argument("--build-shortlist", action="store_true")
    ap.add_argument("--refresh-dates", action="store_true")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--sleep", type=float, default=1.8)
    ap.add_argument("--rewrite-index", action="store_true")
    args = ap.parse_args()

    if args.merge_shorts:
        merge_shorts(args.merge_shorts)
    if args.build_shortlist:
        build_shortlist(refresh_dates=args.refresh_dates, sleep_s=args.sleep)
    if args.rewrite_index:
        cat = load_catalog()
        refresh_counts(cat)
        save_catalog(cat)
        write_index(cat)
        write_shortlist_md(cat)
    if args.ingest:
        stats = run_ingest(
            limit=args.limit,
            sleep_s=args.sleep,
            shortlist_only=args.shortlist_only,
        )
        print(json.dumps(stats, indent=2))
    if not (
        args.merge_shorts
        or args.ingest
        or args.rewrite_index
        or args.build_shortlist
    ):
        ap.print_help()
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
