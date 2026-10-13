---
name: Osmani TDD
description: >-
  Use when implementing logic or fixing bugs — tests first or with the change; remaps Osmani test-driven-development to hive golden-test-loop.
---
# Osmani TDD

Source: addyosmani/agent-skills `test-driven-development` (MIT). Pair: golden-test-loop / verify-then-done.

## When
New logic, bugfix, behavior change.

## Do
1. Name the failing check (test, script exit, click path).
2. Implement until the check passes.
3. Keep deterministic work in a named script when possible.
4. Agent-said-done without executed list = FAIL.

## Don't
Ship without a runnable check. Unattended client send.
