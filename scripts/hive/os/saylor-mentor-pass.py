#!/usr/bin/env python3
"""Live mentor: one teaching beat then work. End emit PUT-IN-SYSTEM. No catalog dump."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MAP = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-leverage-map.md"
SPEAK = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-trigger-map.md"
CATALOG = ROOT / "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md"
BEATS = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-live-beats.md"
LANES = ("hive-os", "agency")
CAP = 3
COURSE_RE = re.compile(r"\b(?:BUS|COMM|ECON|PRDV|CS|ARTH|ENGL|PHIL|MA|POLSC)\d+\b")
# A token that shows up in this many catalog "use when" lines is not a reason to load a course.
DISTINCTIVE_DF_MAX = 3
LIFECYCLE_ORDER = (
    "RECOVERED",
    "CANDIDATE",
    "EXPERIMENT_REQUIRED",
    "LOCALLY_SUPPORTED",
    "VERIFIED",
    "ADOPTED",
)
NO_METHOD = "NO_METHOD_NEEDED"

# sitting keywords → slug (first-match order; cap 3)
# Bare "os" and bare "project" are not triggers. "where data lives" is the data-mgmt course,
# not the five-components course. No course is removed from the catalog.
HINTS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\b(lane|what is this business|why two)\b", re.I), "intro-biz-survey-checklists"),
    (re.compile(r"\b(venture|toy|viable|idea)\b", re.I), "entrepreneurial-venture-viability-plan-team-market-finance"),
    (re.compile(r"\b(plan this cycle|firm plan|strategy)\b", re.I), "firm-strategy-process-advantage-execute"),
    (re.compile(r"\b(lead vs|manage the hive|17 dm)\b", re.I), "strat-lead-mgmt-checklists"),
    (re.compile(r"\b(copy|who/why|tone|email|report)\b", re.I), "bizcomm-audience-purpose-channel-tone-feedback"),
    (re.compile(r"\b(inbox|customer|complaint|cs script)\b", re.I), "custsvc-impression-needs-channel-complaint-experience"),
    (re.compile(r"\b(kpi|baseline|did (this|it) (work|move)|number mean)\b", re.I), "bizstat-describe-sample-infer-regress-checklists"),
    (re.compile(r"\b(dashboard|warehouse|which numbers)\b", re.I), "bi-sources-warehouse-present-model-privacy"),
    (re.compile(r"\b(people, process|five component|what systems)\b", re.I), "mis-intro-five-components"),
    (re.compile(r"\b(fund|refuse|keep or kill|saas|spend)\b", re.I), "strategic-it-when-whether-then-strategy"),
    (re.compile(r"\b(done-check|has an end|this is a project)\b", re.I), "intro-pm-process-groups-people-checklists"),
    (re.compile(r"\b(offer|who (the site|it) is for|stp|ads vs)\b", re.I), "mktg-value-stp-mix-plan-checklists"),
    (re.compile(r"\b(spin|sales process|loyalty|close)\b", re.I), "grad-sales-process-spin-loyalty-brand"),
    (re.compile(r"\b(ethical|hitl|send this)\b", re.I), "bizethics-integrity-stakeholder-csr-dilemma"),
    (re.compile(r"\b(legal|allowed)\b", re.I), "bizlaw-sources-forum-wrongs-assets-entity-checklists"),
    (re.compile(r"\b(put in the system|where data lives|which engine)\b", re.I), "grad-data-mgmt-dbms-sql-plan-warehouse"),
]


def _parse_map_rows(lane: str) -> list[dict[str, str]]:
    if not MAP.is_file():
        return []
    text = MAP.read_text(encoding="utf-8")
    heading = "## Hive-os" if lane == "hive-os" else "## Agency"
    m = re.search(rf"^{re.escape(heading)}.*$", text, re.MULTILINE)
    if not m:
        return []
    rest = text[m.end() :]
    nxt = re.search(r"^## ", rest, re.MULTILINE)
    body = rest[: nxt.start()] if nxt else rest
    rows: list[dict[str, str]] = []
    for line in body.splitlines():
        if not line.startswith("| ") or line.startswith("| You") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 4:
            continue
        rows.append(
            {
                "said": parts[0],
                "skill": parts[1],
                "put": parts[2],
                "leverage": parts[3],
            }
        )
    return rows


def lifecycle_from_evidence(
    *,
    retrieved: bool,
    batch_label: str = "",
    school_name: str = "",
    stored_path: str = "",
) -> str:
    """Ceiling for a method given only what we actually have.

    A batch label, a school name, or a file on disk is not ADOPTED.
    An unretrieved id stays RECOVERED. A retrieved stored course is CANDIDATE.
    LOCALLY_SUPPORTED, VERIFIED, and ADOPTED need evidence this function does not accept.
    """
    del batch_label, school_name, stored_path
    if retrieved:
        return "CANDIDATE"
    return "RECOVERED"


def clamp_lifecycle(requested: str, **evidence: str | bool) -> str:
    """Fail closed. A requested ADOPTED jump past the evidence ceiling is rejected."""
    ceiling = lifecycle_from_evidence(
        retrieved=bool(evidence.get("retrieved")),
        batch_label=str(evidence.get("batch_label") or ""),
        school_name=str(evidence.get("school_name") or ""),
        stored_path=str(evidence.get("stored_path") or ""),
    )
    if requested not in LIFECYCLE_ORDER:
        return ceiling
    if LIFECYCLE_ORDER.index(requested) > LIFECYCLE_ORDER.index(ceiling):
        return ceiling
    return requested


def _table_parts(line: str) -> list[str]:
    return [p.strip() for p in line.strip("|").split("|")]


def _catalog_rows() -> list[tuple[str, str]]:
    if not CATALOG.is_file():
        return []
    rows: list[tuple[str, str]] = []
    for line in CATALOG.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| course") or line.startswith("|---"):
            continue
        parts = _table_parts(line)
        if len(parts) < 3:
            continue
        slug, when = parts[1].strip("`"), parts[2]
        if not slug or slug == "slug":
            continue
        rows.append((slug, when))
    return rows


def _speak_line_for_slug(slug: str) -> str:
    if not slug or not SPEAK.is_file():
        return ""
    exact: list[str] = []
    prefixed: list[str] = []
    prefix = slug[:28]
    for line in SPEAK.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| "):
            continue
        if f"`{slug}`" in line or re.search(rf"\b{re.escape(slug)}\b", line):
            exact.append(line)
        elif prefix and prefix in line:
            prefixed.append(line)
    if exact:
        return exact[0]
    if len(prefixed) == 1:
        return prefixed[0]
    return ""


def _primary_course(slug: str) -> str:
    """Course named in the skill cell, minus courses the same row says not to load."""
    line = _speak_line_for_slug(slug)
    if not line:
        return ""
    parts = _table_parts(line)
    if len(parts) < 2:
        return ""
    excluded = set(COURSE_RE.findall(parts[-1])) if len(parts) >= 4 else set()
    codes = [c for c in COURSE_RE.findall(parts[1]) if c not in excluded]
    return codes[0] if codes else ""


def _slug_for_course(course: str) -> str:
    if not course or not SPEAK.is_file():
        return ""
    for line in SPEAK.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| "):
            continue
        parts = _table_parts(line)
        if len(parts) < 2:
            continue
        if course not in COURSE_RE.findall(parts[1]):
            continue
        found = re.findall(r"`([^`]+)`", parts[1])
        if found:
            return found[0]
    return ""


def _excluded_slugs(slug: str) -> set[str]:
    """Other courses this speak-sheet row says not to load with the winner. Not a global ban."""
    line = _speak_line_for_slug(slug)
    if not line:
        return set()
    parts = _table_parts(line)
    if len(parts) < 4:
        return set()
    out: set[str] = set()
    for course in COURSE_RE.findall(parts[-1]):
        other = _slug_for_course(course)
        if other and other != slug:
            out.add(other)
    return out


def _keys_for_slug(slug: str) -> list[str]:
    keys = [slug]
    course = _primary_course(slug)
    if course:
        keys.append(course)
    return keys


def _catalog_hits(sitting: str) -> list[str]:
    """Distinctive overlap only. Shared words (plan, which, decision) do not load a course."""
    return [row["slug"] for row in _catalog_scored(sitting)]


def _catalog_scored(sitting: str) -> list[dict[str, object]]:
    if not (sitting or "").strip():
        return []
    rows = _catalog_rows()
    if not rows:
        return []
    df: dict[str, int] = {}
    parsed: list[tuple[str, set[str]]] = []
    for slug, when in rows:
        toks = set(re.findall(r"[a-z0-9]{4,}", when.lower()))
        parsed.append((slug, toks))
        for tok in toks:
            df[tok] = df.get(tok, 0) + 1
    sitting_toks = set(re.findall(r"[a-z0-9]{4,}", sitting.lower()))
    distinctive = {t for t in sitting_toks if df.get(t, 0) <= DISTINCTIVE_DF_MAX}
    scored: list[dict[str, object]] = []
    for slug, toks in parsed:
        inter = distinctive & toks
        if len(inter) >= 2:
            pass
        elif len(inter) == 1:
            only = next(iter(inter))
            # One short everyday word ("open") is not a course. A rare longer token still is.
            if len(only) < 5 or df.get(only, 0) > 1:
                continue
        else:
            continue
        scored.append(
            {
                "slug": slug,
                "score": len(inter),
                "tokens": sorted(inter),
            }
        )
    scored.sort(key=lambda row: (-int(row["score"]), str(row["slug"])))
    return scored


def select_methods(sitting: str, explicit: list[str]) -> list[dict[str, object]]:
    """Native competence first. Empty means NO_METHOD_NEEDED."""
    chosen: list[dict[str, object]] = []

    def add(slug: str, why: str, source: str, relevance: str) -> bool:
        slug = slug.strip().strip("`")
        if not slug or any(row["slug"] == slug for row in chosen):
            return len(chosen) >= CAP
        chosen.append(
            {
                "slug": slug,
                "why": why,
                "source": source,
                "relevance": relevance,
                "course": _primary_course(slug),
            }
        )
        return len(chosen) >= CAP

    for raw in explicit:
        if add(raw, "named on the job", "explicit", "named"):
            break
    else:
        for pat, slug in HINTS:
            if pat.search(sitting or ""):
                if add(slug, f"speak-sheet hint {pat.pattern}", "hint", "trigger"):
                    break
        else:
            for hit in _catalog_scored(sitting):
                tokens = ", ".join(hit["tokens"])  # type: ignore[arg-type]
                if add(
                    str(hit["slug"]),
                    f"distinctive catalog overlap ({tokens})",
                    "catalog",
                    str(hit["score"]),
                ):
                    break
    if chosen:
        banned = _excluded_slugs(str(chosen[0]["slug"]))
        chosen = [row for row in chosen if row["slug"] not in banned]
    return chosen[:CAP]


def pick_slugs(sitting: str, explicit: list[str]) -> list[str]:
    return [str(row["slug"]) for row in select_methods(sitting, explicit)]


def _skill_has_token(skill: str, key: str) -> bool:
    if not key:
        return False
    if COURSE_RE.fullmatch(key):
        return re.search(rf"\b{re.escape(key)}\b", skill) is not None
    return key in skill


def render(lane: str, sitting: str, slugs: list[str] | None = None) -> dict:
    selected = select_methods(sitting, slugs or [])
    rows = _parse_map_rows(lane)
    picked: list[dict[str, str]] = []
    for item in selected:
        slug = str(item["slug"])
        keys = _keys_for_slug(slug)
        primary = str(item.get("course") or "")
        hit = next(
            (
                r
                for r in rows
                if (primary and _skill_has_token(r["skill"], primary))
                or any(_skill_has_token(r["skill"], k) for k in keys)
                or slug in r["said"]
            ),
            None,
        )
        if hit:
            picked.append({"slug": slug, "course": primary, **hit})
        else:
            picked.append(
                {
                    "slug": slug,
                    "course": primary,
                    "said": sitting or "",
                    "skill": primary or slug,
                    "put": "name the file or blank on the lane facts card",
                    "leverage": "desk on the speak-sheet executes; Evens HITL",
                }
            )
    method = NO_METHOD
    lifecycle = NO_METHOD
    if picked:
        method = picked[0]["slug"]
        lifecycle = clamp_lifecycle(
            "ADOPTED",
            retrieved=True,
            school_name=picked[0].get("course") or method,
            stored_path=str(CATALOG),
        )
    facts = (
        "CONTENT/topics/live-facts-hive-os.md"
        if lane == "hive-os"
        else "CONTENT/topics/live-facts-agency.md"
    )
    why = str(selected[0]["why"]) if selected else "native competence covers this sitting"
    source = str(selected[0]["source"]) if selected else "native"
    relevance = str(selected[0]["relevance"]) if selected else "none"
    course = picked[0].get("course", "") if picked else ""
    behavior = (
        "use the desk's native competence; do not inject a course"
        if method == NO_METHOD
        else f"teach {course or method} only; a stored course file is not a learned capability"
    )
    return {
        "lane": lane,
        "sitting": sitting,
        "facts": facts,
        "method": method,
        "lifecycle": lifecycle,
        "stored_course_is_learned": False,
        "skills": [p["slug"] for p in picked][:CAP],
        "rows": picked[:CAP],
        "next": "one guided action on the live fact, or HITL if this is send/pay/deploy/book/publish",
        "trace": {
            "job": sitting,
            "context_pack": {"task": sitting, "project": lane, "role": "lane desk"},
            "retrieved_method": method,
            "why_selected": why,
            "behavior": behavior,
            "source": source,
            "relevance": relevance,
            "authority": "external_school_not_doctrine" if method != NO_METHOD else "native",
            "freshness": "catalog file on disk is not a capability",
            "expected_benefit": behavior,
            "lifecycle": lifecycle,
            "course": course or NO_METHOD,
        },
    }


def _parse_beats(path: Path | None = None) -> dict[str, dict[str, str]]:
    path = path or BEATS
    out: dict[str, dict[str, str]] = {}
    if not path.is_file():
        return out
    course = ""
    cur: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^## ([A-Z]{2,6}\d{2,4})\s*$", line)
        if m:
            if course and cur:
                out[course] = cur
            course = m.group(1)
            cur = {"course": course}
            continue
        kv = re.match(r"^\*\*(When|Says|Now|Watch):\*\*\s+(.*)$", line)
        if kv and course:
            cur[kv.group(1).lower()] = kv.group(2).strip()
    if course and cur:
        out[course] = cur
    return out


def live_beat(lane: str, sitting: str, slugs: list[str] | None = None) -> dict:
    """One school this turn when the task needs it. Otherwise NO_METHOD_NEEDED."""
    card = render(lane, sitting, slugs)
    trace = card.get("trace") or {}
    if card.get("method") == NO_METHOD or not card.get("rows"):
        return {
            "mode": "live",
            "lane": lane,
            "sitting": sitting,
            "slug": NO_METHOD,
            "course": NO_METHOD,
            "method": NO_METHOD,
            "lifecycle": NO_METHOD,
            "stored_course_is_learned": False,
            "says": "",
            "now": "proceed with native competence",
            "watch": "Do not inject a course. Do not dump the catalog.",
            "put": "",
            "leverage": "",
            "then": "do the work; a missing school is a result, not a gap to fill",
            "trace": trace,
        }
    row = card["rows"][0]
    primary = row.get("course") or ""
    beats = _parse_beats()
    beat = beats.get(primary) if primary else None
    if not beat:
        # Teach the course the speak sheet named. Do not walk the beat file for a substring hit.
        beat = {
            "course": primary or row.get("slug") or NO_METHOD,
            "says": (
                f"{row.get('said') or sitting}. Decide {row.get('put')} before the next edit. "
                f"{row.get('leverage')}."
            ),
            "now": row.get("put") or "name LANE + one fact",
            "watch": "Do not dump the catalog. Do not invent a KPI. Do not teach a course this row says not to load.",
        }
    says = beat.get("says") or ""
    course = beat.get("course") or primary or row.get("slug")
    behavior = says or trace.get("behavior") or ""
    trace = dict(trace)
    trace["behavior"] = behavior
    trace["course"] = course
    return {
        "mode": "live",
        "lane": lane,
        "sitting": sitting,
        "slug": row.get("slug"),
        "course": course,
        "method": card.get("method"),
        "lifecycle": card.get("lifecycle"),
        "stored_course_is_learned": False,
        "says": says,
        "now": beat.get("now") or row.get("put"),
        "watch": beat.get("watch") or "marketing ≠ copy ≠ CS; hard step stays Evens",
        "put": row.get("put"),
        "leverage": row.get("leverage"),
        "then": "do the work through this lens; do not stamp and leave",
        "trace": trace,
    }


def emit_vault(card: dict, desk: str, host: str) -> str:
    items = [
        f"LANE: {card['lane']}",
        f"SITTING: {card['sitting']}",
        f"SKILLS: {', '.join(card['skills']) or 'none'}",
    ]
    for row in card["rows"][:CAP]:
        items.append(f"{row['slug']}: PUT {row['put']} · LEV {row['leverage']}")
    items.append(f"NEXT: {card['next']}")
    body = "\n".join(
        [
            "---",
            "kind: report",
            "skill: mentor",
            f"desk: {desk}",
            f"host: {host}",
            f"title: Mentor pass · {card['lane']}",
            "---",
            "",
            f"# Mentor pass · {card['lane']}",
            "",
            *[f"- {it}" for it in items],
            "",
        ]
    )
    rel = Path("CONTENT/os/reports/mentor.md")
    homes = [
        ROOT / "docs/hive/outer-heaven" / rel,
        Path.home() / ".grokbot/outer-heaven" / rel,
        Path.home() / "Documents/My_Billion_Dollar_Vault/00_Outer_Heaven" / rel,
    ]
    for path in homes:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body, encoding="utf-8")
    emit = ROOT / "scripts/hive/os/emit-vault-receive.py"
    if emit.is_file():
        cmd = [
            sys.executable,
            str(emit),
            "--desk",
            desk,
            "--skill",
            "mentor",
            "--kind",
            "report",
            "--host",
            host,
            "--title",
            f"Mentor pass · {card['lane']}",
        ]
        for it in items:
            cmd.extend(["--item", it])
        subprocess.run(cmd, check=False, cwd=str(ROOT))
    return str(rel)


def self_test() -> list[str]:
    errs: list[str] = []
    if not MAP.is_file():
        errs.append("leverage map missing")
    card = render("hive-os", "who is this page for and what tone", [])
    if len(card["skills"]) > CAP:
        errs.append("picked more than 3")
    if "bizcomm-audience-purpose-channel-tone-feedback" not in card["skills"]:
        errs.append("copy sitting missed BUS210")
    put = " ".join(r.get("put", "") for r in card["rows"])
    if "Message line" not in put and "who/why" not in put.lower():
        errs.append("BUS210 row missed leverage-map PUT")
    agency = render("agency", "sales process SPIN for a named client", ["grad-sales-process-spin-loyalty-brand"])
    if agency["lane"] != "agency":
        errs.append("agency lane lost")
    if "next question" not in " ".join(r.get("put", "") for r in agency["rows"]):
        errs.append("BUS633 row missed agency PUT")
    dump = render("hive-os", "everything", list(f"slug-{i}" for i in range(8)))
    if len(dump["skills"]) > CAP:
        errs.append("explicit slugs exceeded cap")
    future = render(
        "hive-os",
        "which DBMS fits and write a data-management plan so retrieval is decision-grade",
        [],
    )
    if "grad-data-mgmt-dbms-sql-plan-warehouse" not in future["skills"]:
        errs.append("catalog overlap missed a future-shaped sitting")
    if future.get("lifecycle") != "CANDIDATE":
        errs.append(f"stored course lifecycle {future.get('lifecycle')}")
    if future.get("stored_course_is_learned"):
        errs.append("stored course counted as learned")
    dbms = live_beat(
        "hive-os",
        "which DBMS fits and write a data-management plan so retrieval is decision-grade",
        [],
    )
    if dbms.get("course") != "BUS611":
        errs.append(f"DBMS sitting taught {dbms.get('course')} instead of BUS611")
    if dbms.get("course") == "BUS206":
        errs.append("DBMS sitting still teaches BUS206")
    if "grad-ethics-strategy-formulate-implement" in future["skills"]:
        errs.append("generic tokens selected the ethics course")
    native = live_beat("hive-os", "open the css file and change the button color", [])
    if native.get("method") != NO_METHOD or native.get("course") != NO_METHOD:
        errs.append(f"native task injected {native.get('course')}")
    systems = live_beat(
        "hive-os",
        "what systems run this people, process, data, hardware, software",
        [],
    )
    if systems.get("course") != "BUS206":
        errs.append(f"five-components sitting missed BUS206 (got {systems.get('course')})")
    for label, evidence in (
        ("batch", {"retrieved": False, "batch_label": "batch accepted"}),
        ("school", {"retrieved": False, "school_name": "BUS206"}),
        ("file", {"retrieved": False, "stored_path": str(CATALOG)}),
        ("unretrieved", {"retrieved": False, "school_name": "method-id-not-loaded"}),
    ):
        if clamp_lifecycle("ADOPTED", **evidence) == "ADOPTED":
            errs.append(f"{label} evidence jumped to ADOPTED")
    if clamp_lifecycle("ADOPTED", retrieved=True, school_name="BUS611", stored_path=str(CATALOG)) != "CANDIDATE":
        errs.append("retrieved stored course was not held at CANDIDATE")
    if not BEATS.is_file():
        errs.append("live-beats missing")
    beats = _parse_beats()
    if "BUS210" not in beats or "audience" not in (beats["BUS210"].get("says") or "").lower():
        errs.append("BUS210 live beat missing or thin")
    live = live_beat("hive-os", "who is this page for and what tone", [])
    if live.get("course") != "BUS210":
        errs.append(f"live beat missed BUS210 (got {live.get('course')})")
    if len((live.get("says") or "").split()) < 20:
        errs.append("live SAYS is not a teaching paragraph")
    if "who" not in (live.get("now") or "").lower() and "tone" not in (live.get("now") or "").lower():
        errs.append("live NOW missed who/why/tone")
    if live.get("mode") != "live":
        errs.append("live mode flag missing")
    return errs


def main() -> int:
    ap = argparse.ArgumentParser(description="Saylor mentor pass (1–3 skills, no dump)")
    ap.add_argument("--lane", choices=LANES)
    ap.add_argument("--sitting", default="")
    ap.add_argument("--slugs", default="", help="comma-separated slugs (cap 3)")
    ap.add_argument("--emit", action="store_true")
    ap.add_argument("--desk", default="consultant")
    ap.add_argument("--host", default="cursor", choices=("cursor", "grok"))
    ap.add_argument("--format", default="markdown", choices=("markdown", "json"))
    ap.add_argument("--live", action="store_true", help="one teaching beat this turn (not the end card)")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        errs = self_test()
        if errs:
            print("FAIL:", "; ".join(errs), file=sys.stderr)
            return 1
        print("OK: saylor-mentor-pass self-test")
        return 0
    if not args.lane:
        print("LANE required: hive-os | agency", file=sys.stderr)
        return 2
    slugs = [s for s in args.slugs.split(",") if s.strip()]
    if args.live:
        beat = live_beat(args.lane, args.sitting, slugs)
        if args.format == "json":
            print(json.dumps(beat, indent=2))
            return 0
        print(
            "\n".join(
                [
                    f"# Live mentor · {beat['lane']}",
                    "",
                    f"SITTING: {beat['sitting'] or '(name it)'}",
                    f"SCHOOL: {beat['course']}",
                    f"SAYS: {beat['says']}",
                    f"NOW: {beat['now']}",
                    f"THEN: {beat['then']}",
                    f"WATCH: {beat['watch']}",
                ]
            )
        )
        return 0
    card = render(args.lane, args.sitting, slugs)
    if args.emit:
        card["vault"] = emit_vault(card, args.desk, args.host)
    if args.format == "json":
        print(json.dumps(card, indent=2))
        return 0
    lines = [
        f"# Mentor pass · {card['lane']}",
        "",
        f"SITTING: {card['sitting'] or '(name it)'}",
        f"FACTS: {card['facts']}",
        f"SKILLS: {', '.join(card['skills']) or '(none — skip or say one fact)'}",
        "",
    ]
    for row in card["rows"]:
        lines += [
            f"## {row['slug']}",
            f"- SAID: {row['said']}",
            f"- PUT-IN-SYSTEM: {row['put']}",
            f"- LEVERAGE: {row['leverage']}",
            "",
        ]
    lines += [f"NEXT: {card['next']}"]
    if card.get("vault"):
        lines += ["", f"EMIT: {card['vault']}"]
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
