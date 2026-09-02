---
name: saylor-mentor-pass
description: >-
  End of a Cursor or Grok sitting: pick LANE, 1–3 university skills, write
  PUT-IN-SYSTEM + LEVERAGE + NEXT, emit vault mentor report. Use when Evens
  is building and needs the catalog to mentor him, not dump courses.
  Cursor plus Grok Bot.
---

# Saylor mentor pass

**Owner:** Consultant (mentor) · sitting desk (emit) · Librarian (facts)
**Stack:** Cursor + Grok Bot
**Cursor copy:** `.cursor/skills/saylor-mentor-pass/SKILL.md`
**Grok `/` copy:** `~/.grokbot/skills/saylor-mentor-pass/SKILL.md`
**Status:** WIRED 2026-09-02. Not accepted forever.

**Router:** `saylor-course-skill`
**Map:** `CONTENT/topics/saylor-leverage-map.md`
**Facts:** `live-facts-card.md` → `live-facts-hive-os.md` | `live-facts-agency.md`
**CLI:** `python3 scripts/hive/os/saylor-mentor-pass.py`

## When

End of a sitting that built, scoped, wrote, or decided anything about the hive OS or the agency. Evens says “mentor me” / “what do I put in the system.” Grok Consultant on demand.

## Card

```
LANE: hive-os | agency
SITTING: one sentence what we just did
SKILLS: 1–3 slugs (speak-sheet / leverage map)
PUT-IN-SYSTEM: file or blank to fill (not an essay)
LEVERAGE: which desk + what AI actually did
NEXT: one action · HITL if send/pay/deploy/book/publish
```

No LANE → ask once. No invented KPI. Do not dump the catalog.

## Steps

1. Name **LANE**. Load that facts card. Blanks stay blank.
2. Match the sitting to **1–3** rows on `saylor-leverage-map.md` (hive-os table or agency table). Load those COURSE-SKILL masters only.
3. Write the card. PUT-IN-SYSTEM is a path or a blank Evens can say once.
4. Emit: `python3 scripts/hive/os/saylor-mentor-pass.py --lane <lane> --sitting "…" --slugs a,b [--emit --desk consultant --host cursor]`
5. Confirm vault `CONTENT/os/reports/mentor.md`. That report is STATE (replace). Daily line is EVENT (append) only if something happened.
6. Hand execution to the desk on the speak-sheet row. Consultant does not ship.

## Grok Consultant (on demand)

Same card. Brief already injects the mentor block. Pick 1–3. Do not list 42.

## Cursor (every sitting)

After the bite, before you call the sitting done: this pass **or** an honest skip (“no hive/site/money in this sitting”). Skip is allowed. Silence is not.

## Stop

Send / pay / deploy / book / publish = Evens.

## Never

Dump 42 skills · invent a KPI · merge hive-os $ with agency $ · exam reconstruction · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
