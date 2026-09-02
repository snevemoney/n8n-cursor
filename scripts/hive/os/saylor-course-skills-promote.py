#!/usr/bin/env python3
"""Promote harvested Saylor COURSE-SKILLs into hive SSOT + Cursor pointers.

Source of trigger text: docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md
Desk bind: CONTENT/topics/saylor-trigger-map.md
Does not invent exam items. Does not copy box .blob / sand-workflow bodies.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path("/Users/evenslouis/n8n-cursor")
MASTER = ROOT / "scripts/hive/grok-skills"
CURSOR = ROOT / ".cursor/skills"

# desk execute · Consultant always mentors
DESK = {
    "intro-biz-survey-checklists": "Consultant",
    "finacct-cycle-statements-checklists": "Money Desk",
    "mgracct-cost-cvp-relevant-control-checklists": "Money Desk",
    "custsvc-impression-needs-channel-complaint-experience": "Communications Manager",
    "bizethics-integrity-stakeholder-csr-dilemma": "HITL Operator",
    "corpfin-tvm-value-capital-checklists": "Money Desk / Personal CFO",
    "mktg-value-stp-mix-plan-checklists": "Product GTM",
    "bizstat-describe-sample-infer-regress-checklists": "Money Desk + Watchdog",
    "bizlaw-sources-forum-wrongs-assets-entity-checklists": "HITL Operator + Consultant",
    "mis-intro-five-components": "Watchdog + Forge",
    "mgmt-polc-manager-checklists": "Big Boss",
    "ob-three-levels-motivation-culture-conflict": "Big Boss",
    "bizcomm-audience-purpose-channel-tone-feedback": "Communications Manager + Publishing Engine",
    "bi-sources-warehouse-present-model-privacy": "Watchdog",
    "ops-manager-transformation-checklists": "Watchdog",
    "hrm-staffing-legal-cycle": "Big Boss",
    "strategic-it-when-whether-then-strategy": "Forge + Consultant",
    "entrepreneurial-venture-viability-plan-team-market-finance": "Consultant",
    "saylor-bus401-strategic-leadership-playbook": "Consultant (study-aid)",
    "strat-lead-mgmt-checklists": "Big Boss",
    "intro-pm-process-groups-people-checklists": "Day Planner + Forge",
    "negotiations-conflict-adr-cross-cultural-checklists": "Consultant",
    "firm-strategy-process-advantage-execute": "Consultant",
    "strat-mktg-plan-research-cb-brand-comms": "Product GTM",
    "grad-finmgmt-package-tvm-capital-value": "Wealth Manager",
    "grad-mktg-mgmt-strategy-env-mix-plan": "Product GTM",
    "grad-people-indiv-group-hrm-lead-culture": "Big Boss",
    "grad-innov-sustain-stakeholder-circular-venture": "Consultant",
    "grad-spm-org-tenka-lifecycle-value": "Forge",
    "grad-oscm-process-forecast-chain-shock": "Watchdog",
    "grad-ddd-analytics-viz-story-advantage": "Watchdog",
    "grad-ethics-strategy-formulate-implement": "Consultant",
    "grad-adv-bi-lifecycle-mine-warehouse-dash-pm": "Watchdog",
    "grad-data-mgmt-dbms-sql-plan-warehouse": "Watchdog + Forge",
    "austrian-intro-checklists": "Wealth Manager",
    "austrian-capital-cycle-checklists": "Wealth Manager",
    "hard-money-qa-checklists": "Wealth Manager",
    "layered-money-history-checklists": "Wealth Manager",
    "what-is-money-framing": "Wealth Manager",
    "bitcoin-literacy-checklists": "Wealth Manager",
    "undergrad-human-comm-survey-five-contexts": "Communications Manager + Publishing Engine",
    "grad-sales-process-spin-loyalty-brand": "Product GTM + Consultant",
}

TITLE = {
    "intro-biz-survey-checklists": "Intro to business survey",
    "finacct-cycle-statements-checklists": "Financial accounting cycle",
    "mgracct-cost-cvp-relevant-control-checklists": "Managerial cost / CVP / control",
    "custsvc-impression-needs-channel-complaint-experience": "Customer service impression",
    "bizethics-integrity-stakeholder-csr-dilemma": "Business ethics + CSR",
    "corpfin-tvm-value-capital-checklists": "Corporate finance TVM / capital",
    "mktg-value-stp-mix-plan-checklists": "Marketing value / STP / mix",
    "bizstat-describe-sample-infer-regress-checklists": "Business stats infer",
    "bizlaw-sources-forum-wrongs-assets-entity-checklists": "Business law sources / forum",
    "mis-intro-five-components": "MIS five components",
    "mgmt-polc-manager-checklists": "Management POLC",
    "ob-three-levels-motivation-culture-conflict": "Org behavior three levels",
    "bizcomm-audience-purpose-channel-tone-feedback": "Business communication",
    "bi-sources-warehouse-present-model-privacy": "Intro business intelligence",
    "ops-manager-transformation-checklists": "Operations transformation",
    "hrm-staffing-legal-cycle": "HRM staffing cycle",
    "strategic-it-when-whether-then-strategy": "Strategic IT fund / refuse",
    "entrepreneurial-venture-viability-plan-team-market-finance": "Venture viability",
    "saylor-bus401-strategic-leadership-playbook": "BUS401 leadership playbook",
    "strat-lead-mgmt-checklists": "Lead vs manage",
    "intro-pm-process-groups-people-checklists": "Intro project management",
    "negotiations-conflict-adr-cross-cultural-checklists": "Negotiations + ADR",
    "firm-strategy-process-advantage-execute": "Firm strategy capstone",
    "strat-mktg-plan-research-cb-brand-comms": "Strategic marketing plan",
    "grad-finmgmt-package-tvm-capital-value": "Graduate financial management",
    "grad-mktg-mgmt-strategy-env-mix-plan": "Graduate marketing management",
    "grad-people-indiv-group-hrm-lead-culture": "Graduate managing people",
    "grad-innov-sustain-stakeholder-circular-venture": "Innovation + sustainability",
    "grad-spm-org-tenka-lifecycle-value": "Graduate strategic PM",
    "grad-oscm-process-forecast-chain-shock": "Graduate ops / supply chain",
    "grad-ddd-analytics-viz-story-advantage": "Data-driven decisions",
    "grad-ethics-strategy-formulate-implement": "Ethical + strategic management",
    "grad-adv-bi-lifecycle-mine-warehouse-dash-pm": "Advanced BI as a project",
    "grad-data-mgmt-dbms-sql-plan-warehouse": "Data management / DBMS",
    "austrian-intro-checklists": "Austrian value / trade",
    "austrian-capital-cycle-checklists": "Austrian capital cycle",
    "hard-money-qa-checklists": "Hard-money Qs",
    "layered-money-history-checklists": "Layered money history",
    "what-is-money-framing": "What money is",
    "bitcoin-literacy-checklists": "Bitcoin literacy (non-dev)",
    "undergrad-human-comm-survey-five-contexts": "Human comm five contexts",
    "grad-sales-process-spin-loyalty-brand": "Graduate sales process / SPIN",
}


def desk_for(slug: str, speak: Path | None = None) -> str:
    if slug in DESK:
        return DESK[slug]
    speak = speak or (ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-trigger-map.md")
    if speak.is_file() and slug in speak.read_text(encoding="utf-8"):
        for line in speak.read_text(encoding="utf-8").splitlines():
            if f"`{slug}`" not in line:
                continue
            parts = [p.strip() for p in line.strip("|").split("|")]
            if len(parts) >= 3 and parts[2]:
                return parts[2]
    return "Consultant"


def write_one(row: dict) -> Path:
    slug = row["slug"]
    course = row["course"]
    master = MASTER / f"{slug}.md"
    master.write_text(render_master(row), encoding="utf-8")
    cdir = CURSOR / slug
    cdir.mkdir(parents=True, exist_ok=True)
    (cdir / "SKILL.md").write_text(render_cursor(slug, course), encoding="utf-8")
    return master


def parse_catalog(path: Path) -> list[dict]:
    rows: list[dict] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| course") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 4 or parts[0] == "course":
            continue
        course, slug, when, never = parts[0], parts[1].strip("`"), parts[2], parts[3]
        if not course or not slug:
            continue
        rows.append({"course": course, "slug": slug, "when": when, "never": never})
    return rows


def render_master(row: dict) -> str:
    slug = row["slug"]
    course = row["course"]
    desk = desk_for(slug)
    title = TITLE.get(slug, slug.replace("-", " "))
    when = row["when"].rstrip(".")
    never = row["never"].rstrip(".")
    desc_when = when
    if desc_when.lower().startswith("a task asks"):
        desc_when = desc_when[len("a task asks") :].strip()
    if desc_when.lower().startswith("use when"):
        desc_when = desc_when[len("use when") :].strip()
    desc_when = desc_when[0].lower() + desc_when[1:] if desc_when else slug
    if len(desc_when) > 180:
        desc_when = desc_when[:177].rsplit(" ", 1)[0] + "…"
    return f"""---
name: {slug}
description: >-
  Saylor {course} COURSE-SKILL. Use when {desc_when}
  Owner: {desk}. Load saylor-course-skill first. Cursor plus Grok Bot.
---

# {title} ({course})

**Owner:** {desk} executes · Consultant mentors
**Stack:** Cursor + Grok Bot
**Course:** {course}
**Meta:** `saylor-course-skill`
**Speak-sheet:** `CONTENT/topics/saylor-trigger-map.md`
**Data pack:** `CONTENT/topics/live-facts-card.md`
**Status:** WIRED 2026-09-02 catalog promote. Not accepted forever.

## When

{when}

## Never

{never}

Exam reconstruction · invented KPIs · dump the textbook as the skill · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus · treat this as a landing

## Steps

1. Load `saylor-course-skill`. Cap 1–3 skills this ask.
2. Name LANE (`hive-os` | `agency`). Bind that facts card. Blank stays blank.
3. Run this checklist on that fact. Do not take or reconstruct a Saylor (or any) exam.
4. {desk} executes. Consultant mentors. Hard step stays Evens.

## Stop

Send / pay / deploy / book / publish = operator.
"""


def render_cursor(slug: str, course: str) -> str:
    return f"""---
name: {slug}
description: >-
  Saylor {course} COURSE-SKILL. Load the hive master. Consultant mentors;
  named desk executes. No exam dump. Cursor plus Grok Bot.
---

# {slug} (Cursor)

Load `scripts/hive/grok-skills/{slug}.md` and follow it.

**Meta:** `saylor-course-skill` first (1–3 skills, speak-sheet, live-facts-card).
**Course:** {course}

Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/{slug}/SKILL.md`.
"""


def main() -> int:
    catalog = ROOT / "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md"
    rows = parse_catalog(catalog)
    extra = [
        {
            "course": "COMM100",
            "slug": "undergrad-human-comm-survey-five-contexts",
            "when": (
                "a task asks how humans communicate at undergrad survey depth across the "
                "named five COMM100 contexts, how a message moves in those contexts, or how "
                "to separate general speech-comm from workplace writing or frontline CS."
            ),
            "never": (
                "the job is reconstructing or taking a Saylor (or any) exam, running BUS210 "
                "audience/purpose/channel/tone as the course, BUS107 customer-service scripts, "
                "or dumping a speech-comm textbook."
            ),
        },
        {
            "course": "BUS633",
            "slug": "grad-sales-process-spin-loyalty-brand",
            "when": (
                "a task asks how a graduate sales process should run — SPIN questions, "
                "loyalty after the close, or brand as a sales system — in the Saylor BUS633 school."
            ),
            "never": (
                "the job is reconstructing or taking a Saylor (or any) exam, running BUS203 "
                "principles-of-marketing as the course, PRDV217 sales-closing as the course, "
                "or writing a hard-sell / dark-pattern close script."
            ),
        },
    ]
    have = {r["slug"] for r in rows}
    for row in extra:
        if row["slug"] not in have:
            rows.append(row)
    written = 0
    for row in rows:
        write_one(row)
        written += 1
    # meta cursor pointer
    meta = CURSOR / "saylor-course-skill"
    meta.mkdir(parents=True, exist_ok=True)
    (meta / "SKILL.md").write_text(
        """---
name: saylor-course-skill
description: >-
  Router for harvested Saylor university COURSE-SKILLs. Consultant mentors.
  1–3 skills from plain hive/site/money talk. No exam dump.
---

# Saylor course skill (Cursor)

Load `scripts/hive/grok-skills/saylor-course-skill.md` and follow it.

**Catalog + speak-sheet first.** Pick 1–3 slugs. Bind live-facts-card.

Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/saylor-course-skill/SKILL.md`.
""",
        encoding="utf-8",
    )
    print(f"wrote {written} course skills + meta pointer")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
