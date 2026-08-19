# Hive knowledge store

Intermediate knowledge system. **One system:** five layers + compiler + three audits + multimodal traces + capability acquisition.

**Never:** retrieve → blend everything.  
**Always:** retrieve → compare → condition → synthesize → audit.

Skills: `knowledge-architecture` · `workflow-compiler` · `knowledge-audit` · `multimodal-youtube-learning` · `capability-acquisition`  
Raw SSOT: [RAW.md](RAW.md) — `packets/{id}/full.txt` + `PACKET.md`. **Never overwrite raw.**  
Steal machines (pointer only): [../watch-later/STEAL_SHEET.md](../watch-later/STEAL_SHEET.md)

This directory starts **empty of atoms**. Do not dump the 146 packets here unless Evens names that slice.

## Video ≠ transcript

A transcript only captures what was said. Useful YouTube knowledge is also in what was shown, clicked, sequenced, emphasized, skipped, repeated, demonstrated, compared, and visually implied.

Treat a video as a **multimodal behavior trace**, not a transcript. Protocol: `multimodal-youtube-learning`.

**Caption-only packets (hive default):** extract declared knowledge + sequence-from-speech. Mark demonstrated/click atoms `evidence_status: transcript-implied` or `unobserved`. Flag visual/click `UNKNOWN`. **Do not invent clicks from a caption.**

## Five layers

| Layer | Path | Rule |
|-------|------|------|
| 1 Raw | `../watch-later/packets/{id}/full.txt` + `PACKET.md` | Ground truth. Never copy-overwrite into this folder. |
| 2 Atoms | [atoms/](atoms/INDEX.md) | One unit per tactic/principle/warning/step/example/claim/metric/decision-rule. Versioned. |
| 3 Graph | [graph/](graph/INDEX.md) · [mismatches/](mismatches/INDEX.md) · [behaviors/](behaviors/INDEX.md) | Relationships + contradictions + ordered sequences. Never flatten. |
| 4 Patterns | [patterns/](patterns/INDEX.md) | Derived. Point back to atom ids. SUPPORT / DISSENT / VALID_WHEN. Demo counts + creator counts. Not truth. |
| 5 Workflows | [workflows/](workflows/INDEX.md) | Compiled **per named project**. Provenance required. Three audits. |

Fragments for later assembly: [fragments/](fragments/INDEX.md).  
Creator OS (versioned, not a clone): [creators/](creators/INDEX.md).

## Four tape outputs (never flatten into one summary)

Most tapes demonstrate a built agent / automated workflow / agent technique. Desks do **capability acquisition**, not generic-knowledge-only.

| Output | Meaning | Path |
|--------|---------|------|
| **KNOWLEDGE** | “I learned something.” | [atoms/](atoms/INDEX.md) + [graph/](graph/INDEX.md) |
| **SKILL** | “I learned how to do something.” | [skill-candidates/](skill-candidates/INDEX.md) — existing desk + **part**, UNTESTED |
| **SYSTEM UPGRADE** | “Better way for agents to operate.” | [system-upgrades/](system-upgrades/INDEX.md) — infra, not a desk skill, UNTESTED |
| **OPPORTUNITY** | “We can now do something we couldn’t.” | [capabilities/](capabilities/INDEX.md) + [opportunities/](opportunities/INDEX.md) |

Under a demo: [primitives/](primitives/INDEX.md) (e.g. EVENT-DRIVEN AGENT LOOP), not the YouTuber SKU name.

**Principle:** Agents learn globally, specialize locally, and upgrade the system when a lesson is infrastructural.

Do not auto-install SKILL.md. Do not clone Nate into every desk. Caption-only: no invented APIs / prompts / clicks.

## WORDS / BEHAVIOR / PATTERNS / OUTCOMES → layers

| Learning layer | Meaning | Storage |
|----------------|---------|---------|
| **WORDS** | What humans say they know | Layer 1 speech. Layer 2 `declared` + `modality=speech`. |
| **BEHAVIOR** | What humans actually do | Layer 2 `demonstrated` / `implicit`. Layer 3 `behaviors/` + `mismatches/`. |
| **PATTERNS** | What repeatedly works across humans | Layer 4 only. Counts + exceptions, not semantic merge. |
| **OUTCOMES** | Action → context → result (when evidence exists) | Outcome / `failure` atoms. Experience database, not an advice library. Do not invent. |

## Do-not-flatten

- Never merge two lessons just because they are semantically similar.
- Merge only when conditions, goals, and contexts are compatible.
- Store contradictions separately (`conflicts_with`, `dissent_ids`, `mismatches/`).
- Never average “never discount” with “discount aggressively.”
- Never average 7/50 “start in code” with 43/50 “competitors first.”
- Speech≠behavior is a first-class object. Do not pick a winner.
- Patterns do not delete atoms.

## Tape write flow

```
full.txt + PACKET
  → deep-video-learning A–K + multimodal 15-step (caption-honest)
  → takes/{id}/{slug}.md (A–L + Steal)
  → packets/{id}/LEARNED.md
  → atoms/by-video/{id}.jsonl
  → capability-acquisition: 6 extractions + upgrade/opportunity flags (UNTESTED)
  → (later) patterns
  → (later named project) workflow-compiler + knowledge-audit
```

## Project ask

Operator names a project → `workflow-compiler` → `knowledge-audit`.  
Do not compile the corpus into one workflow.

## Never

Overwrite `full.txt` · merge LESSONS · dump 146 this turn · invent clicks/APIs/prompts · Frankenstein blend · auto-install SKILL.md · clone Nate · new DB/vendor · spawn 17 · unpark clients
