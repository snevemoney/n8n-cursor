---
name: Osmani debug recovery
description: >-
  Use when tests fail, builds break, or behavior surprises — systematic root-cause debugging remapped from Osmani debugging-and-error-recovery to hive (reproduce first, no vibe-fix).
---
# Osmani debug recovery

Source: addyosmani/agent-skills `debugging-and-error-recovery` (MIT). Mirror under `/workspace/research/packets/addyosmani-agent-skills/skills/debugging-and-error-recovery/`.

## When
Failing tests, broken builds, unexpected behavior, harness miss blamed on the model.

## Do
1. Reproduce with a command, URL, or failing test path. Write it down.
2. Fix harness/config before swapping frontier models (CS205).
3. Bisect: last good → change → evidence. Prefer rewind over arguing the bad branch.
4. L4: reproduce → regression_evidence → implement → critic. Distinct evidence per gate.
5. If n8n canvas: visual SOP (map + failing node + execution) — still no prod activate without Tier 3.

## Don't
Vibe-patch without reproduce. Invent KPI. Ship live `/` to prove a fix.
