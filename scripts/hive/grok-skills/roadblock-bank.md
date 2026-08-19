---
name: roadblock-bank
description: >-
  After a mess, write one JSON row to the product-factory roadblock
  bank so the next SKU does not repeat it. Not a blog. Cursor plus Grok Bot.
---

# Roadblock bank

**Stack:** Cursor + Grok Bot.  
**Cursor copy:** `.cursor/skills/roadblock-bank/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/roadblock-bank/SKILL.md`  
**Bank:** `docs/hive/outer-heaven/CONTENT/knowledge/product-factory/roadblocks.json`  
**Schema:** `roadblocks.schema.json`  
**CLI:** `python3 scripts/hive/product-factory.py add-roadblock ...`  
**State pointer:** `python3 scripts/hive/hive-state.py get --key product_factory`

Not `CONTENT/knowledge/primitives/` (atoms). Not an essay in chat.

## When

A sitting just hit a real mess (webhook drift, tabs vanish, copy≠code, pay rebuilt, caption-only treated as watched, merge treated as ship). Write the row **after** the mess. Do not invent incidents.

## Card

```
ID: rb-<slug>-YYYY-MM-DD
SYMPTOM: what broke
CAUSE: why (from a file/tape, not a guess)
NEVER-AGAIN: the rule
RELATED: login | payments | social-share | promotion | none
SOURCE: path
STATUS: open | recorded | stale
```

## Steps

1. Filter first: `python3 scripts/hive/product-factory.py get --key roadblocks`. Do not dump `state.json`.
2. If the same `id` exists, stop. Do not rewrite history as a blog.
3. Append one row via CLI (or edit the JSON). Required fields only.
4. Point `related_primitive` at a real `primitives.json` id, or `none`.
5. `source` must be a hive file or tape id already on disk.

## Stop

Send / pay / deploy / book / publish = Evens. A row is not a ship.

## Never

Invent incidents · essay instead of a row · secrets in the bank · live Stripe · sell the factory · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
