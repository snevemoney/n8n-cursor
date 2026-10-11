---
name: Osmani code review axes
description: >-
  Use before merging or accepting agent/human code — multi-axis review; verifier ≠ builder; remaps Osmani code-review-and-quality.
---
# Osmani code review axes

Source: addyosmani/agent-skills `code-review-and-quality` (MIT).

## When
Before merge, before Forge-done, or when reviewing agent/human diffs.

## Do
1. Builder cannot grade own ship. Watchdog/Consultant critic.
2. Axes: correctness, security (no exploit writing), readability, tests, scope creep, HOLD list (live `/`, secrets, send).
3. Require evidence URLs/paths — mention ≠ review.
4. PASS DIFF ≠ PASS live. click-live-site when site claimed.

## Don't
Self-PASS. Merge PR 149 as ship. Invent traffic or dollars.
