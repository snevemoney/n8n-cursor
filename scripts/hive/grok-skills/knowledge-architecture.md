---
name: knowledge-architecture
description: >-
  Hive intermediate knowledge system: five layers plus compiler plus
  three audits plus multimodal YouTube traces plus capability
  acquisition. Use when storing tape knowledge, emitting atoms,
  compiling a project workflow, auditing a compile, or when the
  operator says knowledge architecture, knowledge graph, atoms,
  capability, or do not blend. Never retrieve then blend.
  Cursor plus Grok only.
---

# Knowledge architecture

**One system.** Five layers + compiler + three audits + multimodal traces + capability acquisition.

**Never:** retrieve → blend everything.  
**Always:** retrieve → compare → condition → synthesize → audit.

A transcript only captures what was said. Useful YouTube knowledge is also in what was shown, clicked, sequenced, emphasized, skipped, repeated, demonstrated, compared, and visually implied. Treat a video as a **multimodal behavior trace**, not a transcript. Protocol: `multimodal-youtube-learning`.

**Cursor copy:** `.cursor/skills/knowledge-architecture/SKILL.md`  
**Store:** `docs/hive/outer-heaven/CONTENT/knowledge/`  
**Raw SSOT:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/{id}/full.txt` + `PACKET.md`  
**Steal pointer:** `CONTENT/watch-later/STEAL_SHEET.md` (machines, not this graph)

Specialized agents are **operators with access to this textbook** — not copies of YouTubers, not one confused personality, not a Nate worldview.

**Principle:** Agents learn globally, specialize locally, and upgrade the system when a lesson is infrastructural.

Most tapes are capability demos. After atoms, run `capability-acquisition` (six extractions). Do not stop at generic knowledge. Candidates stay UNTESTED.

## Hive constraints

- Stack: Cursor + Grok only. On-tape vendors stay on-tape.
- Clients parked. No new `icp_id`. Do not unpark Normand.
- Hard steps HITL: send / pay / deploy / book / publish.
- Tape $ = UNVERIFIED.
- Never overwrite `full.txt`. Never merge `LESSONS-FROM-TAPE.md`.
- Do not dump the 146 packets into atoms unless Evens names that slice.
- Do not spawn 17 from this skill.
- Do not compile a Frankenstein workflow from the corpus.

## Five layers

| Layer | What | Where | Rule |
|-------|------|--------|------|
| 1 Raw source | `full.txt` + PACKET metadata (id, title, creator, date, timestamps, chunks). Later: HITL visual notes, never invented clicks. | `packets/{id}/` — see `knowledge/RAW.md` | Ground truth. **NEVER overwrite.** |
| 2 Atomic knowledge | One tactic / principle / warning / step / example / claim / metric / decision-rule per unit. From Deep Video Learning §B — write atoms **here**, not only inside a take. | `knowledge/atoms/by-video/{id}.jsonl` | Keep source, conditions, confidence, evidence, `knowledge_type`, `modality`. Version as sources accrue (`K-…` v4). |
| 3 Graph / ontology | domain, objective, stage, prerequisites, inputs, outputs, risk, evidence, applicability, dependencies, `conflicts_with`, `supports`. Speech-vs-behavior mismatches are objects. | atoms fields + `graph/edges.jsonl` + `mismatches/` | **NEVER merge** two lessons because they are semantically similar. Merge only when conditions, goals, and contexts are compatible. Store contradictions separately. |
| 4 Pattern synthesis | Versioned derived objects pointing **BACK** to atom ids. SUPPORT / DISSENT / VALID_WHEN / LESS_RELEVANT_WHEN / CONFIDENCE. May cite **demonstration counts** and **creator counts**. | `knowledge/patterns/` | Patterns do not delete atoms. Not “truth.” |
| 5 Project workflow | Classify → decompose (no retrieve yet) → coverage map → retrieve narrowly → condition → smallest workflow → three audits. | `knowledge/workflows/` | Provenance required. Skill: `workflow-compiler`. |

Sequence atoms and workflow **fragments** are ordered procedures, not a bag of tips (`behaviors/`, `fragments/`).

Capability objects sit **beside** the layers, not instead of them:

| Tape output | Lands on |
|-------------|----------|
| KNOWLEDGE | Layers 1–3 (atoms, graph, multimodal types) |
| Capability + workflow | `capabilities/` + `behaviors/` / `fragments/` (ordered; caption-honest) |
| Primitive | `primitives/` — may later support a layer-4 pattern |
| SKILL candidate | `skill-candidates/` — desk **part**, not a clone |
| SYSTEM UPGRADE | `system-upgrades/` — infra, all-agent, UNTESTED |
| OPPORTUNITY | `opportunities/` — new possible service; no new `icp_id` |
| Compiled project | Layer 5 only when Evens names a project |

## WORDS / BEHAVIOR / PATTERNS / OUTCOMES → layers

Three simultaneous learning layers, plus a fourth when evidence exists:

| Learning layer | Meaning | Lands on |
|----------------|---------|----------|
| **WORDS** | What humans say they know | Layer 1 speech in `full.txt`. Layer 2 atoms with `knowledge_type=declared`, `modality=speech`. |
| **BEHAVIOR** | What humans actually do | Layer 2 `demonstrated` / `implicit` atoms. Layer 3 sequences + `behaviors/` + `mismatches/`. |
| **PATTERNS** | What repeatedly works across humans | Layer 4 only, with demo counts + creator counts + exceptions. Not semantic similarity alone. |
| **OUTCOMES** | What happened afterward (action → context → result) | When evidence exists: outcome atoms / behavior `failure` branches. Experience database, not an advice library. Do not invent results. |

Do not mix these unlabeled.

## Four knowledge types (never mix unlabeled)

| Type | Meaning | Typical modality |
|------|---------|------------------|
| **declared** | What they explicitly teach | speech |
| **demonstrated** | What they actually show | screen, click, navigation, visual |
| **implicit** | Inferred from repeated behavior | click, navigation, timing, failure |
| **synthesis** | Comparing this video with other sources | any — must tag SYSTEM SYNTHESIS |

Also keep Deep Video Learning epistemic tags: **SOURCE** / **INFERENCE** / **SYNTHESIS** as `layer_tag`.

## Integrity fields (every atom)

Required on every unit:

`id` · `version` · `concept` · `claim` · `reasoning` · `mechanism` · `evidence` · `conditions` · `exceptions` · `action` · `confidence` · `evidence_type` · `knowledge_type` · `modality` · `evidence_status` · `source_video_id` · `timestamp` · `speaker` · `domain` · `stage` · `objective` · `requires` · `before` · `conflicts_with` · `supports` · `layer_tag`

- `knowledge_type`: `declared` \| `demonstrated` \| `implicit` \| `synthesis`
- `modality`: `speech` \| `screen` \| `click` \| `navigation` \| `visual` \| `timing` \| `failure` \| `edit-signal`
- `evidence_status`: `observed` \| `transcript-implied` \| `unobserved` \| `UNKNOWN`
- `layer_tag`: `SOURCE` \| `INFERENCE` \| `SYNTHESIS`

Caption-only packets: declared + sequence-from-speech. Visual/click = `unobserved` or `UNKNOWN`. **Do not invent clicks from a caption.**

## Do-not-flatten

- Never merge “never discount” with “discount aggressively.”
- Never average 7/50 “start in code” with 43/50 “competitors first.” Store both; the split **is** the knowledge.
- Never merge two lessons because they sound similar. Compatible **conditions + goals + context** only.
- Speech vs behavior: store `stated principle` vs `observed behavior` in `mismatches/`. The discrepancy is knowledge. Do not pick a winner.
- Patterns do not overwrite atoms. New sources **version** an atom (`K-174` v4). Never freeze after the first video.
- Do not build one universal creator worldview.

## Retrieval hierarchy

```
PROJECT → STAGE → TASK → CONSTRAINTS
  → patterns
  → supporting atoms
  → dissenting atoms
  → examples
  → action
```

Memory: **store broadly, retrieve narrowly, reason deeply.** Perfect-ish retrieval, not infinite context.

## Compiler protocol (full)

Skill: `workflow-compiler`. Audits: `knowledge-audit`.

### Construction (7 steps — do not skip)

1. **Classify** the project (who, outcome, stage, constraints). No retrieve yet.
2. **Decompose** into stages/tasks. Still no retrieve.
3. **Coverage map** — which tasks need knowledge; which are already a hive skill.
4. **Retrieve** in order: patterns → supporting atoms → dissenting → examples. Never “pull everything about X.”
5. **Apply conditions** — drop or gate units whose `valid_when` / `conditions` fail.
6. **Synthesize locally** — `IF condition A → X`. Do not blend remaining units into an average.
7. **Compile the smallest workflow** that covers the map. Provenance on every step.

Then run the **three audits** before the workflow is usable.

### Provenance chain (required)

```
WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
```

Every compiled step must point to pattern id(s) → atom id(s) → `packets/{id}/full.txt` (+ timestamp or UNKNOWN). No orphan advice.

### Three audits

1. **Coverage** — every decomposed task has a sourced step or an explicit gap.
2. **Context-misuse** — no atom used outside its conditions / domain / stage.
3. **Contradiction** — dissent is visible; incompatible rules are not averaged.

Fail any audit → do not ship. Fix retrieve/conditions or mark ASK.

## Tape write flow (future)

```
full.txt + PACKET  (layer 1, never overwrite)
  → deep-video-learning A–K + multimodal 15-step (caption-honest)
  → desk takes A–L + Steal
  → LEARNED.md (Researcher + Librarian; no L; keep dissent)
  → atoms jsonl + behaviors/fragments/mismatches  (layer 2–3)
  → capability-acquisition: 6 + upgrade/opportunity (UNTESTED)
  → (later slice) patterns  (layer 4)
  → (later project ask) workflow-compiler + 3 audits  (layer 5)
```

Steal sheet stays the machine catalog. Atoms are the reusable units. LEARNED.md is the prose reconstruct. `full.txt` stays ground truth.

## Project ask (invoke compiler)

Operator names a **project** (not “compile the 146”). Load `workflow-compiler`. Classify → decompose → coverage map → retrieve narrowly → condition → smallest workflow → `knowledge-audit`. Clients parked unless Evens names one.

## Related (do not replace)

| Skill | Job |
|-------|-----|
| `deep-video-learning` | A–K then steal then L. After A–K, Researcher **emits atoms**. |
| `multimodal-youtube-learning` | 15-step behavior trace. Caption-only = no invented clicks. |
| `capability-acquisition` | Six extractions + upgrade/opportunity. Parts, not clones. UNTESTED. |
| `workflow-compiler` | Layer 5 construction. |
| `knowledge-audit` | Coverage / context-misuse / contradiction. |
| `coverage-loop` | After steal, atoms then capability flags. Do not jump to a mega-workflow. |
| `tape-self-teach` | Takes stay SSOT. Atoms from LEARNED, not a LESSONS merge. |

## Never

- Retrieve → blend
- Overwrite `full.txt` / shallow-delete takes
- Merge `LESSONS-FROM-TAPE.md`
- Dump 146 videos into atoms in an unasked slice
- Invent click traces from captions
- One universal “Nate worldview”
- Average incompatible tactics
- Compile a corpus-wide Frankenstein workflow
- Spawn 17 / interrupt a live desk walk
- New video-vision vendor / Pinecone / extra DB
- Send / pay / deploy / book / publish
- Unpark a client
- Auto-install SKILL.md from a tape / clone Nate into desks
