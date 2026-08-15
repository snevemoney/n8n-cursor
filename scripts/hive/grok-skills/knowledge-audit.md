---
name: knowledge-audit
description: >-
  Three auditor passes on a compiled hive workflow: coverage,
  context-misuse, and contradiction. Use after workflow-compiler,
  or when the operator says audit this workflow / knowledge audit.
  Fail any pass means do not ship. Cursor plus Grok only.
---

# Knowledge audit

Three passes. All required. Fail any → workflow status `audit-fail`. Do not ship.

**Parent:** `knowledge-architecture`  
**Input:** a file under `docs/hive/outer-heaven/CONTENT/knowledge/workflows/`  
**Cursor copy:** `.cursor/skills/knowledge-audit/SKILL.md`

**Never:** retrieve → blend to “fix” a fail. Fix retrieve / conditions / ASK instead.

## When

After `workflow-compiler` step 7, or operator says audit this workflow.  
Not a substitute for emitting atoms. Not a corpus lint of the 146.

## Pass 1 — Coverage

Every decomposed task has **one** of:

- a sourced step (pattern → atoms → transcript), or
- an existing hive skill named, or
- an explicit **gap** (what is missing, why, ASK or stop)

Fail if a task is implied in prose but has no step.  
Fail if a step has no provenance chain (`WORKFLOW → PATTERN → ATOMS → TRANSCRIPT`).  
Fail if “examples” were skipped when the task is procedural (need a fragment / behavior sequence, not a slogan).

Caption-only: a click/UI task with only `unobserved` / `UNKNOWN` atoms is a **gap**, not coverage.

## Pass 2 — Context-misuse

For each used atom / pattern:

- `conditions` and `valid_when` match this project’s classify (domain, stage, ICP, stack, kill list)
- `less_relevant_when` is not being ignored
- `knowledge_type` is labeled; a `declared` slogan is not treated as a `demonstrated` sequence
- `modality=edit-signal` is weak signal only — never the sole justification
- `evidence_status=transcript-implied` is not upgraded to `observed`
- implicit techniques are tagged `implicit`, not “speaker taught”

Fail if an atom from another stage/domain is used because it “sounded related.”  
Fail if a creator-specific habit is applied as a universal rule.

## Pass 3 — Contradiction

List every `conflicts_with` / `dissent_ids` / mismatch touching used atoms.

Pass only if each conflict is handled as:

- a branched `IF condition →`, or
- an explicit operate-never / do-not-use, or
- ASK Evens

Fail if two incompatible rules were averaged, concatenated, or silently dropped.  
Fail if a speech≠behavior mismatch was resolved by picking the nicer sentence.  
Fail if a pattern’s demo-count majority flattened a minority that matches **this** project’s conditions.

Examples that must stay split:

- “never discount” vs “discount aggressively”
- 7/50 “start in code” vs 43/50 “competitors first”

## Output

Write into the workflow file (do not create a second essay):

```markdown
## Audits
- **coverage:** pass | fail — {one line}
- **context-misuse:** pass | fail — {one line}
- **contradiction:** pass | fail — {one line}
- **gaps:** {task ids or none}
- **dissent kept visible:** {atom ids or none}
```

Set header `Status: compiled` only if all three pass. Else `audit-fail`.

## Never

- “Fix” a contradiction by blending
- Delete dissent to get a green pass
- Invent clicks or outcomes to fill coverage
- Audit the whole 146 instead of the named workflow
- Overwrite `full.txt`
- Send / pay / deploy / book / publish
