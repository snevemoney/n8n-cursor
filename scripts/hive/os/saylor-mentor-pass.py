#!/usr/bin/env python3
"""Live mentor: one teaching beat then work. End emit PUT-IN-SYSTEM. No catalog dump."""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("/Users/evenslouis/n8n-cursor")
MAP = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-leverage-map.md"
SPEAK = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-trigger-map.md"
CATALOG = ROOT / "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md"
BEATS = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-live-beats.md"
LANES = ("hive-os", "agency")
CAP = 3
COURSE_RE = re.compile(r"\b(?:BUS|COMM|ECON|PRDV|CS|ARTH|ENGL|PHIL|MA|POLSC)\d+\b")

# sitting keywords → slug (first-match order; cap 3)
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
    (re.compile(r"\b(project|slice|done-check|has an end)\b", re.I), "intro-pm-process-groups-people-checklists"),
    (re.compile(r"\b(offer|who (the site|it) is for|stp|ads vs)\b", re.I), "mktg-value-stp-mix-plan-checklists"),
    (re.compile(r"\b(spin|sales process|loyalty|close)\b", re.I), "grad-sales-process-spin-loyalty-brand"),
    (re.compile(r"\b(ethical|hitl|send this)\b", re.I), "bizethics-integrity-stakeholder-csr-dilemma"),
    (re.compile(r"\b(legal|allowed)\b", re.I), "bizlaw-sources-forum-wrongs-assets-entity-checklists"),
    (re.compile(r"\b(put in the system|where data lives|os)\b", re.I), "mis-intro-five-components"),
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


def _keys_for_slug(slug: str) -> list[str]:
    keys = [slug]
    if SPEAK.is_file():
        for line in SPEAK.read_text(encoding="utf-8").splitlines():
            if f"`{slug}`" not in line and slug[:28] not in line:
                continue
            parts = [p.strip() for p in line.strip("|").split("|")]
            skill_cell = parts[1] if len(parts) > 1 else ""
            keys.extend(COURSE_RE.findall(skill_cell))
    return keys


def _catalog_hits(sitting: str) -> list[str]:
    """Future courses: overlap sitting tokens with catalog use-when. No HINTS required."""
    if not CATALOG.is_file() or not (sitting or "").strip():
        return []
    tokens = set(re.findall(r"[a-z0-9]{4,}", sitting.lower()))
    scored: list[tuple[int, str]] = []
    for line in CATALOG.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| course") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 3:
            continue
        slug, when = parts[1].strip("`"), parts[2]
        if not slug or slug == "slug":
            continue
        n = len(tokens & set(re.findall(r"[a-z0-9]{4,}", when.lower())))
        if n >= 2:
            scored.append((n, slug))
    scored.sort(key=lambda x: (-x[0], x[1]))
    return [s for _, s in scored]


def pick_slugs(sitting: str, explicit: list[str]) -> list[str]:
    out: list[str] = []
    for s in explicit:
        slug = s.strip().strip("`")
        if slug and slug not in out:
            out.append(slug)
        if len(out) >= CAP:
            return out
    for pat, slug in HINTS:
        if pat.search(sitting or "") and slug not in out:
            out.append(slug)
        if len(out) >= CAP:
            return out
    for slug in _catalog_hits(sitting):
        if slug not in out:
            out.append(slug)
        if len(out) >= CAP:
            break
    return out[:CAP]


def render(lane: str, sitting: str, slugs: list[str] | None = None) -> dict:
    slugs = pick_slugs(sitting, slugs or [])
    rows = _parse_map_rows(lane)
    picked: list[dict[str, str]] = []
    for slug in slugs:
        keys = _keys_for_slug(slug)
        hit = next(
            (
                r
                for r in rows
                if any(k and k in r["skill"] for k in keys) or slug in r["said"]
            ),
            None,
        )
        if hit:
            picked.append({"slug": slug, **hit})
        else:
            picked.append(
                {
                    "slug": slug,
                    "said": sitting or "",
                    "skill": slug,
                    "put": "name the file or blank on the lane facts card",
                    "leverage": "desk on the speak-sheet executes; Evens HITL",
                }
            )
    if not picked:
        picked.append(
            {
                "slug": "(none matched)",
                "said": sitting or "",
                "skill": "saylor-course-skill",
                "put": "name LANE + one fact, or skip this pass",
                "leverage": "Consultant asks once; do not dump the catalog",
            }
        )
    facts = (
        "CONTENT/topics/live-facts-hive-os.md"
        if lane == "hive-os"
        else "CONTENT/topics/live-facts-agency.md"
    )
    return {
        "lane": lane,
        "sitting": sitting,
        "facts": facts,
        "skills": [p["slug"] for p in picked if p["slug"] != "(none matched)"][:CAP],
        "rows": picked[:CAP],
        "next": "one guided action on the live fact, or HITL if this is send/pay/deploy/book/publish",
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
    """One school this turn. Teach, then the caller does the work."""
    card = render(lane, sitting, slugs)
    row = card["rows"][0]
    courses = COURSE_RE.findall(f"{row.get('skill', '')} {row.get('said', '')} {row.get('slug', '')}")
    beats = _parse_beats()
    beat = {}
    for c in courses:
        if c in beats:
            beat = beats[c]
            break
    if not beat:
        for c, b in beats.items():
            when = (b.get("when") or "").lower()
            if when and any(tok in (sitting or "").lower() for tok in when.split() if len(tok) > 4):
                beat = b
                break
    if not beat:
        beat = {
            "course": row.get("skill") or "saylor-course-skill",
            "says": (
                f"{row.get('said') or sitting}. Decide {row.get('put')} before the next edit. "
                f"{row.get('leverage')}."
            ),
            "now": row.get("put") or "name LANE + one fact",
            "watch": "Do not dump the catalog. Do not invent a KPI.",
        }
    says = beat.get("says") or ""
    return {
        "mode": "live",
        "lane": lane,
        "sitting": sitting,
        "slug": row.get("slug"),
        "course": beat.get("course") or (courses[0] if courses else row.get("skill")),
        "says": says,
        "now": beat.get("now") or row.get("put"),
        "watch": beat.get("watch") or "marketing ≠ copy ≠ CS; hard step stays Evens",
        "put": row.get("put"),
        "leverage": row.get("leverage"),
        "then": "do the work through this lens; do not stamp and leave",
    }


def _shelf_line() -> str:
    """Catalog is the school. Do not stamp one course as the whole shelf."""
    idx = ROOT / "apps/agent-stack/hands/school_index.py"
    if not idx.is_file():
        return "SHELF: 164 claimed (saylor-catalog-complete.md); harvest table is not 164 rows"
    spec = importlib.util.spec_from_file_location("mentor_school_index", idx)
    if spec is None or spec.loader is None:
        return "SHELF: 164 claimed (saylor-catalog-complete.md); harvest table is not 164 rows"
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    snap = mod.build_snapshot()
    return (
        f"SHELF: {snap.get('enrolled_catalog_claim')} claimed / "
        f"{snap.get('on_disk')} on disk / "
        f"{snap.get('missing')} named missing / "
        f"delta {snap.get('unnamed_enrolled_delta')} unnamed "
        f"(harvest Count: **{snap.get('harvest_table_count')}**)"
    )


def emit_vault(card: dict, desk: str, host: str) -> str:
    items = [
        f"LANE: {card['lane']}",
        f"SITTING: {card['sitting']}",
        f"SKILLS: {', '.join(card['skills']) or 'none'}",
        _shelf_line(),
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
        _shelf_line(),
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
