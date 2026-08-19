#!/usr/bin/env python3
"""Structured open-web research for Grok Web Intelligence Hunter.

Fetch pages, YouTube captions, arXiv papers, and assemble intelligence dossiers.
Read-only — no login, OAuth, or paywalled bypass. Use Grok browser for blocked sites.

Usage:
  python3 scripts/hive/hive-web-research.py fetch --url https://example.com/blog/post
  python3 scripts/hive/hive-web-research.py youtube --url 'https://www.youtube.com/watch?v=...'
  python3 scripts/hive/hive-web-research.py papers --query 'retrieval augmented generation'
  python3 scripts/hive/hive-web-research.py dossier --query 'nursing claim verification schools'
  python3 scripts/hive/hive-web-research.py dossier --query 'godot 4 multiplayer' --sources web,youtube,papers
"""
from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import sys
import textwrap
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CACHE_DIR = Path.home() / ".grokbot" / "research"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
ARXIV_USER_AGENT = "n8n-cursor-hive-web-research/1.0 (contact: evenslouis.ca; research-only)"


class _TextExtractor(HTMLParser):
    SKIP = frozenset({"script", "style", "noscript", "svg", "nav", "footer", "header"})

    def __init__(self) -> None:
        super().__init__()
        self._skip_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.SKIP:
            self._skip_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in self.SKIP and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._skip_depth == 0:
            chunk = data.strip()
            if chunk:
                self.parts.append(chunk)


def _http_get(url: str, *, timeout: int = 30, agent: str | None = None) -> tuple[str, str]:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": agent or USER_AGENT, "Accept-Language": "en"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
        ctype = resp.headers.get("Content-Type", "")
    charset = "utf-8"
    m = re.search(r"charset=([\w-]+)", ctype, re.I)
    if m:
        charset = m.group(1)
    return raw.decode(charset, errors="replace"), ctype


def _slug(s: str, max_len: int = 60) -> str:
    out = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return out[:max_len] or "research"


def _title_from_html(page: str) -> str:
    m = re.search(r"<title[^>]*>([^<]+)</title>", page, re.I | re.S)
    return html.unescape(m.group(1).strip()) if m else ""


def fetch_url(url: str) -> dict[str, Any]:
    try:
        body, ctype = _http_get(url)
    except urllib.error.HTTPError as exc:
        return {"ok": False, "type": "web", "url": url, "error": f"HTTP {exc.code}"}
    except Exception as exc:
        return {"ok": False, "type": "web", "url": url, "error": str(exc)}

    if "html" not in ctype.lower():
        return {
            "ok": True,
            "type": "web",
            "url": url,
            "title": url,
            "contentType": ctype,
            "excerpt": body[:2000],
            "wordCount": len(body.split()),
        }

    parser = _TextExtractor()
    parser.feed(body)
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(parser.parts))
    text = re.sub(r"[ \t]+", " ", text).strip()
    title = _title_from_html(body) or url
    excerpt = text[:2500]
    return {
        "ok": True,
        "type": "web",
        "url": url,
        "title": title,
        "excerpt": excerpt,
        "wordCount": len(text.split()),
        "fullText": text[:50000],
    }


def youtube_video_id(url: str) -> str | None:
    parsed = urllib.parse.urlparse(url)
    if parsed.hostname in ("youtu.be",):
        return parsed.path.lstrip("/").split("/")[0] or None
    if "youtube.com" in (parsed.hostname or ""):
        qs = urllib.parse.parse_qs(parsed.query)
        if "v" in qs:
            return qs["v"][0]
        m = re.match(r"^/(shorts|embed)/([^/?]+)", parsed.path or "")
        if m:
            return m.group(2)
    return None


def _youtube_timedtext(video_id: str) -> str | None:
    for lang in ("en", "en-US", "en-GB", "a.en"):
        url = f"https://www.youtube.com/api/timedtext?v={video_id}&lang={lang}"
        try:
            xml_text, _ = _http_get(url)
        except Exception:
            continue
        if not xml_text.strip() or "<text" not in xml_text:
            continue
        try:
            lines = re.findall(r"<text[^>]*>([^<]*)</text>", xml_text)
        except Exception:
            continue
        if not lines:
            continue
        joined = html.unescape(" ".join(lines)).strip()
        if joined:
            return re.sub(r"\s+", " ", joined)
    return None


def _parse_ytdlp_json3(raw: str) -> tuple[str, list[dict[str, Any]]]:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return "", []
    segments: list[dict[str, Any]] = []
    for event in data.get("events") or []:
        if event.get("aAppend") == 1:
            continue
        segs = event.get("segs") or []
        text = "".join(s.get("utf8", "") for s in segs).replace("\n", " ").strip()
        if not text:
            continue
        start_ms = int(event.get("tStartMs") or 0)
        end_ms = start_ms + int(event.get("dDurationMs") or 0)
        segments.append(
            {
                "start": format_ts(start_ms // 1000),
                "end": format_ts(max(start_ms // 1000, end_ms // 1000)),
                "text": text,
            }
        )
    if not segments:
        return "", []
    deduped: list[dict[str, Any]] = []
    for seg in segments:
        if deduped and deduped[-1]["text"] == seg["text"]:
            continue
        deduped.append(seg)
    transcript = " ".join(s["text"] for s in deduped).strip()
    return transcript, deduped


def _youtube_ytdlp_fetch(video_id: str) -> tuple[str | None, list[dict[str, Any]] | None]:
    url = f"https://www.youtube.com/watch?v={video_id}"
    import tempfile

    try:
        with tempfile.TemporaryDirectory() as tmp:
            out_tpl = str(Path(tmp) / "%(id)s")
            for sub_format in ("json3", "vtt"):
                proc = subprocess.run(
                    [
                        "yt-dlp",
                        "--skip-download",
                        "--write-auto-sub",
                        "--sub-lang",
                        "en",
                        "--sub-format",
                        sub_format,
                        "-o",
                        out_tpl,
                        url,
                    ],
                    capture_output=True,
                    text=True,
                        timeout=180,
                )
                if proc.returncode != 0:
                    continue
                if sub_format == "json3":
                    json_files = sorted(Path(tmp).glob("*.json3"))
                    if not json_files:
                        continue
                    transcript, segments = _parse_ytdlp_json3(
                        json_files[0].read_text(encoding="utf-8", errors="replace")
                    )
                    if transcript:
                        return transcript, segments
                else:
                    vtt_files = sorted(Path(tmp).glob("*.vtt"))
                    if not vtt_files:
                        continue
                    raw = vtt_files[0].read_text(encoding="utf-8", errors="replace")
                    lines = []
                    for line in raw.splitlines():
                        if (
                            line.startswith("WEBVTT")
                            or "-->" in line
                            or line.startswith("Kind:")
                            or line.startswith("Language:")
                            or not line.strip()
                        ):
                            continue
                        lines.append(re.sub(r"<[^>]+>", "", line).strip())
                    text = " ".join(lines).strip()
                    if text:
                        return text, None
    except FileNotFoundError:
        return None, None
    return None, None


def _youtube_ytdlp(video_id: str) -> str | None:
    transcript, _ = _youtube_ytdlp_fetch(video_id)
    return transcript


def _youtube_transcript_api(video_id: str) -> str | None:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi  # type: ignore
    except ImportError:
        return None
    try:
        chunks = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "en-US", "fr"])
    except Exception:
        try:
            chunks = YouTubeTranscriptApi.get_transcript(video_id)
        except Exception:
            return None
    return " ".join(c["text"] for c in chunks).strip()


def _youtube_transcript_segments(video_id: str) -> list[dict[str, Any]] | None:
    """Return timestamped transcript segments when available."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi  # type: ignore
    except ImportError:
        return None
    try:
        chunks = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "en-US", "fr"])
    except Exception:
        try:
            chunks = YouTubeTranscriptApi.get_transcript(video_id)
        except Exception:
            return None
    return [
        {"start": format_ts(int(c["start"])), "end": format_ts(int(c["start"] + c.get("duration", 0))), "text": c["text"]}
        for c in chunks
    ]


def format_ts(seconds: int) -> str:
    m, s = divmod(max(0, seconds), 60)
    return f"{m:02d}:{s:02d}"


def youtube_metadata(video_id: str) -> dict[str, Any]:
    """Level 1 — best-effort metadata via oEmbed."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    oembed = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
    try:
        body, _ = _http_get(oembed)
        data = json.loads(body)
        return {
            "title": data.get("title"),
            "author": data.get("author_name"),
            "url": url,
            "videoId": video_id,
        }
    except Exception as exc:
        return {"url": url, "videoId": video_id, "error": str(exc)}


def video_search(query: str, *, max_results: int = 5) -> list[dict[str, Any]]:
    """Search YouTube via DuckDuckGo; rank by relevance (order) with metadata."""
    urls = google_search_urls(f"{query} site:youtube.com OR site:youtu.be", max_urls=max_results * 2)
    ranked: list[dict[str, Any]] = []
    for u in urls:
        vid = youtube_video_id(u)
        if not vid:
            continue
        meta = youtube_metadata(vid)
        meta["relevance_rank"] = len(ranked) + 1
        meta["source_quality"] = "search_result"
        ranked.append(meta)
        if len(ranked) >= max_results:
            break
    return ranked


def build_research_packet(
    question: str,
    requested_by: str,
    sources: list[str],
    *,
    tier: str = "standard",
    project_id: str | None = None,
    dry_run: bool = False,
) -> dict[str, Any]:
    """Build JIT research packet from dossier + structured findings."""
    import importlib.util

    _rp_spec = importlib.util.spec_from_file_location(
        "research_packet", Path(__file__).resolve().parent / "os" / "research-packet.py"
    )
    _rp = importlib.util.module_from_spec(_rp_spec)
    assert _rp_spec.loader is not None
    _rp_spec.loader.exec_module(_rp)

    _kp_spec = importlib.util.spec_from_file_location(
        "knowledge_policy", Path(__file__).resolve().parent / "os" / "knowledge-policy.py"
    )
    _kp = importlib.util.module_from_spec(_kp_spec)
    assert _kp_spec.loader is not None
    _kp_spec.loader.exec_module(_kp)

    budget = _kp.budget_for_tier(tier)
    max_web = min(4, budget["max_sources"])
    max_videos = budget["max_videos"]

    if dry_run:
        return {
            "ok": True,
            "dryRun": True,
            "question": question,
            "requested_by": requested_by,
            "tier": tier,
            "budget": budget,
        }

    dossier = build_dossier(question, sources, max_web=max_web)
    packet = _rp.create_packet(question, requested_by, budget_tier=tier, project_id=project_id)

    video_count = 0
    web_count = 0
    for art in dossier.get("artifacts") or []:
        if not art.get("ok", True) and art.get("error"):
            continue
        label = "UNVERIFIED"
        if art.get("type") == "paper":
            label = "FACT"
        finding_text = art.get("title") or art.get("excerpt", "")[:200]
        conf = 0.85 if label == "FACT" else 0.7
        url = art.get("url", "")
        _rp.merge_finding(packet, finding_text, conf, label=label, sources=[url] if url else [])
        if art.get("type") == "youtube" or "youtube" in str(url):
            video_count += 1
        else:
            web_count += 1

    ok_budget, budget_msg = _kp.check_budget(tier, sources=web_count + video_count, videos=video_count)
    if not ok_budget:
        packet["remaining_uncertainty"].append(budget_msg)

    recommended = f"Review {dossier.get('successCount', 0)} sources; prioritize official docs before tutorials."
    if video_count:
        recommended += f" {video_count} video(s) — use transcript first, targeted frames for UI steps."
    packet = _rp.finalize_packet(packet, recommended=recommended, action_ready=ok_budget and dossier.get("ok"))
    packet["sources"] = {
        "documents": 0,
        "web_pages": web_count,
        "videos": video_count,
        "social_posts": sum(1 for a in dossier.get("artifacts") or [] if a.get("type") == "social"),
        "papers": sum(1 for a in dossier.get("artifacts") or [] if a.get("type") == "paper"),
    }
    packet["source_refs"] = [
        {"type": a.get("type", "web"), "url": a.get("url", ""), "title": a.get("title", ""), "label": "UNVERIFIED"}
        for a in dossier.get("artifacts") or []
        if a.get("ok", True)
    ][: budget["max_sources"]]
    path = _rp.save_packet(packet)
    return {"ok": True, "packet": packet, "dossier": dossier, "packetPath": str(path)}


def youtube_research(url: str) -> dict[str, Any]:
    video_id = youtube_video_id(url)
    if not video_id:
        return {"ok": False, "type": "youtube", "url": url, "error": "Could not parse YouTube video id"}

    transcript = _youtube_transcript_api(video_id) or _youtube_timedtext(video_id)
    ytdlp_segments: list[dict[str, Any]] | None = None
    if not transcript:
        transcript, ytdlp_segments = _youtube_ytdlp_fetch(video_id)
    meta: dict[str, Any] = {"ok": True, "type": "youtube", "url": url, "videoId": video_id}
    if not transcript:
        meta.update(
            {
                "ok": False,
                "error": "No captions found — use Grok browser to watch and summarize manually",
                "hint": f"Open https://www.youtube.com/watch?v={video_id} in Grok computer browser",
                "metadata": youtube_metadata(video_id),
                "analysis_level": 1,
            }
        )
        return meta

    words = transcript.split()
    summary_hint = " ".join(words[:120])
    if len(words) > 120:
        summary_hint += "…"
    segments = _youtube_transcript_segments(video_id) or ytdlp_segments
    md = youtube_metadata(video_id)
    meta.update(
        {
            "title": md.get("title") or f"YouTube {video_id}",
            "transcriptWordCount": len(words),
            "excerpt": transcript[:2500],
            "summaryHint": summary_hint,
            "fullTranscript": transcript,
            "transcriptSegments": segments,
            "metadata": md,
            "analysis_level": 2 if segments else 1,
        }
    )
    return meta


def semanticscholar_search(query: str, *, max_results: int = 5) -> dict[str, Any]:
    q = urllib.parse.quote(query)
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={q}&limit={max_results}&fields=title,url,abstract,year,authors,externalIds"
    try:
        body, _ = _http_get(url, timeout=45)
        data = json.loads(body)
    except Exception as exc:
        return {"ok": False, "type": "papers", "query": query, "error": str(exc), "provider": "semanticscholar"}

    papers: list[dict[str, Any]] = []
    for item in data.get("data") or []:
        ext = item.get("externalIds") or {}
        arxiv_id = ext.get("ArXiv")
        link = item.get("url") or (f"https://arxiv.org/abs/{arxiv_id}" if arxiv_id else "")
        authors = [a.get("name", "") for a in (item.get("authors") or []) if a.get("name")]
        papers.append(
            {
                "title": item.get("title") or "",
                "url": link,
                "published": str(item.get("year") or ""),
                "authors": authors[:5],
                "excerpt": (item.get("abstract") or "")[:1500],
                "provider": "semanticscholar",
            }
        )
    return {"ok": True, "type": "papers", "query": query, "papers": papers, "count": len(papers), "provider": "semanticscholar"}


def arxiv_search(query: str, *, max_results: int = 5) -> dict[str, Any]:
    params = urllib.parse.urlencode(
        {"search_query": f"all:{query}", "start": 0, "max_results": max_results, "sortBy": "relevance", "sortOrder": "descending"}
    )
    url = f"http://export.arxiv.org/api/query?{params}"
    try:
        xml_text, _ = _http_get(url, timeout=45, agent=ARXIV_USER_AGENT)
        root = ET.fromstring(xml_text)
    except Exception as exc:
        fallback = semanticscholar_search(query, max_results=max_results)
        if fallback.get("ok"):
            fallback["arxivFallbackReason"] = str(exc)
            return fallback
        return {"ok": False, "type": "papers", "query": query, "error": str(exc)}

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    papers: list[dict[str, Any]] = []
    for entry in root.findall("atom:entry", ns):
        title = (entry.findtext("atom:title", default="", namespaces=ns) or "").strip()
        summary = (entry.findtext("atom:summary", default="", namespaces=ns) or "").strip()
        link = ""
        for link_el in entry.findall("atom:link", ns):
            if link_el.get("rel") == "alternate":
                link = link_el.get("href") or ""
                break
        published = entry.findtext("atom:published", default="", namespaces=ns)
        authors = [
            a.findtext("atom:name", default="", namespaces=ns)
            for a in entry.findall("atom:author", ns)
        ]
        papers.append(
            {
                "title": re.sub(r"\s+", " ", title),
                "url": link,
                "published": published[:10] if published else "",
                "authors": [a for a in authors if a][:5],
                "excerpt": summary[:1500],
            }
        )
    return {"ok": True, "type": "papers", "query": query, "papers": papers, "count": len(papers)}


def google_search_urls(query: str, *, max_urls: int = 5) -> list[str]:
    """Best-effort HTML scrape of DuckDuckGo lite (no API key)."""
    q = urllib.parse.quote_plus(query)
    url = f"https://lite.duckduckgo.com/lite/?q={q}"
    try:
        body, _ = _http_get(url)
    except Exception:
        return []
    urls: list[str] = []
    for m in re.finditer(r'href="(https?://[^"]+)"', body):
        u = html.unescape(m.group(1))
        if "duckduckgo.com" in u or u in urls:
            continue
        urls.append(u)
        if len(urls) >= max_urls:
            break
    return urls


def social_fetch(url: str) -> dict[str, Any]:
    """Fetch public social/post pages when not login-walled."""
    low = url.lower()
    if any(d in low for d in ("twitter.com", "x.com", "reddit.com", "linkedin.com", "threads.net", "tiktok.com")):
        result = fetch_url(url)
        result["type"] = "social"
        if result.get("ok") and len(result.get("excerpt", "")) < 200:
            result["hint"] = "Page may be JS-gated — use Grok browser for full thread/post content"
        return result
    return {"ok": False, "type": "social", "url": url, "error": "Not a recognized social URL"}


def build_dossier(query: str, sources: list[str], *, max_web: int = 4) -> dict[str, Any]:
    correlation_id = f"web-intel-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
    artifacts: list[dict[str, Any]] = []

    if "papers" in sources:
        paper = arxiv_search(query, max_results=5)
        if paper.get("ok"):
            for p in paper.get("papers", []):
                artifacts.append({"type": "paper", **p})

    if "youtube" in sources:
        yt_urls = google_search_urls(f"{query} site:youtube.com", max_urls=3)
        for u in yt_urls:
            if "youtube.com" in u or "youtu.be" in u:
                artifacts.append(youtube_research(u))

    if "web" in sources:
        for u in google_search_urls(query, max_urls=max_web):
            if "youtube.com" in u:
                continue
            artifacts.append(fetch_url(u))

    if "social" in sources:
        for u in google_search_urls(f"{query} site:reddit.com OR site:x.com", max_urls=3):
            artifacts.append(social_fetch(u))

    ok_count = sum(1 for a in artifacts if a.get("ok"))
    return {
        "ok": ok_count > 0,
        "correlationId": correlation_id,
        "query": query,
        "sources": sources,
        "artifactCount": len(artifacts),
        "successCount": ok_count,
        "artifacts": artifacts,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


def write_dossier(dossier: dict[str, Any], *, write_vault: bool) -> Path | None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cid = dossier.get("correlationId", "research")
    path = CACHE_DIR / f"{_slug(cid)}.json"
    path.write_text(json.dumps(dossier, indent=2) + "\n", encoding="utf-8")

    md_path = path.with_suffix(".md")
    lines = [
        f"# Research dossier — {dossier.get('query', '')}",
        "",
        f"- correlationId: `{cid}`",
        f"- generated: {dossier.get('generatedAt', '')}",
        f"- artifacts: {dossier.get('successCount', 0)}/{dossier.get('artifactCount', 0)} ok",
        "",
    ]
    for i, art in enumerate(dossier.get("artifacts") or [], 1):
        if not art.get("ok", True) and art.get("error"):
            lines.append(f"## {i}. {art.get('type', 'source')} (failed)")
            lines.append(f"- error: {art['error']}")
            if art.get("hint"):
                lines.append(f"- hint: {art['hint']}")
            lines.append("")
            continue
        title = art.get("title") or art.get("url") or art.get("type", "artifact")
        lines.append(f"## {i}. {title}")
        if art.get("url"):
            lines.append(f"- url: {art['url']}")
        if art.get("authors"):
            lines.append(f"- authors: {', '.join(art['authors'])}")
        excerpt = art.get("excerpt") or art.get("summaryHint") or ""
        if excerpt:
            lines.append("")
            lines.append(textwrap.fill(excerpt[:4000], width=100))
        lines.append("")
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    if write_vault:
        vault = Path.home() / "Documents" / "OuterHeaven" / "03_Research"
        if not vault.is_dir():
            vault = ROOT / "docs" / "hive" / "research-dossiers"
        vault.mkdir(parents=True, exist_ok=True)
        (vault / md_path.name).write_text(md_path.read_text(encoding="utf-8"), encoding="utf-8")

    return path


def register_outcome(dossier: dict[str, Any], agent: str) -> dict[str, Any]:
    tool = ROOT / "scripts/hive/grok-hive-tool.py"
    if not tool.is_file():
        return {"ok": False, "error": "grok-hive-tool.py missing"}
    summary = (
        f"Web intel: {dossier.get('query')} — "
        f"{dossier.get('successCount', 0)}/{dossier.get('artifactCount', 0)} sources"
    )
    params = json.dumps(
        {
            "correlationId": dossier.get("correlationId"),
            "jobType": "research.web_intel",
            "status": "done",
            "summary": summary[:500],
        }
    )
    proc = subprocess.run(
        [sys.executable, str(tool), "--grok-agent", agent, "--tool", "scorpion_register_outcome", "--params", params],
        capture_output=True,
        text=True,
        timeout=120,
    )
    try:
        return json.loads(proc.stdout) if proc.stdout.strip() else {"ok": False, "stderr": proc.stderr}
    except json.JSONDecodeError:
        return {"ok": proc.returncode == 0, "stdout": proc.stdout, "stderr": proc.stderr}


def main() -> int:
    ap = argparse.ArgumentParser(description="Hive open-web research CLI")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_fetch = sub.add_parser("fetch", help="Fetch a single URL as text")
    p_fetch.add_argument("--url", required=True)

    p_yt = sub.add_parser("youtube", help="YouTube transcript + summary hint")
    p_yt.add_argument("--url", required=True)

    p_papers = sub.add_parser("papers", help="arXiv paper search")
    p_papers.add_argument("--query", required=True)
    p_papers.add_argument("--max", type=int, default=5)

    p_dossier = sub.add_parser("dossier", help="Multi-source intelligence dossier")
    p_dossier.add_argument("--query", required=True)
    p_dossier.add_argument(
        "--sources",
        default="web,youtube,papers,social",
        help="Comma list: web,youtube,papers,social",
    )
    p_dossier.add_argument("--write-vault", action="store_true")
    p_dossier.add_argument("--register", action="store_true")
    p_dossier.add_argument("--agent", default="Researcher")

    p_vsearch = sub.add_parser("video-search", help="Search and rank YouTube videos")
    p_vsearch.add_argument("--query", required=True)
    p_vsearch.add_argument("--max", type=int, default=5)

    p_packet = sub.add_parser("packet", help="Build JIT research packet")
    p_packet.add_argument("--question", required=True)
    p_packet.add_argument("--agent", required=True, help="Requesting agent e.g. Forge")
    p_packet.add_argument("--tier", default="standard", choices=["quick", "standard", "deep", "exceptional"])
    p_packet.add_argument("--sources", default="web,youtube,papers,social")
    p_packet.add_argument("--project-id")
    p_packet.add_argument("--dry-run", action="store_true")
    p_packet.add_argument("--register", action="store_true")

    p_social = sub.add_parser("social", help="Fetch a public social/post URL")
    p_social.add_argument("--url", required=True)

    args = ap.parse_args()
    result: dict[str, Any]

    if args.cmd == "fetch":
        result = fetch_url(args.url)
    elif args.cmd == "youtube":
        result = youtube_research(args.url)
    elif args.cmd == "papers":
        result = arxiv_search(args.query, max_results=args.max)
    elif args.cmd == "social":
        result = social_fetch(args.url)
    elif args.cmd == "video-search":
        videos = video_search(args.query, max_results=args.max)
        result = {"ok": bool(videos), "query": args.query, "videos": videos, "count": len(videos)}
    elif args.cmd == "packet":
        sources = [s.strip() for s in args.sources.split(",") if s.strip()]
        result = build_research_packet(
            args.question,
            args.agent,
            sources,
            tier=args.tier,
            project_id=args.project_id,
            dry_run=args.dry_run,
        )
        if args.register and result.get("ok") and not args.dry_run and result.get("packet"):
            import importlib.util

            _rp_spec = importlib.util.spec_from_file_location(
                "research_packet", Path(__file__).resolve().parent / "os" / "research-packet.py"
            )
            _rp = importlib.util.module_from_spec(_rp_spec)
            assert _rp_spec.loader is not None
            _rp_spec.loader.exec_module(_rp)
            result["register"] = _rp.register_mission(result["packet"], "Researcher")
    elif args.cmd == "dossier":
        sources = [s.strip() for s in args.sources.split(",") if s.strip()]
        result = build_dossier(args.query, sources)
        path = write_dossier(result, write_vault=args.write_vault)
        if path:
            result["cachePath"] = str(path)
            result["markdownPath"] = str(path.with_suffix(".md"))
        if args.register and result.get("ok"):
            result["register"] = register_outcome(result, args.agent)
    else:
        raise SystemExit(f"Unknown command: {args.cmd}")

    print(json.dumps(result, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
