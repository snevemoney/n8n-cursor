---
name: Assemble normalize fill
description: >-
  Use when building a site from real assets — assemble designer pieces,
  normalize tokens, fill only from client facts; never invent testimonials.
---
# Assemble normalize fill

Sources: Ed Hill ugly sites `yt:NNv80mMzFDs`; pairs with cinematic + website-build-pipeline (LIVE 2026-08-22).

## When
Building or rewriting a marketing site from real designer pieces + client facts.

## Do
1. **Assemble** real designer pieces (type, photo, section), not a random template.
2. **Normalize** to one type/token scale ([design-tokens](sand-workflow:design-tokens) / stack-pick).
3. **Fill** from **client** facts only — Watchdog click-live must catch invented testimonials.
4. Remap “Claude Code” demos → Cursor cloud agent + Grok. Pair [cinematic-site-recipe](sand-workflow:cinematic-site-recipe) when motion is needed; [website-build-pipeline](sand-workflow:website-build-pipeline) for end-to-end.
5. Fail indigo-slop / raw-prompt tier before calling done ([verify-then-done](sand-workflow:verify-then-done)).

## Don't
- 21st.dev as a SKU / Discord course upsell
- Fake social proof (“10,000 hours / zero accidents”)
- Indigo slop as done
- New icp_id from a roofing/demo vertical without operator yes

## Tools
| Need | Path |
|---|---|
| Shadcn / design | Shadcn MCP + tokens — **PROVE** |
| Click-live | Playwright / Browser-use — **PROVE** |
| Claude Code site builder | **BLOCKED** — Cursor cloud agent **WORKAROUND** |
| Vercel deploy | **BLOCKED** needsAuth — Hostinger HITL **WORKAROUND** |

## Prompts
**Assemble → normalize → fill**
```
Refs / designer pieces:
Token scale (type/color/space):
Client facts only (no invented proof):
Preview URL + Watchdog click:
Remap Claude Code → Cursor cloud agent.
```
