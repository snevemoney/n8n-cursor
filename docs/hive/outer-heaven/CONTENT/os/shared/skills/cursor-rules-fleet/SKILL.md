---
name: Cursor rules fleet
description: >-
  Use when tightening Cursor/multi-model fleet habits — rules files, model routing, no ARR claims.
---

# Cursor rules fleet

Sources: David Ondrej Cursor rules / multi-model fleets.

## When
Forge or operator tunes Cursor rules or model routing.

## Do
1. Keep rules thin and job-specific (pair with match-model-to-task).
2. Fleet = named desks, not anonymous swarm.
3. Document routing: cheap model for grunt, strong model for taste/decisions.

## Don't
- Unverified ARR talk-track
- Giant global rules file that never gets read

## Simon 37 2026-08-30 (`yt:RDeofKimDxo`) watch-page PROVE
Keep the always-on rules file thin. Put path-specific rules next to the code they govern so they load only then. Human-only notes belong in comments the model skips (do not spend tokens on operator scratch). Frontmatter descriptions need what + triggers + anti-triggers or the skill never fires.

## EXTRACT-BATCH-1 2026-09-01 — Claude Code 1000h remap (`yt:U6k4MeVks_Y`) FULL

**When:** tightening Cursor rules, model/effort, plan-vs-execute, or connectors vs CLI vs plugins.
**Anti-triggers:** do not install Claude desktop / Claude Code as daily desk; no ARR; usage $ UNVERIFIED.

FACT from `transcripts/U6k4MeVks_Y/full.txt`:
- Global instructions must clear a **very high bar** (applies to every chat). Else leave blank. Path/job rules next to the work.
- Start fuzzy work in **plan mode**; ramble + “ask what I haven’t thought of” beats magic prompt templates.
- Effort is not linear (extra-high → ultra may be ~1% quality for 5× tokens). Default medium unless complex.
- Outside tools: connectors (Gmail/Calendar) · plugins/MCP · **CLI often more complete** (GitHub CLI vs GitHub MCP). Prefer the one that is already connected.
- Agentic OS folder: `raw/` → `wiki/` (with index.md at each level) → `output/`. Indexes beat stuffing the window. Pair [wiki-ingest](sand-workflow:wiki-ingest) + [context-before-tokens](sand-workflow:context-before-tokens).
- Remap Claude Code desktop → Cursor Cloud agent + Grok. Voice ramble → [voice-ramble-session-context](sand-workflow:voice-ramble-session-context).

**Cursor fleet card**
```
Global rules: blank unless true for EVERY job.
Path rules: next to the code they govern.
Plan first on fuzzy A→Z. Ramble; agent asks unknown-unknowns.
Model/effort: cheap grunt, expensive decide. Do not burn max effort on beginner tasks.
Connect how?: connected MCP if live, else CLI if more complete, else BLOCKED would-work-if.
No Claude desktop dual-stack.
```

### Tools
| Need | Path |
|---|---|
| Cursor rules + Cloud agent | **PROVE** |
| Gmail/Calendar/GitHub MCP | **PROVE** if connected |
| GitHub/Vercel CLI | **PROVE** when MCP thinner |
| Claude desktop / Cowork | **BLOCKED** — Cursor+Grok **WORKAROUND** |
| Obsidian as required IDE | **WORKAROUND** — Outer Heaven markdown already |

## Wave Y 2026-09-09 Tim remap
- `_C57BxSXRbU` tool-stack category remap · `kt5a-TXmWew` Claude-Code-features→Cursor/Grok remap
- Packets under `repass-20260909/_C57BxSXRbU/` and `…/kt5a-TXmWew/` — Claude daily OS **BLOCKED**

## Enrich 2026-10-10: 8 lock-ins before agent-maxxing (`yt:PrS_IyC9Jss` Syntax)
Before fleet agents touch a repo, the rules file must state: schema · validation · routing · auth · CSS method · UI library · client↔server comms · folder structure. PROVE: `lockin_check.py <AGENTS.md>` (this folder) flags the missing ones (2/2 PASS on fixtures). Switching later is OK; leaving a choice unstated is what's not OK.
