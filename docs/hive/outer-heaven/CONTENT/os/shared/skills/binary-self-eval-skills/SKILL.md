---
name: Binary self eval skills
description: >-
  Use to improve a skill overnight — binary pass/fail evals on golden cases; rewrite skill.md from failures.
---

# Binary self eval skills

Sources: Simon Scrapes binary self-eval loops.

## When
A skill is used repeatedly and quality drifts.

## Do
1. Define golden cases with pass/fail.
2. Run the skill; log fails.
3. Patch the skill.md the same day (improve-system-writeback).

## Don't
- Vague 1-10 vibes without binary gates
- Hoard new skills instead of fixing the failing one

## Enrich 2026-10-10: skill A/B is the eval (`yt:bEJuF9JltYE` Supabase eval)
Same model, same tasks, with vs without the skill → the delta is the skill's value (Supabase: Sonnet 78% → higher with the agent skill). Job ready at `/workspace/research/packets/youtube-2wk-fullwatch-20261010/_cursor_jobs/skill_ab_eval.py`. BLOCKED_CURSOR_USAGE (OpenRouter key in Cursor only).
