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

A saved URL is not company intelligence. One signal may contain zero methods and still produce a proof requirement, a reference, a metric, or a workflow candidate. This compiler writes those candidates onto the knowledge store that already exists. It does not start a second archive, and it does not silently rewrite a layer.

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

`PARTIAL` is the result. A green file tree is not adoption. Knowledge sitting in a file is not organizational learning. Learning is a later change in behavior that a measured outcome supports.

## Pipeline

```
SIGNAL
→ recover evidence
→ CLAIM
→ IMPROVEMENT_CANDIDATE   typed; mapped to an existing asset or left unmatched
→ compare with other signals and local evidence
→ experiment where a measure is named
→ VERIFIED                only with a Watchdog grade file
→ adopt / keep optional / reject / supersede
→ retrieve during later work
→ outcome
→ learn again
```

Evidence maturity stays:

```
RECOVERED → CANDIDATE → EXPERIMENT_REQUIRED → LOCALLY_SUPPORTED → VERIFIED → ADOPTED
```

Applicability is a separate field:

```
MANDATORY · DEFAULT · CONDITIONAL · OPTIONAL · EXPERIMENTAL · REFERENCE_ONLY · REJECTED · SUPERSEDED
```

This cohort uses `EXPERIMENTAL` or `REFERENCE_ONLY`. `MANDATORY` and `DEFAULT` raise. `CONDITIONAL` requires a local test. Nothing is injected into every desk.

## Evidence

Every signal carries `TEXT`, `VIDEO`, `AUDIO`, `FRAMES`, `LINKS`, `REPO`, `DOCS`, each `COMPLETE`, `PARTIAL`, or `UNAVAILABLE`.

- A caption file is `TEXT PARTIAL`. It is not the video.
- A preview cannot be marked `COMPLETE`.
- A GitHub URL in a local note is not a recovered repo. Those three slots stay `RAW`.
- A local dossier is not the external article. Those two slots stay `RAW`.
- Bookmark text is a `REFERENCE` quote. It is not a method.

## Candidates

A claim decomposes to one candidate. The type comes from the atom's existing domain and output, not from a new subsystem. Each candidate records what it is, where it applies, which existing asset it improves, who should care, when it should and should not be used, the evidence, the conflicts, whether it was tested locally, and what would prove it.

Quote-only X posts have candidates and zero methods. Proof-shaped atoms can map to `separate-verifier`. Retrieval-shaped atoms can map to `signal-retrieve`. An unmatched candidate keeps a gap. It does not create an engine.

Internal signals use the same builder (`origin: internal`). This 20 are external. An internal disagreement stays `EXPERIMENTAL` until a local measure and a Watchdog grade exist. A tweet plus a bad PR is not automatically `VERIFIED`.

## Desks

| Desk | Owns |
|---|---|
| Researcher | source recovery, claims, comparison, contradictions |
| Librarian | provenance, dedupe, references, retrieval |
| Watchdog | proof candidates — grade on this cohort is `ABSENT` |
| Forge | tool and code candidates; the local retrieval measurement only |
| Product GTM | pricing, GTM, and metric candidates |
| Creative Studio | creative and design candidates, when the type says so |
| Jev | not authority |
| Matrix | decides when the recommended experiment becomes real work |

## This 20

The browser-grounding illustration is not in the recovered 20. `synthesis.md` says so. Counts and applicability are in `grade.json` and `candidates.json`.

The recommended experiment is a cross-source disagreement already stored on the atoms. It was not executed. The retrieval check did run, and it updates only `method-signal-intel-retrieve`.

Scale to 100 only after this cohort is `ready_to_scale`. It is not.
