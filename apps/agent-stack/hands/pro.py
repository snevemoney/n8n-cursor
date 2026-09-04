#!/usr/bin/env python3
"""Professional / Saylor skills as on-disk intelligence.

Filter matching slugs, then speak a brief from those files.
Never invent a course number or a skill that is not on disk.
Cap 1–3. Do not dump the catalog.
"""
from __future__ import annotations

import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
GROK_SKILLS = ROOT / "scripts/hive/grok-skills"
CURSOR_SKILLS = ROOT / ".cursor/skills"

SLUG_MARKS = (
    "biz",
    "grad-",
    "mktg",
    "finacct",
    "hrm-",
    "intro-biz",
    "intro-pm",
    "mgmt-polc",
    "mgracct",
    "mis-intro",
    "negotiations",
    "ob-three",
    "ops-manager",
    "entrepreneurial",
    "austrian",
    "bitcoin",
    "corpfin",
    "firm-strategy",
    "custsvc",
    "strat-",
    "bi-sources",
    "hard-money",
    "layered-money",
    "what-is-money",
    "undergrad-human",
    "saylor-bus",
    "strategic-it",
)
COURSE_ASK_RE = re.compile(r"\b(BUS|ECON|COMM|PRDV)\s*[- ]?(\d{3})\b", re.I)
COURSE_FIELD_RE = re.compile(
    r"(?im)^\*\*Course:\*\*\s*(BUS|ECON|COMM|PRDV)\s*[- ]?(\d{3})\b"
)
COURSE_TITLE_RE = re.compile(
    r"(?im)^#\s+.+\((BUS|ECON|COMM|PRDV)\s*[- ]?(\d{3})\)"
)
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9-]{2,}", re.I)
STOP = {
    "the", "and", "for", "you", "your", "our", "this", "that", "with",
    "from", "what", "whats", "how", "why", "when", "who", "about",
    "tell", "please", "just", "check", "checking", "brief", "briefing",
    "load", "use", "run", "skill", "skills", "professional", "university",
    "saylor", "course", "courses", "jarvis", "hey", "sir",
}
TOPIC_HINTS = {
    "marketing": ("mktg", "strat-mktg", "grad-mktg"),
    "finance": ("corpfin", "grad-finmgmt"),
    "accounting": ("finacct", "mgracct"),
    "ethics": ("bizethics", "grad-ethics"),
    "law": ("bizlaw",),
    "legal": ("bizlaw",),
    "hr": ("hrm-", "grad-people"),
    "staffing": ("hrm-",),
    "sales": ("grad-sales",),
    "operations": ("ops-manager", "grad-oscm"),
    "ops": ("ops-manager", "grad-oscm"),
    "strategy": ("firm-strategy", "grad-ethics-strategy", "strat-lead"),
    "statistics": ("bizstat",),
    "stats": ("bizstat",),
    "inference": ("bizstat",),
    "regression": ("bizstat",),
    "negotiation": ("negotiations",),
    "entrepreneur": ("entrepreneurial",),
    "venture": ("entrepreneurial",),
    "bitcoin": ("bitcoin-literacy", "what-is-money", "hard-money"),
    "austrian": ("austrian",),
    "management": ("mgmt-polc",),
    "communication": ("bizcomm", "undergrad-human"),
    "project": ("intro-pm", "grad-spm"),
    "intelligence": ("bi-sources", "grad-adv-bi", "grad-ddd"),
    "warehouse": ("bi-sources", "grad-data-mgmt", "grad-adv-bi"),
    "mis": ("mis-intro",),
    "business": ("intro-biz",),
}
MAX_SKILLS = 3
BRIEF_CAP = 280
FILE_CAP = 80_000


def is_professional_slug(slug: str) -> bool:
    name = (slug or "").strip().lower()
    if not name:
        return False
    return any(name.startswith(mark) or mark.rstrip("-") in name for mark in SLUG_MARKS)


def tokens(text: str) -> list[str]:
    out: list[str] = []
    for raw in TOKEN_RE.findall(text or ""):
        word = raw.lower().strip("-")
        if word in STOP or len(word) < 3:
            continue
        if word not in out:
            out.append(word)
    return out


def asked_courses(utterance: str) -> list[str]:
    found: list[str] = []
    for prefix, num in COURSE_ASK_RE.findall(utterance or ""):
        code = f"{prefix.upper()}{num}"
        if code not in found:
            found.append(code)
    return found


def course_from_text(text: str) -> str:
    """Only the declared Course field or title paren. Never the Never-list."""
    hit = COURSE_FIELD_RE.search(text or "")
    if hit:
        return f"{hit.group(1).upper()}{hit.group(2)}"
    hit = COURSE_TITLE_RE.search(text or "")
    if hit:
        return f"{hit.group(1).upper()}{hit.group(2)}"
    return ""


def section(text: str, heading: str) -> str:
    pat = re.compile(
        rf"(?ims)^##\s+{re.escape(heading)}\s*\n+(.*?)(?=^##\s+|\Z)"
    )
    hit = pat.search(text or "")
    if not hit:
        return ""
    body = re.sub(r"\s+", " ", hit.group(1)).strip()
    return body[:BRIEF_CAP]


def skill_path(slug: str, grok_dir: Path, cursor_dir: Path) -> Path | None:
    name = (slug or "").strip().lower()
    if not name:
        return None
    grok = grok_dir / f"{name}.md"
    if grok.is_file():
        return grok
    cursor = cursor_dir / name / "SKILL.md"
    if cursor.is_file():
        return cursor
    return None


def index_skills(
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> list[dict]:
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    rows: list[dict] = []
    seen: set[str] = set()

    def add(slug: str, path: Path) -> None:
        if slug in seen or not is_professional_slug(slug):
            return
        try:
            text = path.read_text(encoding="utf-8")[:FILE_CAP]
        except OSError:
            return
        seen.add(slug)
        when = section(text, "When")
        rows.append(
            {
                "slug": slug,
                "path": str(path),
                "course": course_from_text(text),
                "when": when,
                "text": text,
            }
        )

    if grok.is_dir():
        for path in sorted(grok.glob("*.md")):
            if path.name.upper() == "README.MD":
                continue
            add(path.stem.lower(), path)
    if cursor.is_dir():
        for path in sorted(cursor.glob("*/SKILL.md")):
            add(path.parent.name.lower(), path)
    return rows


def _hint_score(slug: str, words: list[str]) -> int:
    score = 0
    for word in words:
        for prefix in TOPIC_HINTS.get(word, ()):
            if slug.startswith(prefix) or prefix.rstrip("-") in slug:
                score += 20
    return score


def match_skills(
    utterance: str,
    catalog: list[dict] | None = None,
    *,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
    limit: int = MAX_SKILLS,
) -> list[dict]:
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    rows = catalog if catalog is not None else index_skills(grok, cursor)

    def exists(row: dict) -> bool:
        slug = str(row.get("slug") or "")
        path = Path(str(row.get("path") or ""))
        if path.is_file():
            return is_professional_slug(slug)
        return skill_path(slug, grok, cursor) is not None and is_professional_slug(slug)

    codes = asked_courses(utterance)
    words = tokens(utterance)
    scored: list[tuple[int, dict]] = []
    for row in rows:
        slug = str(row.get("slug") or "")
        if not exists(row):
            continue
        score = 0
        course = str(row.get("course") or "")
        if codes and course and course in codes:
            score += 100
        slug_bits = set(tokens(slug.replace("-", " ")))
        score += 10 * len(slug_bits.intersection(words))
        when_bits = set(tokens(str(row.get("when") or "")))
        score += 3 * len(when_bits.intersection(words))
        score += _hint_score(slug, words)
        if score:
            scored.append((score, row))
    scored.sort(key=lambda item: (-item[0], item[1].get("slug") or ""))
    picked: list[dict] = []
    seen: set[str] = set()
    for _score, row in scored:
        slug = str(row.get("slug") or "")
        if slug in seen:
            continue
        seen.add(slug)
        picked.append(row)
        if len(picked) >= max(1, min(limit, MAX_SKILLS)):
            break
    if codes:
        exact = [row for row in picked if str(row.get("course") or "") in codes]
        if exact:
            return exact[:limit]
    return picked


def brief_from_row(row: dict) -> str:
    slug = str(row.get("slug") or "")
    course = str(row.get("course") or "")
    when = str(row.get("when") or "").strip()
    steps = section(str(row.get("text") or ""), "Steps")
    label = f"{slug} ({course})" if course else slug
    useful = when or steps
    if not useful:
        useful = "On disk. No When/Steps section to speak."
    return f"{label}: {useful[:BRIEF_CAP]}"


def brief(
    utterance: str,
    *,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
    catalog: list[dict] | None = None,
) -> dict:
    """Filter slugs, then speak. UNKNOWN if the named course is not on disk."""
    rows = catalog if catalog is not None else index_skills(grok_dir, cursor_dir)
    codes = asked_courses(utterance)
    missing = [code for code in codes if not any(str(r.get("course") or "") == code for r in rows)]
    matched = match_skills(
        utterance, rows, grok_dir=grok_dir, cursor_dir=cursor_dir
    )
    slugs = [str(r.get("slug") or "") for r in matched if r.get("slug")]
    invented = [s for s in slugs if not any(str(r.get("slug") or "") == s for r in rows)]
    if invented:
        slugs = [s for s in slugs if s not in invented]
        matched = [r for r in matched if str(r.get("slug") or "") not in invented]
    cites = [{"slug": r.get("slug"), "course": r.get("course") or None, "path": r.get("path")} for r in matched]
    if missing and not matched:
        return {
            "ok": False,
            "unknown": True,
            "wire": "pro",
            "slugs": [],
            "courses": missing,
            "cites": [],
            "spoken": (
                f"UNKNOWN. {missing[0]} is not on disk. "
                "I will not invent a course. Name a real professional skill."
            ),
        }
    if missing and matched:
        closest = "; ".join(brief_from_row(r) for r in matched)
        return {
            "ok": True,
            "unknown": True,
            "wire": "pro",
            "slugs": slugs,
            "courses": [str(r.get("course") or "") for r in matched if r.get("course")],
            "cites": cites,
            "spoken": (
                f"UNKNOWN. {missing[0]} is not on disk. Closest on-disk: {closest}"
            ),
        }
    if not matched:
        return {
            "ok": False,
            "unknown": True,
            "wire": "pro",
            "slugs": [],
            "courses": [],
            "cites": [],
            "spoken": (
                "UNKNOWN. No matching professional skill on disk. "
                "Name the school — marketing, finance, ops, ethics — and I will pull those files."
            ),
        }
    parts = [brief_from_row(r) for r in matched]
    lead = "From " + ", ".join(slugs) + "."
    return {
        "ok": True,
        "unknown": False,
        "wire": "pro",
        "slugs": slugs,
        "courses": [str(r.get("course") or "") for r in matched if r.get("course")],
        "cites": cites,
        "spoken": f"{lead} " + " ".join(parts),
    }
