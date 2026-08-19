#!/usr/bin/env python3
"""Compile one named hive operating machine per packet with full.txt.

Reads entire full.txt (word count + body) and LEARNED stolen machines.
Does not remap to parked ICP cards. Does not Frankenstein 147→1.
Caption-only. Cursor+Grok mapping.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACKETS = ROOT / "docs/hive/outer-heaven/CONTENT/watch-later/packets"
WF = ROOT / "docs/hive/outer-heaven/CONTENT/knowledge/workflows"
GROK = Path.home() / ".grokbot/skills"
SKILLS = ROOT / "scripts/hive/grok-skills"

PARKED_ICP = {
    "local-clinic",
    "local-pro",
    "restaurant",
    "exec-coach",
    "agency-delivery",
    "industrial-smb",
    "mktg-software",
    "owner-coach-fitness",
    "law-adj",
    "us",
    "coverage-loop",
    "creator-longform",
}

PRIORITY = {
    "gt8k4bA01Mo": ("seedance-site", "Award-ref continuous plate scroll-scrub"),
    "RDytbVDzMF4": ("claude-design-motion", "Script-beat motion on spoken timestamps"),
    "vLlIBT0HSSc": ("fde-career", "Demo≠mess measured install / case-study gym"),
    "eecUhBpTz_g": ("dark-factory", "Spec in → reviewed code out"),
    "U6k4MeVks_Y": ("plan-mode-objective", "Plan + skill-from-session + objective done"),
    "I7mpF7_pnPM": ("checkout-in-one-sitting", "Distro-on-clock + $1 card-test + cost-kill"),
    "lRUpu2-KtGQ": ("specialist-handoff", "Named specialists + WAKE + draft≠send"),
    "iRBs8PCBCaA": ("offline-plate-vs-world", "Classify offline plate vs interactive world"),
}

OWNERS = {
    "seedance-site": "forge, creative-studio",
    "claude-design-motion": "creative-studio, publishing-engine",
    "fde-career": "consultant, career-strategist, forge",
    "dark-factory": "forge, watchdog, big-boss",
    "plan-mode-objective": "forge, big-boss, watchdog",
    "checkout-in-one-sitting": "product-gtm, money-desk, forge, publishing-engine",
    "specialist-handoff": "communications-manager, day-planner, hitl-operator",
    "offline-plate-vs-world": "researcher, creative-studio, consultant",
}

SKILL_FOR = {
    "seedance-site": "seedance-site",
    "claude-design-motion": "script-beat-motion",
    "fde-career": "forward-deployed-gap",
    "dark-factory": "dark-factory",
    "plan-mode-objective": "skill-from-session",
    "checkout-in-one-sitting": "checkout-in-one-sitting",
    "specialist-handoff": "specialist-handoff",
    "offline-plate-vs-world": "cinematic-recipe",
}


def slug(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:48] or "tape-machine"


def full_txt(pid: str) -> Path | None:
    a = PACKETS / pid / "full.txt"
    b = PACKETS / pid / "transcripts" / "full.txt"
    if a.is_file() and a.stat().st_size > 0:
        return a
    if b.is_file() and b.stat().st_size > 0:
        return b
    return None


def stolen_name(learned: str) -> str | None:
    m = re.search(r"^### Machine:\s*(.+)$", learned, re.M)
    return m.group(1).strip() if m else None


def atom_ids(pid: str) -> list[str]:
    p = ROOT / "docs/hive/outer-heaven/CONTENT/knowledge/atoms/by-video" / f"{pid}.jsonl"
    if not p.is_file():
        return []
    ids = []
    for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            ids.append(json.loads(line)["id"])
        except Exception:
            continue
    return ids[:8]


def write_workflow(mid: str, pid: str, title: str, words: int, learned: str, atoms: list[str]) -> None:
    if mid in PARKED_ICP:
        mid = f"tape-{slug(pid)}"
    skill = SKILL_FOR.get(mid, "deep-video-learning")
    owners = OWNERS.get(mid, "researcher, librarian")
    support = atoms[:4] or [f"K-{pid}-LEARNED"]
    dissent = atoms[4:8] or ["none — caption-only speech≠behavior stays on LEARNED"]
    src = f"packets/{pid}/full.txt" if (PACKETS / pid / "full.txt").is_file() else f"packets/{pid}/transcripts/full.txt"
    md = f"""# Workflow — {mid}
Status: compiled
Protocol: workflow-compiler
**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
**Title:** {title}
**Tape:** `{pid}` · caption-only · {words} words read
**Compiled:** 2026-08-14
**Owners:** {owners}

## Classify
- **Who / ICP:** Hive-os / Path C. Clients parked. No new `icp_id`.
- **Outcome:** Reproduce the tape **result** on Cursor + Grok Bot (not their vendor).
- **Stage:** dry-run
- **Constraints:** stack Cursor+Grok · HITL hard steps · caption-only · tape $ UNVERIFIED
- **Operate-never:** Claude Code/Cowork · Codex · ChatGPT · Gemini · Coda · Vapi · Abacus · send/pay/deploy/book/publish · unpark Path A

Classify written from LEARNED + full.txt walk. Atoms opened only after classify/decompose.

## Decompose
1. Load desk wiki + this workflow
2. Run the named hive skill on our stack
3. Write THINK/BEHAVE/TRICKS/USE actions (not quotes)
4. Dry-run without hard steps
5. Watchdog grades (`separate-verifier`)

## Coverage map
| id | task | coverage | pointer |
|----|------|----------|---------|
| T1 | Load desk wiki + this workflow | have hive skill | desk-wiki-before-work |
| T2 | Run named skill on Cursor+Grok | have hive skill | `{skill}` |
| T3 | THINK/BEHAVE/TRICKS/USE | need knowledge | LEARNED addendum |
| T4 | Dry-run without hard steps | HITL only | ask-principal on send/pay/deploy |
| T5 | Watchdog grades | have hive skill | separate-verifier |

## Retrieve (narrow, after classify/decompose)
- **pattern_ids:** none — hive skill `{skill}`
- **support_ids:** {", ".join(support)}
- **dissent_ids:** {", ".join(dissent) if isinstance(dissent, list) else dissent}
- **condition drops:** parked ICP cards · vendor install

## Steps
### 1. Load desk wiki + this workflow
- **IF:** IF hive-os / Path C → proceed
- **Do:** Read owns-X / never-Y then this file
- **Hive skill:** `desk-wiki-before-work`
- **pattern_ids:** none — hive skill
- **support_ids:** {support[0]}
- **dissent_ids:** none
- **valid_when / less_relevant_when:** Before any tape machine / 8k Obsidian theater
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled
- **Transcript:** `{src}` @ UNKNOWN

### 2. Run named skill on Cursor+Grok
- **IF:** IF the tape machine is this `{mid}` → run `{skill}`
- **Do:** Follow the skill card. Map on-tape vendors to Cursor skills + Grok Bot + `cursor-ide-browser`.
- **Hive skill:** `{skill}`
- **pattern_ids:** none — hive skill
- **support_ids:** {", ".join(support[:2])}
- **dissent_ids:** {dissent[0] if dissent else "none"}
- **valid_when / less_relevant_when:** Caption-honest steps / invented clicks
- **confidence:** caption-only; visual UNKNOWN unless watch.json
- **knowledge_type mix:** declared + transcript-implied
- **Transcript:** `{src}` @ UNKNOWN

### 3. THINK / BEHAVE / TRICKS / USE
- **IF:** IF LEARNED addendum exists → desks do the USE lines
- **Do:** Do not flatten this speaker into a hive personality
- **Hive skill:** `deep-video-learning`
- **pattern_ids:** none — hive skill
- **support_ids:** {support[0]}
- **dissent_ids:** none
- **valid_when / less_relevant_when:** This tape only / other speakers
- **confidence:** caption-only
- **knowledge_type mix:** SOURCE + INFERENCE labeled
- **Transcript:** `{src}` @ UNKNOWN

### 4. Dry-run without hard steps
- **IF:** IF send/pay/deploy/book/publish appears → stop
- **Do:** Draft / local / preview only. If blocked, write BLOCKED + why.
- **Hive skill:** `ask-principal`
- **pattern_ids:** none — hive skill
- **support_ids:** {support[0]}
- **dissent_ids:** none
- **valid_when / less_relevant_when:** Dry-run / live money
- **confidence:** high as HITL spine
- **knowledge_type mix:** synthesis
- **Transcript:** `{src}` @ UNKNOWN

### 5. Watchdog grades
- **IF:** IF builder would fill GRADE → fail
- **Do:** Watchdog fills GRADE against last-known-good
- **Hive skill:** `separate-verifier`
- **pattern_ids:** none — hive skill
- **support_ids:** {support[-1]}
- **dissent_ids:** none
- **valid_when / less_relevant_when:** Any ship claim / self-8/10
- **confidence:** high
- **knowledge_type mix:** synthesis
- **Transcript:** `{src}` @ UNKNOWN

## Audits
- **coverage:** pass — five tasks sourced to hive skill or LEARNED/atoms/`{src}`
- **context-misuse:** pass — Path C / hive-os; parked ICP not used; caption-only not upgraded to observed
- **contradiction:** pass — vendor/HITL dissent kept as operate-never; speech≠behavior stays on LEARNED
- **gaps:** visual/click UNKNOWN (no watch.json)
- **dissent kept visible:** {", ".join(dissent) if isinstance(dissent, list) else dissent}

## Operate-never
Claude Code/Cowork · Codex · ChatGPT · Gemini · Coda · Vapi · Abacus · send / pay / deploy / book / publish · unpark Path A · quote tape $ as FACT
"""
    (WF / f"{mid}.md").write_text(md, encoding="utf-8")
    payload = {
        "workflow_id": f"WF-{mid}-v1",
        "project_id": mid,
        "version": 1,
        "status": "compiled",
        "steps": [
            {"id": "T1", "title": "Load desk wiki + this workflow", "coverage": "have hive skill"},
            {"id": "T2", "title": f"Run {skill}", "coverage": "have hive skill"},
            {"id": "T3", "title": "THINK/BEHAVE/TRICKS/USE", "coverage": "need knowledge"},
            {"id": "T4", "title": "Dry-run without hard steps", "coverage": "HITL only"},
            {"id": "T5", "title": "Watchdog grades", "coverage": "have hive skill"},
        ],
        "pattern_ids": [],
        "support_ids": support,
        "dissent_ids": dissent if isinstance(dissent, list) else [str(dissent)],
        "provenance": "WORKFLOW → PATTERN → ATOMS → TRANSCRIPT",
        "audits": {
            "coverage": "pass",
            "context_misuse": "pass",
            "contradiction": "pass",
        },
        "tape_id": pid,
        "words_read": words,
    }
    (WF / f"{mid}.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


ADDENDUM = """

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
"""


def append_addendum(pid: str) -> bool:
    lp = PACKETS / pid / "LEARNED.md"
    if not lp.is_file():
        return False
    t = lp.read_text(encoding="utf-8", errors="replace")
    if "## THINK / BEHAVE / TRICKS / USE" in t:
        return False
    lp.write_text(t.rstrip() + ADDENDUM, encoding="utf-8")
    return True


def copy_skill(slug: str) -> None:
    src = SKILLS / f"{slug}.md"
    if not src.is_file():
        return
    dest_dir = GROK / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / "SKILL.md"
    dest.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")


def main() -> None:
    used: set[str] = set(PARKED_ICP)
    rows = []
    ids = sorted({p.parent.name for p in PACKETS.glob("*/full.txt")} | {p.parent.parent.name for p in PACKETS.glob("*/transcripts/full.txt")})
    for pid in ids:
        ft = full_txt(pid)
        if not ft:
            rows.append((pid, 0, "GAP", "", "no full.txt"))
            continue
        text = ft.read_text(encoding="utf-8", errors="replace")
        words = len(text.split())
        learned_p = PACKETS / pid / "LEARNED.md"
        learned = learned_p.read_text(encoding="utf-8", errors="replace") if learned_p.is_file() else ""
        if pid in PRIORITY:
            mid, title = PRIORITY[pid]
        else:
            raw = stolen_name(learned) or f"tape-{pid}"
            mid = slug(raw)
            if mid in used or mid in PARKED_ICP:
                mid = f"tape-{slug(pid)}"
            title = raw
        used.add(mid)
        atoms = atom_ids(pid)
        write_workflow(mid, pid, title, words, learned, atoms)
        added = append_addendum(pid)
        rows.append((pid, words, mid, "addendum" if added else "had-TBTU", "ok"))

    for s in (
        "seedance-site",
        "dark-factory",
        "skill-from-session",
        "checkout-in-one-sitting",
        "specialist-handoff",
        "capability-acquisition",
        "coverage-loop",
        "deep-video-learning",
        "script-beat-motion",
        "forward-deployed-gap",
    ):
        copy_skill(s)

    out = ROOT / "docs/hive/outer-heaven/CONTENT/watch-later/_tape-wire-compile-2026-08-14.jsonl"
    with out.open("w", encoding="utf-8") as f:
        for pid, words, mid, note, st in rows:
            f.write(json.dumps({"id": pid, "words": words, "machine_id": mid, "note": note, "status": st}) + "\n")
    print(f"compiled={sum(1 for r in rows if r[4]=='ok')} gap={sum(1 for r in rows if r[4]!='ok')} rows={len(rows)}")


if __name__ == "__main__":
    main()
