---
name: multimodal-youtube-learning
description: >-
  Treat a YouTube video as a multimodal behavior trace, not a
  transcript. Fifteen-step protocol: said vs shown, click patterns,
  implicit tricks, speech≠behavior, failures, decision points, tool
  strategy, visual evidence, creator OS. Use with deep-video-learning
  or when the operator says multimodal / behavior trace / what they
  clicked. Caption-only packets must not invent clicks. Cursor plus Grok.
---

# Multimodal YouTube learning

A transcript only captures what was said. Useful YouTube knowledge is also in what was shown, clicked, sequenced, emphasized, skipped, repeated, demonstrated, compared, and visually implied.

Agents must treat a YouTube video as a **multimodal behavior trace**, not a transcript.

**Core rule:** What did they actually do? In what order? What did they click? What did they repeatedly check? What failed? What expertise was never explained?

**Parent:** `knowledge-architecture`  
**Study host:** `deep-video-learning` (A–K still required)  
**Cursor copy:** `.cursor/skills/multimodal-youtube-learning/SKILL.md`  
**Write:** `knowledge/behaviors/` · `fragments/` · `mismatches/` · atoms with `knowledge_type` + `modality`

## Hive constraints

- Stack: Cursor + Grok only. No new video-vision vendor.
- Cursor capture: `cursor-video-watch` (installed). Living YouTube tab → `packets/{id}/watch.json`. Grok Bot keeps Grok computer watch. Caption-only until that capture runs.
- Caption-only packets: do **not** invent clicks, menus, or UI paths.
- Do not watch or scrape pixels unless Evens names that slice.
- Do not dump the 146. Do not overwrite `full.txt`. Do not spawn 17.
- Clients parked. Tape $ UNVERIFIED.

## Caption-only vs full-video

| Evidence on disk | Extract | Do not |
|------------------|---------|--------|
| `full.txt` only (typical hive packet) | **declared** + **sequence-from-speech**. Decision IFs the speaker said. Failures they narrated. | Invent a click path. Upgrade implied UI to `observed`. |
| Speech names a tool chain (“Trends → reviews → Reddit…”) | Store as an **ordered behavior** with `evidence_status=transcript-implied`. | Compress to “Research the market.” |
| Visual / click not in captions | Flag `modality` visual/click as `unobserved` or `UNKNOWN`. | Hallucinate the dashboard. |
| HITL later (`cursor-video-watch` or Grok computer watch → `watch.json`) | Then `observed` demonstrated atoms. | Backfill 146 from memory. |

`edit-signal` (zoom, highlight, replay, chapter length) = **weak signal only**. Not factual proof.

## Four knowledge types — NEVER mix unlabeled

| Type | Meaning |
|------|---------|
| **DECLARED** | What they explicitly teach |
| **DEMONSTRATED** | What they actually show |
| **IMPLICIT** | Inferred from repeated behavior |
| **SYSTEM SYNTHESIS** | Comparing this video with other sources |

Map to atom `knowledge_type`: `declared` \| `demonstrated` \| `implicit` \| `synthesis`.

## 15-step protocol

Run after the transcript is read (Deep Video Learning step 1). Do not replace A–K. Feed B, D, E, F, H and the atom emit.

### 1. Observe what happens

Record: said / shown / action / screen change / tool / before-after / result.  
Store **speech** and **behavior** separately when they diverge.

### 2. Extract behavioral procedures as executable sequences

Never compress “Opened Trends → Amazon reviews → Reddit → Similarweb → ads library → then positioning” into “Research the market.”  
Write the ordered chain. One fragment: input → steps → output.

### 3. Detect click patterns

Repeated pages, menus, filters, queries, sort, tabs, tool chains, copy/paste, shortcuts, UI paths.  
Caption-only: only what speech reports; mark `transcript-implied` or `UNKNOWN`.

### 4. Learn implicit tricks

Tag `implicit-technique` even if never explained. `knowledge_type=implicit`. Never write as “speaker said.”

### 5. Detect repeated patterns

Candidate heuristics with **occurrence count + confidence within that creator**. Not a global law.

### 6. Compare speech vs behavior

Store `stated principle` vs `observed behavior`. Do not assume either is correct. The discrepancy is knowledge. Write `knowledge/mismatches/`.

### 7. Capture failures and recoveries

Troubleshooting branch: goal, attempt, failure, symptom, diagnosis, correction, outcome, lesson.  
**Never drop failed attempts.** `modality=failure`.

### 8. Extract decision points

`IF [condition] → choose [action]`. Not only the final action.

### 9. Tool strategy

`GOAL → TOOL → INPUT → OUTPUT → DECISION`.  
Not “Uses Ahrefs.”

### 10. Visual evidence

Meaning of dashboards / graphs / tables / sites / spreadsheets / code / prompts / settings / diagrams / before-after.  
Not pixels-as-truth. Caption-only → `UNKNOWN` unless they read the number aloud.

### 11. Editing / emphasis = weak signals only

Zoom, highlight, replay, chapter length. Not factual proof. `modality=edit-signal`.

### 12. Cross-video creator OS

persist / changed / replaced tools / evolved advice / disappeared techniques.  
Versioned creator operating system under `knowledge/creators/`.  
Do not flatten into one worldview. Do not dump the channel this turn.

### 13. Label the four knowledge types

Every unit gets exactly one primary type. Synthesis stays synthesis.

### 14. Preserve temporal sequence and dependencies

A before B; B inputs C; C gates D.  
`before` / `requires` on atoms. Sequences live in `behaviors/`, not a bag of tips.

### 15. Generate reusable workflow fragments

`input → steps → output` for later assembly (`knowledge/fragments/`).  
Fragments are not a compiled project workflow. Compiler comes later.

After observe/extract (steps 1–15), run `capability-acquisition`: the six + system-upgrade / opportunity flags. A click-trace without a capability is unfinished. Candidates stay UNTESTED.

## Write targets (do not invent rows for 146)

| Object | Path |
|--------|------|
| Atoms | `knowledge/atoms/by-video/{id}.jsonl` |
| Sequences | `knowledge/behaviors/` |
| Fragments | `knowledge/fragments/` |
| Speech≠behavior | `knowledge/mismatches/` |
| Creator OS | `knowledge/creators/` (index only until a named slice) |

Validate atoms: `python3 scripts/hive/knowledge-emit-atoms.py --validate --file …`

## Related

| Skill | Job |
|-------|-----|
| `deep-video-learning` | Host protocol. A–L must ask shown / clicked / sequenced / failed / retried / implicit / speech≠behavior. |
| `knowledge-architecture` | Layers + integrity |
| `capability-acquisition` | After this protocol: capability / primitive / desk parts / upgrades |
| `workflow-compiler` | Assembles fragments later, per project |
| `channel-walk` | Ingest captions. This skill does not scrape pixels. |
| `cursor-video-watch` | Cursor host: living YouTube tab → `packets/{id}/watch.json`. Grok Bot: Grok computer watch. THEN `analyze-video-watch-output`. |

## Never

- Invent click traces from captions
- Compress a tool chain into a slogan
- Drop failures
- Treat edit emphasis as proof
- Mix unlabeled knowledge types
- Build a creator-clone personality
- Watch/scrape the 146 this slice
- New vision vendor
- Overwrite `full.txt` / spawn 17 / unpark clients
