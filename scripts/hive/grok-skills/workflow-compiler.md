---
name: workflow-compiler
description: >-
  Compile the smallest project workflow from the hive knowledge
  system without blending sources. Use when the operator names a
  project and asks to compile a workflow, or after a coverage map
  exists. Classify and decompose before retrieve. Then three audits.
  Not a dump of 146 tapes. Cursor plus Grok only.
---

# Workflow compiler

Compile **one project** from layers 4 → 2 → 1. Do not blend the textbook into a personality.

**Parent:** `knowledge-architecture`  
**Audits:** `knowledge-audit` (required before the workflow is usable)  
**Cursor copy:** `.cursor/skills/workflow-compiler/SKILL.md`  
**Write:** `docs/hive/outer-heaven/CONTENT/knowledge/workflows/{project_id}.md`  
**Store schemas:** `knowledge/workflows/INDEX.md`

**Never:** retrieve → blend everything.  
**Always:** retrieve → compare → condition → synthesize → audit.

## When

Operator names a **project** (outcome + constraints) and says compile / workflow from knowledge / smallest workflow.  
**Tape landing (override 2026-08-14):** after A–K + capability-acquisition, compile **one named machine** the tape teaches (`{machine_id}` = the machine, e.g. `dark-factory`, `seedance-site`). One tape → one workflow (two if the tape clearly has two). Not a parked ICP card. Not 147→1.  
Clients parked unless he names one. Path A hunts stay parked. These are hive operating machines.

## Integrity (copy onto the compiled file)

Every step must carry:

- `pattern_ids` (or `none — hive skill`)
- `support_ids` (atom ids)
- `dissent_ids` (atom ids kept visible)
- `valid_when` / `less_relevant_when`
- `confidence`
- `knowledge_type` mix used (declared / demonstrated / implicit / synthesis) — labeled, not mixed
- transcript pointer: `packets/{id}/full.txt` @ timestamp or UNKNOWN

**Provenance chain (required):**

```
WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
```

No orphan advice. No “the videos say.”

## Do-not-flatten (compiler)

- Do not merge two lessons because they are semantically similar.
- Merge a step only when **conditions, goals, and context** are compatible.
- Keep contradictions as branched `IF`s or as `dissent_ids`, never as an average.
- Do not average “never discount” with “discount aggressively.”
- Do not average 7/50 “start in code” with 43/50 “competitors first.” The split is the knowledge: `IF start-in-code context → …` / `IF competitors-first context → …` / or ASK.
- Speech≠behavior mismatches stay visible. Do not pick the stated principle by default.
- Patterns are not truth. They do not delete atoms.

## Construction (7 steps)

Do these in order. **No retrieve in steps 1–3.**

### 1. Classify the project

Write, before opening atoms:

- who / ICP (parked unless named)
- outcome
- stage (discover / qualify / build / dry-run / hard-step)
- constraints (stack Cursor+Grok, HITL hard steps, kill list, time, city)
- operate-never for this project

If classification is vague → `ask-principal`. Do not retrieve to “see what the videos suggest.”

### 2. Decompose (still no retrieve)

Break into stages → tasks → decisions. Number them. Each task is one checkable job.  
Do not pull patterns yet. Do not open the 146.

### 3. Coverage map

For each task: `have hive skill` / `need knowledge` / `gap` / `HITL only`.  
This map is the compile target. The workflow may not grow past it.

### 4. Retrieve (narrow)

For **each** `need knowledge` task, in this order only:

```
PROJECT → STAGE → TASK → CONSTRAINTS
  → patterns (valid_when matches)
  → supporting atoms
  → dissenting atoms
  → examples / fragments / behaviors
  → action
```

Then stop. Do not browse adjacent domains.  
Prefer demonstrated sequences over declared slogans when they conflict — but **store both**; do not silently drop the slogan.

Caption-only atoms with `evidence_status=unobserved` on clicks: do not compile a UI path from them.

### 5. Apply conditions

Drop or gate any unit whose `conditions` / `valid_when` fail this project.  
Keep `less_relevant_when` as a warning, not a delete of the atom.  
If a popular pattern is invalid here, write `LESS_RELEVANT_WHEN` on the step and use the matching dissent or a hive skill.

### 6. Synthesize locally

Only inside one task:

```
IF condition A → X
IF condition B → Y
IF unknown → ASK Evens
```

Mechanism + exception stay attached. Do not emit a blended paragraph.

### 7. Compile the smallest workflow

One file. Trigger → steps → checkable stop. Hard steps stay HITL.  
Reuse existing hive skills (`website-offer-funnel`, `ask-principal`, …) when the coverage map already has them.  
Do not invent a mega-funnel that “covers the channel.”

Then run `knowledge-audit` (coverage, context-misuse, contradiction). Fail → do not ship.

## Output shape

```markdown
# Workflow — {project_id}
Status: compiled | audit-fail
Protocol: workflow-compiler
**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT

## Classify
## Decompose
## Coverage map
## Steps
### {n}. {task}
- **IF:**
- **Do:**
- **Hive skill:**
- **pattern_ids:**
- **support_ids:**
- **dissent_ids:**
- **valid_when / less_relevant_when:**
- **confidence:**
- **Transcript:** `packets/{id}/full.txt` @ {ts}
## Audits
- coverage:
- context-misuse:
- contradiction:
## Operate-never
```

## Related

| Skill | Job |
|-------|-----|
| `knowledge-architecture` | Layers, integrity, do-not-flatten |
| `knowledge-audit` | Three passes after compile |
| `multimodal-youtube-learning` | Do not compile invented click paths |
| `coverage-loop` | Wire ONE system ≠ compile the corpus |
| `deep-video-learning` | Produces atoms; does not compile |

## Never

- Retrieve before classify/decompose
- Blend remaining units into one “best practice”
- Dump 146 tapes into one workflow
- Use caption-implied clicks as a UI procedure
- Overwrite `full.txt`
- Spawn 17
- Unpark a client / send / pay / deploy / book / publish
- New vendor / new DB
