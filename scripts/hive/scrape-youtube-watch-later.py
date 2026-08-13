#!/usr/bin/env python3
"""Normalize / probe YouTube Watch Later scrapes for Researcher.

Watch Later (playlist id WL) is private. This script never logs in, never
removes videos, and never invents items.

Acquire (in order):
  1. --from-json  (native-browser scrape the operator already captured)
  2. Default paths (~/.grokbot/.../watch-later/latest.json, repo CONTENT, /tmp)
  3. Optional Chrome CDP probe on 127.0.0.1:9222 (read-only evaluate)

Usage:
  python3 scripts/hive/scrape-youtube-watch-later.py --from-json PATH --write
  python3 scripts/hive/scrape-youtube-watch-later.py --self-test
"""
from __future__ import annotations

import argparse
import json
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HIVE = Path(__file__).resolve().parent
REPO = HIVE.parents[1]
FIXTURE = HIVE / "os" / "fixtures" / "watch-later-sample.json"
WL_URL = "https://www.youtube.com/playlist?list=WL"
VIDEO_ID_RE_LEN = 11

DEFAULT_PATHS = [
    Path.home() / ".grokbot/outer-heaven/CONTENT/watch-later/latest.json",
    REPO / "docs/hive/outer-heaven/CONTENT/watch-later/latest.json",
    Path("/tmp/watch-later/watch-later.json"),
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def video_id_from_url(url: str) -> str | None:
    if not url:
        return None
    if "v=" in url:
        part = url.split("v=", 1)[1]
        cand = part.split("&", 1)[0].split("#", 1)[0]
        if len(cand) == VIDEO_ID_RE_LEN:
            return cand
    if "youtu.be/" in url:
        cand = url.split("youtu.be/", 1)[1].split("?", 1)[0].split("/", 1)[0]
        if len(cand) == VIDEO_ID_RE_LEN:
            return cand
    return None


def normalize_item(raw: dict[str, Any], index: int) -> dict[str, Any] | None:
    video_id = (raw.get("videoId") or raw.get("video_id") or video_id_from_url(str(raw.get("url") or "")))
    if not video_id:
        return None
    url = str(raw.get("url") or f"https://www.youtube.com/watch?v={video_id}")
    return {
        "index": int(raw.get("index") or index),
        "title": str(raw.get("title") or "").strip(),
        "channel": str(raw.get("channel") or raw.get("author") or "").strip(),
        "url": url,
        "videoId": str(video_id),
        "duration": str(raw.get("duration") or "").strip(),
        "added": str(raw.get("added") or "").strip(),
    }


def normalize_scrape(data: dict[str, Any], *, source: str | None = None) -> dict[str, Any]:
    raw_items = list(data.get("items") or [])
    items: list[dict[str, Any]] = []
    seen: set[str] = set()
    for i, raw in enumerate(raw_items, 1):
        if not isinstance(raw, dict):
            continue
        item = normalize_item(raw, i)
        if not item or item["videoId"] in seen:
            continue
        seen.add(item["videoId"])
        item["index"] = len(items) + 1
        items.append(item)

    logged_in = data.get("loggedIn")
    if logged_in is None:
        logged_in = bool(items)
    notes = list(data.get("notes") or [])
    return {
        "playlistUrl": data.get("playlistUrl") or WL_URL,
        "playlistId": data.get("playlistId") or "WL",
        "scrapedAt": data.get("scrapedAt") or _now_iso(),
        "loggedIn": bool(logged_in),
        "scrolledToEnd": bool(data.get("scrolledToEnd", False)),
        "pageTitle": data.get("pageTitle") or "",
        "source": source or data.get("source") or "json",
        "notes": notes,
        "probe": data.get("probe") or {},
        "items": items,
        "totalItems": len(items),
        "uniqueVideoIds": len(items),
    }


def coverage_from_scrape(scrape: dict[str, Any]) -> dict[str, Any]:
    logged_in = bool(scrape.get("loggedIn"))
    total = int(scrape.get("totalItems") or 0)
    blocker = None
    if not logged_in:
        blocker = "signed_out"
    elif total == 0:
        blocker = "empty_or_unrendered"
    return {
        "playlistUrl": scrape.get("playlistUrl"),
        "loggedIn": logged_in,
        "totalItems": total,
        "uniqueVideoIds": int(scrape.get("uniqueVideoIds") or total),
        "scrolledToEnd": bool(scrape.get("scrolledToEnd")),
        "pageTitle": scrape.get("pageTitle") or "",
        "source": scrape.get("source"),
        "blocker": blocker,
        "notes": list(scrape.get("notes") or []),
        "coverage_pct": 100 if (logged_in and total >= 0 and scrape.get("scrolledToEnd")) else 0,
    }


def resolve_scrape_path(explicit: Path | None) -> Path | None:
    if explicit:
        return explicit if explicit.is_file() else None
    for p in DEFAULT_PATHS:
        if p.is_file():
            return p
    return None


def load_scrape(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"Watch Later JSON must be an object: {path}")
    return normalize_scrape(data, source=str(path))


def markdown_table(scrape: dict[str, Any]) -> str:
    lines = [
        "# YouTube Watch Later scrape",
        "",
        f"**URL:** {scrape.get('playlistUrl')}",
        f"**Logged in:** {scrape.get('loggedIn')}",
        f"**Items:** {scrape.get('totalItems')}",
        f"**Scraped:** {scrape.get('scrapedAt')}",
        f"**Source:** {scrape.get('source')}",
        "",
    ]
    notes = scrape.get("notes") or []
    if notes:
        lines.append("## Notes")
        lines.append("")
        for n in notes:
            lines.append(f"- {n}")
        lines.append("")
    lines.extend(
        [
            "| # | Title | Channel | Duration | URL |",
            "|---|-------|---------|----------|-----|",
        ]
    )
    items = scrape.get("items") or []
    if not items:
        lines.append("| — | _none_ | | | |")
    else:
        for it in items:
            title = (it.get("title") or "").replace("|", "\\|")
            channel = (it.get("channel") or "").replace("|", "\\|")
            lines.append(
                f"| {it.get('index')} | {title} | {channel} | {it.get('duration') or ''} | {it.get('url')} |"
            )
    lines.append("")
    return "\n".join(lines)


def probe_cdp(cdp_http: str) -> dict[str, Any]:
    """Read-only: list Chrome tabs. Evaluate is websocket-only (not implemented here)."""
    url = cdp_http.rstrip("/") + "/json/list"
    try:
        with urllib.request.urlopen(url, timeout=2) as resp:
            tabs = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
        return {"ok": False, "error": str(exc), "cdp": cdp_http}
    yt = [
        {"title": t.get("title"), "url": t.get("url"), "type": t.get("type")}
        for t in tabs
        if isinstance(t, dict) and "youtube.com" in str(t.get("url") or "")
    ]
    return {"ok": True, "tabCount": len(tabs), "youtubeTabs": yt, "cdp": cdp_http}


def write_outputs(scrape: dict[str, Any], out_dir: Path) -> dict[str, str]:
    out_dir.mkdir(parents=True, exist_ok=True)
    coverage = coverage_from_scrape(scrape)
    (out_dir / "watch-later.json").write_text(json.dumps(scrape, indent=2) + "\n", encoding="utf-8")
    (out_dir / "watch-later.md").write_text(markdown_table(scrape), encoding="utf-8")
    (out_dir / "coverage.json").write_text(json.dumps(coverage, indent=2) + "\n", encoding="utf-8")
    return {
        "json": str(out_dir / "watch-later.json"),
        "md": str(out_dir / "watch-later.md"),
        "coverage": str(out_dir / "coverage.json"),
    }


def self_test() -> int:
    sample = json.loads(FIXTURE.read_text(encoding="utf-8"))
    scrape = normalize_scrape(sample, source="fixture")
    if scrape["totalItems"] != 4 or not scrape["loggedIn"]:
        print("FAIL: fixture should have 4 logged-in items")
        return 1
    if scrape["items"][2]["videoId"] != "ccccccccccc":
        print("FAIL: videoId preserve")
        return 1
    signed_out = normalize_scrape(
        {"loggedIn": False, "items": [], "pageTitle": "YouTube", "notes": ["signed out"]},
        source="self-test",
    )
    cov = coverage_from_scrape(signed_out)
    if cov["blocker"] != "signed_out" or cov["totalItems"] != 0:
        print("FAIL: signed-out coverage")
        return 1
    # Must not invent items from an empty signed-out scrape
    if signed_out["items"]:
        print("FAIL: invented items")
        return 1
    print("scrape-youtube-watch-later self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Normalize YouTube Watch Later scrape for Researcher")
    ap.add_argument("--from-json", type=Path, help="Existing scrape JSON (native browser dump)")
    ap.add_argument("--write-dir", type=Path, help="Write watch-later.json/md + coverage.json")
    ap.add_argument("--probe-cdp", action="store_true", help="List Chrome tabs via CDP HTTP")
    ap.add_argument("--cdp-http", default="http://127.0.0.1:9222")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    cdp_info: dict[str, Any] | None = None
    if args.probe_cdp:
        cdp_info = probe_cdp(args.cdp_http)

    path = resolve_scrape_path(args.from_json)
    if not path:
        payload = {
            "ok": False,
            "error": "No Watch Later JSON found",
            "hint": "Scrape the logged-in YouTube tab (playlist?list=WL) then pass --from-json",
            "cdp": cdp_info,
        }
        print(json.dumps(payload, indent=2))
        return 2

    scrape = load_scrape(path)
    if cdp_info:
        scrape.setdefault("probe", {})["cdp"] = cdp_info
    coverage = coverage_from_scrape(scrape)
    result = {"ok": True, "scrape": scrape, "coverage": coverage, "sourcePath": str(path)}

    if args.write_dir:
        result["written"] = write_outputs(scrape, args.write_dir)

    if args.json or not args.write_dir:
        print(json.dumps(result, indent=2))
    else:
        print(f"Wrote {args.write_dir} ({scrape['totalItems']} items, loggedIn={scrape['loggedIn']})")
    return 0 if scrape.get("loggedIn") else 3


if __name__ == "__main__":
    raise SystemExit(main())
