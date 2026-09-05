#!/usr/bin/env python3
"""Professional / Saylor skills as on-disk intelligence.

The brain indexes the full catalog claim (164) plus every named row.
Named topic or course: rank from that index, then cap 1–3.
Whole-shelf ask: grouped one-liners from the complete index. Not 164 manuals.
When a file exists, retrieve When/Steps. When missing, UNKNOWN — do not invent.
"""
from __future__ import annotations

import importlib.util
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
GROK_SKILLS = ROOT / "scripts/hive/grok-skills"
CURSOR_SKILLS = ROOT / ".cursor/skills"

_IDX_PATH = HERE / "school_index.py"
_spec = importlib.util.spec_from_file_location("agent_stack_school_index", _IDX_PATH)
if _spec is None or _spec.loader is None:
    raise RuntimeError(f"cannot load {_IDX_PATH}")
school_index = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(school_index)

COURSE_ASK_RE = re.compile(
    r"\b(BUS|ECON|COMM|PRDV|CS|ENGL|ARTH|PHIL|MA|POLSC)\s*[- ]?(\d{3})\b",
    re.I,
)
ESL_ASK_RE = re.compile(r"\besl(?:\s*hub)?\b", re.I)
TOKEN_RE = school_index.TOKEN_RE
STOP = school_index.STOP
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
    "comms": ("bizcomm",),
    "project": ("intro-pm", "grad-spm"),
    "pm": ("intro-pm", "grad-spm"),
    "intelligence": ("bi-sources", "grad-adv-bi", "grad-ddd"),
    "warehouse": ("bi-sources", "grad-data-mgmt", "grad-adv-bi"),
    "mis": ("mis-intro",),
    "business": ("intro-biz",),
}
SHELF_RE = re.compile(
    r"\b("
    r"(?:the\s+)?(?:whole|entire)\s+shelf|"
    r"all\s+(?:the\s+)?(?:professional|university|school|saylor)\s+skills?|"
    r"all\s+164|"
    r"all\s+school\s+skills|"
    r"every\s+(?:professional|university|school|saylor)\s+skill"
    r")\b",
    re.I,
)
SCHOOL_WORD_RE = re.compile(
    r"\b(school|university|saylor|catalog|shelf|course|courses)\b",
    re.I,
)
FAMILY_LABEL = {
    "BUS": "Business",
    "ECON": "Economics",
    "COMM": "Communication",
    "PRDV": "Professional development",
    "CS": "Computer science",
    "ARTH": "Art history",
    "ENGL": "English",
    "PHIL": "Philosophy",
    "MA": "Math",
    "POLSC": "Political science",
    "ESL": "ESL",
}
MAX_SKILLS = 3
BRIEF_CAP = 280
SPEAK_CAP = 180
FILE_CAP = 80_000


def is_professional_slug(
    slug: str,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> bool:
    return school_index.is_school_slug(slug, grok_dir=grok_dir, cursor_dir=cursor_dir)


def tokens(text: str) -> list[str]:
    return school_index.tokens(text)


def asked_courses(utterance: str) -> list[str]:
    found: list[str] = []
    for prefix, num in COURSE_ASK_RE.findall(utterance or ""):
        code = f"{prefix.upper()}{num}"
        if code not in found:
            found.append(code)
    if ESL_ASK_RE.search(utterance or "") and "ESLHub" not in found:
        found.append("ESLHub")
    return found


def course_from_text(text: str) -> str:
    return school_index.course_from_text(text)


def section(text: str, heading: str) -> str:
    return school_index.section(text, heading, BRIEF_CAP)


def skill_path(slug: str, grok_dir: Path, cursor_dir: Path) -> Path | None:
    return school_index.skill_path(slug, grok_dir, cursor_dir)


def index_skills(
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> list[dict]:
    """On-disk Course-tagged files only."""
    return school_index.scan(grok_dir, cursor_dir)


def catalog(
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> list[dict]:
    """Full named index: files + missing catalog rows."""
    return school_index.catalog_rows(grok_dir, cursor_dir)


def is_shelf_ask(utterance: str) -> bool:
    return bool(SHELF_RE.search(utterance or ""))


def is_school_query(utterance: str) -> bool:
    text = utterance or ""
    if is_shelf_ask(text):
        return True
    if asked_courses(text):
        return True
    words = set(tokens(text))
    if words & set(TOPIC_HINTS):
        return True
    return bool(SCHOOL_WORD_RE.search(text))


def _hint_score(slug: str, words: list[str]) -> int:
    score = 0
    for word in words:
        for prefix in TOPIC_HINTS.get(word, ()):
            if slug.startswith(prefix) or prefix.rstrip("-") in slug:
                score += 20
    return score


def _exists(row: dict, grok: Path, cursor: Path) -> bool:
    if row.get("missing"):
        return False
    slug = str(row.get("slug") or row.get("id") or "")
    raw_path = str(row.get("abs_path") or row.get("path") or "")
    path = Path(raw_path) if raw_path else None
    if path is not None and path.is_file():
        return is_professional_slug(slug, grok, cursor)
    return skill_path(slug, grok, cursor) is not None and is_professional_slug(
        slug, grok, cursor
    )


def match_skills(
    utterance: str,
    catalog_rows: list[dict] | None = None,
    *,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
    limit: int | None = None,
) -> list[dict]:
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    rows = catalog_rows if catalog_rows is not None else catalog(grok, cursor)
    if is_shelf_ask(utterance):
        return rows

    live = [row for row in rows if _exists(row, grok, cursor)]
    cap = MAX_SKILLS if limit is None else max(1, min(limit, MAX_SKILLS))
    codes = asked_courses(utterance)
    if codes:
        exact = [row for row in rows if str(row.get("course") or "") in codes]
        if not exact:
            return []
        # Named missing course: return the missing row so brief can UNKNOWN it.
        if all(r.get("missing") or not _exists(r, grok, cursor) for r in exact):
            return exact[:cap]
        live = [r for r in exact if _exists(r, grok, cursor)]
    words = tokens(utterance)
    scored: list[tuple[int, dict]] = []
    for row in live:
        slug = str(row.get("slug") or "")
        score = 0
        course = str(row.get("course") or "")
        if codes and course and course in codes:
            score += 100
        slug_bits = set(tokens(slug.replace("-", " ")))
        score += 10 * len(slug_bits.intersection(words))
        when_bits = set(tokens(str(row.get("when") or "")))
        score += 3 * len(when_bits.intersection(words))
        alias_bits = set()
        for alias in row.get("aliases") or []:
            alias_bits.update(tokens(str(alias).replace("-", " ")))
        score += 4 * len(alias_bits.intersection(words))
        topic_bits = set(str(t).lower() for t in (row.get("topics") or []))
        score += 4 * len(topic_bits.intersection(words))
        score += _hint_score(slug, words)
        if score:
            scored.append((score, row))
    scored.sort(key=lambda item: (-item[0], item[1].get("slug") or ""))
    picked: list[dict] = []
    seen: set[str] = set()
    for _score, row in scored:
        slug = str(row.get("slug") or row.get("id") or "")
        if slug in seen:
            continue
        seen.add(slug)
        picked.append(row)
        if len(picked) >= cap:
            break
    if codes:
        exact = [row for row in picked if str(row.get("course") or "") in codes]
        if exact:
            return exact[:cap]
    return picked


def brief_from_row(row: dict) -> str:
    slug = str(row.get("slug") or "")
    course = str(row.get("course") or "")
    if row.get("missing"):
        label = course or slug or str(row.get("id") or "course")
        return f"UNKNOWN. {label} is enrolled/remaining, not a minted SKILL.md."
    when = str(row.get("when") or "").strip()
    steps = section(str(row.get("text") or ""), "Steps")
    label = f"{slug} ({course})" if course else slug
    useful = when or steps
    if not useful:
        useful = "On disk. No When/Steps section to speak."
    return f"{label}: {useful[:BRIEF_CAP]}"


def _tts_brief(text: str, cap: int = SPEAK_CAP) -> str:
    """One mouth sentence. Full When / skill list stays on `brief`."""
    body = re.sub(r"\s+", " ", (text or "").strip())
    if not body:
        return ""
    body = re.sub(r"^[a-z0-9-]+\s+\(([A-Z0-9]+)\):\s+", r"\1: ", body, count=1)
    body = re.sub(r"^[a-z0-9-]+:\s+", "", body, count=1)
    match = re.search(r"[.!?]", body)
    if match and match.end() <= cap + 24:
        body = body[: match.end()].strip()
    if len(body) > cap:
        body = body[: cap - 1].rsplit(" ", 1)[0] + "…"
    return body


def _family(course: str) -> str:
    if (course or "") == "ESLHub":
        return "ESL"
    hit = re.match(r"([A-Z]+)", course or "")
    return hit.group(1) if hit else "OTHER"


def _group_topics(rows: list[dict]) -> list[str]:
    labels: list[str] = []
    for row in rows:
        slug = str(row.get("slug") or "")
        hit = ""
        for topic, prefixes in TOPIC_HINTS.items():
            if any(slug.startswith(prefix) or prefix.rstrip("-") in slug for prefix in prefixes):
                hit = topic
                break
        if not hit:
            when = str(row.get("when") or "").strip()
            hit = (row.get("course") or when.split(",")[0][:72] or slug) if when or row.get("course") else slug
            if row.get("missing") and row.get("course"):
                hit = str(row.get("course"))
        if hit and hit not in labels:
            labels.append(str(hit))
    return labels


def shelf_spoken(rows: list[dict], claim: int) -> str:
    live = [r for r in rows if not r.get("missing")]
    miss = [r for r in rows if r.get("missing")]
    courses = {str(r.get("course") or "") for r in rows if r.get("course")}
    unnamed = max(0, claim - len(courses))
    lead = (
        f"School shelf: {claim} claimed, {len(live)} on disk, "
        f"{len(miss)} named missing, {unnamed} unnamed enrolled."
    )
    groups: dict[str, list[dict]] = {}
    for row in live:
        groups.setdefault(_family(str(row.get("course") or "")), []).append(row)
    parts: list[str] = []
    for key in sorted(groups):
        label = FAMILY_LABEL.get(key, key.title())
        topics = _group_topics(groups[key])
        sample = ", ".join(topics[:8]) if topics else "on disk"
        parts.append(f"{label} ({len(groups[key])}): {sample}.")
    if miss:
        names = [str(r.get("course") or r.get("id") or "") for r in miss if r.get("course") or r.get("id")]
        shown = ", ".join(names[:12])
        extra = f" +{len(names) - 12}" if len(names) > 12 else ""
        parts.append(f"Named missing ({len(miss)}): {shown}{extra}.")
    return f"{lead} " + " ".join(parts)


def _cites(rows: list[dict]) -> list[dict]:
    out: list[dict] = []
    for row in rows:
        out.append(
            {
                "slug": row.get("slug") or row.get("id"),
                "course": row.get("course") or None,
                "path": row.get("path"),
                "aliases": list(row.get("aliases") or []),
                "topics": list(row.get("topics") or []),
                "when": row.get("when") or "",
                "missing": bool(row.get("missing")),
            }
        )
    return out


def brief(
    utterance: str,
    *,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
    catalog: list[dict] | None = None,
) -> dict:
    """Filter from the full school index, then speak. UNKNOWN if invented or missing."""
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    # Isolated test disks: stay on the passed scan unless caller handed a catalog.
    if catalog is not None:
        rows = catalog
    elif grok_dir is not None or cursor_dir is not None:
        rows = index_skills(grok, cursor)
    else:
        rows = school_index.catalog_rows(grok, cursor)
    live = [row for row in rows if _exists(row, grok, cursor)]
    claim = school_index.enrolled_catalog_claim()
    if is_shelf_ask(utterance):
        slugs = [str(r.get("slug") or "") for r in live if r.get("slug")]
        spoken = shelf_spoken(rows, claim) if rows else "UNKNOWN. No school skills on disk."
        if "## When" in spoken or "## Steps" in spoken:
            spoken = re.sub(r"##\s+(When|Steps)\b", "", spoken)
        return {
            "ok": bool(rows),
            "unknown": not rows,
            "shelf": True,
            "wire": "pro",
            "slugs": slugs,
            "courses": [str(r.get("course") or "") for r in rows if r.get("course")],
            "cites": _cites(rows),
            "on_disk": len(live),
            "missing": sum(1 for r in rows if r.get("missing")),
            "enrolled_catalog_claim": claim,
            "spoken": spoken,
        }

    codes = asked_courses(utterance)
    missing_codes = [
        code
        for code in codes
        if not any(str(r.get("course") or "") == code and _exists(r, grok, cursor) for r in rows)
    ]
    named_missing = [
        row
        for row in rows
        if row.get("missing") and str(row.get("course") or "") in codes
    ]
    matched = match_skills(
        utterance, rows, grok_dir=grok, cursor_dir=cursor
    )
    live_matched = [r for r in matched if _exists(r, grok, cursor)]
    slugs = [str(r.get("slug") or "") for r in live_matched if r.get("slug")]
    invented = [s for s in slugs if not any(str(r.get("slug") or "") == s for r in live)]
    if invented:
        slugs = [s for s in slugs if s not in invented]
        live_matched = [r for r in live_matched if str(r.get("slug") or "") not in invented]
    cites = _cites(live_matched or matched)
    if missing_codes and not live_matched:
        label = missing_codes[0]
        if named_missing:
            spoken = (
                f"UNKNOWN. {label} is enrolled/remaining, not a minted SKILL.md. "
                "I will not invent When or Steps."
            )
        else:
            spoken = (
                f"UNKNOWN. {label} is not on disk. "
                "I will not invent a course. Name a real professional skill."
            )
        return {
            "ok": False,
            "unknown": True,
            "shelf": False,
            "wire": "pro",
            "slugs": [],
            "courses": missing_codes,
            "cites": _cites(named_missing),
            "spoken": spoken,
        }
    if missing_codes and live_matched:
        closest = "; ".join(brief_from_row(r) for r in live_matched)
        return {
            "ok": True,
            "unknown": True,
            "shelf": False,
            "wire": "pro",
            "slugs": slugs,
            "courses": [str(r.get("course") or "") for r in live_matched if r.get("course")],
            "cites": cites,
            "brief": closest,
            "spoken": (
                f"UNKNOWN. {missing_codes[0]} is not on disk. "
                f"Closest on-disk: {_tts_brief(closest)}"
            ),
        }
    if not live_matched:
        return {
            "ok": False,
            "unknown": True,
            "shelf": False,
            "wire": "pro",
            "slugs": [],
            "courses": [],
            "cites": [],
            "spoken": (
                "UNKNOWN. No matching professional skill on disk. "
                "Name the school — marketing, finance, ops, ethics — and I will pull those files."
            ),
        }
    pack = " ".join(brief_from_row(r) for r in live_matched)
    return {
        "ok": True,
        "unknown": False,
        "shelf": False,
        "wire": "pro",
        "slugs": slugs,
        "courses": [str(r.get("course") or "") for r in live_matched if r.get("course")],
        "cites": cites,
        "brief": pack,
        "spoken": _tts_brief(brief_from_row(live_matched[0])),
    }


def school_brief(utterance: str = "") -> dict:
    """Thin one-call shelf retrieve for the pipeline. Not a new tool."""
    text = (utterance or "").strip() or "the whole shelf"
    return brief(text)


def pack_block() -> str:
    return school_index.pack_lines()


def main() -> int:
    import argparse
    import json

    ap = argparse.ArgumentParser(description="School-skill retrieve")
    ap.add_argument("--write-index", action="store_true")
    ap.add_argument("--count", action="store_true")
    ap.add_argument("utterance", nargs="*", help="Optional ask to brief")
    args = ap.parse_args()
    if args.write_index or args.count:
        data = school_index.write_snapshot() if args.write_index else school_index.build_snapshot()
        print(
            json.dumps(
                {
                    "on_disk": data["on_disk"],
                    "named": data["named"],
                    "missing": data["missing"],
                    "enrolled_catalog_claim": data["enrolled_catalog_claim"],
                    "harvest_table_count": data["harvest_table_count"],
                    "unnamed_enrolled_delta": data["unnamed_enrolled_delta"],
                },
                indent=2,
            )
        )
        if not args.utterance:
            return 0
    if args.utterance:
        got = brief(" ".join(args.utterance))
        print(got.get("spoken") or "UNKNOWN")
        return 0 if got.get("ok") else 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
