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


def extra_for(name: str) -> str:
    if name == "Researcher":
        return """
RESEARCHER ONLY (after YOUR take file has a roll-up):
- Do not merge until Evens says keep AND all 17 files under takes/ have a filled Roll-up (not the stub).
- Then merge unique voices into LESSONS-FROM-TAPE.md. Keep each desk's wording. Do not flatten to CUT or one Cursor voice.
- Source of truth = the 17 take files, not LESSONS-FROM-TAPE.cursor-draft.md.
- Learn ≠ hunt. Do not add an ICP or business-lanes.json row. Do not rotate off Normand."""
    if name == "Librarian":
        return """
LIBRARIAN ONLY (after YOUR take file has a roll-up):
- Same merge gate as Researcher: wait until Evens keeps and 17 roll-ups exist. Persist what Evens keeps — not Cursor quarantine as the scoreboard.
- Do not overwrite another desk's take file. Do not promote tape $ or job-loss % as FACT."""
    if name == "Big Boss":
        return """
BIG BOSS ONLY (after YOUR take file has a roll-up):
- You may list which take files exist. Do not rewrite other desks.
- Do not rotate the live hunt. Normand stay. This mission is learning, not a new lane."""
    return ""


def mission(name: str, slug: str) -> str:
    card = f"docs/hive/outer-heaven/CONTENT/job-cards/{slug}.md"
    take = f"docs/hive/outer-heaven/CONTENT/job-cards/takes/{slug}.md"
    fallback = f"~/.grokbot/research-packets/{CORRELATION}/{slug}.md"
    return f"""MISSION — Independent transcript walk (operator-ordered fleet run)

You are {name}. Cowork with Evens. This prompt is yours alone. Do not write anyone else's take. Do not wait for another agent. Do not summarize for the hive — do the walk.

EVENS IS THE VISIONARY:
- Cursor fetches, wires, dispatches. Cursor does not pre-vote the never-list. Do not copy LESSONS-FROM-TAPE.cursor-draft.md. Do not flatten to CUT.
- Job card is the lens, not a muzzle. Ugly tapes stay in the room. Steal the machine even from extreme sources (many surfaces → one destination, dashboard as proof, parallel workers, redirect panel, speed, close).
- Operate ≠ learn. Do not build farms, OTP, fake identity, mass-DM, betting, auto-dial.
- This is a RUN. Do not stop at can-act.
- tape-self-teach's "do not re-walk the old 18" does NOT apply when Evens ordered a fleet walk.

LOAD (in this order):
1. {card}
2. scripts/hive/grok-skills/ai-native-operator-doctrine.md
3. scripts/hive/grok-skills/tape-self-teach.md
4. scripts/hive/grok-skills/agent-as-hire.md
5. scripts/hive/grok-skills/info-gain-cite.md
6. scripts/hive/grok-skills/solo-then-consult.md
7. Your stub only: {take}

THEN read each full.txt in corpus order (chunk the two huge ones). Skip = fail.

CORPUS (18):
{CORPUS}

WRITE only this file: {take}
If the repo write fails, write the same markdown to {fallback} and say so.

FORMAT (replace the stub — do not leave TODOs):
- For each of the 18 videos: **Transcript said** (4–8 sentences from THAT full.txt) + **{name} take** (2–5 sentences only {name} would write). Bring the machine.
- After video 18: **Roll-up** with Skills / Other business (named, parked — not a hunt) / Leverage / QoL / one Never.
- Skills may be existing or (proposed) + one-line job. No cap.
- One never = what this desk will not **operate**, not what it will not look at.
- Learning ≠ hunt. Do not add an icp_id or a business-lanes.json row.

HARD NEVER on this mission:
- Do not edit LESSONS-FROM-TAPE.md
- Do not edit another desk's take file
- Do not send / pay / deploy / book / publish
- Do not draft or send Normand
- Do not auto-write SKILL.md files
- Do not quote transcript $ or job-loss % as FACT
- Do not rotate the live hunt
- Do not skip a tape because a Cursor draft said CUT
{extra_for(name)}

DONE_WHEN: {take} has 18 takes + one roll-up, written in your voice.
Then register (best-effort):
python3 scripts/hive/grok-hive-tool.py --grok-agent "{name}" --tool scorpion_register_outcome --params '{{"correlationId":"{CORRELATION}","jobType":"research.tape_self_teach","status":"done","summary":"{name} independent 18-transcript walk","target":"outer-heaven"}}'
"""


def targets(agent: str | None = None) -> list[tuple[str, str]]:
    rows = list(AGENTS)
    if not agent:
        return rows
    picked = [row for row in rows if row[0] == agent]
    if not picked:
        raise SystemExit(f"Unknown core agent: {agent}")
    return picked
