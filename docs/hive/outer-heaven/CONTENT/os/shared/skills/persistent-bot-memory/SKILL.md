---
name: Persistent bot memory
description: >-
  Use during daily memory consolidation or when a chat is dying — pull
  decisions, shipped work, and preferences into Outer Heaven (no secrets);
  stay quiet if nothing new.
merged_from: [compact-hive-from-chats]
---
# Persistent bot memory

**Owner:** Librarian (same desk — not a new agent). Absorbed into daily memory-consolidation + Monday stale-fact routine.

Source language: botdirectory `persistent-bot-memory` STEAL (2026-08-27 OPERATOR YES via Consultant). Fold language; do not install the vendor bot.

## When
- Daily consolidation fires
- A chat is ending / aging out and holds decisions, shipped work, or lasting preferences
- Another desk asks to "remember this" without a secret

## Do
1. Brief-first (`outer-heaven-brief.py --agent Librarian`). Cache `~/.grokbot/outer-heaven` is SSOT.
2. Scan for **decisions / shipped / preferences** only. Skip secrets, credentials, customer PII, Tier-3 payloads.
3. Tag each row with **lane id** (`ai-partner-websites` · `amazon-own-store` · `hive-os` · `dropship` · `future`).
4. Write via wiki-ingest rules: **state replaces** current field; **events append** with timestamp. Pair decision-ledger-md for decided/rejected.
5. Prefer `OPERATOR_MEMORY.md` FACTS/DECISIONS/LESSONS/PREFERENCES; chronicle for dated events only. Never delete CHRONICLE entries.
6. After material OM/CONTENT writes: best-effort vault mirror (notes-first, exclude CURSOR_CHATS). Cache stays SSOT if Mac drops.
7. **Quiet if nothing new** and vault already matched — no filler beat.

## Don't
- Mint an 18th desk or a second memory product (Notion Memory Keeper, Drive Wiki, hosted agent-memory SaaS)
- Auto-rewrite or delete vault/chronicle history
- Store secrets, API keys, passwords, or customer data
- Treat STEAL language as permission to install the botdirectory listing

## Tools
| Need | Path |
|---|---|
| Outer Heaven cache | `~/.grokbot/outer-heaven/` — **PROVE** |
| Wiki ingest | [wiki-ingest](sand-workflow:wiki-ingest) |
| Decision ledger | [decision-ledger-md](sand-workflow:decision-ledger-md) |
| Stale lint | [stale-fact-detector](sand-workflow:stale-fact-detector) (flag only; no auto-edit) |
| Hosted memory SaaS / 18th bot | **BLOCKED** |

## Prompt card
```
Dying-chat / consolidation capture:
- Decisions (date, lane, owner, alternatives rejected)?
- Shipped (what landed, where, proof path)?
- Preferences (operator lasting taste — no secrets)?
Write to OM or topics/. Quiet if empty.
```

## Simon 37 2026-08-30 (`yt:RDeofKimDxo`) watch-page PROVE
Claude desktop Cowork "memory files + import from ChatGPT/Codex" is the talk's demo. Still **BLOCKED**. Hive path = Outer Heaven topic files + this skill. Do not paste secrets into memory. Do not install a second memory product to migrate.

## YT L2 close 2026-09-09 (`yt:sZqa6b5UX-w`) — Kauã Miguel cross-AI memory
Packet: `/workspace/research/youtube-daily/l2-20260909/sZqa6b5UX-w/` · evidence A–E on disk.

**Steal (FACT on-screen):** markdown pointer files (`CLAUDE.md` / `AGENTS.md`) at global+project scopes + shared vault + optional MCP/graph/session bridges so Claude Code / Codex / OpenCode continue without re-explaining.

**Hive remap:** Obsidian / CLAUDE.md / AGENTS.md / graph → Outer Heaven + [wiki-ingest](sand-workflow:wiki-ingest) + [session-handoff](sand-workflow:session-handoff) **WORKAROUND**. Portable artifact = `HANDOFF.md` + `CURRENT_STATE.md` + OH pointer (see packet `recreation/OH_POINTER_TEMPLATE.md`). Do **not** dump raw chats into vault.

**Labels:** Claude desktop memory face **BLOCKED**. ai-memory / graphify / mcpvault as hive face **BLOCKED** (would work if operator authorizes a RESEARCH-OK lab). Token-multiplier / “DE GRAÇA” SLA **UNVERIFIED**. Second memory SaaS **BLOCKED**.

**Do (extra):** Before ending a cross-tool sitting, ensure job `HANDOFF.md` + `CURRENT_STATE.md` exist (state replaces; events append). Prefer decisions/shipped/preferences only.

**Platform:** Grok Bot + Cursor · **Install:** `none (process-only)`.
**PROVE:** `python3 /home/box/agent-data/workflows/persistent-bot-memory/recreation/validate_memory_plane.py` (built 2026-10-13; original packet path is gone)

## Repass 20260909 wave AC — Auto Dream consolidate
- Steal: periodic reflective consolidate of memory MD (session→auto→durable bullets), not raw dump flood.
- Source: `repass-20260909/LrgfmZkl3nc` · Claude Auto Dream face **BLOCKED** · file-based dream **WORKAROUND**.
- Prompt sketch: "Dream pass: read recent sessions + auto-memory; rewrite durable.md with only lasting bullets; drop noise."


## CapEx tracks (Documented / Demonstrated / Transferred) — DoD 2026-09-09

Capability tracks for this skill. **Do not** treat checklist presence, YT stamp enrich, or skill-file touch as PASS.

| Track | Bar | Counterexample |
|---|---|---|
| **Documented** | Dying-chat capture + OH wiki-ingest remap + HANDOFF/CURRENT_STATE portable contract written | Inventory touch; stamp-only metadata |
| **Demonstrated** | Executable OH-pointer validator: missing HANDOFF/CURRENT_STATE/pointer fields **FAIL**, valid fixtures **PASS**, logged on disk | `memory-plane-checklist.json` alone; enrich-only; product install theater |
| **Transferred** | **Another desk** applies pointer+HANDOFF/CURRENT_STATE to a **different** lane/packet and continues without chat babysitting | Replaying CapEx fixtures; enrich-only; copying STATUS |

### Hard rules
- **checklist-only ≠ Demonstrated.**
- **enrich-only ≠ Transferred.**
- Obsidian / ai-memory / mcpvault / graphify as hive face remain **BLOCKED** (no CapEx install).

### Certified Demonstrated — 2026-09-09
CapEx demo: `/workspace/research/packets/skill-capability-transfer-20260909/demos/session-memory/`
- Runner: `validate_session_memory.py`
- Proof: `out/session_memory_run.log` + `out/session_memory_run.json` (FAIL then PASS)
- Upstream recreation reused: `l2-20260909/sZqa6b5UX-w/recreation/`

### Transferred — YES (Librarian 2026-09-09)
Same transfer as session-bootstrap: `demos/session-memory-transfer/` · OH WORKAROUND only · no Obsidian/ai-memory install.
Evidence: `TRANSFER_REPORT.md` · `out/session_memory_run.log` · `skill_alone_enough=true`.

### Done-when (E / Transferred)
Done when (Demonstrated): CapEx validator FAIL then PASS with logs.
Done when (Transferred): different desk continues from new HANDOFF/CURRENT_STATE without babysitting.

---

## Merged from `compact-hive-from-chats` (2026-10-11)

- Original description: use this when operator hits agent quota and wants chat knowledge promoted into OPERATOR_MEMORY, cheat sheet, and role cards instead of more agent pings
- Unique content carried: quota-hit promotion into OPERATOR_MEMORY/cheat sheet/role cards

# Compact hive from chats

Use when operator usage is high and chats are the only copy of decisions.

## Do
1. Run `python3 scripts/hive/os/outer-heaven-brief.py --agent "Big Boss"` then read `OPERATOR_MEMORY.md` + `AGENT_CHEAT_SHEET.md`.
2. Diff chat decisions vs OM. Promote only durable facts (DECISIONS / FACTS / LESSONS). Never dump transcripts.
3. Message **Librarian only** with a paste-ready OM block. Librarian writes vault + cache. Do not fan out to all 17 (burns quota).
4. Update agent **role cards** only for real lane changes (e.g. Report Creator). Do not rewrite sacred-rule dumps.
5. Save a Grok workflow if the compact itself is reusable.
6. Tell operator: start **new** chats; old threads are archives. First action in new chat = Outer Heaven brief.

## Do not
- Wake every agent to “summarize your chat”
- Re-seed archived /work items
- Put secrets, X-Hive-Secret, or Tier 3 payloads in OM
