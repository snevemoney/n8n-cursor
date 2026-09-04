#!/usr/bin/env python3
"""Named local hands: web search, Watch Later, news-from-disk, make-skill route.

Safari only. Real sources only. Never invent titles, headlines, or URLs.
No Chrome. No Google API. No new vendor.
"""
from __future__ import annotations

import importlib.util
import os
import re
import time
from pathlib import Path
from urllib.parse import parse_qs, quote_plus, unquote, urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SKILLS_DIR = ROOT / "scripts/hive/grok-skills"
DDG_HTML = "https://html.duckduckgo.com/html/"
WATCH_LATER_URL = "https://www.youtube.com/playlist?list=WL"
SEARCH_STRIP = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?"
    r"(?:please\s+)?"
    r"(?:search(?:\s+(?:the|on))?\s+(?:web|internet|online)|web search|google|look up)"
    r"(?:\s+(?:the\s+)?(?:web|internet|online))?"
    r"(?:\s+for)?\s*",
    re.I,
)
MAKE_KIND_RE = re.compile(
    r"\b(?:make|generate|create|render)\s+(?:me\s+)?(?:(?:a|an|new)\s+)*(image|video|remotion|presentation)\b",
    re.I,
)
MAKE_SLUG = {
    "image": "image-agent-hitl",
    "video": "motion-grade-pipeline",
    "remotion": "wealth-daily-show",
    "presentation": "script-beat-motion",
}
LOGIN_MARKS = ("sign in", "signin", "accounts.google", "service=youtube")


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


SEE = _load("agent_stack_see_named", HERE / "see.py")
RETRIEVE = _load("agent_stack_retrieve_named", HERE.parent / "memory" / "retrieve.py")


def skill_on_disk(slug: str) -> bool:
    name = (slug or "").strip().lower()
    if not name:
        return False
    return (SKILLS_DIR / f"{name}.md").is_file()


def clean_search_query(utterance: str) -> str:
    text = (utterance or "").strip()
    text = SEARCH_STRIP.sub("", text)
    text = re.sub(r"\s+on (?:the )?(?:web|internet)\s*$", "", text, flags=re.I)
    return text.strip(" .?!")[:160]


def unwrap_url(href: str) -> str:
    """Keep only a real http(s) destination. Drop DuckDuckGo wrappers. Never invent."""
    raw = (href or "").strip().rstrip(".,)")
    if not raw:
        return ""
    parsed = urlparse(raw)
    if "duckduckgo.com" in (parsed.netloc or "").lower() and ("uddg" in parsed.query or "/l/" in (parsed.path or "")):
        qs = parse_qs(parsed.query)
        if qs.get("uddg"):
            raw = unquote(qs["uddg"][0])
            parsed = urlparse(raw)
    if parsed.scheme not in {"http", "https"}:
        return ""
    host = (parsed.netloc or "").lower()
    if host.endswith("duckduckgo.com") or "duckduckgo.com" in host:
        return ""
    return raw


def parse_link_lines(raw: str) -> list[dict]:
    """Parse `title | url` lines from Safari JS. Skip anything that is not a real http(s) URL."""
    cites: list[dict] = []
    seen: set[str] = set()
    for line in (raw or "").splitlines():
        title, sep, href = line.partition("|")
        if not sep:
            href = line
            title = ""
        url = unwrap_url(href.strip() or title.strip())
        if not url or url in seen:
            continue
        seen.add(url)
        label = title.strip() or url
        cites.append({"title": label[:80], "url": url})
        if len(cites) >= 6:
            break
    return cites


def _looks_logged_out(front: dict) -> bool:
    blob = f"{front.get('title') or ''} {front.get('url') or ''}".lower()
    return any(mark in blob for mark in LOGIN_MARKS)


def make_route(utterance: str) -> dict:
    """Map make-image/video/remotion to an existing skill slug. No new vendor."""
    hit = MAKE_KIND_RE.search(utterance or "")
    kind = (hit.group(1) if hit else "").lower()
    if not kind:
        return {
            "ok": False,
            "unknown": True,
            "wire": "make",
            "slug": "",
            "kind": "",
            "spoken": "UNKNOWN. Say make an image, video, remotion, or presentation. I will not invent a vendor.",
        }
    slug = MAKE_SLUG.get(kind) or ""
    exists = skill_on_disk(slug)
    if kind == "remotion":
        spoken = (
            "No remotion skill exists on disk. Closest is wealth-daily-show, which uses the Remotion engine. "
            f"{'Say use skill wealth-daily-show. ' if exists else 'That slug is also missing. '}"
            "Publish stays you."
        )
        return {
            "ok": exists,
            "unknown": not exists,
            "wire": "make",
            "slug": slug if exists else "",
            "kind": kind,
            "spoken": spoken,
        }
    if kind == "presentation":
        extra = " No remotion skill exists; script-beat-motion is the closest on-disk presentation skill."
    elif kind == "video":
        extra = " I will not generate video here. Closest skills are motion-grade-pipeline and higgsfield-ae-vectors."
    else:
        extra = " I will not generate an image here."
    if not exists:
        return {
            "ok": False,
            "unknown": True,
            "wire": "make",
            "slug": "",
            "kind": kind,
            "spoken": f"UNKNOWN. No {kind} skill on disk. I will not invent a slug.{extra} Publish stays you.",
        }
    return {
        "ok": True,
        "unknown": False,
        "wire": "make",
        "slug": slug,
        "kind": kind,
        "spoken": f"{extra.strip()} Say use skill {slug}. Publish stays you.",
    }


def web_search(
    utterance: str,
    *,
    hive: Path | None = None,
    open_fn=None,
    links_fn=None,
    front_fn=None,
    sleep_fn=None,
) -> dict:
    """Open DuckDuckGo HTML in Safari, cite real links, open the top http(s) result."""
    if os.environ.get("AGENT_STACK_HANDS_DRY") == "1":
        return {
            "ok": False,
            "unknown": True,
            "wire": "search",
            "cites": [],
            "spoken": "UNKNOWN. Web search is dry. I will not invent URLs.",
        }
    query = clean_search_query(utterance)
    if len(query) < 2:
        return {
            "ok": False,
            "unknown": True,
            "wire": "search",
            "cites": [],
            "spoken": "UNKNOWN. Say what to search the web for.",
        }
    if SEE is None and (open_fn is None or links_fn is None):
        return {
            "ok": False,
            "unknown": True,
            "wire": "search",
            "cites": [],
            "spoken": "UNKNOWN. Safari search wire is not loaded.",
        }
    open_fn = open_fn or SEE.safari_open
    links_fn = links_fn or SEE.safari_extract_links
    front_fn = front_fn or SEE.safari_front
    sleep_fn = sleep_fn or time.sleep
    url = f"{DDG_HTML}?q={quote_plus(query)}"
    opened = open_fn(url)
    if not opened.get("ok"):
        return {
            "ok": False,
            "unknown": True,
            "wire": "search",
            "cites": [],
            "spoken": str(opened.get("spoken") or "UNKNOWN. Safari could not open DuckDuckGo HTML."),
        }
    try:
        sleep_fn(1.2)
    except (TypeError, ValueError):
        pass
    listed = links_fn()
    raw = str(listed.get("raw") or "")
    cites = parse_link_lines(raw)
    if not cites:
        front = front_fn() if front_fn is not None else {}
        where = str((front or {}).get("url") or url)
        missing = "Safari JavaScript" if listed.get("unknown") or not listed.get("ok") else "result links"
        return {
            "ok": False,
            "unknown": True,
            "wire": "search",
            "cites": [],
            "opened": url,
            "spoken": (
                f"UNKNOWN. Search page returned no real links ({missing} dark). "
                f"Safari is on {where}. I will not invent URLs."
            ),
        }
    top = cites[0]["url"]
    follow = open_fn(top)
    bits = [f"{row['title']} — {row['url']}" for row in cites[:3]]
    spoken = "Sources: " + "; ".join(bits) + "."
    if follow.get("ok"):
        spoken += f" Opened the first in Safari. {top}"
    else:
        spoken += " Top link is listed; Safari follow-up open failed. I will not invent another URL."
    if len(spoken) > 420:
        spoken = spoken[:417].rsplit(" ", 1)[0] + "…"
    return {
        "ok": True,
        "unknown": False,
        "wire": "search",
        "cites": cites,
        "opened": top,
        "query": query,
        "spoken": spoken,
    }


def watch_later(
    *,
    hive: Path,
    open_fn=None,
    titles_fn=None,
    front_fn=None,
    grab_fn=None,
    sleep_fn=None,
) -> dict:
    """Open YouTube Watch Later in logged-in Safari. List what is visible. One grab."""
    if os.environ.get("AGENT_STACK_HANDS_DRY") == "1":
        return {
            "ok": False,
            "unknown": True,
            "wire": "watch_later",
            "titles": [],
            "spoken": "UNKNOWN. Watch Later is dry. I will not invent video titles.",
        }
    if SEE is None and (open_fn is None or titles_fn is None):
        return {
            "ok": False,
            "unknown": True,
            "wire": "watch_later",
            "titles": [],
            "spoken": "UNKNOWN. Safari Watch Later wire is not loaded.",
        }
    open_fn = open_fn or SEE.safari_open
    titles_fn = titles_fn or SEE.safari_visible_titles
    front_fn = front_fn or SEE.safari_front
    grab_fn = grab_fn or SEE.grab_screen
    sleep_fn = sleep_fn or time.sleep
    opened = open_fn(WATCH_LATER_URL)
    if not opened.get("ok"):
        return {
            "ok": False,
            "unknown": True,
            "wire": "watch_later",
            "titles": [],
            "spoken": str(opened.get("spoken") or "UNKNOWN. Safari could not open Watch Later."),
        }
    try:
        sleep_fn(1.4)
    except (TypeError, ValueError):
        pass
    front = front_fn() if front_fn is not None else {}
    if _looks_logged_out(front or {}):
        return {
            "ok": False,
            "unknown": True,
            "wire": "watch_later",
            "titles": [],
            "spoken": "UNKNOWN. Watch Later looks signed out in Safari. I will not invent video titles.",
        }
    listed = titles_fn()
    titles = listed.get("titles") if isinstance(listed.get("titles"), list) else []
    titles = [str(t).strip() for t in titles if str(t).strip()][:8]
    grab = grab_fn(hive) if grab_fn is not None else {}
    grab_bit = ""
    if grab.get("ok") and grab.get("path"):
        grab_bit = f" One screen grab at {grab['path']}."
    elif grab:
        grab_bit = " " + str(grab.get("spoken") or "UNKNOWN. Screen grab is dark.")
    next_bite = (
        " Full watch.json frames plus transcript is the next bite — "
        "cursor-video-watch via Safari is not wired."
    )
    if not titles:
        return {
            "ok": False,
            "unknown": True,
            "wire": "watch_later",
            "titles": [],
            "grab": grab,
            "spoken": (
                "UNKNOWN. Watch Later listed no visible titles. "
                "Page may be dark, not logged in, or empty. I will not invent video titles."
                + grab_bit
                + next_bite
            ),
        }
    spoken = "Watch Later in Safari. Visible: " + "; ".join(titles[:5]) + "." + grab_bit + next_bite
    if len(spoken) > 420:
        spoken = spoken[:417].rsplit(" ", 1)[0] + "…"
    return {
        "ok": True,
        "unknown": False,
        "wire": "watch_later",
        "titles": titles,
        "grab": grab,
        "spoken": spoken,
    }


def news_from_disk(utterance: str, retrieve_roots: list[Path] | None = None) -> dict:
    if RETRIEVE is None:
        return {
            "ok": False,
            "unknown": True,
            "wire": "news",
            "cites": [],
            "spoken": "UNKNOWN. News retrieve wire is not loaded. I will not invent headlines.",
        }
    return RETRIEVE.news_signals(utterance, retrieve_roots)
