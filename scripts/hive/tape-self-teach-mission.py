"""Shared tape-self-teach mission text for Cursor spawn and Grok dispatch."""
from __future__ import annotations

CORRELATION = "tape-self-teach-20260814"

AGENTS: list[tuple[str, str]] = [
    ("Big Boss", "big-boss"),
    ("Day Planner", "day-planner"),
    ("Watchdog", "watchdog"),
    ("HITL Operator", "hitl-operator"),
    ("Money Desk", "money-desk"),
    ("Lead Hunter", "lead-hunter"),
    ("Product GTM", "product-gtm"),
    ("Researcher", "researcher"),
    ("Forge", "forge"),
    ("Creative Studio", "creative-studio"),
    ("Consultant", "consultant"),
    ("Librarian", "librarian"),
    ("Wealth Manager", "wealth-manager"),
    ("Personal CFO", "personal-cfo"),
    ("Career Strategist", "career-strategist"),
    ("Communications Manager", "communications-manager"),
    ("Publishing Engine", "publishing-engine"),
]

# Historical 2026-08-14 fleet walk. Do not inject into new missions.
# Do not re-walk unless Evens names these ids. Do not re-walk the Nate 82.
CORPUS = """1. 13eo8dWa1Gw — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/13eo8dWa1Gw/full.txt
2. TL8V41Ea6oM — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/TL8V41Ea6oM/full.txt
3. sboNwYmH3AY — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/sboNwYmH3AY/full.txt
4. eMPWBunaOic — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/eMPWBunaOic/full.txt
5. kwSVtQ7dziU — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/kwSVtQ7dziU/full.txt  (chunk — ~15k words)
6. IVx8OSMbTss — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/IVx8OSMbTss/full.txt  (chunk — ~34k words)
7. EzQAgnjTq2k — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/EzQAgnjTq2k/full.txt
8. hGdG-04TkDs — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/hGdG-04TkDs/full.txt
9. IWdvG9Up8Mc — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/IWdvG9Up8Mc/full.txt
10. whIp1SOahOM — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/whIp1SOahOM/full.txt
11. nS2FrgXN-EY — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/nS2FrgXN-EY/full.txt
12. mjg_JUMar04 — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/mjg_JUMar04/full.txt
13. ESIxitOLYoQ — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/ESIxitOLYoQ/full.txt
14. I7mpF7_pnPM — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/I7mpF7_pnPM/full.txt
15. f4mI3d-nTrI — ~/.grokbot/research-packets/watchlater-15-20260813/transcripts/f4mI3d-nTrI/full.txt
16. Ums8suyAG1A — ~/.grokbot/research-packets/video-nate-herk-agentic-ai-manager-Ums8suyAG1A/transcripts/full.txt
17. kpMreA9ATOo — ~/.grokbot/research-packets/video-julian-goldie-grok-seo-kpMreA9ATOo/transcripts/full.txt
18. QIsJe-nZ5XE — ~/.grokbot/research-packets/video-nate-herk-sell-workflows-QIsJe-nZ5XE/transcripts/full.txt"""


def extra_for(name: str, video_id: str | None) -> str:
    packet = (
        f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{video_id}/LEARNED.md"
        if video_id
        else "docs/hive/outer-heaven/CONTENT/watch-later/packets/{id}/LEARNED.md"
    )
    if name == "Researcher":
        return f"""
RESEARCHER ONLY (after YOUR take has A–L + Steal / Operate-never):
- Merge A–K AND stolen machines (SOURCE / INFERENCE / SYSTEM SYNTHESIS tagged) into {packet}. No L. Do not flatten disagreements.
- Evens skipped merge 2026-08-14. Takes stay SSOT. Do not merge LESSONS-FROM-TAPE.md. Do not ask again. Do not Load the cursor-draft.
- Learn ≠ hunt. Do not add an ICP or business-lanes.json row. Do not rotate off Normand.
- Steal-after-global: never understand-only; never steal-first.
- Channel / social: load `channel-walk` (YouTube) or `social-source-ingest` (other public surfaces). Then `steal-usecases` / `catalog-demand-match`. Do not spawn 17×N."""
    if name == "Librarian":
        return f"""
LIBRARIAN ONLY (after YOUR take has A–L + Steal / Operate-never):
- Merge A–K AND stolen machines into {packet} with Researcher. Keep desk dissent labeled. Do not overwrite another desk's take.
- Evens skipped merge 2026-08-14. Takes stay SSOT. Do not merge LESSONS-FROM-TAPE.md. Do not ask again. Do not Load the cursor-draft.
- Persist what Evens keeps into OPERATOR_MEMORY / CHRONICLE.
- Do not promote tape $ or job-loss % as FACT."""
    if name == "Big Boss":
        return """
BIG BOSS ONLY (after YOUR take has A–L + Steal / Operate-never):
- You may list which take files exist. Do not rewrite other desks.
- Do not rotate the live hunt. Clients parked. This mission is learning + steal, not a new lane.
- Parent routes `channel-walk` / `coverage-loop`. Do not spawn 17×N."""
    return ""


def mission(name: str, slug: str, video_id: str | None = None) -> str:
    card = f"docs/hive/outer-heaven/CONTENT/job-cards/{slug}.md"
    if video_id:
        take = f"docs/hive/outer-heaven/CONTENT/job-cards/takes/{video_id}/{slug}.md"
        full_txt = f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{video_id}/full.txt"
        tape_line = f"TAPE: {video_id}\nREAD the entire file: {full_txt}\nChunk if huge. Skip = fail."
        done_when = f"{take} has header + A–L + Steal / Operate-never, written in your voice."
    else:
        take = f"docs/hive/outer-heaven/CONTENT/job-cards/takes/{{video_id}}/{slug}.md"
        tape_line = (
            "TAPE: parent must name a video_id. Do not default to the 2026-08-14 18-corpus. "
            "Do not re-walk the Nate 82. STOP and say video_id is missing."
        )
        done_when = "STOP — no video_id. Do not invent a tape. Do not walk the old 18."
    fallback = f"~/.grokbot/research-packets/{CORRELATION}/{slug}.md"
    return f"""MISSION — Independent Deep Video Learning walk (one tape)

You are {name}. Cowork with Evens. This prompt is yours alone. Do not write anyone else's take. Do not wait for another agent. Do not summarize — reconstruct, then steal.

EVENS IS THE VISIONARY:
- Cursor fetches, wires, dispatches. Cursor does not pre-vote the never-list. Do not copy LESSONS-FROM-TAPE.cursor-draft.md. Do not flatten to CUT.
- Job card is the lens, not a muzzle. Ugly tapes stay in the room.
- Operate ≠ learn. Do not build farms, OTP, fake identity, mass-DM, betting, auto-dial. Steal the machine anyway.
- Steal-after-global: A–K first, then Steal / Operate-never, then L. Never understand-only. Never steal-first / skip the transcript. Old short steal/never take is not enough.
- Clients parked. Do not re-walk the Nate 82 unless Evens says.

LOAD (in this order):
1. {card}
2. scripts/hive/grok-skills/deep-video-learning.md
3. scripts/hive/grok-skills/tape-self-teach.md
4. scripts/hive/grok-skills/ai-native-operator-doctrine.md
5. scripts/hive/grok-skills/steal-usecases.md
6. scripts/hive/grok-skills/checkable-stop.md
7. scripts/hive/grok-skills/verify-after-browser.md — only if you click / type / navigate this session

{tape_line}

CHECKABLE_STOP (required — skill checkable-stop):
DONE-CHECK: {done_when}
CAP: 1 tape · 1 desk file · no 17×N
COST: this session only; do not arm overnight or Cursor /loop
STOP-KIND: metric

VERIFY_AFTER_BROWSER (only if you click / type / navigate this session — skill verify-after-browser):
IF Cursor (this IDE / Task) → cursor-ide-browser. Not Chrome. Not Playwright. Not browser-use.
IF Grok Bot → Grok Bot’s own web browser. Do not call Cursor MCP.
ACT / EXPECTED / OBSERVED / COMPARE / NEXT after each act.
Caption-only tape: do not invent click traces. Skip this card if you did not use the browser.

ASSUME_IT_WILL_TOUCH (required — skill assume-it-will-touch):
ALLOW: write {take} only
DENY: send / pay / deploy / book / publish · other desks' takes · LESSONS merge
TERRITORY: that one take file
MAX-TURNS: 1 tape
BYPASS: none

WRITE only this file: {take}
If the repo write fails, write the same markdown to {fallback} and say so.

FORMAT (deep-video-learning — do not leave TODOs; never skip a section):
- Short header (desk, status, video id)
- A–K globally (Source Map, Atomic Knowledge, Mental Models, Procedures, Examples, Decision Rules, Contrarian, Assumptions, Questions, Connections, Future-Use)
- **Steal / Operate-never** after K, before L — informed by A–K (why / conditions / exceptions / procedures from D / examples from E). Another desk must be able to execute or critique this block. Not a skim one-liner.
- L last — role-specific only
- Epistemic labels: SOURCE / INFERENCE / SYSTEM SYNTHESIS
- Tape $ = UNVERIFIED. Learning ≠ hunt. Do not add an icp_id or a business-lanes.json row.

HARD NEVER on this mission:
- Do not edit LESSONS-FROM-TAPE.md
- Do not edit another desk's take file
- Do not send / pay / deploy / book / publish
- Do not draft or send Normand
- Do not auto-write SKILL.md files
- Do not quote transcript $ or job-loss % as FACT
- Do not rotate the live hunt
- Do not skip a tape because a Cursor draft said CUT
- Do not re-walk the Nate 82
- Do not walk the old 18 unless Evens names those ids
{extra_for(name, video_id)}

DONE_WHEN: {done_when}
Then register (best-effort):
python3 scripts/hive/grok-hive-tool.py --grok-agent "{name}" --tool scorpion_register_outcome --params '{{"correlationId":"{CORRELATION}","jobType":"research.tape_self_teach","status":"done","summary":"{name} deep-video-learning walk","target":"outer-heaven"}}'
"""


def targets(agent: str | None = None) -> list[tuple[str, str]]:
    rows = list(AGENTS)
    if not agent:
        return rows
    picked = [row for row in rows if row[0] == agent]
    if not picked:
        raise SystemExit(f"Unknown core agent: {agent}")
    return picked
