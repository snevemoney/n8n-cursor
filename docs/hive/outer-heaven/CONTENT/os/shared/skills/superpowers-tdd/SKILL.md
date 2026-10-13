---
name: Superpowers TDD
description: >-
  Use when implementing features or bugfixes — write the failing check first; remaps obra/superpowers test-driven-development to hive (golden-test-loop / check-forge-done).
---
# Superpowers TDD

Source: obra/superpowers `test-driven-development` (MIT). Packet: `/workspace/research/packets/obra-superpowers/skills/test-driven-development/`.

## When
New features, bug fixes, behavior changes — before implementation.

## Do
1. Name the failing check (test, script exit, click path).
2. Watch it fail for the right reason.
3. Minimal code until it passes.
4. Pair [Osmani TDD](sand-workflow:osmani-tdd) + golden-test-loop. Agent-said-done without executed check = FAIL.

## Don't
Skip the fail. Install hooks/scripts from Superpowers. Ship live `/` to "prove" green.
