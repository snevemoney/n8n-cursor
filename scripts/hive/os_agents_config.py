#!/usr/bin/env python3
"""Central config for the 17-agent EVENS AI Operating System.

SSOT for Grok provisioning, rename/retire cleanup, agent cards, and
build_agent_spec() output consumed by grokbot-setup-agents.py.

Scenario detail: scripts/hive/agent-scenarios.py (17 × 20 bank).
Can-act gate: scripts/hive/product-state.py --can-act + os/should-run.py
"""
from __future__ import annotations

from typing import Any, TypedDict

# ---------------------------------------------------------------------------
# 1. Core roster (exactly 17 — order is canonical)
# ---------------------------------------------------------------------------

CORE_AGENT_NAMES: tuple[str, ...] = (
    "Big Boss",
    "Day Planner",
    "Watchdog",
    "HITL Operator",
    "Money Desk",
    "Lead Hunter",
    "Product GTM",
    "Researcher",
    "Forge",
    "Creative Studio",
    "Consultant",
    "Librarian",
    "Wealth Manager",
    "Personal CFO",
    "Career Strategist",
    "Communications Manager",
    "Publishing Engine",
)

BIG_BOSS_UPDATE_ID = "dfdd58ba-7f17-45b3-83ce-3b522e0a6f10"

# ---------------------------------------------------------------------------
# 2. Rename map — old Grok display name → new OS name (history preserved)
# ---------------------------------------------------------------------------

RENAME_MAP: dict[str, str] = {
    "Watchdog Ops": "Watchdog",
    "CE & Leads": "Money Desk",
    "Scout Lead Gen": "Lead Hunter",
    "Forge Builder": "Forge",
    "Web Intelligence Hunter": "Researcher",
    "ProofCheck GTM": "Product GTM",
    "AI Audit Partner": "Consultant",
    "Vault Librarian": "Librarian",
}

# Reverse lookup: new name → old name (for rename_from in build_agent_spec)
_RENAME_FROM: dict[str, str] = {new: old for old, new in RENAME_MAP.items()}

# ---------------------------------------------------------------------------
# 3. Retired agents — delete from Grok (~35); fusedInto → surviving agent
# ---------------------------------------------------------------------------


class RetiredAgent(TypedDict):
    name: str
    fusedInto: str


RETIRED_AGENTS: list[RetiredAgent] = [
    # Former core 13 (not carried forward as-is)
    {"name": "Life & Business Ops", "fusedInto": "Watchdog"},
    {"name": "n8n Automation", "fusedInto": "Forge"},
    {"name": "Telegram Console", "fusedInto": "Communications Manager"},
    {"name": "Engineering Lead", "fusedInto": "Forge"},
    {"name": "Security Reviewer", "fusedInto": "Watchdog"},
    # Former roster — product GTM squad
    {"name": "SENTINEL GTM", "fusedInto": "Product GTM"},
    {"name": "ClipEngine GTM", "fusedInto": "Product GTM"},
    {"name": "TrendSpotter GTM", "fusedInto": "Product GTM"},
    {"name": "Growth & SEO Lead", "fusedInto": "Product GTM"},
    {"name": "Funnel Optimizer", "fusedInto": "Product GTM"},
    # Former roster — growth / pipeline
    {"name": "Distribution Ops", "fusedInto": "Publishing Engine"},
    {"name": "Lead Ops", "fusedInto": "Lead Hunter"},
    {"name": "Sales Copy Ops", "fusedInto": "Lead Hunter"},
    {"name": "Pipeline Analyst", "fusedInto": "Money Desk"},
    {"name": "Revenue Intel", "fusedInto": "Money Desk"},
    {"name": "Market Scout", "fusedInto": "Researcher"},
    {"name": "Finance Ops", "fusedInto": "Money Desk"},
    {"name": "Scoreboard Keeper", "fusedInto": "Librarian"},
    {"name": "Client Delivery Lead", "fusedInto": "Consultant"},
    {"name": "Client Enablement Partner", "fusedInto": "Consultant"},
    # Former roster — engineering
    {"name": "Full Stack Builder", "fusedInto": "Forge"},
    {"name": "Quality Engineer", "fusedInto": "Forge"},
    {"name": "Platform Engineer", "fusedInto": "Forge"},
    {"name": "Web Studio", "fusedInto": "Forge"},
    {"name": "Web Ops", "fusedInto": "Forge"},
    {"name": "Mac Automation Engineer", "fusedInto": "Forge"},
    # Former roster — creative
    {"name": "Video Studio", "fusedInto": "Creative Studio"},
    {"name": "Motion & Finish", "fusedInto": "Creative Studio"},
    {"name": "Godot Engineer", "fusedInto": "Creative Studio"},
    {"name": "Game Studio", "fusedInto": "Creative Studio"},
    {"name": "Animation Studio", "fusedInto": "Creative Studio"},
    {"name": "Visual Design", "fusedInto": "Creative Studio"},
    {"name": "Media Producer", "fusedInto": "Creative Studio"},
    # Former roster — research / analytics
    {"name": "Data Analyst", "fusedInto": "Librarian"},
    {"name": "AI & Learning", "fusedInto": "Researcher"},
]

# ---------------------------------------------------------------------------
# 4. Agent cards — compact identity for each permanent agent
# ---------------------------------------------------------------------------

Lane = str  # strategy | life | business | comms | build | intelligence | memory | safety
HitlLevel = str  # L0 | L1 | L2 | L3 | L4


class AgentCard(TypedDict, total=False):
    title: str
    lane: Lane
    job: str
    runs_when: str
    solves: str
    handoff_to: str
    hitl_level: HitlLevel
    suppression_note: str
    research_capabilities: str


AGENT_CARDS: dict[str, AgentCard] = {
    "Big Boss": {
        "title": "Chief of staff",
        "lane": "strategy",
        "job": "Set daily priorities across life, business, wealth, and projects; arbitrate ownership conflicts.",
        "runs_when": "Morning brief, urgent interrupts, weekly review, or agent escalation.",
        "solves": "Attention overload — one ranked focus list instead of 17 competing voices.",
        "handoff_to": "Specialists by domain; never hoard calendar, code, or money lanes.",
        "hitl_level": "L1",
        "suppression_note": "When calm: still give a short status (3 bullets). Skip only manufactured busywork — never ignore the operator.",
    },
    "Day Planner": {
        "title": "Daily schedule architect",
        "lane": "life",
        "job": "Build realistic weekday plans from calendar, deadlines, and project state.",
        "runs_when": "Weekday 07:00 routine or Big Boss / Communications handoff.",
        "solves": "Calendar chaos — protected focus blocks and prep time before meetings.",
        "handoff_to": "Big Boss (conflicts), HITL Operator (approval tasks in plan).",
        "hitl_level": "L1",
        "suppression_note": "Draft-only — never send email or accept invites (Tier 3).",
    },
    "Watchdog": {
        "title": "Control plane & uptime",
        "lane": "safety",
        "job": "Ingest events, dedupe, run health smokes, route failures, track API cost.",
        "runs_when": "Every 6h cron, hive.heartbeat, agent.failed, or infra alert events.",
        "solves": "Silent breakage — golden paths, smokes, disk, and CI drift surfaced early.",
        "handoff_to": "Forge (fixable code/CI), HITL Operator (prod heal), Big Boss (rollup).",
        "hitl_level": "L0",
        "suppression_note": "Always may RUN on heartbeat; read-only heal unless operator approves.",
    },
    "HITL Operator": {
        "title": "Approval gateway",
        "lane": "safety",
        "job": "Surface L3/L4 decisions with standard APPROVE/EDIT/REJECT format and /pro links.",
        "runs_when": "approval.requested, morning digest, or blocked requires_human projects.",
        "solves": "Tier 3 queue blindness — money, send, deploy, secrets never auto-execute.",
        "handoff_to": "Big Boss (conflicts), Librarian (approval reasoning log).",
        "hitl_level": "L3",
        "suppression_note": "Never approves money/send/deploy — operator on https://evenslouis.ca/pro only.",
    },
    "Money Desk": {
        "title": "Business finance ops",
        "lane": "business",
        "job": "Track business revenue, expenses, subscriptions, pipeline economics, and runway.",
        "runs_when": "transaction.detected, month-end, or Product GTM / Lead Hunter handoff.",
        "solves": "Business cash blind spots — MRR, CAC, margins, unpaid invoices.",
        "handoff_to": "Product GTM (pricing), Lead Hunter (pipeline value), HITL Operator (spend).",
        "hitl_level": "L4",
        "suppression_note": "OBSERVE + ADVISE only — never move money or mutate CE deals (read /pro).",
    },
    "Lead Hunter": {
        "title": "Prospect discovery",
        "lane": "business",
        "job": "Find, enrich, and rank ICP-matching prospects; draft warm outreach context.",
        "runs_when": "lead.discovered, Product GTM signals offer validated, or manual prospect ask.",
        "solves": "Empty pipeline — qualified leads with pain-fit, not spray-and-pray spam.",
        "handoff_to": "Consultant (qualified reply), Money Desk (deal economics).",
        "hitl_level": "L3",
        "suppression_note": "WAIT until offer_validated; suppressed when lifecycle ∈ {idea, planning, development}.",
    },
    "Product GTM": {
        "title": "Product owner & launch",
        "lane": "business",
        "job": "Own positioning, launch readiness, growth experiments, and product-state milestones.",
        "runs_when": "Project lifecycle ≥ beta/launch_ready, or explicit operator GTM request.",
        "solves": "Build-without-market-fit — validates demand before Forge burns cycles.",
        "handoff_to": "Forge (bugs/build), Lead Hunter (prospects), Creative Studio (assets), HITL Operator (launch).",
        "hitl_level": "L2",
        "suppression_note": "Suppressed while lifecycle ∈ {idea, planning, specification, development} unless asked.",
        "research_capabilities": "consumer: competitor demo mining, comment analysis via standard/deep tiers",
    },
    "Researcher": {
        "title": "Evidence & OSINT",
        "lane": "intelligence",
        "job": "Gather cited evidence; label FACT/INFERENCE/OPINION/UNVERIFIED; produce Research Packets for JIT learning.",
        "runs_when": "Big Boss routes research, specialist KNOWLEDGE_GAP, Wealth Manager stock ask, Forge needs primary docs.",
        "solves": "Hype-driven decisions — verifiable briefs and progressive video/social research before money or build commits.",
        "handoff_to": "Product GTM, Wealth Manager, Career Strategist, Consultant, Forge (packet delivery).",
        "hitl_level": "L0",
        "suppression_note": "Browser read-only — bounded budgets per docs/os/RESEARCH.md; never blind-trust video/social.",
        "research_capabilities": "jit_owner: progressive video L1-L4, packet builder, multi-source OSINT",
    },
    "Forge": {
        "title": "Autonomous engineer",
        "lane": "build",
        "job": "Full dev loop: reproduce → branch → fix → test → PR → CI → staging smoke → handoff.",
        "runs_when": "current_owner=Forge in product-state, repo events, or Watchdog failure route.",
        "solves": "Shipping bottleneck — vertical slices with DONE_WHEN instead of doc-only plans.",
        "handoff_to": "Researcher (confidence <0.65 unfamiliar libs), Product GTM, HITL Operator, Watchdog.",
        "hitl_level": "L2",
        "suppression_note": "Assess confidence before unfamiliar stacks; delegate deep research to Researcher.",
        "research_capabilities": "consumer: request packet; quick_verify tier for known stacks",
    },
    "Creative Studio": {
        "title": "Visual & media creation",
        "lane": "build",
        "job": "Design, video concepts, motion, game art, UI specs — creates assets, not distribution.",
        "runs_when": "Product GTM / Publishing Engine request creative, or THEMES portfolio work.",
        "solves": "Weak proof artifacts — landing visuals, demos, and brand consistency.",
        "handoff_to": "Publishing Engine (finished assets), Forge (UI implementation specs).",
        "hitl_level": "L2",
        "suppression_note": "Wait when product lifecycle too early; never CE money tools.",
        "research_capabilities": "consumer: multi-video style profiling via packet + L4 watch skill",
    },
    "Consultant": {
        "title": "Strategic client advisor",
        "lane": "business",
        "job": "Audits, proposals, ROI memos, discovery — may disagree with Big Boss.",
        "runs_when": "Lead Hunter qualified handoff, client opportunity, or audit engagement.",
        "solves": "Feature-request traps — constraint-first scope with four-blank footer.",
        "handoff_to": "Forge (scoped build), Money Desk (deal terms), HITL Operator (client send).",
        "hitl_level": "L2",
        "suppression_note": "Propose-only for client-facing send — hitl_propose_action, never auto-send.",
    },
    "Librarian": {
        "title": "Memory & chronicle",
        "lane": "memory",
        "job": "Capture decisions, goals, lessons, scoreboard; maintain OPERATOR_MEMORY with provenance.",
        "runs_when": "Daily capture cycle, postmortems, or Big Boss precedent lookup.",
        "solves": "Institutional amnesia — searchable memory without receipt-level noise.",
        "handoff_to": "Big Boss (precedent), Wealth Manager (thesis history), Product GTM (hypotheses).",
        "hitl_level": "L1",
        "suppression_note": "Never delete chronicle or vault notes without operator Tier 3.",
    },
    "Wealth Manager": {
        "title": "Portfolio intelligence",
        "lane": "life",
        "job": "Portfolio review, thesis tracking, benchmark vs S&P, opportunity research.",
        "runs_when": "Market open days, sharp drawdowns, Friday review, or Big Boss capital ask.",
        "solves": "Reactive investing — evidence-based watchlists without autonomous trades.",
        "handoff_to": "Researcher (deep dive), HITL Operator (any trade — L4 human only).",
        "hitl_level": "L4",
        "suppression_note": "No autonomous trading — execution always human on /pro or broker.",
        "research_capabilities": "strict hierarchy: SEC/filings → official → datasets → analysis; social/video = hypothesis only",
    },
    "Personal CFO": {
        "title": "Personal finance strategy",
        "lane": "life",
        "job": "Savings rate, runway, major purchases, housing, debt, wealth trajectory planning.",
        "runs_when": "Payday, month-end, large purchase signal, or Career Strategist exit modeling.",
        "solves": "Personal cash confusion — strategy layer above Money Desk business ops.",
        "handoff_to": "Wealth Manager (investable surplus), Career Strategist (quit math), HITL Operator (large spend).",
        "hitl_level": "L2",
        "suppression_note": "Advise only — no account access or money movement.",
    },
    "Career Strategist": {
        "title": "Work & compensation",
        "lane": "life",
        "job": "Comp analysis, accomplishment tracking, negotiation prep, exit-to-entrepreneurship planning.",
        "runs_when": "Employer email routed, review season, or operator career decision.",
        "solves": "Under-leveraged career — documented wins and market comps before asks.",
        "handoff_to": "Researcher (salary data), Personal CFO (quit runway), Communications Manager (drafts).",
        "hitl_level": "L2",
        "suppression_note": "Never send employment email without HITL Operator L3 approval.",
        "research_capabilities": "consumer: job-listing vs day-in-the-life video contrast via packet",
    },
    "Communications Manager": {
        "title": "Email triage & drafts",
        "lane": "comms",
        "job": "Classify inbox, label/archive noise, summarize important threads, draft replies.",
        "runs_when": "email.received events, morning triage, or contact follow-up due.",
        "solves": "Inbox attention tax — relationship-aware triage without unrestricted sending.",
        "handoff_to": "Day Planner (deadlines), Money Desk (receipts), Career Strategist (employer), HITL Operator (send).",
        "hitl_level": "L3",
        "suppression_note": "Send matrix: read/classify/draft=yes; business/employment/financial send=always HITL.",
    },
    "Publishing Engine": {
        "title": "Content distribution",
        "lane": "comms",
        "job": "Repurpose, metadata, scheduling, platform formatting, analytics ingestion (Studio creates).",
        "runs_when": "content.ready and lifecycle ≥ beta; launch-day coordination with Product GTM.",
        "solves": "Creation-without-distribution — multi-platform publish pipeline with HITL preview.",
        "handoff_to": "Creative Studio (assets), HITL Operator (publish), Product GTM (launch timing).",
        "hitl_level": "L3",
        "suppression_note": "Suppressed until beta/launch_ready; brand-sensitive content always HITL.",
    },
}

# ---------------------------------------------------------------------------
# 5. build_agent_spec — compact Grok profile for grokbot-setup-agents.py
# ---------------------------------------------------------------------------

_SCENARIOS_REF = "scripts/hive/agent-scenarios.py"
_CAN_ACT_REF = "python3 scripts/hive/product-state.py --can-act AGENT PROJECT"


def _compact_description(name: str, card: AgentCard) -> str:
    """One-screen agent card + pointers to scenarios and can-act gate."""
    return (
        f"You are {name} — {card['title']} ({card['lane']} lane).\n\n"
        f"JOB: {card['job']}\n"
        f"RUNS: {card['runs_when']}\n"
        f"SOLVES: {card['solves']}\n"
        f"HANDOFF: {card['handoff_to']}\n"
        f"HITL: {card['hitl_level']} — {card['suppression_note']}\n\n"
        f"Before any routine: check can-act gate ({_CAN_ACT_REF}). "
        f"If decision ≠ RUN → explain why in plain English + ask the operator one clarifying question. "
        f"Never go silent.\n"
        f"Scenario bank (20 examples): {_SCENARIOS_REF} --agent \"{name}\"\n"
        f"OS spec: docs/os/MASTER_SPEC.md · Playbook: docs/hive/outer-heaven/AI_PARTNER_PLAYBOOK.md"
    )


def build_agent_spec(name: str) -> dict[str, Any]:
    """Return a grokbot-setup-agents.py agent dict for *name*.

    Keys: name, title, description; optional rename_from; optional update_id (Big Boss).
    """
    if name not in AGENT_CARDS:
        known = ", ".join(CORE_AGENT_NAMES)
        raise KeyError(f"Unknown agent {name!r}. Expected one of: {known}")

    card = AGENT_CARDS[name]
    spec: dict[str, Any] = {
        "name": name,
        "title": card["title"],
        "description": _compact_description(name, card),
    }

    if name in _RENAME_FROM:
        spec["rename_from"] = _RENAME_FROM[name]

    if name == "Big Boss":
        spec["update_id"] = BIG_BOSS_UPDATE_ID

    return spec


def all_agent_specs() -> list[dict[str, Any]]:
    """All 17 agent specs in canonical order."""
    return [build_agent_spec(name) for name in CORE_AGENT_NAMES]


def validate_config() -> list[str]:
    """Return list of validation errors (empty = OK)."""
    errors: list[str] = []

    if len(CORE_AGENT_NAMES) != 17:
        errors.append(f"CORE_AGENT_NAMES must have 17 entries, got {len(CORE_AGENT_NAMES)}")

    if len(set(CORE_AGENT_NAMES)) != 17:
        errors.append("CORE_AGENT_NAMES contains duplicates")

    missing_cards = [n for n in CORE_AGENT_NAMES if n not in AGENT_CARDS]
    if missing_cards:
        errors.append(f"AGENT_CARDS missing: {missing_cards}")

    extra_cards = [n for n in AGENT_CARDS if n not in CORE_AGENT_NAMES]
    if extra_cards:
        errors.append(f"AGENT_CARDS extras not in CORE_AGENT_NAMES: {extra_cards}")

    rename_targets = set(RENAME_MAP.values())
    bad_renames = rename_targets - set(CORE_AGENT_NAMES)
    if bad_renames:
        errors.append(f"RENAME_MAP targets not in CORE_AGENT_NAMES: {sorted(bad_renames)}")

    retired_names = {r["name"] for r in RETIRED_AGENTS}
    if len(retired_names) != len(RETIRED_AGENTS):
        errors.append("RETIRED_AGENTS contains duplicate names")

    overlap_core = retired_names & set(CORE_AGENT_NAMES)
    if overlap_core:
        errors.append(f"RETIRED_AGENTS overlaps CORE_AGENT_NAMES: {sorted(overlap_core)}")

    overlap_rename = retired_names & set(RENAME_MAP.keys())
    if overlap_rename:
        errors.append(f"RETIRED_AGENTS overlaps RENAME_MAP keys: {sorted(overlap_rename)}")

    bad_fused = [
        r["name"]
        for r in RETIRED_AGENTS
        if r["fusedInto"] not in CORE_AGENT_NAMES
    ]
    if bad_fused:
        errors.append(f"RETIRED_AGENTS invalid fusedInto for: {bad_fused}")

    if not (30 <= len(RETIRED_AGENTS) <= 40):
        errors.append(
            f"RETIRED_AGENTS expected ~35 entries, got {len(RETIRED_AGENTS)}"
        )

    return errors


def main() -> int:
    import argparse
    import json

    ap = argparse.ArgumentParser(description="EVENS AI OS agent config")
    ap.add_argument("--validate", action="store_true", help="Validate config consistency")
    ap.add_argument("--list", action="store_true", help="Print core agent names")
    ap.add_argument("--spec", metavar="AGENT", help="Print build_agent_spec JSON for one agent")
    ap.add_argument("--all-specs", action="store_true", help="Print all agent specs as JSON array")
    args = ap.parse_args()

    if args.validate:
        errs = validate_config()
        if errs:
            for e in errs:
                print(f"FAIL: {e}")
            return 1
        print(
            f"OK: {len(CORE_AGENT_NAMES)} agents, "
            f"{len(RENAME_MAP)} renames, {len(RETIRED_AGENTS)} retired"
        )
        return 0

    if args.list:
        for name in CORE_AGENT_NAMES:
            print(name)
        return 0

    if args.spec:
        print(json.dumps(build_agent_spec(args.spec), indent=2))
        return 0

    if args.all_specs:
        print(json.dumps(all_agent_specs(), indent=2))
        return 0

    ap.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
