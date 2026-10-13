---
name: skill-change-scorer
description: >-
  Use before keeping an edit to any SKILL.md: score old vs new with checks and keep only if no regression. Triggers: skill delta, did this skill edit help, skill_delta_gate. Anti-triggers: writing a brand new skill from scratch.
---
# skill-change-scorer

Run: `bash skill_delta_gate.sh <skill-id> <candidate-SKILL.md>` → KEEP/REVERT. Checks in `checks/`.

Source: methods-gap close packet 2026-10-12 (approved "do it all" 2026-10-13). Jev advisory only; no self-PASS.
