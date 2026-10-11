---
name: Superpowers request review
description: >-
  Use when completing a major task or before merge — ask Watchdog/Consultant critic with evidence; remaps obra/superpowers requesting-code-review without review-subagent fan-out.
---
# Superpowers request review

Source: obra/superpowers `requesting-code-review` (MIT). Remapped: **no** dispatching parallel review agents.

## When
After major feature, before merge, or when stuck needing a verifier.

## Do
1. Builder cannot grade own ship. Ping Watchdog or Consultant with evidence paths/URLs.
2. Distinct evidence artifact. Mention ≠ review.
3. Axes: correctness, HOLD list, tests, scope. Pair [Osmani code review axes](sand-workflow:osmani-code-review-axes).

## Don't
Self-PASS. Clone/subagent fan-out for review. Merge PR 149 as ship.
