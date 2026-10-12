---
name: desk-wiki-before-work
description: >-
  Each desk reads its job card (owns X, never Y) before it works.
  Use when spawning, waking a desk, or an agent guesses its job.
  Cursor plus Grok Bot. Status WIRED.
---

# Desk wiki before work

**Owner:** Librarian (pages) · Big Boss (spawn). **Stack:** Cursor + Grok Bot.  
**Cursor copy:** `.cursor/skills/desk-wiki-before-work/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/desk-wiki-before-work/SKILL.md`  
**Status:** WIRED 2026-08-14. Not accepted forever.

**Source:** `x:2074304050880012736` @arrakis_ai — Karpathy LLM Wiki: every employee’s responsibilities, workflows, and operational context **before** the system works. Tweet is the complete tactic.

**Dissent (do not flatten):**
- @0xDeliriumm `x:2073378450459570257` / `x:2072932020003496380` — “leaked Obsidian brain,” $2.2M fired, 8,893 nodes. **UNVERIFIED** salary/firing. Graph-porn ≠ this skill. `wiki-ingest` already forbids 8k-node theater. Do not merge.

## When

`hive-spawn-desks`, a desk wake, coverage-loop spawn, or an agent starts without a job card.

## Card

```
DESK: <slug>
READ: CONTENT/job-cards/{slug}.md + AGENT_TOOL_INVENTORY use/never + CONTENT/os/hot.md + latest said-* + SESSION-INDEX (do not ask Evens to paste)
OWN: X
NEVER: Y
THEN: do the named task
```

No card → do not start the desk.

## Steps

1. Open `docs/hive/outer-heaven/CONTENT/job-cards/{slug}.md` and the inventory **use / never** for that desk. Also read `CONTENT/os/hot.md` + latest `said-*` + `SESSION-INDEX.md`. Do not ask Evens to paste.
2. Write OWN / NEVER on the job (or the take header). Prompt “don’t” is not the lock (`assume-it-will-touch`).
3. Then run the named task. Do not spawn 17 to “figure out the job.”
4. Librarian persists missing never-lists. Do not stand up a second Obsidian.

## Stop

Send / pay / deploy / book / publish = Evens. This skill never closes a hard step.

## Never

8k-node clone · leak-drama as FACT · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus

**Merged 2026-08-14:** `U6k4MeVks_Y` raw → wiki → index.md. Same machine. Dissent vs 8k Obsidian already here. `vLlIBT0HSSc` FDE gap is `forward-deployed-gap`, not this card.
