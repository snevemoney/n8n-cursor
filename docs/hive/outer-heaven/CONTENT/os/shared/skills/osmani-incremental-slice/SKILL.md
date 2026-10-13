---
name: Osmani incremental slice
description: >-
  Use when implementing a multi-file change or migrating a legacy app — force
  incremental slices with L4 handoffs and check-forge-done; remaps Addy Osmani
  incremental-implementation to hive Forge path.
---
# Osmani incremental slice

Source: addyosmani/agent-skills `incremental-implementation` (MIT). Literacy mirror: `/workspace/research/packets/addyosmani-agent-skills/skills/incremental-implementation/`.

## When
Any feature or fix touching more than one file, or a temptation to one-shot the product/site/OS.

## Do
1. Write DONE_WHEN as a clickable/testable check.
2. Break into vertical slices. One slice = one L4 path: reproduce → regression_evidence → implement → critic.
3. Distinct evidence artifact per gate. Path theater (identical stamps) = FAIL.
4. Stop at implement→critic. Ping Watchdog. Never self-PASS.
5. Run `check-forge-done.py --slice-id <id>` after Watchdog closes (exit 0).
6. Live `/` HOLD unless Big Boss says ship. Merge ≠ ship.

## Don't
One-shot whole product. Dump catalog. BMAD install. OpenBot as face.

## Merged 2026-10-10: AI legacy migration (from former `ai-legacy-migration` skill) — CANDIDATE
_Lifecycle: **CANDIDATE**. Merged per AGENT_RULES rule 25 (single-source NEW skill folded into canonical). Helper files live in `legacy-migration/` beside this SKILL.md: inventory.py, legacy_app.js, to_web_request.mjs._
Source: `yt:AOBbD7YJLIc` Syntax (Wes Bos), studied 2026-10-10.
### Steps
1. Write down why you are migrating and lock the target stack (prove it's doable first).
2. Port 2–3 routes yourself. These become the pattern files the agent copies.
3. Run `legacy-migration/inventory.py <entry.js>` (adapt the regexes) → a checklist of every route + middleware (auth, CSRF, JWT, rate limits).
4. Iterate the plan with the agent until it covers the whole surface (Wes went 20–30 rounds). Then generate the **manual test checklist**.
5. Move handlers one at a time behind an adapter (`legacy-migration/to_web_request.mjs`: Express req → web `Request`).
6. Test every checklist box. Merge at a quiet time and watch error monitoring.
### Proof
Box: inventory → 12 checks; adapter `2/2 PASS`. The LLM port itself is BLOCKED_CURSOR_USAGE.
