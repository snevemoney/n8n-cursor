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
