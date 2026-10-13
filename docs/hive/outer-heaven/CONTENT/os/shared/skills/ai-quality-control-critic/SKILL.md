---
name: AI quality-control critic
description: >-
  Use before any public site, report, post, or client-facing artifact ships —
  creator cannot self-approve. Steal: adversarial reviewer + final output grader
  + pre-implementation disruptor.
---
# AI quality-control critic

**Owners:** Consultant (runs) · Publishing (waits) · Watchdog (may co-score code/UI)
**HITL:** Critic PASS ≠ send. Tier 3 still required for client send / prod.

## When
Before public or client-facing ship. Also before a build commit (pre-implementation disruptor): if four-blank is empty, FAIL.

## Steal (botdirectory — language only, not a new agent)
- Adversarial Reviewer: challenge assumptions, name risks and missing views, disagree when evidence supports it. Not contrarian for sport.
- Final Output Grader: score completeness, accuracy, consistency, required format. Failed criteria go back for revision. Never auto-approve.
- Pre-Implementation Disruptor: review the initiative before anyone builds. Failure modes, negative effects, what must change first.

## Steps
1. Creator ≠ critic. If you wrote it, another desk grades.
2. Attack pass: unsupported claims, weak open, repetition, UNVERIFIED $ dressed as fact, no next step.
3. Grade: completeness / accuracy / consistency / format. Any fail = FAIL + fix list.
4. If this is a build ask: four-blank filled? clog and leak named? If no, FAIL (do not implement).
5. Write `~/.grokbot/research/qc-critic-<YYYYMMDD>-<slug>.md`
6. Tell Publishing. FAIL blocks publish.

## Never
Creator self-PASS. Auto-publish. New SKU. Treat UNVERIFIED revenue as proof.

## Judge calibration: one question per evaluator (2026-10-12, proven on box)
Source: yt:qZj7sqmidqA (Laurie Voss, Arize, "From Vibes to Production") [1:17:34]–[1:29:12]. Proof: `/workspace/research/packets/missed-signals-20261012/proofs/judge-calibration/` (re-run with `python3 run.py`).
1. Treat any LLM or Jev judge as a classifier. Hand-label a small set (≥20), run the judge, and report agreement, precision and recall. Agreement alone hides which way it's wrong.
2. One dimension per evaluator. A rubric that bundles N criteria is N evaluators. Box result on 26 labelled posts (Jev judge): 5-criteria "god" rubric agreement 0.769 with recall 0.40 (it silently failed 6 of 10 true passes), versus a single-question judge at 0.923 (P 0.90 / R 0.90).
3. Tighten a rubric only from the disagreements, then re-measure. Wording "tightened" blind scored lower (0.885).
4. Test both directions (cases where the behaviour should and should not happen). Judge with a different vendor than the generator (self-preference bias), and watch position and length bias. These points come from the talk and are unverified here.
Critic PASS still ≠ send.
