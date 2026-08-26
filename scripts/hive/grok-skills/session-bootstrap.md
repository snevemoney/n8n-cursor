---
name: session-bootstrap
description: Start a hard project with one long context dump, then short loops. Use when beginning a new lane, site, packet, or Cursor/Grok thread. Prompting 2.0. Workflow = funnel.
---

# Session bootstrap (funnel)

**Stack:** Cursor + Grok Bot. Do not open another AI vendor.

## When
New session or new project. Not every message.

**Merged 2026-08-14:** `U6k4MeVks_Y` plan-first + “ask what I’m not thinking.” `eecUhBpTz_g` PRD/spec is the factory input — dump the destination before a harness. **Un-hid 2026-08-14:** session→named skill is `skill-from-session`; spec-queue factory is `dark-factory`. This skill stays dump-then-short-loops. Claude Code operate-never.

## Owners
Forge / Researcher / Big Boss / Cursor Agent — whoever starts the thread.

## Steps
1. Declare style first: stream of consciousness is OK; ignore typos.
2. **Demand-match first** (before website-offer-funnel):
   ```bash
   python3 scripts/hive/catalog-demand-match.py --need "<operator goal in one sentence>"
   ```
   USE existing lane · BUILD catalog SKU · RESEARCH · REFUSE · ASK — never default to "build a website."
3. One dump: goal, constraints, taste, what “done” looks like, what must not happen, good/bad examples.
4. After that, short prompts only. The model already has the world.
5. If the dump is missing a done-definition, ask **one** question, then proceed.
6. Read `CONTENT/OPERATOR_FOCUS.json` if set — tag lane/icp for the session.
7. **One SOP next** (`agent-as-hire`): pick one recurring task you would actually use. Do not connect new tools until that output is usable. Skill `scripts/hive/grok-skills/agent-as-hire.md`.

## Stop
Hard step (send / pay / deploy / book) → HITL. Do not one-shot the whole product.

## Anti-patterns
- 10-minute prompt on every turn
- “Build the whole site/game” in the dump
- Connect every plugin in the first session (`agent-as-hire`: one SOP first)
- Cross-checking via ChatGPT / Claude / Gemini — use Grok ↔ Cursor only
