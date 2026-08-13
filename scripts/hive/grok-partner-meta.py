#!/usr/bin/env python3
"""AI Partner metadata for Grok agents — frontier descriptions + value buckets."""
from __future__ import annotations

from typing import Any

PLAYBOOK_PATH = "docs/hive/outer-heaven/AI_PARTNER_PLAYBOOK.md"

SCOPE_CHECK = """
SCOPE CHECK (required before client-facing build):
  Bucket: [Acquire|Grow|Cut]
  KPI: [metric name]
  Baseline: [number today]
  60-day target: [predicted number]
""".strip()

GENERIC_KPI_MARKERS = (
    "Deliver rotating phases for",
    "Deliver ",
    " with registered outcome",
    "Outcome registered + operator knows next step for:",
)


def is_generic_kpi(kpi: str | None) -> bool:
    if not kpi:
        return True
    return any(m in kpi for m in GENERIC_KPI_MARKERS) and "baseline" not in kpi.lower()


def partner_fields(
    *,
    operator_summary: str,
    value_bucket: str,
    partner_outcome: str,
    service_rung: int | None = None,
    kpi: str | None = None,
    done_when: str | None = None,
) -> dict[str, Any]:
    return {
        "operatorSummary": operator_summary,
        "valueBucket": value_bucket,
        "serviceRung": service_rung,
        "partnerOutcome": partner_outcome,
        **({"kpi": kpi} if kpi else {}),
        **({"doneWhen": done_when} if done_when else {}),
    }


CORE_PARTNER: dict[str, dict[str, Any]] = {
    "Big Boss": partner_fields(
        operator_summary="Your daily AI OS commander — morning brief, mission rollup, one Tier 3 action max.",
        value_bucket="ops",
        service_rung=None,
        partner_outcome="Operator starts each day knowing top 3 priorities and bucket focus.",
        kpi="Morning brief delivered by 07:15 with health, missions, scoreboard, Tier 3 count",
        done_when="Digest registered + operator has ≤1 action item with /pro or /n8n link",
    ),
    "Watchdog Ops": partner_fields(
        operator_summary="Keeps the hive alive — read-only health checks; proves Cut-cost uptime wins.",
        value_bucket="cut",
        service_rung=None,
        partner_outcome="Report disk %, golden paths, smokes — no silent failures.",
        kpi="Smoke pass rate ≥8/8 life-business + 3/3 golden paths",
        done_when="Health rollup registered with issues list and severity",
    ),
    "Life & Business Ops": partner_fields(
        operator_summary="Fixes lanes 1–4 automation on VPS — email, voice, n8n, CE builder stub.",
        value_bucket="cut",
        service_rung=2,
        partner_outcome="8/8 smoke + 6/6 builder smoke or clear blocker report.",
        kpi="life-business-ops smoke 8/8 pass rate",
        done_when="Smoke outcome registered with pass/fail counts",
    ),
    "HITL Operator": partner_fields(
        operator_summary="Tier 3 gatekeeper — surfaces money/send/deploy items; never auto-approves.",
        value_bucket="ops",
        service_rung=3,
        partner_outcome="Operator sees open Tier 3 queue with /pro and /n8n links.",
        kpi="100% Tier 3 items listed with approval surface link",
        done_when="HITL digest registered; zero auto-approvals",
    ),
    "n8n Automation": partner_fields(
        operator_summary="Owns evenslouis.ca/n8n catalog — Cut-cost automation factory.",
        value_bucket="cut",
        service_rung=2,
        partner_outcome="Hive webhooks active on canonical host only.",
        kpi="Catalog workflows active vs catalog.json row count",
        done_when="Catalog verify registered with drift list",
    ),
    "CE & Leads": partner_fields(
        operator_summary="Read-only money desk — leads, deals, service-ladder context for /pro.",
        value_bucket="grow",
        service_rung=3,
        partner_outcome="CE snapshot + open actions without mutating leads.",
        kpi="Daily CE health + action queue freshness",
        done_when="CE read snapshot registered; proposals via hitl only",
    ),
    "Telegram Console": partner_fields(
        operator_summary="Outer Heaven Telegram shortcuts parity — operator console in chat.",
        value_bucket="ops",
        service_rung=None,
        partner_outcome="Shortcut plugin matches hive-report-shortcut spec.",
        kpi="All 8 shortcuts respond on #general topic",
        done_when="Parity check registered",
    ),
    "Forge Builder": partner_fields(
        operator_summary="Builder smoke lane — Rung 2 project verify before /pro deploy.",
        value_bucket="cut",
        service_rung=2,
        partner_outcome="CE builder smoke pass or documented failure.",
        kpi="smoke-ce-builder pass count",
        done_when="Builder smoke outcome registered",
    ),
    "Scout Lead Gen": partner_fields(
        operator_summary="Warm outreach reps — start conversations, not cold pitches; show what you built.",
        value_bucket="acquire",
        service_rung=0,
        partner_outcome="Draft ≤100-word warm message asking for feedback call.",
        kpi="5 owner conversations/month target (operator-led)",
        done_when="Outreach draft or conversation log registered",
    ),
    "Vault Librarian": partner_fields(
        operator_summary="Captures case studies with verifiable numbers into Outer Heaven chronicle.",
        value_bucket="grow",
        service_rung=None,
        partner_outcome="Chronicle + graph index updated; case study snippets filed.",
        kpi="Weekly capture cycle completes with CURSOR_CHATS ingested",
        done_when="Capture cycle registered with artifact counts",
    ),
    "Engineering Lead": partner_fields(
        operator_summary="Rung 2 delivery lead — 2-week vertical slices with four-blank scope.",
        value_bucket="ops",
        service_rung=2,
        partner_outcome="Scoped build with DONE_WHEN + smoke proof.",
        kpi="Vertical slice ships with typecheck/smoke green",
        done_when="engineering.scope registered with file list + DONE_WHEN",
    ),
    "Creative Studio": partner_fields(
        operator_summary="Personal/creative THEMES lane — portfolio proofs for partner credibility.",
        value_bucket="craft",
        service_rung=None,
        partner_outcome="One creative research outcome per week.",
        kpi="Weekly THEMES lane check registered",
        done_when="creative.research outcome registered",
    ),
    "Security Reviewer": partner_fields(
        operator_summary="Read-only security posture — propose fixes via HITL only.",
        value_bucket="cut",
        service_rung=1,
        partner_outcome="Security findings list with severity.",
        kpi="Golden paths + hitl_gate reviewed weekly",
        done_when="Findings registered via hitl_propose_action if needed",
    ),
}


ROSTER_PARTNER: dict[str, dict[str, Any]] = {
    "ProofCheck GTM": partner_fields(
        operator_summary="ProofCheck product partner — one GTM phase/run with case-study-ready Evidence.",
        value_bucket="acquire",
        service_rung=2,
        partner_outcome="Nursing EN/FR claim QC positioning moves Acquire or Grow KPI.",
        kpi="One GTM phase doc + registered gtm.handoff per run",
        done_when="Phase artifact saved + outcome with bucket/KPI note",
    ),
    "SENTINEL GTM": partner_fields(
        operator_summary="SENTINEL emergency PWA partner — municipal niche GTM phases.",
        value_bucket="acquire",
        service_rung=2,
        partner_outcome="Quebec emergency PWA wedge documented per phase.",
        kpi="One GTM phase completed per weekly run",
        done_when="gtm.handoff registered with product niche summary",
    ),
    "ClipEngine GTM": partner_fields(
        operator_summary="ClipEngine creator-clipping partner — rights-aware GTM.",
        value_bucket="acquire",
        service_rung=2,
        partner_outcome="Creator clipping niche phase artifact per run.",
        kpi="One GTM phase doc per weekly run",
        done_when="Registered outcome with phase name + summary",
    ),
    "TrendSpotter GTM": partner_fields(
        operator_summary="TrendSpotter social-signal partner — TikTok→ticker GTM.",
        value_bucket="acquire",
        service_rung=2,
        partner_outcome="Social trading signal product phase per run.",
        kpi="One GTM phase artifact weekly",
        done_when="gtm.handoff registered",
    ),
    "Growth & SEO Lead": partner_fields(
        operator_summary="Acquire bucket — public artifacts → SEO → CE funnel.",
        value_bucket="acquire",
        service_rung=2,
        partner_outcome="SEO audit or artifact draft linking to evenslouis.ca/pro.",
        kpi="Organic landing draft or Search Console action item",
        done_when="Marketing outcome registered with URL target",
    ),
    "Funnel Optimizer": partner_fields(
        operator_summary="Grow bucket — channel ROI and drop-off analysis.",
        value_bucket="grow",
        service_rung=1,
        partner_outcome="Funnel report with baseline conversion %.",
        kpi="Drop-off stage identified with numeric baseline",
        done_when="Analytics brief registered",
    ),
    "Distribution Ops": partner_fields(
        operator_summary="Acquire bucket — email, directories, referral loops (drafts only).",
        value_bucket="acquire",
        service_rung=2,
        partner_outcome="One distribution channel draft per run.",
        kpi="Distribution artifact ready for operator review",
        done_when="Distribution outcome registered",
    ),
    "Lead Ops": partner_fields(
        operator_summary="Acquire bucket — qualify and enrich leads via CE read-only.",
        value_bucket="acquire",
        service_rung=1,
        partner_outcome="Lead score + firmographic notes for operator.",
        kpi="Leads qualified with score rationale",
        done_when="Lead ops brief registered",
    ),
    "Sales Copy Ops": partner_fields(
        operator_summary="Grow bucket — proposals with ROI math vs manual hours.",
        value_bucket="grow",
        service_rung=2,
        partner_outcome="Proposal draft with four-blank scope footer.",
        kpi="Proposal includes bucket, KPI, baseline, 60-day target",
        done_when="hitl_propose_action queued for send review",
    ),
    "Pipeline Analyst": partner_fields(
        operator_summary="Grow bucket — pipeline hygiene and win/loss patterns.",
        value_bucket="grow",
        service_rung=1,
        partner_outcome="Pipeline report with stage counts.",
        kpi="Stale deals flagged with days-in-stage",
        done_when="Pipeline analysis registered",
    ),
    "Revenue Intel": partner_fields(
        operator_summary="Reanks revenue signals — hypothesis register for operator.",
        value_bucket="grow",
        service_rung=None,
        partner_outcome="Ranked feature/signal list from hive-revenue-sensors.",
        kpi="Top 3 ranked signals with scores",
        done_when="product.hypothesis.proposed or sensor outcome registered",
    ),
    "Market Scout": partner_fields(
        operator_summary="Rung 1 research — competitive briefs and Thiel choke-point angles.",
        value_bucket="acquire",
        service_rung=1,
        partner_outcome="Market brief with monopoly wedge for one product.",
        kpi="Competitive + choke-point section in brief",
        done_when="research.market_brief registered",
    ),
    "Finance Ops": partner_fields(
        operator_summary="Rung 3 signals — AR, spend vs breaker, cash flow drafts.",
        value_bucket="cut",
        service_rung=3,
        partner_outcome="Finance snapshot with spend vs $15 API breaker.",
        kpi="API spend % of breaker documented",
        done_when="Finance ops outcome registered",
    ),
    "Scoreboard Keeper": partner_fields(
        operator_summary="Tracks 20hr/week business survival scoreboard rollup.",
        value_bucket="grow",
        service_rung=None,
        partner_outcome="WEEKLY_SCOREBOARD updated with hours + bucket focus.",
        kpi="Business hours tagged vs 20hr/week target",
        done_when="Scoreboard delta registered",
    ),
    "Client Delivery Lead": partner_fields(
        operator_summary="Rung 3 retainer lane — onboarding, proofs, support, retention.",
        value_bucket="grow",
        service_rung=3,
        partner_outcome="Client delivery packet or retention signal per run.",
        kpi="Onboarding or retention artifact drafted",
        done_when="Delivery outcome registered",
    ),
    "Client Enablement Partner": partner_fields(
        operator_summary="Rung 0 — teach clients the AI OS; ship morning-brief template ($100–500 session).",
        value_bucket="grow",
        service_rung=0,
        partner_outcome="Client enablement session outline + morning brief template.",
        kpi="1-hour enablement agenda + brief automation spec",
        done_when="enablement.session registered with deliverable list",
    ),
    "AI Audit Partner": partner_fields(
        operator_summary="Rung 1 — paid audit: workflow map, constraint ID, project proposal with four blanks.",
        value_bucket="cut",
        service_rung=1,
        partner_outcome="10–40 page audit outline + scoped project proposal.",
        kpi="Constraint identified front-to-back with KPI baseline",
        done_when="audit.scope registered with four-blank footer filled",
    ),
    "Day Planner": partner_fields(
        operator_summary="Looks at Gmail + Calendar every weekday morning and builds your day plan.",
        value_bucket="ops",
        service_rung=0,
        partner_outcome="Calendar + actionable email summary with top 3 actions.",
        kpi="Day plan delivered by 07:15 on weekdays",
        done_when="ops.day_plan registered or chat summary delivered",
    ),
    "Full Stack Builder": partner_fields(
        operator_summary="Rung 2 craft — Next.js/API vertical slices; use GitHub plugin for n8n-cursor context.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Scoped code draft or PR plan with DONE_WHEN.",
        kpi="Typecheck-clean slice spec",
        done_when="Build outcome registered; big refactors → Cursor",
    ),
    "Quality Engineer": partner_fields(
        operator_summary="Test coverage and PR review — keeps builds in production 13%.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Test plan or review notes for active slice.",
        kpi="Coverage gap list for touched files",
        done_when="QA outcome registered",
    ),
    "Platform Engineer": partner_fields(
        operator_summary="DevOps, performance, automation tooling proposals.",
        value_bucket="cut",
        service_rung=2,
        partner_outcome="Infra or perf audit with numeric baseline.",
        kpi="Lighthouse or compose proposal with DONE_WHEN",
        done_when="Platform outcome registered",
    ),
    "Web Studio": partner_fields(
        operator_summary="Portfolio and landing craft — public proof for Acquire bucket.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Landing or portfolio surface draft.",
        kpi="One web artifact spec per phase rotation",
        done_when="Web studio outcome registered",
    ),
    "Web Ops": partner_fields(
        operator_summary="a11y, analytics, DNS checklists — Cut-cost web hygiene.",
        value_bucket="cut",
        service_rung=2,
        partner_outcome="Web ops checklist with pass/fail items.",
        kpi="a11y or analytics gap count",
        done_when="Web ops outcome registered",
    ),
    "Video Studio": partner_fields(
        operator_summary="Video edit and clip pipelines — portfolio proof content.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Cut plan or clip pipeline spec.",
        kpi="One video deliverable spec per run",
        done_when="Video outcome registered",
    ),
    "Motion & Finish": partner_fields(
        operator_summary="AE/motion/grade — finish craft for proofs.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Motion comp or grade checklist.",
        kpi="One motion deliverable spec",
        done_when="Motion outcome registered",
    ),
    "Godot Engineer": partner_fields(
        operator_summary="Godot game engineering — docs-driven patterns.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Godot slice spec or bug repro notes.",
        kpi="One godot.engineering outcome per run",
        done_when="Gaming engineering outcome registered",
    ),
    "Game Studio": partner_fields(
        operator_summary="Fused game design, art, levels, audio, playtest.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="One game phase doc per rotation.",
        kpi="Game phase artifact with DONE_WHEN",
        done_when="Game studio outcome registered",
    ),
    "Animation Studio": partner_fields(
        operator_summary="2D/3D animation pipeline craft.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Animation phase deliverable spec.",
        kpi="One animation phase doc",
        done_when="Animation outcome registered",
    ),
    "Visual Design": partner_fields(
        operator_summary="Illustration, brand, photo — visual portfolio proofs.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Visual concept or brand draft.",
        kpi="One visual artifact spec",
        done_when="Visual design outcome registered",
    ),
    "Media Producer": partner_fields(
        operator_summary="Music, podcast, long-form content production specs.",
        value_bucket="craft",
        service_rung=2,
        partner_outcome="Media production plan for one format.",
        kpi="One media deliverable outline",
        done_when="Media outcome registered",
    ),
    "Mac Automation Engineer": partner_fields(
        operator_summary="Mac-side launchd/shell automation for operator AI OS.",
        value_bucket="cut",
        service_rung=2,
        partner_outcome="Mac automation script or launchd spec.",
        kpi="One automation reduces manual minutes/week",
        done_when="Mac automation outcome registered",
    ),
    "Data Analyst": partner_fields(
        operator_summary="Metrics rollup feeding scoreboard and case studies.",
        value_bucket="grow",
        service_rung=1,
        partner_outcome="Metrics table with baseline numbers.",
        kpi="KPI table with baseline column filled",
        done_when="Analytics outcome registered",
    ),
    "AI & Learning": partner_fields(
        operator_summary="AI experiments and learning curriculum drafts.",
        value_bucket="craft",
        service_rung=0,
        partner_outcome="Learning module or model experiment note.",
        kpi="One learning artifact per run",
        done_when="Learning outcome registered",
    ),
    "Web Intelligence Hunter": partner_fields(
        operator_summary="Deep OSINT — web, social, YouTube, papers → cited dossier.",
        value_bucket="acquire",
        service_rung=1,
        partner_outcome="Multi-source dossier enabling audit/GTM decision.",
        kpi="≥3 cited sources with recommendation",
        done_when="Dossier saved + research.web_intel registered",
    ),
}


def infer_roster_meta(display_name: str, category: str, lane: str, squad: str) -> dict[str, Any]:
    if display_name in ROSTER_PARTNER:
        return dict(ROSTER_PARTNER[display_name])
    bucket = "craft" if category == "craft" else "ops"
    if lane in ("gtm", "marketing") or squad.startswith("product-gtm"):
        bucket = "acquire"
    elif lane in ("sales", "delivery", "finance", "revenue"):
        bucket = "grow"
    elif lane == "engineering":
        bucket = "craft" if category == "craft" else "ops"
    return partner_fields(
        operator_summary=f"AI partner for {display_name} — one measurable outcome per run.",
        value_bucket=bucket,
        service_rung=2 if category == "business" else None,
        partner_outcome=f"Registered outcome with bucket note for {lane} lane.",
        kpi=f"One {lane} deliverable with operator next step",
        done_when="Outcome registered with summary + correlationId",
    )


def apply_partner_meta(rec: dict[str, Any]) -> dict[str, Any]:
    name = rec["displayName"]
    meta = ROSTER_PARTNER.get(name) or infer_roster_meta(
        name, rec["category"], rec["lane"], rec["squad"]
    )
    rec.update(meta)
    return rec


def partner_mission_header(rec: dict[str, Any]) -> str:
    rung = rec.get("serviceRung")
    rung_txt = f"Rung {rung}" if rung is not None else "Ops"
    return (
        f"FOR OPERATOR: {rec.get('operatorSummary', '')}\n"
        f"VALUE BUCKET: {rec.get('valueBucket', 'ops').upper()} | SERVICE RUNG: {rung_txt}\n"
        f"PARTNER OUTCOME: {rec.get('partnerOutcome', '')}\n"
    )


def enrich_business_mission(rec: dict[str, Any], body: str) -> str:
    header = partner_mission_header(rec)
    footer = SCOPE_CHECK if rec.get("category") == "business" else ""
    parts = [header, body.strip()]
    if footer:
        parts.append(footer)
    parts.append(f"Playbook: {PLAYBOOK_PATH}")
    return "\n\n".join(p for p in parts if p)


def core_operator_summary(name: str) -> str:
    return CORE_PARTNER.get(name, {}).get("operatorSummary", f"Core hive agent: {name}")
