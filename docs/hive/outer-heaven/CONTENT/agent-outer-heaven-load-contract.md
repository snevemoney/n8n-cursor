---
source: Librarian
date: 2026-08-12
status: active
---

# Outer Heaven — agent load contract

**Goal:** Shared institutional memory without dumping every chat into every agent turn.

## Memory plane (Grok Bot — no Scorpion host)

| Path | Role |
|------|------|
| **Shared brief** | `python3 scripts/hive/os/outer-heaven-brief.py --agent "<name>"` — **first action every routine** |
| **Mac cache** | `~/.grokbot/outer-heaven/` — canonical capture write path |
| **Obsidian vault** | `My_Billion_Dollar_Vault/00_Outer_Heaven/` — operator-facing graph (mirror from cache) |
| **Coordination** | `~/.grokbot/shared-context.json` — brief hash + timestamp after capture |
| **VPS mirror** | `/root/outer-heaven-mirror/` — cloud routines when Mac asleep (`--source vps`) |
| **Git mirror** | `n8n-cursor/docs/hive/outer-heaven/` — repo fallback |

**Not for Grok:** Scorpion `/api/hive/obsidian/*` — legacy ops UI only.

## Surfaces (priority)

1. **Shared brief** (~2–4KB digest) — all 17 agents, every routine
2. **Obsidian vault** — primary edit (operator + Librarian)
3. **Git mirror** — repo agents / CI fallback
4. **Per-agent Grok memory** — private scratch; promote durable facts to Outer Heaven

## What EVERY hive agent should load when relevant

| Always (JIT / first touch on a lane) | Path |
|---|---|
| Shared brief | `outer-heaven-brief.py --agent "<name>"` |
| Library map | `OUTER_HEAVEN_LIBRARY.md` |
| LLM Wiki (agent→docs/THEMES) | `OUTER_HEAVEN_LLM_WIKI.md` or `CONTENT/OUTER_HEAVEN_LLM_WIKI.md` |
| Structured long-term memory | `OPERATOR_MEMORY.md` |
| North stars / survival | `NORTH_STAR.md`, `SURVIVAL_CONTRACT.md` |
| Hive DNA / playbook | `HIVEMIND_DNA.md`, `AI_PARTNER_PLAYBOOK.md` (if present) |

## Lane packs (load when the job matches)

| Lane | Load |
|---|---|
| Operator taste / offer language | `CONTENT/operator-youtube-dossier.md` |
| AI agency pricing & delivery | `CONTENT/nate-herk-dossier.md` |
| Audit / multi-agent / Grok Bot patterns | `CONTENT/related-youtubers/` (INDEX + relevant dossier) |
| Website craft (Forge / Creative) | `CONTENT/website-building/` (INDEX + skills / next / design-to-code) |
| How we capture coding+chats | `METHODS/coding-capture-cycle.md` |

Deep read one note: `outer-heaven-brief.py --read <vault-relative-path>`

## What is NOT auto-shared

- Full raw chat transcripts (only mined summaries / chronicle entries)
- Cursor coding session dumps until capture cycle runs
- Per-agent scratch / secrets / Tier 3 material
- Unverified income claims from educator dossiers (treat as signal, not fact)

## Capture loop (keeps agents current)

```bash
cd ~/n8n-cursor
bash scripts/hive/outer-heaven/run-capture-cycle.sh
```

Flow: Cursor transcripts → `~/.grokbot/outer-heaven` cache → best-effort Obsidian mirror → git mirror → VPS rsync → `shared-context.json`.

Scripts auto-export `HIVE_OBSIDIAN_VAULT` from `~/.grokbot/os-config.json`. Sync **refuses** template overwrite unless `OUTER_HEAVEN_ALLOW_TEMPLATE_SYNC=1`. Default sync is additive (no `--delete`) unless `OUTER_HEAVEN_SYNC_DELETE=1`.

Librarian owns: daily capture verify + memory consolidation. Other agents: **read** brief + Outer Heaven; propose memory writes to Librarian.

## Big Boss duty

Morning / mission rollups should assume brief + OPERATOR_MEMORY + relevant CONTENT packs are source of truth for precedent — not reinvent from a single chat.

## Operator smoke checklist

1. Capture updates cache even if Obsidian mirror skips (iCloud hang)
2. Forge + Researcher cite same north stars from brief
3. With Mac sleeping, cloud routine returns brief from VPS mirror (`--source vps`)
4. Obsidian app shows updated notes after successful vault mirror
