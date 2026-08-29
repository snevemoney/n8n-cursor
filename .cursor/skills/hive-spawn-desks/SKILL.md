---
name: hive-spawn-desks
description: >-
  Spawn hive desks as Cursor Task subagents in this chat. Default is
  the five on the factory loop (Forge, Watchdog, HITL, Researcher,
  Comms). All 17 only if Evens says all desks or coverage-loop
  --video-id. Never call the Grok gateway or /api/sendPrompt.
---

# Spawn desks in Cursor

**Engine:** this chat’s `Task` tool. **Never** Grok Bot, `grokbot-dispatch-tape-self-teach.py`, or `/api/sendPrompt`.

Evens is the visionary. Each desk coworks. Parent does not write 17 hats.

**Factory process:** we are a level-3 software factory (process), not a SKU. Card: `docs/hive/outer-heaven/CONTENT/job-cards/MATRIX-PROCESS-2026-08-15.md`. Machine: `dark-factory`. Loop: code → surface → chat.

**Law:** Grok, Claude, ChatGPT, and Cursor each read Grok, Claude, ChatGPT, and Cursor. Same brain. Same session store. Wake prompt: read `docs/MATRIX.md` + `CONTENT/os/sessions/INDEX.md` + all four `sessions/` folders.

**Study method (tape walks only):** `deep-video-learning`. Learn globally (A–K), then steal the machine, then L. Old short steal/never take is not enough. Never understand-only. Never steal-first / skip the transcript. Channel / social ingest lives on Researcher (`channel-walk`, `social-source-ingest`); parent still names `--video-id` for YouTube tapes.

## When

**Default wake (no video-id):** spawn the five on the loop — Forge, Watchdog, HITL Operator, Researcher, Communications Manager. Wealth product exists (`wealth-daily-show`, Grok desktop encode); Cursor Cloud `/workspace` cannot render. Do not add Wealth to this five.

**When Evens names Wealth Manager:** spawn that desk only (or with the five if he also asked for the factory loop). Wake prompt must name skill `wealth-daily-show` and load `docs/hive/outer-heaven/CONTENT/job-cards/wealth-manager.md` + `said-4` (silent Remotion default; Juno named-only) + `SESSION-INDEX`. Do not treat older “~7min Juno default” lines in this file as current. Cursor Cloud `/workspace` abort. Remotion runs on the Grok computer — not a Lambda/VPS. Publish / YouTube / trades stay HITL.

**COLD unless named:** Personal CFO. Wealth stays off the default five even though the product is real.

**Exception (all 17):** Evens says “all desks” **or** `coverage-loop --video-id`. Parent must name a **`video_id`** for a tape walk. Do not default to the 2026-08-14 18-corpus. Do not re-walk the Nate 82 unless Evens says.

## Steps — default five (factory loop)

1. Do **not** run `cursor-spawn-desks.py` tape-self-teach. That script is the tape exception.
2. In **one** message, launch **5** `Task` calls:
   - `subagent_type`: `generalPurpose`
   - `run_in_background`: `true`
   - `model`: inherit
   - `description`: desk name
   - `prompt`: workspace `/Users/evenslouis/n8n-cursor` + load `MATRIX-PROCESS-2026-08-15.md` + `dark-factory` + that desk’s job card + **Grok, Claude, ChatGPT, and Cursor each read Grok, Claude, ChatGPT, and Cursor. Same brain. Same session store. Read `docs/MATRIX.md` + `sessions/INDEX.md`.** Layer they may touch: Forge/Watchdog = CODE; HITL = SURFACE gate; Researcher = CHAT research; Comms = CHAT draft (send-removed). Write only what Evens named.
3. **Assume-it-will-touch:** ALLOW = process/matrix files Evens named this sitting. DENY = send/pay/deploy/book/publish + other desks' takes + ProofCheck product + Stripe. BYPASS = none.
4. **Observe-pane:** `python3 scripts/hive/hive-state.py set-job --id factory-loop --name factory-loop --status working --desk parent`
5. Parent reports who is running (link each desk). Do not fill take files yourself.

## Steps — tape walk (all 17)

1. `python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --video-id <id> --write`  
   First job: `tape-self-teach` → `docs/hive/outer-heaven/CONTENT/job-cards/takes/_prompts/{slug}.md`  
   Each prompt must carry a `checkable-stop` card (`DONE-CHECK` / `CAP` / `COST`). `tape-self-teach-mission.py` writes it. One `--video-id` is the cap. Do not launch a looping fleet without the card.
   If a desk **uses the browser** this session, the same prompt carries a conditional `verify-after-browser` card (`ACT` / `EXPECTED` / `OBSERVED` / `COMPARE` / `NEXT`). These Task desks are in Cursor → `cursor-ide-browser`. If the same skill runs in Grok Bot → Grok Bot web browser (do not call Cursor MCP). Caption-only: do not invent click traces. Skip the card if nobody clicked.
   **Assume-it-will-touch:** ALLOW = write that take file only. DENY = send/pay/deploy/book/publish + other desks' takes. BYPASS = none. Prompt “don’t” is not the lock.
   **Observe-pane:** `python3 scripts/hive/hive-state.py set-job --id tape-<id> --name tape-self-teach --status working --desk parent`
2. In **one** message, launch 17 `Task` calls:
   - `subagent_type`: `generalPurpose`
   - `run_in_background`: `true`
   - `model`: inherit
   - `description`: desk name
   - `prompt`: that file’s mission + workspace `/Users/evenslouis/n8n-cursor` + write **only** `takes/{video_id}/{slug}.md` (header + A–L + Steal / Operate-never)
3. If the harness caps parallelism: wave 6 / 6 / 5. Same prompts. Still no Grok.
4. Parent reports who is running (link each desk). Do not fill take files yourself.
5. Evens skipped merge 2026-08-14. Takes stay SSOT. Do not merge `LESSONS-FROM-TAPE.md`. Do not ask again. Do not Load the cursor-draft.
6. Researcher + Librarian merge A–K **and** stolen machines into `packets/{id}/LEARNED.md` (no L; keep disagreements).

## Never

Grok gateway · `/api/sendPrompt` · parent writing 17 hats · an 18th agent · default-17 without Evens or `--video-id` · wake Wealth/CFO unless named · send / pay / deploy / book / publish · new `icp_id` · Normand send · re-walk the 82 · understand-only · steal-first · until-satisfied spawn · 17×N
