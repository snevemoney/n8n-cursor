---
name: script-beat-motion
description: >-
  Timestamped script → mark beats → enrich unsourced numbers →
  one graphic per beat. Use when Creative or Publishing needs
  motion on spoken moments, not a page wrap or a raw clip grade.
  Cursor plus Grok Bot. Status WIRED (not accepted forever).
---

# Script-beat motion

**Owner:** Creative Studio (graphics) · Publishing Engine (insert / package). **Stack:** Cursor + Grok Bot.  
**Cursor copy:** `.cursor/skills/script-beat-motion/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/script-beat-motion/SKILL.md`  
**Status:** WIRED 2026-08-14 from `RDytbVDzMF4` (Jack Roberts). Not accepted forever.

**Source (caption-only):** `RDytbVDzMF4` @ 12:06–16:16 — RTF/timed transcript → skill finds beats → research-enrich stats the speaker did not say → generate graphics → save. Levels 1–4 on the same tape (data chart, font lock, one icon pack, Lottie/still) are **parts**, not this skill’s whole job.

**Dissent (do not flatten):**
- Claude Design / Claude Code / Firecrawl-as-required = **on-tape**. Do not install. Hive research = existing CLI + `filter-then-llm`.
- `motion-grade-pipeline` = still → video → upscale → color → timing (a **plate**). This skill = motion **on a spoken beat**.
- `clip-factory` = long → shorts. This skill does not cut the A-roll.
- `cinematic-recipe` = page wrap. Font/style-lock from this tape **merges there**; do not clone a second page skill.
- Tape $0.22 / 93% tokens / $8 icon plan / OpenAI 700 vs Claude 595 = **UNVERIFIED**.

## When

A timestamped script exists (`packets/{id}/full.txt` + timed captions, or an operator voice script) and Evens wants graphics that land **on beats**, for Path C preview or a named cut. Not a cinematic landing. Not a world-model.

## Card

```
SCRIPT: path to timed transcript or voice script
BEATS: N moments (quote + timestamp)
NUMBERS: sourced | research | drop
STYLE: one font + one icon/Lottie pack (or none)
OUT: files on disk
PUBLISH: HITL
```

## Steps

1. Read the timed script. Do not invent clicks or a visual timeline.
2. Mark beats where a graphic would **explain** (chart, comparison, icon, still) — not decorate.
3. For every number: already said → use; not said → research with `filter-then-llm` or **drop**. Do not invent.
4. Lock slop checks from the same tape: named font; one icon style; optional Higgsfield still (`motion-grade-pipeline` / `higgsfield-ae-vectors` if it is a plate).
5. One graphic per beat. Save under `CONTENT/creative/` (or the packet). Watchdog opens the path.
6. Insert / schedule / publish = Evens (`clip-factory` package only).

## Stop

Publish / paid boost / new scrape vendor / font buy = Evens.

## Never

Claude Design/Code · Firecrawl as a required new vendor · invent chart numbers · mix icon packs · auto-insert into a live video · quote tape $ as FACT · send / pay / deploy / book / publish
