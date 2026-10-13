---
name: Osmani simplify
description: >-
  Use when code or process got heavy — delete before adding; remaps Osmani code-simplification.
---
# Osmani simplify

Source: addyosmani/agent-skills `code-simplification` (MIT).

## When
Duplication, dead paths, or “one more abstraction.”

## Do
1. Prefer delete/merge over new layer.
2. Keep one named script for deterministic checks.
3. Quarantine NO-SKILL tools instead of wrapping them.

## Don't
Add BMAD/OpenBot complexity. Expand token fan-out.
