---
tags: [os, knowledge]
aliases: [signal intelligence, signal compiler]
at: 2026-09-26
desk: researcher
machine: dark-factory
class: process
status: filed · milestone PARTIAL · not adopted
---

# Signal intelligence

A saved URL is not company intelligence. This compiler turns a bounded cohort into a method graph on the knowledge store that already exists. It does not start a second archive, a signals app, or a new capability.

**Code:** `scripts/hive/os/signal_intel.py`  
**This cohort:** `signal-intel/milestone-20/`  
**Claims copied from:** `atoms/by-video/*.jsonl` and bookmark export text. Raw packets are not overwritten.

```
DONE-CHECK: python3 scripts/hive/os/signal_intel.py self-test
  invariants_ok true · milestone PARTIAL · ready_to_scale false · watchdog_grade ABSENT
CAP: 20 signals (5 X text, 5 X video, 5 YouTube, 3 repos, 2 articles) · one recommended experiment
COST: local python · no billed model · no network fetch
STOP-KIND: metric
```

`PARTIAL` is the result. A green file tree is not adoption.

## Pipeline

```
RAW
→ SOURCE_RECOVERED   only when every required channel is at least PARTIAL
→ PARSED
→ CLAIMS_EXTRACTED   copied atoms, or the bookmark sentence unchanged
→ SYNTHESIZED        two or more independent sources in one domain
→ CAPABILITY_MAPPED  an existing capability id only
→ EXPERIMENT_CANDIDATE
→ EXPERIMENTING      only after a local run
→ VERIFIED           only with a Watchdog grade file
→ ADOPTED            only when Evens promotes it
```

Method maturity, separate from that pipeline:

```
RECOVERED → CANDIDATE → EXPERIMENT_REQUIRED → LOCALLY_SUPPORTED → VERIFIED → ADOPTED
```

External methods stop at `EXPERIMENT_REQUIRED` when two claims disagree. The retrieval method can reach `LOCALLY_SUPPORTED` because this cohort measured it. Nothing here is `VERIFIED` or `ADOPTED`.

## Evidence

Every signal carries `TEXT`, `VIDEO`, `AUDIO`, `FRAMES`, `LINKS`, `REPO`, `DOCS`, each `COMPLETE`, `PARTIAL`, or `UNAVAILABLE`.

- A caption file is `TEXT PARTIAL`. It is not the video.
- A preview cannot be marked `COMPLETE`.
- A GitHub URL in a local note is not a recovered repo. Those three slots stay `RAW`.
- A local dossier is not the external article. Those two slots stay `RAW`.
- Bookmark text is stored as a quote. Thread, media, and `t.co` targets stay unrecovered.

## Graph

`SIGNAL contains CLAIM`. A claim may `suggest` a `METHOD` and `support` a `METHOD_ATOM`. A method is `composed_of` atoms, `applies_to` an existing capability, `contradicts` another stored claim, and is `tested_by` an experiment. An executed experiment `produced` an outcome.

Shared concepts keep `conditions_by_source`. They are not averaged. Contradictions store `winner: null`.

One signal may emit several typed outputs (`method`, `principle`, `anti_pattern`, `metric`, `gtm_technique`, `raw_quote`, and so on). A quote is not a method.

## Desks

| Desk | Owns |
|---|---|
| Researcher | source recovery, claims, comparison, contradictions |
| Librarian | provenance, dedupe, identity, graph links, retrieval quality |
| Consultant | assumptions and tradeoffs — not run on this cohort |
| Watchdog | independent grade — `ABSENT` on this cohort |
| Forge | the local retrieval measurement only |
| Jev | not authority |
| Matrix | decides when the recommended experiment becomes real work |
| Jarvis | not wired; `retrieve --prompt` is the question shape |

## This 20

The browser-grounding illustration (vision, accessibility, hybrid, planner/verifier) is not in the recovered 20. The compiler says so in `synthesis.md` instead of writing that essay from memory.

What the 20 actually contain is in `grade.json` and `synthesis.md`. The recommended experiment is a cross-source disagreement already stored on the atoms. It was not executed. Measures are named and `results` is null.

The local test that did run: a later prompt about speech versus behavior returns at most three graph refs, and an unrelated dinner prompt returns `NONE`. That outcome updates `method-signal-intel-retrieve` only.

Scale to 100 only after this cohort is `ready_to_scale`. It is not.
