---
name: Kill criteria
description: >-
  Use before starting any build, experiment, loop or research sprint: write the stop rules
  (timebox, budget, kill and pivot triggers) up front, then check them at every checkpoint.
  Never extend a timebox silently; extending needs the owner's yes.
---
# Kill criteria (decide when to stop before you start)

Sources: methods-gap 2026-10-12 (MISSING row "Kill criteria / timebox"); addyosmani idea-refine refinement-criteria (Outer Heaven mirror); feature-loop caps (`loop.env`).

## When
Before: a feature loop, a new tool trial, a research sprint, a media generation batch, any "let's try X". Not for one-shot fixes under 15 minutes.

## Do
1. Copy `TEMPLATE.md` into the job's packet as `KILL.md` **before** the first build step.
2. Fill every line with a number or a checkable fact. No "if it feels slow".
3. Name the checker: a different desk or a script reads KILL.md at each checkpoint (no self-PASS).
4. At each checkpoint (end of round, end of day, or at 50% and 100% of the timebox), write one line in `KILL.md ## Checks`: `ts · trigger hit? · CONTINUE|PIVOT|KILL · evidence path`.
5. A KILL ends the job: write a 5-line retro (`retro` template), log ACTION_LOG `--action kill-criteria --status archived`, keep the artifacts.
6. Extending the timebox or budget is an owner decision. Ask Evens. Don't extend in place.

## Defaults (when the owner gives none)
| Kind | Timebox | Budget | Kill if |
|---|---|---|---|
| feature loop | 1 sitting / MAX_ROUNDS 5 | $1 model spend | score flat for 2 rounds, or any regression twice |
| tool trial | 60 min | $0 (free tier) | install > 3 GB disk, needs Docker/GPU/Mac, or needs a secret we don't hold |
| research sprint | 90 min | 1 packet | no install/method candidate after 45 min |
| media batch (Higgsfield etc.) | 1 batch | **Evens OK first** | 2 batches below rubric bar |

## Don't
- Write criteria after starting ("we'll know it when we see it")
- Let the builder grade its own kill check
- Kill silently: always leave a retro and the artifacts
- Use this to skip HITL: spend, send, publish still need Evens
